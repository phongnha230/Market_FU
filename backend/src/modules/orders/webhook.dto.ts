import { z } from 'zod';

/**
 * Schema xác thực dữ liệu Webhook đối tác vận chuyển GHTK / GHN
 */
export const shippingWebhookSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    order_code: z.string().optional(),
    status_report: z
      .array(
        z.object({
          ErrorCode: z.union([z.string(), z.number()]).optional(),
          ErrorText: z.string().optional(),
          Message: z.string().optional(),
        })
      )
      .optional(),
    report_code: z.string().optional(),
    event_code: z.union([z.string(), z.number()]).optional(),
    event_name: z.string().optional(),
    tracking_order_code: z.string().optional(),
    order_status: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough();

export type ShippingWebhookInput = z.infer<typeof shippingWebhookSchema>;
