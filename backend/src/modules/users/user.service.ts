import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { profileService } from '../profile/profile.service';
import {
  QueryUserInput,
  UpdateProfileInput,
  UpdateBankAccountInput,
  StudentKycInput,
} from './user.dto';

export class UserService {
  // --------------------------------------------------------------------------
  // Delegation methods sang ProfileService (Tương thích ngược 100%)
  // --------------------------------------------------------------------------
  async getProfile(userId: string) {
    return profileService.getProfile(userId);
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return profileService.updateProfile(userId, input);
  }

  async updateBankAccount(userId: string, input: UpdateBankAccountInput) {
    return profileService.updateBankAccount(userId, input);
  }

  async submitStudentKyc(userId: string, input: StudentKycInput, fileBuffer?: Buffer) {
    return profileService.submitStudentKyc(userId, input, fileBuffer);
  }

  // --------------------------------------------------------------------------
  // Các nghiệp vụ quản trị User (Dành cho Quản trị viên Admin)
  // --------------------------------------------------------------------------
  /**
   * Lấy danh sách người dùng trong hệ thống (Hỗ trợ phân trang, lọc theo Campus & Role)
   */
  async getUsers(query: QueryUserInput) {
    const { page, limit, search, role, campus } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { is: { fullName: { contains: search, mode: 'insensitive' } } } },
        { profile: { is: { phoneNumber: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    if (role) where.role = role;
    if (campus) where.profile = { is: { campus } };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          profile: {
            select: {
              fullName: true,
              avatarUrl: true,
              avatarBadge: true,
              phoneNumber: true,
              campus: true,
              campusCoins: true,
              reputationScore: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.profile?.fullName,
      avatarUrl: u.profile?.avatarUrl,
      avatarBadge: u.profile?.avatarBadge,
      phoneNumber: u.profile?.phoneNumber,
      role: u.role,
      campus: u.profile?.campus,
      campusCoins: u.profile?.campusCoins,
      reputationScore: u.profile?.reputationScore,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));

    return {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy thông tin người dùng theo ID (Bảo vệ PII: Ẩn SĐT và che mờ Email đối với khách vãng lai / người dùng khác)
   */
  async getUserById(userId: string) {
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      throw new AppError('Hồ sơ công khai chỉ được tra cứu bằng user ID', 400, 'USER_ID_REQUIRED');
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        createdAt: true,
        profile: {
          select: {
            fullName: true,
            avatarUrl: true,
            avatarBadge: true,
            campus: true,
            reputationScore: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
    }

    // Tính toán số liệu thống kê THẬT 100% từ Database
    const [dealCount, reviewAgg, activeListingsCount] = await Promise.all([
      prisma.order.count({
        where: {
          sellerId: user.id,
          status: { in: ['COMPLETED', 'DELIVERED'] },
        },
      }),
      prisma.review.aggregate({
        where: {
          revieweeId: user.id,
          isPublic: true,
        },
        _avg: { rating: true },
        _count: { id: true },
      }),
      prisma.product.count({
        where: {
          sellerId: user.id,
          status: 'AVAILABLE',
        },
      }),
    ]);

    const reviewCount = reviewAgg._count.id;
    const rating = reviewAgg._avg.rating ? Number(reviewAgg._avg.rating.toFixed(1)) : null;

    return {
      id: user.id,
      fullName: user.profile?.fullName,
      avatarUrl: user.profile?.avatarUrl,
      campus: user.profile?.campus,
      avatarBadge: user.profile?.avatarBadge,
      reputationScore: user.profile?.reputationScore ?? 100,
      dealCount,
      reviewCount,
      rating,
      activeListingsCount,
      createdAt: user.createdAt,
    };
  }

  /**
   * Khóa hoặc mở khóa tài khoản người dùng (Tự động thu hồi Refresh Token cũ)
   */
  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive,
        tokenVersion: { increment: 1 }, // Thu hồi mọi Refresh Token khi trạng thái tài khoản thay đổi
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        profile: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.profile?.fullName,
      isActive: user.isActive,
    };
  }
}

export const userService = new UserService();
