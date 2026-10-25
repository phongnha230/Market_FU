import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { reviewService } from './review.service';
import { createReviewSchema, queryUserReviewsSchema, updateReviewSchema } from './review.dto';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class ReviewController {
  /**
   * POST /api/reviews
   * Viết đánh giá 2 chiều
   */
  async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createReviewSchema.parse(req.body);
      const review = await reviewService.createReview(req.user!.userId, validated);
      return sendSuccess(res, review, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reviews/user/:userId
   * Lấy danh sách đánh giá công khai của một User (kèm thống kê sao)
   */
  async getUserReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const query = queryUserReviewsSchema.parse(req.query);
      const result = await reviewService.getUserReviews(
        req.params.userId as string,
        query
      );
      return sendPaginated(
        res,
        result.reviews,
        {
          ...result.pagination,
          stats: result.stats,
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reviews/order/:orderId
   * Lấy đánh giá của một đơn hàng
   */
  async getOrderReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewService.getOrderReviews(req.user!.userId, req.params.orderId as string);
      return sendSuccess(res, reviews);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/reviews/:id
   * Chỉnh sửa đánh giá theo reviewId
   */
  async updateReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateReviewSchema.parse(req.body);
      const updated = await reviewService.updateReview(req.user!.userId, req.params.id as string, validated);
      return sendSuccess(res, updated, { message: 'Cập nhật đánh giá thành công' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/reviews/order/:orderId
   * Chỉnh sửa đánh giá theo orderId / orderCode
   */
  async updateReviewByOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateReviewSchema.parse(req.body);
      const updated = await reviewService.updateReviewByOrder(req.user!.userId, req.params.orderId as string, validated);
      return sendSuccess(res, updated, { message: 'Cập nhật đánh giá thành công' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/reviews/:id/toggle-public
   * Chuyển đổi trạng thái công khai của đánh giá (Dev/Demo/Manual unlock)
   */
  async toggleReviewPublic(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const updated = await reviewService.toggleReviewPublic(req.user!.userId, req.params.id as string);
      return sendSuccess(res, updated, { message: 'Chuyển trạng thái công khai thành công' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/reviews/order/:orderId/reply
   * Người bán phản hồi đánh giá của người mua
   */
  async replyReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { replyComment } = req.body;
      const targetId = (req.params.orderId || req.params.id) as string;
      const updated = await reviewService.replyReview(
        req.user!.userId,
        targetId,
        replyComment
      );
      return sendSuccess(res, updated, { message: 'Đã gửi phản hồi đánh giá thành công' });
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();

