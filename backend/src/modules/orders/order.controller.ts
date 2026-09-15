import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { OrderService } from './order.service';
import { WebhookService } from './webhook.service';
import { createOrderSchema, verifyHandshakeSchema, disputeOrderSchema, queryOrdersSchema, shippingWebhookSchema } from './order.dto';
import { sendSuccess, sendPaginated } from '../../utils/response';

const orderService = new OrderService();
const webhookService = new WebhookService();

export class OrderController {
  // POST /api/orders
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(req.user!.userId, validated);
      return sendSuccess(res, order, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders
  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryOrdersSchema.parse(req.query);
      const result = await orderService.getUserOrders(req.user!.userId, query);
      return sendPaginated(res, result.orders, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders/:id
  async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const order = await orderService.getOrderById(req.user!.userId, orderId);
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/orders/:id/handshake
  async verifyHandshake(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const validated = verifyHandshakeSchema.parse(req.body);
      const order = await orderService.verifyHandshake(req.user!.userId, orderId, validated);
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/orders/:id/dispute
  async createDispute(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const validated = disputeOrderSchema.parse(req.body);
      const dispute = await orderService.createDispute(req.user!.userId, orderId, validated);
      return sendSuccess(res, dispute, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/webhooks/shipping (Nhận webhook giao vận từ GHTK/GHN)
  async handleShippingWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-ghtk-signature'] as string || req.headers['x-signature'] as string;
      const rawPayload = (req as any).rawBody || req.body;
      const isValid = webhookService.verifyHmacSignature(rawPayload, signature);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Chữ ký HMAC Webhook không hợp lệ',
          },
        });
      }

      const validated = shippingWebhookSchema.parse(req.body);
      const result = await webhookService.handleShippingWebhook(validated);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
