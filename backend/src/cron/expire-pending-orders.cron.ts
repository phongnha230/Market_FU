import cron from 'node-cron';
import { orderService } from '../modules/orders/order.service';

/**
 * Quét và tự động hủy các đơn hàng PENDING đã quá hạn 15 phút mà người mua không thanh toán.
 * Giúp giải phóng sản phẩm về trạng thái AVAILABLE, hoàn trả FPT Coin và Voucher cho sinh viên.
 * Chạy định kỳ mỗi 2 phút một lần.
 */
export const runExpirePendingOrdersJob = async (): Promise<void> => {
  try {
    const count = await orderService.cancelExpiredPendingOrders(15);
    if (count > 0) {
      console.log(`🕒 [CRON JOB] Đã tự động hủy ${count} đơn hàng PENDING quá hạn thanh toán 15 phút.`);
    }
  } catch (error: any) {
    console.error('❌ [CRON JOB ERROR] Lỗi khi quét tự động hủy đơn PENDING quá hạn:', error.message);
  }
};

export const startExpirePendingOrdersCron = (): void => {
  cron.schedule('*/2 * * * *', async () => {
    await runExpirePendingOrdersJob();
  });

  console.log('🕒 [CRON] Đã khởi tạo lịch quét tự động hủy đơn PENDING quá hạn 15 phút (mỗi 2 phút).');
};
