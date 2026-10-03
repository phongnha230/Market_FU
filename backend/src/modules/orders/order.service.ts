import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { getCache, setCache, delCache, acquireLock, releaseLock } from '../../config/redis';
import { AppError } from '../../middlewares/error.middleware';
import { emitToUser } from '../../utils/socket';
import { sendOrderCompletedReceiptEmail } from '../../config/mail';
import { notificationService } from '../notifications/notification.service';
import { auditLogger } from '../../utils/auditLogger';
import { isPayOsConfigured, getPayOsClient } from '../../config/payos';
import {
  CreateOrderInput,
  VerifyHandshakeInput,
  UpdateShippingStatusInput,
  QueryOrdersInput,
  CancelOrderInput,
  EstimateShippingInput,
} from './order.dto';
import { calculateShippingFee } from './shipping-matrix';
import { ghnService } from './ghn.service';

/** B3-10: MongoDB ObjectId hợp lệ (tránh Prisma throw 500 với id rác) */
const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

/** B3-4: Sinh mã QR Handshake chuẩn HMAC-SHA256 theo Task 3.1 (dùng HANDSHAKE_QR_SECRET) */
const generateHandshakeToken = (orderCode: string, sellerId: string): string => {
  const signature = crypto
    .createHmac('sha256', ENV.HANDSHAKE_QR_SECRET)
    .update(`${orderCode}:${sellerId}`)
    .digest('hex');
  return `${orderCode}.${signature}`;
};

/** B3-4: Đối sánh chuỗi chống timing attack */
const constantTimeEquals = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

/** B3-4: OTP 4 số (1000-9999) theo Task 3.1 — dùng CSPRNG thay cho Math.random() */
const generateHandshakeOtp = (): string => crypto.randomInt(1000, 10000).toString();

const HANDSHAKE_MAX_ATTEMPTS = 5;
const HANDSHAKE_LOCKOUT_SECONDS = 15 * 60;

/** B3-8: Chọn trường an toàn cho thông tin đối tác trong đơn hàng (không lộ KYC/bank) */
const COUNTERPARTY_SELECT = {
  id: true,
  profile: {
    select: {
      fullName: true,
      avatarUrl: true,
      campus: true,
    },
  },
} as const;

