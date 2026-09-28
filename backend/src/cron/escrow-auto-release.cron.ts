import cron from 'node-cron';
import { orderService } from '../modules/orders/order.service';

/**
 * Quét các đơn hàng SHIP_COD ở trạng thái DELIVERED đã qua 48h bao test KTX
 * (người mua không mở khiếu nại dispute) -> tự động chuyển COMPLETED và giải ngân Escrow cho người bán.
 * Chạy mỗi giờ một lần (tại phút thứ 15).
 */
export const runEscrowAutoReleaseJob = async (): Promise<void> => {
  try {
    const released = await orderService.autoCompleteDeliveredOrdersDue();
    if (released > 0) {
      console.log(`💰 [CRON JOB] Đã tự động hoàn tất và giải ngân Escrow cho ${released} đơn hàng.`);
    }
  } catch (error: any) {
    console.error('❌ [CRON JOB ERROR] Lỗi khi quét tự động giải ngân Escrow:', error.message);
  }
};

export const startEscrowAutoReleaseCron = (): void => {
  cron.schedule('15 * * * *', async () => {
    await runEscrowAutoReleaseJob();
  });

  console.log('🕒 [CRON] Đã khởi tạo lịch tự động giải ngân Escrow sau 48h (chạy mỗi giờ tại phút 15).');
};
