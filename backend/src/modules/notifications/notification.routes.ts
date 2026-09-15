import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

router.use(authenticate);

router.get('/', notificationController.getUserNotifications.bind(notificationController));
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));
router.patch('/:id/read', notificationController.markAsRead.bind(notificationController));
router.patch('/read-all', notificationController.markAllAsRead.bind(notificationController));

export default router;
