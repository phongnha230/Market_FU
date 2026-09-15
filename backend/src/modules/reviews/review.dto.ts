import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.string({ required_error: 'ID đơn hàng không được để trống' }).min(1),
  rating: z.coerce.number().int().min(1, 'Đánh giá tối thiểu 1 sao').max(5, 'Đánh giá tối đa 5 sao'),
  comment: z.string().max(500, 'Nội dung đánh giá tối đa 500 ký tự').optional(),
  testVideoUrl: z.string().url('URL video test phải hợp lệ').optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const queryUserReviewsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type QueryUserReviewsInput = z.infer<typeof queryUserReviewsSchema>;
