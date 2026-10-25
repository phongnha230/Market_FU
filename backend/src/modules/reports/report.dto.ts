import { z } from 'zod';

export const ReportTargetTypeEnum = z.enum(['PRODUCT', 'USER'], {
  errorMap: () => ({ message: 'Đối tượng bị tố cáo phải là PRODUCT (Sản phẩm) hoặc USER (Người dùng)' }),
});

export const ReportStatusEnum = z.enum(['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'], {
  errorMap: () => ({ message: 'Trạng thái tố cáo phải là PENDING, INVESTIGATING, RESOLVED hoặc DISMISSED' }),
});

// 1. Tạo báo cáo tố cáo vi phạm
export const CreateReportSchema = z.object({
  targetType: ReportTargetTypeEnum,
  targetId: z.string({ required_error: 'ID đối tượng bị tố cáo là bắt buộc' }).min(1, 'Target ID không hợp lệ'),
  reason: z
    .string({ required_error: 'Lý do tố cáo là bắt buộc' })
    .min(3, 'Lý do tố cáo tối thiểu 3 ký tự')
    .max(200, 'Lý do tố cáo tối đa 200 ký tự'),
  details: z.string().max(1000, 'Chi tiết tố cáo tối đa 1000 ký tự').optional(),
});

// 2. Admin xử lý báo cáo
export const ResolveReportSchema = z.object({
  action: z.enum(['BAN_USER', 'HIDE_PRODUCT', 'DISMISS'], {
    errorMap: () => ({ message: 'Hành động phải là BAN_USER, HIDE_PRODUCT hoặc DISMISS' }),
  }),
  adminNote: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});

// 3. Phân trang & Lọc danh sách báo cáo (Admin)
export const QueryReportsSchema = z.object({
  status: ReportStatusEnum.optional(),
  targetType: ReportTargetTypeEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// 4. Người mua mở khiếu nại Dispute
export const CreateDisputeSchema = z.object({
  orderId: z.string({ required_error: 'ID đơn hàng là bắt buộc' }).min(1, 'Order ID không hợp lệ'),
  reason: z
    .string({ required_error: 'Lý do khiếu nại là bắt buộc' })
    .min(5, 'Lý do khiếu nại tối thiểu 5 ký tự')
    .max(500, 'Lý do khiếu nại tối đa 500 ký tự'),
  proofVideoUrl: z
    .string({ required_error: 'Bằng chứng mở hộp/test đồ là bắt buộc' })
    .min(1, 'Đường dẫn bằng chứng không hợp lệ'),
});

// 5. Admin phân xử khiếu nại Dispute
export const ResolveDisputeSchema = z.object({
  decision: z.enum(['REFUND_BUYER', 'PAY_SELLER'], {
    errorMap: () => ({ message: 'Quyết định phải là REFUND_BUYER (Hoàn tiền người mua) hoặc PAY_SELLER (Thanh toán người bán)' }),
  }),
  adminNote: z.string().max(500, 'Ghi chú phán quyết tối đa 500 ký tự').optional(),
});

// 5b. Admin Chấp thuận khiếu nại (Hoàn tiền cho Người mua)
export const AdminApproveDisputeSchema = z.object({
  adminNote: z.string().max(500, 'Ghi chú phán quyết tối đa 500 ký tự').optional(),
});

// 5c. Admin Bác bỏ khiếu nại (Chuyển tiền cho Người bán)
export const AdminRejectDisputeSchema = z.object({
  adminNote: z.string().max(500, 'Ghi chú phán quyết tối đa 500 ký tự').optional(),
});

// 5d. Người mua tự hủy khiếu nại của chính mình
export const CancelDisputeSchema = z.object({
  reason: z.string().max(500, 'Lý do rút khiếu nại tối đa 500 ký tự').optional(),
});

// 6. Lọc danh sách Khiếu nại Dispute
export const QueryDisputesSchema = z.object({
  status: z.enum(['PENDING', 'RESOLVED', 'REJECTED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// 7. Lọc danh sách KYC Verifications
export const QueryKycSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  type: z.enum(['STUDENT', 'SELLER']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// 8. Admin duyệt KYC
export const ApproveKycSchema = z.object({
  bonusCoins: z.coerce.number().int().nonnegative().default(200),
  adminNote: z.string().max(500).optional(),
});

// 9. Admin từ chối KYC
export const RejectKycSchema = z.object({
  reason: z
    .string({ required_error: 'Lý do từ chối là bắt buộc' })
    .min(5, 'Lý do từ chối tối thiểu 5 ký tự')
    .max(500, 'Lý do từ chối tối đa 500 ký tự'),
});

export type CreateReportInput = z.infer<typeof CreateReportSchema>;
export type ResolveReportInput = z.infer<typeof ResolveReportSchema>;
export type QueryReportsInput = z.infer<typeof QueryReportsSchema>;
export type CreateDisputeInput = z.infer<typeof CreateDisputeSchema>;
export type ResolveDisputeInput = z.infer<typeof ResolveDisputeSchema>;
export type AdminApproveDisputeInput = z.infer<typeof AdminApproveDisputeSchema>;
export type AdminRejectDisputeInput = z.infer<typeof AdminRejectDisputeSchema>;
export type CancelDisputeInput = z.infer<typeof CancelDisputeSchema>;
export type QueryDisputesInput = z.infer<typeof QueryDisputesSchema>;
export type QueryKycInput = z.infer<typeof QueryKycSchema>;
export type ApproveKycInput = z.infer<typeof ApproveKycSchema>;
export type RejectKycInput = z.infer<typeof RejectKycSchema>;
