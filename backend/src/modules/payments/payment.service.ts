import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { getPayOsClient, isPayOsConfigured } from '../../config/payos';
import { NotificationService } from '../notifications/notification.service';
import { emitToUser } from '../../utils/socket';
import { CreatePayOsLinkInput, PayOsWebhookInput } from './payment.dto';
import { ENV } from '../../config/env';

const notificationService = new NotificationService();

export class PaymentService {
  // 1. [WEB ONLY] Tạo Link thanh toán PayOS Checkout Gateway
  async createPayOsPaymentLink(userId: string, input: CreatePayOsLinkInput) {
    const { orderId, returnUrl, cancelUrl } = input;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: true,
        buyer: { select: { id: true, email: true, profile: { select: { fullName: true, phoneNumber: true } } } },
        seller: { select: { id: true, email: true, profile: { select: { fullName: true, bankAccount: true } } } },
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('Bạn không có quyền thanh toán đơn hàng này', 403, 'FORBIDDEN');
    }

    if (order.payment.isPaid) {
      throw new AppError('Đơn hàng này đã được thanh toán trước đó', 400, 'ORDER_ALREADY_PAID');
    }

    if (order.payment.totalAmount <= 0) {
      throw new AppError('Số tiền thanh toán phải lớn hơn 0', 400, 'INVALID_AMOUNT');
    }

    // Sinh mã orderCode dạng số nguyên duy nhất cho PayOS (PayOS yêu cầu number)
    const payosOrderCode = Number(`${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`);

    // Nội dung chuyển khoản ngân hàng (tối đa 25 ký tự theo chuẩn PayOS)
    const description = `DH ${order.orderCode.slice(-6)}`.slice(0, 25);

    const defaultReturnUrl = returnUrl || `${ENV.CLIENT_URL}/orders/${order.id}?payment=success`;
    const defaultCancelUrl = cancelUrl || `${ENV.CLIENT_URL}/orders/${order.id}?payment=cancelled`;

    let checkoutUrl = '';
    let qrCode = '';

    if (isPayOsConfigured()) {
      try {
        const payOS = getPayOsClient();
        const paymentLinkResponse = await payOS.paymentRequests.create({
          orderCode: payosOrderCode,
          amount: order.payment.totalAmount,
          description,
          returnUrl: defaultReturnUrl,
          cancelUrl: defaultCancelUrl,
          items: [
            {
              name: order.product.title.slice(0, 50),
              quantity: 1,
              price: order.payment.totalAmount,
            },
          ],
          buyerName: order.buyer.profile?.fullName,
          buyerEmail: order.buyer.email,
          buyerPhone: order.buyer.profile?.phoneNumber || undefined,
        });

        checkoutUrl = paymentLinkResponse.checkoutUrl;
        qrCode = paymentLinkResponse.qrCode;
      } catch (error) {
        console.error('❌ [PAYOS ERROR] Lỗi khi gọi PayOS createPaymentLink:', error);
        throw new AppError(
          `Không thể khởi tạo link thanh toán PayOS: ${(error as Error).message}`,
          502,
          'PAYOS_GATEWAY_ERROR'
        );
      }
    } else {
      // Chế độ Sandbox / Dev Simulation khi chưa cấu hình Key PayOS thực tế
      checkoutUrl = `https://pay.payos.vn/web/mock-checkout-${payosOrderCode}`;
      qrCode = `00020101021238540010A000000727012600069704220112${order.seller.profile?.bankAccount?.accountNo || '123456789'}5303704540${order.payment.totalAmount}5802VN62190815${description}6304`;
      console.log('⚠️ [PAYOS DEV] Đang dùng Mock Checkout URL cho môi trường Development:', checkoutUrl);
    }

