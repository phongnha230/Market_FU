import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { saveImageToStorage } from '../../config/storage';
import { getIO, emitToUser } from '../../utils/socket';
import { notificationService } from '../notifications/notification.service';
import { getCache, setCache } from '../../config/redis';
import {
  CreateConversationInput,
  QueryConversationsInput,
  QueryMessagesInput,
  SendMessageInput,
} from './chat.dto';

export class ChatService {
  /**
   * 1. Mở hoặc tạo mới cuộc trò chuyện dựa trên productId
   */
  async createOrGetConversation(buyerId: string, input: CreateConversationInput) {
    const { productId } = input;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        sellerId: true,
        title: true,
        price: true,
        status: true,
        images: true,
        campus: true,
      },
    });

    if (!product) {
      throw new AppError('Sản phẩm không tồn tại', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.sellerId === buyerId) {
      throw new AppError(
        'Bạn không thể tự mở cuộc trò chuyện với chính mình về sản phẩm của bạn',
        400,
        'SELF_CHAT_NOT_ALLOWED'
      );
    }

    // Kiểm tra định danh sinh viên FPT của người gửi tin
    const sender = await prisma.user.findUnique({
      where: { id: buyerId },
      include: { profile: true },
    });

    const isEduEmail = Boolean(
      sender?.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
      sender?.email?.toLowerCase().endsWith('@fe.edu.vn')
    );
    const isVerifiedSender =
      (sender?.role === 'BUYER' ||
       sender?.role === 'SELLER' ||
       sender?.role === 'ADMIN' ||
       isEduEmail ||
       sender?.profile?.kyc?.status === 'APPROVED') &&
      sender?.role !== 'UNVERIFIED';

    if (!isVerifiedSender) {
      throw new AppError(
        'Bạn cần xác thực Thẻ Sinh Viên FPT trước khi nhắn tin cho người khác nhằm phòng chống lừa đảo và spam.',
        403,
        'STUDENT_KYC_REQUIRED'
      );
    }

    // Tìm kiếm xem đã từng có cuộc trò chuyện giữa buyer và seller cho sản phẩm này chưa
    let conversation = await prisma.conversation.findFirst({
      where: {
        buyerId,
        sellerId: product.sellerId,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            images: true,
            campus: true,
          },
        },
        seller: {
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
        buyer: {
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

    // Nếu chưa có thì khởi tạo mới
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          buyerId,
          sellerId: product.sellerId,
          productId,
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              images: true,
              campus: true,
            },
          },
          seller: {
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
          buyer: {
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
    }

    return conversation;
  }

  /**
   * 2. Lấy danh sách cuộc trò chuyện của người dùng kèm số tin chưa đọc và phân trang
   */
  async getUserConversations(userId: string, query: QueryConversationsInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where = {
      OR: [{ buyerId: userId }, { sellerId: userId }],
    };

    const [total, conversations] = await Promise.all([
      prisma.conversation.count({ where }),
      prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              images: true,
              campus: true,
            },
          },
          seller: {
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
          buyer: {
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
      }),
    ]);

    // Tính toán số tin nhắn chưa đọc cho từng cuộc hội thoại (Tránh N+1 queries bằng groupBy)
    const convIds = conversations.map((c) => c.id);
    const unreadMap = new Map<string, number>();

    if (convIds.length > 0) {
      const unreadGroups = await prisma.message.groupBy({
        by: ['conversationId'],
        where: {
          conversationId: { in: convIds },
          senderId: { not: userId },
          isRead: false,
        },
        _count: {
          _all: true,
        },
      });

      for (const group of unreadGroups) {
        unreadMap.set(group.conversationId, group._count._all);
      }
    }

    const conversationsWithUnread = conversations.map((conv) => {
      // Xác định đối phương trò chuyện (Counterparty)
      const isBuyer = conv.buyerId === userId;
      const otherParty = isBuyer ? conv.seller : conv.buyer;

      return {
        ...conv,
        unreadCount: unreadMap.get(conv.id) || 0,
        otherParty,
      };
    });

    return {
      conversations: conversationsWithUnread,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 3. Lấy lịch sử tin nhắn trong một cuộc hội thoại
   */
  async getMessages(userId: string, conversationId: string, query: QueryMessagesInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new AppError('Cuộc trò chuyện không tồn tại', 404, 'CONVERSATION_NOT_FOUND');
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Bạn không có quyền truy cập vào cuộc hội thoại này', 403, 'FORBIDDEN');
    }

    const [total, messages] = await Promise.all([
      prisma.message.count({ where: { conversationId } }),
      prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
    ]);

    return {
      // Đảo ngược mảng để client hiển thị từ tin cũ đến mới theo timeline chat
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 4. Gửi tin nhắn qua REST API (Hỗ trợ kèm ảnh Multer và Mặc cả giá)
   */
  /**
   * Phương thức chung xử lý lưu tin nhắn, kiểm tra quy tắc mặc cả 50%, cập nhật hội thoại và phát socket / push FCM (B2-5 Fix)
   */
  async persistAndBroadcastMessage(
    userId: string,
    conversationId: string,
    input: SendMessageInput,
    imageFileBuffer?: Buffer
  ) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        product: {
          select: { id: true, title: true, price: true, status: true },
        },
      },
    });

    if (!conversation) {
      throw new AppError('Cuộc trò chuyện không tồn tại', 404, 'CONVERSATION_NOT_FOUND');
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Bạn không thuộc cuộc trò chuyện này', 403, 'FORBIDDEN');
    }

    // Kiểm tra định danh sinh viên FPT của người gửi tin nhắn
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const isEduEmail = Boolean(
      sender?.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
      sender?.email?.toLowerCase().endsWith('@fe.edu.vn')
    );
    const isVerifiedSender =
      (sender?.role === 'BUYER' ||
       sender?.role === 'SELLER' ||
       sender?.role === 'ADMIN' ||
       isEduEmail ||
       sender?.profile?.kyc?.status === 'APPROVED') &&
      sender?.role !== 'UNVERIFIED';

    if (!isVerifiedSender) {
      throw new AppError(
        'Bạn cần xác thực Thẻ Sinh Viên FPT để gửi tin nhắn trên sàn Market FU.',
        403,
        'STUDENT_KYC_REQUIRED'
      );
    }

    let mediaUrl = input.mediaUrl || null;
    let messageType = input.messageType || 'TEXT';

    // Xử lý upload ảnh nếu client gửi file
    if (imageFileBuffer) {
      const uploadResult = await saveImageToStorage(imageFileBuffer, 'chat_media');
      mediaUrl = uploadResult.secure_url;
      messageType = 'IMAGE';
    }

    // Quy tắc nghiệp vụ BR: Chặn mặc cả giá thấp hơn 50% giá gốc niêm yết
    if (messageType === 'OFFER_PRICE' || (input.offerPrice !== undefined && input.offerPrice !== null)) {
      if (!input.offerPrice || input.offerPrice <= 0) {
        throw new AppError('Giá đề xuất mặc cả phải lớn hơn 0 VNĐ', 400, 'INVALID_OFFER_PRICE');
      }

      const minAllowedPrice = Math.round(conversation.product.price * 0.5);
      if (input.offerPrice < minAllowedPrice) {
        throw new AppError(
          `Hệ thống từ chối đề xuất: Giá mặc cả (${input.offerPrice.toLocaleString()}đ) không được thấp hơn 50% giá gốc (${minAllowedPrice.toLocaleString()}đ).`,
          400,
          'OFFER_TOO_LOW'
        );
      }
    }

    // Tạo tin nhắn mới trong MongoDB
    const savedMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        messageType,
        text: input.text?.trim() || null,
        mediaUrl,
        offerPrice: input.offerPrice ? Math.round(input.offerPrice) : null,
        meetupLocation: input.meetupLocation?.trim() || null,
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

    // Cập nhật tóm tắt hội thoại
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: summaryText,
        lastMessageAt: savedMessage.createdAt,
      },
    });

    // Phát sự kiện qua Socket.io Gateway tới phòng chat
    const io = getIO();
    io?.to(`conversation_${conversationId}`).emit('receive_message', savedMessage);

    // Bắn thông báo trực tiếp tới đối tác
    const recipientId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
    const senderName = savedMessage.sender?.profile?.fullName || 'Người dùng FU';
    const senderAvatar = savedMessage.sender?.profile?.avatarUrl || '';
    emitToUser(recipientId, 'new_message_notification', {
      conversationId,
      productId: conversation.productId,
      senderId: userId,
      senderName,
      senderAvatar,
      text: summaryText,
      createdAt: savedMessage.createdAt,
    });

    // Tối ưu hóa Presence Check & Anti-Spam Debounce:
    // 1. Kiểm tra đối tác có đang ở trong phòng chat này không
    let isRecipientActiveInRoom = false;
    try {
      if (io) {
        const socketsInRoom = await io.in(`conversation_${conversationId}`).fetchSockets();
        isRecipientActiveInRoom = socketsInRoom.some(
          (s: any) => s.data?.user?.userId === recipientId
        );
      }
    } catch {
      // Giữ false nếu socket lookup không khả dụng
    }

    // 2. Chỉ gửi Push Notification khi đối tác KHÔNG ở trong phòng chat
    if (!isRecipientActiveInRoom) {
      // Áp dụng Debounce 2 giây chống flood liên hoàn nhưng vẫn đảm bảo tin nhắn lẻ ("alo") luôn nổ FCM Push
      const debounceKey = `chat_push_debounce:${conversationId}:${recipientId}`;
      const pushTitle = `💬 ${senderName}`;
      const pushData = {
        conversationId,
        productId: conversation.productId,
        type: 'CHAT',
        senderAvatar,
        senderName,
        senderId: userId,
      };
      getCache<boolean>(debounceKey)
        .then((hasRecentPush) => {
          if (!hasRecentPush) {
            setCache(debounceKey, true, 2).catch(() => {});
            notificationService
              .sendPushOnly(recipientId, pushTitle, summaryText, pushData)
              .catch(() => {});
          }
        })
        .catch(() => {
          notificationService
            .sendPushOnly(recipientId, pushTitle, summaryText, pushData)
            .catch(() => {});
        });
    }

    return savedMessage;
  }

  /**
   * 4. Gửi tin nhắn qua REST API (Hỗ trợ kèm ảnh Multer và Mặc cả giá)
   */
  async sendMessage(
    userId: string,
    conversationId: string,
    input: SendMessageInput,
    imageFile?: Express.Multer.File
  ) {
    return this.persistAndBroadcastMessage(userId, conversationId, input, imageFile?.buffer);
  }

  /**
   * 5. Đánh dấu đã đọc tất cả tin nhắn trong cuộc hội thoại
   */
  async markAsRead(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new AppError('Cuộc trò chuyện không tồn tại', 404, 'CONVERSATION_NOT_FOUND');
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Bạn không có quyền sửa đổi cuộc trò chuyện này', 403, 'FORBIDDEN');
    }

    const updated = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    // Phát sự kiện realtime thông báo đã đọc
    const io = getIO();
    io?.to(`conversation_${conversationId}`).emit('messages_marked_read', {
      conversationId,
      readBy: userId,
    });

    return {
      conversationId,
      modifiedCount: updated.count,
    };
  }

  /**
   * 6. Xóa cuộc hội thoại
   */
  async deleteConversation(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new AppError('Cuộc trò chuyện không tồn tại', 404, 'CONVERSATION_NOT_FOUND');
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Bạn không có quyền xóa cuộc trò chuyện này', 403, 'FORBIDDEN');
    }

    await prisma.message.deleteMany({
      where: { conversationId },
    });

    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return { success: true, conversationId };
  }

  /**
   * Kiểm tra tin nhắn có thuộc nhóm thương lượng giá / hệ thống đơn hàng (cấm sửa/xóa) không
   */
  private isImmutableTransactionMessage(message: {
    messageType?: string | null;
    offerPrice?: number | null;
    text?: string | null;
  }): boolean {
    const text = (message.text || '').trim();
    const lower = text.toLowerCase();
    return Boolean(
      message.messageType === 'OFFER_PRICE' ||
        (message.offerPrice !== null && message.offerPrice !== undefined && message.offerPrice > 0) ||
        text.includes('[OFFER_ACCEPTED]') ||
        text.includes('[OFFER_REJECTED]') ||
        text.startsWith('[ORDER_CREATED]') ||
        text.startsWith('[ORDER_CANCELLED]') ||
        text.startsWith('[ORDER_SHIPPING_CONFIRMED]') ||
        text.startsWith('[APPOINTMENT_CONFIRMED]') ||
        lower.startsWith('đề xuất giá') ||
        lower.includes('đồng ý chốt mức giá') ||
        lower.includes('từ chối đề xuất')
    );
  }

  /**
   * 7. Chỉnh sửa tin nhắn (Chỉ áp dụng cho tin nhắn thường của chính người gửi; CẤM sửa tin nhắn trả giá/đơn hàng)
   */
  async updateMessage(userId: string, conversationId: string, messageId: string, newText: string) {
    const trimmedText = (newText || '').trim();
    if (!trimmedText) {
      throw new AppError('Nội dung tin nhắn không được để trống', 400, 'EMPTY_MESSAGE_TEXT');
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.conversationId !== conversationId) {
      throw new AppError('Tin nhắn không tồn tại', 404, 'MESSAGE_NOT_FOUND');
    }

    if (message.senderId !== userId) {
      throw new AppError('Bạn chỉ có quyền chỉnh sửa tin nhắn của chính mình', 403, 'FORBIDDEN');
    }

    if (this.isImmutableTransactionMessage(message)) {
      throw new AppError(
        'Tin nhắn trả giá hoặc thông báo đơn hàng không được phép chỉnh sửa để đảm bảo minh bạch giao dịch.',
        403,
        'MESSAGE_IMMUTABLE'
      );
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { text: trimmedText },
    });

    // Cập nhật lastMessageText nếu đây là tin nhắn mới nhất của hội thoại
    const latestMsg = await prisma.message.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
    });
    if (latestMsg && latestMsg.id === messageId) {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageText: trimmedText },
      });
    }

    const io = getIO();
    io?.to(`conversation_${conversationId}`).emit('message_updated', {
      conversationId,
      messageId,
      text: updated.text,
      updatedAt: new Date().toISOString(),
    });

    return updated;
  }

  /**
   * 8. Xóa / Thu hồi tin nhắn (Chỉ áp dụng cho tin nhắn thường của chính người gửi; CẤM xóa tin nhắn trả giá/đơn hàng)
   */
  async deleteMessage(userId: string, conversationId: string, messageId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.conversationId !== conversationId) {
      throw new AppError('Tin nhắn không tồn tại', 404, 'MESSAGE_NOT_FOUND');
    }

    if (message.senderId !== userId) {
      throw new AppError('Bạn chỉ có quyền xóa tin nhắn của chính mình', 403, 'FORBIDDEN');
    }

    if (this.isImmutableTransactionMessage(message)) {
      throw new AppError(
        'Tin nhắn trả giá hoặc thông báo đơn hàng không được phép xóa để đảm bảo minh bạch giao dịch.',
        403,
        'MESSAGE_IMMUTABLE'
      );
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    // Cập nhật lại lastMessageText cho cuộc hội thoại
    const latestMsg = await prisma.message.findFirst({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
    });

    let summaryText = 'Bắt đầu cuộc trò chuyện';
    if (latestMsg) {
      if (latestMsg.messageType === 'OFFER_PRICE') {
        summaryText = `[Đề xuất giá: ${latestMsg.offerPrice?.toLocaleString()} VNĐ]`;
      } else if (latestMsg.messageType === 'MEETUP_LOCATION') {
        summaryText = `[Hẹn gặp tại: ${latestMsg.meetupLocation}]`;
      } else if (latestMsg.messageType === 'IMAGE') {
        summaryText = '[Hình ảnh]';
      } else {
        summaryText = latestMsg.text || '';
      }
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: summaryText,
        ...(latestMsg ? { lastMessageAt: latestMsg.createdAt } : {}),
      },
    });

    const io = getIO();
    io?.to(`conversation_${conversationId}`).emit('message_deleted', {
      conversationId,
      messageId,
      lastMessageText: summaryText,
    });

    return {
      success: true,
      conversationId,
      messageId,
      lastMessageText: summaryText,
    };
  }
}

export const chatService = new ChatService();
