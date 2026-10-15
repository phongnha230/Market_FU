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
  questAdminInputSchema,
} from './profile.dto';
import { questService } from './quest.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class ProfileController {
  /**
   * [GET /api/profile] Lấy thông tin hồ sơ của chính mình
   */
  getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const user = await profileService.getProfile(authReq.user!.userId);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [PATCH /api/profile] Cập nhật thông tin cá nhân
   */
  updateMyProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validatedData = updateProfileSchema.parse(req.body);
      const user = await profileService.updateProfile(authReq.user!.userId, validatedData);
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [PATCH /api/profile/bank-account] Cập nhật số tài khoản ngân hàng nhận tiền
   */
  updateBankAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validatedData = updateBankAccountSchema.parse(req.body);
      const result = await profileService.updateBankAccount(authReq.user!.userId, validatedData);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [POST /api/profile/kyc] Tải lên ảnh Thẻ Sinh Viên để xét duyệt KYC
   */
  submitKyc = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validatedData = studentKycSchema.parse(req.body);
      const fileBuffer = req.file?.buffer;
      const result = await profileService.submitStudentKyc(
        authReq.user!.userId,
        validatedData,
        fileBuffer
      );
      return sendSuccess(res, result, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [POST /api/profile/seller-onboarding] Nộp hồ sơ đăng ký Người Bán (Họ tên, SĐT, Cơ sở, Ngân hàng + Thẻ SV)
   */
  submitSellerOnboarding = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validatedData = sellerOnboardingSchema.parse(req.body);
      const fileBuffer = req.file?.buffer;
      const result = await profileService.submitSellerOnboarding(
        authReq.user!.userId,
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
  };

  /**
   * [GET /api/profile/public/:userId] Xem hồ sơ công khai của sinh viên / người bán khác
   */
  getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetUserId = req.params.userId as string;
      const publicProfile = await profileService.getPublicProfile(targetUserId);
      return sendSuccess(res, publicProfile);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [POST /api/profile/badges/buy] Mua khung Avatar / Huy hiệu trang trí bằng Xu
   */
  buyAvatarBadge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { badgeType } = buyBadgeSchema.parse(req.body);
      const result = await profileService.buyAvatarBadge(authReq.user!.userId, badgeType);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [POST /api/profile/withdrawals] Tạo yêu cầu rút tiền về tài khoản ngân hàng
   */
  createWithdrawalRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { amount } = createWithdrawalSchema.parse(req.body);
      const result = await profileService.createWithdrawalRequest(authReq.user!.userId, amount);
      return sendSuccess(res, result, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [GET /api/profile/withdrawals] Danh sách yêu cầu rút tiền của tôi
   */
  getWithdrawalRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await profileService.getWithdrawalRequests(authReq.user!.userId, page, limit);
      return sendPaginated(res, result.requests, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [GET /api/profile/coins/history] Lịch sử biến động sổ cái Xu (CoinTransaction)
   */
  getCoinHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const query = queryCoinHistorySchema.parse(req.query);
      const result = await profileService.getCoinHistory(authReq.user!.userId, query.page, query.limit);
      return sendPaginated(res, result.transactions, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [GET /api/profile/check-in-status] Kiểm tra trạng thái điểm danh hôm nay
   */
  getCheckInStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const status = await profileService.getCheckInStatus(authReq.user!.userId);
      return sendSuccess(res, status);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [POST /api/profile/check-in] Điểm danh nhận 20 Xu hàng ngày
   */
  checkInDaily = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const result = await profileService.checkInDaily(authReq.user!.userId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [POST /api/profile/claim-quest] Nhận thưởng nhiệm vụ tuần
   */
  claimQuest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validatedData = claimQuestSchema.parse(req.body);
      const userId = authReq.user!.userId;
      const result = validatedData.questId === 'quest-checkin'
        ? { ...await profileService.checkInDaily(userId), questId: validatedData.questId }
        : await questService.claim(userId, validatedData.questId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  getQuests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      return sendSuccess(res, await questService.getForUser(authReq.user!.userId));
    } catch (error) {
      next(error);
    }
  };

  getQuestsAdmin = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      return sendSuccess(res, await questService.getAllForAdmin());
    } catch (error) {
      next(error);
    }
  };

  createQuestAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = questAdminInputSchema.parse(req.body);
      return sendSuccess(res, await questService.create(input), undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  updateQuestAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const questCode = Array.isArray(req.params.questCode) ? req.params.questCode[0] : req.params.questCode;
      const input = questAdminInputSchema.partial().parse(req.body);
      return sendSuccess(res, await questService.update(questCode, input));
    } catch (error) {
      next(error);
    }
  };

  /**
   * [GET /api/profile/kyc/card/:filename] Phục vụ an toàn ảnh Thẻ Sinh Viên KYC (Private Media Streaming - B1-2 Fix)
   */
  streamKycCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
      const user = authReq.user!;
      await profileService.streamKycCard(filename, user, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [GET /api/profile/admin/withdrawals] Admin lấy danh sách tất cả yêu cầu rút tiền
   */
  getAllWithdrawalsAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const status = req.query.status as string | undefined;
      const result = await profileService.getAllWithdrawalRequests(page, limit, status);
      return sendPaginated(res, result.requests, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  /**
   * [PATCH /api/profile/admin/withdrawals/:id] Admin duyệt hoặc từ chối yêu cầu rút tiền
   */
  processWithdrawalAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const withdrawalId = req.params.id as string;
      const { status, adminNote } = req.body;
      const result = await profileService.processWithdrawal(authReq.user!.userId, withdrawalId, {
        status,
        adminNote,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const profileController = new ProfileController();
