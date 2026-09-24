import { Request, Response, NextFunction } from 'express';
import { shippingWebhookSchema } from './webhook.dto';
import {
  shippingWebhookService,
  verifyShippingWebhookSignature,
  ShippingWebhookPayload,
} from './webhook.service';

export class ShippingWebhookController {
  /**
   * POST /api/webhooks/shipping (Task 3.2)
   * Public endpoint cho GHTK/GHN gọi server-to-server.
   * Xác thực chữ ký HMAC trên rawBody rồi mới giao cho ShippingWebhookService xử lý.
   */
  handleShippingWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      verifyShippingWebhookSignature(
        (req as any).rawBody,
        (req.headers['signature'] as string | undefined) ||
          (req.headers['x-webhook-signature'] as string | undefined) ||
          (req.headers['authorization'] as string | undefined),
        req.path
      );

      const payload = shippingWebhookSchema.parse(req.body) as ShippingWebhookPayload;
      const result = await shippingWebhookService.processShippingWebhook(payload);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export const shippingWebhookController = new ShippingWebhookController();
