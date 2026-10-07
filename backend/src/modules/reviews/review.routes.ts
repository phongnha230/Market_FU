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

export default router;
