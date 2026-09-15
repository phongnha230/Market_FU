import { Router } from 'express';
import { ReportController } from './report.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();
const reportController = new ReportController();

// 1. Sinh viên gửi tố cáo gian lận (Cần đăng nhập)
router.post('/reports', authenticate, reportController.createReport.bind(reportController));

// 2. Các tuyến đường Quản trị viên Admin (Yêu cầu Role = ADMIN)
router.get('/admin/reports', authenticate, authorize('ADMIN'), reportController.getAdminReports.bind(reportController));
router.patch('/admin/reports/:id/resolve', authenticate, authorize('ADMIN'), reportController.resolveReport.bind(reportController));

router.get('/admin/disputes', authenticate, authorize('ADMIN'), reportController.getAdminDisputes.bind(reportController));
router.post('/admin/disputes/:id/resolve', authenticate, authorize('ADMIN'), reportController.resolveDispute.bind(reportController));

router.get('/admin/kyc-requests', authenticate, authorize('ADMIN'), reportController.getAdminKycRequests.bind(reportController));
router.patch('/admin/kyc/:id/review', authenticate, authorize('ADMIN'), reportController.reviewKyc.bind(reportController));

export default router;
