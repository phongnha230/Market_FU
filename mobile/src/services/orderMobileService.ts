import apiClient, { ApiResponse } from './apiClient';
import type { OrderItem } from '../stores/orderStore';
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
  meetupLocation?: string;
  appointmentTime?: string;
  deliveryNote?: string;
  note?: string;
  coinsUsed?: number;
  agreedPrice?: number;
  voucherCode?: string;
  isDifferentCampus?: boolean;
  platform?: 'web' | 'mobile';
  shipping?: {
    receiverName: string;
    receiverPhone: string;
    shippingAddress: string;
    destinationCampus?: string;
    shippingPartner?: string;
  };
}

export function formatAppointmentSlot(appointmentTime?: string | Date, rawTimeSlot?: string): string {
  if (!appointmentTime) {
    return rawTimeSlot || '16:30 - 17:15 • Hôm nay';
  }
  try {
    const d = new Date(appointmentTime);
    if (isNaN(d.getTime())) {
      return rawTimeSlot || '16:30 - 17:15 • Hôm nay';
    }

    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      d.getDate() === tomorrow.getDate() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getFullYear() === tomorrow.getFullYear();

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const timeOnly = `${hours}:${minutes}`;

    let dateLabel = '';
    if (isToday) {
      dateLabel = `Hôm nay (${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()})`;
    } else if (isTomorrow) {
      dateLabel = `Ngày mai (${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()})`;
    } else {
      dateLabel = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    const h = d.getHours();
    let slotName = '';
    if (h >= 7 && h < 9) slotName = '(Sáng ca 1)';
    else if (h >= 9 && h < 12) slotName = '(Sáng ca 2)';
    else if (h >= 12 && h < 14) slotName = '(Nghỉ trưa)';
    else if (h >= 14 && h < 16) slotName = '(Chiều ca 3)';
    else if (h >= 16 && h < 18) slotName = '(Chiều ca 4)';
    else if (h >= 18) slotName = '(Tối ca 5)';

    const slotPart = rawTimeSlot ? rawTimeSlot.split('•')[0].trim() : `${timeOnly} ${slotName}`.trim();
    return `${slotPart} • ${dateLabel}`;
  } catch {
    return rawTimeSlot || '16:30 - 17:15 • Hôm nay';
  }
}

function extractProductImage(product: any, item: any): any {
  // 1. Kiểm tra nếu item đã có ảnh hợp lệ
  if (item?.productImage) {
    if (typeof item.productImage === 'string' && item.productImage.trim()) {
      return item.productImage;
    }
    if (typeof item.productImage === 'object' && item.productImage !== null) {
      return (
        item.productImage.imageUrl ||
        item.productImage.url ||
        item.productImage.secure_url ||
        item.productImage.uri ||
        item.productImage
      );
    }
  }

  // 2. Trích xuất từ product.images
  if (product) {
    if (Array.isArray(product.images) && product.images.length > 0) {
      const first = product.images[0];
      if (typeof first === 'string' && first.trim()) return first;
      if (typeof first === 'object' && first !== null) {
        return first.imageUrl || first.url || first.secure_url || first.uri || first;
      }
    }

    if (typeof product.images === 'string' && product.images.trim()) return product.images;
    if (product.imageUrl) return product.imageUrl;
    if (product.image) return product.image;
    if (product.thumbnail) return product.thumbnail;
  }

  return require('../../assets/products/monitor-dell-24.jpg');
}

export function adaptBackendOrderToMobile(item: any): OrderItem {
  const product = item.product || {};
  const totalAmount = Number(
    item.payment?.totalAmount ?? item.totalAmount ?? item.amount ?? product.price ?? 0
  );

  let status: OrderItem['status'] = 'PENDING_SAFEPOINT';
  const backendStatus = String(item.status || '').toUpperCase();

  if (backendStatus === 'COMPLETED') {
    status = 'COMPLETED';
  } else if (backendStatus === 'DELIVERED') {
    status = 'DELIVERED';
  } else if (backendStatus === 'DISPUTED') {
    status = 'DISPUTED';
  } else if (backendStatus === 'PAID' || backendStatus === 'ESCROW_PAID') {
    status = 'ESCROW_PAID';
  } else if (backendStatus === 'SHIPPING' || backendStatus === 'HANDOVER_CONFIRMED') {
    status = (item.orderType === 'MEETUP' || item.type === 'safe-handoff') ? 'ESCROW_PAID' : 'HANDOVER_CONFIRMED';
  } else if (backendStatus === 'CANCELLED') {
    status = 'CANCELLED';
  } else {
    status = 'PENDING_SAFEPOINT';
  }

  let statusColor = '#D97706';
  let statusBg = '#FFFBEB';
  let statusLabel = '⏳ Chờ xác nhận';

  if (status === 'COMPLETED') {
    statusColor = '#059669';
    statusBg = '#ECFDF5';
    statusLabel = '✅ Hoàn tất';
  } else if (status === 'DELIVERED') {
    statusColor = '#10B981';
    statusBg = '#ECFDF5';
    statusLabel = '🛵 Đã tới KTX';
  } else if (status === 'ESCROW_PAID') {
    statusColor = '#059669';
    statusBg = '#ECFDF5';
    statusLabel = (item.orderType === 'MEETUP' || item.type === 'safe-handoff') ? '🛡️ Chờ gặp bàn giao' : '🛡️ Đã ký quỹ Escrow';
  } else if (status === 'HANDOVER_CONFIRMED') {
    statusColor = '#2563EB';
    statusBg = '#EFF6FF';
    statusLabel = '🚚 Đang vận chuyển';
  } else if (status === 'CANCELLED') {
    const cancelledBy = item.cancelledBy;
    const isDisputeRefund = cancelledBy === 'DISPUTE' || item.dispute?.status === 'RESOLVED' || item.dispute?.status === 'REFUNDED';
    statusColor = isDisputeRefund ? '#DC2626' : '#64748B';
    statusBg = isDisputeRefund ? '#FEF2F2' : '#F1F5F9';
    statusLabel = isDisputeRefund
      ? '💸 Đã hoàn tiền (Khiếu nại)'
      : cancelledBy === 'SHIPPER'
      ? '🚚 Shipper hủy giao'
      : cancelledBy === 'SELLER'
      ? '❌ Người bán từ chối đơn'
      : cancelledBy === 'BUYER'
      ? '❌ Người mua đã hủy'
      : cancelledBy === 'SYSTEM'
      ? '⏱️ Tự động hủy (Quá hạn)'
      : '❌ Đã hủy';
  } else if (status === 'DISPUTED') {
    statusColor = '#DC2626';
    statusBg = '#FEF2F2';
    statusLabel = '⚠️ Khiếu nại';
  }

  // 4-digit OTP fallback
  const rawOtp =
    item.handshake?.handshakeOtp ||
    item.handshakeOtp ||
    item.otp ||
    '';
  const validOtp = /^\d{4}$/.test(rawOtp) ? rawOtp : generate4DigitOtp();

  const rawBuyerCampus = item.shipping?.destinationCampus || item.buyer?.profile?.campus || product.campus;
  const friendlyCampus = fromBackendCampus(rawBuyerCampus);
  const friendlySellerCampus = fromBackendCampus(product.campus || item.seller?.profile?.campus || 'HOL');

  const isShip = Boolean(
    item.orderType === 'SHIP_COD' ||
    item.shipping?.partner ||
    item.shipping?.trackingNumber ||
    item.shippingAddress ||
    (item.deliveryMethod && item.deliveryMethod !== 'safe_point' && item.deliveryMethod !== 'MEETUP')
  );
  const resolvedOrderType: 'MEETUP' | 'SHIP_COD' = isShip ? 'SHIP_COD' : 'MEETUP';

  let rawLocation =
    item.shipping?.shippingAddress ||
    item.meetupLocation ||
    product.meetupLocation ||
    item.safePointLocation ||
    item.safePoint ||
    'Trạm Safe-Point Sảnh Tòa Alpha (Camera 24/7)';

  let resolvedNote = item.deliveryNote || item.note || '';

  if (rawLocation.includes('(Ghi chú:')) {
    const noteMatch = rawLocation.match(/\(Ghi chú:\s*([^)]+)\)/);
    if (noteMatch) {
      if (!resolvedNote) {
        resolvedNote = noteMatch[1].trim();
      }
      rawLocation = rawLocation.replace(/\s*\(Ghi chú:[^)]+\)/, '').trim();
    }
  }

  const resolvedTimeSlot = formatAppointmentSlot(item.appointmentTime, item.timeSlot);
  const shippingInfo = item.shipping || {};
  const trackingCode = shippingInfo.trackingCode || shippingInfo.trackingNumber || item.trackingCode;
  const shippingPartner = shippingInfo.shippingPartner || shippingInfo.partner || item.shippingPartner || 'GHN';

  return {
    id: item.id || item._id,
    orderNumber: item.orderCode || item.code || `ORD-${String(item.id || '').slice(-6)}`,
    productId: item.productId || product.id || '',
    productTitle: product.title || item.productTitle || 'Sản phẩm giao dịch',
    price: Number(item.payment?.price ?? totalAmount),
    totalAmount,
    paymentCheckoutUrl: item.payment?.payosCheckoutUrl || undefined,
    productImage: extractProductImage(product, item),
    sellerId: item.sellerId || item.seller?.id || '',
    sellerName:
      item.seller?.profile?.fullName || item.seller?.fullName || item.sellerName || 'Người bán FPT',
    sellerCohort: item.seller?.profile?.cohort || '',
    sellerCampus: friendlySellerCampus,
    sellerAvatar: item.seller?.profile?.avatarUrl || item.seller?.avatarUrl,
    buyerId: item.buyerId || item.buyer?.id || '',
    buyerName:
      item.buyer?.profile?.fullName || item.buyer?.fullName || item.buyerName || 'Người mua FPT',
    buyerCohort: item.buyer?.profile?.cohort || '',
    buyerCampus: friendlyCampus,
    buyerAvatar: item.buyer?.profile?.avatarUrl || item.buyer?.avatarUrl,
    status,
    statusLabel: item.statusLabel || statusLabel,
    statusColor: item.statusColor || statusColor,
    statusBg: item.statusBg || statusBg,
    cancelledBy: item.cancelledBy || null,
    cancelReason: item.cancelReason || null,
    isPaid: Boolean(item.payment?.isPaid),
    payment: item.payment ? {
      platformFeeRate: item.payment.platformFeeRate,
      platformFeeAmount: item.payment.platformFeeAmount,
      sellerNetEarning: item.payment.sellerNetEarning,
      amount: item.payment.amount,
      isPaid: item.payment.isPaid,
      method: item.payment.method,
      payosCheckoutUrl: item.payment.payosCheckoutUrl,
    } : undefined,
    safePoint: rawLocation,
    timeSlot: resolvedTimeSlot,
    deliveryNote: resolvedNote,
    orderType: resolvedOrderType,
    trackingCode: trackingCode || undefined,
    shippingPartner: shippingPartner || undefined,
    shipping: item.shipping ? {
      trackingCode: trackingCode || undefined,
      shippingPartner: shippingPartner || undefined,
      receiverName: shippingInfo.receiverName,
      receiverPhone: shippingInfo.receiverPhone,
      shippingAddress: shippingInfo.shippingAddress,
      destinationCampus: shippingInfo.destinationCampus,
    } : undefined,
    // Handshake OTP CHỈ dùng cho đơn MEETUP (cùng campus hẹn gặp), không gán cho đơn liên campus GHN!
    handshakeOtp: resolvedOrderType === 'SHIP_COD' ? undefined : validOtp,
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay',
    isReviewed: Boolean(item.isReviewed || (Array.isArray(item.reviews) && item.reviews.length > 0)),
    dispute: item.dispute
      ? {
          id: item.dispute.id || item.dispute._id || '',
          orderId: item.dispute.orderId || item.id,
          claimantId: item.dispute.claimantId,
          reason: item.dispute.reason || 'Hàng lỗi kỹ thuật/hỏng hóc khi test thực tế',
          details: item.dispute.details || item.dispute.reason,
          proofVideoUrl: item.dispute.proofVideoUrl,
          status: item.dispute.status || 'PENDING',
          adminNote: item.dispute.adminNote,
          createdAt: item.dispute.createdAt
            ? new Date(item.dispute.createdAt).toLocaleString('vi-VN')
            : 'Gần đây',
          resolvedAt: item.dispute.resolvedAt
            ? new Date(item.dispute.resolvedAt).toLocaleString('vi-VN')
            : undefined,
        }
      : undefined,
    reviewData: Array.isArray(item.reviews) && item.reviews.length > 0
      ? {
          rating: Number(item.reviews[0].rating) || 5,
          comment: item.reviews[0].comment || '',
          tags: Array.isArray(item.reviews[0].tags) ? item.reviews[0].tags : [],
          images: Array.isArray(item.reviews[0].images) ? item.reviews[0].images : [],
          proofVideoUrl: item.reviews[0].proofVideoUrl,
          reviewedAt: item.reviews[0].createdAt
            ? new Date(item.reviews[0].createdAt).toLocaleDateString('vi-VN')
            : 'Gần đây',
          isPublic: item.reviews[0].isPublic ?? true,
          canEdit: true,
          replyComment: item.reviews[0].replyComment,
          repliedAt: item.reviews[0].repliedAt || item.reviews[0].replyCreatedAt,
        }
      : undefined,
  };
}

