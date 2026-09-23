import { z } from 'zod';

export const webhookPaymentSchema = z.object({
  orderCode: z.string().optional(),
  content: z.string().optional(),
  description: z.string().optional(),
  transferAmount: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  gateway: z.string().optional(),
  transactionDate: z.string().optional(),
  referenceCode: z.string().optional(),
});

export type WebhookPaymentInput = z.infer<typeof webhookPaymentSchema>;

export const checkPaymentStatusSchema = z.object({
  orderCode: z.string().min(1, 'orderCode không được để trống'),
});

export type CheckPaymentStatusInput = z.infer<typeof checkPaymentStatusSchema>;
