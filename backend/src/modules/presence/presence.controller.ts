import { Request, Response } from 'express';
import { presenceService } from './presence.service';
import { z } from 'zod';

const userIdSchema = z.string().min(1).max(100);
const userIdsSchema = z.object({ userIds: z.array(z.string().min(1).max(100)).max(100) });

export class PresenceController {
  /**
   * GET /api/presence/:userId
   */
  async getUserPresence(req: Request, res: Response) {
    try {
      const userId = userIdSchema.parse(req.params.userId);
      const presence = await presenceService.getUserPresence(userId);
      return res.json({
        success: true,
        data: presence,
      });
    } catch (error: any) {
      const statusCode = error instanceof z.ZodError ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: { message: error.message || 'Lỗi khi kiểm tra trạng thái online' },
      });
    }
  }

  /**
   * POST /api/presence/batch
   * Body: { userIds: string[] }
   */
  async getBatchPresence(req: Request, res: Response) {
    try {
      const { userIds } = userIdsSchema.parse(req.body);
      const batchResult = await presenceService.getBatchPresence(userIds);
      return res.json({
        success: true,
        data: batchResult,
      });
    } catch (error: any) {
      const statusCode = error instanceof z.ZodError ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: { message: error.message || 'Lỗi khi kiểm tra trạng thái online danh sách' },
      });
    }
  }
}
