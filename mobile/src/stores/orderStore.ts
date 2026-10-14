import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWalletStore } from './walletStore';
import { generate4DigitOtp } from '../lib/backendMappers';

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
  buyerId: string;
  buyerName: string;
  buyerCohort?: string;
  buyerCampus?: string;
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
  totalAmount: number;
  isReviewed?: boolean;
  reviewData?: OrderReviewData;
  handshakeOtp?: string;
  orderType?: 'MEETUP' | 'SHIP_COD';
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
  verifyHandshakeOtp: (
    orderId: string,
    inputOtp: string
  ) => { success: boolean; message: string };
  markOrderReviewed: (orderId: string, reviewData?: OrderReviewData) => void;
  updateOrderReview: (orderId: string, reviewData: Partial<OrderReviewData>) => void;
  toggleReviewPublic: (orderId: string) => void;
  createDispute: (orderId: string, reason: string) => void;
  getBuyerOrders: (buyerId: string) => OrderItem[];
  getSellerOrders: (sellerId: string) => OrderItem[];
  getOrdersForUser: (userId: string) => OrderItem[];
  isLoading: boolean;
  fetchOrders: () => Promise<OrderItem[]>;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      activeUserId: null,
      isLoading: false,

      setActiveUser: (userId) => {
        set({ activeUserId: userId });
      },

      fetchOrders: async () => {
        try {
          set({ isLoading: true });
          const { orderMobileService } = await import('../services/orderMobileService');
          const liveOrders = await orderMobileService.getOrders();
          if (Array.isArray(liveOrders)) {
            set({ orders: liveOrders });
            return liveOrders;
          }
        } catch (e: any) {
          console.log('⚠️ [Backend orders offline, using local store]:', e?.message);
        } finally {
          set({ isLoading: false });
        }
        return get().orders;
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

        import('../services/orderMobileService').then(({ orderMobileService }) => {
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
            .catch(() => {});
        });

        return newOrder;
      },

      addOrder: (order: OrderItem) => {
        set((state) => ({
          orders: [order, ...state.orders.filter((o) => o.id !== order.id && o.orderNumber !== order.orderNumber)],
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

      verifyHandshakeOtp: (orderId, inputOtp) => {
        const { orders } = get();
        const target = orders.find((o) => o.id === orderId || o.orderNumber === orderId);

        if (!target) {
          return { success: false, message: 'Không tìm thấy đơn hàng' };
        }

        const cleanInput = (inputOtp || '').trim().replace(/\s/g, '');
        const targetOtp = (target.handshakeOtp || '').trim().replace(/\s/g, '');

        if (cleanInput !== targetOtp) {
          return {
            success: false,
            message: 'Mã OTP Handshake không chính xác (gồm 4 chữ số). Hãy nhờ Người mua mở vé nhận hàng kiểm tra lại!',
          };
        }

        // Cập nhật trạng thái đơn sang COMPLETED
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === target.id
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

        // Giải phóng tiền cọc Escrow vào ví Người Bán
        if (target.sellerId) {
          useWalletStore.getState().releaseEscrowToSeller(target.sellerId, target.totalAmount, target.id);
        }

        import('../services/orderMobileService').then(({ orderMobileService }) => {
          orderMobileService.verifyHandshake(orderId, cleanInput).catch(() => {});
        });

        return {
          success: true,
          message: 'Xác thực mã QR Handshake thành công! Đơn hàng đã bàn giao hoàn tất và tiền cọc được giải ngân về Ví Người Bán.',
        };
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
                    isPublic: false,
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
                    ? { ...o.reviewData, ...updatedReviewData }
                    : {
                        rating: updatedReviewData.rating || 5,
                        comment: updatedReviewData.comment,
                        tags: updatedReviewData.tags || ['Đúng mô tả'],
                        images: updatedReviewData.images || [],
                        proofVideoUrl: updatedReviewData.proofVideoUrl,
                        isAnonymous: updatedReviewData.isAnonymous ?? true,
                        reviewedAt: 'Vừa cập nhật',
                        isPublic: updatedReviewData.isPublic ?? false,
                        canEdit: true,
                        bonusCoins: updatedReviewData.bonusCoins || 100,
                      },
                  statusLabel: `⭐ Đã đánh giá ${updatedReviewData.rating || o.reviewData?.rating || 5} sao`,
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

        import('../services/orderMobileService').then(({ orderMobileService }) => {
          orderMobileService.createDispute(orderId, reason).catch(() => {});
        });
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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useOrderStore;
