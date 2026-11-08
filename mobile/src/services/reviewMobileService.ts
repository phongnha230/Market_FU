import apiClient, {
  ApiResponse,
  buildImageFormDataPart,
  uploadMultipart,
} from './apiClient';

export interface CreateReviewPayload {
  orderId: string;
  rating: number;
  comment?: string;
  images?: string[];
  proofVideoUrl?: string;
}

export const reviewMobileService = {
  /**
   * Đăng bài đánh giá đơn hàng (2 chiều)
   */
  async createReview(payload: CreateReviewPayload): Promise<unknown> {
    try {
      const res = await apiClient.post<ApiResponse<unknown>>('/reviews', payload);
      return res.data?.data;
    } catch (error: unknown) {
      console.error('Failed to create review:', error);
      throw error;
    }
  },

  /**
   * Upload ảnh hoặc video bằng chứng lên server để có public URL dùng chung cho cả Người Bán & Người Mua
   */
  async uploadMedia(fileUri: string, isVideo = false): Promise<string | null> {
    try {
      const formData = new FormData();
      if (isVideo) {
        const cleanPath = fileUri.split('?')[0];
        const filename = cleanPath.split('/').pop() || `review_video_${Date.now()}.mp4`;
        formData.append('file', {
          uri: fileUri,
          name: filename,
          type: 'video/mp4',
        } as any);
      } else {
        formData.append('file', buildImageFormDataPart(fileUri, 'review_photo') as any);
      }

      const res = await uploadMultipart<any>('/reports/upload-evidence', formData, {
        method: 'POST',
        timeoutMs: 60000,
      });

      return res.data?.data?.url || null;
    } catch (err) {
      console.warn('Failed to upload review media to server, fallback to local uri:', err);
      return null;
    }
  },

  async updateReview(payload: CreateReviewPayload): Promise<unknown> {
    try {
      const res = await apiClient.patch<ApiResponse<unknown>>(
        `/reviews/order/${encodeURIComponent(payload.orderId)}`,
        {
          rating: payload.rating,
          comment: payload.comment,
          images: payload.images,
          proofVideoUrl: payload.proofVideoUrl,
        }
      );
      return res.data?.data;
    } catch (error: unknown) {
      console.error('Failed to update review:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đánh giá của 1 đơn hàng (gồm cả phản hồi người bán & avatar người mua)
   */
  async getOrderReviews(orderId: string): Promise<any[]> {
    try {
      const cleanOrderId = orderId.replace(/^#/, '');
      const res = await apiClient.get<ApiResponse<any[]>>(`/reviews/order/${encodeURIComponent(cleanOrderId)}`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (error) {
      console.warn('[reviewMobileService] getOrderReviews error:', error);
      return [];
    }
  },

  /**
   * Người bán phản hồi đánh giá của người mua
   */
  async replyReview(orderId: string, replyComment: string): Promise<any> {
    try {
      const cleanOrderId = orderId.replace(/^#/, '');
      const res = await apiClient.post<ApiResponse<any>>(
        `/reviews/order/${encodeURIComponent(cleanOrderId)}/reply`,
        { replyComment }
      );
      return res.data?.data;
    } catch (error) {
      console.error('[reviewMobileService] replyReview error:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đánh giá của 1 sinh viên/người bán (kèm thống kê sao)
   */
  async getUserReviews(
    userId: string,
    params?: { type?: 'received' | 'given' | 'all'; rating?: number; hasImages?: boolean }
  ): Promise<{
    reviews: any[];
    stats?: {
      totalReceived: number;
      averageRating: number | null;
      ratingDistribution: Record<number, number>;
    };
  }> {
    try {
      const res = await apiClient.get<ApiResponse<any>>(`/reviews/user/${userId}`, { params });
      const reviews = Array.isArray(res.data?.data) ? res.data?.data : (res.data?.data as any)?.reviews || [];
      const stats = (res.data as any)?.meta?.stats || null;
      return { reviews, stats };
    } catch {
      return { reviews: [], stats: undefined };
    }
  },

  /**
   * Bật/tắt trạng thái công khai đánh giá
   */
  async toggleReviewPublic(orderId: string): Promise<any> {
    try {
      const res = await apiClient.post<ApiResponse<any>>(
        `/reviews/order/${encodeURIComponent(orderId)}/toggle-public`
      );
      return res.data?.data;
    } catch (error) {
      console.error('Failed to toggle review public:', error);
      throw error;
    }
  },
};

export default reviewMobileService;
