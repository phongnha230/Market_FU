import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { ReportService } from './report.service';
import { createReportSchema, resolveReportSchema, resolveDisputeSchema, reviewKycSchema, queryAdminSchema } from './report.dto';
import { sendSuccess, sendPaginated } from '../../utils/response';

const reportService = new ReportService();

export class ReportController {
  // POST /api/reports (Người dùng gửi tố cáo)
  async createReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createReportSchema.parse(req.body);
      const report = await reportService.createReport(req.user!.userId, validated);
      return sendSuccess(res, report, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/reports (Danh sách tố cáo)
  async getAdminReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryAdminSchema.parse(req.query);
      const result = await reportService.getAdminReports(query);
      return sendPaginated(res, result.reports, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/admin/reports/:id/resolve (Xử lý tố cáo)
  async resolveReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reportId = req.params.id as string;
      const validated = resolveReportSchema.parse(req.body);
      const result = await reportService.resolveReport(req.user!.userId, reportId, validated);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/disputes (Danh sách khiếu nại)
  async getAdminDisputes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryAdminSchema.parse(req.query);
      const result = await reportService.getAdminDisputes(query);
      return sendPaginated(res, result.disputes, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/disputes/:id/resolve (Phán quyết khiếu nại)
  async resolveDispute(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const disputeId = req.params.id as string;
      const validated = resolveDisputeSchema.parse(req.body);
      const result = await reportService.resolveDispute(req.user!.userId, disputeId, validated);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/kyc-requests (Danh sách chờ duyệt Thẻ SV)
  async getAdminKycRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryAdminSchema.parse(req.query);
      const result = await reportService.getAdminKycRequests(query);
      return sendPaginated(res, result.kycRequests, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/admin/kyc/:id/review (Duyệt Thẻ SV)
  async reviewKyc(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const targetUserId = req.params.id as string;
      const validated = reviewKycSchema.parse(req.body);
      const result = await reportService.reviewKyc(req.user!.userId, targetUserId, validated);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
