import { prisma } from '../../config/prisma';
import { saveImageToStorage } from '../../config/storage';
import { AppError } from '../../middlewares/error.middleware';
import { getIO, emitToUser } from '../../utils/socket';
import { SendMessageInput, QueryMessagesInput, QueryConversationsInput } from './chat.dto';

export class ChatService {
  // 1. Mở hoặc tạo mới cuộc hội thoại gắn với sản phẩm
  async getOrCreateConversation(buyerId: string, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        sellerId: true,
        title: true,
        price: true,
        status: true,
        images: true,
      },
    });

    if (!product) {
      throw new AppError('Sản phẩm không tồn tại trên hệ thống', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.sellerId === buyerId) {
      throw new AppError('Bạn không thể tự trò chuyện với chính mình về bài đăng của bạn', 400, 'CANNOT_CHAT_WITH_SELF');
    }

    // Kiểm tra xem cuộc trò chuyện giữa 2 người về sản phẩm này đã có chưa
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
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { fullName: true, avatarUrl: true, campus: true, reputationScore: true },
            },
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            profile: {
              select: { fullName: true, avatarUrl: true, campus: true, reputationScore: true },
            },
          },
        },
      },
    });

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
            },
          },
          buyer: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { fullName: true, avatarUrl: true, campus: true, reputationScore: true },
              },
            },
          },
          seller: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { fullName: true, avatarUrl: true, campus: true, reputationScore: true },
              },
            },
          },
        },
      });
    }

    return conversation;
  }

  // 2. Lấy danh sách các cuộc hội thoại của người dùng kèm số tin chưa đọc
  async getUserConversations(userId: string, query: QueryConversationsInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [total, conversations] = await Promise.all([
      prisma.conversation.count({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      }),
      prisma.conversation.findMany({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
        orderBy: {
          lastMessageAt: 'desc',
        },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              images: true,
            },
          },
          buyer: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { fullName: true, avatarUrl: true, campus: true },
              },
            },
          },
          seller: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { fullName: true, avatarUrl: true, campus: true },
              },
            },
          },
        },
      }),
    ]);

    // Tính unread count cho từng conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        });

        const partner = conv.buyerId === userId ? conv.seller : conv.buyer;
        return {
          ...conv,
          unreadCount,
          partner,
        };
      })
    );

    return {
      conversations: conversationsWithUnread,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. Lấy lịch sử tin nhắn trong cuộc trò chuyện (Phân trang Skip-Limit)
  async getConversationMessages(userId: string, conversationId: string, query: QueryMessagesInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new AppError('Cuộc hội thoại không tồn tại', 404, 'CONVERSATION_NOT_FOUND');
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Bạn không có quyền xem cuộc trò chuyện này', 403, 'FORBIDDEN');
    }

    const [total, messages] = await Promise.all([
      prisma.message.count({ where: { conversationId } }),
      prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { fullName: true, avatarUrl: true, campus: true },
              },
            },
          },
        },
      }),
    ]);

    // Đánh dấu các tin nhắn người khác gửi cho mình là đã đọc
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      messages: messages.reverse(), // Đảo lại thứ tự thời gian tăng dần cho UI hiển thị mượt
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 4. Gửi tin nhắn qua REST API (Hỗ trợ kèm tệp hình ảnh từ Multer)
  async sendMessage(
    userId: string,
    conversationId: string,
    input: SendMessageInput,
    mediaFile?: Express.Multer.File
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
      throw new AppError('Hội thoại không tồn tại', 404, 'CONVERSATION_NOT_FOUND');
    }

    if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
      throw new AppError('Bạn không thuộc cuộc trò chuyện này', 403, 'FORBIDDEN');
    }

    let mediaUrl = input.mediaUrl;
    let finalMessageType = input.messageType;

    // Nếu người dùng upload ảnh trực tiếp
    if (mediaFile) {
      const uploadResult = await saveImageToStorage(mediaFile.buffer, 'chats');
      mediaUrl = uploadResult.secure_url;
      finalMessageType = 'IMAGE';
    }

    // Business Rule: Chặn trả giá mặc cả < 50% giá gốc
    if (finalMessageType === 'OFFER_PRICE' || input.offerPrice) {
      if (!input.offerPrice || input.offerPrice <= 0) {
        throw new AppError('Giá mặc cả phải lớn hơn 0 VNĐ', 400, 'INVALID_OFFER_PRICE');
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

    if (!input.text && !mediaUrl && !input.offerPrice && !input.meetupLocation) {
      throw new AppError('Tin nhắn không được để trống', 400, 'EMPTY_MESSAGE');
    }

    const savedMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        messageType: finalMessageType,
        text: input.text?.trim() || null,
        mediaUrl: mediaUrl || null,
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

    let summaryText = savedMessage.text || '';
    if (finalMessageType === 'OFFER_PRICE') {
      summaryText = `[Đề xuất giá: ${savedMessage.offerPrice?.toLocaleString()} VNĐ]`;
    } else if (finalMessageType === 'MEETUP_LOCATION') {
      summaryText = `[Hẹn gặp tại: ${savedMessage.meetupLocation}]`;
    } else if (finalMessageType === 'IMAGE') {
      summaryText = '[Hình ảnh]';
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageText: summaryText,
        lastMessageAt: savedMessage.createdAt,
      },
    });

    // Phát socket realtime tới phòng trò chuyện
    const io = getIO();
    if (io) {
      io.to(`conversation_${conversationId}`).emit('receive_message', savedMessage);
    }

    // Bắn realtime notification cho người nhận
    const recipientId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
    emitToUser(recipientId, 'new_message_notification', {
      conversationId,
      productId: conversation.productId,
      senderName: savedMessage.sender?.profile?.fullName || 'Người dùng FU',
      text: summaryText,
      createdAt: savedMessage.createdAt,
    });

    return savedMessage;
  }

  // 5. Đánh dấu tất cả tin nhắn trong hội thoại là đã đọc
  async markConversationAsRead(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new AppError('Cuộc hội thoại không tồn tại', 404, 'CONVERSATION_NOT_FOUND');
    }

    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const io = getIO();
    if (io) {
      io.to(`conversation_${conversationId}`).emit('messages_marked_read', {
        conversationId,
        readBy: userId,
      });
    }

    return { success: true };
  }
}
