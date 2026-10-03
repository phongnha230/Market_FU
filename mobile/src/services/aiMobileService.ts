import apiClient, { ApiResponse } from './apiClient';

export interface AiChatResponse {
  reply: string;
  sessionId: string;
  recommendedProducts?: any[];
}

export interface AiVisionScanResult {
  title?: string;
  category?: string;
  estimatedPrice?: number;
  condition?: string;
  description?: string;
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
      return {
        reply: res.data?.data?.reply || res.data?.data?.message || 'Em đã hiểu rồi ạ!',
        sessionId: res.data?.data?.sessionId || sessionId || `ai_sess_${Date.now()}`,
        recommendedProducts: res.data?.data?.recommendedProducts || [],
      };
    } catch (e: any) {
      console.log('⚠️ [Backend AI Chat offline, using local fallback]:', e?.message);
      return {
        reply: `Chào bạn! Mình là AI Assistant hỗ trợ Marketplace cơ sở ${campus}. Bạn muốn tìm giáo trình PE/FE, đồ phòng KTX hay phụ kiện công nghệ nào?`,
        sessionId: sessionId || `ai_sess_${Date.now()}`,
        recommendedProducts: [],
      };
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
