import crypto from 'crypto';
import { OrderStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { getCache, setCache } from '../../config/redis';
import { AppError } from '../../middlewares/error.middleware';
import { emitToUser } from '../../utils/socket';
import { sendOrderCompletedReceiptEmail } from '../../config/mail';
import { notificationService } from '../notifications/notification.service';
import { ghnService } from './ghn.service';

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

export const verifyGhnWebhookToken = (providedToken?: string): void => {
  if (!providedToken) {
    throw new AppError('Thiếu token webhook GHN', 401, 'WEBHOOK_TOKEN_MISSING');
  }

  const provided = Buffer.from(providedToken);
  const expected = Buffer.from(ENV.SHIPPING_WEBHOOK_SECRET);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new AppError('Token webhook GHN không hợp lệ', 401, 'WEBHOOK_TOKEN_INVALID');
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
    (payload as any).Status,
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
  if (/(delivering|transporting|ship|đang giao|vận chuyển|collect-success|pickup|ready_to_pick|picking|storing)/.test(raw)) {
    return 'SHIPPING';
  }
  if (/(cancel|hủy|hoan_tra|return)/.test(raw)) {
    return 'CANCELLED';
  }
  return null;
};

export class ShippingWebhookService {
  async processShippingWebhook(payload: ShippingWebhookPayload, verifyWithGhnApi = false) {
    // 1. Trích mã đơn hàng MarketFU từ các biến thể field của carrier (GHTK/GHN)
    const orderCode =
      payload.order_code ||
      payload.tracking_order_code ||
      payload.report_code ||
      (payload as any).OrderCode ||
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

    const cleanCode = String(orderCode).replace(/^#/, '').trim();
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderCode: String(orderCode) },
          { orderCode: cleanCode },
          { orderCode: `#${cleanCode}` },
        ],
      },
      include: orderInclude,
    });

    if (!order) {
      const searchTerms = [
        String(orderCode || '').trim(),
        String(payload.tracking_order_code || '').trim(),
        String((payload as any).OrderCode || '').trim(),
      ].filter(Boolean);

      // Thử tìm theo mã derived ORD-... nếu đầu vào là mã vận đơn
      for (const term of searchTerms) {
        const derived = `ORD-${term.replace(/^[A-Za-z]+-/i, '')}`;
        order = await prisma.order.findFirst({
          where: { orderCode: derived },
          include: orderInclude,
        });
        if (order) break;
      }

      // Nếu vẫn chưa thấy, tìm trực tiếp qua trackingCode trong shipping của các đơn Ship COD
      if (!order) {
        const candidateOrders = await prisma.order.findMany({
          where: { orderType: 'SHIP_COD', status: { in: ['SHIPPING', 'PENDING', 'PAID'] } },
          include: orderInclude,
          take: 50,
        });

        order = candidateOrders.find((o) => {
          const tc = o.shipping?.trackingCode?.trim();
          if (!tc) return false;
          return searchTerms.some((term) =>
            tc.toLowerCase() === term.toLowerCase() ||
            term.toLowerCase().includes(tc.toLowerCase()) ||
            tc.toLowerCase().includes(term.toLowerCase())
          );
        }) || null;
      }
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

    if (verifyWithGhnApi) {
      if (!ghnService.isConfigured()) {
        throw new AppError('GHN API chưa được cấu hình để xác minh webhook', 503, 'GHN_VERIFICATION_UNAVAILABLE');
      }

      const providerTracking = order.shipping.trackingCode
        ? await ghnService.getTrackingDetail(order.shipping.trackingCode)
        : null;
      const providerStatus = providerTracking ? mapCarrierStatus({ status: providerTracking.status }) : null;
      if (!providerStatus || providerStatus !== mapped) {
        throw new AppError('Trạng thái webhook không khớp với dữ liệu GHN đã xác minh', 401, 'GHN_WEBHOOK_UNVERIFIED');
      }
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
    const isCancelledByCarrier = mapped === 'CANCELLED';
    const carrierName = order.shipping?.shippingPartner || 'GHN';
    const carrierCancelReason = `Đơn vị vận chuyển (${carrierName}) báo hủy giao / hoàn trả kiện hàng`;

    // 6. Cập nhật trong transaction: đơn + sản phẩm SOLD / AVAILABLE + COD paid flag / hoàn xu
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
            : isCancelledByCarrier
            ? {
                cancelledBy: 'SHIPPER',
                cancelReason: carrierCancelReason,
                cancelledAt: now,
              }
            : {}),
        },
      });

      if (upd.count === 0) {
        throw new AppError('Webhook trùng (đơn vừa chuyển trạng thái)', 409, 'WEBHOOK_RACE_IGNORED');
      }

      if (isDelivered) {
        await tx.product.update({ where: { id: order.productId }, data: { status: 'SOLD' } });
      } else if (isCancelledByCarrier) {
        // Mở lại trạng thái Đang bán cho sản phẩm khi bưu tá hủy / hoàn hàng
        await tx.product.updateMany({
          where: { id: order.productId },
          data: { status: 'AVAILABLE' },
        });

        // Hoàn lại FPT Coin nếu người mua đã áp dụng
        if (order.payment?.coinsUsed > 0) {
          await tx.profile.update({
            where: { userId: order.buyerId },
            data: { campusCoins: { increment: order.payment.coinsUsed } },
          });
        }

        if (order.payment?.appliedUserVoucherId) {
          const completedOrderWithVoucher = await tx.order.findFirst({
            where: {
              id: { not: order.id },
              buyerId: order.buyerId,
              status: 'COMPLETED',
              payment: { is: { appliedUserVoucherId: order.payment.appliedUserVoucherId } },
            },
            select: { id: true },
          });

          if (!completedOrderWithVoucher) {
            await tx.userVoucher.updateMany({
              where: { id: order.payment.appliedUserVoucherId, userId: order.buyerId, status: 'USED' },
              data: { status: 'UNUSED', usedAt: null },
            });
          }
        }
      }
    });

    // 7. Bắn thông báo Realtime & Push FCM cho 2 bên (Task 3.2)
    const title = isDelivered
      ? '📦 Kiện hàng đã giao thành công'
      : mapped === 'SHIPPING'
      ? '🚚 Đơn hàng đang vận chuyển'
      : '↩️ Đơn vị vận chuyển báo hủy / hoàn trả';
    const body = isDelivered
      ? `Đơn hàng #${order.orderCode} đã được shipper thu tiền COD và giao thành công. Bạn có 48 giờ bao test kiểm tra món đồ!`
      : isCancelledByCarrier
      ? `Đơn hàng #${order.orderCode} đã bị đơn vị vận chuyển (${carrierName}) hủy giao / hoàn trả kiện hàng. Sản phẩm đã tự động mở bán lại.`
      : `Đơn hàng #${order.orderCode} vừa cập nhật trạng thái: ${mapped} (đối tác ${carrierName}).`;

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
