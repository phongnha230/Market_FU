import { z } from 'zod';

export const createReportSchema = z.object({
  targetType: z.enum(['PRODUCT', 'USER'], { required_error: 'Loại đối tượng phải là PRODUCT hoặc USER' }),
  targetId: z.string({ required_error: 'ID đối tượng không được để trống' }).min(1),
  reason: z.string().min(5, 'Lý do tố cáo phải từ 5 ký tự trở lên').max(1000),
  evidenceUrl: z.string().url('Link ảnh/video bằng chứng không hợp lệ').optional(),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;

export const resolveReportSchema = z.object({
  action: z.enum(['BAN_USER', 'HIDE_PRODUCT', 'DISMISS']),
  adminNote: z.string().min(3, 'Ghi chú xử lý phải từ 3 ký tự trở lên').max(500),
});
export type ResolveReportInput = z.infer<typeof resolveReportSchema>;

export const resolveDisputeSchema = z.object({
  resolution: z.enum(['REFUND_BUYER', 'RELEASE_TO_SELLER', 'DISMISSED']),
  adminNote: z.string().min(5, 'Ghi chú phán quyết phải từ 5 ký tự').max(500),
});
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;

export const reviewKycSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectedReason: z.string().max(300).optional(),
});
export type ReviewKycInput = z.infer<typeof reviewKycSchema>;

export const queryAdminSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.string().optional(),
});
export type QueryAdminInput = z.infer<typeof queryAdminSchema>;
