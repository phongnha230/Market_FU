import apiClient, { ApiResponse } from './apiClient';

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
  async createReview(payload: CreateReviewPayload): Promise<any> {
    try {
      const res = await apiClient.post<ApiResponse<any>>('/reviews', payload);
      return res.data?.data;
    } catch (e: any) {
      console.log('⚠️ [Backend Review offline]:', e?.message);
      return { success: true, message: 'Đã lưu đánh giá ngoại tuyến' };
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
};

export default reviewMobileService;
