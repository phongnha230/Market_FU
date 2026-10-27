import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { getCache, setCache, delCache, acquireLock, releaseLock } from '../../config/redis';
import { AppError } from '../../middlewares/error.middleware';
import { emitToUser, getIO } from '../../utils/socket';
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
import { CampusLocation, Order } from '@prisma/client';

/** Tự động trích xuất mã Campus FPT từ địa chỉ giao nhận */
export function detectCampusFromAddress(address?: string): CampusLocation | null {
  if (!address) return null;
  const lower = address.toLowerCase();
  if (lower.includes('hòa lạc') || lower.includes('hoa lac') || lower.includes('hà nội') || lower.includes('ha noi') || lower.includes('hol')) {
    return 'HOL';
  }
  if (lower.includes('hồ chí minh') || lower.includes('tp.hcm') || lower.includes('hcm') || lower.includes('quận 9') || lower.includes('thủ đức') || lower.includes('cnc')) {
    return 'HCM';
  }
  if (lower.includes('đà nẵng') || lower.includes('da nang') || lower.includes('dad')) {
    return 'DAD';
  }
  if (lower.includes('quy nhơn') || lower.includes('quy nhon') || lower.includes('bình định') || lower.includes('qn')) {
    return 'QN';
  }
  if (lower.includes('cần thơ') || lower.includes('can tho') || lower.includes('ct')) {
    return 'CT';
  }
  return null;
}

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

/** Bảo vệ mã bí mật Handshake: Chỉ Buyer hoặc Admin mới được nhìn thấy handshakeToken & handshakeOtp */
export const sanitizeOrderHandshake = <T extends { buyerId: string; handshake?: any }>(
  order: T,
  viewerUserId: string,
  isAdmin = false
): T => {
  if (!isAdmin && order.buyerId !== viewerUserId && order.handshake) {
    return {
      ...order,
      handshake: {
        ...order.handshake,
        handshakeToken: null,
        handshakeOtp: null,
      },
    };
  }
  return order;
};

