import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { aiService } from './ai.service';
import { assistantChatSchema, querySessionsSchema } from './ai.dto';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { AppError } from '../../middlewares/error.middleware';

export class AiController {
  /**
   * POST /api/ai/vision-post
   * Quét ảnh món đồ bằng Gemini Vision để gợi ý thông tin đăng bài
   */
  async visionPost(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('Vui lòng tải lên một tệp hình ảnh (field: image)', 400, 'MISSING_IMAGE');
      }

      const result = await aiService.visionScanPost(req.file.buffer, req.file.mimetype);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/assistant-chat
   * Chatbot tư vấn tìm đồ phòng trọ theo giá và campus
   */
  async assistantChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = assistantChatSchema.parse(req.body);
      const result = await aiService.assistantChat(req.user!.userId, validatedData);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ai/sessions
   * Lấy danh sách các phiên trò chuyện với AI
   */
  async getUserSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = querySessionsSchema.parse(req.query);
      const { sessions, pagination } = await aiService.getUserSessions(
        req.user!.userId,
        query
      );
      return sendPaginated(res, sessions, pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ai/sessions/:id
   * Xem chi tiết lịch sử tin nhắn trong một phiên chat
   */
  async getSessionDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.id as string;
      const session = await aiService.getSessionDetail(req.user!.userId, sessionId);
      return sendSuccess(res, session);
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();
