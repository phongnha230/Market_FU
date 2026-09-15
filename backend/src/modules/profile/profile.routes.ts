import { Router } from 'express';
import { profileController } from './profile.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

// 1. Hồ sơ công khai của người bán khác (Public - không cần đăng nhập)
router.get('/public/:userId', (req, res, next) =>
  profileController.getPublicProfile(req, res, next)
);

// 2. Các hành động quản lý hồ sơ của chính người dùng (Yêu cầu đăng nhập)
router.use(authenticate);

// Lấy hồ sơ cá nhân (hỗ trợ cả GET /api/profile và GET /api/profile/me)
router.get('/', (req, res, next) => profileController.getMyProfile(req, res, next));
router.get('/me', (req, res, next) => profileController.getMyProfile(req, res, next));

// Cập nhật thông tin cá nhân
router.patch('/', (req, res, next) => profileController.updateMyProfile(req, res, next));
router.patch('/me', (req, res, next) => profileController.updateMyProfile(req, res, next));

// Cập nhật số tài khoản ngân hàng
router.patch('/bank-account', (req, res, next) =>
  profileController.updateBankAccount(req, res, next)
);

// Tải ảnh Thẻ Sinh Viên nộp xác thực KYC
router.post('/kyc', upload.single('cardImage'), (req, res, next) =>
  profileController.submitKyc(req, res, next)
);

// Nộp hồ sơ Onboarding Người Bán (Họ tên, SĐT, Cơ sở, Ngân hàng + Thẻ SV)
router.post('/seller-onboarding', upload.single('cardImage'), (req, res, next) =>
  profileController.submitSellerOnboarding(req, res, next)
);

// Mua huy hiệu / Khung avatar bằng Xu
router.post('/badges/buy', (req, res, next) =>
  profileController.buyAvatarBadge(req, res, next)
);

// Rút tiền ví Xu tích lũy về tài khoản ngân hàng
router.post('/withdrawals', (req, res, next) =>
  profileController.createWithdrawalRequest(req, res, next)
);
router.get('/withdrawals', (req, res, next) =>
  profileController.getWithdrawalRequests(req, res, next)
);

// Xem lịch sử biến động sổ cái CoinTransaction
router.get('/coins/history', (req, res, next) =>
  profileController.getCoinHistory(req, res, next)
);

export default router;
