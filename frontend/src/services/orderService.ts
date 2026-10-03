import { apiClient, ApiResponse } from './apiClient';

export interface BackendOrder {
  id: string;
  orderCode: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  orderType: 'MEETUP' | 'SHIP_COD';
  status: 'PENDING' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  warrantyHours: number;
  warrantyEndsAt?: string;
  payment: {
    price: number;
    shippingFee: number;
    coinsUsed: number;
    coinDiscount: number;
    totalAmount: number;
    vietqrUrl?: string;
    payosOrderCode?: number;
    payosCheckoutUrl?: string;
    paymentMethod?: string;
    isPaid: boolean;
    paidAt?: string;
  };
  handshake?: {
    handshakeToken: string;
    handshakeOtp: string;
    isVerified: boolean;
    verifiedAt?: string;
  };
  shipping?: {
    shippingPartner: string;
    trackingCode?: string;
    receiverName: string;
    receiverPhone: string;
    shippingAddress: string;
    deliveredAt?: string;
  };
  product?: {
    id: string;
    title: string;
    price: number;
    images?: Array<{ imageUrl: string; isCover?: boolean }>;
    campus?: string;
    meetupLocation?: string;
  };
  buyer?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
      campus?: string;
      phoneNumber?: string;
    };
  };
  seller?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
      campus?: string;
      phoneNumber?: string;
    };
  };
  reviews?: any[];
  dispute?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderParams {
  productId: string;
  orderType: 'MEETUP' | 'SHIP_COD';
  coinsUsed?: number;
  deliveryNote?: string;
  paymentMethod?: 'VIETQR' | 'PAYOS_WEB' | 'CASH';
  shipping?: {
    receiverName: string;
    receiverPhone: string;
    shippingAddress: string;
    destinationCampus?: string;
    shippingPartner?: string;
  };
}

export const orderService = {
  // 1. Tạo đơn hàng mới
  async createOrder(params: CreateOrderParams): Promise<BackendOrder> {
    const response = await apiClient.post<ApiResponse<BackendOrder>>('/orders', params);
    return response.data.data;
  },

  // 2. Lấy danh sách đơn hàng
  async getOrders(params?: {
    status?: string;
    role?: 'BUYER' | 'SELLER';
    page?: number;
    limit?: number;
  }): Promise<{ orders: BackendOrder[]; pagination?: any }> {
    const response = await apiClient.get<ApiResponse<BackendOrder[]>>('/orders', { params });
    return {
      orders: response.data.data || [],
      pagination: response.data.meta,
    };
  },

  // 3. Lấy chi tiết đơn hàng
  async getOrderDetail(idOrCode: string): Promise<BackendOrder> {
    const response = await apiClient.get<ApiResponse<BackendOrder>>(`/orders/${idOrCode}`);
    return response.data.data;
  },

  // 4. Xác nhận QR Handshake hoặc mã OTP 6 số tại điểm hẹn Safe Handoff
  async verifyHandshake(
    orderId: string,
    params: { handshakeToken?: string; handshakeOtp?: string }
  ): Promise<BackendOrder> {
    const response = await apiClient.post<ApiResponse<BackendOrder>>(
      `/orders/${orderId}/handshake`,
      params
    );
    return response.data.data;
  },

  // 5. Cập nhật thông tin vận chuyển
  async updateShippingStatus(
    orderId: string,
    params: { status: 'SHIPPING' | 'DELIVERED'; trackingCode?: string; shippingPartner?: string }
  ): Promise<BackendOrder> {
    const response = await apiClient.patch<ApiResponse<BackendOrder>>(
      `/orders/${orderId}/shipping`,
      params
    );
    return response.data.data;
  },

  // 5.1. Tra cứu chi tiết tiến trình vận chuyển realtime (GHN/Hub 5 Campus)
  async getOrderTracking(orderIdOrCode: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/orders/${orderIdOrCode}/tracking`);
    return response.data.data;
  },

  // 6. Xác nhận nhận hàng & giải ngân Escrow
  async confirmDelivery(orderId: string): Promise<BackendOrder> {
    const response = await apiClient.post<ApiResponse<BackendOrder>>(
      `/orders/${orderId}/confirm-delivery`
    );
    return response.data.data;
  },

  // 7. Hủy đơn hàng
  async cancelOrder(orderId: string, reason?: string): Promise<BackendOrder> {
    const response = await apiClient.post<ApiResponse<BackendOrder>>(
      `/orders/${orderId}/cancel`,
      { reason }
    );
    return response.data.data;
  },

  // 7. Gửi đánh giá 2 chiều (Blind Review)
  async submitReview(params: {
    orderId: string;
    rating: number;
    comment?: string;
    images?: string[];
    proofVideoUrl?: string;
  }): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>('/reviews', params);
    return response.data.data;
  },

  // 8. Lấy đánh giá của đơn hàng
  async getOrderReviews(orderId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/reviews/order/${orderId}`);
    return response.data.data || [];
  },

  // 8.1. Lấy đánh giá của người dùng để hiển thị trên Hồ sơ (Profile Reviews)
  async getUserReviews(userId: string): Promise<any[]> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/reviews/user/${userId}`);
      return response.data.data?.reviews || response.data.data || [];
    } catch {
      return [];
    }
  },

  // 9. Kiểm tra trạng thái thanh toán từ Gateway
  async checkPaymentStatus(orderCode: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/payments/order/${orderCode}/status`);
    return response.data.data;
  },

  // 10. Tra cứu báo giá cước vận chuyển chuẩn 5 Campus
  async estimateShipping(params: {
    fromCampus: string;
    toCampus?: string;
    orderType?: 'MEETUP' | 'SHIP_COD';
  }): Promise<{
    shippingFee: number;
    estimatedDays: string;
    routeTitle: string;
    transitHub: string;
    trackingSteps: { title: string; desc: string }[];
  }> {
    const response = await apiClient.get<ApiResponse<any>>('/orders/shipping/estimate', {
      params,
    });
    return response.data.data;
  },

  // 11. Lấy thống kê doanh thu và đơn bán của Seller
  async getSellerAnalytics(): Promise<{
    totalRevenue: number;
    monthlyRevenue: number;
    pendingEscrow: number;
    completionRate: number;
    counts: {
      total: number;
      completed: number;
      shipping: number;
      processing: number;
      disputed: number;
      cancelled: number;
    };
    recentSales: Array<{
      id: string;
      orderCode: string;
      productTitle: string;
      productImage?: string;
      buyerName: string;
      amount: number;
      orderType: string;
      status: string;
      createdAt: string;
    }>;
  }> {
    const response = await apiClient.get<ApiResponse<any>>('/orders/seller/analytics');
    return response.data.data;
  },

  // 12. Người bán xác nhận đã giao đồ tận tay tại Safe Point
  async sellerConfirmHandoff(orderId: string, otp?: string): Promise<BackendOrder> {
    const response = await apiClient.post<ApiResponse<BackendOrder>>(
      `/orders/${orderId}/seller-confirm-handoff`,
      { otp }
    );
    return response.data.data;
  },
};
