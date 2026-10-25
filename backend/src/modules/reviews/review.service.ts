import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { emitToUser } from '../../utils/socket';
import { notificationService } from '../notifications/notification.service';
import { CreateReviewInput, QueryUserReviewsInput, UpdateReviewInput } from './review.dto';

/** Task 3.3: Thưởng Xu cho người mua viết đánh giá (+100, kèm video test: +200) */
const REVIEW_COIN_BASE = 100;
const REVIEW_COIN_WITH_VIDEO = 200;
/** Task 3.3: Người bán đánh giá 5 sao -> +5 điểm uy tín */
const FIVE_STAR_SELLER_REPUTATION = 5;


const isValidObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

export class ReviewService {
  /**
   * 1. Gửi đánh giá đơn hàng (Công khai tức thì, thưởng Xu & điểm uy tín)
   * Đánh giá lưu isPublic = true, công khai tức thì và cập nhật điểm uy tín ngay lập tức.
   */
  async createReview(reviewerId: string, input: CreateReviewInput) {
    const { orderId, rating, comment, images, proofVideoUrl } = input;

    // 1. Kiểm tra đơn hàng (hỗ trợ cả id MongoDB lẫn orderCode)
    const cleanCode = orderId.replace(/^#/, '');
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderId) ? [{ id: orderId }] : []),
          { orderCode: orderId },
          { orderCode: `#${cleanCode}` },
          { orderCode: cleanCode },
        ],
      },
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

    // 4. Hướng A: Đánh giá của Người Mua được CÔNG KHAI NGAY LẬP TỨC (Không cần chờ người bán)
    const shouldMakePublic = true;

    // Task 3.3: Người mua được tặng Xu (video test -> +200), người bán viết review không cộng Xu
    const coinReward = isBuyer ? (proofVideoUrl ? REVIEW_COIN_WITH_VIDEO : REVIEW_COIN_BASE) : 0;

    // 5. Thực thi Transaction: Tạo review, thưởng Coin và cập nhật reputationScore
    let newReview;
    try {
      newReview = await prisma.$transaction(async (tx) => {
        // Tạo review mới (B3-7: @@unique([orderId, reviewerId]) chặn double-submit thật sự ở DB)
        const created = await tx.review.create({
          data: {
            orderId: order.id,
            reviewerId,
            revieweeId,
            rating,
            comment,
            images: images ?? [],
            proofVideoUrl: proofVideoUrl ?? null,
            isPublic: true,
            revealedAt: new Date(),
          },
        });

        // Hướng A: Cộng điểm uy tín ngay lập tức cho Người Bán nhận đánh giá
        await this.applyReputationInsideTx(tx, revieweeId, rating);

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
                referenceId: order.id,
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

    // 6. Gửi thông báo Realtime & Push ngay lập tức cho Người Bán
    await notificationService.sendNotification({
      userId: revieweeId,
      title: '🎉 Bạn nhận được đánh giá mới!',
      body: `Người mua vừa đánh giá ${rating}★ cho đơn hàng #${order.orderCode}: "${comment || 'Rất hài lòng & uy tín'}"`,
      type: 'ORDER',
      targetUrl: `/orders`,
    });
    emitToUser(revieweeId, 'review_revealed', { orderId: order.id, orderCode: order.orderCode });
    emitToUser(reviewerId, 'review_revealed', { orderId: order.id, orderCode: order.orderCode });

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
   * 2. Lấy danh sách đánh giá công khai của một User (hiển thị trên trang cá nhân Profile)
   */
  async getUserReviews(userId: string, query: QueryUserReviewsInput) {
    const { page = 1, limit = 20, rating, type = 'received', hasImages } = query;
    const skip = (page - 1) * limit;

    const isObjectId = isValidObjectId(userId);
    let targetUserId = userId;
    if (!isObjectId) {
      const found = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userId.trim().toLowerCase() },
            { profile: { fullName: userId.trim() } },
          ],
        },
        select: { id: true },
      });
      if (found) targetUserId = found.id;
    }

    const baseWhere: Prisma.ReviewWhereInput = {
      ...(rating ? { rating } : {}),
      ...(hasImages ? { images: { isEmpty: false } } : {}),
    };

    if (type === 'given') {
      baseWhere.reviewerId = targetUserId;
    } else if (type === 'all') {
      baseWhere.OR = [
        { revieweeId: targetUserId },
        { reviewerId: targetUserId },
      ];
    } else {
      // Default: 'received'
      baseWhere.revieweeId = targetUserId;
    }

    const receivedStatsWhere = {
      revieweeId: targetUserId,
    };

    const [total, reviews, allReceivedReviews] = await Promise.all([
      prisma.review.count({ where: baseWhere }),
      prisma.review.findMany({
        where: baseWhere,
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
          reviewee: {
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
      prisma.review.findMany({
        where: receivedStatsWhere,
        select: { rating: true },
      }),
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumRating = 0;
    allReceivedReviews.forEach((r) => {
      sumRating += r.rating;
      if (r.rating in distribution) {
        distribution[r.rating as keyof typeof distribution]++;
      }
    });

    const averageRating =
      allReceivedReviews.length > 0
        ? Number((sumRating / allReceivedReviews.length).toFixed(1))
        : null;

    return {
      reviews,
      stats: {
        totalReceived: allReceivedReviews.length,
        averageRating,
        ratingDistribution: distribution,
      },
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
    const cleanCode = orderId.replace(/^#/, '');
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderId) ? [{ id: orderId }] : []),
          { orderCode: orderId },
          { orderCode: `#${cleanCode}` },
          { orderCode: cleanCode },
        ],
      },
      select: { id: true },
    });

    const targetOrderId = order ? order.id : orderId;

    const reviews = await prisma.review.findMany({
      where: { orderId: targetOrderId },
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

    // Hướng A: Đánh giá luôn công khai và minh bạch cho cả Người Mua & Người Bán
    return reviews;
  }

  /**
   * 4. Cập nhật / Chỉnh sửa đánh giá đã gửi
   */
  async updateReview(userId: string, reviewId: string, input: UpdateReviewInput) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Đánh giá không tồn tại', 404, 'REVIEW_NOT_FOUND');
    }

    if (review.reviewerId !== userId) {
      throw new AppError('Bạn không có quyền chỉnh sửa đánh giá này', 403, 'FORBIDDEN');
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(typeof input.rating === 'number' ? { rating: input.rating } : {}),
        ...(typeof input.comment === 'string' ? { comment: input.comment } : {}),
        ...(Array.isArray(input.images) ? { images: input.images } : {}),
        ...(input.proofVideoUrl !== undefined ? { proofVideoUrl: input.proofVideoUrl } : {}),
      },
    });

    return updated;
  }

  /**
   * 5. Cập nhật đánh giá theo orderId / orderCode
   */
  async updateReviewByOrder(userId: string, orderId: string, input: UpdateReviewInput) {
    const cleanCode = orderId.replace(/^#/, '');
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderId) ? [{ id: orderId }] : []),
          { orderCode: orderId },
          { orderCode: `#${cleanCode}` },
          { orderCode: cleanCode },
        ],
      },
      select: { id: true },
    });

    const targetOrderId = order ? order.id : orderId;
    const review = await prisma.review.findFirst({
      where: {
        orderId: targetOrderId,
        reviewerId: userId,
      },
    });

    if (!review) {
      throw new AppError('Đánh giá của bạn cho đơn hàng này không tồn tại', 404, 'REVIEW_NOT_FOUND');
    }

    return this.updateReview(userId, review.id, input);
  }

  /**
   * 6. Chuyển đổi trạng thái công khai sớm (Dev / Demo / Reveal toggle)
   */
  async toggleReviewPublic(userId: string, reviewIdOrOrderId: string) {
    let review = await prisma.review.findUnique({
      where: { id: reviewIdOrOrderId },
    });

    if (!review) {
      const cleanCode = reviewIdOrOrderId.replace(/^#/, '');
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            ...(isValidObjectId(reviewIdOrOrderId) ? [{ id: reviewIdOrOrderId }] : []),
            { orderCode: reviewIdOrOrderId },
            { orderCode: `#${cleanCode}` },
            { orderCode: cleanCode },
          ],
        },
        select: { id: true },
      });
      if (order) {
        review = await prisma.review.findFirst({
          where: { orderId: order.id, reviewerId: userId },
        });
      }
    }

    if (!review) {
      throw new AppError('Không tìm thấy đánh giá cần chuyển trạng thái', 404, 'REVIEW_NOT_FOUND');
    }

    if (review.reviewerId !== userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role !== 'ADMIN') {
        throw new AppError('Chỉ người đánh giá hoặc quản trị viên mới có quyền đổi trạng thái công khai', 403, 'FORBIDDEN');
      }
    }

    const updated = await prisma.review.update({
      where: { id: review.id },
      data: {
        isPublic: !review.isPublic,
        revealedAt: !review.isPublic ? new Date() : null,
      },
    });

    return updated;
  }

  /**
   * 7. Người bán phản hồi công khai đánh giá của người mua
   */
  async replyReview(sellerId: string, orderIdOrCode: string, replyComment: string) {
    if (!replyComment || !replyComment.trim()) {
      throw new AppError('Nội dung phản hồi không được để trống', 400, 'REPLY_EMPTY');
    }

    const cleanCode = orderIdOrCode.replace(/^#/, '').trim();
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(isValidObjectId(orderIdOrCode) ? [{ id: orderIdOrCode }] : []),
          { orderCode: orderIdOrCode },
          { orderCode: `#${cleanCode}` },
          { orderCode: cleanCode },
        ],
      },
      select: { id: true, sellerId: true, buyerId: true, orderCode: true },
    });

    let review: any = null;

    if (!order && isValidObjectId(orderIdOrCode)) {
      review = await prisma.review.findUnique({
        where: { id: orderIdOrCode },
        include: { order: { select: { id: true, sellerId: true, buyerId: true, orderCode: true } } },
      });
      if (review?.order) {
        order = review.order;
      }
    }

    if (!order && !review) {
      throw new AppError('Không tìm thấy đơn hàng cần phản hồi đánh giá', 404, 'ORDER_NOT_FOUND');
    }

    const effectiveSellerId = order?.sellerId || review?.revieweeId;

    if (effectiveSellerId !== sellerId) {
      const user = await prisma.user.findUnique({ where: { id: sellerId }, select: { role: true } });
      if (user?.role !== 'ADMIN') {
        throw new AppError('Chỉ người bán của đơn hàng này mới được quyền viết phản hồi', 403, 'FORBIDDEN');
      }
    }

    if (!review) {
      // Tìm đánh giá của người mua cho đơn này
      review = await prisma.review.findFirst({
        where: {
          orderId: order!.id,
          reviewerId: order!.buyerId,
        },
      });

      if (!review) {
        review = await prisma.review.findFirst({
          where: {
            orderId: order!.id,
            revieweeId: order!.sellerId,
          },
        });
      }
    }

    if (!review) {
      throw new AppError('Đơn hàng này chưa có đánh giá nào từ người mua để phản hồi', 404, 'REVIEW_NOT_FOUND');
    }

    const updated = await prisma.review.update({
      where: { id: review.id },
      data: {
        replyComment: replyComment.trim(),
        repliedAt: new Date(),
      },
    });

    // Gửi thông báo tới Người mua khi Người bán phản hồi
    const buyerId = order?.buyerId || (review.reviewerId !== sellerId ? review.reviewerId : null);
    if (buyerId) {
      prisma.user
        .findUnique({
          where: { id: sellerId },
          select: { profile: { select: { fullName: true } }, email: true },
        })
        .then((sellerUser) => {
          const sellerName = sellerUser?.profile?.fullName || sellerUser?.email?.split('@')[0] || 'Người bán';
          const snippet =
            replyComment.trim().length > 60
              ? `${replyComment.trim().slice(0, 57)}...`
              : replyComment.trim();

          const targetSellerId = effectiveSellerId || sellerId;
          const targetUrl = `/sellers/${targetSellerId}?tab=reviews&highlightReview=${review.id}`;

          return notificationService.sendNotification({
            userId: buyerId,
            title: `💬 ${sellerName} đã phản hồi đánh giá của bạn`,
            body: `"${snippet}"`,
            type: 'ORDER',
            targetUrl,
          });
        })
        .catch((err) => {
          console.warn('⚠️ [Review Reply Notification Error]:', err?.message);
        });
    }

    return updated;
  }
}

export const reviewService = new ReviewService();
