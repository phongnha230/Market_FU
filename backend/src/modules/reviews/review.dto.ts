import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.string().min(1, 'orderId không được để trống'),
  rating: z.coerce.number().int().min(1, 'Đánh giá tối thiểu 1 sao').max(5, 'Đánh giá tối đa 5 sao'),
  comment: z.string().max(1000, 'Nội dung đánh giá không được quá 1000 ký tự').optional(),
  images: z.array(z.string().url('URL ảnh không hợp lệ')).max(5, 'Tối đa 5 ảnh bằng chứng').optional(),
  proofVideoUrl: z.string().url('Link video test không hợp lệ').optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const queryUserReviewsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type QueryUserReviewsInput = z.infer<typeof queryUserReviewsSchema>;
