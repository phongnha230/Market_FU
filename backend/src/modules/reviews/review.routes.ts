import { Router } from 'express';
import { ReviewController } from './review.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const reviewController = new ReviewController();

// Xem đánh giá công khai không nhất thiết phải đăng nhập
router.get('/user/:userId', reviewController.getUserReviews.bind(reviewController));

// Các hành động cần đăng nhập
router.post('/', authenticate, reviewController.createReview.bind(reviewController));
router.get('/order/:orderId', authenticate, reviewController.getOrderReviews.bind(reviewController));

export default router;
