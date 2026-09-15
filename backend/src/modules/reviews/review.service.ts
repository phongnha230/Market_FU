import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { NotificationService } from '../notifications/notification.service';
import { emitToUser } from '../../utils/socket';
import { CreateReviewInput, QueryUserReviewsInput } from './review.dto';

const notificationService = new NotificationService();

export class ReviewService {
  // 1. Gửi đánh giá cho đối tác (Áp dụng Blind Review Pattern & Thưởng Xu Atomic)
  async createReview(userId: string, input: CreateReviewInput) {
    const { orderId, rating, comment, testVideoUrl } = input;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: { select: { id: true, title: true } },
      },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('Bạn không phải là người mua hoặc người bán của đơn hàng này', 403, 'FORBIDDEN');
    }

    if (order.status !== 'COMPLETED') {
      throw new AppError('Chỉ có thể đánh giá sau khi đơn hàng đã hoàn tất giao dịch (COMPLETED)', 400, 'ORDER_NOT_COMPLETED');
    }

    // Kiểm tra xem người này đã đánh giá đơn này chưa
    const existingReview = await prisma.review.findFirst({
      where: {
        orderId,
        reviewerId: userId,
      },
    });

    if (existingReview) {
      throw new AppError('Bạn đã gửi đánh giá cho đơn hàng này rồi', 400, 'ALREADY_REVIEWED');
    }

    const isBuyer = order.buyerId === userId;
    const revieweeId = isBuyer ? order.sellerId : order.buyerId;

    // Kiểm tra xem đối phương đã gửi đánh giá chưa
    const partnerReview = await prisma.review.findFirst({
      where: {
        orderId,
        reviewerId: revieweeId,
      },
    });

    // Blind Review Pattern:
    // - Nếu đối phương chưa đánh giá: Đánh giá này lưu isPublic = false (giữ bí mật chống trả đũa)
    // - Nếu đối phương đã đánh giá trước đó: Chuyển CẢ HAI đánh giá sang isPublic = true (công khai đồng thời)
    const isBothReviewed = Boolean(partnerReview);
    const isPublic = isBothReviewed;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo bản ghi review mới
      const newReview = await tx.review.create({
        data: {
          orderId,
          reviewerId: userId,
          revieweeId,
          rating,
          comment: comment?.trim() || null,
          isPublic,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
      });

      // 2. Nếu cả 2 cùng đánh giá xong, công khai review của đối phương
      if (isBothReviewed && partnerReview) {
        await tx.review.update({
          where: { id: partnerReview.id },
          data: { isPublic: true },
        });
      }

      // 3. Cơ chế thưởng Xu và Điểm uy tín
      // - Người mua: Tặng +100 Xu (kèm video test: +200 Xu) + 2 điểm uy tín
      if (isBuyer) {
        const coinBonus = testVideoUrl ? 200 : 100;
        await tx.profile.update({
          where: { userId },
          data: {
            campusCoins: { increment: coinBonus },
            reputationScore: { increment: 2 },
          },
        });

        const buyerProfile = await tx.profile.findUnique({ where: { userId } });
        await tx.coinTransaction.create({
          data: {
            userId,
            amount: coinBonus,
            balanceAfter: buyerProfile?.campusCoins || 0,
            type: 'REVIEW_REWARD',
            description: testVideoUrl
              ? 'Thưởng ' + coinBonus + ' Xu đánh giá đơn hàng #' + order.orderCode + ' (kèm video test lỗi)'
              : 'Thưởng ' + coinBonus + ' Xu đánh giá đơn hàng #' + order.orderCode,
          },
        });
      }

      // - Người bán: Nếu nhận được đánh giá 5 sao từ người mua -> Thưởng +5 điểm uy tín
      if (isBuyer && rating === 5) {
        await tx.profile.update({
          where: { userId: revieweeId },
          data: { reputationScore: { increment: 5 } },
        });
      }

      return newReview;
    });

    // Thông báo cho người nhận
    await notificationService.sendNotification({
      userId: revieweeId,
      title: '⭐ Bạn nhận được 1 đánh giá mới!',
      body: isBothReviewed
        ? 'Đối tác đã đánh giá món đồ "' + order.product.title + '". Cả hai đánh giá hiện đã được công khai trên hồ sơ cá nhân.'
        : 'Đối tác đã để lại đánh giá cho bạn về món đồ "' + order.product.title + '". Hãy gửi đánh giá lại để xem nhận xét nhé (Blind Review)!',
      type: 'ORDER',
      targetUrl: '/users/' + revieweeId + '/reviews',
    });

    emitToUser(revieweeId, 'new_review_received', {
      orderId,
      isPublic: isBothReviewed,
    });

    return {
      review: result,
      blindReviewActive: !isBothReviewed,
      message: isBothReviewed
        ? 'Đánh giá đã được công khai đồng thời trên trang cá nhân của cả 2 bên!'
        : 'Đánh giá của bạn đã được lưu kín. Đánh giá sẽ tự động công khai khi đối tác cũng hoàn thành đánh giá hoặc sau 7 ngày (Blind Review chống trả đũa).',
    };
  }

  // 2. Lấy danh sách đánh giá công khai của một người dùng kèm điểm số trung bình
  async getUserReviews(targetUserId: string, query: QueryUserReviewsInput) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [total, reviews, allPublicReviews] = await Promise.all([
      prisma.review.count({
        where: {
          revieweeId: targetUserId,
          isPublic: true,
        },
      }),
      prisma.review.findMany({
        where: {
          revieweeId: targetUserId,
          isPublic: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          reviewer: {
            select: {
              id: true,
              email: true,
              profile: {
                select: { fullName: true, avatarUrl: true, campus: true, avatarBadge: true },
              },
            },
          },
          order: {
            select: {
              id: true,
              orderCode: true,
              product: { select: { id: true, title: true, price: true, images: true } },
            },
          },
        },
      }),
      prisma.review.findMany({
        where: { revieweeId: targetUserId, isPublic: true },
        select: { rating: true },
      }),
    ]);

    const averageRating =
      allPublicReviews.length > 0
        ? Number((allPublicReviews.reduce((sum, r) => sum + r.rating, 0) / allPublicReviews.length).toFixed(1))
        : 5.0;

    const starCounts = {
      5: allPublicReviews.filter((r) => r.rating === 5).length,
      4: allPublicReviews.filter((r) => r.rating === 4).length,
      3: allPublicReviews.filter((r) => r.rating === 3).length,
      2: allPublicReviews.filter((r) => r.rating === 2).length,
      1: allPublicReviews.filter((r) => r.rating === 1).length,
    };

    return {
      reviews,
      stats: {
        totalReviews: total,
        averageRating,
        starCounts,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 3. Lấy đánh giá trong khuôn khổ một đơn hàng cụ thể
  async getOrderReviews(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError('Đơn hàng không tồn tại', 404, 'ORDER_NOT_FOUND');
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('Bạn không có quyền xem đánh giá của đơn hàng này', 403, 'FORBIDDEN');
    }

    const reviews = await prisma.review.findMany({
      where: { orderId },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    return reviews;
  }

  // 4. [CRON] Tự động công khai các đánh giá ẩn (Blind Review) sau 7 ngày
  async autoPublishExpiredBlindReviews() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const expiredReviews = await prisma.review.findMany({
      where: {
        isPublic: false,
        createdAt: { lte: sevenDaysAgo },
      },
      include: {
        order: { select: { id: true, orderCode: true, product: { select: { title: true } } } },
      },
    });

    let publishedCount = 0;
    for (const rev of expiredReviews) {
      await prisma.review.update({
        where: { id: rev.id },
        data: { isPublic: true },
      });

      await notificationService.sendNotification({
        userId: rev.revieweeId,
        title: '⭐ Đánh giá đã tự động công khai (Sau 7 ngày Blind Review)',
        body: `Đánh giá về món đồ "${rev.order.product.title}" của bạn đã được tự động hiển thị công khai trên hồ sơ cá nhân.`,
        type: 'ORDER',
        targetUrl: `/users/${rev.revieweeId}/reviews`,
      });

      publishedCount++;
    }

    return { publishedCount };
  }
}
