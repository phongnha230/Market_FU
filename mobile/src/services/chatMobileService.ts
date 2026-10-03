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
}

export const chatMobileService = {
  /**
   * Lấy danh sách hội thoại
   */
  async getConversations(): Promise<ConversationItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>('/chats/conversations');
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data.map((c) => {
          const partner = c.otherUser || c.partner || c.seller || c.buyer || {};
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
   * Lấy tin nhắn trong cuộc trò chuyện
   */
  async getMessages(conversationId: string, currentUserId: string): Promise<ChatMessage[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>(`/chats/conversations/${conversationId}/messages`);
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data.map((m) => {
          const senderId = m.senderId || m.sender?.id || m.sender?._id;
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
            isMe: senderId === currentUserId,
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

    // Gửi realtime qua Socket.io
    const socket = socketMobileService.getSocket();
    if (socket && socket.connected) {
      socket.emit('send_message', {
        conversationId,
        text: content,
        messageType,
        offerPrice,
        meetupLocation,
      });
    }

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
   * Gửi đề xuất mặc cả giá trực tiếp
   */
  async sendOfferPrice(conversationId: string, offerPrice: number): Promise<ChatMessage> {
    const text = `Đề xuất giá mới: ${offerPrice.toLocaleString('vi-VN')}đ`;
    return this.sendMessage(conversationId, text, 'OFFER_PRICE', offerPrice);
  },

  /**
   * Đánh dấu đã đọc
   */
  async markAsRead(conversationId: string): Promise<void> {
    try {
      await apiClient.patch(`/chats/conversations/${conversationId}/read`);
    } catch {}
  },
};

export default chatMobileService;
