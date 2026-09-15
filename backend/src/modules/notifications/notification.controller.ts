import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { NotificationService } from './notification.service';
import { queryNotificationsSchema } from './notification.dto';
import { sendSuccess, sendPaginated } from '../../utils/response';

const notificationService = new NotificationService();

export class NotificationController {
  // GET /api/notifications
  async getUserNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = queryNotificationsSchema.parse(req.query);
      const result = await notificationService.getUserNotifications(req.user!.userId, query);
      return sendPaginated(res, result.notifications, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/notifications/unread-count
  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getUnreadCount(req.user!.userId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/notifications/:id/read
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notificationId = req.params.id as string;
      const result = await notificationService.markAsRead(req.user!.userId, notificationId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/notifications/read-all
  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllAsRead(req.user!.userId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
