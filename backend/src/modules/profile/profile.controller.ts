import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { profileService } from './profile.service';
import {
  updateProfileSchema,
  updateBankAccountSchema,
  studentKycSchema,
  sellerOnboardingSchema,
  buyBadgeSchema,
  createWithdrawalSchema,
  queryCoinHistorySchema,
  claimQuestSchema,
} from './profile.dto';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class ProfileController {
  /**
   * [GET /api/profile] Lấy thông tin hồ sơ của chính mình
   */
  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await profileService.getProfile(req.user!.userId);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PATCH /api/profile] Cập nhật thông tin cá nhân
   */
  async updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const user = await profileService.updateProfile(req.user!.userId, validatedData);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [PATCH /api/profile/bank-account] Cập nhật số tài khoản ngân hàng nhận tiền
   */
  async updateBankAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = updateBankAccountSchema.parse(req.body);
      const result = await profileService.updateBankAccount(req.user!.userId, validatedData);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST /api/profile/kyc] Tải lên ảnh Thẻ Sinh Viên để xét duyệt KYC
   */
  async submitKyc(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = studentKycSchema.parse(req.body);
      const fileBuffer = req.file?.buffer;
      const result = await profileService.submitStudentKyc(
        req.user!.userId,
        validatedData,
        fileBuffer
      );
      return sendSuccess(res, result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST /api/profile/seller-onboarding] Nộp hồ sơ đăng ký Người Bán (Họ tên, SĐT, Cơ sở, Ngân hàng + Thẻ SV)
   */
  async submitSellerOnboarding(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = sellerOnboardingSchema.parse(req.body);
      const fileBuffer = req.file?.buffer;
      const result = await profileService.submitSellerOnboarding(
        req.user!.userId,
        validatedData,
        fileBuffer
      );
      return sendSuccess(
        res,
        result,
        { message: 'Nộp hồ sơ đăng ký Người Bán thành công, vui lòng chờ BQT phê duyệt' },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET /api/profile/public/:userId] Xem hồ sơ công khai của sinh viên / người bán khác
   */
  async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId = req.params.userId as string;
      const publicProfile = await profileService.getPublicProfile(targetUserId);
      return sendSuccess(res, publicProfile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST /api/profile/badges/buy] Mua khung Avatar / Huy hiệu trang trí bằng Xu
   */
  async buyAvatarBadge(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { badgeType } = buyBadgeSchema.parse(req.body);
      const result = await profileService.buyAvatarBadge(req.user!.userId, badgeType);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST /api/profile/withdrawals] Tạo yêu cầu rút tiền về tài khoản ngân hàng
   */
  async createWithdrawalRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { amount } = createWithdrawalSchema.parse(req.body);
      const result = await profileService.createWithdrawalRequest(req.user!.userId, amount);
      return sendSuccess(res, result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET /api/profile/withdrawals] Danh sách yêu cầu rút tiền của tôi
   */
  async getWithdrawalRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await profileService.getWithdrawalRequests(req.user!.userId, page, limit);
      return sendPaginated(res, result.requests, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET /api/profile/coins/history] Lịch sử biến động sổ cái Xu (CoinTransaction)
   */
  async getCoinHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryCoinHistorySchema.parse(req.query);
      const result = await profileService.getCoinHistory(req.user!.userId, query.page, query.limit);
      return sendPaginated(res, result.transactions, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET /api/profile/check-in-status] Kiểm tra trạng thái điểm danh hôm nay
   */
  async getCheckInStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = await profileService.getCheckInStatus(req.user!.userId);
      return sendSuccess(res, status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST /api/profile/check-in] Điểm danh nhận 20 Xu hàng ngày
   */
  async checkInDaily(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await profileService.checkInDaily(req.user!.userId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [POST /api/profile/claim-quest] Nhận thưởng nhiệm vụ tuần
   */
  async claimQuest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = claimQuestSchema.parse(req.body);
      const result = await profileService.claimQuest(req.user!.userId, validatedData);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * [GET /api/profile/kyc/card/:filename] Phục vụ an toàn ảnh Thẻ Sinh Viên KYC (Private Media Streaming - B1-2 Fix)
   */
  async streamKycCard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
      const user = req.user!;
      await profileService.streamKycCard(filename, user, res);
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
