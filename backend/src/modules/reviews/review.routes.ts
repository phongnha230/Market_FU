import { Router } from 'express';
import { reviewController } from './review.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Xem đánh giá của một người dùng là công khai (hiển thị trên trang Profile người bán)
router.get('/user/:userId', reviewController.getUserReviews);

// Các thao tác tạo review hoặc xem review đơn hàng nội bộ yêu cầu xác thực
router.use(authenticate);

router.post('/', reviewController.createReview);
router.get('/order/:orderId', reviewController.getOrderReviews);
router.patch('/order/:orderId', reviewController.updateReviewByOrder);
router.patch('/:id', reviewController.updateReview);
router.post('/order/:orderId/toggle-public', reviewController.toggleReviewPublic);
router.post('/:id/toggle-public', reviewController.toggleReviewPublic);
router.post('/order/:orderId/reply', reviewController.replyReview);
router.post('/:id/reply', reviewController.replyReview);

export default router;
