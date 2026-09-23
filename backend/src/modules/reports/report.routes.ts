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
router.post('/disputes', (req, res, next) =>
  reportController.createDispute(req, res, next)
);

// Admin xem danh sách khiếu nại
router.get('/disputes', authorize('ADMIN'), (req, res, next) =>
  reportController.getDisputes(req, res, next)
);

// Xem chi tiết 1 khiếu nại
router.get('/disputes/:id', (req, res, next) =>
  reportController.getDisputeById(req, res, next)
);

// Admin phân xử phán quyết khiếu nại (Hỗ trợ chung qua /resolve)
router.patch('/disputes/:id/resolve', authorize('ADMIN'), (req, res, next) =>
  reportController.resolveDispute(req, res, next)
);

// Admin chấp thuận khiếu nại (Hoàn tiền người mua - Alias RESTful)
router.patch('/disputes/:id/approve', authorize('ADMIN'), (req, res, next) =>
  reportController.approveDispute(req, res, next)
);

// Admin bác bỏ khiếu nại (Chuyển tiền người bán - Alias RESTful)
router.patch('/disputes/:id/reject', authorize('ADMIN'), (req, res, next) =>
  reportController.rejectDispute(req, res, next)
);

// Người mua tự rút / hủy khiếu nại của chính mình
router.patch('/disputes/:id/cancel', (req, res, next) =>
  reportController.cancelDispute(req, res, next)
);

// ============================================================================
// 2. DUYỆT THẺ SINH VIÊN KYC (MODERATION) - Cần đặt trước route `/:id`
// ============================================================================
// Admin xem danh sách hồ sơ xác thực KYC
router.get('/kyc/verifications', authorize('ADMIN'), (req, res, next) =>
  reportController.getKycVerifications(req, res, next)
);

// Admin phê duyệt Thẻ SV (Tích Xanh + Thưởng Xu)
router.patch('/kyc/:id/approve', authorize('ADMIN'), (req, res, next) =>
  reportController.approveKyc(req, res, next)
);

// Admin từ chối Thẻ SV
router.patch('/kyc/:id/reject', authorize('ADMIN'), (req, res, next) =>
  reportController.rejectKyc(req, res, next)
);

// ============================================================================
// 3. TỐ CÁO VI PHẠM (REPORTS)
// ============================================================================
// Người dùng gửi báo cáo tố cáo vi phạm
router.post('/', (req, res, next) => reportController.createReport(req, res, next));

// Người dùng xem lịch sử các báo cáo của chính mình (B4-8)
router.get('/me', (req, res, next) => reportController.getMyReports(req, res, next));

// Admin xem danh sách báo cáo
router.get('/', authorize('ADMIN'), (req, res, next) =>
  reportController.getReports(req, res, next)
);

// Admin xem thống kê doanh số theo học kỳ & campus
router.get('/analytics/semesters', authorize('ADMIN'), (req, res, next) =>
  reportController.getSemesterAnalytics(req, res, next)
);

// Admin xem chi tiết 1 báo cáo
router.get('/:id', authorize('ADMIN'), (req, res, next) =>
  reportController.getReportById(req, res, next)
);

// Admin giải quyết xử lý báo cáo
router.patch('/:id/resolve', authorize('ADMIN'), (req, res, next) =>
  reportController.resolveReport(req, res, next)
);

export default router;
