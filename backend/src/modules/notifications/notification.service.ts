import { prisma } from '../../config/prisma';
import { firebaseMessaging } from '../../config/firebase';
import { emitToUser } from '../../utils/socket';
import { AppError } from '../../middlewares/error.middleware';
import { mailTransporter } from '../../config/mail';
import { ENV } from '../../config/env';
import { QueryNotificationsInput } from './notification.dto';
import { webpush } from '../../config/webpush';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  body: string;
  type?: 'CHAT' | 'ORDER' | 'KYC' | 'SYSTEM';
  targetUrl?: string;
  imageUrl?: string;
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

    // ─── Quy tắc Ma trận Phân luồng: CHAT tuyệt đối không gửi Email ───
    const safeEmail = type === 'CHAT' ? undefined : email;

    // ─── Kênh A: Lưu bản ghi thông báo vào MongoDB (Cực nhanh, ~3ms) ───
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

    // ─── Kênh B: Phát thông báo thời gian thực qua WebSocket Gateway (~0.5ms) ───
    emitToUser(userId, 'new_notification', notification);

    // ─── Kênh C & D: Đẩy việc gửi Push FCM & Email HTML sang Worker ngầm (Non-blocking I/O) ───
    // Caller API không phải đợi 2-3s của SMTP handshake, response trả về ngay tức thì!
    setImmediate(() => {
      this.dispatchBackgroundPushAndEmail(notification, params, fcmTokens, safeEmail).catch((err) => {
        console.warn('⚠️ [Background Notification Dispatch Warning]:', err?.message);
      });
    });

    return notification;
  }

  /**
   * Worker xử lý nền cho Push FCM Multicast và Nodemailer Email với cơ chế Retry
   */
  private async dispatchBackgroundPushAndEmail(
    notification: any,
    params: CreateNotificationParams,
    fcmTokens?: string[],
    email?: CreateNotificationParams['email']
  ) {
    const { userId, title, body, type = 'SYSTEM', targetUrl } = params;

    // ─── Kênh C: Push Notifications (Web Push VAPID & FCM Multicast Mobile) ───
    let allTokens: Array<{ token: string; deviceType: string | null }> = [];
    try {
      allTokens = await prisma.deviceToken.findMany({
        where: { userId },
        select: { token: true, deviceType: true },
      });
    } catch (err: any) {
      console.warn('⚠️ [DeviceToken Lookup Warning]:', err.message);
    }

    // Tách riêng Web Push token (JSON subscription) và Mobile FCM tokens
    const webTokens = allTokens.filter(
      (t) => (t.deviceType === 'WEB' && t.token.trim().startsWith('{')) || t.token.trim().startsWith('{"endpoint"')
    );

    // Tự động dọn dẹp các token rác/legacy string của WEB trong MongoDB
    const garbageWebTokens = allTokens
      .filter((t) => t.deviceType === 'WEB' && !t.token.trim().startsWith('{'))
      .map((t) => t.token);
    if (garbageWebTokens.length > 0) {
      prisma.deviceToken.deleteMany({ where: { token: { in: garbageWebTokens } } }).catch(() => {});
    }

    const mobileTokens = (fcmTokens && fcmTokens.length > 0)
      ? fcmTokens.filter((t) => t && !t.trim().startsWith('{'))
      : allTokens
          .filter((t) => t.deviceType !== 'WEB' && !t.token.trim().startsWith('{'))
          .map((t) => t.token);

    // C1: Gửi Web Push (Chuẩn W3C VAPID cho trình duyệt Chrome, Edge, Firefox, Safari)
    if (webTokens.length > 0) {
      const webPushPayload = JSON.stringify({
        title,
        body,
        type,
        targetUrl: targetUrl || '/',
        imageUrl: params.imageUrl,
        notificationId: notification.id,
      });

      for (const item of webTokens) {
        try {
          const subscription = JSON.parse(item.token);
          await webpush.sendNotification(subscription, webPushPayload);
        } catch (webPushErr: any) {
          // Mã 404/410: Subscription đã hết hạn hoặc người dùng đã xóa quyền trên trình duyệt
          if (webPushErr.statusCode === 404 || webPushErr.statusCode === 410) {
            await prisma.deviceToken.deleteMany({ where: { token: item.token } }).catch(() => {});
          } else {
            console.warn('⚠️ [WebPush Warning]:', webPushErr.message);
          }
        }
      }
    }

    // C2: Gửi FCM Multicast đến thiết bị di động (Android / iOS)
    if (firebaseMessaging && mobileTokens && mobileTokens.length > 0) {
      // Lọc bỏ token rỗng
      const validTokens = mobileTokens.filter((t) => t && t.trim() !== '');

      if (validTokens.length > 0) {
        try {
          const channelId =
            type === 'ORDER' ? 'orders_channel' : type === 'CHAT' ? 'chat_channel' : 'system_channel';

          const fcmNotificationPayload = {
            title,
            body,
            ...(params.imageUrl && { imageUrl: params.imageUrl }),
          };

          const fcmDataPayload: Record<string, string> = {
            notificationId: notification.id,
            type,
            ...(targetUrl && { targetUrl }),
          };

          const androidOptions = {
            priority: 'high' as const,
            notification: {
              channelId,
              sound: 'default',
              priority: 'max' as const,
              defaultSound: true,
              defaultVibrateTimings: true,
              ...(params.imageUrl && { imageUrl: params.imageUrl }),
            },
          };

          const apnsOptions = {
            headers: {
              'apns-priority': '10',
            },
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
              },
            },
          };

          if (validTokens.length === 1) {
            // Gửi đến 1 thiết bị duy nhất
            await firebaseMessaging.send({
              token: validTokens[0],
              notification: fcmNotificationPayload,
              data: fcmDataPayload,
              android: androidOptions,
              apns: apnsOptions,
            });
          } else {
            // FCM Multicast: Gửi đồng thời đến nhiều thiết bị (tối đa 500 token/lần)
            const multicastRes = await firebaseMessaging.sendEachForMulticast({
              tokens: validTokens,
              notification: fcmNotificationPayload,
              data: fcmDataPayload,
              android: androidOptions,
              apns: apnsOptions,
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

    // ─── Kênh D: Gửi Email HTML qua Nodemailer với 1-time Retry (Backoff) ───
    if (email && email.to) {
      const sendEmailAttempt = async () => {
        const escapeHtml = (text: string) =>
          text.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] || m));

        const safeTitle = escapeHtml(title || '');
        const safeBody = escapeHtml(body || '');
        // Bảo mật F-14: Chỉ chấp nhận URL http://, https:// hoặc đường dẫn tương đối /, đồng thời HTML-escape chống XSS
        const isSafeUrl = typeof targetUrl === 'string' && /^(https?:\/\/|\/)/i.test(targetUrl.trim());
        const fullUrl = isSafeUrl && targetUrl?.trim().startsWith('/')
          ? `${ENV.CLIENT_URL.replace(/\/$/, '')}${targetUrl.trim()}`
          : targetUrl?.trim();
        const safeTargetUrl = isSafeUrl && fullUrl ? escapeHtml(fullUrl) : null;

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
      };

      try {
        await sendEmailAttempt();
      } catch (firstErr: any) {
        // Tự động thử lại 1 lần sau 3 giây (Exponential Backoff) nếu mạng SMTP bị timeout
        setTimeout(async () => {
          try {
            await sendEmailAttempt();
          } catch (retryErr: any) {
            console.warn('⚠️ [Nodemailer Retry Failed] Không thể gửi email:', retryErr.message);
          }
        }, 3000);
      }
    }
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

      const pushChannelId =
        data?.type === 'ORDER' ? 'orders_channel' : data?.type === 'CHAT' ? 'chat_channel' : 'system_channel';

      const pushAndroidOptions = {
        priority: 'high' as const,
        notification: {
          channelId: pushChannelId,
          sound: 'default',
          priority: 'max' as const,
          defaultSound: true,
          defaultVibrateTimings: true,
          ...(data?.imageUrl && { imageUrl: data.imageUrl }),
        },
      };

      const pushApnsOptions = {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      };

      if (validTokens.length === 1) {
        await firebaseMessaging.send({
          token: validTokens[0],
          notification: { title, body },
          data: data || {},
          android: pushAndroidOptions,
          apns: pushApnsOptions,
        });
      } else {
        const res = await firebaseMessaging.sendEachForMulticast({
          tokens: validTokens,
          notification: { title, body },
          data: data || {},
          android: pushAndroidOptions,
          apns: pushApnsOptions,
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

    if (deviceType === 'WEB') {
      try {
        const parsed = JSON.parse(trimmedToken);
        if (!parsed.endpoint) {
          throw new Error('Thiếu trường endpoint');
        }
      } catch {
        throw new AppError(
          'Token Web Push phải là chuỗi JSON PushSubscription hợp lệ chứa endpoint',
          400,
          'INVALID_WEB_PUSH_SUBSCRIPTION'
        );
      }
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

  /**
   * 8. Gửi thử nghiệm Push Notification (Web Push VAPID & FCM Mobile) cho người dùng
   */
  async sendTestPushToUser(userId: string, title?: string, body?: string) {
    const testTitle = title || '🔔 [Test] Thông báo Thử Nghiệm Push';
    const testBody = body || 'Hệ thống Push Notification (FCM Mobile & WebPush) đang hoạt động chuẩn xác!';

    const noti = await this.sendNotification({
      userId,
      title: testTitle,
      body: testBody,
      type: 'SYSTEM',
      targetUrl: '/notifications',
    });

    const devices = await prisma.deviceToken.findMany({
      where: { userId },
      select: { deviceType: true, token: true, updatedAt: true },
    });

    return {
      message: 'Đã phát lệnh gửi Test Push Notification thành công',
      notificationId: noti.id,
      registeredDevicesCount: devices.length,
      devices: devices.map((d) => ({
        deviceType: d.deviceType || 'UNKNOWN',
        tokenPreview: d.token.length > 35 ? `${d.token.slice(0, 35)}...` : d.token,
        updatedAt: d.updatedAt,
      })),
    };
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

  // 6. Xóa một thông báo của người dùng
  async deleteNotification(userId: string, notificationId: string) {
    const noti = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!noti) {
      throw new AppError('Thông báo không tồn tại', 404, 'NOTIFICATION_NOT_FOUND');
    }

    if (noti.userId !== userId) {
      throw new AppError('Bạn không có quyền xóa thông báo này', 403, 'FORBIDDEN');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Đã xóa thông báo thành công', id: notificationId };
  }

  // 7. Xóa toàn bộ thông báo của người dùng
  async clearAllNotifications(userId: string) {
    const result = await prisma.notification.deleteMany({
      where: { userId },
    });

    return { message: 'Đã xóa toàn bộ thông báo', deletedCount: result.count };
  }
}

export const notificationService = new NotificationService();
