import { Router } from 'express';
import { OrderController } from './order.controller';

const router = Router();
const orderController = new OrderController();

// Webhook từ đối tác giao hàng GHTK/GHN (Public endpoint có xác thực HMAC Signature)
router.post('/shipping', orderController.handleShippingWebhook.bind(orderController));

export default router;
