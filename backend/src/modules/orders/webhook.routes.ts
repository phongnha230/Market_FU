import { Router } from 'express';
import { shippingWebhookController } from './webhook.controller';

const router = Router();

/**
 * POST /api/webhooks/shipping (Task 3.2)
 * Endpoint tiếp nhận thông tin trạng thái vận chuyển thời gian thực từ GHTK / GHN
 */
router.post('/shipping', shippingWebhookController.handleShippingWebhook);

export default router;
