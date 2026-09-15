import cron from 'node-cron';
import { prisma } from '../config/prisma';
import { deleteProductFromMeili } from '../config/meilisearch';
import { sendPostExpiringEmail } from '../config/mail';
import { NotificationService } from '../modules/notifications/notification.service';
import { ReviewService } from '../modules/reviews/review.service';

const notificationService = new NotificationService();
const reviewService = new ReviewService();

// Bộ nhớ lưu các bài đăng đã gửi cảnh báo trong chu kỳ hiện tại để tránh spam email 3 ngày liên tiếp
const warnedProductIds = new Set<string>();

/**
 * Quét các tin đăng trên hệ thống:
 * 1. Cảnh báo các tin đăng sắp hết hạn (còn <= 3 ngày và > 0 ngày) -> Gửi Email & Thông báo In-app (chỉ gửi 1 lần)
 * 2. Tự động chuyển các tin đăng quá 30 ngày (expiredAt <= now) sang trạng thái EXPIRED và ẩn khỏi Meilisearch
 */
export const runExpirePostsScan = async (): Promise<{ warnedCount: number; expiredCount: number }> => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  let warnedCount = 0;
  let expiredCount = 0;

  try {
    // 1. Quét tin đăng sắp hết hạn (Ngày 27 - còn <= 3 ngày)
    const expiringProducts = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE',
        expiredAt: {
          lte: threeDaysFromNow,
          gt: now,
        },
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    for (const product of expiringProducts) {
      if (!product.expiredAt) continue;

      // Tránh gửi cảnh báo lặp lại mỗi ngày cho cùng một bài đăng
      if (warnedProductIds.has(product.id)) {
        continue;
      }

      const diffMs = product.expiredAt.getTime() - now.getTime();
      const daysLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      // Gửi In-app Notification
      await notificationService.sendNotification({
        userId: product.sellerId,
        title: '⏳ Tin đăng sắp hết hạn',
        body: `Tin đăng "${product.title}" của bạn sẽ hết hạn sau ${daysLeft} ngày. Hãy gia hạn ngay để tiếp tục hiển thị trên sàn!`,
        type: 'SYSTEM',
        targetUrl: `/products/${product.id}`,
      });

      // Gửi Email cảnh báo
      if (product.seller?.email) {
        await sendPostExpiringEmail(product.seller.email, product.title, daysLeft);
      }

      warnedProductIds.add(product.id);
      warnedCount++;
    }

    // 2. Quét tin đăng đã quá hạn 30 ngày (expiredAt <= now)
    const expiredProducts = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE',
        expiredAt: {
          lte: now,
        },
      },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    for (const product of expiredProducts) {
      // Cập nhật trạng thái sang EXPIRED
      await prisma.product.update({
        where: { id: product.id },
        data: { status: 'EXPIRED' },
      });

      // Xóa khỏi bộ nhớ cảnh báo
      warnedProductIds.delete(product.id);

      // Gỡ khỏi Meilisearch
      await deleteProductFromMeili(product.id);

      // Gửi thông báo cho người bán
      await notificationService.sendNotification({
        userId: product.sellerId,
        title: '📦 Tin đăng đã hết hạn 30 ngày',
        body: `Tin đăng "${product.title}" của bạn đã hết hạn hiển thị. Bạn có thể bấm Gia hạn bất kỳ lúc nào để đăng lại lên sàn.`,
        type: 'SYSTEM',
        targetUrl: `/products/${product.id}`,
      });

      expiredCount++;
    }

    console.log(`🧹 [CRON POSTS] Quét hoàn tất: Đã nhắc nhở ${warnedCount} tin sắp hết hạn, tự động hết hạn ${expiredCount} tin.`);
  } catch (error) {
    console.error('❌ [CRON POSTS ERROR] Lỗi trong quá trình quét tin đăng hết hạn:', error);
  }

  return { warnedCount, expiredCount };
};

/**
 * Quét và tự động công khai các đánh giá ẩn (Blind Review) quá 7 ngày
 */
export const runBlindReviewScan = async (): Promise<{ publishedCount: number }> => {
  try {
    const result = await reviewService.autoPublishExpiredBlindReviews();
    if (result.publishedCount > 0) {
      console.log(`⭐ [CRON REVIEW] Đã tự động công khai ${result.publishedCount} đánh giá sau 7 ngày (Blind Review).`);
    }
    return result;
  } catch (error) {
    console.error('❌ [CRON REVIEW ERROR] Lỗi tự động công khai đánh giá:', error);
    return { publishedCount: 0 };
  }
};

/**
 * Khởi tạo Cron Job chạy định kỳ vào 00:00:00 mỗi ngày
 */
export const initCronJobs = () => {
  // Lập lịch: Chạy lúc 00:00 hàng ngày ('0 0 * * *')
  const task = cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [CRON] Bắt đầu chạy các tác vụ nền định kỳ 00:00...');
    await runExpirePostsScan();
    await runBlindReviewScan();
  });

  console.log('✅ [CRON] Đã kích hoạt Cron Jobs: Quét tin hết hạn 30 ngày & Tự động mở Blind Review 7 ngày');
  return task;
};
