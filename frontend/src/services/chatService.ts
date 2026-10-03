import { apiClient, ApiResponse } from './apiClient';

export interface BackendConversation {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  product?: {
    id: string;
    title: string;
    price: number;
    images?: string[];
    status: string;
    campus?: string;
  };
  otherUser?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    campus?: string;
    reputationScore?: number;
    studentVerification?: {
      status: string;
      studentId?: string;
    };
  };
}

export interface BackendMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'TEXT' | 'IMAGE' | 'OFFER_PRICE' | 'MEETUP_LOCATION';
  text?: string;
  mediaUrl?: string;
  offerPrice?: number;
  meetupLocation?: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    profile?: {
      fullName?: string;
      avatarUrl?: string;
    };
  };
}

export const chatService = {
  // 1. Lấy danh sách cuộc trò chuyện của người dùng
  async getConversations(params?: { page?: number; limit?: number }): Promise<{
    conversations: BackendConversation[];
    meta?: any;
  }> {
    const response = await apiClient.get<ApiResponse<BackendConversation[]>>('/chats/conversations', {
      params,
    });
    return {
      conversations: response.data.data || [],
      meta: response.data.meta,
    };
  },

  // 2. Lấy lịch sử tin nhắn trong một cuộc hội thoại
  async getMessages(
    conversationId: string,
    params?: { page?: number; limit?: number; before?: string }
  ): Promise<{
    messages: BackendMessage[];
    meta?: any;
  }> {
    const response = await apiClient.get<ApiResponse<BackendMessage[]>>(
      `/chats/conversations/${conversationId}/messages`,
      { params }
    );
    return {
      messages: response.data.data || [],
      meta: response.data.meta,
    };
  },

  // 3. Mở hoặc tạo mới cuộc trò chuyện dựa trên sản phẩm
  async createOrGetConversation(productId: string, receiverId?: string): Promise<BackendConversation> {
    const response = await apiClient.post<ApiResponse<BackendConversation>>('/chats/conversations', {
      productId,
      receiverId,
    });
    return response.data.data;
  },

  // 4. Gửi tin nhắn qua REST API
  async sendMessage(
    conversationId: string,
    payload: {
      text?: string;
      type?: 'TEXT' | 'IMAGE' | 'OFFER_PRICE' | 'MEETUP_LOCATION';
      offerPrice?: number;
      meetupLocation?: string;
    },
    file?: File | Blob
  ): Promise<BackendMessage> {
    if (file) {
      const formData = new FormData();
      if (payload.text) formData.append('text', payload.text);
      formData.append('type', payload.type || 'IMAGE');
      formData.append('file', file);
      if (payload.offerPrice) formData.append('offerPrice', payload.offerPrice.toString());
      if (payload.meetupLocation) formData.append('meetupLocation', payload.meetupLocation);

      const response = await apiClient.post<ApiResponse<BackendMessage>>(
        `/chats/conversations/${conversationId}/messages`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data.data;
    }

    const response = await apiClient.post<ApiResponse<BackendMessage>>(
      `/chats/conversations/${conversationId}/messages`,
      payload
    );
    return response.data.data;
  },

  // 5. Đánh dấu đã đọc tất cả tin nhắn trong cuộc hội thoại
  async markAsRead(conversationId: string): Promise<any> {
    const response = await apiClient.patch<ApiResponse<any>>(
      `/chats/conversations/${conversationId}/read`
    );
    return response.data.data;
  },
};
