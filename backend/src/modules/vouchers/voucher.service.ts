import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { NotificationService } from '../notifications/notification.service';
import { emitToUser } from '../../utils/socket';
import {
  RedeemVoucherInput,
  QueryMyVouchersInput,
  UseVoucherInput,
  CreateVoucherAdminInput,
} from './voucher.dto';

const notificationService = new NotificationService();

export class VoucherService {
  // 1. Lấy danh sách Voucher khả dụng trong kho quà Campus (Kèm auto-seed nếu DB trống)
  async getAvailableVouchers() {
    const count = await prisma.voucher.count();
    if (count === 0) {
      // Khởi tạo các voucher mẫu mặc định của Campus FPT
      await prisma.voucher.createMany({
        data: [
          {
            title: 'Voucher Cơm Trưa Căn Tin FPT - Giảm 10.000 VNĐ',
            description: 'Áp dụng tại tất cả các quầy cơm phần Căn tin tầng 1 campus. Mỗi hóa đơn áp dụng 1 voucher.',
            partner: 'CANTEEN',
            coinCost: 1000,
            discountValue: 10000,
            quantity: 50,
            validDays: 30,
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
            isActive: true,
          },
          {
            title: 'Voucher Passio Coffee - Giảm 15.000 VNĐ',
            description: 'Áp dụng cho mọi loại thức uống Passio Coffee trong khuôn viên trường. Không quy đổi thành tiền mặt.',
            partner: 'PASSIO',
            coinCost: 1500,
            discountValue: 15000,
            quantity: 30,
            validDays: 30,
            imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500',
            isActive: true,
          },
          {
            title: 'Voucher 7-Eleven Campus - Giảm 20.000 VNĐ',
            description: 'Áp dụng cho hóa đơn từ 50.000 VNĐ tại cửa hàng tiện lợi 7-Eleven trong trường.',
            partner: 'SEVEN_ELEVEN',
            coinCost: 2000,
            discountValue: 20000,
            quantity: 20,
            validDays: 30,
            imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500',
            isActive: true,
          },
        ],
      });
    }

    const vouchers = await prisma.voucher.findMany({
      where: {
        isActive: true,
        quantity: { gt: 0 },
      },
      orderBy: { coinCost: 'asc' },
    });

    return vouchers;
  }

  // 2. Đổi Xu lấy Voucher ăn uống (Atomic Transaction)
  async redeemVoucher(userId: string, input: RedeemVoucherInput) {
    const { voucherId } = input;

    const voucher = await prisma.voucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher || !voucher.isActive) {
      throw new AppError('Voucher không tồn tại hoặc đã ngừng phát hành', 404, 'VOUCHER_NOT_FOUND');
    }

    if (voucher.quantity <= 0) {
      throw new AppError('Voucher này trong kho quà đã hết lượt đổi', 400, 'VOUCHER_OUT_OF_STOCK');
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new AppError('Hồ sơ người dùng không tồn tại', 404, 'PROFILE_NOT_FOUND');
    }

    if (profile.campusCoins < voucher.coinCost) {
      throw new AppError(
        `Số dư Xu không đủ. Bạn có ${profile.campusCoins} Xu, cần ${voucher.coinCost} Xu để đổi voucher này`,
        400,
        'INSUFFICIENT_COINS'
      );
    }

    // Sinh mã voucher độc nhất: FUV-{PARTNER}-{RANDOM_HEX}
    const randomCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const voucherCode = `FUV-${voucher.partner}-${randomCode}`;

