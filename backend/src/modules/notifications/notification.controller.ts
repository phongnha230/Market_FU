import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { NotificationService } from './notification.service';
import { queryNotificationsSchema, registerDeviceTokenSchema, removeDeviceTokenSchema } from './notification.dto';
import { sendSuccess, sendPaginated } from '../../utils/response';
import { vapidPublicKey } from '../../config/webpush';

const notificationService = new NotificationService();

export class NotificationController {
  // GET /api/notifications
  getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const query = queryNotificationsSchema.parse(req.query);
      const result = await notificationService.getUserNotifications(authReq.user!.userId, query);
      return sendPaginated(res, result.notifications, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/notifications/unread-count
  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const result = await notificationService.getUnreadCount(authReq.user!.userId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/notifications/:id/read
  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const notificationId = req.params.id as string;
      const result = await notificationService.markAsRead(authReq.user!.userId, notificationId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/notifications/read-all
  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const result = await notificationService.markAllAsRead(authReq.user!.userId);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  // POST /api/notifications/fcm-token
  registerDeviceToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { token, deviceType } = registerDeviceTokenSchema.parse(req.body);
      const result = await notificationService.registerDeviceToken(authReq.user!.userId, token, deviceType);
      return sendSuccess(res, result, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/notifications/fcm-token
  removeDeviceToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { token } = removeDeviceTokenSchema.parse(req.body);
      const result = await notificationService.removeDeviceToken(authReq.user!.userId, token);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  // GET /api/notifications/vapid-public-key
  getVapidPublicKey = async (_req: Request, res: Response) => {
    return sendSuccess(res, { publicKey: vapidPublicKey });
  };
}
