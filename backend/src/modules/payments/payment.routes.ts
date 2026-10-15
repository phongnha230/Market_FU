import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// B3-2/B3-3: Router webhook RIÊNG, mount tại /api/webhooks/payments để:
//  1) Trúng nhánh capture rawBody trong app.ts (cần cho xác thực HMAC)
//  2) Tách khỏi các route nghiệp vụ có auth
export const paymentWebhookRouter = Router();
paymentWebhookRouter.post('/payments', paymentController.handleWebhook);

// Check payment status
router.get('/order/:orderCode/status', authenticate, paymentController.getStatus);

export default router;