export const orderMobileService = {
  /**
   * Cập nhật thông tin vận chuyển và bàn giao cho bưu cục GHN / Xe buýt FPT
   */
  async updateShippingStatus(
    orderId: string,
    params: { status: 'SHIPPING'; trackingCode?: string; shippingPartner?: string }
  ): Promise<OrderItem> {
    const cleanId = orderId.replace(/^#/, '').trim();
    const res = await apiClient.patch<ApiResponse<any>>('/orders/' + cleanId + '/shipping', params);
    return adaptBackendOrderToMobile(res.data?.data || res.data);
  },

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
      safePoint: payload.safePoint,
      meetupLocation: payload.meetupLocation || payload.safePoint,
      appointmentTime: payload.appointmentTime,
      agreedPrice: payload.agreedPrice,
      voucherCode: payload.voucherCode,
      platform: 'mobile',
    };

    if (orderType === 'SHIP_COD') {
      body.shipping = {
        receiverName: payload.shipping?.receiverName || 'Sinh viên FPT',
        receiverPhone: payload.shipping?.receiverPhone || '0901234567',
        shippingAddress: payload.shipping?.shippingAddress || payload.safePoint || 'Trạm Safe-Point Sảnh KTX Dom A',
        destinationCampus: toBackendCampus(payload.shipping?.destinationCampus),
        shippingPartner: payload.shipping?.shippingPartner || 'GHN Express',
      };
    }

    // PayOS checkout-link creation happens during order creation and can take longer than a normal API call.
    const res = await apiClient.post<ApiResponse<any>>('/orders', body, { timeout: 30000 });
    return adaptBackendOrderToMobile(res.data.data);
  },

  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại (hỗ trợ phân trang)
   */
  async getOrders(params?: { page?: number; limit?: number; status?: string; role?: string }): Promise<OrderItem[]> {
    const res = await apiClient.get<ApiResponse<any>>('/orders', { params });
    const raw = res.data?.data;
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.orders) ? raw.orders : [];
    return list.map(adaptBackendOrderToMobile);
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
  async verifyHandshake(orderId: string, credential: string): Promise<{ success: boolean; message: string }> {
    const clean = credential.replace(/\s/g, '').trim();
    const isOtp = /^\d{4,6}$/.test(clean);
    const payload = isOtp ? { handshakeOtp: clean } : { handshakeToken: clean };

    const cleanOrderId = orderId.replace(/^#/, '').trim();
    const res = await apiClient.post<ApiResponse<any>>(`/orders/${cleanOrderId}/handshake`, payload);
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
    const validUrl = proofVideoUrl?.startsWith('http') ? proofVideoUrl : undefined;

    const res = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}/dispute`, {
      reason: validReason,
      ...(validUrl ? { proofVideoUrl: validUrl } : {}),
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
   * Người bán xác nhận đồng ý đơn hàng và chốt lịch hẹn gặp tại Safe-Point
   */
  async confirmOrder(orderId: string): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>(`/orders/${orderId}/confirm-order`);
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
          shippingPartner: raw.transitHub || raw.shippingPartner || 'GHN Express',
        };
      }
    } catch (e: any) {
      console.log('⚠️ [estimateShipping fallback]:', e?.message);
    }
    return {
      fee: params.orderType === 'MEETUP' ? 0 : 30000,
      estimatedDelivery: params.orderType === 'MEETUP' ? 'Trong ngày' : '1 - 2 ngày',
      shippingPartner: params.orderType === 'MEETUP' ? 'Safe-Point FPT' : 'GHN Express',
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
    if (inFlightAnalyticsPromise) {
      return inFlightAnalyticsPromise;
    }
    inFlightAnalyticsPromise = (async () => {
      try {
        const res = await apiClient.get<ApiResponse<any>>('/orders/seller/analytics');
        return res.data?.data;
      } catch (e: any) {
        console.log('⚠️ [getSellerAnalytics fallback]:', e?.message);
        return null;
      } finally {
        inFlightAnalyticsPromise = null;
      }
    })();
    return inFlightAnalyticsPromise;
  },
};

let inFlightAnalyticsPromise: Promise<any> | null = null;

export default orderMobileService;
