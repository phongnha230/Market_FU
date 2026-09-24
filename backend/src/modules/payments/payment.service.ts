import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { getCache, setCache } from '../../config/redis';
import { AppError } from '../../middlewares/error.middleware';
import { emitToUser } from '../../utils/socket';
import { notificationService } from '../notifications/notification.service';
import { auditLogger } from '../../utils/auditLogger';
import { WebhookPaymentInput } from './payment.dto';

/**
 * B3-2: Xác thực chữ ký HMAC-SHA256 cho webhook từ gateway thanh toán (SePay / VietQR Bot / PayOS).
 * Gateway ký raw body bằng WEBHOOK_SIGNING_SECRET và gửi lên header:
 *   `x-webhook-signature: sha256=<hex>`  (SePay cũng hỗ trợ header `token` = HMAC hex thuần)
 */
export const verifyPaymentWebhookSignature = (rawBody: Buffer | undefined, signatureHeader?: string): void => {
  const secret = ENV.PAYMENT_WEBHOOK_SECRET;
  if (!signatureHeader) {
    throw new AppError('Thiếu chữ ký webhook (x-webhook-signature)', 401, 'WEBHOOK_SIGNATURE_MISSING');
  }
  if (!rawBody || rawBody.length === 0) {
    throw new AppError('Không tìm thấy raw body để xác thực chữ ký', 400, 'WEBHOOK_RAW_BODY_MISSING');
  }

  const provided = signatureHeader.replace(/^sha256=/i, '').trim();
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const bufA = Buffer.from(provided);
  const bufB = Buffer.from(expected);

  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    throw new AppError('Chữ ký webhook không hợp lệ — request giả mạo bị từ chối', 401, 'WEBHOOK_SIGNATURE_INVALID');
  }
};

/** B3-2: Chống xử lý lặp webhook theo mã giao dịch ngân hàng (idempotency key) */
const PAYMENT_WEBHOOK_DEDUPE_TTL = 7 * 24 * 60 * 60;

