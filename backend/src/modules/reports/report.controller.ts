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
import { saveMediaToStorage } from '../../config/storage';
import { AppError } from '../../middlewares/error.middleware';

const reportService = new ReportService();

export class ReportController {
  // ==========================================================================
  // 1. BÁO CÁO VI PHẠM (REPORTS)
  // ==========================================================================

  createReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const reporterId = authReq.user!.userId;
      const input = CreateReportSchema.parse(req.body);
      const report = await reportService.createReport(reporterId, input);
      return sendSuccess(res, report, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  getMyReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const reporterId = authReq.user!.userId;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await reportService.getMyReports(reporterId, page, limit);
      return sendSuccess(res, result.reports, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  getReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = QueryReportsSchema.parse(req.query);
      const result = await reportService.getReports(query);
      return sendSuccess(res, result.reports, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  getReportById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await reportService.getReportById(req.params.id as string);
      return sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  };

  resolveReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = ResolveReportSchema.parse(req.body);
      const result = await reportService.resolveReport(req.params.id as string, input);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  // ==========================================================================
  // 2. KHIẾU NẠI ĐỔI TRẢ (DISPUTES)
  // ==========================================================================

  uploadEvidence = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('Vui lòng cung cấp tệp video hoặc hình ảnh bằng chứng', 400, 'FILE_MISSING');
      }

      const isVideo = req.file.mimetype.toLowerCase().startsWith('video/');
      const result = await saveMediaToStorage(req.file.buffer, 'disputes', isVideo ? 'video' : 'image');

      return sendSuccess(
        res,
        {
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: isVideo ? 'video' : 'image',
        },
        undefined,
        201
      );
    } catch (error) {
      next(error);
    }
  };

  createDispute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const buyerId = authReq.user!.userId;
      const input = CreateDisputeSchema.parse(req.body);
      const dispute = await reportService.createDispute(buyerId, input);
      return sendSuccess(res, dispute, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  getDisputes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = QueryDisputesSchema.parse(req.query);
      const result = await reportService.getDisputes(query);
      return sendSuccess(res, result.disputes, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  getDisputeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const dispute = await reportService.getDisputeById(authReq.user!, req.params.id as string);
      return sendSuccess(res, dispute);
    } catch (error) {
      next(error);
    }
  };

  resolveDispute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = ResolveDisputeSchema.parse(req.body);
      const result = await reportService.resolveDispute(req.params.id as string, input);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  approveDispute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = AdminApproveDisputeSchema.parse(req.body);
      const result = await reportService.approveDispute(req.params.id as string, input.adminNote);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  rejectDispute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = AdminRejectDisputeSchema.parse(req.body);
      const result = await reportService.rejectDispute(req.params.id as string, input.adminNote);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  cancelDispute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const buyerId = authReq.user!.userId;
      const input = CancelDisputeSchema.parse(req.body);
      const result = await reportService.cancelDispute(buyerId, req.params.id as string, input.reason);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  // ==========================================================================
  // 3. DUYỆT THẺ SINH VIÊN KYC (MODERATION)
  // ==========================================================================

  getKycVerifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = QueryKycSchema.parse(req.query);
      const result = await reportService.getKycVerifications(query);
      return sendSuccess(res, result.verifications, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  approveKyc = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const adminId = authReq.user!.userId;
      const input = ApproveKycSchema.parse(req.body);
      const result = await reportService.approveKyc(req.params.id as string, input, adminId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  rejectKyc = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const adminId = authReq.user!.userId;
      const input = RejectKycSchema.parse(req.body);
      const result = await reportService.rejectKyc(req.params.id as string, input, adminId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  scanKycWithAi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await reportService.scanKycWithAi(req.params.id as string);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  // ==========================================================================
  // 4. THỐNG KÊ DOANH SỐ HỌC KỲ (SEMESTER ANALYTICS)
  // ==========================================================================
  getSemesterAnalytics = async (req: Request, res: Response, next: NextFunction) => {
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
  };
}

export const reportController = new ReportController();
