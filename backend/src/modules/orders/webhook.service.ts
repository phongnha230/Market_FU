import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { AppError } from '../../middlewares/error.middleware';
import { NotificationService } from '../notifications/notification.service';
import { emitToUser } from '../../utils/socket';
import { ShippingWebhookInput } from './order.dto';

const notificationService = new NotificationService();

export class WebhookService {
  // 1. Xác thực Chữ ký bảo mật HMAC-SHA256 từ Webhook đối tác vận chuyển
  verifyHmacSignature(rawBody: Buffer | string | any, signatureHeader?: string): boolean {
    const secret = ENV.SHIPPING_WEBHOOK_SECRET.trim();
    
    // Nếu đối tác không gửi signature header trong môi trường dev, bỏ qua
    if (!signatureHeader) {
      if (ENV.NODE_ENV === 'development') {
        console.warn('⚠️ [Webhook Warning] Bỏ qua xác thực HMAC Signature ở môi trường Development');
        return true;
      }
      return false;
    }

    // Ưu tiên sử dụng Buffer gốc để tính HMAC chính xác theo chuẩn RFC 2104
    const payloadBuffer = Buffer.isBuffer(rawBody)
      ? rawBody
      : typeof rawBody === 'string'
        ? Buffer.from(rawBody, 'utf8')
        : Buffer.from(JSON.stringify(rawBody), 'utf8');

    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadBuffer)
      .digest('hex');

    // Chống timing attack & chống crash do lệch độ dài chuỗi
    if (computedSignature.length !== signatureHeader.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(
        Buffer.from(computedSignature, 'hex'),
        Buffer.from(signatureHeader, 'hex')
      );
    } catch {
      return false;
    }
  }

  // 2. Xử lý cập nhật trạng thái đơn hàng từ Webhook GHTK/GHN (Chống lặp Idempotency)
  async handleShippingWebhook(input: ShippingWebhookInput) {
    const { trackingCode, orderCode, status } = input;

    // Tìm đơn hàng theo trackingCode hoặc orderCode
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { shipping: { is: { trackingCode } } },
          ...(orderCode ? [{ orderCode }] : []),
        ],
      },
      include: {
        product: { select: { id: true, title: true } },
        buyer: { select: { id: true, email: true } },
        seller: { select: { id: true, email: true } },
      },
    });

    if (!order) {
      throw new AppError(`Không tìm thấy đơn hàng tương ứng với mã vận đơn ${trackingCode}`, 404, 'ORDER_NOT_FOUND');
    }

    // Cơ chế chống nhận lặp Webhook (Idempotency):
    // Nếu trạng thái đơn hàng đã được cập nhật trước đó rồi thì kết thúc thành công luôn
    if (order.status === status || (order.status === 'COMPLETED' && status === 'DELIVERED')) {
      console.log(`ℹ️ [Webhook Idempotent] Đơn hàng ${order.orderCode} đã ở trạng thái ${order.status}. Bỏ qua xử lý lặp.`);
      return {
        success: true,
        message: 'Webhook đã được xử lý trước đó (Idempotent OK)',
        orderCode: order.orderCode,
        status: order.status,
      };
    }

    // Khi Shipper thu tiền COD và phát hàng thành công ('DELIVERED')
    if (status === 'DELIVERED') {
      const now = new Date();
      const warrantyEndsAt = new Date(now.getTime() + 48 * 3600 * 1000); // Kích hoạt 48h Bao test

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'DELIVERED',
          warrantyHours: 48,
          warrantyEndsAt,
          payment: {
            set: {
              ...order.payment,
              isPaid: true,
              paidAt: now,
            },
          },
          shipping: order.shipping ? {
            set: {
              ...order.shipping,
              deliveredAt: now,
            },
          } : undefined,
        },
      });

      // Chuyển trạng thái sản phẩm sang 'SOLD'
      await prisma.product.update({
        where: { id: order.productId },
        data: { status: 'SOLD' },
      });

      // Bắn thông báo Realtime & Push FCM cho Người mua
      await notificationService.sendNotification({
        userId: order.buyerId,
        title: '📦 Đơn hàng đã giao thành công!',
        body: `Món đồ "${order.product.title}" đã được giao thành công. Bạn có 48h Bao test đổi trả nếu phát hiện lỗi.`,
        type: 'ORDER',
        targetUrl: `/orders/${order.id}`,
      });

      // Bắn thông báo cho Người bán
      await notificationService.sendNotification({
        userId: order.sellerId,
        title: '💰 Tiền COD đã thu thành công!',
        body: `Đơn hàng "${order.product.title}" đã được giao tới người mua thành công.`,
        type: 'ORDER',
        targetUrl: `/orders/${order.id}`,
      });

      // Emit realtime socket event
      emitToUser(order.buyerId, 'order_status_updated', { orderId: order.id, status: 'DELIVERED' });
      emitToUser(order.sellerId, 'order_status_updated', { orderId: order.id, status: 'DELIVERED' });

      return {
        success: true,
        message: 'Đã cập nhật trạng thái DELIVERED và kích hoạt 48h Bao test thành công',
        orderCode: order.orderCode,
        warrantyEndsAt,
      };
    }

    // Các trạng thái vận chuyển trung gian khác
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: status as any },
    });

    emitToUser(order.buyerId, 'order_status_updated', { orderId: order.id, status });
    emitToUser(order.sellerId, 'order_status_updated', { orderId: order.id, status });

    return {
      success: true,
      message: `Cập nhật trạng thái đơn hàng sang ${status} thành công`,
      orderCode: order.orderCode,
      status,
    };
  }
}