export class PaymentService {
  /**
   * 1. Xử lý Webhook thanh toán tự động (SePay / VietQR / PayOS)
   *    - Bắt buộc chữ ký HMAC (controller đã verify trước khi gọi)
   *    - So khớp số tiền thực nhận với totalAmount của đơn
   *    - Idempotency theo referenceCode/transactionDate
   */
  async processPaymentWebhook(payload: WebhookPaymentInput, signatureVerified = false) {
    if (!signatureVerified) {
      throw new AppError('Webhook chưa được xác thực chữ ký', 401, 'WEBHOOK_NOT_VERIFIED');
    }

    const rawContent = payload.content || payload.description || '';
    const transferAmount = Number(payload.transferAmount || payload.amount || 0);

    // Idempotency: cùng 1 giao dịch ngân hàng chỉ xử lý 1 lần
    const dedupeKey = `pay_wh:${payload.referenceCode || payload.transactionDate || ''}:${rawContent.slice(0, 60)}`;
    if (payload.referenceCode || payload.transactionDate) {
      const seen = await getCache<boolean>(dedupeKey);
      if (seen) {
        return { success: true, message: 'Webhook trùng lặp đã được bỏ qua (idempotent)' };
      }
      await setCache(dedupeKey, true, PAYMENT_WEBHOOK_DEDUPE_TTL);
    }

    // Trích xuất mã orderCode từ nội dung chuyển khoản
    let extractedCode = payload.orderCode;
    if (!extractedCode && rawContent) {
      // Tìm mẫu ORD-XXXXXX-XXXX hoặc ORDERXXXXX
      const matchFull = rawContent.match(/ORD-[0-9]{6}-[A-F0-9]{4}/i);
      const matchShort = rawContent.match(/ORDER[0-9]{4,10}/i);
      const matchSimple = rawContent.match(/ORD[0-9]{4,10}/i);

      if (matchFull) {
        extractedCode = matchFull[0].toUpperCase();
      } else if (matchShort) {
        extractedCode = matchShort[0].toUpperCase();
      } else if (matchSimple) {
        extractedCode = matchSimple[0].toUpperCase();
      }
    }

    if (!extractedCode) {
      return {
        success: false,
        message: 'Không tìm thấy mã đơn hàng trong nội dung thanh toán',
        rawContent,
      };
    }

    // Tìm đơn hàng theo mã
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderCode: extractedCode },
          { orderCode: { contains: extractedCode, mode: 'insensitive' } },
        ],
      },
      include: {
        product: true,
      },
    });

    if (!order) {
      return {
        success: false,
        message: `Không tìm thấy đơn hàng với mã ${extractedCode}`,
      };
    }

    // Nếu đơn đã thanh toán hoặc hoàn thành, bỏ qua
    if (order.payment.isPaid || order.status === 'PAID' || order.status === 'COMPLETED') {
      return {
        success: true,
        message: 'Đơn hàng đã được ghi nhận thanh toán trước đó',
        orderCode: order.orderCode,
      };
    }

    // B3-2: Số tiền thực nhận phải khớp totalAmount (cho phép sai số 0đ — chuyển khoản đúng đủ)
    if (!transferAmount || transferAmount < order.payment.totalAmount) {
      return {
        success: false,
        message: `Số tiền nhận (${transferAmount}) nhỏ hơn giá trị đơn (${order.payment.totalAmount}). Không ghi nhận PAID.`,
        orderCode: order.orderCode,
      };
    }

    const now = new Date();

    // Cập nhật trạng thái thanh toán và chuyển status đơn hàng sang PAID (Escrow Hold)
    // B3-2: updateMany có điều kiện chống race giữa 2 webhook song song
    // (chỉ PENDING mới được chuyển PAID; các trạng thái khác do luồng handshake/COD riêng phụ trách)
    const paidResult = await prisma.order.updateMany({
      where: { id: order.id, status: 'PENDING' },
      data: {
        status: 'PAID',
        payment: {
          ...order.payment,
          isPaid: true,
          paidAt: now,
        },
      },
    });

    if (paidResult.count === 0) {
      return {
        success: true,
        message: 'Đơn hàng đã được ghi nhận thanh toán trước đó (bỏ qua webhook trùng)',
        orderCode: order.orderCode,
      };
    }

    const updatedOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });

    // Ghi nhận Audit Log sự kiện webhook thanh toán thành công
    auditLogger.recordPaymentWebhook({
      gateway: 'PAYOS',
      orderCode: order.orderCode,
      transactionId: payload.referenceCode,
      amount: transferAmount,
      isSuccess: true,
      rawCode: payload.referenceCode,
    });

    // Bắn thông báo tới Người mua
    await notificationService.sendNotification({
      userId: order.buyerId,
      title: 'Thanh toán Escrow thành công',
      body: `Đã nhận ${transferAmount.toLocaleString('vi-VN')} đ cho đơn hàng #${order.orderCode}. Tiền được sàn bảo hộ an toàn trong ví Escrow.`,
      type: 'ORDER',
      targetUrl: '/orders',
    });

    // Bắn thông báo tới Người bán
    await notificationService.sendNotification({
      userId: order.sellerId,
      title: 'Người mua đã thanh toán tiền',
      body: `Đơn hàng #${order.orderCode} ("${order.product.title}") đã được thanh toán vào ví Escrow. Bạn hãy chuẩn bị giao đồ nhé!`,
      type: 'ORDER',
      targetUrl: '/orders',
    });

    emitToUser(order.buyerId, 'order_paid', {
      orderId: order.id,
      orderCode: order.orderCode,
      amount: transferAmount,
    });

    emitToUser(order.sellerId, 'order_paid', {
      orderId: order.id,
      orderCode: order.orderCode,
      amount: transferAmount,
    });

    return {
      success: true,
      message: 'Xác nhận thanh toán Escrow thành công',
      orderCode: order.orderCode,
      orderId: order.id,
    };
  }

  /**
   * 2. Kiểm tra trạng thái thanh toán của một đơn hàng
   */
  async getPaymentStatus(orderCode: string) {
    const order = await prisma.order.findUnique({
      where: { orderCode },
      select: {
        id: true,
        orderCode: true,
        status: true,
        payment: true,
        warrantyEndsAt: true,
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    return {
      orderCode: order.orderCode,
      status: order.status,
      isPaid: order.payment.isPaid,
      paidAt: order.payment.paidAt,
      totalAmount: order.payment.totalAmount,
      vietqrUrl: order.payment.vietqrUrl,
    };
  }
}

export const paymentService = new PaymentService();
