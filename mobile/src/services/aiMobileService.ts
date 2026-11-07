import apiClient, { ApiResponse, getApiBaseUrl } from './apiClient';
import { useUserStore } from '../stores/userStore';

export interface AiChatResponse {
  reply: string;
  sessionId: string;
  suggestedProducts?: any[];
}

export interface AiVisionScanResult {
  title?: string;
  category?: string;
  estimatedPrice?: number;
  suggestedPrice?: number;
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
      const campusMap: Record<string, string> = {
        'HÒA LẠC': 'HOL',
        'Hòa Lạc': 'HOL',
        'HOL': 'HOL',
        'TP.HCM': 'HCM',
        'TP. HỒ CHÍ MINH': 'HCM',
        'HỒ CHÍ MINH': 'HCM',
        'HCM': 'HCM',
        'ĐÀ NẴNG': 'DAD',
        'Đà Nẵng': 'DAD',
        'DAD': 'DAD',
        'QUY NHƠN': 'QN',
        'Quy Nhơn': 'QN',
        'QN': 'QN',
        'CẦN THƠ': 'CT',
        'Cần Thơ': 'CT',
        'CT': 'CT',
      };
      const cleanCampus = campusMap[campus.trim()] || campusMap[campus.toUpperCase()] || 'HOL';

      // Chỉ gửi sessionId nếu là MongoDB ObjectId 24 ký tự hex hợp lệ
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(sessionId || '');
      const cleanSessionId = isObjectId ? sessionId : undefined;

      const res = await apiClient.post<ApiResponse<any>>('/ai/assistant-chat', {
        message,
        campus: cleanCampus,
        sessionId: cleanSessionId,
      });
      const data = res.data?.data;
      const reply =
        data?.message?.content ||
        data?.reply ||
        (typeof data?.message === 'string' ? data.message : 'Em đã hiểu rồi ạ!');
      const resolvedSessionId =
        data?.session?.id || data?.sessionId || sessionId || '';
      const suggestedProducts = data?.suggestedProducts || data?.recommendedProducts || [];

      return {
        reply,
        sessionId: resolvedSessionId,
        suggestedProducts,
      };
    } catch (e: any) {
      console.log('⚠️ [Backend AI Chat offline, using local fallback]:', e?.message);
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(sessionId || '');
      return {
        reply: `Chào bạn! Mình là Cóc AI hỗ trợ Marketplace FPT ${campus}. Bạn muốn tìm giáo trình PE/FE, đồ phòng KTX, hay cần hướng dẫn điểm hẹn an toàn Safe-Point?`,
        sessionId: isObjectId ? sessionId! : '',
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
   * Quét ảnh bằng Gemini Vision để gợi ý giá & thông tin đăng bài thực tế
   */
  async scanProductImage(imageUri: string): Promise<AiVisionScanResult> {
    const baseUrl = getApiBaseUrl();
    const token = useUserStore.getState().token;

    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'item.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), 45000); // 45 giây cho Gemini Vision xử lý ảnh

    try {
      // Dùng fetch native của React Native để đảm bảo multipart/form-data có boundary chuẩn xác 100%
      const response = await fetch(`${baseUrl}/ai/vision-post`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutTimer);

      const json = await response.json();

      if (!response.ok || !json.success) {
        const errorMsg =
          json?.message ||
          json?.error ||
          `Máy chủ AI trả về lỗi (HTTP ${response.status})`;
        throw new Error(errorMsg);
      }

      const data = json.data || {};
      const finalPrice = data.suggestedPrice || data.estimatedPrice || 0;

      return {
        title: data.title || '',
        category: data.category || '',
        suggestedPrice: finalPrice,
        estimatedPrice: finalPrice,
        condition: data.condition || '',
        description: data.description || '',
      };
    } catch (e: any) {
      clearTimeout(timeoutTimer);
      console.warn('⚠️ [Backend AI Vision error]:', e?.message);
      if (e?.name === 'AbortError' || e?.message?.includes('aborted')) {
        throw new Error('Quá thời gian kết nối (45s). Vui lòng thử lại với ảnh nhỏ hơn hoặc mạng ổn định hơn.');
      }
      throw e;
    }
  },
};

export default aiMobileService;