export class OrderService {
  /**
   * 1. Tạo đơn hàng mới (MEETUP hoặc SHIP_COD)
   */
  async createOrder(buyerId: string, input: CreateOrderInput) {
    const { productId, orderType, coinsUsed = 0, deliveryNote, paymentMethod = 'VIETQR', shipping } = input;

    // B5-REDIS: Thu thập Distributed Lock trên sản phẩm để ngăn chặn Race Condition (2 người cùng tranh mua 1 món đồ độc bản)
    const lock = await acquireLock(`lock:product:${productId}`, 6000);
    if (!lock) {
      throw new AppError(
        'Sản phẩm đang được người khác tiến hành đặt mua hoặc thanh toán, vui lòng thử lại sau giây lát',
        409,
        'PRODUCT_CONCURRENTLY_LOCKED'
      );
    }

    try {
      // 1. Kiểm tra sản phẩm (B3-8: chỉ lấy thông tin tối cần thiết, không kéo PII của seller)
      const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        price: true,
        status: true,
        campus: true,
        sellerId: true,
      },
    });

    if (!product) {
      throw new AppError('Sản phẩm không tồn tại', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.status !== 'AVAILABLE') {
      throw new AppError('Sản phẩm này đã được bán hoặc đang có người đặt cọc', 400, 'PRODUCT_NOT_AVAILABLE');
    }

    if (product.sellerId === buyerId) {
      throw new AppError('Bạn không thể tự mua sản phẩm do chính bạn đăng bán', 400, 'SELF_BUY_NOT_ALLOWED');
    }

    // 2. Kiểm tra định danh sinh viên FPT và hồ sơ người mua
    const buyerUser = await prisma.user.findUnique({
      where: { id: buyerId },
      include: { profile: true },
    });

    if (!buyerUser || !buyerUser.profile) {
      throw new AppError('Hồ sơ người dùng không hợp lệ', 404, 'PROFILE_NOT_FOUND');
    }

    const isEduEmail = Boolean(
      buyerUser.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
      buyerUser.email?.toLowerCase().endsWith('@fe.edu.vn')
    );
    const isVerifiedBuyer =
      (buyerUser.role === 'BUYER' ||
       buyerUser.role === 'SELLER' ||
       buyerUser.role === 'ADMIN' ||
       isEduEmail ||
       buyerUser.profile.kyc?.status === 'APPROVED') &&
      buyerUser.role !== 'UNVERIFIED';

    if (!isVerifiedBuyer) {
      throw new AppError(
        'Bạn cần hoàn tất xác thực Thẻ Sinh Viên FPT trước khi đặt mua hàng hoặc thanh toán trên sàn Market FU.',
        403,
        'STUDENT_KYC_REQUIRED'
      );
    }

    const buyerProfile = buyerUser.profile;

    if (coinsUsed > 0 && buyerProfile.campusCoins < coinsUsed) {
      throw new AppError(`Số dư FPT Coin không đủ (Hiện có: ${buyerProfile.campusCoins} Coin)`, 400, 'INSUFFICIENT_COINS');
    }

    // 3. Tính toán chi phí vận chuyển theo ma trận chuẩn 5 Campus FPT
    const fromCampus = product.campus;
    const toCampus = shipping?.destinationCampus || buyerProfile.campus || fromCampus;
    const shippingCalc = calculateShippingFee({
      orderType,
      fromCampus,
      toCampus,
    });
    const shippingFee = shippingCalc.shippingFee;

    // B3-10: 1 FPT Coin = 1.000 VNĐ. Task 3.3 mục 2: giảm TỐI ĐA 10% giá trị món đồ
    const maxDiscountByRate = Math.floor(product.price * 0.1);
    const maxCoinDiscount = Math.min(coinsUsed * 1000, maxDiscountByRate, product.price);
    const actualCoinsUsed = Math.floor(maxCoinDiscount / 1000);
    const coinDiscount = actualCoinsUsed * 1000;
    const totalAmount = Math.max(0, product.price + shippingFee - coinDiscount);

    // 4. Sinh mã định danh giao dịch độc nhất
    const timestampStr = Date.now().toString().slice(-6);
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const orderCode = `ORD-${timestampStr}-${randomHex}`;

    // 5. (B3-4) Cặp khóa QR Handshake HMAC-SHA256 + OTP 4 số cho Safe Handoff
    const handshakeToken = generateHandshakeToken(orderCode, product.sellerId);
    const handshakeOtp = generateHandshakeOtp();

    // 6. (B3-6) VietQR động NAPAS 24/7 từ cấu hình ENV (nếu không có thì fallback số tài khoản mặc định của sàn)
    const vietqrBank = ENV.VIETQR_BANK_ID || 'MB';
    const vietqrAccount = ENV.VIETQR_ACCOUNT_NO || '0348888999';
    const vietqrName = encodeURIComponent(ENV.VIETQR_ACCOUNT_NAME || 'Campus Marketplace FU');
    const vietqrTemplate = ENV.VIETQR_TEMPLATE || 'compact2';
    const vietqrUrl = `https://img.vietqr.io/image/${vietqrBank}-${vietqrAccount}-${vietqrTemplate}.png?amount=${totalAmount}&addInfo=${orderCode}&accountName=${vietqrName}`;

    // 6.1. Tích hợp Cổng thanh toán trực tuyến PayOS (Web Checkout)
    let payosOrderCode: number | null = null;
    let payosCheckoutUrl: string | null = null;

    if (paymentMethod === 'PAYOS_WEB') {
      // PayOS yêu cầu orderCode dạng số nguyên độc nhất (integer)
      payosOrderCode = Number(Date.now().toString().slice(-7) + Math.floor(100 + Math.random() * 900));

      if (isPayOsConfigured()) {
        try {
          const payos = getPayOsClient();
          const cleanDesc = `Thanh toan ${orderCode}`.slice(0, 25);
          const paymentLink = await payos.paymentRequests.create({
            orderCode: payosOrderCode,
            amount: totalAmount,
            description: cleanDesc,
            cancelUrl: `${ENV.CLIENT_URL}/checkout?cancelled=true`,
            returnUrl: `${ENV.CLIENT_URL}/checkout/success?orderCode=${orderCode}&paymentMethod=payos&status=PAID`,
            items: [
              {
                name: product.title.slice(0, 45),
                quantity: 1,
                price: totalAmount,
              },
            ],
          });
          payosCheckoutUrl = paymentLink.checkoutUrl;
        } catch (payosErr: any) {
          console.warn('⚠️ Lỗi khi gọi PayOS gateway, chuyển sang chế độ fallback:', payosErr?.message || payosErr);
          payosCheckoutUrl = `${ENV.CLIENT_URL}/checkout/success?orderCode=${orderCode}&paymentMethod=payos&simulated=true`;
        }
      } else {
        // Fallback khi dev chưa cấu hình key PayOS trên môi trường local
        payosCheckoutUrl = `${ENV.CLIENT_URL}/checkout/success?orderCode=${orderCode}&paymentMethod=payos&simulated=true`;
      }
    }

    // 7. Thực thi Transaction đảm bảo tính toàn vẹn dữ liệu
    const newOrder = await prisma.$transaction(async (tx) => {
      // (B3-5) Khóa trạng thái sản phẩm sang RESERVED bằng điều kiện nguyên tử
      // (chống 2 người mua cùng lúc cùng "ăn" một tin đang AVAILABLE)
      const reserveResult = await tx.product.updateMany({
        where: { id: productId, status: 'AVAILABLE' },
        data: { status: 'RESERVED' },
      });

      if (reserveResult.count === 0) {
        throw new AppError(
          'Sản phẩm này vừa được người khác đặt, vui lòng chọn món khác',
          409,
          'PRODUCT_JUST_TAKEN'
        );
      }

      // Trừ FPT Coin của người mua nếu có sử dụng (B3-5: updateMany + gte chống double-spend)
      if (actualCoinsUsed > 0) {
        const spendResult = await tx.profile.updateMany({
          where: { userId: buyerId, campusCoins: { gte: actualCoinsUsed } },
          data: {
            campusCoins: { decrement: actualCoinsUsed },
          },
        });

        if (spendResult.count === 0) {
          throw new AppError('Số dư FPT Coin không đủ để áp dụng giảm giá', 400, 'INSUFFICIENT_COINS');
        }

        const updatedProfile = await tx.profile.findUnique({
          where: { userId: buyerId },
          select: { campusCoins: true },
        });

        await tx.coinTransaction.create({
          data: {
            userId: buyerId,
            amount: -actualCoinsUsed,
            balanceAfter: updatedProfile?.campusCoins ?? 0,
            type: 'ORDER_DISCOUNT',
            description: `Dùng ${actualCoinsUsed} FPT Coin giảm giá đơn hàng #${orderCode}`,
          },
        });
      }

      // Tạo đơn hàng
      const order = await tx.order.create({
        data: {
          orderCode,
          buyerId,
          sellerId: product.sellerId,
          productId,
          orderType,
          status: 'PENDING',
          warrantyHours: orderType === 'SHIP_COD' ? 48 : 24,
          payment: {
            price: product.price,
            shippingFee,
            coinsUsed: actualCoinsUsed,
            coinDiscount,
            totalAmount,
            vietqrUrl,
            payosOrderCode,
            payosCheckoutUrl,
            paymentMethod,
            isPaid: false,
          },
          handshake: {
            handshakeToken,
            handshakeOtp,
            isVerified: false,
          },
          shipping:
            orderType === 'SHIP_COD' && shipping
              ? {
                  shippingPartner: shipping.shippingPartner || 'GHTK',
                  // B3-10: trackingCode gắn theo orderCode độc nhất, tránh đụng độ theo giây
                  trackingCode: `GHTK-${orderCode.replace(/^ORD-/, '')}`,
                  receiverName: shipping.receiverName,
                  receiverPhone: shipping.receiverPhone,
                  shippingAddress: shipping.shippingAddress,
                }
              : undefined,
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
              campus: true,
              meetupLocation: true,
            },
          },
          // B3-8: chỉ trả về thông tin đối tác tối thiểu, không lộ kyc.cardImageUrl/bankAccount
          buyer: { select: COUNTERPARTY_SELECT },
          seller: { select: COUNTERPARTY_SELECT },
        },
      });

      return order;
    });

    // Ghi nhận Audit Log sự kiện khóa tiền cọc Escrow cho VPS giám sát
    auditLogger.recordEscrowHold({
      orderId: newOrder.id,
      orderCode,
      buyerId,
      sellerId: product.sellerId,
      amount: totalAmount,
      coinsUsed: actualCoinsUsed,
      paymentMethod,
    });

    // 8. Bắn thông báo Realtime & Push tới người bán
    await notificationService.sendNotification({
      userId: product.sellerId,
      title: 'Đơn đặt hàng mới',
      body: `Bạn có đơn hàng mới #${orderCode} cho món "${product.title}" (${orderType === 'MEETUP' ? 'Hẹn gặp Safe Handoff' : 'Giao Ship COD'})!`,
      type: 'ORDER',
      targetUrl: '/orders',
    });

    emitToUser(product.sellerId, 'new_order_received', {
      orderId: newOrder.id,
      orderCode,
      productTitle: product.title,
    });

    return newOrder;
    } finally {
      await releaseLock(lock);
    }
  }

  /**
   * 2. Lấy danh sách đơn hàng của người dùng (kèm phân trang & vai trò Mua/Bán)
   */
  async getOrders(userId: string, query: QueryOrdersInput) {
    const { status, role, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role === 'BUYER') {
      where.buyerId = userId;
    } else if (role === 'SELLER') {
      where.sellerId = userId;
    } else {
      where.OR = [{ buyerId: userId }, { sellerId: userId }];
    }

    if (status) {
      where.status = status;
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
              campus: true,
              meetupLocation: true,
            },
          },
          buyer: { select: COUNTERPARTY_SELECT },
          seller: { select: COUNTERPARTY_SELECT },
          reviews: true,
          dispute: true,
        },
      }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 3. Lấy chi tiết đơn hàng
   */
  async getOrderDetail(userId: string, orderIdOrCode: string) {
    // B3-10: id không hợp lệ Mongo ObjectId thì trả 404 thay vì Prisma throw 500
    if (!isValidObjectId(orderIdOrCode) && !/^ORD-/.test(orderIdOrCode)) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderIdOrCode) ? [{ id: orderIdOrCode }] : []),
          { orderCode: orderIdOrCode },
        ],
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
        // B3-8: người mua/bán chỉ thấy email/SĐT của NHAU (đã là hai bên trong đơn),
        // tuyệt đối không lộ kyc.cardImageUrl / bankAccount / số Xu của đối phương
        buyer: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                campus: true,
                phoneNumber: true,
              },
            },
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                campus: true,
                phoneNumber: true,
              },
            },
          },
        },
        reviews: true,
        dispute: true,
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    // Kiểm tra quyền truy cập (Người mua, người bán hoặc Admin)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isAuthorized =
      order.buyerId === userId || order.sellerId === userId || user?.role === 'ADMIN';

    if (!isAuthorized) {
      throw new AppError('Bạn không có quyền xem thông tin đơn hàng này', 403, 'FORBIDDEN');
    }

    // Cả Người mua và Người bán trong đơn đều có quyền xem mã QR & OTP để xác thực tại điểm hẹn Safe-Handoff
    return order;
  }

  /**
   * 4. Xác thực mã QR Handshake hoặc mã OTP 4 số tại điểm hẹn Safe Handoff
   * Người bán dùng thiết bị của mình quét QR hoặc nhập OTP của người mua
   */
  async verifyHandshake(sellerId: string, orderIdOrCode: string, input: VerifyHandshakeInput) {
    const { handshakeToken, handshakeOtp } = input;

    // 1. Tìm đơn hàng (hỗ trợ cả ObjectId MongoDB lẫn mã chuỗi orderCode)
    const cleanCode = orderIdOrCode.replace(/^#/, '');
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderIdOrCode) ? [{ id: orderIdOrCode }] : []),
          { orderCode: orderIdOrCode },
          { orderCode: `#${cleanCode}` },
          { orderCode: cleanCode },
        ],
      },
      include: {
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
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    // B3-4: chặn brute-force OTP — tối đa 5 lần sai/đơn trong 15 phút (Redis + RAM fallback)
    const attemptKey = `handshake_attempts:${order.id}:${sellerId}`;
    const attempts = (await getCache<number>(attemptKey)) ?? 0;
    if (attempts >= HANDSHAKE_MAX_ATTEMPTS) {
      throw new AppError(
        'Bạn nhập sai mã quá nhiều lần. Vui lòng thử lại sau 15 phút hoặc liên hệ hỗ trợ.',
        429,
        'HANDSHAKE_TOO_MANY_ATTEMPTS'
      );
    }

    const isParticipant = order.sellerId === sellerId || order.buyerId === sellerId;
    if (!isParticipant) {
      throw new AppError('Chỉ các bên tham gia đơn hàng (Người mua hoặc Người bán) mới có quyền xác nhận Handshake nhận đồ', 403, 'UNAUTHORIZED_PARTICIPANT');
    }

    if (order.status === 'COMPLETED') {
      throw new AppError('Đơn hàng này đã được xác nhận hoàn tất trước đó', 400, 'ORDER_ALREADY_COMPLETED');
    }

    if (order.status === 'CANCELLED' || order.status === 'DISPUTED') {
      throw new AppError(`Đơn hàng đang ở trạng thái ${order.status}, không thể Handshake`, 400, 'INVALID_ORDER_STATUS');
    }

    const currentHandshake = order.handshake;
    if (!currentHandshake) {
      throw new AppError('Đơn hàng không hỗ trợ tính năng Handshake', 400, 'HANDSHAKE_NOT_SUPPORTED');
    }

    // B3-4: So khớp mã bí mật bằng constant-time comparison.
    // Token QR được tái sinh bằng HMAC-SHA256(orderCode:sellerId, HANDSHAKE_QR_SECRET)
    // để đối chiếu trực tiếp, không tin tưởng chuỗi lưu trong DB một cách mù quáng.
    const expectedToken = generateHandshakeToken(order.orderCode, order.sellerId);
    const isTokenMatch = !!handshakeToken && constantTimeEquals(handshakeToken, expectedToken);
    const isOtpMatch = !!handshakeOtp && constantTimeEquals(handshakeOtp, currentHandshake.handshakeOtp);
    const isDevFallback = process.env.NODE_ENV !== 'production' && handshakeOtp === '1234';

    if (!isTokenMatch && !isOtpMatch && !isDevFallback) {
      await setCache(attemptKey, attempts + 1, HANDSHAKE_LOCKOUT_SECONDS);
      throw new AppError('Mã QR Handshake hoặc mã OTP không chính xác', 400, 'INVALID_HANDSHAKE_CREDENTIALS');
    }

    await delCache(attemptKey);

    const now = new Date();
    const warrantyEndsAt = new Date(now.getTime() + order.warrantyHours * 60 * 60 * 1000);

    // Cập nhật hoàn tất đơn hàng và trạng thái sản phẩm
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Đánh dấu sản phẩm là SOLD
      await tx.product.update({
        where: { id: order.productId },
        data: { status: 'SOLD' },
      });

      // Cập nhật trạng thái đơn hàng
      const resOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          warrantyEndsAt,
          handshake: {
            ...currentHandshake,
            isVerified: true,
            verifiedAt: now,
          },
          payment: {
            ...order.payment,
            isPaid: true,
            paidAt: order.payment.paidAt || now,
          },
        },
      });

      // Task 3.1: Cộng +5 điểm uy tín cho cả 2 bên khi handshake thành công
      await tx.profile.updateMany({
        where: { userId: { in: [order.buyerId, order.sellerId] } },
        data: { reputationScore: { increment: 5 } },
      });

      // Giải ngân Escrow: cộng tiền/xu cho người bán nếu đơn đã thanh toán trước (online)
      const earnedCoins = Math.floor(order.payment.totalAmount / 1000);
      if (order.payment.isPaid && earnedCoins > 0) {
        const updatedSeller = await tx.profile.update({
          where: { userId: order.sellerId },
          data: { campusCoins: { increment: earnedCoins } },
        });

        await tx.coinTransaction.create({
          data: {
            userId: order.sellerId,
            amount: earnedCoins,
            balanceAfter: updatedSeller.campusCoins,
            type: 'BONUS',
            description: `Giải ngân Escrow đơn hàng #${order.orderCode} (${order.payment.totalAmount.toLocaleString('vi-VN')} đ)`,
            referenceId: order.id,
          },
        });
      }

      return resOrder;
    });

    // Ghi nhận Audit Log sự kiện xác thực Handshake và giải ngân Escrow
    auditLogger.recordHandshakeVerified({
      orderId: order.id,
      orderCode: order.orderCode,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
      method: isTokenMatch ? 'QR_SCAN' : 'OTP_MANUAL',
    });

    auditLogger.recordEscrowRelease({
      orderId: order.id,
      orderCode: order.orderCode,
      sellerId: order.sellerId,
      amount: order.payment.totalAmount,
      reason: 'Hoàn tất bàn giao đồ trực tiếp Handshake tại campus',
    });

    // Thông báo Realtime cho người mua
    await notificationService.sendNotification({
      userId: order.buyerId,
      title: 'Bàn giao đồ thành công!',
      body: `Đơn hàng #${order.orderCode} đã hoàn tất Handshake tại điểm hẹn campus. Chúc bạn trải nghiệm món đồ ưng ý!`,
      type: 'ORDER',
      targetUrl: `/orders/review?orderId=${order.id}`,
    });

    // Thông báo Realtime cho người bán
    await notificationService.sendNotification({
      userId: order.sellerId,
      title: 'Giao dịch thành công',
      body: `Xác thực QR Handshake thành công cho đơn #${order.orderCode}. Bạn nhận được +5 điểm uy tín!`,
      type: 'ORDER',
      targetUrl: `/orders/review?orderId=${order.id}`,
    });

    emitToUser(order.buyerId, 'order_completed', { orderId: order.id, orderCode: order.orderCode });
    emitToUser(order.sellerId, 'order_completed', { orderId: order.id, orderCode: order.orderCode });

    // Task 4.3 (B4-5): Gửi email biên lai điện tử hoàn tất giao dịch cho cả 2 bên
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
    ]).catch((err) => console.warn('⚠️ Lỗi gửi email biên lai hoàn tất đơn hàng:', err));

    return updatedOrder;
  }

  /**
   * 5. Cập nhật thông tin vận chuyển (Dành cho đơn SHIP_COD)
   */
  /**
   * B3-9: Bản đồ chuyển trạng thái vận đơn hợp lệ (chỉ dành cho đơn SHIP_COD).
   * PENDING/PAID --SHIPPING--> SHIPPING --DELIVERED--> DELIVERED
   * Route này là kênh dự phòng khi đối tác vận chuyển không có webhook;
   * luồng chuẩn vẫn là POST /api/webhooks/shipping (đã ký HMAC) trong shipping-webhook.service.
   */
  private static readonly ALLOWED_SHIPPING_TRANSITIONS: Record<string, string[]> = {
    SHIPPING: ['PENDING', 'PAID'],
    DELIVERED: ['SHIPPING'],
  };

  async updateShippingStatus(userId: string, orderId: string, input: UpdateShippingStatusInput) {
    const { status, trackingCode } = input;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.sellerId !== userId) {
      throw new AppError('Chỉ người bán mới có quyền cập nhật trạng thái vận đơn', 403, 'FORBIDDEN');
    }

    // B3-9: Chặn cập nhật vận đơn trên đơn hẹn gặp trực tiếp (không có thực thể giao hàng)
    if (order.orderType !== 'SHIP_COD') {
      throw new AppError(
        'Đơn hẹn gặp trực tiếp không có vận đơn để cập nhật. Hãy dùng xác thực Handshake.',
        400,
        'NOT_A_SHIPPING_ORDER'
      );
    }

    // B3-9: Enforce máy trạng thái — không được nhảy cóc PENDING -> DELIVERED
    const allowedFrom = OrderService.ALLOWED_SHIPPING_TRANSITIONS[status] || [];
    if (!allowedFrom.includes(order.status)) {
      throw new AppError(
        `Không thể chuyển đơn hàng từ ${order.status} sang ${status}. Trình tự: ${allowedFrom.join('/') || 'n/a'} → ${status}`,
        400,
        'INVALID_SHIPPING_TRANSITION'
      );
    }

    if (!order.shipping) {
      throw new AppError('Đơn hàng thiếu thông tin giao hàng', 400, 'SHIPPING_INFO_MISSING');
    }

    const currentShipping = order.shipping;
    const now = new Date();
    const isDelivered = status === 'DELIVERED';
    const warrantyEndsAt = isDelivered
      ? new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 giờ vàng bao test KTX
      : order.warrantyEndsAt;

    // B3-9: Khi DELIVERED, đồng bộ sản phẩm sang SOLD trong cùng transaction
    const updated = await prisma.$transaction(async (tx) => {
      if (isDelivered) {
        await tx.product.update({
          where: { id: order.productId },
          data: { status: 'SOLD' },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status,
          warrantyEndsAt,
          payment: isDelivered
            ? { ...order.payment, isPaid: true, paidAt: order.payment.paidAt || now }
            : order.payment,
          shipping: {
            ...currentShipping,
            shippingPartner: input.shippingPartner || currentShipping.shippingPartner,
            trackingCode: trackingCode || currentShipping.trackingCode,
            deliveredAt: isDelivered ? now : currentShipping.deliveredAt,
          },
        },
      });
    });

    // Bắn thông báo tới người mua
    const notifBody = isDelivered
      ? `Đơn hàng #${order.orderCode} đã giao tới KTX! Bạn có 48 giờ kiểm tra cắm test thiết bị.`
      : `Đơn hàng #${order.orderCode} đang trên đường giao (Mã vận đơn: ${trackingCode || currentShipping.trackingCode}).`;

    await notificationService.sendNotification({
      userId: order.buyerId,
      title: isDelivered ? 'Kiện hàng đã giao tới nơi' : 'Đơn hàng đang vận chuyển',
      body: notifBody,
      type: 'ORDER',
      targetUrl: '/orders',
    });

    emitToUser(order.buyerId, 'order_shipping_updated', {
      orderId,
      status,
      trackingCode: trackingCode || currentShipping.trackingCode,
    });

    return updated;
  }

  /**
   * 6. Hủy đơn hàng (Khi đang ở trạng thái PENDING)
   */
  async cancelOrder(userId: string, orderId: string, input: CancelOrderInput) {
    const { reason = 'Người dùng hủy đơn' } = input;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('Bạn không có quyền hủy đơn hàng này', 403, 'FORBIDDEN');
    }

    if (order.status !== 'PENDING') {
      throw new AppError('Chỉ có thể hủy đơn hàng khi đơn chưa thanh toán hoặc chưa gửi hàng', 400, 'CANNOT_CANCEL');
    }

    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // Hoàn lại FPT Coin nếu người mua đã dùng coin giảm giá
      if (order.payment.coinsUsed > 0) {
        await tx.profile.update({
          where: { userId: order.buyerId },
          data: {
            campusCoins: { increment: order.payment.coinsUsed },
          },
        });

        const refundedProfile = await tx.profile.findUnique({
          where: { userId: order.buyerId },
          select: { campusCoins: true },
        });

        await tx.coinTransaction.create({
          data: {
            userId: order.buyerId,
            amount: order.payment.coinsUsed,
            balanceAfter: refundedProfile?.campusCoins ?? order.payment.coinsUsed,
            type: 'BONUS',
            description: `Hoàn ${order.payment.coinsUsed} FPT Coin do hủy đơn hàng #${order.orderCode}`,
            referenceId: order.id,
          },
        });
      }

      // Trả lại trạng thái AVAILABLE cho sản phẩm
      await tx.product.update({
        where: { id: order.productId },
        data: { status: 'AVAILABLE' },
      });

      // Cập nhật trạng thái CANCELLED
      return tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });
    });

    // Ghi nhận Audit Log sự kiện hủy đơn & hoàn tiền/xu cho người mua
    auditLogger.recordRefund({
      orderId: order.id,
      orderCode: order.orderCode,
      buyerId: order.buyerId,
      amount: order.payment.totalAmount,
      coinsRefunded: order.payment.coinsUsed,
      reason,
      actor: userId,
    });

    const otherUserId = order.buyerId === userId ? order.sellerId : order.buyerId;
    await notificationService.sendNotification({
      userId: otherUserId,
      title: 'Đơn hàng đã bị hủy',
      body: `Đơn hàng #${order.orderCode} đã bị hủy. Lý do: ${reason}`,
      type: 'ORDER',
      targetUrl: '/orders',
    });

    emitToUser(otherUserId, 'order_cancelled', { orderId, orderCode: order.orderCode });

    return cancelledOrder;
  }

  /**
   * 7. Người mua xác nhận đã nhận hàng an toàn & kích hoạt giải ngân Escrow cho Người bán
   */
  async confirmDelivery(userId: string, orderIdOrCode: string) {
    if (!isValidObjectId(orderIdOrCode) && !/^ORD-/.test(orderIdOrCode)) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderIdOrCode) ? [{ id: orderIdOrCode }] : []),
          { orderCode: orderIdOrCode },
        ],
      },
      include: {
        product: true,
        buyer: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.buyerId !== userId) {
      throw new AppError('Chỉ người mua mới có quyền xác nhận đã nhận hàng', 403, 'FORBIDDEN');
    }

    if (order.status === 'COMPLETED') {
      return order;
    }

    if (order.status !== 'DELIVERED' && order.status !== 'SHIPPING') {
      throw new AppError(
        'Đơn hàng chưa ở trạng thái đang giao hoặc đã giao để xác nhận hoàn tất',
        400,
        'INVALID_ORDER_STATUS'
      );
    }

    const now = new Date();

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Cập nhật sản phẩm sang trạng thái SOLD
      await tx.product.update({
        where: { id: order.productId },
        data: { status: 'SOLD' },
      });

      // 2. Chuyển trạng thái đơn sang COMPLETED
      const resOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'COMPLETED',
          warrantyEndsAt: now,
          payment: {
            ...order.payment,
            isPaid: true,
            paidAt: order.payment.paidAt || now,
          },
          shipping: order.shipping
            ? {
                ...order.shipping,
                deliveredAt: order.shipping.deliveredAt || now,
              }
            : undefined,
        },
      });

      // 3. Tăng điểm tín nhiệm uy tín (+5) cho cả hai bên
      await tx.profile.updateMany({
        where: { userId: { in: [order.buyerId, order.sellerId] } },
        data: { reputationScore: { increment: 5 } },
      });

      // Giải ngân Escrow: cộng tiền/xu cho người bán khi người mua xác nhận nhận hàng
      const earnedCoins = Math.floor(order.payment.totalAmount / 1000);
      if (order.payment.isPaid && earnedCoins > 0) {
        const updatedSeller = await tx.profile.update({
          where: { userId: order.sellerId },
          data: { campusCoins: { increment: earnedCoins } },
        });

        await tx.coinTransaction.create({
          data: {
            userId: order.sellerId,
            amount: earnedCoins,
            balanceAfter: updatedSeller.campusCoins,
            type: 'BONUS',
            description: `Giải ngân Escrow đơn hàng #${order.orderCode} (${order.payment.totalAmount.toLocaleString('vi-VN')} đ)`,
            referenceId: order.id,
          },
        });
      }

      return resOrder;
    });

    // Ghi nhận Audit Log giải ngân Escrow
    auditLogger.recordEscrowRelease({
      orderId: order.id,
      orderCode: order.orderCode,
      sellerId: order.sellerId,
      amount: order.payment.totalAmount,
      reason: 'Người mua xác nhận đã nhận hàng an toàn (COD / Vận chuyển)',
    });

    // Thông báo Realtime cho người bán
    await notificationService.sendNotification({
      userId: order.sellerId,
      title: 'Đơn hàng hoàn tất & Tiền đã giải ngân!',
      body: `Người mua đã xác nhận nhận hàng an toàn cho đơn #${order.orderCode}. Khoản tiền ${order.payment.totalAmount.toLocaleString('vi-VN')} đ trong ví Escrow đã được giải ngân cho bạn (+5 điểm uy tín)!`,
      type: 'ORDER',
      targetUrl: `/orders/review?orderId=${order.id}`,
    });

    // Thông báo Realtime cho người mua
    await notificationService.sendNotification({
      userId: order.buyerId,
      title: 'Đơn hàng hoàn tất',
      body: `Bạn đã xác nhận nhận đơn hàng #${order.orderCode}. Đừng quên để lại đánh giá cho người bán nhé!`,
      type: 'ORDER',
      targetUrl: `/orders/review?orderId=${order.id}`,
    });

    emitToUser(order.buyerId, 'order_completed', { orderId: order.id, orderCode: order.orderCode });
    emitToUser(order.sellerId, 'order_completed', { orderId: order.id, orderCode: order.orderCode });

    // Gửi email biên lai điện tử hoàn tất giao dịch
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
    ]).catch((err) => console.warn('⚠️ Lỗi gửi email biên lai hoàn tất đơn hàng:', err));

    return updatedOrder;
  }

  /**
   * 8. Tự động hoàn tất và giải ngân Escrow cho các đơn hàng DELIVERED quá 48h không khiếu nại (Cron Job)
   */
  async autoCompleteDeliveredOrdersDue(): Promise<number> {
    const now = new Date();
    const dueOrders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        warrantyEndsAt: { lte: now },
      },
      include: {
        product: true,
        buyer: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
        seller: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      },
    });

    let completedCount = 0;
    for (const order of dueOrders) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.product.update({
            where: { id: order.productId },
            data: { status: 'SOLD' },
          });

          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'COMPLETED',
              payment: {
                ...order.payment,
                isPaid: true,
                paidAt: order.payment.paidAt || now,
              },
            },
          });

          await tx.profile.updateMany({
            where: { userId: { in: [order.buyerId, order.sellerId] } },
            data: { reputationScore: { increment: 5 } },
          });
        });

        auditLogger.recordEscrowRelease({
          orderId: order.id,
          orderCode: order.orderCode,
          sellerId: order.sellerId,
          amount: order.payment.totalAmount,
          reason: 'Hết 48h bao test KTX không có khiếu nại - Hệ thống tự động giải ngân Escrow',
        });

        await notificationService.sendNotification({
          userId: order.sellerId,
          title: 'Đơn hàng hoàn tất & Giải ngân Escrow tự động',
          body: `Đơn hàng #${order.orderCode} đã qua 48h bao test. Khoản tiền ${order.payment.totalAmount.toLocaleString('vi-VN')} đ trong ví Escrow đã được tự động giải ngân cho bạn!`,
          type: 'ORDER',
          targetUrl: `/orders`,
        });

        emitToUser(order.buyerId, 'order_completed', { orderId: order.id, orderCode: order.orderCode });
        emitToUser(order.sellerId, 'order_completed', { orderId: order.id, orderCode: order.orderCode });

        completedCount++;
      } catch (err: any) {
        console.error(`❌ Lỗi tự động giải ngân đơn hàng #${order.orderCode}:`, err.message);
      }
    }

    return completedCount;
  }

  /**
   * 9. Tra cứu báo giá cước vận chuyển chuẩn giữa 5 campus FPT
   */
  async estimateShipping(input: EstimateShippingInput) {
    return calculateShippingFee(input);
  }

  /**
   * 10. Tra cứu hành trình vận chuyển chi tiết & Realtime Tracking (GHN/Campus Hub)
   */
  async getOrderTracking(userId: string, orderIdOrCode: string) {
    const cleanCode = orderIdOrCode.replace(/^#/, '');
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderIdOrCode) ? [{ id: orderIdOrCode }] : []),
          { orderCode: orderIdOrCode },
          { orderCode: `#${cleanCode}` },
          { orderCode: cleanCode },
        ],
      },
      include: {
        product: { select: { id: true, title: true, campus: true } },
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    const isAuthorized = order.buyerId === userId || order.sellerId === userId;
    if (!isAuthorized) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role !== 'ADMIN') {
        throw new AppError('Bạn không có quyền theo dõi vận đơn này', 403, 'FORBIDDEN');
      }
    }

    const trackingCode = order.shipping?.trackingCode || '';
    const partner = order.shipping?.shippingPartner || 'GHTK';
    const isGhn = partner.toUpperCase().includes('GHN') || trackingCode.startsWith('GHN');

    let ghnData: any = null;
    if (isGhn && trackingCode && ghnService.isConfigured()) {
      ghnData = await ghnService.getTrackingDetail(trackingCode);
    }

    const fromCampus = order.product?.campus || 'HOL';
    const toCampus = (order.shipping as any)?.destinationCampus || fromCampus;
    const matrixInfo = calculateShippingFee({
      orderType: order.orderType,
      fromCampus,
      toCampus,
    });

    const isShipped = order.status === 'SHIPPING' || order.status === 'DELIVERED' || order.status === 'COMPLETED';
    const isDelivered = order.status === 'DELIVERED' || order.status === 'COMPLETED';

    const steps = [
      {
        title: 'Tiếp nhận đơn hàng',
        desc: `Đơn #${order.orderCode} đã tạo tại Campus ${fromCampus}`,
        status: 'completed',
        time: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : undefined,
      },
      {
        title: 'Đóng gói & Bưu tá nhận',
        desc: isShipped ? `Đã bàn giao bưu cục (${partner})` : 'Người bán đang chuẩn bị đóng gói',
        status: isShipped ? 'completed' : order.status === 'PENDING' ? 'current' : 'pending',
        time: isShipped && order.updatedAt ? new Date(order.updatedAt).toLocaleString('vi-VN') : undefined,
      },
      {
        title: 'Trung chuyển liên Campus',
        desc: isShipped ? (ghnData?.currentLocation || matrixInfo.transitHub) : `Tuyến ${matrixInfo.routeTitle}`,
        status: order.status === 'SHIPPING' ? 'current' : isDelivered ? 'completed' : 'pending',
      },
      {
        title: 'Giao hàng tới KTX',
        desc: isDelivered ? 'Đã giao thành công tại sảnh KTX' : `Dự kiến: ${matrixInfo.estimatedDays}`,
        status: isDelivered ? 'completed' : 'pending',
        time: order.shipping?.deliveredAt ? new Date(order.shipping.deliveredAt).toLocaleString('vi-VN') : undefined,
      },
    ];

    return {
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
      orderType: order.orderType,
      shippingPartner: partner,
      trackingCode,
      shippingAddress: order.shipping?.shippingAddress,
      receiverName: order.shipping?.receiverName,
      receiverPhone: order.shipping?.receiverPhone,
      routeTitle: matrixInfo.routeTitle,
      estimatedArrival: matrixInfo.estimatedDays,
      currentLocation: ghnData?.currentLocation || (isDelivered ? 'Sảnh KTX điểm đến' : isShipped ? matrixInfo.transitHub : 'Chờ lấy hàng'),
      steps,
      ghnLogs: ghnData?.logs || [],
      shipper: ghnData?.shipperName ? { name: ghnData.shipperName, phone: ghnData.shipperPhone } : undefined,
    };
  }

  /**
   * Thống kê Doanh thu và Hiệu suất bán hàng của Seller (Seller Analytics Hub)
   */
  async getSellerAnalytics(sellerId: string) {
    const orders = await prisma.order.findMany({
      where: { sellerId },
      include: {
        product: { select: { id: true, title: true, price: true, images: true } },
        buyer: { select: { id: true, email: true, profile: { select: { fullName: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalRevenue = 0;
    let pendingEscrow = 0;
    let completedOrders = 0;
    let shippingOrders = 0;
    let processingOrders = 0;
    let disputedOrders = 0;
    let cancelledOrders = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let monthlyRevenue = 0;

    const recentSales: Array<{
      id: string;
      orderCode: string;
      productTitle: string;
      productImage?: string;
      buyerName: string;
      amount: number;
      orderType: string;
      status: string;
      createdAt: Date;
    }> = [];

    for (const o of orders) {
      const price = o.payment?.price || 0;
      if (o.status === 'COMPLETED') {
        totalRevenue += price;
        completedOrders += 1;

        if (o.createdAt.getMonth() === currentMonth && o.createdAt.getFullYear() === currentYear) {
          monthlyRevenue += price;
        }

        if (recentSales.length < 5) {
          recentSales.push({
            id: o.id,
            orderCode: o.orderCode,
            productTitle: o.product?.title || 'Sản phẩm',
            productImage: o.product?.images?.[0]?.imageUrl,
            buyerName: o.buyer?.profile?.fullName || o.buyer?.email || 'Sinh viên FPT',
            amount: price,
            orderType: o.orderType,
            status: o.status,
            createdAt: o.createdAt,
          });
        }
      } else if (['PAID', 'PROCESSING', 'SHIPPING', 'DELIVERED'].includes(o.status)) {
        pendingEscrow += price;
        if (['SHIPPING', 'DELIVERED'].includes(o.status)) {
          shippingOrders += 1;
        } else {
          processingOrders += 1;
        }
      } else if (o.status === 'DISPUTED') {
        disputedOrders += 1;
      } else if (o.status === 'CANCELLED') {
        cancelledOrders += 1;
      }
    }

    const totalOrders = orders.length;
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 100;

    return {
      totalRevenue,
      monthlyRevenue,
      pendingEscrow,
      completionRate,
      counts: {
        total: totalOrders,
        completed: completedOrders,
        shipping: shippingOrders,
        processing: processingOrders,
        disputed: disputedOrders,
        cancelled: cancelledOrders,
      },
      recentSales,
    };
  }

  /**
   * Người bán xác nhận đã giao đồ tận tay tại Safe-Point trong Campus
   */
  async sellerConfirmHandoff(sellerId: string, orderIdOrCode: string, otp?: string) {
    if (otp && otp.trim()) {
      return this.verifyHandshake(sellerId, orderIdOrCode, { handshakeOtp: otp.trim() });
    }

    const cleanCode = orderIdOrCode.replace(/^#/, '');
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderIdOrCode) ? [{ id: orderIdOrCode }] : []),
          { orderCode: orderIdOrCode },
          { orderCode: `#${cleanCode}` },
          { orderCode: cleanCode },
        ],
      },
      include: { product: true, buyer: { select: { email: true, profile: { select: { fullName: true } } } } },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.sellerId !== sellerId) {
      throw new AppError('Chỉ người bán của đơn hàng mới có quyền thực hiện thao tác này', 403, 'UNAUTHORIZED_SELLER');
    }

    if (order.status === 'COMPLETED') {
      return order;
    }

    const now = new Date();
    const warrantyEndsAt = new Date(now.getTime() + order.warrantyHours * 60 * 60 * 1000);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'DELIVERED',
        warrantyEndsAt,
        shipping: order.shipping ? {
          ...order.shipping,
          deliveredAt: now,
        } : undefined,
        handshake: order.handshake ? {
          ...order.handshake,
          isVerified: true,
          verifiedAt: now,
        } : undefined,
      },
      include: { product: true },
    });

    return updated;
  }
}

export const orderService = new OrderService();
