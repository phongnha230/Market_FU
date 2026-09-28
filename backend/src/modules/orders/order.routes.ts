import { Router } from 'express';
import { orderController } from './order.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Tất cả các thao tác đơn hàng đều yêu cầu đăng nhập
router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/shipping/estimate', orderController.estimateShipping);
router.get('/:id', orderController.getOrderDetail);
router.post('/:id/handshake', orderController.verifyHandshake);
router.patch('/:id/shipping', orderController.updateShippingStatus);
router.post('/:id/cancel', orderController.cancelOrder);

// Task 3.1: Người mua mở khiếu nại ngay trong trang chi tiết đơn hàng
// (Ủy quyền cho ReportService của BE-4 xử lý nghiệp vụ dispute)
router.post('/:id/dispute', orderController.createDisputeForOrder);

// Người mua xác nhận đã nhận hàng an toàn và giải phóng tiền Escrow
router.post('/:id/confirm-delivery', orderController.confirmDelivery);

export default router;
