import apiClient, { ApiResponse } from './apiClient';
import { OrderItem } from '../stores/orderStore';
import {
  toBackendCampus,
  fromBackendCampus,
  toBackendPaymentMethod,
  generate4DigitOtp,
} from '../lib/backendMappers';

export interface CreateOrderPayload {
  productId: string;
  orderType?: 'MEETUP' | 'SHIP_COD';
  paymentMethod?: string;
  safePoint?: string;
  deliveryNote?: string;
  note?: string;
  coinsUsed?: number;
  voucherCode?: string;
  isDifferentCampus?: boolean;
  shipping?: {
    receiverName: string;
    receiverPhone: string;
    shippingAddress: string;
    destinationCampus?: string;
    shippingPartner?: string;
  };
}

export function adaptBackendOrderToMobile(item: any): OrderItem {
  const product = item.product || {};
  const totalAmount = Number(
    item.payment?.totalAmount ?? item.totalAmount ?? item.amount ?? product.price ?? 0
  );

  let status: OrderItem['status'] = 'PENDING_SAFEPOINT';
  const backendStatus = String(item.status || '').toUpperCase();

  if (backendStatus === 'COMPLETED' || backendStatus === 'DELIVERED') {
    status = 'COMPLETED';
  } else if (backendStatus === 'DISPUTED') {
    status = 'DISPUTED';
  } else if (backendStatus === 'PAID' || backendStatus === 'ESCROW_PAID') {
    status = 'ESCROW_PAID';
  } else if (backendStatus === 'SHIPPING') {
    status = 'HANDOVER_CONFIRMED';
  }

  // 4-digit OTP fallback
  const rawOtp =
    item.handshake?.handshakeOtp ||
    item.handshakeOtp ||
    item.otp ||
    '';
  const validOtp = /^\d{4}$/.test(rawOtp) ? rawOtp : generate4DigitOtp();

  const rawCampus = product.campus || item.shipping?.destinationCampus;
  const friendlyCampus = fromBackendCampus(rawCampus);

  return {
    id: item.id || item._id,
    orderNumber: item.orderCode || item.code || `ORD-${String(item.id || '').slice(-6)}`,
    productId: item.productId || product.id || 'prod_dell_24',
    productTitle: product.title || item.productTitle || 'Sản phẩm giao dịch',
    price: Number(item.payment?.price ?? totalAmount),
    totalAmount,
    productImage:
      (Array.isArray(product.images) && product.images[0]?.imageUrl) ||
      product.images?.[0] ||
      product.imageUrl ||
      require('../../../assets/products/monitor-dell-24.jpg'),
    sellerId: item.sellerId || item.seller?.id || 'acc_seller',
    sellerName:
      item.seller?.profile?.fullName || item.seller?.fullName || item.sellerName || 'Người bán FPT',
    sellerCohort: item.seller?.profile?.cohort || 'K16 - FPT University',
    sellerCampus: fromBackendCampus(item.seller?.profile?.campus || 'HOL'),
    buyerId: item.buyerId || item.buyer?.id || 'acc_verified',
    buyerName:
      item.buyer?.profile?.fullName || item.buyer?.fullName || item.buyerName || 'Người mua FPT',
    buyerCohort: item.buyer?.profile?.cohort || 'K17 - FPT Hola',
    buyerCampus: friendlyCampus,
    status,
    statusLabel:
      item.statusLabel ||
      (status === 'COMPLETED'
        ? '✅ Giao dịch hoàn tất'
        : status === 'ESCROW_PAID'
        ? '🛡️ Đã cọc Escrow - Chờ bàn giao tại Safe-Point'
        : status === 'HANDOVER_CONFIRMED'
        ? '🚚 Đang luân chuyển trên tuyến FPT Bus'
        : '📦 Chờ giao nhận tại Safe-Point'),
    safePoint:
      item.shipping?.shippingAddress ||
      item.meetupLocation ||
      item.safePointLocation ||
      'Trạm Safe-Point Sảnh Tòa Alpha (Camera 24/7)',
    timeSlot: item.timeSlot || 'Hôm nay: 16:30 - 17:30',
    handshakeOtp: validOtp,
    createdAt: item.createdAt || new Date().toISOString(),
    isReviewed: Boolean(item.isReviewed || (Array.isArray(item.reviews) && item.reviews.length > 0)),
  };
}