    // Cập nhật thông tin thanh toán PayOS vào Order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        payment: {
          set: {
            price: order.payment.price,
            shippingFee: order.payment.shippingFee,
            coinsUsed: order.payment.coinsUsed,
            coinDiscount: order.payment.coinDiscount,
            totalAmount: order.payment.totalAmount,
            vietqrUrl: order.payment.vietqrUrl,
            payosOrderCode,
            payosCheckoutUrl: checkoutUrl,
            paymentMethod: 'PAYOS_WEB',
            isPaid: order.payment.isPaid,
            paidAt: order.payment.paidAt,
          },
        },
      },
      include: { product: true },
    });

    return {
      orderId: updatedOrder.id,
      orderCode: updatedOrder.orderCode,
      payosOrderCode,
      totalAmount: updatedOrder.payment.totalAmount,
      checkoutUrl,
      qrCode,
      paymentMethod: 'PAYOS_WEB',
      description,
    };
  }

  // 2. [PAYOS WEBHOOK] Xử lý Webhook IPN tự động xác nhận thanh toán thành công
  async handlePayOsWebhook(body: any) {
    if (!body || !body.data) {
      throw new AppError('Dữ liệu webhook không hợp lệ', 400, 'INVALID_WEBHOOK_PAYLOAD');
    }

    const { code, data, signature } = body;

    // Xác thực chữ ký PayOS nếu đã cấu hình Key
    if (isPayOsConfigured() && signature) {
      try {
        const payOS = getPayOsClient();
        await payOS.webhooks.verify(body);
      } catch (err) {
        console.warn('⚠️ [PAYOS WEBHOOK WARNING] Chữ ký webhook không hợp lệ:', (err as Error).message);
        throw new AppError('Chữ ký PayOS Webhook không hợp lệ', 400, 'INVALID_SIGNATURE');
      }
    }

    // Kiểm tra mã kết quả (code '00' là thanh toán thành công)
    if (code !== '00') {
      return { success: true, message: 'Bỏ qua giao dịch không thành công' };
    }

    const payosOrderCode = Number(data.orderCode);

    // Tìm đơn hàng tương ứng theo payosOrderCode
    const order = await prisma.order.findFirst({
      where: {
        payment: {
          is: {
            payosOrderCode,
          },
        },
      },
      include: {
        product: true,
        buyer: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        seller: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      },
    });

    if (!order) {
      console.warn(`⚠️ [PAYOS WEBHOOK] Không tìm thấy đơn hàng cho payosOrderCode: ${payosOrderCode}`);
      return { success: false, message: 'Không tìm thấy đơn hàng' };
    }

    // Idempotency: Nếu đơn đã thanh toán trước đó -> bỏ qua không xử lý lặp
    if (order.payment.isPaid) {
      return { success: true, message: 'Đơn hàng đã được ghi nhận thanh toán trước đó' };
    }

    const now = new Date();

    // Cập nhật trạng thái đơn hàng sang PAID và isPaid = true
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        payment: {
          set: {
            price: order.payment.price,
            shippingFee: order.payment.shippingFee,
            coinsUsed: order.payment.coinsUsed,
            coinDiscount: order.payment.coinDiscount,
            totalAmount: order.payment.totalAmount,
            vietqrUrl: order.payment.vietqrUrl,
            payosOrderCode: order.payment.payosOrderCode,
            payosCheckoutUrl: order.payment.payosCheckoutUrl,
            paymentMethod: order.payment.paymentMethod || 'PAYOS_WEB',
            isPaid: true,
            paidAt: now,
          },
        },
      },
    });

    // Thông báo cho Người mua
    await notificationService.sendNotification({
      userId: order.buyerId,
      title: '💳 Thanh toán PayOS thành công!',
      body: `Đơn hàng #${order.orderCode} (${order.product.title}) đã thanh toán thành công ${order.payment.totalAmount.toLocaleString('vi-VN')} VNĐ qua PayOS.`,
      type: 'ORDER',
      targetUrl: `/orders/${order.id}`,
    });

    // Thông báo cho Người bán
    await notificationService.sendNotification({
      userId: order.sellerId,
      title: '💰 Người mua đã thanh toán đơn hàng!',
      body: `Người mua đã chuyển khoản thành công ${order.payment.totalAmount.toLocaleString('vi-VN')} VNĐ cho đơn hàng "${order.product.title}".`,
      type: 'ORDER',
      targetUrl: `/orders/${order.id}`,
    });

    // Phát sự kiện Realtime qua Socket.io
    emitToUser(order.buyerId, 'payment_success', {
      orderId: order.id,
      orderCode: order.orderCode,
      paidAt: now,
    });

    emitToUser(order.sellerId, 'order_paid', {
      orderId: order.id,
      orderCode: order.orderCode,
      paidAt: now,
    });

    return {
      success: true,
      message: 'Ghi nhận thanh toán PayOS thành công',
      orderId: order.id,
    };
  }

  // 3. [WEB & ANDROID] Lấy chi tiết phương thức thanh toán của đơn hàng
  async getPaymentInfo(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: { select: { id: true, title: true, price: true, images: true } },
        seller: {
          select: {
            id: true,
            profile: { select: { fullName: true, phoneNumber: true, bankAccount: true } },
          },
        },
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('Bạn không có quyền xem thanh toán của đơn hàng này', 403, 'FORBIDDEN');
    }

    const bankAccount = order.seller.profile?.bankAccount;

    return {
      orderId: order.id,
      orderCode: order.orderCode,
      totalAmount: order.payment.totalAmount,
      isPaid: order.payment.isPaid,
      paidAt: order.payment.paidAt,
      paymentMethod: order.payment.paymentMethod || 'VIETQR',
      // Dành riêng cho Kênh Web: PayOS Checkout Link
      web: {
        payosCheckoutUrl: order.payment.payosCheckoutUrl,
        canCreatePayOsLink: !order.payment.isPaid,
      },
      // Dành riêng cho Kênh Android Mobile Native: VietQR trực tiếp
      android: {
        vietqrUrl: order.payment.vietqrUrl,
        bankName: bankAccount?.bankName,
        accountNo: bankAccount?.accountNo,
        accountName: bankAccount?.accountName,
        transferContent: `DH ${order.orderCode}`,
      },
    };
  }
}
