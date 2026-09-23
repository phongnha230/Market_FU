import { apiClient, ApiResponse } from './apiClient';

export interface PaymentStatusResult {
  orderCode: string;
  isPaid: boolean;
  paidAt?: string | null;
  totalAmount: number;
  paymentMethod?: string | null;
}

export const paymentService = {
  // 1. Kiểm tra trạng thái thanh toán từ backend
  async checkPaymentStatus(orderCode: string): Promise<PaymentStatusResult> {
    const response = await apiClient.get<ApiResponse<PaymentStatusResult>>(
      `/payments/order/${orderCode}/status`
    );
    return response.data.data;
  },
};
