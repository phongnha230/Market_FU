import { z } from 'zod';

export const redeemVoucherSchema = z.object({
  voucherId: z.string({ required_error: 'Voucher ID không được để trống' }).min(1),
});
export type RedeemVoucherInput = z.infer<typeof redeemVoucherSchema>;

export const queryMyVouchersSchema = z.object({
  status: z.enum(['UNUSED', 'USED', 'EXPIRED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type QueryMyVouchersInput = z.infer<typeof queryMyVouchersSchema>;

export const useVoucherSchema = z.object({
  voucherCode: z.string({ required_error: 'Mã voucher không được để trống' }).min(5),
});
export type UseVoucherInput = z.infer<typeof useVoucherSchema>;

export const createVoucherAdminSchema = z.object({
  title: z.string().min(5, 'Tên voucher tối thiểu 5 ký tự'),
  description: z.string().optional(),
  partner: z.enum(['CANTEEN', 'PASSIO', 'SEVEN_ELEVEN', 'OTHER']),
  coinCost: z.coerce.number().int().min(100, 'Số Xu đổi tối thiểu 100'),
  discountValue: z.coerce.number().int().min(1000, 'Giá trị giảm tối thiểu 1.000 VNĐ'),
  quantity: z.coerce.number().int().min(1).default(100),
  imageUrl: z.string().url().optional(),
  validDays: z.coerce.number().int().min(1).default(30),
});
export type CreateVoucherAdminInput = z.infer<typeof createVoucherAdminSchema>;
