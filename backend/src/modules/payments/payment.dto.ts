import { z } from 'zod';

export const createPayOsLinkSchema = z.object({
  orderId: z.string({ required_error: 'ID đơn hàng không được để trống' }).min(1),
  returnUrl: z.string().url('URL chuyển hướng thành công không hợp lệ').optional(),
  cancelUrl: z.string().url('URL hủy thanh toán không hợp lệ').optional(),
});
export type CreatePayOsLinkInput = z.infer<typeof createPayOsLinkSchema>;

export const payOsWebhookSchema = z.object({
  code: z.string(),
  desc: z.string(),
  success: z.boolean(),
  data: z.object({
    orderCode: z.coerce.number(),
    amount: z.coerce.number(),
    description: z.string(),
    accountNumber: z.string().optional(),
    reference: z.string().optional(),
    transactionDateTime: z.string().optional(),
    currency: z.string().optional(),
    paymentLinkId: z.string().optional(),
    code: z.string().optional(),
    desc: z.string().optional(),
  }),
  signature: z.string(),
});
export type PayOsWebhookInput = z.infer<typeof payOsWebhookSchema>;
