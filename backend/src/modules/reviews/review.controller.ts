import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { reviewService } from './review.service';
import { createReviewSchema, queryUserReviewsSchema } from './review.dto';
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
}

export const reviewController = new ReviewController();
