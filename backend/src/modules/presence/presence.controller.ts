import { Request, Response } from 'express';
import { presenceService } from './presence.service';

export class PresenceController {
  /**
   * GET /api/presence/:userId
   */
  async getUserPresence(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const presence = await presenceService.getUserPresence(userId);
      return res.json({
        success: true,
        data: presence,
      });
    } catch (error: any) {
      return res.status(500).json({
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
      const userIds = req.body?.userIds || [];
      const batchResult = await presenceService.getBatchPresence(userIds);
      return res.json({
        success: true,
        data: batchResult,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { message: error.message || 'Lỗi khi kiểm tra trạng thái online danh sách' },
      });
    }
  }
}
