import { prisma } from '../../config/prisma';
import { firebaseMessaging } from '../../config/firebase';
import { emitToUser } from '../../utils/socket';
import { AppError } from '../../middlewares/error.middleware';
import { mailTransporter } from '../../config/mail';
import { ENV } from '../../config/env';
import { QueryNotificationsInput } from './notification.dto';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  body: string;
  type?: 'CHAT' | 'ORDER' | 'KYC' | 'SYSTEM';
  targetUrl?: string;
  // Hỗ trợ FCM Multicast: gửi đến 1 hoặc nhiều thiết bị cùng lúc
  fcmTokens?: string[];
  // Hỗ trợ gửi Email HTML song song (Nodemailer)
  email?: {
    to: string;
    subject?: string;
    html?: string;
  };
}

export class NotificationService {
  /**
   * 1. Tạo và gửi thông báo ĐA KÊNH:
   *    Kênh A: Lưu bản ghi In-app vào MongoDB
   *    Kênh B: Phát Realtime qua Socket.io Gateway → room user_${userId}
   *    Kênh C: Push FCM Multicast đến tất cả thiết bị của user
   *    Kênh D: Gửi Email HTML qua Nodemailer SMTP
   */
  async sendNotification(params: CreateNotificationParams) {
    const { userId, title, body, type = 'SYSTEM', targetUrl, fcmTokens, email } = params;

    // ─── Kênh A: Lưu bản ghi thông báo vào MongoDB ───
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

    // ─── Kênh B: Phát thông báo thời gian thực qua WebSocket Gateway ───
    emitToUser(userId, 'new_notification', notification);

    // ─── Kênh C: Push FCM Multicast đến nhiều thiết bị ───
    let tokensToSend = fcmTokens;
    if (!tokensToSend || tokensToSend.length === 0) {
      try {
        const stored = await prisma.deviceToken.findMany({
          where: { userId },
          select: { token: true },
        });
        tokensToSend = stored.map((t) => t.token);
      } catch (err: any) {
        console.warn('⚠️ [DeviceToken Lookup Warning]:', err.message);
      }
    }

    if (firebaseMessaging && tokensToSend && tokensToSend.length > 0) {
      // Lọc bỏ token rỗng
      const validTokens = tokensToSend.filter((t) => t && t.trim() !== '');

      if (validTokens.length > 0) {
        try {
          if (validTokens.length === 1) {
            // Gửi đến 1 thiết bị duy nhất
            await firebaseMessaging.send({
              token: validTokens[0],
              notification: { title, body },
              data: {
                notificationId: notification.id,
                type,
                ...(targetUrl && { targetUrl }),
              },
            });
          } else {
            // FCM Multicast: Gửi đồng thời đến nhiều thiết bị (tối đa 500 token/lần)
            const multicastRes = await firebaseMessaging.sendEachForMulticast({
              tokens: validTokens,
              notification: { title, body },
              data: {
                notificationId: notification.id,
                type,
                ...(targetUrl && { targetUrl }),
              },
            });

            // Tự động dọn dẹp các token bị lỗi / đã hết hạn / uninstalled
            const deadTokens: string[] = [];
            multicastRes.responses.forEach((resp, idx) => {
              if (!resp.success && resp.error) {
                const code = resp.error.code;
                if (
                  code === 'messaging/invalid-registration-token' ||
                  code === 'messaging/registration-token-not-registered'
                ) {
                  deadTokens.push(validTokens[idx]);
                }
              }
            });

            if (deadTokens.length > 0) {
              await prisma.deviceToken
                .deleteMany({
                  where: { token: { in: deadTokens } },
                })
                .catch(() => {});
            }
          }
        } catch (fcmError: any) {
          console.warn('⚠️ [FCM Multicast Warning] Không thể gửi Push Notification:', fcmError.message);
        }
      }
    }

    // ─── Kênh D: Gửi Email HTML qua Nodemailer ───
    if (email && email.to) {
      try {
        const escapeHtml = (text: string) =>
          text.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] || m));

