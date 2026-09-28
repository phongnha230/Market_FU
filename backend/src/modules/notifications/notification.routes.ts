import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

router.use(authenticate);

router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.post('/fcm-token', notificationController.registerDeviceToken);
router.post('/device-token', notificationController.registerDeviceToken);
router.delete('/fcm-token', notificationController.removeDeviceToken);
router.delete('/device-token', notificationController.removeDeviceToken);

export default router;
