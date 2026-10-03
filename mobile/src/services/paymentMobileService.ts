import apiClient, { ApiResponse } from './apiClient';

export interface PaymentStatusResponse {
  isPaid: boolean;
  orderCode: string;
  amount?: number;
  paidAt?: string;
  status?: string;
}

export interface VietQrInvoice {
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: number;
  description: string;
  qrCodeUrl: string;
}

export const paymentMobileService = {
  /**
   * Tạo thông tin chuyển khoản VietQR Napas 24/7 nạp tiền / nạp Xu vào ví
   */
  createDepositInvoice(amount: number, userId: string): VietQrInvoice {
    const safeAmount = Math.max(10000, Number(amount));
    const bankId = 'MB';
    const bankName = 'MBBank - Ngân Hàng Quân Đội';
    const accountNo = '0335889999';
    const accountName = 'CHO SINH VIEN FPT';
    const shortUserId = userId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || 'SVFPT';
    const timestamp = Date.now().toString().slice(-4);
    const description = `FUMKT NAP ${shortUserId} ${timestamp}`;

    const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${safeAmount}&addInfo=${encodeURIComponent(
      description
    )}&accountName=${encodeURIComponent(accountName)}`;

    return {
      bankId,
      bankName,
      accountNo,
      accountName,
      amount: safeAmount,
      description,
      qrCodeUrl,
    };
  },

  /**
   * Kiểm tra trạng thái thanh toán từ backend
   */
  async checkPaymentStatus(orderCode: string): Promise<PaymentStatusResponse> {
    try {
      const res = await apiClient.get<ApiResponse<PaymentStatusResponse>>(
        `/payments/order/${orderCode}/status`
      );
      return res.data?.data || { isPaid: false, orderCode };
    } catch {
      return { isPaid: false, orderCode };
    }
  },
};

export default paymentMobileService;
