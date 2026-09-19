import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useWalletStore } from './walletStore';
import { useOrderStore } from './orderStore';

export interface ReviewItem {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  revieweeId: string;
  revieweeName: string;
  rating: number; // 1 -> 5
  comment: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: string;
}

interface ReviewState {
  reviews: ReviewItem[];

  // Actions
  submitReview: (params: {
    orderId: string;
    revieweeId: string;
    revieweeName: string;
    rating: number;
    comment: string;
    tags?: string[];
  }) => { success: boolean; message: string; review?: ReviewItem };
  getReviewsByReviewee: (revieweeId: string) => ReviewItem[];
  getReviewsByOrder: (orderId: string) => ReviewItem | undefined;
  calculateAverageRating: (revieweeId: string) => { average: number; count: number };
  resetReviews: () => void;
}

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    orderId: 'ord-2',
    reviewerId: 'user-default',
    reviewerName: 'Lê Minh Quân',
    reviewerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    revieweeId: 'user-seller-2',
    revieweeName: 'Trần Thùy Trang',
    rating: 5,
    comment: 'Giáo trình MAS291 và CSL201 rất mới, bạn còn note lại các dạng bài PE quan trọng. Giao dịch nhanh tại thư viện!',
    tags: ['Đúng mô tả', 'Sách giữ gìn', 'Giao nhanh KTX'],
    isPublic: true,
    createdAt: 'Hôm nay',
  },
  {
    id: 'rev-2',
    orderId: 'ord-prev-1',
    reviewerId: 'user-stu-3',
    reviewerName: 'Nguyễn Văn Hùng',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    revieweeId: 'user-default',
    revieweeName: 'Lê Minh Quân',
    rating: 5,
    comment: 'Bàn phím cơ gõ rất đầm tay, đầy đủ keycap và cáp Type-C theo máy. Người bán nhiệt tình hỗ trợ test tại Dom E.',
    tags: ['Nhiệt tình', 'Hàng chuẩn zin', 'Bọc hàng kỹ'],
    isPublic: true,
    createdAt: '3 ngày trước',
  },
];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: INITIAL_REVIEWS,

      submitReview: ({ orderId, revieweeId, revieweeName, rating, comment, tags = [] }) => {
        // Kiểm tra xem đơn hàng đã từng đánh giá chưa
        const existing = get().reviews.find((r) => r.orderId === orderId);
        if (existing) {
          return { success: false, message: 'Đơn hàng này đã được đánh giá trước đó!' };
        }

        const newReview: ReviewItem = {
          id: `rev-${Date.now()}`,
          orderId,
          reviewerId: 'user-default',
          reviewerName: 'Lê Minh Quân',
          reviewerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          revieweeId,
          revieweeName,
          rating,
          comment,
          tags,
          isPublic: true,
          createdAt: 'Vừa xong',
        };

        set((state) => ({
          reviews: [newReview, ...state.reviews],
        }));

        // Đánh dấu đơn hàng là đã review trong orderStore
        useOrderStore.getState().markOrderReviewed(orderId);

        // Tặng thưởng +50 Coin cho sinh viên đánh giá
        useWalletStore.getState().addCoins(
          50,
          'REVIEW_REWARD',
          `Thưởng đánh giá đơn hàng ${orderId}`,
          orderId
        );

        return {
          success: true,
          message: 'Gửi đánh giá thành công! Bạn nhận được +50 FPT Coin vào ví.',
          review: newReview,
        };
      },

      getReviewsByReviewee: (revieweeId) => {
        return get().reviews.filter((r) => r.revieweeId === revieweeId);
      },

      getReviewsByOrder: (orderId) => {
        return get().reviews.find((r) => r.orderId === orderId);
      },

      calculateAverageRating: (revieweeId) => {
        const list = get().reviews.filter((r) => r.revieweeId === revieweeId);
        if (list.length === 0) return { average: 5.0, count: 0 };
        const sum = list.reduce((acc, r) => acc + r.rating, 0);
        return {
          average: Number((sum / list.length).toFixed(1)),
          count: list.length,
        };
      },

      resetReviews: () => set({ reviews: INITIAL_REVIEWS }),
    }),
    {
      name: 'fu_market_reviews_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
    }
  )
);
