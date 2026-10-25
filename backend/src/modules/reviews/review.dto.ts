import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.string().min(1, 'orderId không được để trống'),
  rating: z.coerce.number().int().min(1, 'Đánh giá tối thiểu 1 sao').max(5, 'Đánh giá tối đa 5 sao'),
  comment: z.string().max(1000, 'Nội dung đánh giá không được quá 1000 ký tự').optional(),
  images: z.array(z.string().min(1, 'URL ảnh không hợp lệ')).max(5, 'Tối đa 5 ảnh bằng chứng').optional(),
  proofVideoUrl: z.string().min(1, 'Link video test không hợp lệ').optional().nullable(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const queryUserReviewsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  type: z.enum(['received', 'given', 'all']).default('received'),
  hasImages: z.coerce.boolean().optional(),
});

export type QueryUserReviewsInput = z.infer<typeof queryUserReviewsSchema>;

export const updateReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Đánh giá tối thiểu 1 sao').max(5, 'Đánh giá tối đa 5 sao').optional(),
  comment: z.string().max(1000, 'Nội dung đánh giá không được quá 1000 ký tự').optional(),
  images: z.array(z.string().min(1, 'URL ảnh không hợp lệ')).max(5, 'Tối đa 5 ảnh bằng chứng').optional(),
  proofVideoUrl: z.string().min(1, 'Link video test không hợp lệ').optional().nullable(),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
