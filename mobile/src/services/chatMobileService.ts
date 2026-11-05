import apiClient, { ApiResponse } from './apiClient';
import { socketMobileService } from './socketMobileService';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  messageType?: 'TEXT' | 'IMAGE' | 'OFFER_PRICE' | 'MEETUP_LOCATION';
  offerPrice?: number;
  meetupLocation?: string;
  createdAt: string;
  isMe: boolean;
  imageUrl?: string;
}

export interface ConversationItem {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
  productCampus?: string;
  buyerId?: string;
  sellerId?: string;
}

export const chatMobileService = {
  /**
   * Lấy danh sách hội thoại
   */
  async getConversations(): Promise<ConversationItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/chats/conversations');
      const rawData = res.data?.data;
      const rawList = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.conversations)
        ? rawData.conversations
        : [];

      if (rawList.length > 0 || Array.isArray(rawData?.conversations)) {
        return rawList.map((c: any) => {
          const partner = c.otherParty || c.otherUser || c.partner || c.seller || c.buyer || {};
          const product = c.product || {};
          return {
            id: c.id || c._id,
            participantId: partner.id || partner._id || 'partner',
            participantName: partner.profile?.fullName || partner.name || 'Sinh viên FPT',
            participantAvatar: partner.profile?.avatarUrl || partner.avatarUrl,
            lastMessage: c.lastMessageText || c.lastMessage?.content || c.lastMessage || 'Bắt đầu cuộc trò chuyện',
            lastMessageTime: c.lastMessageAt || c.updatedAt || new Date().toISOString(),
            unreadCount: c.unreadCount || 0,
            productId: product.id || c.productId,
            productTitle: product.title,
            productPrice: product.price,
            productImage: product.images?.[0]?.imageUrl || product.images?.[0],
            productCampus: product.campus || c.seller?.profile?.campus,
            buyerId: c.buyerId,
            sellerId: c.sellerId,
          };
        });
      }
    } catch (e: any) {
      console.log('⚠️ [Backend Chat Conversations offline]:', e?.message);
    }
    return [];
  },

  /**
   * Tạo hoặc mở cuộc trò chuyện với người bán/người mua
   * Backend nhận { productId } và tự resolve buyer/seller
   */
  async createOrGetConversation(productId: string): Promise<string> {
    const res = await apiClient.post<ApiResponse<any>>('/chats/conversations', {
      productId,
    });
    return res.data?.data?.id || res.data?.data?._id;
  },

  /**
   * Tạo hoặc mở cuộc trò chuyện kèm chi tiết đối tác
   */
  async createOrGetConversationDetails(productId: string): Promise<{ conversationId: string; partner?: any; conversation?: any }> {
    const res = await apiClient.post<ApiResponse<any>>('/chats/conversations', {
      productId,
    });
    const data = res.data?.data;
    const conversationId = data?.id || data?._id;
    return {
      conversationId,
      partner: data?.seller || data?.buyer || data?.otherParty,
      conversation: data,
    };
  },

  /**
   * Lấy tin nhắn trong cuộc trò chuyện
   */
  async getMessages(conversationId: string, currentUserId: string): Promise<ChatMessage[]> {
    try {
      const res = await apiClient.get<ApiResponse<any>>(`/chats/conversations/${conversationId}/messages`);
      const rawData = res.data?.data;
      const rawMessages = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.messages)
        ? rawData.messages
        : [];

      if (rawMessages.length > 0 || Array.isArray(rawData?.messages)) {
        const myIdStr = String(currentUserId || '').trim();
        return rawMessages.map((m: any) => {
          const senderId = m.senderId || m.sender?.id || m.sender?._id;
          const sIdStr = String(senderId || '').trim();
          const senderObjIdStr = String(m.sender?.id || m.sender?._id || '').trim();
          const isMe = Boolean(
            myIdStr && myIdStr !== 'me' && (sIdStr === myIdStr || senderObjIdStr === myIdStr)
          );
          return {
            id: m.id || m._id,
            senderId,
            senderName: m.sender?.profile?.fullName || m.sender?.name || 'Sinh viên',
            senderAvatar: m.sender?.profile?.avatarUrl || m.sender?.avatarUrl,
            message: m.text || m.content || m.message || '',
            messageType: m.messageType || 'TEXT',
            offerPrice: m.offerPrice,
            meetupLocation: m.meetupLocation,
            createdAt: m.createdAt,
            isMe,
            imageUrl: m.mediaUrl || m.imageUrl,
          };
        });
      }
    } catch (e: any) {
      console.log('⚠️ [Backend Chat Messages offline]:', e?.message);
    }
    return [];
  },

  /**
   * Gửi tin nhắn mới (chuẩn Zod text, messageType)
   */
  async sendMessage(
    conversationId: string,
    content: string,
    messageType: 'TEXT' | 'IMAGE' | 'OFFER_PRICE' | 'MEETUP_LOCATION' = 'TEXT',
    offerPrice?: number,
    meetupLocation?: string
  ): Promise<ChatMessage> {
    const body: any = {
      text: content,
      messageType,
    };
    if (offerPrice) body.offerPrice = offerPrice;
    if (meetupLocation) body.meetupLocation = meetupLocation;

    const res = await apiClient.post<ApiResponse<any>>(`/chats/conversations/${conversationId}/messages`, body);
    const m = res.data?.data || {};

    return {
      id: m.id || m._id || `msg_${Date.now()}`,
      senderId: m.senderId || 'me',
      senderName: 'Tôi',
      message: content,
      messageType,
      offerPrice,
      meetupLocation,
      createdAt: m.createdAt || new Date().toISOString(),
      isMe: true,
      imageUrl: m.mediaUrl,
    };
  },

  /**
   * Gửi đề xuất mặc cả giá trực tiếp kèm ghi chú tuỳ chọn của người mua
   */
  async sendOfferPrice(conversationId: string, offerPrice: number, messageText?: string): Promise<ChatMessage> {
    const text = messageText?.trim() || `Đề xuất giá mới: ${offerPrice.toLocaleString('vi-VN')}đ`;
    return this.sendMessage(conversationId, text, 'OFFER_PRICE', offerPrice);
  },

  /**
   * Gửi tin nhắn ảnh kèm file từ thiết bị
   */
  async sendImageMessage(
    conversationId: string,
    imageUri: string,
    caption?: string
  ): Promise<ChatMessage> {
    const formData = new FormData();
    formData.append('messageType', 'IMAGE');
    if (caption) formData.append('text', caption);

    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    try {
      const res = await apiClient.post<ApiResponse<any>>(
        `/chats/conversations/${conversationId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const m = res.data?.data || {};
      const mediaUrl = m.mediaUrl || imageUri;

      const socket = socketMobileService.getSocket();
      if (socket && socket.connected) {
        socket.emit('send_message', {
          conversationId,
          text: caption || 'Đã gửi một ảnh',
          messageType: 'IMAGE',
          mediaUrl,
        });
      }

      return {
        id: m.id || m._id || `msg_${Date.now()}`,
        senderId: m.senderId || 'me',
        senderName: 'Tôi',
        message: caption || 'Đã gửi một ảnh',
        messageType: 'IMAGE',
        imageUrl: mediaUrl,
        createdAt: m.createdAt || new Date().toISOString(),
        isMe: true,
      };
    } catch (e: any) {
      console.log('⚠️ [sendImageMessage fallback]:', e?.message);
      return {
        id: `msg_fallback_${Date.now()}`,
        senderId: 'me',
        senderName: 'Tôi',
        message: caption || 'Đã gửi một ảnh',
        messageType: 'IMAGE',
        imageUrl: imageUri,
        createdAt: new Date().toISOString(),
        isMe: true,
      };
    }
  },

  /**
   * Đánh dấu đã đọc
   */
  async markAsRead(conversationId: string): Promise<void> {
    try {
      await apiClient.patch(`/chats/conversations/${conversationId}/read`);
    } catch {}
  },

  /**
   * Xóa cuộc trò chuyện
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/chats/conversations/${conversationId}`);
      return true;
    } catch (e: any) {
      console.log('⚠️ [deleteConversation error]:', e?.message);
      return false;
    }
  },

  /**
   * Chỉnh sửa tin nhắn thường (không áp dụng cho tin nhắn trả giá / hệ thống)
   */
  async updateMessage(conversationId: string, messageId: string, text: string): Promise<boolean> {
    try {
      await apiClient.patch(`/chats/conversations/${conversationId}/messages/${messageId}`, { text });
      return true;
    } catch (e: any) {
      console.log('⚠️ [updateMessage error]:', e?.message);
      return false;
    }
  },

  /**
   * Xóa tin nhắn thường (không áp dụng cho tin nhắn trả giá / hệ thống)
   */
  async deleteMessage(conversationId: string, messageId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/chats/conversations/${conversationId}/messages/${messageId}`);
      return true;
    } catch (e: any) {
      console.log('⚠️ [deleteMessage error]:', e?.message);
      return false;
    }
  },
};

export default chatMobileService;
