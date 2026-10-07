import apiClient, { ApiResponse } from './apiClient';

export interface AiChatResponse {
  reply: string;
  sessionId: string;
  suggestedProducts?: any[];
}

export interface AiVisionScanResult {
  title?: string;
  category?: string;
  estimatedPrice?: number;
  condition?: string;
  description?: string;
}

export interface AiSessionItem {
  id: string;
  title: string;
  campus?: string;
  createdAt: string;
  updatedAt: string;
  messages?: Array<{ content: string; createdAt: string }>;
}

export const aiMobileService = {
  /**
   * Chat với Gemini AI Assistant
   */
  async chatWithAssistant(
    message: string,
    campus: string = 'HÒA LẠC',
    sessionId?: string
  ): Promise<AiChatResponse> {
    try {
      const res = await apiClient.post<ApiResponse<any>>('/ai/assistant-chat', {
        message,
        campus,
        sessionId,
      });
      const data = res.data?.data;
      const reply =
        data?.message?.content ||
        data?.reply ||
        (typeof data?.message === 'string' ? data.message : 'Em đã hiểu rồi ạ!');
      const resolvedSessionId =
        data?.session?.id || data?.sessionId || sessionId || `ai_sess_${Date.now()}`;
      const suggestedProducts = data?.suggestedProducts || data?.recommendedProducts || [];

      return {
        reply,
        sessionId: resolvedSessionId,
        suggestedProducts,
      };
    } catch (e: any) {
      console.log('⚠️ [Backend AI Chat offline, using local fallback]:', e?.message);
      return {
        reply: `Chào bạn! Mình là Cóc AI hỗ trợ Marketplace FPT ${campus}. Bạn muốn tìm giáo trình PE/FE, đồ phòng KTX, hay cần hướng dẫn điểm hẹn an toàn Safe-Point?`,
        sessionId: sessionId || `ai_sess_${Date.now()}`,
        suggestedProducts: [],
      };
    }
  },

  /**
   * Lấy danh sách các phiên chat của người dùng
   */
  async getUserSessions(page = 1, limit = 20): Promise<AiSessionItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/ai/sessions', {
        params: { page, limit },
      });
      const list = res.data?.data || [];
      return Array.isArray(list) ? list : [];
    } catch (e: any) {
      console.log('⚠️ [Get AI Sessions error]:', e?.message);
      return [];
    }
  },

  /**
   * Lấy chi tiết lịch sử tin nhắn của một phiên chat
   */
  async getSessionDetail(sessionId: string): Promise<any | null> {
    try {
      const res = await apiClient.get<ApiResponse<any>>(`/ai/sessions/${sessionId}`);
      return res.data?.data || null;
    } catch (e: any) {
      console.log('⚠️ [Get AI Session Detail error]:', e?.message);
      return null;
    }
  },

  /**
   * Quét ảnh bằng Gemini Vision để gợi ý giá & thông tin đăng bài
   */
  async scanProductImage(imageUri: string): Promise<AiVisionScanResult> {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'item.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const res = await apiClient.post<ApiResponse<any>>('/ai/vision-post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return res.data?.data || {};
    } catch (e: any) {
      console.log('⚠️ [Backend AI Vision offline]:', e?.message);
      return {
        title: 'Món đồ sinh viên FPT',
        estimatedPrice: 200000,
        condition: 'Like New 99%',
      };
    }
  },
};

export default aiMobileService;
