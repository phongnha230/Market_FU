import { Router } from 'express';
import { profileController } from './profile.controller';
import { productController } from '../products/product.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

// 1. Hồ sơ công khai của người bán khác (Public - không cần đăng nhập)
router.get('/public/:userId', profileController.getPublicProfile);

// 2. Các hành động quản lý hồ sơ của chính người dùng (Yêu cầu đăng nhập)
router.use(authenticate);

// Lấy hồ sơ cá nhân (hỗ trợ cả GET /api/profile và GET /api/profile/me)
router.get('/', profileController.getMyProfile);
router.get('/me', profileController.getMyProfile);

// Danh sách tin đăng cá nhân (alias tương thích)
router.get('/my-posts', productController.getMyProducts);

// Cập nhật thông tin cá nhân
router.patch('/', profileController.updateMyProfile);
router.patch('/me', profileController.updateMyProfile);

// Cập nhật số tài khoản ngân hàng
router.patch('/bank-account', profileController.updateBankAccount);

// Tải ảnh Thẻ Sinh Viên nộp xác thực KYC
router.post('/kyc', upload.single('cardImage'), profileController.submitKyc);
router.post('/kyc/student-card', upload.single('cardImage'), profileController.submitKyc);

// Phục vụ an toàn ảnh Thẻ Sinh Viên KYC (Private Media Streaming - B1-2 Fix)
router.get('/kyc/card/:filename', profileController.streamKycCard);

// Nộp hồ sơ Onboarding Người Bán (Họ tên, SĐT, Cơ sở, Ngân hàng + Thẻ SV)
router.post('/seller-onboarding', upload.single('cardImage'), profileController.submitSellerOnboarding);

// Mua huy hiệu / Khung avatar bằng Xu
router.post('/badges/buy', profileController.buyAvatarBadge);

// Rút tiền ví Xu tích lũy về tài khoản ngân hàng
router.post('/withdrawals', profileController.createWithdrawalRequest);
router.get('/withdrawals', profileController.getWithdrawalRequests);

// [ADMIN] Quản lý & duyệt các yêu cầu rút tiền của sinh viên
router.get('/admin/withdrawals', authorize('ADMIN'), profileController.getAllWithdrawalsAdmin);
router.patch('/admin/withdrawals/:id', authorize('ADMIN'), profileController.processWithdrawalAdmin);

// Xem lịch sử biến động sổ cái CoinTransaction
router.get('/coins/history', profileController.getCoinHistory);

// Quest catalogue is personalized from verified backend activity.
router.get('/quests', profileController.getQuests);
router.get('/admin/quests', authorize('ADMIN'), profileController.getQuestsAdmin);
router.post('/admin/quests', authorize('ADMIN'), profileController.createQuestAdmin);
router.patch('/admin/quests/:questCode', authorize('ADMIN'), profileController.updateQuestAdmin);

// Điểm danh nhận Xu hàng ngày & Nhiệm vụ tuần
router.get('/check-in-status', profileController.getCheckInStatus);
router.post('/check-in', profileController.checkInDaily);
router.post('/claim-quest', profileController.claimQuest);

export default router;
