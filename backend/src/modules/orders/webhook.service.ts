import crypto from 'crypto';
import { OrderStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { getCache, setCache } from '../../config/redis';
import { AppError } from '../../middlewares/error.middleware';
import { emitToUser } from '../../utils/socket';
import { sendOrderCompletedReceiptEmail } from '../../config/mail';
import { notificationService } from '../notifications/notification.service';

/**
 * B3-3 (Task 3.2): Webhook Receiver cho đối tác vận chuyển GHTK/GHN.
 * - Xác thực chữ ký HMAC-SHA256 trên raw body (chống request giả mạo)
 * - Idempotency: cùng 1 sự kiện tracking không xử lý 2 lần
 * - Khi DELIVERED: đơn DELIVERED + sản phẩm SOLD + kích hoạt 48h bao test
 *   + thông báo Realtime & Push cho cả 2 bên.
 */

/** Header chuẩn của GHTK: `Signature` = hmac_sha256(webhook_token, path + body) */
export const verifyShippingWebhookSignature = (
  rawBody: Buffer | undefined,
  signatureHeader?: string,
  path: string = ''
): void => {
  if (!signatureHeader) {
    throw new AppError('Thiếu chữ ký webhook vận chuyển (Signature header)', 401, 'WEBHOOK_SIGNATURE_MISSING');
  }
  if (!rawBody || rawBody.length === 0) {
    throw new AppError('Không tìm thấy raw body để xác thực chữ ký', 400, 'WEBHOOK_RAW_BODY_MISSING');
  }

  const signedPayload = `${path}${rawBody.toString('utf8')}`;
  const expected = crypto
    .createHmac('sha256', ENV.SHIPPING_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');

  const provided = signatureHeader.trim().replace(/^sha256=/i, '');
  const bufA = Buffer.from(provided);
  const bufB = Buffer.from(expected);

  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    throw new AppError('Chữ ký webhook vận chuyển không hợp lệ', 401, 'WEBHOOK_SIGNATURE_INVALID');
  }
};

const WEBHOOK_DEDUPE_TTL = 7 * 24 * 60 * 60; // 7 ngày

/** Payload GHTK gửi sang: { id, order_code, status_report:[{StatusCode,...}], is_spam, report_code, ... }
 *  Payload GHN tương tự với event_code / tracking_order_code / order_status */
export interface ShippingWebhookPayload {
  // GHTK
  id?: string | number;
  order_code?: string;
  status_report?: { ErrorCode?: string | number; ErrorText?: string; Message?: string }[];
  report_code?: string;
  // GHN
  event_code?: string | number;
  event_name?: string;
  tracking_order_code?: string;
  order_status?: string;
  // Chung
  status?: string;
  [key: string]: unknown;
}

/** Chuẩn hóa trạng thái carrier GHTK/GHN về OrderStatus nội bộ */
const mapCarrierStatus = (payload: ShippingWebhookPayload): 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | null => {
  const raw = [
    payload.order_status,
    payload.status,
    ...(payload.status_report?.map((s) => String(s.ErrorCode ?? '')) || []),
    ...(payload.status_report?.map((s) => s.ErrorText ?? '') || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // GHTK: delivery_success / "Giao hàng thành công"; GHN: delivered / order_delivered
  if (/(delivery_success|delivered|giao_hang_thanh_cong|giao hàng thành công|accept_success)/.test(raw)) {
    return 'DELIVERED';
  }
  if (/(delivering|transporting|ship|đang giao|vận chuyển|collect-success|pickup)/.test(raw)) {
    return 'SHIPPING';
  }
  if (/(cancel|hủy|hoan_tra|return)/.test(raw)) {
    return 'CANCELLED';
  }
  return null;
};

export class ShippingWebhookService {
  async processShippingWebhook(payload: ShippingWebhookPayload) {
    // 1. Trích mã đơn hàng MarketFU từ các biến thể field của carrier
    const orderCode =
      payload.order_code ||
      payload.tracking_order_code ||
      payload.report_code ||
      (payload.id !== undefined ? String(payload.id) : undefined);

    if (!orderCode) {
      return { success: false, message: 'Webhook không có mã đơn hàng' };
    }

    // 2. Idempotency: bỏ qua event trùng lặp (carrier thường retry tới 3-5 lần)
    const dedupeKey = `ship_wh:${payload.event_code ?? payload.id ?? ''}:${orderCode}`;
    if (payload.event_code !== undefined || payload.id !== undefined) {
      const seen = await getCache<boolean>(dedupeKey);
      if (seen) {
        return { success: true, message: 'Webhook trùng lặp đã được bỏ qua (idempotent)' };
      }
      await setCache(dedupeKey, true, WEBHOOK_DEDUPE_TTL);
    }

    // 3. Tìm đơn theo orderCode; nếu carrier chỉ gửi trackingCode thì suy ngược
    //    về orderCode theo quy ước nội bộ: trackingCode = "<PARTNER>-<hậu tố orderCode>"
    const orderInclude = {
      product: true,
      buyer: {
        select: {
          email: true,
          profile: { select: { fullName: true } },
        },
      },
      seller: {
        select: {
          email: true,
          profile: { select: { fullName: true } },
        },
      },
    };

    let order = await prisma.order.findFirst({
      where: { orderCode: String(orderCode) },
      include: orderInclude,
    });

    if (!order && payload.tracking_order_code) {
      const derived = `ORD-${String(payload.tracking_order_code).replace(/^[A-Za-z]+-/i, '')}`;
      order = await prisma.order.findFirst({
        where: { orderCode: derived },
        include: orderInclude,
      });
    }

    if (!order) {
      return { success: false, message: `Không tìm thấy đơn ${orderCode}` };
    }

    // 4. Bản đồ trạng thái carrier -> trạng thái nội bộ
    const mapped = mapCarrierStatus(payload);
    if (!mapped) {
      return { success: true, message: 'Sự kiện vận chuyển trung gian, không cần cập nhật', orderCode: order.orderCode };
    }

    // Webhook vận chuyển chỉ áp dụng cho đơn SHIP_COD
    if (order.orderType !== 'SHIP_COD' || !order.shipping) {
      return { success: false, message: 'Đơn hàng không phải dạng Ship COD', orderCode: order.orderCode };
    }

    // 5. Chống lặp/tránh tụt hạng trạng thái:
    //    - Đơn đã COMPLETED/CANCELLED/DELIVERED (chốt) -> mọi webhook chỉ ghi log
    //    - Webhook SHIPPING đến sau khi đã DELIVERED -> bỏ qua
    const TERMINAL: OrderStatus[] = [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.DELIVERED];
    if (TERMINAL.includes(order.status)) {
      return { success: true, message: `Đơn đã ở trạng thái ${order.status}, bỏ qua webhook`, orderCode: order.orderCode };
    }
    if (order.status === mapped) {
      return { success: true, message: 'Trạng thái không đổi, bỏ qua', orderCode: order.orderCode };
    }

    const now = new Date();
    const isDelivered = mapped === 'DELIVERED';

    // 6. Cập nhật trong transaction: đơn + sản phẩm SOLD + COD paid flag
    await prisma.$transaction(async (tx) => {
      // Chỉ cập nhật khi chưa bị xử lý bởi webhook song song khác
      const upd = await tx.order.updateMany({
        where: { id: order.id, status: { notIn: TERMINAL } },
        data: {
          status: mapped,
          ...(isDelivered
            ? {
                warrantyEndsAt: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 48h bao test
                payment: { ...order.payment, isPaid: true, paidAt: order.payment.paidAt || now },
                shipping: {
                  ...order.shipping!,
                  trackingCode: order.shipping?.trackingCode || String(orderCode),
                  deliveredAt: now,
                },
              }
            : {}),
        },
      });

      if (upd.count === 0) {
        throw new AppError('Webhook trùng (đơn vừa chuyển trạng thái)', 409, 'WEBHOOK_RACE_IGNORED');
      }

      if (isDelivered) {
        await tx.product.update({ where: { id: order.productId }, data: { status: 'SOLD' } });
      }
    });

    // 7. Bắn thông báo Realtime & Push FCM cho 2 bên (Task 3.2)
    const title = isDelivered ? '📦 Kiện hàng đã giao thành công' : mapped === 'SHIPPING' ? '🚚 Đơn hàng đang vận chuyển' : '↩️ Đơn hàng bị hủy/hoàn trả';
    const body = isDelivered
      ? `Đơn hàng #${order.orderCode} đã được shipper thu tiền COD và giao thành công. Bạn có 48 giờ bao test kiểm tra món đồ!`
      : `Đơn hàng #${order.orderCode} vừa cập nhật trạng thái: ${mapped} (đối tác ${order.shipping?.shippingPartner || 'GHTK'}).`;

    await Promise.all([
      notificationService.sendNotification({
        userId: order.buyerId,
        title,
        body,
        type: 'ORDER',
        targetUrl: '/orders',
      }),
      notificationService.sendNotification({
        userId: order.sellerId,
        title,
        body,
        type: 'ORDER',
        targetUrl: '/orders',
      }),
    ]);

    emitToUser(order.buyerId, 'order_shipping_updated', { orderId: order.id, orderCode: order.orderCode, status: mapped });
    emitToUser(order.sellerId, 'order_shipping_updated', { orderId: order.id, orderCode: order.orderCode, status: mapped });

    // Task 4.3 (B4-5): Gửi biên lai hoàn tất đơn hàng khi giao hàng thành công
    if (isDelivered) {
      Promise.allSettled([
        order.buyer?.email
          ? sendOrderCompletedReceiptEmail(
              order.buyer.email,
              order.orderCode,
              order.product.title,
              order.payment.totalAmount,
              'BUYER',
              order.buyer.profile?.fullName || 'Sinh viên FU'
            )
          : Promise.resolve(null),
        order.seller?.email
          ? sendOrderCompletedReceiptEmail(
              order.seller.email,
              order.orderCode,
              order.product.title,
              order.payment.totalAmount,
              'SELLER',
              order.seller.profile?.fullName || 'Sinh viên FU'
            )
          : Promise.resolve(null),
      ]).catch((err) => console.warn('⚠️ Lỗi gửi email biên lai giao hàng:', err));
    }

    return { success: true, message: `Cập nhật ${mapped} thành công`, orderCode: order.orderCode };
  }
}

export const shippingWebhookService = new ShippingWebhookService();
