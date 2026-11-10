import apiClient, {
  ApiResponse,
  buildImageFormDataPart,
  uploadMultipart,
} from './apiClient';

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

export const resolveAiCampusCode = (campus?: string): string | undefined => {
  if (!campus) return undefined;
  const trimmed = campus.trim();
  const upper = trimmed.toUpperCase();
  if (!trimmed || upper === 'TẤT CẢ' || upper === 'TAT CA' || upper === 'ALL') {
    return undefined;
  }

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
  return campusMap[trimmed] || campusMap[upper];
};

export const aiMobileService = {
  /**
   * Chat với Gemini AI Assistant
   */
  async chatWithAssistant(
    message: string,
    campus?: string,
    sessionId?: string
  ): Promise<AiChatResponse> {
    try {
      const cleanCampus = resolveAiCampusCode(campus);

      // Chỉ gửi sessionId nếu là MongoDB ObjectId 24 ký tự hex hợp lệ
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(sessionId || '');
      const cleanSessionId = isObjectId ? sessionId : undefined;

      const res = await apiClient.post<ApiResponse<any>>(
        '/ai/assistant-chat',
        {
          message,
          ...(cleanCampus ? { campus: cleanCampus } : {}),
          sessionId: cleanSessionId,
        },
        {
          // Gemini Function Calling + DB search cần thời gian dài hơn timeout mặc định 6s
          timeout: 25000,
        }
      );
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
      const serverMsg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message;
      if (e?.code === 'ECONNABORTED') {
        throw new Error('Trợ lý AI phản hồi quá lâu (hết thời gian chờ). Vui lòng thử lại nhé!');
      }
      if (serverMsg) {
        throw new Error(serverMsg);
      }
      throw e;
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
    const formData = new FormData();
    formData.append('image', buildImageFormDataPart(imageUri, 'vision_item') as any);

    try {
      const res = await uploadMultipart<any>('/ai/vision-post', formData, {
        method: 'POST',
        timeoutMs: 45000,
      });

      const data = res.data?.data || {};
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
      console.warn('⚠️ [Backend AI Vision error]:', e?.message);
      throw e;
    }
  },
};

export default aiMobileService;
