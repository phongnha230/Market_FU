import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../utils/safeStorage';
import { useWalletStore } from './walletStore';
import { generate4DigitOtp } from '../lib/backendMappers';
import { orderMobileService } from '../services/orderMobileService';

export interface OrderReviewData {
  rating: number;
  comment?: string;
  tags?: string[];
  images?: string[];
  proofVideoUrl?: string;
  isAnonymous?: boolean;
  reviewedAt: string;
  isPublic?: boolean;
  canEdit?: boolean;
  bonusCoins?: number;
  replyComment?: string;
  repliedAt?: string;
}

export interface OrderDisputeData {
  id: string;
  orderId?: string;
  claimantId?: string;
  reason: string;
  details?: string;
  proofVideoUrl?: string;
  status: 'PENDING' | 'REJECTED' | 'REFUNDED' | 'RESOLVED';
  adminNote?: string;
  createdAt?: string;
  resolvedAt?: string;
}

export interface OrderItem {
  id: string;
  orderNumber?: string;
  productId: string;
  productTitle: string;
  price: number;
  productImage: any;
  sellerId: string;
  sellerName: string;
  sellerCohort?: string;
  sellerCampus?: string;
  sellerAvatar?: string;
  buyerId: string;
  buyerName: string;
  buyerCohort?: string;
  buyerCampus?: string;
  buyerAvatar?: string;
  status:
    | 'PENDING_SAFEPOINT'
    | 'ESCROW_PAID'
    | 'HANDOVER_CONFIRMED'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'DISPUTED';
  statusLabel: string;
  statusColor?: string;
  statusBg?: string;
  safePoint: string;
  timeSlot: string;
  deliveryNote?: string;
  totalAmount: number;
  paymentCheckoutUrl?: string;
  isReviewed?: boolean;
  reviewData?: OrderReviewData;
  dispute?: OrderDisputeData;
  handshakeOtp?: string;
  orderType?: 'MEETUP' | 'SHIP_COD';
  trackingCode?: string;
  cancelledBy?: 'SELLER' | 'BUYER' | 'SHIPPER' | 'DISPUTE' | 'SYSTEM' | string | null;
  cancelReason?: string | null;
  isPaid?: boolean;
  payment?: {
    platformFeeRate?: number;
    platformFeeAmount?: number;
    sellerNetEarning?: number;
    amount?: number;
    isPaid?: boolean;
    method?: string;
    payosCheckoutUrl?: string;
  };
  shippingPartner?: string;
  shipping?: {
    trackingCode?: string;
    shippingPartner?: string;
    receiverName?: string;
    receiverPhone?: string;
    shippingAddress?: string;
    destinationCampus?: string;
  };
  createdAt: string;
}

export const INITIAL_ORDERS: OrderItem[] = [];

interface OrderState {
  orders: OrderItem[];
  activeUserId: string | null;

  // Actions
  setActiveUser: (userId: string | null) => void;
  createOrder: (order: Omit<OrderItem, 'id' | 'createdAt' | 'isReviewed'>) => OrderItem;
  addOrder: (order: OrderItem) => void;
  updateOrderStatus: (
    orderId: string,
    status: OrderItem['status'],
    statusLabel: string,
    color?: string,
    bg?: string
  ) => void;
  updateOrderShipping: (orderId: string, trackingCode: string, shippingPartner: string) => void;
  verifyHandshakeOtp: (
    orderId: string,
    inputOtp: string
  ) => Promise<{ success: boolean; message: string }>;
  markOrderReviewed: (orderId: string, reviewData?: OrderReviewData) => void;
  updateOrderReview: (orderId: string, reviewData: Partial<OrderReviewData>) => void;
  replyOrderReview: (orderId: string, replyComment: string) => void;
  toggleReviewPublic: (orderId: string) => void;
  createDispute: (orderId: string, reason: string) => void;
  getBuyerOrders: (buyerId: string) => OrderItem[];
  getSellerOrders: (sellerId: string) => OrderItem[];
  getOrdersForUser: (userId: string) => OrderItem[];
  isLoading: boolean;
  isFetchingMore: boolean;
  currentPage: number;
  hasMore: boolean;
  fetchOrders: (page?: number) => Promise<OrderItem[]>;
  fetchMoreOrders: () => Promise<void>;
}

