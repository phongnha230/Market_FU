import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { notificationService } from '../notifications/notification.service';
import {
  CreateVoucherInput,
  UpdateVoucherInput,
  QueryVouchersInput,
  QueryUserVouchersInput,
  UseVoucherInput,
} from './voucher.dto';

export class VoucherService {
  /**
   * 1. Lấy danh sách Voucher đổi thưởng công khai (kèm bộ lọc và phân trang)
   */
  async getVouchers(query: QueryVouchersInput) {
    const { partner, search, isActive = true, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (partner) {
      where.partner = partner;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    let total = await prisma.voucher.count({ where });

    // Tự động khởi tạo kho Voucher mặc định của Campus nếu database chưa có
    if (total === 0 && !partner && !search) {
      const overallCount = await prisma.voucher.count();
      if (overallCount === 0) {
        await prisma.voucher.createMany({
          data: [
            {
              title: 'Voucher Cơm Căn Tin 10.000đ',
              description: 'Áp dụng cho mọi suất cơm trưa/tối tại Căng-tin Tòa Gamma (Hola) và Canteen Q.9 (HCM).',
              partner: 'CANTEEN',
              coinCost: 10,
              discountValue: 10000,
              quantity: 85,
              imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
              validDays: 14,
              isActive: true,
            },
            {
              title: 'Giảm 15.000đ Passio Coffee Campus',
              description: 'Áp dụng cho mọi món nước Cà phê sữa, Trà đào hạt sen size L tại quầy Passio trong trường.',
              partner: 'PASSIO',
              coinCost: 15,
              discountValue: 15000,
              quantity: 120,
              imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
              validDays: 30,
              isActive: true,
            },
            {
              title: 'Phiếu Mua Hàng 20.000đ 7-Eleven KTX',
              description: 'Giảm trực tiếp khi mua bánh mì, xúc xích nướng, đồ uống giải khát tại 7-Eleven sảnh KTX.',
              partner: 'SEVEN_ELEVEN',
              coinCost: 20,
              discountValue: 20000,
              quantity: 40,
              imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
              validDays: 20,
              isActive: true,
            },
            {
              title: 'Miễn Phí Vận Chuyển CampusShip',
              description: 'Trợ giá 100% cước giao hàng nội bộ giữa các KTX và liên Campus FPT toàn quốc.',
              partner: 'CAMPUS_SHIP',
              coinCost: 25,
              discountValue: 25000,
              quantity: 200,
              imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
              validDays: 45,
              isActive: true,
            },
          ],
        });
        total = await prisma.voucher.count({ where });
      }
    }

    const vouchers = await prisma.voucher.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ coinCost: 'asc' }, { createdAt: 'desc' }],
    });

    return {
      vouchers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 2. Chi tiết 1 voucher
   */
  async getVoucherById(id: string) {
    const voucher = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      throw new AppError('Không tìm thấy voucher này trong kho', 404, 'VOUCHER_NOT_FOUND');
    }

    return voucher;
  }

  /**
   * 3. Tạo mới Voucher (Admin)
   */
  async createVoucher(input: CreateVoucherInput) {
    const voucher = await prisma.voucher.create({
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        partner: input.partner,
        coinCost: input.coinCost,
        discountValue: input.discountValue,
        minOrderValue: input.minOrderValue ?? 0,
        quantity: input.quantity,
        imageUrl: input.imageUrl?.trim() || null,
        validDays: input.validDays,
        isActive: true,
      },
    });

    return voucher;
  }

  /**
   * 4. Cập nhật Voucher (Admin)
   */
  async updateVoucher(id: string, input: UpdateVoucherInput) {
    const existing = await prisma.voucher.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Không tìm thấy voucher để cập nhật', 404, 'VOUCHER_NOT_FOUND');
    }

    const updated = await prisma.voucher.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title.trim() }),
        ...(input.description !== undefined && { description: input.description?.trim() || null }),
        ...(input.partner && { partner: input.partner }),
        ...(input.coinCost !== undefined && { coinCost: input.coinCost }),
        ...(input.discountValue !== undefined && { discountValue: input.discountValue }),
        ...(input.quantity !== undefined && { quantity: input.quantity }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl?.trim() || null }),
        ...(input.validDays !== undefined && { validDays: input.validDays }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      },
    });

    return updated;
  }

  /**
   * 5. Xóa hoặc Vô hiệu hóa Voucher (Admin)
   */
  async deleteVoucher(id: string) {
    const existing = await prisma.voucher.findUnique({
      where: { id },
      include: {
        _count: {
          select: { userVouchers: true },
        },
      },
    });

    if (!existing) {
      throw new AppError('Không tìm thấy voucher để xóa', 404, 'VOUCHER_NOT_FOUND');
    }

    // Nếu đã có sinh viên đổi voucher này -> Soft delete bằng cách tắt isActive
    if (existing._count.userVouchers > 0) {
      await prisma.voucher.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Voucher đã được đổi bởi người dùng nên được chuyển sang trạng thái Ngừng hoạt động (Archived)' };
    }

    // Chưa ai đổi -> Hard delete an toàn
    await prisma.voucher.delete({ where: { id } });
    return { message: 'Đã xóa hoàn toàn voucher khỏi hệ thống' };
  }

  /**
   * 6. Sinh viên đổi Campus Coins lấy Voucher (Atomic Transaction)
   */
  async redeemVoucher(userId: string, voucherId: string) {
    const [profile, voucher] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.voucher.findUnique({ where: { id: voucherId } }),
    ]);

    if (!profile) {
      throw new AppError('Không tìm thấy hồ sơ người dùng', 404, 'PROFILE_NOT_FOUND');
    }

    if (!voucher) {
      throw new AppError('Voucher không tồn tại hoặc đã bị xóa', 404, 'VOUCHER_NOT_FOUND');
    }

    if (!voucher.isActive) {
      throw new AppError('Voucher này hiện đang tạm ngưng quy đổi', 400, 'VOUCHER_INACTIVE');
    }

    if (voucher.quantity <= 0) {
      throw new AppError('Rất tiếc! Voucher này đã hết lượt đổi trong kho', 400, 'OUT_OF_STOCK');
    }

    if (profile.campusCoins < voucher.coinCost) {
      throw new AppError(
        `Số dư Xu không đủ. Bạn cần ${voucher.coinCost.toLocaleString()} Xu, hiện có ${profile.campusCoins.toLocaleString()} Xu.`,
        400,
        'INSUFFICIENT_COINS'
      );
    }

    // Sinh mã voucher duy nhất: FUV-[PARTNER]-[HEX8] (VD: FUV-PAS-9F3C1A2B)
    const partnerPrefix = voucher.partner === 'CAMPUS_SHIP' ? 'SHIP' : voucher.partner.substring(0, 3).toUpperCase();
    const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const voucherCode = `FUV-${partnerPrefix}-${randomCode}`;

    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + voucher.validDays);

    // Thực hiện trừ xu, trừ kho, tạo UserVoucher và ghi sổ cái CoinTransaction trong 1 Transaction
    const redeemTransaction = () => prisma.$transaction(async (tx) => {
      // 1. Trừ số lượng kho có điều kiện (Chống Race Condition Oversell khi nhiều request song song)
      const voucherUpdate = await tx.voucher.updateMany({
        where: { id: voucherId, quantity: { gt: 0 }, isActive: true },
        data: { quantity: { decrement: 1 } },
      });

      if (voucherUpdate.count === 0) {
        throw new AppError('Rất tiếc! Voucher này vừa hết lượt đổi trong kho', 400, 'OUT_OF_STOCK');
      }

      // 2. Trừ số dư ví Xu có điều kiện (Chống Race Condition Double-Spend khi spam request)
      const profileUpdate = await tx.profile.updateMany({
        where: { userId, campusCoins: { gte: voucher.coinCost } },
        data: { campusCoins: { decrement: voucher.coinCost } },
      });

      if (profileUpdate.count === 0) {
        throw new AppError('Số dư Xu không đủ để đổi voucher này', 400, 'INSUFFICIENT_COINS');
      }

      const updatedProfile = await tx.profile.findUniqueOrThrow({
        where: { userId },
        select: { campusCoins: true },
      });

      // 3. Ghi lịch sử biến động sổ cái
      await tx.coinTransaction.create({
        data: {
          userId,
          amount: -voucher.coinCost,
          balanceAfter: updatedProfile.campusCoins,
          type: 'REDEEM_VOUCHER',
          description: `Đổi ${voucher.coinCost.toLocaleString()} Xu nhận voucher: ${voucher.title}`,
          referenceId: voucherId,
        },
      });

      // 4. Tạo bản ghi UserVoucher
      const userVoucher = await tx.userVoucher.create({
        data: {
          userId,
          voucherId,
          voucherCode,
          status: 'UNUSED',
          expiredAt,
        },
        include: {
          voucher: {
            select: {
              title: true,
              partner: true,
              discountValue: true,
              minOrderValue: true,
              description: true,
              imageUrl: true,
            },
          },
        },
      });

      return { userVoucher, remainingCoins: updatedProfile.campusCoins };
    });
    let result: Awaited<ReturnType<typeof redeemTransaction>> | undefined;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        result = await redeemTransaction();
        break;
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2034' || attempt === 2) {
          console.error('Voucher redemption transaction failed', { userId, voucherId, attempt, error });
          throw error;
        }
      }
    }
    if (!result) throw new AppError('Không thể hoàn tất đổi voucher', 503, 'VOUCHER_REDEMPTION_UNAVAILABLE');

    // Bắn thông báo realtime và Push Noti
    try {
      await notificationService.sendNotification({
        userId,
        title: '🎟️ Đổi Voucher thành công!',
        body: `Bạn đã đổi thành công "${voucher.title}". Mã voucher của bạn là ${voucherCode}. Hạn dùng đến ${expiredAt.toLocaleDateString('vi-VN')}.`,
        type: 'SYSTEM',
        targetUrl: '/profile/vouchers',
      });
    } catch (notificationError) {
      console.error('Voucher redeemed but notification failed', { userId, voucherId, error: notificationError });
    }

    return {
      message: 'Đổi voucher thành công! Bạn có thể sử dụng mã tại quầy đối tác trong campus.',
      userVoucher: result.userVoucher,
      remainingCoins: result.remainingCoins,
    };
  }

  /**
   * 7. Lấy danh sách Voucher của người dùng hiện tại
   */
  async getMyVouchers(userId: string, query: QueryUserVouchersInput) {
    const { status, page, limit } = query;
    const skip = (page - 1) * limit;

    const now = new Date();

    // Tự động cập nhật các voucher hết hạn thành EXPIRED
    await prisma.userVoucher.updateMany({
      where: {
        userId,
        status: 'UNUSED',
        expiredAt: { lt: now },
      },
      data: { status: 'EXPIRED' },
    });

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [total, userVouchers] = await Promise.all([
      prisma.userVoucher.count({ where }),
      prisma.userVoucher.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          voucher: {
            select: {
              id: true,
              title: true,
              description: true,
              partner: true,
              discountValue: true,
              minOrderValue: true,
              coinCost: true,
              imageUrl: true,
            },
          },
        },
      }),
    ]);

    return {
      userVouchers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 8. Sử dụng Voucher tại quầy (Xác nhận đổi quà)
   * B4-3: Kiểm tra quyền sở hữu hoặc quyền ADMIN đối soát, atomic updateMany chống racy double-spend
   * B4-8: Không rò rỉ thông tin cá nhân của người sở hữu voucher
   */
  async useVoucher(input: UseVoucherInput, requester: { userId: string; role: string }) {
    const { voucherCode } = input;
    const code = voucherCode.trim().toUpperCase();

    const userVoucher = await prisma.userVoucher.findUnique({
      where: { voucherCode: code },
      include: {
        voucher: true,
      },
    });

    if (!userVoucher) {
      throw new AppError('Mã voucher không tồn tại trong hệ thống', 404, 'VOUCHER_NOT_FOUND');
    }

    // B4-3: Chỉ người sở hữu voucher hoặc Quản trị viên (Admin) đối soát tại quầy mới được xác nhận dùng
    if (requester.role !== 'ADMIN' && userVoucher.userId !== requester.userId) {
      throw new AppError('Bạn không có quyền sử dụng mã voucher của người khác', 403, 'FORBIDDEN');
    }

    const now = new Date();

    if (userVoucher.status === 'USED') {
      throw new AppError(
        `Voucher này đã được sử dụng vào lúc ${userVoucher.usedAt ? userVoucher.usedAt.toLocaleString('vi-VN') : ''}`,
        400,
        'VOUCHER_ALREADY_USED'
      );
    }

    if (userVoucher.status === 'EXPIRED' || userVoucher.expiredAt < now) {
      throw new AppError('Voucher này đã quá hạn sử dụng', 400, 'VOUCHER_EXPIRED');
    }

    // B4-3: Chống race-condition khi quét song song bằng atomic updateMany
    const updateResult = await prisma.userVoucher.updateMany({
      where: {
        id: userVoucher.id,
        status: 'UNUSED',
        expiredAt: { gte: now },
      },
      data: {
        status: 'USED',
        usedAt: now,
      },
    });

    if (updateResult.count === 0) {
      throw new AppError('Voucher này đã được sử dụng hoặc đã hết hạn', 400, 'VOUCHER_ALREADY_USED');
    }

    // Thông báo cho chủ sở hữu voucher
    await notificationService.sendNotification({
      userId: userVoucher.userId,
      title: '✅ Voucher đã được sử dụng',
      body: `Mã ${userVoucher.voucherCode} (${userVoucher.voucher.title}) vừa được xác nhận sử dụng thành công tại đối tác.`,
      type: 'SYSTEM',
    });

    // B4-8: Trả về kết quả xác nhận bảo mật, không leak thông tin profile/email người khác
    return {
      message: 'Xác nhận sử dụng voucher thành công!',
      voucher: {
        voucherCode: userVoucher.voucherCode,
        title: userVoucher.voucher.title,
        partner: userVoucher.voucher.partner,
        discountValue: userVoucher.voucher.discountValue,
        usedAt: now,
      },
    };
  }

  /**
   * 9. Hoàn lại Voucher về trạng thái UNUSED (Dành cho trường hợp người dùng lỡ bấm xác nhận nhầm)
   */
  async restoreVoucher(input: UseVoucherInput, requester: { userId: string; role: string }) {
    const { voucherCode } = input;
    const code = voucherCode.trim().toUpperCase();

    const userVoucher = await prisma.userVoucher.findUnique({
      where: { voucherCode: code },
      include: { voucher: true },
    });

    if (!userVoucher) {
      throw new AppError('Mã voucher không tồn tại trong hệ thống', 404, 'VOUCHER_NOT_FOUND');
    }

    if (requester.role !== 'ADMIN' && userVoucher.userId !== requester.userId) {
      throw new AppError('Bạn không có quyền hoàn tác mã voucher của người khác', 403, 'FORBIDDEN');
    }

    const now = new Date();
    if (userVoucher.expiredAt < now) {
      throw new AppError('Voucher này đã hết hạn, không thể hoàn lại', 400, 'VOUCHER_EXPIRED');
    }

    const updated = await prisma.userVoucher.update({
      where: { id: userVoucher.id },
      data: {
        status: 'UNUSED',
        usedAt: null,
      },
    });

    return {
      message: 'Đã hoàn lại voucher về ví thành công!',
      voucher: {
        voucherCode: updated.voucherCode,
        status: updated.status,
      },
    };
  }
}
