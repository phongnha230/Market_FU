import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { z } from 'zod';
import { verifyAccessToken, TokenPayload } from './token';
import { prisma } from '../config/prisma';
import { ENV } from '../config/env';

// Schema xác thực dữ liệu gửi qua socket (B2-4 Fix: Chặn tin nhắn quá dài, URL phishing, sai kiểu dữ liệu)
const socketSendMessageSchema = z.object({
  conversationId: z.string().min(1, 'conversationId không được để trống'),
  text: z.string().max(2000, 'Tin nhắn không được vượt quá 2000 ký tự').optional(),
  messageType: z.enum(['TEXT', 'IMAGE', 'OFFER_PRICE', 'MEETUP_LOCATION']).default('TEXT'),
  offerPrice: z.coerce.number().positive('Giá đề xuất mặc cả phải lớn hơn 0 VNĐ').optional(),
  meetupLocation: z.string().max(255, 'Địa điểm hẹn không được vượt quá 255 ký tự').optional(),
  mediaUrl: z.string().url('Đường dẫn ảnh/media không đúng định dạng URL').optional(),
});

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

    // Kích hoạt Presence Engine: Đánh dấu user ONLINE
    import('../modules/presence/presence.service')
      .then(({ presenceService }) => presenceService.setUserOnline(userId, socket.id))
      .catch(() => {});

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
        const isAppError = error?.name === 'AppError' || error?.isOperational;
        socket.emit('error', {
          code: isAppError ? error.code || 'JOIN_CONVERSATION_FAILED' : 'SERVER_ERROR',
          message: isAppError ? error.message : 'Đã có lỗi xảy ra khi tham gia cuộc trò chuyện',
        });
      }
    });

    // Rời khỏi phòng trò chuyện
    socket.on('leave_conversation', (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.leave(`conversation_${data.conversationId}`);
      }
    });

    // Gửi tin nhắn đa phương thức (TEXT, OFFER_PRICE, MEETUP_LOCATION, IMAGE) - B2-5 & B2-9 Fix
    const handleSendMessage = async (rawData: any) => {
      try {
        const parseResult = socketSendMessageSchema.safeParse(rawData);
        if (!parseResult.success) {
          socket.emit('error', {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.errors[0]?.message || 'Dữ liệu tin nhắn không hợp lệ',
          });
          return;
        }

        const { conversationId, ...messageInput } = parseResult.data;
        const { chatService } = await import('../modules/chats/chat.service');
        await chatService.persistAndBroadcastMessage(userId, conversationId, messageInput);
      } catch (error: any) {
        const isAppError = error?.name === 'AppError' || error?.isOperational;
        socket.emit('error', {
          code: isAppError ? error.code || 'SEND_MESSAGE_FAILED' : 'SERVER_ERROR',
          message: isAppError ? error.message : 'Không thể gửi tin nhắn, vui lòng thử lại sau',
        });
      }
    };

    socket.on('send_message', handleSendMessage);

    // Mặc cả giá (Shorthand event - gọi trực tiếp handleSendMessage thay vì duyệt listeners[0])
    socket.on('send_offer_price', (data: { conversationId: string; offerPrice: number }) => {
      handleSendMessage({
        conversationId: data?.conversationId,
        offerPrice: data?.offerPrice,
        messageType: 'OFFER_PRICE',
        text: `Tôi muốn trả giá món đồ này: ${data?.offerPrice?.toLocaleString()} VNĐ`,
      });
    });

    // Gợi ý điểm hẹn Campus (Shorthand event)
    socket.on('send_meetup_location', (data: { conversationId: string; meetupLocation: string }) => {
      handleSendMessage({
        conversationId: data?.conversationId,
        meetupLocation: data?.meetupLocation,
        messageType: 'MEETUP_LOCATION',
        text: `Hẹn gặp bạn tại: ${data?.meetupLocation}`,
      });
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

    // Đánh dấu đã đọc tin nhắn trong cuộc trò chuyện (B2-1 Fix: Chặn IDOR - Kiểm tra quyền thành viên hội thoại)
    socket.on('message_read', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        if (!conversationId) return;

        // B2-1: Xác thực người dùng hiện tại là bên mua (buyerId) hoặc bên bán (sellerId)
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { id: true, buyerId: true, sellerId: true },
        });

        if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
          socket.emit('error', {
            code: 'FORBIDDEN',
            message: 'Bạn không có quyền đánh dấu đã đọc cuộc trò chuyện này',
          });
          return;
        }

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

    // 7. Truy vấn trạng thái Presence của danh sách users (Batch Presence)
    socket.on('check_presence', async (data: { userIds: string[] }, callback: any) => {
      try {
        if (typeof callback === 'function' && Array.isArray(data?.userIds)) {
          const { presenceService } = await import('../modules/presence/presence.service');
          const result = await presenceService.getBatchPresence(data.userIds);
          callback(result);
        }
      } catch (err) {
        // Silent error
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.io] User disconnected: ${userId} (${socket.id})`);
      import('../modules/presence/presence.service')
        .then(({ presenceService }) => presenceService.setUserOffline(userId, socket.id))
        .catch(() => {});
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
