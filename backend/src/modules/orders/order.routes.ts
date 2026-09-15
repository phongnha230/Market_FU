import { Router } from 'express';
import { OrderController } from './order.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const orderController = new OrderController();

// 1. Quản lý Đơn hàng (Cần đăng nhập)
router.post('/', authenticate, orderController.createOrder.bind(orderController));
router.get('/', authenticate, orderController.getUserOrders.bind(orderController));
router.get('/:id', authenticate, orderController.getOrderById.bind(orderController));
router.post('/:id/handshake', authenticate, orderController.verifyHandshake.bind(orderController));
router.post('/:id/dispute', authenticate, orderController.createDispute.bind(orderController));

export default router;
