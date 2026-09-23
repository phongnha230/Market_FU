import { Router } from 'express';
import { reviewController } from './review.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Tất cả endpoints review đều yêu cầu auth
router.use(authenticate);

router.post('/', reviewController.createReview);
router.get('/user/:userId', reviewController.getUserReviews);
router.get('/order/:orderId', reviewController.getOrderReviews);

export default router;
