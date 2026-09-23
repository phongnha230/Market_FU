import { Request, Response, NextFunction } from 'express';
import { ReportService } from './report.service';
import {
  CreateReportSchema,
  ResolveReportSchema,
  QueryReportsSchema,
  CreateDisputeSchema,
  ResolveDisputeSchema,
  AdminApproveDisputeSchema,
  AdminRejectDisputeSchema,
  CancelDisputeSchema,
  QueryDisputesSchema,
  QueryKycSchema,
  ApproveKycSchema,
  RejectKycSchema,
} from './report.dto';
import { sendSuccess } from '../../utils/response';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { semesterAnalyticsService } from './analytics.service';

const reportService = new ReportService();

export class ReportController {
  // ==========================================================================
  // 1. BÁO CÁO VI PHẠM (REPORTS)
  // ==========================================================================

  async createReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reporterId = req.user!.userId;
      const input = CreateReportSchema.parse(req.body);
      const report = await reportService.createReport(reporterId, input);
      return sendSuccess(res, report, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reporterId = req.user!.userId;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await reportService.getMyReports(reporterId, page, limit);
      return sendSuccess(res, result.reports, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const query = QueryReportsSchema.parse(req.query);
      const result = await reportService.getReports(query);
      return sendSuccess(res, result.reports, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getReportById(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await reportService.getReportById(req.params.id as string);
      return sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const input = ResolveReportSchema.parse(req.body);
      const result = await reportService.resolveReport(req.params.id as string, input);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================================
  // 2. KHIẾU NẠI ĐỔI TRẢ (DISPUTES)
  // ==========================================================================

  async createDispute(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const buyerId = req.user!.userId;
      const input = CreateDisputeSchema.parse(req.body);
      const dispute = await reportService.createDispute(buyerId, input);
      return sendSuccess(res, dispute, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  async getDisputes(req: Request, res: Response, next: NextFunction) {
    try {
      const query = QueryDisputesSchema.parse(req.query);
      const result = await reportService.getDisputes(query);
      return sendSuccess(res, result.disputes, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getDisputeById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dispute = await reportService.getDisputeById(req.user!, req.params.id as string);
      return sendSuccess(res, dispute);
    } catch (error) {
      next(error);
    }
  }

  async resolveDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const input = ResolveDisputeSchema.parse(req.body);
      const result = await reportService.resolveDispute(req.params.id as string, input);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async approveDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const input = AdminApproveDisputeSchema.parse(req.body);
      const result = await reportService.approveDispute(req.params.id as string, input.adminNote);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async rejectDispute(req: Request, res: Response, next: NextFunction) {
    try {
      const input = AdminRejectDisputeSchema.parse(req.body);
      const result = await reportService.rejectDispute(req.params.id as string, input.adminNote);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async cancelDispute(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const buyerId = req.user!.userId;
      const input = CancelDisputeSchema.parse(req.body);
      const result = await reportService.cancelDispute(buyerId, req.params.id as string, input.reason);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================================
  // 3. DUYỆT THẺ SINH VIÊN KYC (MODERATION)
  // ==========================================================================

  async getKycVerifications(req: Request, res: Response, next: NextFunction) {
    try {
      const query = QueryKycSchema.parse(req.query);
      const result = await reportService.getKycVerifications(query);
      return sendSuccess(res, result.verifications, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async approveKyc(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const input = ApproveKycSchema.parse(req.body);
      const result = await reportService.approveKyc(req.params.id as string, input, adminId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async rejectKyc(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.userId;
      const input = RejectKycSchema.parse(req.body);
      const result = await reportService.rejectKyc(req.params.id as string, input, adminId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================================================
  // 4. THỐNG KÊ DOANH SỐ HỌC KỲ (SEMESTER ANALYTICS)
  // ==========================================================================
  async getSemesterAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { semester, campus } = req.query;
      const result = await semesterAnalyticsService.getSemesterAnalytics({
        semester: semester as string,
        campus: campus as string,
      });
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
