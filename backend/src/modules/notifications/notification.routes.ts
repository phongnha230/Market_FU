import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

// Lấy VAPID Public Key để Client trình duyệt đăng ký Web Push Service Worker
router.get('/vapid-public-key', notificationController.getVapidPublicKey);

router.use(authenticate);

router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.post('/fcm-token', notificationController.registerDeviceToken);
router.post('/device-token', notificationController.registerDeviceToken);
router.post('/test-push', notificationController.sendTestPush);
router.delete('/fcm-token', notificationController.removeDeviceToken);
router.delete('/device-token', notificationController.removeDeviceToken);
router.delete('/:id', notificationController.deleteNotification);
router.delete('/', notificationController.clearAllNotifications);

export default router;