let inFlightOrdersPromise: Promise<OrderItem[]> | null = null;

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      activeUserId: null,
      isLoading: false,
      isFetchingMore: false,
      currentPage: 1,
      hasMore: true,

      setActiveUser: (userId) => {
        const uId = userId ? String(userId).trim() : null;
        const currentActive = get().activeUserId;
        if (uId !== currentActive) {
          set({ activeUserId: uId, orders: [] });
          if (uId) {
            get().fetchOrders().catch(() => {});
          }
        }
      },

      fetchOrders: async (page = 1) => {
        if (inFlightOrdersPromise) {
          return inFlightOrdersPromise;
        }

        inFlightOrdersPromise = (async () => {
          try {
            set({ isLoading: true });
            const liveOrders = await orderMobileService.getOrders({ page, limit: 20 });
            if (Array.isArray(liveOrders)) {
              set({
                orders: liveOrders,
                currentPage: 1,
                hasMore: liveOrders.length >= 20,
              });
              return liveOrders;
            }
          } catch (e: any) {
            console.log('⚠️ [Backend orders offline, using local store]:', e?.message);
          } finally {
            set({ isLoading: false });
            inFlightOrdersPromise = null;
          }
          return get().orders;
        })();

        return inFlightOrdersPromise;
      },

      fetchMoreOrders: async () => {
        const { currentPage, hasMore, isFetchingMore, orders } = get();
        if (!hasMore || isFetchingMore) return;

        try {
          set({ isFetchingMore: true });
          const nextPage = currentPage + 1;
          const nextOrders = await orderMobileService.getOrders({ page: nextPage, limit: 20 });
          if (Array.isArray(nextOrders) && nextOrders.length > 0) {
            const existingIds = new Set(orders.map((o) => o.id));
            const uniqueNext = nextOrders.filter((o) => !existingIds.has(o.id));
            set({
              orders: [...orders, ...uniqueNext],
              currentPage: nextPage,
              hasMore: nextOrders.length >= 20,
            });
          } else {
            set({ hasMore: false });
          }
        } catch (e: any) {
          console.log('⚠️ [Fetch more orders error]:', e?.message);
        } finally {
          set({ isFetchingMore: false });
        }
      },

      createOrder: (orderData) => {
        const randomCode = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
        const randomOtp = generate4DigitOtp();

        const newOrder: OrderItem = {
          ...orderData,
          id: randomCode,
          orderNumber: randomCode,
          createdAt: 'Vừa xong',
          isReviewed: false,
          handshakeOtp: randomOtp,
          statusColor: '#EA580C',
          statusBg: '#FFF7ED',
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        orderMobileService
          .createOrder({
            productId: (orderData as any).productId || 'prod_dell_24',
            orderType: (orderData as any).orderType || ((orderData as any).isDifferentCampus ? 'SHIP_COD' : 'MEETUP'),
            paymentMethod: ((orderData as any).paymentMethod as any) || 'VIETQR',
            safePoint: orderData.safePoint,
            isDifferentCampus: (orderData as any).isDifferentCampus,
            shipping: (orderData as any).shipping || {
              receiverName: orderData.buyerName || 'Sinh viên FPT',
              receiverPhone: '0901234567',
              shippingAddress: orderData.safePoint || 'Sảnh Tòa Alpha',
              destinationCampus: orderData.buyerCampus,
            },
          })
          .then((realOrder) => {
            if (realOrder) {
              set((state) => ({
                orders: state.orders.map((o) => (o.id === randomCode ? realOrder : o)),
              }));
            }
          })
          .catch(() => {});

        return newOrder;
      },

      addOrder: (order: OrderItem) => {
        set((state) => ({
          orders: [order, ...state.orders.filter((o) => o.id !== order.id && o.orderNumber !== order.orderNumber)],
        }));
      },

      updateOrderShipping: (orderId, trackingCode, shippingPartner) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? {
                  ...o,
                  status: 'HANDOVER_CONFIRMED',
                  statusLabel: '🚚 Đang vận chuyển liên Campus',
                  statusColor: '#2563EB',
                  statusBg: '#EFF6FF',
                  trackingCode,
                  shippingPartner,
                  shipping: {
                    ...o.shipping,
                    trackingCode,
                    shippingPartner,
                  },
                }
              : o
          ),
        }));
      },

      updateOrderStatus: (orderId, status, statusLabel, color, bg) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? {
                  ...o,
                  status,
                  statusLabel,
                  statusColor: color || o.statusColor,
                  statusBg: bg || o.statusBg,
                }
              : o
          ),
        }));
      },

      verifyHandshakeOtp: async (orderId, inputOtp) => {
        const cleanInput = (inputOtp || '').trim().replace(/\s/g, '');
        if (!cleanInput) {
          return { success: false, message: 'Vui lòng cung cấp mã OTP hoặc quét mã QR' };
        }

        const cleanOrderId = orderId.replace(/^#/, '').trim();

        try {
          // 1. Gọi API Backend để xác thực chính thức (Backend có đầy đủ HMAC token & OTP bí mật trong DB)
          const apiRes = await orderMobileService.verifyHandshake(cleanOrderId, cleanInput);

          // 2. Cập nhật state đơn hàng sang COMPLETED
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId || o.orderNumber === orderId || o.id === cleanOrderId || o.orderNumber === cleanOrderId
                ? {
                    ...o,
                    status: 'COMPLETED',
                    statusLabel: '✅ Đã bàn giao đồ & Khớp mã QR Handshake tại Safe-Point',
                    statusColor: '#059669',
                    statusBg: '#ECFDF5',
                  }
                : o
            ),
          }));

          // 3. Giải phóng tiền cọc Escrow vào ví Người Bán
          const { orders } = get();
          const target = orders.find((o) => o.id === orderId || o.orderNumber === orderId || o.id === cleanOrderId || o.orderNumber === cleanOrderId);
          if (target?.sellerId) {
            useWalletStore.getState().releaseEscrowToSeller(target.sellerId, target.totalAmount, target.id);
          }

          return {
            success: true,
            message: apiRes.message || 'Xác thực mã QR Handshake thành công! Đơn hàng đã bàn giao hoàn tất và tiền cọc được giải ngân về Ví Người Bán.',
          };
        } catch (err: any) {
          // Fallback khi offline hoặc test local nếu target.handshakeOtp khớp
          const { orders } = get();
          const target = orders.find((o) => o.id === orderId || o.orderNumber === orderId || o.id === cleanOrderId || o.orderNumber === cleanOrderId);
          const targetOtp = (target?.handshakeOtp || '').trim().replace(/\s/g, '');

          const targetId = target?.id;
          if (targetId && targetOtp && cleanInput === targetOtp) {
            set((state) => ({
              orders: state.orders.map((o) =>
                o.id === targetId
                  ? {
                      ...o,
                      status: 'COMPLETED',
                      statusLabel: '✅ Đã bàn giao đồ & Khớp mã QR Handshake tại Safe-Point',
                      statusColor: '#059669',
                      statusBg: '#ECFDF5',
                    }
                  : o
              ),
            }));

            if (target && target.sellerId) {
              useWalletStore.getState().releaseEscrowToSeller(target.sellerId, target.totalAmount, target.id);
            }

            return {
              success: true,
              message: 'Xác thực mã QR Handshake thành công! Đơn hàng đã bàn giao hoàn tất.',
            };
          }

          const errMsg =
            err?.response?.data?.message ||
            err?.message ||
            'Mã OTP Handshake không chính xác. Hãy nhờ Người mua mở vé nhận hàng kiểm tra lại!';
          return {
            success: false,
            message: errMsg,
          };
        }
      },

      markOrderReviewed: (orderId, reviewData) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? {
                  ...o,
                  isReviewed: true,
                  reviewData: reviewData || o.reviewData || {
                    rating: 5,
                    comment: 'Sản phẩm bàn giao nguyên tem như mô tả, người bán thân thiện và đúng giờ tại Safe-Point!',
                    tags: ['Đúng mô tả', 'Thân thiện'],
                    images: [],
                    isAnonymous: true,
                    reviewedAt: 'Hôm nay',
                    isPublic: true,
                    canEdit: true,
                    bonusCoins: 100,
                  },
                  statusLabel: `⭐ Đã đánh giá ${reviewData?.rating || 5} sao`,
                  statusColor: '#2563EB',
                  statusBg: '#EFF6FF',
                }
              : o
          ),
        }));
      },

      updateOrderReview: (orderId, updatedReviewData) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? {
                  ...o,
                  reviewData: o.reviewData
                    ? { ...o.reviewData, ...updatedReviewData, isPublic: true }
                    : {
                        rating: updatedReviewData.rating || 5,
                        comment: updatedReviewData.comment,
                        tags: updatedReviewData.tags || ['Đúng mô tả'],
                        images: updatedReviewData.images || [],
                        proofVideoUrl: updatedReviewData.proofVideoUrl,
                        isAnonymous: updatedReviewData.isAnonymous ?? true,
                        reviewedAt: 'Vừa cập nhật',
                        isPublic: true,
                        canEdit: true,
                        bonusCoins: updatedReviewData.bonusCoins || 100,
                      },
                  statusLabel: `⭐ Đã đánh giá ${updatedReviewData.rating || o.reviewData?.rating || 5} sao`,
                }
              : o
          ),
        }));
      },

      replyOrderReview: (orderId, replyComment) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? {
                  ...o,
                  reviewData: o.reviewData
                    ? {
                        ...o.reviewData,
                        replyComment,
                        repliedAt: 'Vừa xong',
                      }
                    : {
                        rating: 5,
                        reviewedAt: 'Gần đây',
                        isPublic: true,
                        replyComment,
                        repliedAt: 'Vừa xong',
                      },
                }
              : o
          ),
        }));
      },

      toggleReviewPublic: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if ((o.id === orderId || o.orderNumber === orderId) && o.reviewData) {
              return {
                ...o,
                reviewData: {
                  ...o.reviewData,
                  isPublic: !o.reviewData.isPublic,
                },
              };
            }
            return o;
          }),
        }));
      },

      createDispute: (orderId, reason) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? {
                  ...o,
                  status: 'DISPUTED',
                  statusLabel: '⚠️ Đang mở khiếu nại đổi trả (Bảo lưu Escrow)',
                  statusColor: '#DC2626',
                  statusBg: '#FEF2F2',
                }
              : o
          ),
        }));

      },

      getBuyerOrders: (buyerId: string) => {
        return get().orders.filter((o) => o.buyerId === buyerId);
      },

      getSellerOrders: (sellerId: string) => {
        return get().orders.filter((o) => o.sellerId === sellerId);
      },

      getOrdersForUser: (userId: string) => {
        return get().orders.filter((o) => o.buyerId === userId || o.sellerId === userId);
      },
    }),
    {
      name: 'fu_orders_storage',
      storage: createJSONStorage(() => safeAsyncStorage),
      partialize: (state) => ({
        orders: (state.orders || []).slice(0, 30),
        activeUserId: state.activeUserId,
      }),
    }
  )
);

export default useOrderStore;
