import { Request, Response, NextFunction } from 'express';
import { paymentService, verifyPaymentWebhookSignature } from './payment.service';
import { webhookPaymentSchema, checkPaymentStatusSchema, WebhookPaymentInput } from './payment.dto';
import { sendSuccess } from '../../utils/response';
import { isPayOsConfigured, getPayOsClient } from '../../config/payos';
import { AppError } from '../../middlewares/error.middleware';
import { AuthRequest } from '../../middlewares/auth.middleware';

export class PaymentController {
  /**
   * POST /api/webhooks/payments
   * Endpoint nhận Webhook từ SePay / PayOS / VietQR Bot
   * B3-2: Xác thực chữ ký HMAC-SHA256 (SePay/VietQR qua header) hoặc PayOS SDK verify (qua body)
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const hasHeaderSignature = Boolean(
        req.headers['x-webhook-signature'] ||
        req.headers['token'] ||
        req.query.token
      );

      if (hasHeaderSignature) {
        verifyPaymentWebhookSignature(
          (req as any).rawBody,
          (req.headers['x-webhook-signature'] as string | undefined) ||
            (req.headers['token'] as string | undefined) ||
            req.query.token as string | undefined
        );
      } else if (req.body?.signature) {
        if (!isPayOsConfigured()) {
          throw new AppError('Chưa cấu hình xác thực webhook PayOS', 503, 'PAYOS_WEBHOOK_NOT_CONFIGURED');
        }
        try {
          await getPayOsClient().webhooks.verify(req.body);
        } catch {
          throw new AppError('Chữ ký webhook PayOS không hợp lệ', 401, 'PAYOS_SIGNATURE_INVALID');
        }
        if (req.body?.success !== true && req.body?.code !== '00') {
          throw new AppError('Webhook PayOS không báo giao dịch thành công', 400, 'PAYOS_EVENT_NOT_SUCCESSFUL');
        }
      } else {
        throw new AppError('Thiếu chữ ký webhook xác thực', 401, 'WEBHOOK_SIGNATURE_MISSING');
      }

      const body = req.body;
      const payosData = body?.data;

      const rawPayload = {
        orderCode: payosData?.orderCode ? String(payosData.orderCode) : body?.orderCode,
        content: payosData?.description || body?.content || body?.description,
        description: payosData?.description || body?.description,
        transferAmount: payosData?.amount || body?.transferAmount || body?.amount,
        amount: payosData?.amount || body?.amount,
        gateway: payosData ? 'PAYOS' : (body?.gateway || 'VIETQR'),
        transactionDate: payosData?.transactionDateTime || body?.transactionDate,
        referenceCode: payosData?.reference || body?.referenceCode,
        transferType: body?.transferType,
        eventStatus: payosData ? (body?.success === true || body?.code === '00' ? 'SUCCESS' : 'FAILED') : body?.status,
      };

      if (!payosData && String(rawPayload.transferType || '').toLowerCase() !== 'in') {
        throw new AppError('Chỉ chấp nhận webhook giao dịch tiền vào', 400, 'PAYMENT_TRANSFER_NOT_INCOMING');
      }

      const payload = webhookPaymentSchema.parse(rawPayload);
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
      const userId = (req as AuthRequest).user?.userId;
      if (!userId) throw new AppError('Yêu cầu đăng nhập', 401, 'UNAUTHORIZED');
      const status = await paymentService.getPaymentStatus(orderCode, userId);
      return sendSuccess(res, status);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
