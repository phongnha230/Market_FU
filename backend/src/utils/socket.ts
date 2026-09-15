import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken, TokenPayload } from './token';
import { prisma } from '../config/prisma';
import { ENV } from '../config/env';

export interface AuthenticatedSocket extends Socket {
  data: {
    user?: TokenPayload;
  };
}

let io: SocketIOServer | null = null;

/**
 * Khởi tạo Socket.io Gateway Server gắn với HTTP server
 */
export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  const allowedOrigins = [
    ENV.CLIENT_URL,
    ...ENV.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
  ];

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || ENV.NODE_ENV === 'development' || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Blocked by CORS: ${origin}`));
      },
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // 1. Handshake Authentication Middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      let token: string | undefined = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers?.authorization) {
        const parts = socket.handshake.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }

      if (!token) {
        return next(new Error('AUTHENTICATION_ERROR: Token không được cung cấp'));
      }

      const decoded = verifyAccessToken(token);
      socket.data.user = decoded;
      next();
    } catch (err: any) {
      return next(new Error('AUTHENTICATION_ERROR: Token không hợp lệ hoặc đã hết hạn'));
    }
  });

  // 2. Xử lý kết nối Realtime
  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.data.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    const userId = user.userId;
    // Tham gia phòng cá nhân để nhận thông báo tức thời
    socket.join(`user_${userId}`);
    console.log(`🔌 [Socket.io] User connected: ${userId} (${user.email}) - SocketID: ${socket.id}`);

    // Tham gia vào phòng trò chuyện cụ thể
    socket.on('join_conversation', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        if (!conversationId) return;

        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation) {
          socket.emit('error', { code: 'CONVERSATION_NOT_FOUND', message: 'Hội thoại không tồn tại' });
          return;
        }

        // Kiểm tra quyền tham gia (phải là buyer hoặc seller)
        if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
          socket.emit('error', { code: 'FORBIDDEN', message: 'Bạn không có quyền tham gia cuộc trò chuyện này' });
          return;
        }

        socket.join(`conversation_${conversationId}`);
        socket.emit('joined_conversation', { conversationId });
      } catch (error: any) {
        socket.emit('error', { code: 'SERVER_ERROR', message: error.message });
      }
    });

    // Rời khỏi phòng trò chuyện
    socket.on('leave_conversation', (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.leave(`conversation_${data.conversationId}`);
      }
    });

    // Gửi tin nhắn đa phương thức (TEXT, OFFER_PRICE, MEETUP_LOCATION, IMAGE)
    socket.on('send_message', async (data: {
      conversationId: string;
      text?: string;
      mediaUrl?: string;
      messageType?: 'TEXT' | 'OFFER_PRICE' | 'MEETUP_LOCATION' | 'IMAGE';
      offerPrice?: number;
      meetupLocation?: string;
    }) => {
      try {
        const { conversationId, text, mediaUrl, messageType = 'TEXT', offerPrice, meetupLocation } = data;

        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            product: {
              select: { id: true, title: true, price: true, status: true },
            },
          },
        });

        if (!conversation) {
          socket.emit('error', { code: 'CONVERSATION_NOT_FOUND', message: 'Hội thoại không tồn tại' });
          return;
        }

        if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
          socket.emit('error', { code: 'FORBIDDEN', message: 'Bạn không thuộc cuộc trò chuyện này' });
          return;
        }

        // Quy tắc nghiệp vụ BR: Chặn mặc cả giá thấp hơn 50% giá gốc niêm yết
        if (messageType === 'OFFER_PRICE' || (offerPrice !== undefined && offerPrice !== null)) {
          if (!offerPrice || offerPrice <= 0) {
            socket.emit('error', {
              code: 'INVALID_OFFER_PRICE',
              message: 'Giá đề xuất mặc cả phải lớn hơn 0 VNĐ',
            });
            return;
          }

          const minAllowedPrice = Math.round(conversation.product.price * 0.5);
          if (offerPrice < minAllowedPrice) {
            socket.emit('error', {
              code: 'OFFER_TOO_LOW',
              message: `Hệ thống từ chối đề xuất: Giá mặc cả (${offerPrice.toLocaleString()}đ) không được thấp hơn 50% giá gốc (${minAllowedPrice.toLocaleString()}đ).`,
            });
            return;
          }
        }

        // Tạo tin nhắn mới trong Database
        const savedMessage = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            messageType,
            text: text?.trim() || null,
            mediaUrl: mediaUrl || null,
            offerPrice: offerPrice ? Math.round(offerPrice) : null,
            meetupLocation: meetupLocation?.trim() || null,
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                    campus: true,
                    reputationScore: true,
                  },
                },
              },
            },
          },
        });

        // Xác định nội dung tóm tắt hiển thị ở danh sách cuộc trò chuyện
        let summaryText = savedMessage.text || '';
        if (messageType === 'OFFER_PRICE') {
          summaryText = `[Đề xuất giá: ${savedMessage.offerPrice?.toLocaleString()} VNĐ]`;
        } else if (messageType === 'MEETUP_LOCATION') {
          summaryText = `[Hẹn gặp tại: ${savedMessage.meetupLocation}]`;
        } else if (messageType === 'IMAGE') {
          summaryText = '[Hình ảnh]';
        }

        // Cập nhật Conversation
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessageText: summaryText,
            lastMessageAt: savedMessage.createdAt,
          },
        });

        // Phát tin nhắn tới tất cả thành viên trong phòng trò chuyện
        io?.to(`conversation_${conversationId}`).emit('receive_message', savedMessage);

        // Bắn thông báo trực tiếp tới đối tác nếu họ đang ở màn hình khác
        const recipientId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
        emitToUser(recipientId, 'new_message_notification', {
          conversationId,
          productId: conversation.productId,
          senderName: savedMessage.sender?.profile?.fullName || 'Người dùng FU',
          text: summaryText,
          createdAt: savedMessage.createdAt,
        });
      } catch (error: any) {
        socket.emit('error', { code: 'SEND_MESSAGE_FAILED', message: error.message });
      }
    });

    // Mặc cả giá (Shorthand event)
    socket.on('send_offer_price', (data: { conversationId: string; offerPrice: number }) => {
      const handler = socket.listeners('send_message')[0];
      if (handler) {
        handler({
          conversationId: data.conversationId,
          offerPrice: data.offerPrice,
          messageType: 'OFFER_PRICE',
          text: `Tôi muốn trả giá món đồ này: ${data.offerPrice?.toLocaleString()} VNĐ`,
        });
      }
    });

    // Gợi ý điểm hẹn Campus (Shorthand event)
    socket.on('send_meetup_location', (data: { conversationId: string; meetupLocation: string }) => {
      const handler = socket.listeners('send_message')[0];
      if (handler) {
        handler({
          conversationId: data.conversationId,
          meetupLocation: data.meetupLocation,
          messageType: 'MEETUP_LOCATION',
          text: `Hẹn gặp bạn tại: ${data.meetupLocation}`,
        });
      }
    });

    // Sự kiện Đang gõ tin nhắn (Typing status)
    socket.on('typing', (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
          userId,
          conversationId: data.conversationId,
        });
      }
    });

    socket.on('stop_typing', (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
          userId,
          conversationId: data.conversationId,
        });
      }
    });

    // Đánh dấu đã đọc tin nhắn trong cuộc trò chuyện
    socket.on('message_read', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        if (!conversationId) return;

        await prisma.message.updateMany({
          where: {
            conversationId,
            senderId: { not: userId },
            isRead: false,
          },
          data: { isRead: true },
        });

        io?.to(`conversation_${conversationId}`).emit('messages_marked_read', {
          conversationId,
          readBy: userId,
        });
      } catch (err) {
        // Silent error for read receipts
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.io] User disconnected: ${userId} (${socket.id})`);
    });
  });

  return io;
};

/**
 * Lấy instance Socket.io Server hiện tại
 */
export const getIO = (): SocketIOServer | null => {
  return io;
};

/**
 * Gửi sự kiện Realtime tới một User cụ thể qua room cá nhân user_${userId}
 */
export const emitToUser = (userId: string, event: string, data: any): boolean => {
  if (!io) return false;
  io.to(`user_${userId}`).emit(event, data);
  return true;
};
