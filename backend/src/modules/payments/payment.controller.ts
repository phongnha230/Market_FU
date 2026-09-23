import { Request, Response, NextFunction } from 'express';
import { paymentService, verifyPaymentWebhookSignature } from './payment.service';
import { webhookPaymentSchema, checkPaymentStatusSchema } from './payment.dto';
import { sendSuccess } from '../../utils/response';

export class PaymentController {
  /**
   * POST /api/webhooks/payments
   * Endpoint nhận Webhook từ SePay / PayOS / VietQR Bot
   * B3-2: Bắt buộc xác thực chữ ký HMAC-SHA256 trên raw body trước khi xử lý
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      verifyPaymentWebhookSignature(
        (req as any).rawBody,
        (req.headers['x-webhook-signature'] as string | undefined) ||
          (req.headers['token'] as string | undefined) ||
          req.query.token as string | undefined
      );

      const payload = webhookPaymentSchema.parse(req.body);
      const result = await paymentService.processPaymentWebhook(payload, true);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/order/:orderCode/status
   * Kiểm tra trạng thái thanh toán đơn hàng
   */
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderCode } = checkPaymentStatusSchema.parse(req.params);
      const status = await paymentService.getPaymentStatus(orderCode);
      return sendSuccess(res, status);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
