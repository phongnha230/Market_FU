import { Router } from 'express';
import { reportController } from './report.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Toàn bộ các endpoint trong module này đều yêu cầu đăng nhập
router.use(authenticate);

// ============================================================================
// 1. KHIẾU NẠI ĐỔI TRẢ (DISPUTES) - Cần đặt trước route `/:id`
// ============================================================================
// Người mua mở khiếu nại đơn hàng
router.post('/disputes', reportController.createDispute);

// Admin xem danh sách khiếu nại
router.get('/disputes', authorize('ADMIN'), reportController.getDisputes);

// Xem chi tiết 1 khiếu nại
router.get('/disputes/:id', reportController.getDisputeById);

// Admin phân xử phán quyết khiếu nại (Hỗ trợ chung qua /resolve)
router.patch('/disputes/:id/resolve', authorize('ADMIN'), reportController.resolveDispute);

// Admin chấp thuận khiếu nại (Hoàn tiền người mua - Alias RESTful)
router.patch('/disputes/:id/approve', authorize('ADMIN'), reportController.approveDispute);

// Admin bác bỏ khiếu nại (Chuyển tiền người bán - Alias RESTful)
router.patch('/disputes/:id/reject', authorize('ADMIN'), reportController.rejectDispute);

// Người mua tự rút / hủy khiếu nại của chính mình
router.patch('/disputes/:id/cancel', reportController.cancelDispute);

// ============================================================================
// 2. DUYỆT THẺ SINH VIÊN KYC (MODERATION) - Cần đặt trước route `/:id`
// ============================================================================
// Admin xem danh sách hồ sơ xác thực KYC
router.get('/kyc/verifications', authorize('ADMIN'), reportController.getKycVerifications);

// Admin phê duyệt Thẻ SV (Tích Xanh + Thưởng Xu)
router.patch('/kyc/:id/approve', authorize('ADMIN'), reportController.approveKyc);

// Admin từ chối Thẻ SV
router.patch('/kyc/:id/reject', authorize('ADMIN'), reportController.rejectKyc);

// ============================================================================
// 3. TỐ CÁO VI PHẠM (REPORTS)
// ============================================================================
// Người dùng gửi báo cáo tố cáo vi phạm
router.post('/', reportController.createReport);

// Người dùng xem lịch sử các báo cáo của chính mình (B4-8)
router.get('/me', reportController.getMyReports);

// Admin xem danh sách báo cáo
router.get('/', authorize('ADMIN'), reportController.getReports);

// Admin xem thống kê doanh số theo học kỳ & campus
router.get('/analytics/semesters', authorize('ADMIN'), reportController.getSemesterAnalytics);

// Admin xem chi tiết 1 báo cáo
router.get('/:id', authorize('ADMIN'), reportController.getReportById);

// Admin giải quyết xử lý báo cáo
router.patch('/:id/resolve', authorize('ADMIN'), reportController.resolveReport);

export default router;
