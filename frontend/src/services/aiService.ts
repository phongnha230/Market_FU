import { apiClient, ApiResponse } from './apiClient';

export interface VisionScanResult {
  title: string;
  category: string;
  condition: string;
  suggestedPrice: number;
  description: string;
  tags?: string[];
  suggestedBulletPoints?: string[];
}

export interface AssistantChatProduct {
  id: string;
  title: string;
  price: number;
  condition?: string;
  campus?: string;
  categoryType?: string;
  images?: Array<{ imageUrl: string; isCover?: boolean }>;
  meetupLocation?: string;
}

export interface AssistantChatResult {
  sessionId: string;
  reply: string;
  suggestedProducts?: AssistantChatProduct[];
}

export const aiService = {
  // 1. Quét ảnh món đồ bằng Gemini 1.5 Flash Vision gợi ý thông tin đăng bài trong 3 giây
  async visionScanPost(imageFile: File | Blob): Promise<VisionScanResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post<ApiResponse<VisionScanResult>>(
      '/ai/vision-post',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data;
  },

  // 2. Chatbot Cóc AI tư vấn tìm đồ phòng trọ & giải đáp quy trình
  async assistantChat(
    message: string,
    campusOrSessionId?: string,
    sessionId?: string
  ): Promise<AssistantChatResult> {
    const isCampus = ['HOL', 'HCM', 'DAD', 'QN', 'CT', 'Hòa Lạc', 'TP.HCM', 'Đà Nẵng', 'Quy Nhơn', 'Cần Thơ'].includes(
      campusOrSessionId || ''
    );
    const campus = isCampus ? campusOrSessionId : 'HOL';
    const effectiveSessionId = isCampus ? sessionId : campusOrSessionId;

    const campusCodeMap: Record<string, string> = {
      'Hòa Lạc': 'HOL',
      'TP.HCM': 'HCM',
      'Đà Nẵng': 'DAD',
      'Quy Nhơn': 'QN',
      'Cần Thơ': 'CT',
    };

    // Chỉ gửi sessionId nếu là MongoDB ObjectId 24 ký tự hex hợp lệ
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(effectiveSessionId || '');
    const cleanSessionId = isObjectId ? effectiveSessionId : undefined;

    const response = await apiClient.post<ApiResponse<any>>('/ai/assistant-chat', {
      message,
      sessionId: cleanSessionId,
      campus: campusCodeMap[campus || ''] || campus || 'HOL',
    });
    const d = response.data?.data;
    return {
      sessionId: d?.session?.id || d?.sessionId || '',
      reply: d?.message?.content || d?.reply || '',
      suggestedProducts: d?.suggestedProducts || [],
    };
  },

  // 3. Lấy danh sách các phiên trò chuyện với AI
  async getUserSessions(params?: { page?: number; limit?: number }): Promise<any> {
    const response = await apiClient.get<ApiResponse<any[]>>('/ai/sessions', { params });
    return response.data.data;
  },

  // 4. Lấy chi tiết lịch sử tin nhắn trong một phiên chat AI
  async getSessionDetail(sessionId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/ai/sessions/${sessionId}`);
    return response.data.data;
  },
};
