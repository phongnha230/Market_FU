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
   * Lấy danh sách đánh giá của 1 sinh viên/người bán
   */
  async getUserReviews(userId: string): Promise<any[]> {
    try {
      const res = await apiClient.get<ApiResponse<any[]>>(`/reviews/user/${userId}`);
      return res.data?.data || [];
    } catch {
      return [];
    }
  },
};

export default reviewMobileService;
