import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { emitToUser } from '../../utils/socket';
import { notificationService } from '../notifications/notification.service';
import { CreateReviewInput, QueryUserReviewsInput } from './review.dto';

/** Task 3.3: Thưởng Xu cho người mua viết đánh giá (+100, kèm video test: +200) */
const REVIEW_COIN_BASE = 100;
const REVIEW_COIN_WITH_VIDEO = 200;
/** Task 3.3: Người bán đánh giá 5 sao -> +5 điểm uy tín */
const FIVE_STAR_SELLER_REPUTATION = 5;
/** Task 3.3: Blind review tự mở công khai sau 7 ngày kể từ khi đơn COMPLETED */
const BLIND_REVEAL_DAYS = 7;

export class ReviewService {
  /**
   * 1. Gửi đánh giá 2 chiều theo Blind Review Pattern (Task 3.3)
   * Đánh giá lưu isPublic = false. Công khai đồng thời khi CẢ HAI BÊN đã đánh giá,
   * hoặc sau 7 ngày kể từ khi đơn COMPLETED (cron revealBlindReviews).
   */
  async createReview(reviewerId: string, input: CreateReviewInput) {
    const { orderId, rating, comment, images, proofVideoUrl } = input;

    // 1. Kiểm tra đơn hàng
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        reviews: true,
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.status !== 'COMPLETED') {
      throw new AppError('Chỉ có thể đánh giá sau khi đơn hàng đã hoàn tất giao dịch thành công', 400, 'ORDER_NOT_COMPLETED');
    }

    // B3-7 (Task 3.3): Chỉ cho phép đánh giá khi đã HẾT thời gian bao test
    if (order.warrantyEndsAt && new Date() < order.warrantyEndsAt) {
      throw new AppError(
        'Vui lòng đợi hết thời gian bao test (24h/48h) để đánh giá chính xác chất lượng món đồ',
        400,
        'WARRANTY_STILL_ACTIVE'
      );
    }

    // 2. Xác định vai trò
    const isBuyer = order.buyerId === reviewerId;
    const isSeller = order.sellerId === reviewerId;

    if (!isBuyer && !isSeller) {
      throw new AppError('Bạn không phải là người mua hoặc người bán trong đơn hàng này', 403, 'FORBIDDEN');
    }

    const revieweeId = isBuyer ? order.sellerId : order.buyerId;

    // 3. Kiểm tra xem người này đã đánh giá đơn này chưa
    const existingReview = order.reviews.find((r) => r.reviewerId === reviewerId);
    if (existingReview) {
      throw new AppError('Bạn đã gửi đánh giá cho đơn hàng này rồi', 400, 'ALREADY_REVIEWED');
    }

    // 4. Kiểm tra xem đối tác đã gửi đánh giá trước đó chưa
    const partnerReview = order.reviews.find((r) => r.reviewerId === revieweeId);
    const shouldMakePublic = !!partnerReview; // Cả hai bên đã đánh giá -> Mở khóa công khai 2 chiều

    // Task 3.3: Người mua được tặng Xu (video test -> +200), người bán viết review không cộng Xu
    const coinReward = isBuyer ? (proofVideoUrl ? REVIEW_COIN_WITH_VIDEO : REVIEW_COIN_BASE) : 0;

