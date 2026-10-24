import { z } from 'zod';

export const VoucherPartnerEnum = z.enum(['CANTEEN', 'PASSIO', 'SEVEN_ELEVEN', 'CAMPUS_SHIP', 'OTHER'], {
  errorMap: () => ({ message: 'Đối tác phải là CANTEEN, PASSIO, SEVEN_ELEVEN, CAMPUS_SHIP hoặc OTHER' }),
});

export const UserVoucherStatusEnum = z.enum(['UNUSED', 'USED', 'EXPIRED'], {
  errorMap: () => ({ message: 'Trạng thái voucher phải là UNUSED, USED hoặc EXPIRED' }),
});

// Schema tạo mới Voucher (Dành cho Admin)
export const CreateVoucherSchema = z.object({
  title: z
    .string({ required_error: 'Tiêu đề voucher là bắt buộc' })
    .min(3, 'Tiêu đề tối thiểu 3 ký tự')
    .max(100, 'Tiêu đề tối đa 100 ký tự'),
  description: z.string().max(500, 'Mô tả tối đa 500 ký tự').optional(),
  partner: VoucherPartnerEnum.default('CANTEEN'),
  coinCost: z.coerce
    .number({ required_error: 'Số Xu đổi là bắt buộc' })
    .int('Số Xu phải là số nguyên')
    .positive('Số Xu phải lớn hơn 0'),
  discountValue: z.coerce
    .number({ required_error: 'Giá trị voucher (VNĐ) là bắt buộc' })
    .int('Giá trị phải là số nguyên')
    .positive('Giá trị voucher phải lớn hơn 0'),
  quantity: z.coerce
    .number()
    .int('Số lượng phải là số nguyên')
    .nonnegative('Số lượng không được âm')
    .default(100),
  imageUrl: z.string().url('Đường dẫn ảnh không hợp lệ').optional().or(z.literal('')),
  validDays: z.coerce
    .number()
    .int('Số ngày sử dụng phải là số nguyên')
    .positive('Số ngày sử dụng phải lớn hơn 0')
    .default(30),
});

// Schema cập nhật Voucher (Admin)
export const UpdateVoucherSchema = CreateVoucherSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Query Voucher công khai
export const QueryVouchersSchema = z.object({
  partner: VoucherPartnerEnum.optional(),
  search: z.string().optional(),
  isActive: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true')),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Query Voucher của User
export const QueryUserVouchersSchema = z.object({
  status: UserVoucherStatusEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Schema sử dụng voucher (Quét mã đổi quà)
export const UseVoucherSchema = z.object({
  voucherCode: z
    .string({ required_error: 'Mã voucher là bắt buộc' })
    .min(5, 'Mã voucher không hợp lệ')
    .max(50, 'Mã voucher không hợp lệ')
    .trim(),
});

export type CreateVoucherInput = z.infer<typeof CreateVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof UpdateVoucherSchema>;
export type QueryVouchersInput = z.infer<typeof QueryVouchersSchema>;
export type QueryUserVouchersInput = z.infer<typeof QueryUserVouchersSchema>;
export type UseVoucherInput = z.infer<typeof UseVoucherSchema>;
