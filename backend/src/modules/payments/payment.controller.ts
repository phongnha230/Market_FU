import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { PaymentService } from './payment.service';
import { createPayOsLinkSchema, payOsWebhookSchema } from './payment.dto';

const paymentService = new PaymentService();

export class PaymentController {
  // POST /api/payments/payos/create-link
  async createPayOsLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = createPayOsLinkSchema.parse(req.body);
      const result = await paymentService.createPayOsPaymentLink(req.user!.userId, input);
      res.status(201).json({
        success: true,
        message: 'Tạo link thanh toán PayOS thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/payments/payos/webhook
  async handlePayOsWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedBody = payOsWebhookSchema.parse(req.body);
      const result = await paymentService.handlePayOsWebhook(validatedBody);
      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/payments/order/:orderId
  async getPaymentInfo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId as string;
      const result = await paymentService.getPaymentInfo(orderId, req.user!.userId);
      res.json({
        success: true,
        message: 'Lấy thông tin thanh toán thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