    // 5. Thực thi Transaction: Tạo review, thưởng Coin và cập nhật reputationScore
    let newReview;
    try {
      newReview = await prisma.$transaction(async (tx) => {
        // Tạo review mới (B3-7: @@unique([orderId, reviewerId]) chặn double-submit thật sự ở DB)
        const created = await tx.review.create({
          data: {
            orderId,
            reviewerId,
            revieweeId,
            rating,
            comment,
            images: images ?? [],
            proofVideoUrl: proofVideoUrl ?? null,
            isPublic: shouldMakePublic,
            revealedAt: shouldMakePublic ? new Date() : null,
          },
        });

        // Nếu cả hai bên đều đã đánh giá -> Cập nhật review của đối tác sang isPublic = true
        if (shouldMakePublic && partnerReview) {
          await tx.review.update({
            where: { id: partnerReview.id },
            data: { isPublic: true, revealedAt: new Date() },
          });

          // Cộng điểm uy tín theo kết quả đánh giá của 2 chiều
          await this.applyReputationInsideTx(tx, revieweeId, rating);
          await this.applyReputationInsideTx(tx, reviewerId, partnerReview.rating);
        }

        // Thưởng Xu + ghi sổ cái CoinTransaction (B3-7: đủ balanceAfter)
        if (coinReward > 0) {
          const spendProfile = await tx.profile.updateMany({
            where: { userId: reviewerId },
            data: { campusCoins: { increment: coinReward } },
          });

          if (spendProfile.count > 0) {
            const updatedProfile = await tx.profile.findUnique({
              where: { userId: reviewerId },
              select: { campusCoins: true },
            });

            await tx.coinTransaction.create({
              data: {
                userId: reviewerId,
                amount: coinReward,
                balanceAfter: updatedProfile?.campusCoins ?? coinReward,
                type: 'REVIEW_REWARD',
                description: `Thưởng +${coinReward} Xu khi hoàn tất đánh giá đơn hàng #${order.orderCode}${proofVideoUrl ? ' (kèm video test)' : ''}`,
                referenceId: orderId,
              },
            });
          }
        }

        return created;
      });
    } catch (error) {
      // B3-7: Va chạm unique (orderId, reviewerId) => hai request gửi đồng thời
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppError('Bạn đã gửi đánh giá cho đơn hàng này rồi', 400, 'ALREADY_REVIEWED');
      }
      throw error;
    }

    // 6. Gửi thông báo Realtime & Push
    if (shouldMakePublic) {
      await notificationService.sendNotification({
        userId: revieweeId,
        title: 'Đánh giá 2 chiều đã mở khóa!',
        body: `Cả hai bên đã hoàn tất đánh giá cho đơn #${order.orderCode}. Điểm uy tín của bạn đã được cập nhật.`,
        type: 'ORDER',
        targetUrl: `/orders`,
      });
      emitToUser(revieweeId, 'review_revealed', { orderId, orderCode: order.orderCode });
      emitToUser(reviewerId, 'review_revealed', { orderId, orderCode: order.orderCode });
    } else {
      await notificationService.sendNotification({
        userId: revieweeId,
        title: 'Bạn có một đánh giá mới',
        body: `Đối tác đã gửi một đánh giá kín cho bạn trên đơn #${order.orderCode}. Hãy viết đánh giá của bạn để cùng mở khóa nhé!`,
        type: 'ORDER',
        targetUrl: `/orders/review?orderId=${order.id}`,
      });
      emitToUser(revieweeId, 'review_received_blind', { orderId, orderCode: order.orderCode });
    }

    return newReview;
  }

  /**
   * Cộng điểm uy tín cho 1 chiều đánh giá:
   * - Task 3.3: Người bán nhận 5 sao -> +5 điểm uy tín
   * - Các mức còn lại: thang điểm điều chỉnh (+2/0/-3/-7)
   * - Người mua được review -> +2 điểm uy tín giao dịch (Task 3.1)
   */
  private async applyReputationInsideTx(
    tx: Prisma.TransactionClient,
    userId: string,
    ratingReceived: number
  ): Promise<void> {
    let delta = 0;
    if (ratingReceived === 5) delta = FIVE_STAR_SELLER_REPUTATION;
    else if (ratingReceived === 4) delta = 2;
    else if (ratingReceived === 3) delta = 0;
    else if (ratingReceived === 2) delta = -3;
    else delta = -7;

    if (delta !== 0) {
      await tx.profile.update({
        where: { userId },
        data: { reputationScore: { increment: delta } },
      });
    }
  }

  /**
   * B3-7 (Task 3.3): Cron/Sweep — tự động công khai các đánh giá mù sau 7 ngày
   * kể từ khi đơn COMPLETED (khi 1 hoặc 2 bên chưa đánh giá). Áp dụng điểm uy tín
   * cho review đã có. Trả về số review được mở khóa.
   */
  async revealBlindReviewsDue(now: Date = new Date()): Promise<number> {
    const cutoff = new Date(now.getTime() - BLIND_REVEAL_DAYS * 24 * 60 * 60 * 1000);

    const hiddenReviews = await prisma.review.findMany({
      where: {
        isPublic: false,
        createdAt: { lte: cutoff },
        order: { status: { in: ['COMPLETED'] } },
      },
      include: { order: { select: { id: true, orderCode: true } } },
    });

    if (hiddenReviews.length === 0) return 0;

    let revealed = 0;
    for (const review of hiddenReviews) {
      await prisma.$transaction(async (tx) => {
        await tx.review.update({
          where: { id: review.id },
          data: { isPublic: true, revealedAt: new Date() },
        });
        await this.applyReputationInsideTx(tx, review.revieweeId, review.rating);
      });
      revealed += 1;
    }

    console.log(`🔓 [BLIND REVIEW] Đã công khai ${revealed} đánh giá quá hạn 7 ngày chưa mở khóa.`);
    return revealed;
  }

  /**
   * 2. Lấy danh sách đánh giá công khai của một User (hiển thị trên trang cá nhân Profile)
   */
  async getUserReviews(userId: string, query: QueryUserReviewsInput) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {
      revieweeId: userId,
      isPublic: true,
    };

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                  campus: true,
                },
              },
            },
          },
          order: {
            select: {
              orderCode: true,
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 3. Lấy đánh giá của một đơn hàng cụ thể
   */
  async getOrderReviews(userId: string, orderId: string) {
    const reviews = await prisma.review.findMany({
      where: { orderId },
      include: {
        reviewer: {
          select: {
            id: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                campus: true,
              },
            },
          },
        },
      },
    });

    // Chỉ hiển thị review nếu nó đã public hoặc chính user là người viết
    const visibleReviews = reviews.map((r) => {
      if (r.isPublic || r.reviewerId === userId) {
        return r;
      }
      return {
        id: r.id,
        orderId: r.orderId,
        reviewerId: r.reviewerId,
        revieweeId: r.revieweeId,
        rating: 0,
        comment: 'Đánh giá đang được ẩn (Blind Review) cho đến khi cả hai bên hoàn tất.',
        isPublic: false,
        createdAt: r.createdAt,
      };
    });

    return visibleReviews;
  }
}

export const reviewService = new ReviewService();
