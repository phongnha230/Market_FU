import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { orderService } from './order.service';
import {
  createOrderSchema,
  verifyHandshakeSchema,
  updateShippingStatusSchema,
  queryOrdersSchema,
  cancelOrderSchema,
  estimateShippingSchema,
  createOrderDisputeSchema,
} from './order.dto';
import { sendSuccess, sendPaginated } from '../../utils/response';

// B3-10: Reuse logic khiếu nại của BE-4 thay vì viết luồng dispute thứ hai
import { reportService } from '../reports/report.service';

export class OrderController {
  /**
   * POST /api/orders
   * Tạo đơn hàng mới
   */
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(req.user!.userId, validated);
      return sendSuccess(res, order, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders
   * Lấy danh sách đơn hàng
   */
  async getOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryOrdersSchema.parse(req.query);
      const { orders, pagination } = await orderService.getOrders(req.user!.userId, query);
      return sendPaginated(res, orders, pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id
   * Xem chi tiết đơn hàng
   */
  async getOrderDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderDetail(req.user!.userId, req.params.id as string);
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/seller/analytics
   * Thống kê doanh thu và đơn hàng của người bán
   */
  async getSellerAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await orderService.getSellerAnalytics(req.user!.userId);
      return sendSuccess(res, analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/orders/:id/handshake
   * Xác thực mã QR Handshake hoặc OTP tại điểm hẹn
   */
  async verifyHandshake(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = verifyHandshakeSchema.parse(req.body);
      const order = await orderService.verifyHandshake(req.user!.userId, req.params.id as string, validated);
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/orders/:id/seller-confirm-handoff
   * Người bán xác nhận đã giao đồ tận tay tại Safe Point
   */
  async sellerConfirmHandoff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.sellerConfirmHandoff(
        req.user!.userId,
        req.params.id as string,
        req.body?.otp
      );
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/orders/:id/confirm-order
   * Người bán xác nhận đồng ý đơn hàng và chốt lịch hẹn gặp
   */
  async sellerConfirmOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.sellerConfirmOrder(
        req.user!.userId,
        req.params.id as string
      );
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/orders/:id/shipping
   * Cập nhật trạng thái vận đơn
   */
  async updateShippingStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateShippingStatusSchema.parse(req.body);
      const order = await orderService.updateShippingStatus(
        req.user!.userId,
        req.params.id as string,
        validated
      );
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/orders/:id/cancel
   * Hủy đơn hàng
   */
  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = cancelOrderSchema.parse(req.body);
      const order = await orderService.cancelOrder(req.user!.userId, req.params.id as string, validated);
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/shipping/estimate
   * Báo giá cước vận chuyển chuẩn giữa các Campus FPT
   */
  async estimateShipping(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = estimateShippingSchema.parse(req.query);
      const estimate = await orderService.estimateShipping(validated);
      return sendSuccess(res, estimate);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/orders/:id/dispute  (Task 3.1)
   * Người mua mở khiếu nại trong thời hạn bao test — ủy quyền cho ReportService (BE-4)
   */
  async createDisputeForOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createOrderDisputeSchema.parse(req.body);
      const dispute = await reportService.createDispute(req.user!.userId, {
        orderId: req.params.id as string,
        reason: validated.reason,
        proofVideoUrl: validated.proofVideoUrl,
      });
      return sendSuccess(res, dispute, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/orders/:id/confirm-delivery
   * Người mua xác nhận đã nhận hàng an toàn & giải phóng Escrow
   */
  async confirmDelivery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.confirmDelivery(req.user!.userId, req.params.id as string);
      return sendSuccess(res, order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id/tracking
   * Lấy chi tiết hành trình vận đơn realtime (GHN/Hub 5 Campus)
   */
  async getOrderTracking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tracking = await orderService.getOrderTracking(req.user!.userId, req.params.id as string);
      return sendSuccess(res, tracking);
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
