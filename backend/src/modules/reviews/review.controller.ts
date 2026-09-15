import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { ReviewService } from './review.service';
import { createReviewSchema, queryUserReviewsSchema } from './review.dto';
import { sendSuccess, sendPaginated } from '../../utils/response';

const reviewService = new ReviewService();

export class ReviewController {
  // POST /api/reviews
  async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validated = createReviewSchema.parse(req.body);
      const result = await reviewService.createReview(req.user!.userId, validated);
      return sendSuccess(res, result, undefined, 201);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/reviews/user/:userId
  async getUserReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const targetUserId = req.params.userId as string;
      const query = queryUserReviewsSchema.parse(req.query);
      const result = await reviewService.getUserReviews(targetUserId, query);
      return sendPaginated(res, { reviews: result.reviews, stats: result.stats }, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/reviews/order/:orderId
  async getOrderReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId as string;
      const reviews = await reviewService.getOrderReviews(req.user!.userId, orderId);
      return sendSuccess(res, reviews);
    } catch (error) {
      next(error);
    }
  }
}