        const safeTitle = escapeHtml(title || '');
        const safeBody = escapeHtml(body || '');
        // Bảo mật F-14: Chỉ chấp nhận URL http://, https:// hoặc đường dẫn tương đối /, đồng thời HTML-escape chống XSS
        const isSafeUrl = typeof targetUrl === 'string' && /^(https?:\/\/|\/)/i.test(targetUrl.trim());
        const safeTargetUrl = isSafeUrl ? escapeHtml(targetUrl.trim()) : null;

        await mailTransporter.sendMail({
          from: ENV.EMAIL_FROM || `"Campus Marketplace FU" <${ENV.EMAIL_USER || 'no-reply@marketfu.com'}>`,
          to: email.to,
          subject: email.subject || `[MarketFU] ${safeTitle}`,
          html:
            email.html ||
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #F27024; text-align: center;">SÀN ĐỒ CŨ SINH VIÊN FU (MARKETFU)</h2>
              <h3 style="color: #333;">${safeTitle}</h3>
              <p style="color: #555; font-size: 15px;">${safeBody}</p>
              ${safeTargetUrl ? `<div style="text-align: center; margin: 25px 0;"><a href="${safeTargetUrl}" style="background-color: #F27024; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Xem Chi Tiết</a></div>` : ''}
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">Email này được gửi tự động từ hệ thống Campus Marketplace FPT University.</p>
            </div>
          `,
        });
      } catch (mailError: any) {
        console.warn('⚠️ [Nodemailer Warning] Không thể gửi email:', mailError.message);
      }
    }

    return notification;
  }

  /**
   * Push notification trực tiếp tới thiết bị không qua bản ghi DB (dùng cho chat ping realtime)
   */
  async sendPushOnly(userId: string, title: string, body: string, data?: Record<string, string>) {
    if (!firebaseMessaging) return;

    try {
      const storedTokens = await prisma.deviceToken.findMany({
        where: { userId },
        select: { token: true },
      });
      const validTokens = storedTokens.map((t) => t.token).filter((t) => t && t.trim() !== '');
      if (validTokens.length === 0) return;

      if (validTokens.length === 1) {
        await firebaseMessaging.send({
          token: validTokens[0],
          notification: { title, body },
          data: data || {},
        });
      } else {
        const res = await firebaseMessaging.sendEachForMulticast({
          tokens: validTokens,
          notification: { title, body },
          data: data || {},
        });

        const deadTokens: string[] = [];
        res.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const code = resp.error.code;
            if (
              code === 'messaging/invalid-registration-token' ||
              code === 'messaging/registration-token-not-registered'
            ) {
              deadTokens.push(validTokens[idx]);
            }
          }
        });

        if (deadTokens.length > 0) {
          await prisma.deviceToken
            .deleteMany({
              where: { token: { in: deadTokens } },
            })
            .catch(() => {});
        }
      }
    } catch (fcmError: any) {
      console.warn('⚠️ [FCM PushOnly Warning]:', fcmError.message);
    }
  }

  /**
   * Đăng ký hoặc cập nhật FCM device token cho người dùng
   */
  async registerDeviceToken(userId: string, token: string, deviceType?: string) {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      throw new AppError('Token thiết bị không hợp lệ', 400, 'INVALID_DEVICE_TOKEN');
    }

    const record = await prisma.deviceToken.upsert({
      where: { token: trimmedToken },
      create: {
        userId,
        token: trimmedToken,
        deviceType,
      },
      update: {
        userId,
        deviceType,
        updatedAt: new Date(),
      },
    });

    return record;
  }

  /**
   * Hủy đăng ký FCM device token (khi logout hoặc tắt thông báo)
   */
  async removeDeviceToken(userId: string, token: string) {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      throw new AppError('Token thiết bị không hợp lệ', 400, 'INVALID_DEVICE_TOKEN');
    }

    await prisma.deviceToken.deleteMany({
      where: {
        userId,
        token: trimmedToken,
      },
    });

    return { message: 'Đã hủy đăng ký token thiết bị thành công' };
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

export const notificationService = new NotificationService();
