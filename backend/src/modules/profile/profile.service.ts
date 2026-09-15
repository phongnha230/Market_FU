import { prisma } from '../../config/prisma';
import { saveImageToStorage } from '../../config/storage';
import { AppError } from '../../middlewares/error.middleware';
import { NotificationService } from '../notifications/notification.service';
import { emitToUser } from '../../utils/socket';
import {
  UpdateProfileInput,
  UpdateBankAccountInput,
  StudentKycInput,
  SellerOnboardingInput,
} from './profile.dto';

const notificationService = new NotificationService();

export class ProfileService {
  /**
   * Lấy thông tin chi tiết hồ sơ của người dùng hiện tại
   */
  async getProfile(userId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new AppError('Không tìm thấy thông tin hồ sơ người dùng', 404, 'PROFILE_NOT_FOUND');
    }

    return {
      id: profile.id,
      userId: profile.userId,
      email: profile.user.email,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      avatarBadge: profile.avatarBadge,
      phoneNumber: profile.phoneNumber,
      role: profile.user.role,
      campus: profile.campus,
      campusCoins: profile.campusCoins,
      reputationScore: profile.reputationScore,
      isActive: profile.user.isActive,
      kyc: profile.kyc,
      bankAccount: profile.bankAccount,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  /**
   * Cập nhật thông tin cá nhân cơ bản (họ tên, số điện thoại, cơ sở, avatar)
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        ...(input.fullName && { fullName: input.fullName }),
        ...(input.phoneNumber !== undefined && { phoneNumber: input.phoneNumber }),
        ...(input.campus && { campus: input.campus }),
        ...(input.avatarUrl && { avatarUrl: input.avatarUrl }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      id: updatedProfile.id,
      userId: updatedProfile.userId,
      email: updatedProfile.user.email,
      fullName: updatedProfile.fullName,
      avatarUrl: updatedProfile.avatarUrl,
      avatarBadge: updatedProfile.avatarBadge,
      phoneNumber: updatedProfile.phoneNumber,
      role: updatedProfile.user.role,
      campus: updatedProfile.campus,
      campusCoins: updatedProfile.campusCoins,
      reputationScore: updatedProfile.reputationScore,
      updatedAt: updatedProfile.updatedAt,
    };
  }

  /**
   * Cập nhật tài khoản ngân hàng nhận tiền thanh toán
   */
  async updateBankAccount(userId: string, input: UpdateBankAccountInput) {
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        bankAccount: {
          bankName: input.bankName,
          accountNo: input.accountNo,
          accountName: input.accountName.toUpperCase(),
        },
      },
      select: {
        id: true,
        userId: true,
        bankAccount: true,
        updatedAt: true,
      },
    });

    return updatedProfile;
  }

  /**
   * Tải ảnh Thẻ Sinh Viên để nộp hồ sơ KYC
   */
  async submitStudentKyc(userId: string, input: StudentKycInput, fileBuffer?: Buffer) {
    if (!fileBuffer) {
      throw new AppError(
        'Vui lòng tải lên ảnh chụp Thẻ Sinh Viên hoặc màn hình FAP/myFPT',
        400,
        'FILE_MISSING'
      );
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      throw new AppError('Không tìm thấy thông tin hồ sơ người dùng', 404, 'PROFILE_NOT_FOUND');
    }

    if (existingProfile.kyc?.status === 'APPROVED') {
      throw new AppError(
        'Tài khoản của bạn đã được xác thực Thẻ Sinh Viên (Tích Xanh) trước đó.',
        400,
        'ALREADY_VERIFIED'
      );
    }

    // Lưu trữ ảnh KYC và nén WebP an toàn
    const uploadResult = await saveImageToStorage(fileBuffer, 'kyc_cards');

    const updatedProfile = await prisma.$transaction(async (tx) => {
      const prof = await tx.profile.update({
        where: { userId },
        data: {
          kyc: {
            set: {
              studentId: input.studentId.toUpperCase().trim(),
              cardImageUrl: uploadResult.secure_url,
              status: 'PENDING',
              type: 'STUDENT',
              rejectedReason: null,
              verifiedAt: null,
            },
          },
        },
        select: {
          id: true,
          userId: true,
          kyc: true,
          updatedAt: true,
        },
      });

      await tx.kycVerification.create({
        data: {
          userId,
          studentId: input.studentId.toUpperCase().trim(),
          cardImageUrl: uploadResult.secure_url,
          status: 'PENDING',
          type: 'STUDENT',
        },
      });

      return prof;
    });

    // Bắn thông báo In-app và Realtime Socket
    await notificationService.sendNotification({
      userId,
      title: '🎓 Hồ sơ Xác thực Thẻ Sinh Viên đã được gửi',
      body: 'Hồ sơ Thẻ sinh viên của bạn đang được BQT xét duyệt. Khi hoàn tất bạn sẽ nhận được Tích Xanh, +200 Xu và mở khóa quyền mua hàng Ship COD!',
      type: 'KYC',
      targetUrl: '/profile',
    });

    emitToUser(userId, 'kyc_status_updated', { status: 'PENDING', type: 'STUDENT' });

    return updatedProfile;
  }

  /**
   * Nộp hồ sơ Onboarding Người Bán: Thông tin cá nhân, Ngân hàng nhận tiền + Ảnh Thẻ Sinh Viên
   */
  async submitSellerOnboarding(userId: string, input: SellerOnboardingInput, fileBuffer?: Buffer) {
    if (!fileBuffer) {
      throw new AppError(
        'Vui lòng tải lên ảnh chụp Thẻ Sinh Viên hoặc màn hình xác thực FAP/myFPT',
        400,
        'FILE_MISSING'
      );
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { role: true } } },
    });

    if (!existingProfile) {
      throw new AppError('Không tìm thấy thông tin hồ sơ người dùng', 404, 'PROFILE_NOT_FOUND');
    }

    if (existingProfile.kyc?.status === 'APPROVED') {
      throw new AppError(
        'Tài khoản của bạn đã được xác thực Người Bán (Tích Xanh) trước đó.',
        400,
        'ALREADY_VERIFIED'
      );
    }

    // Lưu trữ và nén ảnh thẻ SV sang WebP
    const uploadResult = await saveImageToStorage(fileBuffer, 'kyc_cards');

    const updatedProfile = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.update({
        where: { userId },
        data: {
          fullName: input.fullName.trim(),
          phoneNumber: input.phoneNumber.trim(),
          campus: input.campus,
          bankAccount: {
            set: {
              bankName: input.bankName.trim(),
              accountNo: input.accountNo.trim(),
              accountName: input.accountName.toUpperCase().trim(),
            },
          },
          kyc: {
            set: {
              studentId: input.studentId.toUpperCase().trim(),
              cardImageUrl: uploadResult.secure_url,
              status: 'PENDING',
              type: 'SELLER',
              rejectedReason: null,
              verifiedAt: null,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Tạo bản ghi lịch sử kiểm duyệt KycVerification
      await tx.kycVerification.create({
        data: {
          userId,
          studentId: input.studentId.toUpperCase().trim(),
          cardImageUrl: uploadResult.secure_url,
          status: 'PENDING',
          type: 'SELLER',
        },
      });

      return profile;
    });

    // Bắn thông báo In-app và Socket realtime
    await notificationService.sendNotification({
      userId,
      title: '📋 Hồ sơ đăng ký Người Bán đã được gửi',
      body: 'Hồ sơ định danh và tài khoản ngân hàng của bạn đang được BQT xét duyệt. Kết quả sẽ được thông báo sớm nhất!',
      type: 'KYC',
      targetUrl: '/profile',
    });

    emitToUser(userId, 'kyc_status_updated', { status: 'PENDING', type: 'SELLER' });

    return {
      id: updatedProfile.id,
      userId: updatedProfile.userId,
      fullName: updatedProfile.fullName,
      phoneNumber: updatedProfile.phoneNumber,
      campus: updatedProfile.campus,
      bankAccount: updatedProfile.bankAccount,
      kyc: updatedProfile.kyc,
      role: updatedProfile.user.role,
      updatedAt: updatedProfile.updatedAt,
    };
  }

  /**
   * Xem hồ sơ công khai của một người bán / sinh viên khác
   */
  async getPublicProfile(targetUserId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId: targetUserId },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            createdAt: true,
            _count: {
              select: {
                products: { where: { status: 'AVAILABLE' } },
                receivedReviews: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      throw new AppError('Không tìm thấy người bán', 404, 'SELLER_NOT_FOUND');
    }

    return {
      id: profile.id,
      userId: profile.userId,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      avatarBadge: profile.avatarBadge,
      campus: profile.campus,
      reputationScore: profile.reputationScore,
      role: profile.user.role,
      createdAt: profile.user.createdAt,
      _count: profile.user._count,
    };
  }

  /**
   * Đổi Xu lấy Khung Avatar & Huy hiệu trang trí cá nhân
   */
  async buyAvatarBadge(userId: string, badgeType: 'TOP_SELLER' | 'K18_VERIFIED' | 'REPUTABLE_TRADER') {
    const BADGE_PRICES: Record<string, number> = {
      TOP_SELLER: 300,
      K18_VERIFIED: 200,
      REPUTABLE_TRADER: 250,
    };

    const cost = BADGE_PRICES[badgeType];
    if (!cost) {
      throw new AppError('Loại huy hiệu không hợp lệ', 400, 'INVALID_BADGE_TYPE');
    }

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new AppError('Hồ sơ không tồn tại', 404, 'PROFILE_NOT_FOUND');
    }

    if (profile.campusCoins < cost) {
      throw new AppError(
        `Số dư Xu của bạn (${profile.campusCoins} Xu) không đủ để đổi huy hiệu này (Cần ${cost} Xu)`,
        400,
        'INSUFFICIENT_COINS'
      );
    }

    const updatedProfile = await prisma.$transaction(async (tx) => {
      const updated = await tx.profile.update({
        where: { userId },
        data: {
          campusCoins: { decrement: cost },
          avatarBadge: badgeType,
        },
      });

      await tx.coinTransaction.create({
        data: {
          userId,
          amount: -cost,
          balanceAfter: updated.campusCoins,
          type: 'BUY_BADGE',
          description: `Đổi ${cost} Xu lấy huy hiệu ${badgeType} trang trí trang cá nhân`,
        },
      });

      return updated;
    });

    return updatedProfile;
  }

  /**
   * Tạo yêu cầu rút tiền từ số dư Xu tích lũy về tài khoản ngân hàng
   */
  async createWithdrawalRequest(userId: string, amount: number) {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new AppError('Hồ sơ không tồn tại', 404, 'PROFILE_NOT_FOUND');
    }

    if (!profile.bankAccount || !profile.bankAccount.accountNo) {
      throw new AppError(
        'Vui lòng cập nhật đầy đủ thông tin tài khoản ngân hàng nhận tiền trước khi tạo yêu cầu rút',
        400,
        'BANK_ACCOUNT_REQUIRED'
      );
    }

    if (profile.campusCoins < amount) {
      throw new AppError(
        `Số dư Xu (${profile.campusCoins} Xu) không đủ để rút ${amount.toLocaleString()} VNĐ`,
        400,
        'INSUFFICIENT_COINS'
      );
    }

    const withdrawal = await prisma.$transaction(async (tx) => {
      // Khấu trừ Xu
      const updatedProf = await tx.profile.update({
        where: { userId },
        data: {
          campusCoins: { decrement: amount },
        },
      });

      // Tạo WithdrawalRequest
      const req = await tx.withdrawalRequest.create({
        data: {
          userId,
          amount,
          bankAccount: profile.bankAccount!,
          status: 'PENDING',
        },
      });

      // Ghi sổ cái
      await tx.coinTransaction.create({
        data: {
          userId,
          amount: -amount,
          balanceAfter: updatedProf.campusCoins,
          type: 'WITHDRAWAL',
          description: `Tạo yêu cầu rút ${amount.toLocaleString()} VNĐ về ${profile.bankAccount!.bankName} (${profile.bankAccount!.accountNo})`,
        },
      });

      return req;
    });

    return withdrawal;
  }

  /**
   * Danh sách yêu cầu rút tiền của người dùng
   */
  async getWithdrawalRequests(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, requests] = await Promise.all([
      prisma.withdrawalRequest.count({ where: { userId } }),
      prisma.withdrawalRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Xem lịch sử biến động sổ cái CoinTransaction của người dùng
   */
  async getCoinHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, transactions] = await Promise.all([
      prisma.coinTransaction.count({ where: { userId } }),
      prisma.coinTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const profileService = new ProfileService();
