import { prisma } from '../../config/prisma';
import { firebaseMessaging } from '../../config/firebase';
import { emitToUser } from '../../utils/socket';
import { AppError } from '../../middlewares/error.middleware';
import { QueryNotificationsInput } from './notification.dto';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  body: string;
  type?: 'CHAT' | 'ORDER' | 'KYC' | 'SYSTEM';
  targetUrl?: string;
  fcmToken?: string;
}

export class NotificationService {
  // 1. Tạo và gửi thông báo đa kênh (In-app + Realtime Socket + FCM Push)
  async sendNotification(params: CreateNotificationParams) {
    const { userId, title, body, type = 'SYSTEM', targetUrl, fcmToken } = params;

    // 1. Lưu bản ghi thông báo vào MongoDB
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
        targetUrl,
        isRead: false,
      },
    });

    // 2. Phát thông báo thời gian thực qua WebSocket Gateway (Socket.io)
    emitToUser(userId, 'new_notification', notification);

    // 3. Đẩy Push Notification qua Firebase Cloud Messaging (FCM) nếu có token
    if (firebaseMessaging && fcmToken) {
      try {
        await firebaseMessaging.send({
          token: fcmToken,
          notification: {
            title,
            body,
          },
          data: {
            notificationId: notification.id,
            type,
            ...(targetUrl && { targetUrl }),
          },
        });
      } catch (fcmError: any) {
        console.warn('⚠️ [FCM Warning] Không thể gửi Push Notification:', fcmError.message);
      }
    }

    return notification;
  }

  // 2. Lấy danh sách thông báo của người dùng kèm phân trang
  async getUserNotifications(userId: string, query: QueryNotificationsInput) {
    const { page, limit, type } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const [total, notifications] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. Đếm số thông báo chưa đọc
  async getUnreadCount(userId: string) {
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
    return { unreadCount };
  }

  // 4. Đánh dấu một thông báo là đã đọc
  async markAsRead(userId: string, notificationId: string) {
    const noti = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!noti) {
      throw new AppError('Thông báo không tồn tại', 404, 'NOTIFICATION_NOT_FOUND');
    }

    if (noti.userId !== userId) {
      throw new AppError('Bạn không có quyền sửa thông báo này', 403, 'FORBIDDEN');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  }

  // 5. Đánh dấu tất cả thông báo là đã đọc
  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { modifiedCount: result.count };
  }
}