    const now = new Date();
    const expiredAt = new Date(now.getTime() + voucher.validDays * 24 * 60 * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      // Trừ Xu trong ví sinh viên
      const updatedProfile = await tx.profile.update({
        where: { userId },
        data: {
          campusCoins: { decrement: voucher.coinCost },
        },
      });

      // Giảm 1 số lượng voucher trong kho
      await tx.voucher.update({
        where: { id: voucherId },
        data: {
          quantity: { decrement: 1 },
        },
      });

      // Tạo bản ghi UserVoucher sở hữu
      const userVoucher = await tx.userVoucher.create({
        data: {
          userId,
          voucherId,
          voucherCode,
          status: 'UNUSED',
          expiredAt,
        },
        include: { voucher: true },
      });

      // Ghi sổ cái CoinTransaction
      await tx.coinTransaction.create({
        data: {
          userId,
          amount: -voucher.coinCost,
          balanceAfter: updatedProfile.campusCoins,
          type: 'REDEEM_VOUCHER',
          description: `Đổi ${voucher.coinCost} Xu lấy voucher "${voucher.title}" (Mã: ${voucherCode})`,
          referenceId: userVoucher.id,
        },
      });

      return { userVoucher, balanceAfter: updatedProfile.campusCoins };
    });

    // Gửi thông báo In-app & Socket
    await notificationService.sendNotification({
      userId,
      title: '🎟️ Đổi Voucher thành công!',
      body: `Bạn đã đổi thành công "${voucher.title}". Mã của bạn: ${voucherCode}. Hãy đưa mã này cho nhân viên khi thanh toán.`,
      type: 'SYSTEM',
      targetUrl: '/profile/vouchers',
    });

    emitToUser(userId, 'voucher_redeemed', {
      voucherCode,
      title: voucher.title,
      expiredAt,
    });

    return result;
  }

  // 3. Danh sách Voucher cá nhân đã đổi của sinh viên
  async getMyVouchers(userId: string, query: QueryMyVouchersInput) {
    const { status, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [total, userVouchers] = await Promise.all([
      prisma.userVoucher.count({ where }),
      prisma.userVoucher.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { voucher: true },
      }),
    ]);

    return {
      vouchers: userVouchers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 4. Quét mã sử dụng Voucher tại quầy (Dành cho Quản trị viên / Đối tác Căn tin)
  async useVoucher(input: UseVoucherInput) {
    const { voucherCode } = input;

    const userVoucher = await prisma.userVoucher.findUnique({
      where: { voucherCode },
      include: {
        voucher: true,
        user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
      },
    });

    if (!userVoucher) {
      throw new AppError('Mã voucher không tồn tại trên hệ thống', 404, 'VOUCHER_CODE_NOT_FOUND');
    }

    if (userVoucher.status === 'USED') {
      throw new AppError(
        `Voucher này đã được sử dụng trước đó vào ${userVoucher.usedAt?.toLocaleString('vi-VN')}`,
        400,
        'VOUCHER_ALREADY_USED'
      );
    }

    const now = new Date();
    if (userVoucher.expiredAt < now || userVoucher.status === 'EXPIRED') {
      if (userVoucher.status !== 'EXPIRED') {
        await prisma.userVoucher.update({
          where: { id: userVoucher.id },
          data: { status: 'EXPIRED' },
        });
      }
      throw new AppError('Voucher này đã hết hạn sử dụng', 400, 'VOUCHER_EXPIRED');
    }

    const updated = await prisma.userVoucher.update({
      where: { id: userVoucher.id },
      data: {
        status: 'USED',
        usedAt: now,
      },
      include: { voucher: true },
    });

    // Bắn thông báo cho sinh viên biết voucher vừa được quét sử dụng
    await notificationService.sendNotification({
      userId: userVoucher.userId,
      title: '✅ Voucher đã được sử dụng',
      body: `Voucher "${userVoucher.voucher.title}" (Mã: ${voucherCode}) của bạn đã được nhân viên quét thành công tại quầy.`,
      type: 'SYSTEM',
      targetUrl: '/profile/vouchers',
    });

    return {
      success: true,
      message: 'Áp dụng voucher thành công!',
      voucher: updated,
      studentName: userVoucher.user.profile?.fullName,
      discountValue: userVoucher.voucher.discountValue,
    };
  }

  // 5. [ADMIN] Thêm voucher mới vào kho quà
  async createVoucher(input: CreateVoucherAdminInput) {
    const voucher = await prisma.voucher.create({
      data: input,
    });
    return voucher;
  }
}