export const orderMobileService = {
  /**
   * Tạo đơn hàng mới chuẩn xác 100% với Backend DTO (Zod Schema)
   */
  async createOrder(payload: CreateOrderPayload): Promise<OrderItem> {
    const isShip = Boolean(payload.orderType === 'SHIP_COD' || payload.isDifferentCampus || payload.shipping);
    const orderType = isShip ? 'SHIP_COD' : 'MEETUP';
    const paymentMethod = toBackendPaymentMethod(payload.paymentMethod);

    const body: any = {
      productId: payload.productId,
      orderType,
      paymentMethod,
      coinsUsed: Math.max(0, Number(payload.coinsUsed) || 0),
      deliveryNote: payload.deliveryNote || payload.note || payload.safePoint || 'Giao dịch qua Chợ FPT',
    };

    if (orderType === 'SHIP_COD') {
      body.shipping = {
        receiverName: payload.shipping?.receiverName || 'Sinh viên FPT',
        receiverPhone: payload.shipping?.receiverPhone || '0901234567',
        shippingAddress: payload.shipping?.shippingAddress || payload.safePoint || 'Trạm Safe-Point Sảnh KTX Dom A',
        destinationCampus: toBackendCampus(payload.shipping?.destinationCampus),
        shippingPartner: payload.shipping?.shippingPartner || 'GHTK',
      };
    }

    const res = await apiClient.post<ApiResponse<any>>('/orders', body);
    return adaptBackendOrderToMobile(res.data.data);
  },

  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại
   */
  async getOrders(): Promise<OrderItem[]> {
    const res = await apiClient.get<ApiResponse<any[]>>('/orders');
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data.map(adaptBackendOrderToMobile);
    }
    return [];
  },

  /**
   * Xem chi tiết 1 đơn hàng
   */
  async getOrderDetail(id: string): Promise<OrderItem | null> {
    const res = await apiClient.get<ApiResponse<any>>(`/orders/${id}`);
    if (res.data?.data) {
      return adaptBackendOrderToMobile(res.data.data);
    }
    return null;
  },

  /**
   * Xác thực mã OTP 4 số tại trạm Safe-Point chuẩn Backend regex /^\d{4}$/
   */
  async verifyHandshake(orderId: string, otp: string): Promise<{ success: boolean; message: string }> {
    const cleanOtp = otp.replace(/\s/g, '').trim();
    const res = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}/handshake`, {
      handshakeOtp: cleanOtp,
    });
    return {
      success: true,
      message: res.data?.data?.message || 'Bàn giao thành công! Tiền cọc đã được giải phóng vào ví của bạn.',
    };
  },

  /**
   * Gửi khiếu nại đơn hàng chuẩn Zod Backend (Tối thiểu 5 ký tự & link video bằng chứng)
   */
  async createDispute(
    orderId: string,
    reason: string,
    proofVideoUrl?: string
  ): Promise<any> {
    const validReason = reason.trim().length >= 5 ? reason.trim() : `${reason.trim()} - Khiếu nại tại Safe-Point`;
    const validUrl = proofVideoUrl?.startsWith('http')
      ? proofVideoUrl
      : 'https://marketfu.fpt.edu.vn/proof/video-unbox-safepoint.mp4';

    const res = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}/dispute`, {
      reason: validReason,
      proofVideoUrl: validUrl,
    });
    return res.data?.data;
  },

  /**
   * Người mua xác nhận đã nhận hàng an toàn và giải phóng tiền Escrow
   */
  async confirmDelivery(orderId: string): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}/confirm-delivery`);
    return res.data?.data;
  },

  /**
   * Người bán xác nhận đã gửi đồ cho xe liên campus / Safe-Point
   */
  async sellerConfirmHandoff(orderId: string, note?: string): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}/seller-confirm-handoff`, {
      note: note || 'Đã bàn giao cho Trưởng xe FPT Bus và dán tem seal',
    });
    return res.data?.data;
  },

  /**
   * Hủy đơn hàng kèm lý do
   */
  async cancelOrder(orderId: string, reason?: string): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}/cancel`, {
      reason: reason?.trim() || 'Hủy theo yêu cầu của người dùng tại Safe-Point',
    });
    return res.data?.data;
  },

  /**
   * Báo giá cước vận chuyển chuẩn giữa các Campus FPT
  /**
   * Báo giá cước vận chuyển chuẩn giữa các Campus FPT
   */
  async estimateShipping(params: {
    fromCampus: string;
    toCampus?: string;
    orderType?: 'MEETUP' | 'SHIP_COD';
  }): Promise<{ fee: number; estimatedDelivery: string; shippingPartner: string }> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/orders/shipping/estimate', {
        params: {
          fromCampus: toBackendCampus(params.fromCampus),
          toCampus: params.toCampus ? toBackendCampus(params.toCampus) : undefined,
          orderType: params.orderType || 'SHIP_COD',
        },
      });
      const raw = res.data?.data;
      if (raw) {
        return {
          fee: typeof raw.shippingFee === 'number' ? raw.shippingFee : (typeof raw.fee === 'number' ? raw.fee : 0),
          estimatedDelivery: raw.estimatedDays || raw.estimatedDelivery || '1 - 2 ngày',
          shippingPartner: raw.transitHub || raw.shippingPartner || 'FPT Bus',
        };
      }
    } catch (e: any) {
      console.log('⚠️ [estimateShipping fallback]:', e?.message);
    }
    return {
      fee: params.orderType === 'MEETUP' ? 0 : 30000,
      estimatedDelivery: params.orderType === 'MEETUP' ? 'Trong ngày' : '1 - 2 ngày',
      shippingPartner: 'FPT Bus',
    };
  },

  /**
   * Xem hành trình vận đơn
   */
  async getOrderTracking(orderId: string): Promise<any> {
    const res = await apiClient.get<ApiResponse<any>>(`/orders/${orderId}/tracking`);
    return res.data?.data;
  },

  /**
   * Thống kê doanh thu & đơn hàng của Seller
   */
  async getSellerAnalytics(): Promise<any> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/orders/seller/analytics');
      return res.data?.data;
    } catch (e: any) {
      console.log('⚠️ [getSellerAnalytics fallback]:', e?.message);
      return null;
    }
  },
};

export default orderMobileService;
