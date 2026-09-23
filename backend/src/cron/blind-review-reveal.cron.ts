import cron from 'node-cron';
import { reviewService } from '../modules/reviews/review.service';

/**
 * B3-7 (Task 3.3): Quét các đánh giá Blind Review quá 7 ngày chưa mở khóa
 * (bên còn lại không viết đánh giá) -> công khai đồng thời + áp dụng điểm uy tín.
 * Chạy 00:30 hàng ngày (lệch 30 phút so với cron dọn bài đăng để tránh dồn tải).
 */
export const runBlindReviewRevealJob = async (): Promise<void> => {
  try {
    const revealed = await reviewService.revealBlindReviewsDue();
    if (revealed > 0) {
      console.log(`🔓 [CRON JOB] Đã công khai ${revealed} đánh giá blind review quá hạn.`);
    }
  } catch (error: any) {
    console.error('❌ [CRON JOB ERROR] Lỗi khi quét blind review:', error.message);
  }
};

export const startBlindReviewRevealCron = (): void => {
  cron.schedule('30 0 * * *', async () => {
    await runBlindReviewRevealJob();
  });

  console.log('🕒 [CRON] Đã khởi tạo lịch công khai Blind Review 7 ngày (00:30 AM).');
};
