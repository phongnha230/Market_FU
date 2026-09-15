import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const paymentController = new PaymentController();

// 1. [WEB] Tạo link thanh toán PayOS Checkout (Yêu cầu đăng nhập)
router.post('/payos/create-link', authenticate, paymentController.createPayOsLink.bind(paymentController));

// 2. [WEBHOOK] Nhận thông báo thanh toán tự động từ máy chủ PayOS (Public IPN Callback)
router.post('/payos/webhook', paymentController.handlePayOsWebhook.bind(paymentController));

// 3. [WEB & ANDROID] Tra cứu thông tin thanh toán của đơn hàng (Web PayOS link + Android VietQR)
router.get('/order/:orderId', authenticate, paymentController.getPaymentInfo.bind(paymentController));

export default router;
