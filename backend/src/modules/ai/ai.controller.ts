import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { AiService } from './ai.service';
import { assistantChatSchema } from './ai.dto';
import { sendSuccess } from '../../utils/response';
import { AppError } from '../../middlewares/error.middleware';

const aiService = new AiService();

export class AiController {
  // POST /api/ai/vision-post (Upload ảnh -> Trả về Form JSON tự động trong 3s)
  async analyzeProductImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('Vui lòng tải lên 1 tệp hình ảnh thực tế của món đồ', 400, 'IMAGE_REQUIRED');
      }

      const result = await aiService.analyzeProductImage(req.file.buffer, req.file.mimetype);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/ai/assistant-chat (Chatbot tư vấn tìm đồ trọ sinh viên)
  async assistantChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = assistantChatSchema.parse(req.body);
      const result = await aiService.assistantChat(req.user!.userId, validated);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ai/sessions (Danh sách các phiên trò chuyện)
  async getUserSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await aiService.getUserSessions(req.user!.userId);
      return sendSuccess(res, sessions);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/ai/sessions/:id (Lịch sử chi tiết một phiên)
  async getSessionMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.id as string;
      const session = await aiService.getSessionMessages(req.user!.userId, sessionId);
      return sendSuccess(res, session);
    } catch (error) {
      next(error);
    }
  }
}
