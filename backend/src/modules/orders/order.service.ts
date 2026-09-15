import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { AppError } from '../../middlewares/error.middleware';
import { NotificationService } from '../notifications/notification.service';
import { emitToUser } from '../../utils/socket';
import { CreateOrderInput, VerifyHandshakeInput, DisputeOrderInput, QueryOrdersInput } from './order.dto';

const notificationService = new NotificationService();

// Bộ nhớ đệm giới hạn số lần thử OTP Handshake chống tấn công vét cạn (Brute-force)
interface HandshakeAttemptRecord {
  attempts: number;
  lockedUntil?: number;
}
const handshakeAttemptStore = new Map<string, HandshakeAttemptRecord>();

/**
 * So sánh chuỗi an toàn chống Timing Attack bằng SHA-256 Digest cố định 32 bytes
 */
const safeCompare = (a?: string, b?: string): boolean => {
  if (!a || !b) return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
};

export class OrderService {
  // 1. Tạo đơn hàng mới (MEETUP sinh VietQR Napas + QR Handshake; SHIP_COD tích hợp vận chuyển)
  async createOrder(buyerId: string, input: CreateOrderInput) {
    const { productId, orderType, coinsToUse = 0, shippingPartner, receiverName, receiverPhone, shippingAddress } = input;

    // 1. Kiểm tra sản phẩm
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          include: { profile: true },
        },
      },
    });

    if (!product) {
      throw new AppError('Món đồ không tồn tại trên sàn', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.status !== 'AVAILABLE') {
      throw new AppError('Món đồ này hiện không còn khả dụng để đặt mua (đã có người đặt hoặc đã bán)', 400, 'PRODUCT_UNAVAILABLE');
    }

    if (product.sellerId === buyerId) {
      throw new AppError('Bạn không thể tự đặt mua món đồ của chính mình', 400, 'CANNOT_BUY_OWN_PRODUCT');
    }

    // Kiểm tra quy tắc Phương án 3 (Linh hoạt):
    // - Đơn MEETUP tại trường: Sinh viên tự do đặt mua không cần duyệt thẻ SV.
    // - Đơn SHIP_COD giao tận nơi: Bắt buộc người mua phải xác thực Thẻ Sinh Viên (KYC) để phòng chống bom đơn.
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      include: { profile: true },
    });

    if (!buyer) {
      throw new AppError('Người mua không tồn tại', 404, 'BUYER_NOT_FOUND');
    }

    if (orderType === 'SHIP_COD' && buyer.profile?.kyc?.status !== 'APPROVED') {
      throw new AppError(
        'Đơn hàng Ship COD yêu cầu tài khoản người mua phải hoàn tất xác thực Thẻ Sinh Viên (KYC) để đảm bảo uy tín nhận hàng và phòng chống bom đơn. Bạn có thể chọn hình thức Gặp trực tiếp (Meetup) hoặc nộp Thẻ SV tại trang cá nhân.',
        403,
        'KYC_REQUIRED_FOR_COD'
      );
    }

    // 2. Tính toán tài chính & Khấu trừ Xu (Gamification)
    const price = product.price;
    const shippingFee = orderType === 'SHIP_COD' ? 30000 : 0;
    let coinDiscount = 0;

    // Quy tắc nghiệp vụ BR:
    // Chỉ đơn SHIP_COD hoặc đơn thanh toán qua sàn mới được dùng Xu (tối đa 10% giá trị món đồ).
    // Đơn MEETUP gặp trực tiếp trả tiền mặt cho người bán nên không dùng Xu để tránh thất thoát tiền mặt của seller.
    if (coinsToUse > 0) {
      if (orderType === 'MEETUP') {
        throw new AppError(
          'Giao dịch trực tiếp (Meetup) thanh toán tiền mặt/chuyển khoản trực tiếp cho người bán, không áp dụng khấu trừ Xu sàn.',
          400,
          'COIN_NOT_APPLICABLE_FOR_MEETUP'
        );
      }

      const currentCoins = buyer?.profile?.campusCoins || 0;
      if (coinsToUse > currentCoins) {
        throw new AppError(
          `Số dư Xu của bạn (${currentCoins} Xu) không đủ để sử dụng ${coinsToUse} Xu`,
          400,
          'INSUFFICIENT_COINS'
        );
      }

      const maxAllowedCoinDiscount = Math.round(price * 0.1); // Tối đa 10%
      if (coinsToUse > maxAllowedCoinDiscount) {
        throw new AppError(
          `Bạn chỉ được dùng tối đa ${maxAllowedCoinDiscount} Xu (10% giá trị món đồ) cho đơn hàng này`,
          400,
          'EXCEEDED_MAX_COIN_DISCOUNT'
        );
      }

      coinDiscount = coinsToUse; // 1 Xu = 1 VNĐ
    }

    const totalAmount = Math.max(0, price + shippingFee - coinDiscount);

    // 3. Sinh mã đơn hàng độc nhất: ORD-xxxxxx
    const orderCode = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 4. Sinh mã VietQR động Napas 247
    const sellerProfile = product.seller.profile;
    const bankName = sellerProfile?.bankAccount?.bankName || 'MB';
    const accountNo = sellerProfile?.bankAccount?.accountNo || '0987654321';
    const accountName = encodeURIComponent(sellerProfile?.bankAccount?.accountName || sellerProfile?.fullName || 'NGUYEN VAN A');
    const vietqrUrl = `https://img.vietqr.io/image/${bankName}-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=${orderCode}&accountName=${accountName}`;

    // 5. Sinh bảo mật QR Handshake (HMAC-SHA256) & mã 4 số OTP fallback
    const handshakeSecret = ENV.HANDSHAKE_QR_SECRET || ENV.JWT_SECRET;
    const handshakeToken = crypto
      .createHmac('sha256', handshakeSecret)
      .update(`${orderCode}_${product.sellerId}_${Date.now()}`)
      .digest('hex');
    const handshakeOtp = Math.floor(1000 + Math.random() * 9000).toString();

    // 6. Thông tin vận chuyển
    const trackingCode = orderType === 'SHIP_COD' ? `GHTK_${orderCode}` : null;

    // 7. Lưu đơn hàng vào MongoDB qua Prisma Transaction
    const order = await prisma.$transaction(async (tx) => {
      // Trừ xu người mua và ghi sổ cái CoinTransaction nếu có sử dụng
      if (coinsToUse > 0) {
        await tx.profile.update({
          where: { userId: buyerId },
          data: { campusCoins: { decrement: coinsToUse } },
        });

        const buyerProfile = await tx.profile.findUnique({ where: { userId: buyerId } });
        await tx.coinTransaction.create({
          data: {
            userId: buyerId,
            amount: -coinsToUse,
            balanceAfter: buyerProfile?.campusCoins || 0,
            type: 'ORDER_DISCOUNT',
            description: `Khấu trừ ${coinsToUse} Xu thanh toán đơn hàng #${orderCode}`,
          },
        });
      }

      // Khóa tạm bài đăng sang trạng thái RESERVED
      await tx.product.update({
        where: { id: productId },
        data: { status: 'RESERVED' },
      });

      // Tạo Order
      return tx.order.create({
        data: {
          orderCode,
          buyerId,
          sellerId: product.sellerId,
          productId,
          orderType,
          status: 'PENDING',
          payment: {
            price,
            shippingFee,
            coinsUsed: coinsToUse,
            coinDiscount,
            totalAmount,
            vietqrUrl,
            isPaid: false,
          },
          handshake: {
            handshakeToken,
            handshakeOtp,
            isVerified: false,
          },
          shipping: orderType === 'SHIP_COD' ? {
            shippingPartner: shippingPartner || 'GHTK',
            trackingCode,
            receiverName: receiverName!,
            receiverPhone: receiverPhone!,
            shippingAddress: shippingAddress!,
          } : undefined,
          warrantyHours: 24,
        },
        include: {
          product: { select: { id: true, title: true, price: true, images: true } },
          buyer: { select: { id: true, email: true, profile: { select: { fullName: true, phoneNumber: true } } } },
          seller: { select: { id: true, email: true, profile: { select: { fullName: true, phoneNumber: true } } } },
        },
      });
    });

    // 8. Bắn thông báo cho Người bán biết có đơn hàng mới
    await notificationService.sendNotification({
      userId: product.sellerId,
      title: '🛒 Bạn có đơn đặt mua mới!',
      body: `Sinh viên đã đặt mua món đồ "${product.title}". Vui lòng kiểm tra mã QR Handshake để bàn giao đồ.`,
      type: 'ORDER',
      targetUrl: `/orders/${order.id}`,
    });

    emitToUser(product.sellerId, 'new_order_received', order);

    return order;
  }

  // 2. Xác thực QR Handshake (Người mua quét QR hoặc nhập OTP của người bán)
  async verifyHandshake(userId: string, orderId: string, input: VerifyHandshakeInput) {
    const { token, otp } = input;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: true,
        buyer: { include: { profile: true } },
        seller: { include: { profile: true } },
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.status === 'COMPLETED') {
      throw new AppError('Đơn hàng này đã được xác thực hoàn tất trước đó', 400, 'ORDER_ALREADY_COMPLETED');
    }

    if (order.buyerId !== userId) {
      throw new AppError('Chỉ người mua mới có quyền quét mã QR hoặc nhập OTP để hoàn tất giao dịch Handshake', 403, 'FORBIDDEN');
    }

    const handshake = order.handshake;
    if (!handshake) {
      throw new AppError('Đơn hàng không có mã QR Handshake', 400, 'NO_HANDSHAKE_DATA');
    }

    // Kiểm tra khóa tạm thời do vét cạn OTP (Brute-force protection)
    const attemptKey = `handshake_${orderId}`;
    const nowMs = Date.now();
    const attemptRecord = handshakeAttemptStore.get(attemptKey);

    if (attemptRecord?.lockedUntil && attemptRecord.lockedUntil > nowMs) {
      const waitMinutes = Math.ceil((attemptRecord.lockedUntil - nowMs) / 60000);
      throw new AppError(
        `Chức năng xác thực bị tạm khóa do nhập sai quá 5 lần. Vui lòng thử lại sau ${waitMinutes} phút.`,
        429,
        'TOO_MANY_HANDSHAKE_ATTEMPTS'
      );
    }

    // So sánh chuỗi an toàn chống Timing Attack
    const isTokenMatch = safeCompare(token, handshake.handshakeToken);
    const isOtpMatch = safeCompare(otp, handshake.handshakeOtp);

    if (!isTokenMatch && !isOtpMatch) {
      const currentAttempts = (attemptRecord?.attempts || 0) + 1;
      if (currentAttempts >= 5) {
        handshakeAttemptStore.set(attemptKey, {
          attempts: currentAttempts,
          lockedUntil: nowMs + 15 * 60 * 1000, // Tạm khóa 15 phút
        });
        throw new AppError(
          'Bạn đã nhập sai mã OTP Handshake quá 5 lần liên tiếp. Giao dịch bị tạm khóa 15 phút.',
          429,
          'TOO_MANY_HANDSHAKE_ATTEMPTS'
        );
      }

      handshakeAttemptStore.set(attemptKey, { attempts: currentAttempts });
      throw new AppError(
        `Mã QR Handshake hoặc mã OTP 4 số không chính xác. Bạn còn ${5 - currentAttempts} lần thử.`,
        400,
        'INVALID_HANDSHAKE'
      );
    }

    // Xóa bộ nhớ đếm khi xác thực thành công
    handshakeAttemptStore.delete(attemptKey);

    const now = new Date();
    const warrantyEndsAt = new Date(now.getTime() + 24 * 3600 * 1000); // 24h Bao test

    // Thực hiện hoàn tất đơn hàng trong Transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Cập nhật Order COMPLETED
      const resOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          warrantyHours: 24,
          warrantyEndsAt,
          handshake: {
            set: {
              handshakeToken: handshake.handshakeToken,
              handshakeOtp: handshake.handshakeOtp,
              isVerified: true,
              verifiedAt: now,
            },
          },
          payment: {
            set: {
              price: order.payment.price,
              shippingFee: order.payment.shippingFee,
              coinsUsed: order.payment.coinsUsed,
              coinDiscount: order.payment.coinDiscount,
              totalAmount: order.payment.totalAmount,
              vietqrUrl: order.payment.vietqrUrl,
              isPaid: true,
              paidAt: now,
            },
          },
        },
      });

      // Chuyển bài đăng sang SOLD
      await tx.product.update({
        where: { id: order.productId },
        data: { status: 'SOLD' },
      });

      // Business Rule BR: Thưởng +5 điểm uy tín cho cả Người mua & Người bán
      await tx.profile.updateMany({
        where: { userId: { in: [order.buyerId, order.sellerId] } },
        data: { reputationScore: { increment: 5 } },
      });

      return resOrder;
    });

    // Thông báo cho cả 2 bên
    await notificationService.sendNotification({
      userId: order.buyerId,
      title: '🎉 Giao dịch thành công!',
      body: `Bạn đã nhận món đồ "${order.product.title}". Bạn có 24h Bao test. Cả 2 bạn được cộng +5 điểm uy tín!`,
      type: 'ORDER',
      targetUrl: `/orders/${order.id}`,
    });

    await notificationService.sendNotification({
      userId: order.sellerId,
      title: '🎉 Bàn giao thành công!',
      body: `Giao dịch món đồ "${order.product.title}" đã hoàn tất. Bạn được cộng +5 điểm uy tín!`,
      type: 'ORDER',
      targetUrl: `/orders/${order.id}`,
    });

    emitToUser(order.buyerId, 'order_status_updated', { orderId: order.id, status: 'COMPLETED' });
    emitToUser(order.sellerId, 'order_status_updated', { orderId: order.id, status: 'COMPLETED' });

    return updatedOrder;
  }

  // 3. Mở khiếu nại (Dispute) trong thời hạn Bao test (Kèm link video test lỗi)
  async createDispute(buyerId: string, orderId: string, input: DisputeOrderInput) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.buyerId !== buyerId) {
      throw new AppError('Chỉ người mua mới có quyền mở khiếu nại đơn hàng này', 403, 'FORBIDDEN');
    }

    // Kiểm tra thời hạn bảo hành bao test
    if (!order.warrantyEndsAt || new Date() > order.warrantyEndsAt) {
      throw new AppError(
        'Đã quá thời hạn bảo hành bao test (24h/48h) của đơn hàng. Hệ thống không thể tiếp nhận khiếu nại.',
        400,
        'WARRANTY_EXPIRED'
      );
    }

    const existingDispute = await prisma.dispute.findUnique({
      where: { orderId },
    });

    if (existingDispute) {
      throw new AppError('Đơn hàng này đang có khiếu nại đang chờ xử lý', 400, 'DISPUTE_ALREADY_EXISTS');
    }

    const [dispute] = await prisma.$transaction([
      prisma.dispute.create({
        data: {
          orderId,
          claimantId: buyerId,
          reason: input.reason,
          proofVideoUrl: input.proofVideoUrl,
          status: 'PENDING',
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'DISPUTED' },
      }),
    ]);

    // Bắn thông báo cho Người bán
    await notificationService.sendNotification({
      userId: order.sellerId,
      title: '⚠️ Đơn hàng có khiếu nại!',
      body: `Người mua đã mở khiếu nại cho đơn hàng "${order.product.title}". Ban quản trị sẽ đối soát video bằng chứng.`,
      type: 'ORDER',
      targetUrl: `/orders/${order.id}`,
    });

    emitToUser(order.sellerId, 'order_status_updated', { orderId: order.id, status: 'DISPUTED' });

    return dispute;
  }

  // 4. Lấy chi tiết đơn hàng
  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            meetupLocation: true,
            campus: true,
            status: true,
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, phoneNumber: true, avatarUrl: true } },
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, phoneNumber: true, avatarUrl: true, bankAccount: true } },
          },
        },
        dispute: true,
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('Bạn không có quyền xem đơn hàng này', 403, 'FORBIDDEN');
    }

    // Bảo mật: Ẩn mã Handshake OTP & Token khỏi Người mua trước khi gặp mặt nhận đồ
    if (order.handshake && !order.handshake.isVerified) {
      if (order.buyerId === userId) {
        order.handshake = {
          ...order.handshake,
          handshakeOtp: '****',
          handshakeToken: 'PROTECTED_UNTIL_MEETUP',
        };
      }
    }

    return order;
  }

  // 5. Lấy danh sách đơn mua / đơn bán của người dùng
  async getUserOrders(userId: string, query: QueryOrdersInput) {
    const { role, status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = role === 'SELLER' ? { sellerId: userId } : { buyerId: userId };
    if (status) {
      where.status = status;
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
              campus: true,
            },
          },
          buyer: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
          seller: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