export class OrderService {
  /**
   * 1. Tạo đơn hàng mới (MEETUP hoặc SHIP_COD)
   */
  async createOrder(buyerId: string, input: CreateOrderInput) {
    const {
      productId,
      orderType,
      coinsUsed = 0,
      deliveryNote,
      paymentMethod = 'VIETQR',
      shipping,
      agreedPrice,
      safePoint,
      meetupLocation,
      appointmentTime,
      safePointHubId,
      voucherCode,
      platform,
    } = input;

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
        meetupLocation: true,
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

    // B3-NEGOTIATION: Kiểm tra nếu đơn hàng có áp dụng giá thương lượng (agreedPrice) được người bán chấp thuận trong Chat
    let finalProductPrice = product.price;
    if (agreedPrice !== undefined) {
      if (agreedPrice <= 0 || agreedPrice >= product.price) {
        throw new AppError('Giá thương lượng không hợp lệ so với giá niêm yết', 400, 'INVALID_AGREED_PRICE');
      }
      try {
        const offerExpiryThreshold = new Date(Date.now() - 30 * 60 * 1000);
        const acceptedOffer = {
          conversation: { productId, buyerId },
          senderId: product.sellerId,
          offerPrice: agreedPrice,
          text: { contains: '[OFFER_ACCEPTED]' },
        } as const;
        const verifiedOffer = await prisma.message.findFirst({
          where: { ...acceptedOffer, createdAt: { gte: offerExpiryThreshold } },
          select: { id: true },
        });
        if (!verifiedOffer) {
          const expiredOffer = await prisma.message.findFirst({
            where: { ...acceptedOffer, createdAt: { lt: offerExpiryThreshold } },
            select: { id: true },
          });
          throw new AppError(
            expiredOffer
              ? 'Mức giá thỏa thuận đã hết hiệu lực. Vui lòng thương lượng lại hoặc mua theo giá niêm yết.'
              : 'Người bán chưa chấp nhận đúng mức giá này. Vui lòng kiểm tra lại trong chat.',
            409,
            expiredOffer ? 'OFFER_EXPIRED' : 'OFFER_NOT_ACCEPTED'
          );
        }
        finalProductPrice = agreedPrice;
      } catch (checkErr) {
        if (checkErr instanceof AppError) throw checkErr;
        console.error('Không thể xác minh giá thương lượng', { buyerId, productId, agreedPrice, error: checkErr });
        throw new AppError('Chưa thể xác minh giá thương lượng. Vui lòng thử lại.', 503, 'OFFER_VERIFICATION_UNAVAILABLE');
      }
    }

    // B3-10: 1 FPT Coin = 1.000 VNĐ. Task 3.3 mục 2: giảm TỐI ĐA 10% giá trị món đồ
    const maxDiscountByRate = Math.floor(finalProductPrice * 0.1);
    const maxCoinDiscount = Math.min(coinsUsed * 1000, maxDiscountByRate, finalProductPrice);
    const actualCoinsUsed = Math.floor(maxCoinDiscount / 1000);
    const coinDiscount = actualCoinsUsed * 1000;

    // B3-VOUCHER: Kiểm tra và áp dụng mã giảm giá / Voucher liên Campus
    let voucherDiscount = 0;
    let appliedUserVoucherId: string | null = null;
    if (voucherCode && voucherCode.trim()) {
      const cleanVoucherCode = voucherCode.trim().toUpperCase();
      const userVoucher = await prisma.userVoucher.findUnique({
        where: { voucherCode: cleanVoucherCode },
        include: { voucher: true },
      });

      if (!userVoucher || userVoucher.userId !== buyerId) {
        throw new AppError(
          `Mã voucher "${cleanVoucherCode}" không tồn tại trong ví của bạn. Vui lòng kiểm tra lại hoặc đổi voucher tại kho quà.`,
          400,
          'INVALID_VOUCHER_CODE'
        );
      }

      if (userVoucher.status === 'USED') {
        throw new AppError(
          `Voucher "${userVoucher.voucher?.title || cleanVoucherCode}" đã được sử dụng trước đó. Mỗi voucher chỉ được áp dụng 1 lần duy nhất!`,
          400,
          'VOUCHER_ALREADY_USED'
        );
      }

      const now = new Date();
      if (userVoucher.status === 'EXPIRED' || userVoucher.expiredAt < now) {
        throw new AppError(
          `Voucher "${userVoucher.voucher?.title || cleanVoucherCode}" đã quá hạn sử dụng.`,
          400,
          'VOUCHER_EXPIRED'
        );
      }

      if (!userVoucher.voucher || !userVoucher.voucher.isActive) {
        throw new AppError(
          'Voucher này hiện đang tạm ngưng áp dụng trên hệ thống.',
          400,
          'VOUCHER_INACTIVE'
        );
      }

      // Kiểm tra điều kiện giá trị đơn hàng tối thiểu (minOrderValue)
      const minOrder = userVoucher.voucher.minOrderValue || 0;
      if (minOrder > 0 && finalProductPrice < minOrder) {
        throw new AppError(
          `Voucher "${userVoucher.voucher.title}" chỉ áp dụng cho đơn hàng từ ${minOrder.toLocaleString('vi-VN')} đ trở lên (giá trị sản phẩm hiện tại: ${finalProductPrice.toLocaleString('vi-VN')} đ).`,
          400,
          'VOUCHER_MIN_ORDER_NOT_MET'
        );
      }

      const isShippingVoucher =
        userVoucher.voucher.partner === 'CAMPUS_SHIP' ||
        userVoucher.voucher.partner === 'OTHER' ||
        userVoucher.voucher.title.toLowerCase().includes('vận chuyển') ||
        userVoucher.voucher.title.toLowerCase().includes('ship');

      if (isShippingVoucher) {
        if (orderType === 'MEETUP' || shippingFee <= 0) {
          throw new AppError(
            'Voucher Freeship chỉ áp dụng cho đơn hàng vận chuyển liên Campus!',
            400,
            'VOUCHER_CROSS_CAMPUS_ONLY'
          );
        }
        // Trợ giá cước vận chuyển liên campus: giảm tối đa bằng cước ship thực tế
        voucherDiscount = Math.min(shippingFee, userVoucher.voucher.discountValue);
      } else {
        voucherDiscount = userVoucher.voucher.discountValue;
      }
      appliedUserVoucherId = userVoucher.id;
    }

    const effectivePaymentMethod = paymentMethod === 'PAYOS_WEB' ? 'PAYOS_WEB' : (orderType === 'SHIP_COD' ? 'CASH' : paymentMethod);
    const totalAmount = Math.max(0, finalProductPrice + shippingFee - coinDiscount - voucherDiscount);

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

    // 6.1. Reserve a unique PayOS code before persisting the order. Create the remote link afterwards.
    let payosOrderCode: number | null = null;

    if (effectivePaymentMethod === 'PAYOS_WEB') {
      if (!isPayOsConfigured()) {
        throw new AppError(
          'PayOS chưa được cấu hình. Hãy kiểm tra PAYOS_CLIENT_ID, PAYOS_API_KEY và PAYOS_CHECKSUM_KEY.',
          503,
          'PAYOS_NOT_CONFIGURED'
        );
      }

      // PayOS yêu cầu orderCode dạng số nguyên độc nhất (integer)
      payosOrderCode = Date.now() * 1000 + crypto.randomInt(0, 1000);
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

      // Đánh dấu Voucher đã sử dụng nếu có
      if (appliedUserVoucherId) {
        await tx.userVoucher.update({
          where: { id: appliedUserVoucherId },
          data: { status: 'USED', usedAt: new Date() },
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
          ...(appointmentTime ? { appointmentTime: new Date(appointmentTime) } : {}),
          meetupLocation: meetupLocation || safePoint || (orderType === 'MEETUP' ? product.meetupLocation : undefined),
          safePointHubId: safePointHubId || undefined,
          payment: {
            price: finalProductPrice,
            shippingFee,
            coinsUsed: actualCoinsUsed,
            coinDiscount,
            totalAmount,
            vietqrUrl,
            payosOrderCode,
            payosCheckoutUrl: null,
            appliedUserVoucherId,
            paymentMethod: effectivePaymentMethod,
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
                  shippingPartner: shipping.shippingPartner || 'GHN Express',
                  // trackingCode chỉ được sinh khi người bán bấm Bàn giao bưu cục GHN
                  trackingCode: undefined,
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

    let readyOrder = newOrder;
    if (paymentMethod === 'PAYOS_WEB' && payosOrderCode !== null) {
      const payos = getPayOsClient();
      let checkoutUrl: string;
      try {
        const sourceQuery = platform === 'mobile' ? '&source=mobile' : '';
        const paymentLink = await payos.paymentRequests.create({
          orderCode: payosOrderCode,
          amount: totalAmount,
          description: `Thanh toan ${orderCode}`.slice(0, 25),
          cancelUrl: `${ENV.CLIENT_URL}/checkout/success?appOrderCode=${encodeURIComponent(orderCode)}&paymentMethod=payos&cancelled=true${sourceQuery}`,
          // PayOS appends its own numeric orderCode; keep our order code in a separate parameter.
          returnUrl: `${ENV.CLIENT_URL}/checkout/success?appOrderCode=${encodeURIComponent(orderCode)}&paymentMethod=payos&productId=${encodeURIComponent(product.id)}&amount=${totalAmount}${sourceQuery}`,
          items: [{ name: product.title.slice(0, 45), quantity: 1, price: totalAmount }],
          expiredAt: Math.floor(Date.now() / 1000) + 15 * 60, // 15 phút thời gian chờ thanh toán
        });
        if (!paymentLink.checkoutUrl) throw new Error('PayOS did not return a checkout URL');
        checkoutUrl = paymentLink.checkoutUrl;
      } catch (payosError) {
        console.error('PayOS checkout creation failed', { orderCode, error: payosError });
        let canReleaseReservation = false;
        try {
          const remote = await payos.paymentRequests.cancel(payosOrderCode, 'Order setup failed');
          canReleaseReservation = remote.status === 'CANCELLED';
        } catch (cancelError) {
          const createStatus = (payosError as { status?: number })?.status;
          const cancelStatus = (cancelError as { status?: number })?.status;
          canReleaseReservation = cancelStatus === 404 || [400, 401, 403, 422].includes(createStatus ?? 0);
          console.error('PayOS checkout cleanup result', { orderCode, createStatus, cancelStatus });
        }
        if (canReleaseReservation) {
          await this.cancelPendingOrderInDb(newOrder, 'Không thể khởi tạo PayOS', buyerId);
        }
        throw new AppError(
          canReleaseReservation
            ? 'Không thể tạo liên kết PayOS; đơn đã được hủy và hoàn lại quyền mua.'
            : `Không xác định được trạng thái PayOS cho đơn ${orderCode}. Vui lòng kiểm tra đơn trước khi thử lại.`,
          502,
          canReleaseReservation ? 'PAYOS_CHECKOUT_CREATION_FAILED' : 'PAYOS_CHECKOUT_STATE_UNKNOWN'
        );
      }

      try {
        await prisma.order.update({
          where: { id: newOrder.id },
          data: { payment: { update: { payosCheckoutUrl: checkoutUrl } } },
        });
        readyOrder = {
          ...newOrder,
          payment: { ...newOrder.payment, payosCheckoutUrl: checkoutUrl },
        };
      } catch (persistError) {
        console.error('PayOS link persistence failed', { orderCode, error: persistError });
        try {
          const cancelledLink = await payos.paymentRequests.cancel(payosOrderCode, 'Order persistence failed');
          if (cancelledLink.status === 'CANCELLED') {
            await this.cancelPendingOrderInDb(newOrder, 'Không thể lưu liên kết PayOS', buyerId);
          }
        } catch (cancelError) {
          console.error('PayOS link cancellation after persistence failure failed', { orderCode, error: cancelError });
        }
        throw new AppError(
          `Không thể hoàn tất thanh toán PayOS cho đơn ${orderCode}. Vui lòng kiểm tra đơn trước khi thử lại.`,
          502,
          'PAYOS_CHECKOUT_PERSIST_FAILED'
        );
      }
    }

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
    try {
      await notificationService.sendNotification({
        userId: product.sellerId,
        title: 'Đơn đặt hàng mới',
        body: `Bạn có đơn hàng mới #${orderCode} cho món "${product.title}" (${orderType === 'MEETUP' ? 'Hẹn gặp Safe Handoff' : 'Giao Ship COD'})!`,
        type: 'ORDER',
        targetUrl: '/orders',
      });
    } catch (notificationError) {
      console.error('Order was created but seller notification failed', { orderCode, error: notificationError });
    }

    emitToUser(product.sellerId, 'new_order_received', {
      orderId: newOrder.id,
      orderCode,
      productTitle: product.title,
    });

    // 9. Tự động gửi tin nhắn xác nhận đơn hàng vào khung Chat giữa Người mua & Người bán
    try {
      let conversation = await prisma.conversation.findFirst({
        where: {
          buyerId,
          sellerId: product.sellerId,
          productId: product.id,
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            buyerId,
            sellerId: product.sellerId,
            productId: product.id,
          },
        });
      }

      const orderTypeText = orderType === 'MEETUP' ? 'Hẹn gặp Safe-Handoff' : 'Giao hàng Ship COD';
      const isCodOrder = orderType === 'SHIP_COD' && effectivePaymentMethod === 'CASH';
      const escrowNotice = isCodOrder
        ? 'Thanh toán tiền mặt cho bưu tá khi nhận và đồng kiểm hàng tại sảnh KTX.'
        : 'Tiền cọc Escrow đã được bảo chứng an toàn.';
      const orderMessageText = `[ORDER_CREATED] Đơn hàng #${orderCode} đã được tạo thành công! Tổng tiền: ${totalAmount.toLocaleString('vi-VN')}đ (${orderTypeText}). ${escrowNotice}`;

      const savedMessage = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: buyerId,
          messageType: 'TEXT',
          text: orderMessageText,
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                  campus: true,
                  reputationScore: true,
                },
              },
            },
          },
        },
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageText: `[Đã đặt đơn #${orderCode}]`,
          lastMessageAt: savedMessage.createdAt,
        },
      });

      const io = getIO();
      io?.to(`conversation_${conversation.id}`).emit('receive_message', savedMessage);

      emitToUser(product.sellerId, 'new_message_notification', {
        conversationId: conversation.id,
        productId: product.id,
        senderName: savedMessage.sender?.profile?.fullName || 'Người mua',
        text: `[Đã đặt đơn #${orderCode}]`,
        createdAt: savedMessage.createdAt,
      });
    } catch (chatError) {
      console.error('Order was created but chat message broadcast failed', { orderCode, error: chatError });
    }

    return readyOrder;
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
      orders: orders.map((o) => sanitizeOrderHandshake(o, userId)),
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
    const cleanCode = orderIdOrCode.replace(/^#/, '').trim();
    const isHex = isValidObjectId(orderIdOrCode) || isValidObjectId(cleanCode);
    const isOrderCode = /^ORD-/i.test(cleanCode) || /^ORD-/i.test(orderIdOrCode);

    if (!isHex && !isOrderCode) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isHex ? [{ id: isValidObjectId(orderIdOrCode) ? orderIdOrCode : cleanCode }] : []),
          { orderCode: orderIdOrCode },
          { orderCode: cleanCode },
          { orderCode: `#${cleanCode}` },
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

    const isAdmin = user?.role === 'ADMIN';
    const isAuthorized =
      order.buyerId === userId || order.sellerId === userId || isAdmin;

    if (!isAuthorized) {
      throw new AppError('Bạn không có quyền xem thông tin đơn hàng này', 403, 'FORBIDDEN');
    }

    // Chỉ Người mua (hoặc Admin) mới được xem mã QR & OTP gốc; ẩn khỏi Người bán để chống tự giải ngân Escrow
    return sanitizeOrderHandshake(order, userId, isAdmin);
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

    if (order.orderType !== 'MEETUP') {
      throw new AppError('Đơn giao vận chuyển phải được xác nhận bởi hãng vận chuyển', 400, 'HANDSHAKE_NOT_AVAILABLE_FOR_SHIPPING');
    }

    if (!order.payment.isPaid && order.payment.paymentMethod !== 'CASH') {
      throw new AppError('Cần thanh toán thành công trước khi xác nhận bàn giao', 400, 'PAYMENT_REQUIRED');
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

    if (!isTokenMatch && !isOtpMatch) {
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

      // Giải ngân Escrow: Đơn hàng COMPLETED -> tiền tự động ghi nhận vào Doanh thu Escrow của Người bán
      // (FPT Coin là điểm tích lũy dùng mua hàng, không cộng tiền bán hàng vào campusCoins)

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
    SHIPPING: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPING'],
  };

  async updateShippingStatus(userId: string, orderId: string, input: UpdateShippingStatusInput) {
    const { status, trackingCode } = input;

    const cleanCode = orderId.replace(/^#/, '').trim();
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderId) ? [{ id: orderId }] : []),
          { orderCode: orderId },
          { orderCode: `#${cleanCode}` },
          { orderCode: cleanCode },
        ],
      },
      include: { product: true },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.sellerId !== userId) {
      throw new AppError('Chỉ người bán mới có quyền bàn giao đơn hàng cho hãng vận chuyển', 403, 'FORBIDDEN');
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
    let finalPartner = input.shippingPartner || currentShipping.shippingPartner || 'GHN';
    let finalTrackingCode = trackingCode || currentShipping.trackingCode;

    // Tích hợp trực tiếp với GHN Logistics API v2 khi Seller bấm chuyển đơn sang SHIPPING
    if (status === 'SHIPPING' && ghnService.isConfigured() && finalPartner.toUpperCase().includes('GHN')) {
      try {
        const ghnResult = await ghnService.createShippingOrder({
          orderCode: order.orderCode,
          fromCampus: order.product.campus,
          toCampus: (currentShipping as any).destinationCampus || order.product.campus,
          receiverName: currentShipping.receiverName,
          receiverPhone: currentShipping.receiverPhone,
          receiverAddress: currentShipping.shippingAddress,
          productTitle: order.product.title,
          codAmount: order.payment.totalAmount,
        });

        if (ghnResult?.trackingCode) {
          finalTrackingCode = ghnResult.trackingCode;
          console.log(`✅ [GHN API STAGING] Đã đẩy đơn hàng #${order.orderCode} sang GHN thành công! Mã vận đơn GHN: ${finalTrackingCode}`);
        }
      } catch (ghnErr: any) {
        console.warn('⚠️ [GHN API] Lỗi khi gọi GHN API Staging, tiếp tục sử dụng mã vận đơn dự phòng:', ghnErr?.message || ghnErr);
      }
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status,
        shipping: {
          ...currentShipping,
          shippingPartner: finalPartner,
          trackingCode: finalTrackingCode,
        },
      },
    });

    // Bắn thông báo tới người mua
    const notifBody = `Đơn hàng #${order.orderCode} đang trên đường giao (Mã vận đơn: ${finalTrackingCode}).`;

    await notificationService.sendNotification({
      userId: order.buyerId,
      title: 'Đơn hàng đang vận chuyển',
      body: notifBody,
      type: 'ORDER',
      targetUrl: '/orders',
    });

    emitToUser(order.buyerId, 'order_shipping_updated', {
      orderId,
      status,
      trackingCode: trackingCode || currentShipping.trackingCode,
    });
    emitToUser(order.sellerId, 'order_shipping_updated', {
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

    const cleanCode = orderId.replace(/^#/, '').trim();
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderId) ? [{ id: orderId }] : []),
          { orderCode: orderId },
          { orderCode: `#${cleanCode}` },
          { orderCode: cleanCode },
        ],
      },
      include: { product: true },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('Bạn không có quyền hủy đơn hàng này', 403, 'FORBIDDEN');
    }

    const isMeetupOrder = order.orderType === 'MEETUP' || (order.orderType as string) === 'SAFE_HANDOFF';
    const isCancellable = order.status === 'PENDING' || order.status === 'PAID' || (isMeetupOrder && order.status === 'SHIPPING');
    if (!isCancellable) {
      throw new AppError('Chỉ có thể hủy đơn hàng khi đơn chưa gửi hàng hoặc đang chờ chốt hẹn', 400, 'CANNOT_CANCEL');
    }

    if (order.payment.paymentMethod === 'PAYOS_WEB' && order.payment.payosOrderCode && !order.payment.isPaid) {
      if (!order.payment.payosCheckoutUrl) {
        throw new AppError('Liên kết PayOS đang được khởi tạo, vui lòng thử lại sau', 409, 'PAYOS_SETUP_IN_PROGRESS');
      }
      const payos = getPayOsClient();
      let remoteStatus: string;
      try {
        const remoteOrder = await payos.paymentRequests.cancel(order.payment.payosOrderCode, reason);
        remoteStatus = remoteOrder.status;
      } catch (cancelError) {
        try {
          const remoteOrder = await payos.paymentRequests.get(order.payment.payosOrderCode);
          remoteStatus = remoteOrder.status;
        } catch (lookupError) {
          console.error('Could not verify PayOS cancellation', { orderCode: order.orderCode, cancelError, lookupError });
          throw new AppError('Chưa thể xác nhận hủy thanh toán PayOS. Vui lòng thử lại sau.', 503, 'PAYOS_CANCEL_UNCONFIRMED');
        }
      }
      if (!['CANCELLED', 'EXPIRED', 'FAILED'].includes(remoteStatus)) {
        throw new AppError('PayOS chưa xác nhận hủy; đơn có thể đang được thanh toán', 409, 'PAYOS_PAYMENT_IN_PROGRESS');
      }
    }

    return this.cancelPendingOrderInDb(order, reason, userId);
  }

  private async cancelPendingOrderInDb(order: Order, reason: string, actorId: string) {
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id: order.id, status: { in: ['PENDING', 'PAID', 'SHIPPING'] } },
        data: { status: 'CANCELLED' },
      });
      if (claimed.count !== 1) {
        throw new AppError('Đơn hàng đã đổi trạng thái, không thể hủy hoặc hoàn xu lần nữa', 409, 'ORDER_NOT_PENDING');
      }

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

      if (order.payment.appliedUserVoucherId) {
        await tx.userVoucher.updateMany({
          where: { id: order.payment.appliedUserVoucherId, userId: order.buyerId, status: 'USED' },
          data: { status: 'UNUSED', usedAt: null },
        });
      }

      // Trả lại trạng thái AVAILABLE cho sản phẩm
      await tx.product.updateMany({
        where: { id: order.productId },
        data: { status: 'AVAILABLE' },
      });

      return tx.order.findUniqueOrThrow({ where: { id: order.id } });
    });

    // Ghi nhận Audit Log sự kiện hủy đơn & hoàn tiền/xu cho người mua
    auditLogger.recordRefund({
      orderId: order.id,
      orderCode: order.orderCode,
      buyerId: order.buyerId,
      amount: order.payment.totalAmount,
      coinsRefunded: order.payment.coinsUsed,
      reason,
      actor: actorId,
    });

    const userIdsToNotify =
      actorId === 'SYSTEM'
        ? [order.buyerId, order.sellerId]
        : [order.buyerId === actorId ? order.sellerId : order.buyerId];

    for (const targetUserId of userIdsToNotify) {
      try {
        await notificationService.sendNotification({
          userId: targetUserId,
          title: 'Đơn hàng đã bị hủy',
          body: `Đơn hàng #${order.orderCode} đã bị hủy. Lý do: ${reason}`,
          type: 'ORDER',
          targetUrl: '/orders',
        });
      } catch (notificationError) {
        console.error('Order was cancelled but notification failed', { orderCode: order.orderCode, error: notificationError });
      }
      emitToUser(targetUserId, 'order_cancelled', { orderId: order.id, orderCode: order.orderCode });
    }

    // Tự động đẩy thông báo hủy đơn vào cuộc trò chuyện giữa 2 bên
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          productId: order.productId,
          OR: [
            { buyerId: order.buyerId, sellerId: order.sellerId },
            { buyerId: order.sellerId, sellerId: order.buyerId },
          ],
        },
      });

      if (conversation) {
        const isCod = order.orderType === 'SHIP_COD' || order.payment.paymentMethod === 'CASH';
        const cancelMessageText = isCod
          ? `[ORDER_CANCELLED] Đơn hàng #${order.orderCode} đã bị hủy. Lý do: ${reason}. Đơn hàng COD đã được hủy và sản phẩm đã mở lại cho sinh viên khác.`
          : `[ORDER_CANCELLED] Đơn hàng #${order.orderCode} đã bị hủy. Lý do: ${reason}. Tiền cọc Escrow và sản phẩm đã được tự động hoàn trả.`;
        const senderId = actorId === 'SYSTEM' ? order.sellerId : actorId;

        const savedCancelMessage = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId,
            messageType: 'TEXT',
            text: cancelMessageText,
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                    campus: true,
                    reputationScore: true,
                  },
                },
              },
            },
          },
        });

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageText: `[Đã hủy đơn #${order.orderCode}]`,
            lastMessageAt: savedCancelMessage.createdAt,
          },
        });

        const io = getIO();
        io?.to(`conversation_${conversation.id}`).emit('receive_message', savedCancelMessage);
      }
    } catch (chatError) {
      console.error('Order was cancelled but conversation broadcast failed', {
        orderCode: order.orderCode,
        error: chatError,
      });
    }

    return cancelledOrder;
  }

  /**
   * Quét và tự động hủy các đơn hàng PENDING đã quá hạn thanh toán (mặc định 15 phút)
   * Giải phóng sản phẩm RESERVED -> AVAILABLE, hoàn FPT Coin và Voucher cho người mua.
   */
  async cancelExpiredPendingOrders(ttlMinutes = 15): Promise<number> {
    const cutoffTime = new Date(Date.now() - ttlMinutes * 60 * 1000);
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: cutoffTime },
      },
    });

    let cancelledCount = 0;
    for (const order of expiredOrders) {
      try {
        if (order.payment.paymentMethod === 'PAYOS_WEB' && order.payment.payosOrderCode) {
          try {
            const payos = getPayOsClient();
            await payos.paymentRequests.cancel(
              order.payment.payosOrderCode,
              `Quá hạn thanh toán ${ttlMinutes} phút`
            );
          } catch (payosErr) {
            console.warn(`PayOS cancel notice for expired order ${order.orderCode}:`, payosErr);
          }
        }

        await this.cancelPendingOrderInDb(
          order,
          `Hệ thống tự động hủy do quá hạn thanh toán ${ttlMinutes} phút`,
          'SYSTEM'
        );
        cancelledCount++;
      } catch (err: any) {
        console.error(`Không thể tự động hủy đơn quá hạn ${order.orderCode}:`, err?.message || err);
      }
    }

    return cancelledCount;
  }

  /**
   * 7. Người mua xác nhận đã nhận hàng an toàn & kích hoạt giải ngân Escrow cho Người bán
   */
  async confirmDelivery(userId: string, orderIdOrCode: string) {
    const cleanCode = orderIdOrCode.replace(/^#/, '').trim();
    const isHex = isValidObjectId(orderIdOrCode) || isValidObjectId(cleanCode);
    const isOrderCode = /^ORD-/i.test(cleanCode) || /^ORD-/i.test(orderIdOrCode);

    if (!isHex && !isOrderCode) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isHex ? [{ id: isValidObjectId(orderIdOrCode) ? orderIdOrCode : cleanCode }] : []),
          { orderCode: orderIdOrCode },
          { orderCode: cleanCode },
          { orderCode: `#${cleanCode}` },
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
        'Đơn hàng chưa ở trạng thái đang giao hoặc đã giao',
        400,
        'INVALID_ORDER_STATUS'
      );
    }

    if (order.orderType !== 'SHIP_COD' && !order.payment.isPaid) {
      throw new AppError('Đơn hàng chưa được thanh toán', 400, 'PAYMENT_REQUIRED');
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
          warrantyEndsAt: new Date(now.getTime() + (order.warrantyHours || 48) * 60 * 60 * 1000),
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

      // Giải ngân Escrow: Đơn hàng COMPLETED -> tiền tự động ghi nhận vào Doanh thu Escrow của Người bán
      // (FPT Coin là điểm tích lũy dùng mua hàng, không cộng tiền bán hàng vào campusCoins)
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
        buyer: { select: { id: true, profile: { select: { campus: true } } } },
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
    const addressCampus = detectCampusFromAddress(order.shipping?.shippingAddress);
    const buyerProfileCampus = (order as any).buyer?.profile?.campus as CampusLocation | undefined;
    const toCampus =
      (order.shipping as any)?.destinationCampus ||
      addressCampus ||
      buyerProfileCampus ||
      fromCampus;

    const matrixInfo = calculateShippingFee({
      orderType: order.orderType,
      fromCampus,
      toCampus,
    });

    const hasDispatchedToShipping = Boolean(order.shipping?.trackingCode && order.shipping.trackingCode.trim().length > 0);
    const isShipped = hasDispatchedToShipping && (order.status === 'SHIPPING' || order.status === 'DELIVERED' || order.status === 'COMPLETED');
    const isDelivered = order.status === 'DELIVERED' || order.status === 'COMPLETED';

    const isMeetup =
      order.orderType === 'MEETUP' ||
      (order.orderType as string) === 'SAFE_HANDOFF' ||
      (order.orderType as string) === 'safe-handoff';

    const isPaid = Boolean(order.payment?.isPaid) || (order.payment as any)?.status === 'PAID';
    const isCompleted = order.status === 'COMPLETED';
    const isHandoffReady = order.status === 'PAID' || order.status === 'SHIPPING' || isDelivered;
    const safePointName = order.meetupLocation || (order.shipping as any)?.meetupLocation || (order.product as any)?.subtitle || 'Sảnh chính Tòa Alpha (Tầng 1)';
    const actualAppointment = order.appointmentTime || (order.shipping as any)?.appointmentTime;
    const isSellerConfirmed = order.status === 'SHIPPING' || isDelivered || order.status === 'COMPLETED';

    const isCancelled = order.status === 'CANCELLED';
    const isProcessing = (order.status as any) === 'PROCESSING';

    const steps = isCancelled
      ? [
          {
            title: 'Tiếp nhận đơn hàng',
            desc: `Đơn #${order.orderCode} đã tạo tại Campus ${fromCampus}`,
            status: 'completed',
            time: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : undefined,
          },
          {
            title: 'Đơn hàng đã hủy',
            desc: 'Đơn hàng đã dừng xử lý và hủy thành công. Tiền cọc Escrow (nếu có), xu và voucher đã hoàn lại đầy đủ.',
            status: 'cancelled',
            time: order.updatedAt ? new Date(order.updatedAt).toLocaleString('vi-VN') : undefined,
          },
        ]
      : isMeetup
      ? [
          {
            title: 'Đặt cọc Escrow bảo hộ',
            desc: isPaid
              ? 'Đã đặt cọc 100% vào Quỹ Campus Escrow bảo vệ an toàn'
              : 'Chờ người mua hoàn tất thanh toán cọc Escrow (PayOS / VietQR)',
            status: isPaid ? 'completed' : 'current',
            time: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : undefined,
          },
          {
            title: 'Chốt hẹn Safe-Point',
            desc: actualAppointment
              ? `Lịch hẹn: ${new Date(actualAppointment).toLocaleString('vi-VN')} tại ${safePointName}`
              : `Điểm hẹn: ${safePointName} • Camera AI 24/7`,
            status: isSellerConfirmed ? 'completed' : isPaid ? 'current' : 'pending',
          },
          {
            title: 'Bàn giao & Test máy tại trạm',
            desc: isDelivered
              ? 'Đã đối soát sản phẩm & xác thực mã QR / OTP thành công'
              : 'Gặp mặt đối soát, test máy và xuất trình mã QR / OTP',
            status: isDelivered ? 'completed' : isSellerConfirmed ? 'current' : 'pending',
            time: order.shipping?.deliveredAt ? new Date(order.shipping.deliveredAt).toLocaleString('vi-VN') : undefined,
          },
          {
            title: 'Giải ngân Escrow & Hoàn tất',
            desc: isCompleted
              ? 'Đã giải ngân tiền về ví Người bán • Kích hoạt 48 giờ bao test'
              : 'Tiền cọc Escrow tự động giải ngân về ví Người bán khi bàn giao xong',
            status: isCompleted ? 'completed' : 'pending',
            time: isCompleted && order.updatedAt ? new Date(order.updatedAt).toLocaleString('vi-VN') : undefined,
          },
        ]
      : [
          {
            title: 'Tiếp nhận đơn hàng',
            desc: order.status === 'PENDING'
              ? 'Đơn đã tạo, đang chờ Người bán xác nhận đơn'
              : `Đơn #${order.orderCode} đã tạo tại Campus ${fromCampus}`,
            status: 'completed',
            time: order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : undefined,
          },
          {
            title: 'Đóng gói & Bưu tá nhận',
            desc: isShipped
              ? `Đã bàn giao bưu cục (${partner})`
              : (order.status === 'SHIPPING' || isProcessing || isPaid)
              ? 'Người bán đã nhận đơn & đang đóng gói kiện hàng'
              : 'Chờ người bán xác nhận và đóng gói',
            status: isShipped ? 'completed' : (order.status === 'SHIPPING' || isProcessing || isPaid) ? 'current' : 'pending',
            time: isShipped && order.updatedAt ? new Date(order.updatedAt).toLocaleString('vi-VN') : undefined,
          },
          {
            title: 'Trung chuyển liên Campus',
            desc: isShipped ? (ghnData?.currentLocation || matrixInfo.transitHub) : `Tuyến ${matrixInfo.routeTitle}`,
            status: isDelivered ? 'completed' : isShipped ? 'current' : 'pending',
          },
          {
            title: 'Giao hàng tới KTX',
            desc: isDelivered ? 'Đã giao thành công tại sảnh KTX (Kích hoạt 48h bao test)' : `Dự kiến: ${matrixInfo.estimatedDays}`,
            status: isDelivered ? 'completed' : 'pending',
            time: order.shipping?.deliveredAt ? new Date(order.shipping.deliveredAt).toLocaleString('vi-VN') : undefined,
          },
        ];

    return {
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status,
      orderType: order.orderType,
      shippingPartner: isMeetup ? 'Safe-Point FPT (Giao dịch trực tiếp)' : partner,
      trackingCode: isMeetup
        ? (order.handshake?.handshakeOtp ? `OTP-${order.handshake.handshakeOtp}` : order.orderCode)
        : (order.shipping?.trackingCode || undefined),
      shippingAddress: isMeetup ? safePointName : (order.shipping?.shippingAddress || (order.shipping as any)?.meetupLocation),
      receiverName: order.shipping?.receiverName,
      receiverPhone: order.shipping?.receiverPhone,
      routeTitle: isMeetup
        ? `Điểm hẹn Safe-Point: ${safePointName}`
        : matrixInfo.routeTitle,
      estimatedArrival: isMeetup
        ? (actualAppointment ? new Date(actualAppointment).toLocaleString('vi-VN') : 'Hẹn gặp trực tiếp tại Safe-Point')
        : matrixInfo.estimatedDays,
      currentLocation: isMeetup
        ? (isCompleted ? 'Đã giải ngân Escrow • Hoàn tất' : isDelivered ? 'Đang trong 48h bao test' : 'Sẵn sàng gặp mặt tại Safe-Point')
        : (ghnData?.currentLocation || (isDelivered ? 'Sảnh KTX điểm đến' : isShipped ? matrixInfo.transitHub : 'Chờ lấy hàng')),
      steps,
      ghnLogs: isMeetup ? [] : (ghnData?.logs || []),
      shipper: isMeetup ? undefined : (ghnData?.shipperName ? { name: ghnData.shipperName, phone: ghnData.shipperPhone } : undefined),
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
    let withdrawableEscrowRevenue = 0;
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
      const netEscrow = Math.max(0, (o.payment?.totalAmount || 0) - (o.payment?.shippingFee || 0));
      const isOnlineEscrow =
        o.orderType !== 'SHIP_COD' &&
        ['VIETQR', 'PAYOS_WEB'].includes(o.payment?.paymentMethod || 'VIETQR') &&
        Boolean(o.payment?.isPaid);
      if (o.status === 'COMPLETED') {
        totalRevenue += price;
        withdrawableEscrowRevenue += netEscrow > 0 ? netEscrow : price;
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
        if (isOnlineEscrow) {
          pendingEscrow += price;
        }
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

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { userId: sellerId, status: { in: ['PENDING', 'APPROVED'] } },
      select: { amount: true },
    });
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = Math.max(0, withdrawableEscrowRevenue - totalWithdrawn);

    return {
      totalRevenue,
      monthlyRevenue,
      pendingEscrow,
      availableBalance,
      totalWithdrawn,
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
    if (!otp?.trim()) {
      throw new AppError('Cần mã OTP của người mua để xác nhận bàn giao', 400, 'HANDSHAKE_CREDENTIAL_REQUIRED');
    }

    return this.verifyHandshake(sellerId, orderIdOrCode, { handshakeOtp: otp.trim() });
  }

  /**
   * Người bán xác nhận đồng ý đơn hàng và chốt lịch hẹn gặp Safe-Point
   */
  async sellerConfirmOrder(sellerId: string, orderIdOrCode: string) {
    const cleanCode = orderIdOrCode.replace(/^#/, '').trim();
    const isHex = isValidObjectId(orderIdOrCode) || isValidObjectId(cleanCode);
    const isOrderCode = /^ORD-/i.test(cleanCode) || /^ORD-/i.test(orderIdOrCode);

    if (!isHex && !isOrderCode) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isHex ? [{ id: isValidObjectId(orderIdOrCode) ? orderIdOrCode : cleanCode }] : []),
          { orderCode: orderIdOrCode },
          { orderCode: cleanCode },
          { orderCode: `#${cleanCode}` },
        ],
      },
      include: {
        product: { select: { id: true, title: true, price: true } },
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.sellerId !== sellerId) {
      throw new AppError('Bạn không phải người bán của đơn hàng này', 403, 'FORBIDDEN');
    }

    if (order.status !== 'PENDING' && order.status !== 'PAID') {
      throw new AppError('Đơn hàng này đã được xác nhận hoặc đã kết thúc', 400, 'ORDER_ALREADY_CONFIRMED');
    }

    if (order.payment.paymentMethod !== 'CASH' && !order.payment.isPaid) {
      throw new AppError(
        'Đơn hàng thanh toán trực tuyến cần được người mua thanh toán trước khi xác nhận',
        400,
        'ORDER_PAYMENT_REQUIRED'
      );
    }

    const nextStatus = 'SHIPPING';
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
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
        buyer: { select: COUNTERPARTY_SELECT },
        seller: { select: COUNTERPARTY_SELECT },
      },
    });

    const isInterCampusShipping = order.orderType === 'SHIP_COD';

    // 1. Gửi thông báo tới người mua
    try {
      await notificationService.sendNotification({
        userId: order.buyerId,
        title: isInterCampusShipping ? 'Người bán đã xác nhận đơn hàng!' : 'Người bán đã đồng ý lịch hẹn!',
        body: isInterCampusShipping
          ? `Người bán đã xác nhận đơn #${order.orderCode} và đang chuẩn bị hàng để gửi đơn vị vận chuyển GHN / CampusShip!`
          : `Người bán đã xác nhận đơn #${order.orderCode}. Hẹn gặp bạn tại ${order.meetupLocation || 'Safe-Point'} để bàn giao!`,
        type: 'ORDER',
        targetUrl: '/orders',
      });
    } catch (e) {
      console.error('Notification error on confirm order:', e);
    }

    // 2. Realtime socket event
    emitToUser(order.buyerId, 'order_confirmed', {
      orderId: order.id,
      orderCode: order.orderCode,
      status: nextStatus,
    });
    emitToUser(order.sellerId, 'order_confirmed', {
      orderId: order.id,
      orderCode: order.orderCode,
      status: nextStatus,
    });

    // 3. Tự động gửi tin nhắn chốt hẹn vào khung Chat
    try {
      const conv = await prisma.conversation.findFirst({
        where: {
          buyerId: order.buyerId,
          sellerId: order.sellerId,
          productId: order.productId,
        },
      });
      if (conv) {
        const confirmMsgText = isInterCampusShipping
          ? `[ORDER_SHIPPING_CONFIRMED] Mình đã xác nhận đồng ý đơn hàng #${order.orderCode}! Mình đang đóng gói kiện hàng và sẽ gửi bưu tá GHN / CampusShip sớm nhất để chuyển đến bạn nhé.`
          : `[APPOINTMENT_CONFIRMED] Mình đã xác nhận đồng ý đơn hàng #${order.orderCode} và chốt lịch hẹn! Hẹn gặp bạn tại ${order.meetupLocation || 'Safe-Point'} nhé.`;

        const savedMsg = await prisma.message.create({
          data: {
            conversationId: conv.id,
            senderId: sellerId,
            messageType: 'TEXT',
            text: confirmMsgText,
          },
        });
        await prisma.conversation.update({
          where: { id: conv.id },
          data: {
            lastMessageText: isInterCampusShipping
              ? `[Đã xác nhận đơn hàng #${order.orderCode}]`
              : `[Đã chốt hẹn đơn #${order.orderCode}]`,
            lastMessageAt: savedMsg.createdAt,
          },
        });
        const io = getIO();
        io?.to(`conversation_${conv.id}`).emit('receive_message', savedMsg);
      }
    } catch (chatErr) {
      console.error('Chat confirm broadcast error:', chatErr);
    }

    return updated;
  }
}

export const orderService = new OrderService();
