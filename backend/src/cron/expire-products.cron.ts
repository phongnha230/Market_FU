import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { sendPostExpiringEmail } from '../config/mail';
import { notificationService } from '../modules/notifications/notification.service';
import { getCache, setCache } from '../config/redis';

/**
 * Tác vụ ngầm dọn dẹp và cảnh báo tin đăng hết hạn:
 * 1. Chuyển trạng thái 'AVAILABLE' -> 'EXPIRED' cho các bài đăng quá hạn 30 ngày
 * 2. Gửi Email & In-app Push nhắc nhở người bán vào ngày thứ 27 (còn 3 ngày) để gia hạn thêm 30 ngày
 */
export const runExpireProductsJob = async (): Promise<void> => {
  console.log('⏰ [CRON JOB] Đang chạy tác vụ kiểm tra hạn bài đăng sản phẩm...');

  const now = new Date();

  try {
    // ─── 1. TỰ ĐỘNG CHUYỂN BÀI VIẾT QUÁ HẠN 30 NGÀY THÀNH 'EXPIRED' ───
    const expireResult = await prisma.product.updateMany({
      where: {
        status: 'AVAILABLE',
        expiredAt: {
          lte: now,
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    if (expireResult.count > 0) {
      console.log(`🧹 [CRON JOB] Đã tự động ẩn ${expireResult.count} bài đăng quá hạn 30 ngày.`);
    }

    // ─── 2. CẢNH BÁO BÀI ĐĂNG SẮP HẾT HẠN (NGÀY 27: CÒN 3 NGÀY NỮA HẾT HẠN) ───
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const expiringProducts = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE',
        expiredAt: {
          gte: twoDaysFromNow,
          lte: threeDaysFromNow,
        },
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (expiringProducts.length > 0) {
      console.log(`⏳ [CRON JOB] Tìm thấy ${expiringProducts.length} bài đăng sắp hết hạn sau 3 ngày. Đang gửi email & thông báo...`);

      // B4-6: Batch xử lý song song với Promise.allSettled và khử trùng lặp qua cache (7 ngày)
      await Promise.allSettled(
        expiringProducts.map(async (prod) => {
          const reminderKey = `expiring_reminder:${prod.id}:${prod.expiredAt?.toISOString().slice(0, 10)}`;
          const alreadySent = await getCache<boolean>(reminderKey);
          if (alreadySent) {
            return;
          }

          try {
            // Gửi email nhắc nhở gia hạn
            if (prod.seller?.email) {
              await sendPostExpiringEmail(
                prod.seller.email,
                prod.title,
                3,
                `${process.env.CLIENT_URL || 'http://localhost:5173'}/products/${prod.id}`
              );
            }

            // Bắn thông báo In-app và Push Noti
            await notificationService.sendNotification({
              userId: prod.sellerId,
              title: '⏳ Tin đăng sắp hết hạn sau 3 ngày',
              body: `Món đồ "${prod.title}" sẽ tự động hết hạn sau 3 ngày nữa. Hãy bấm vào để gia hạn thêm 30 ngày hoàn toàn miễn phí!`,
              type: 'SYSTEM',
              targetUrl: `/products/${prod.id}`,
            });

            // Đánh dấu đã gửi nhắc nhở để tránh gửi trùng lặp
            await setCache(reminderKey, true, 7 * 86400);
          } catch (err: any) {
            console.warn(`⚠️ [CRON] Lỗi gửi nhắc nhở bài đăng ${prod.id}:`, err.message);
          }
        })
      );
    }

    console.log('✅ [CRON JOB] Hoàn tất quét kiểm tra hạn bài đăng.');
  } catch (error: any) {
    console.error('❌ [CRON JOB ERROR] Lỗi khi thực thi cron dọn bài đăng:', error.message);
  }
};

/**
 * Khởi động Scheduler chạy định kỳ mỗi ngày lúc 00:00:00 (Nửa đêm) theo giờ Việt Nam
 */
export const startExpireProductsCron = (): void => {
  // Biểu thức cron: 0 0 * * * (0h00 hàng ngày theo giờ Việt Nam - B4-6)
  cron.schedule(
    '0 0 * * *',
    async () => {
      await runExpireProductsJob();
    },
    { timezone: 'Asia/Ho_Chi_Minh' }
  );

  console.log('🕒 [CRON] Đã khởi tạo lịch quét bài đăng hết hạn hàng ngày (00:00 AM VN Time).');
};
