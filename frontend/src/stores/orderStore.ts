import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { orderService, BackendOrder } from '@/services/orderService';
import { socketClient } from '@/services/socketClient';

export interface OrderStep {
  title: string;
  status: 'completed' | 'current' | 'pending';
}

export interface OrderItem {
  id: string;
  code: string;
  type: 'inter-campus' | 'safe-handoff';
  typeLabel: string;
  timeLabel: string;
  status: 'shipping' | 'delivered' | 'processing' | 'completed' | 'disputed';
  statusText: string;
  statusColor: string;
  reviewed?: boolean;
  buyerId?: string;
  sellerId?: string;
  handshake?: {
    handshakeToken?: string;
    handshakeOtp?: string;
    isVerified?: boolean;
    verifiedAt?: string;
  };
  payment?: {
    price?: number;
    shippingFee?: number;
    totalAmount: number;
    vietqrUrl?: string;
    payosOrderCode?: number;
    payosCheckoutUrl?: string;
    paymentMethod?: string;
    isPaid: boolean;
    paidAt?: string;
  };
  product: {
    title: string;
    subtitle: string;
    price: number;
    escrowBadge: string;
    conditionBadge: string;
    imageUrl: string;
    seller: {
      name: string;
      cohortCampus: string;
      verifiedText: string;
    };
  };
  tracking?: {
    routeTitle: string;
    estimatedArrival: string;
    currentLocation: string;
    trackingCode: string;
    steps: OrderStep[];
  };
  rewardPrompt?: {
    title: string;
    subtitle: string;
    voucherAmount: string;
  };
}

interface OrderState {
  ordersByUser: Record<string, OrderItem[]>;
  activeUserId: string | null;
  orders: OrderItem[];
  setActiveUser: (userId: string | null) => void;
  fetchOrders: () => Promise<void>;
  verifyHandshake: (orderId: string, handshakeToken?: string, handshakeOtp?: string) => Promise<boolean>;
  initSocketListeners: () => () => void;
  createOrder: (params: {
    product: OrderItem['product'];
    type?: 'inter-campus' | 'safe-handoff';
    deliveryNote?: string;
    paymentMethod?: string;
  }) => OrderItem;
  updateOrderStatus: (idOrCode: string, status: OrderItem['status'], statusText?: string) => void;
  markOrderReviewed: (idOrCode: string) => void;
  getOrder: (idOrCode: string) => OrderItem | undefined;
  resetOrders: () => void;
}

export const INITIAL_ORDERS: OrderItem[] = [];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      ordersByUser: {},
      activeUserId: null,
      orders: [],

      setActiveUser: (userId) => {
        const uId = userId ? String(userId).trim() : null;
        const state = get();
        const userOrders = uId && state.ordersByUser[uId] ? state.ordersByUser[uId] : [];
        set({
          activeUserId: uId,
          orders: userOrders,
        });
      },

      fetchOrders: async () => {
        try {
          const res = await orderService.getOrders();
          if (res.orders) {
            const mapped: OrderItem[] = res.orders.map((bo) => {
              const statusMap: Record<string, OrderItem['status']> = {
                PENDING: 'processing',
                PAID: 'processing',
                SHIPPING: 'shipping',
                DELIVERED: 'delivered',
                COMPLETED: 'completed',
                CANCELLED: 'processing',
                DISPUTED: 'disputed',
              };
              const statusColorMap: Record<string, string> = {
                PENDING: 'text-amber-600',
                PAID: 'text-blue-600',
                SHIPPING: 'text-fpt-orange',
                DELIVERED: 'text-emerald-600',
                COMPLETED: 'text-emerald-600',
                CANCELLED: 'text-slate-400',
                DISPUTED: 'text-rose-600',
              };

              return {
                id: bo.id,
                code: bo.orderCode.startsWith('#') ? bo.orderCode : `#${bo.orderCode}`,
                type: bo.orderType === 'SHIP_COD' ? 'inter-campus' : 'safe-handoff',
                typeLabel: bo.orderType === 'SHIP_COD' ? 'Inter-Campus Express • FPT CampusShip' : 'Nội bộ Campus - Safe Handoff',
                timeLabel: new Date(bo.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }),
                status: statusMap[bo.status] || 'processing',
                statusText:
                  bo.status === 'COMPLETED'
                    ? 'Giao dịch thành công'
                    : bo.status === 'PAID'
                    ? 'Đã nạp Escrow bảo hộ'
                    : bo.status === 'SHIPPING'
                    ? 'Đang vận chuyển'
                    : bo.status === 'DELIVERED'
                    ? 'Đã giao tới nơi'
                    : bo.status === 'PENDING' && !bo.payment?.isPaid && bo.payment?.paymentMethod !== 'CASH'
                    ? 'Chờ thanh toán (Quét QR / PayOS)'
                    : 'Chờ xử lý',
                statusColor: statusColorMap[bo.status] || 'text-fpt-orange',
                reviewed: bo.reviews && bo.reviews.length > 0,
                buyerId: bo.buyerId,
                sellerId: bo.sellerId,
                handshake: bo.handshake,
                payment: bo.payment
                  ? {
                      price: bo.payment.price,
                      shippingFee: bo.payment.shippingFee,
                      totalAmount: bo.payment.totalAmount,
                      vietqrUrl: bo.payment.vietqrUrl,
                      payosOrderCode: (bo.payment as any).payosOrderCode,
                      payosCheckoutUrl: (bo.payment as any).payosCheckoutUrl,
                      paymentMethod: bo.payment.paymentMethod,
                      isPaid: bo.payment.isPaid,
                      paidAt: bo.payment.paidAt,
                    }
                  : undefined,
                product: {
                  title: bo.product?.title || 'Sản phẩm FPT Market',
                  subtitle: bo.product?.meetupLocation || 'Bàn giao trực tiếp campus',
                  price: bo.payment.price,
                  escrowBadge:
                    bo.orderType === 'MEETUP'
                      ? 'Xác thực QR Handshake'
                      : bo.payment?.isPaid
                      ? 'Đã cọc Escrow bảo hộ 48h'
                      : bo.payment?.paymentMethod === 'CASH' || !bo.payment?.paymentMethod || (bo.payment?.paymentMethod && bo.payment.paymentMethod.toLowerCase().includes('cod'))
                      ? 'Thanh toán khi nhận hàng (COD)'
                      : 'Chờ nạp cọc Escrow (VietQR)',
                  conditionBadge: 'Like New',
                  imageUrl: bo.product?.images?.[0]?.imageUrl || '/products/keyboard-akko.jpg',
                  seller: {
                    name: bo.seller?.profile?.fullName || bo.seller?.email || 'Người bán FPT',
                    cohortCampus: `${bo.seller?.profile?.campus || 'Hòa Lạc'}`,
                    verifiedText: 'Sinh viên FPT đã xác thực thẻ',
                  },
                },
                tracking: bo.shipping?.trackingCode
                  ? {
                      routeTitle: `Giao hàng tới ${bo.shipping.shippingAddress}`,
                      estimatedArrival: 'Dự kiến 1-2 ngày tới',
                      currentLocation: bo.shipping.shippingPartner || 'GHTK',
                      trackingCode: bo.shipping.trackingCode,
                      steps: [
                        { title: 'Tạo đơn', status: 'completed' },
                        { title: 'Lấy hàng', status: bo.status !== 'PENDING' ? 'completed' : 'current' },
                        { title: 'Vận chuyển', status: bo.status === 'SHIPPING' ? 'current' : bo.status === 'DELIVERED' || bo.status === 'COMPLETED' ? 'completed' : 'pending' },
                        { title: 'Giao tới KTX', status: bo.status === 'DELIVERED' || bo.status === 'COMPLETED' ? 'completed' : 'pending' },
                      ],
                    }
                  : undefined,
              };
            });

            const activeUid = get().activeUserId;
            set((state) => ({
              orders: mapped,
              ordersByUser: activeUid
                ? { ...state.ordersByUser, [activeUid]: mapped }
                : state.ordersByUser,
            }));
          }
        } catch {
          // offline fallback
        }
      },

      verifyHandshake: async (orderId, handshakeToken, handshakeOtp) => {
        try {
          const res = await orderService.verifyHandshake(orderId, { handshakeToken, handshakeOtp });
          if (res) {
            get().updateOrderStatus(orderId, 'completed', 'Đã xác thực QR Handshake • Hoàn tất');
            return true;
          }
        } catch {
          // fallback
        }
        return false;
      },

      initSocketListeners: () => {
        const cleanupNew = socketClient.onNewOrderReceived(() => {
          get().fetchOrders();
        });
        const cleanupPaid = socketClient.onOrderPaid((data) => {
          get().updateOrderStatus(data.orderId || data.orderCode, 'processing', 'Đã nạp tiền vào Escrow');
        });
        const cleanupDone = socketClient.onOrderCompleted((data) => {
          get().updateOrderStatus(data.orderId || data.orderCode, 'completed', 'Giao dịch Handshake thành công');
        });
        const cleanupShip = socketClient.onOrderShippingUpdated((data) => {
          if (data.status === 'DELIVERED') {
            get().updateOrderStatus(data.orderId, 'delivered', 'Đã giao tới nơi • Bắt đầu 48h test');
          } else {
            get().updateOrderStatus(data.orderId, 'shipping', 'Đang vận chuyển');
          }
        });
        const cleanupCancel = socketClient.onOrderCancelled((data) => {
          get().updateOrderStatus(data.orderId || data.orderCode, 'processing', 'Đơn hàng đã bị hủy');
        });

        return () => {
          cleanupNew();
          cleanupPaid();
          cleanupDone();
          cleanupShip();
          cleanupCancel();
        };
      },

      createOrder: ({ product, type = 'inter-campus', deliveryNote, paymentMethod }) => {
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const newCode = `#ORD-${randomNum}-CAMPUS`;
        const newId = `ord-${Date.now()}`;
        const isOnlinePayment = paymentMethod?.toLowerCase().includes('vietqr') || paymentMethod?.toLowerCase().includes('payos');

        const newOrder: OrderItem = {
          id: newId,
          code: newCode,
          type,
          typeLabel:
            type === 'inter-campus'
              ? 'Inter-Campus Express • FPT CampusShip'
              : 'Nội bộ Campus - Safe Handoff',
          timeLabel: 'Vừa tạo xong',
          status: 'shipping',
          statusText: type === 'inter-campus' ? 'Đang chuẩn bị đóng thùng KTX' : 'Chờ gặp tại điểm hẹn',
          statusColor: 'text-fpt-orange',
          payment: {
            price: product.price,
            shippingFee: type === 'inter-campus' ? 25000 : 0,
            totalAmount: product.price + (type === 'inter-campus' ? 25000 : 0),
            paymentMethod: paymentMethod || (type === 'inter-campus' ? 'Thanh toán khi nhận hàng (COD)' : 'Tiền mặt điểm hẹn'),
            isPaid: false,
          },
          product: {
            ...product,
            escrowBadge:
              type === 'safe-handoff'
                ? 'Xác thực QR Handshake'
                : isOnlinePayment
                ? 'Chờ nạp cọc Escrow (VietQR)'
                : 'Thanh toán khi nhận hàng (COD)',
          },
          tracking:
            type === 'inter-campus'
              ? {
                  routeTitle: 'Lộ trình chuyển phát bảo chứng KTX',
                  estimatedArrival: 'Dự kiến 2-3 ngày tới',
                  currentLocation: deliveryNote || 'Đang đóng gói chống sốc tại bưu cục xuất phát',
                  trackingCode: `FPT-SHIP-${randomNum}`,
                  steps: [
                    { title: 'Tiếp nhận đơn', status: 'completed' },
                    { title: 'Đóng thùng KTX', status: 'current' },
                    { title: 'Chuyển liên Hub', status: 'pending' },
                    { title: 'Phát tới KTX', status: 'pending' },
                  ],
                }
              : undefined,
        };

        const activeUid = get().activeUserId;
        const currentList = get().orders;
        const updatedOrders = [newOrder, ...currentList];

        set((state) => ({
          orders: updatedOrders,
          ordersByUser: activeUid
            ? { ...state.ordersByUser, [activeUid]: updatedOrders }
            : state.ordersByUser,
        }));

        return newOrder;
      },

      updateOrderStatus: (idOrCode, status, statusText) => {
        const activeUid = get().activeUserId;
        set((state) => {
          const updatedOrders = state.orders.map((o) => {
            if (o.id === idOrCode || o.code === idOrCode) {
              let color = 'text-fpt-orange';
              if (status === 'delivered' || status === 'completed') color = 'text-emerald-600';
              if (status === 'disputed') color = 'text-rose-600';
              return {
                ...o,
                status,
                statusText: statusText || (status === 'delivered' ? 'Đã nhận hàng thành công' : o.statusText),
                statusColor: color,
              };
            }
            return o;
          });

          return {
            orders: updatedOrders,
            ordersByUser: activeUid
              ? { ...state.ordersByUser, [activeUid]: updatedOrders }
              : state.ordersByUser,
          };
        });
      },

      markOrderReviewed: (idOrCode) => {
        const activeUid = get().activeUserId;
        set((state) => {
          const updatedOrders = state.orders.map((o) => {
            if (o.id === idOrCode || o.code === idOrCode) {
              return {
                ...o,
                reviewed: true,
                status: 'completed' as const,
                statusText: 'Đã đánh giá 5 sao • Đã nhận +50 Coins',
                statusColor: 'text-emerald-600',
              };
            }
            return o;
          });

          return {
            orders: updatedOrders,
            ordersByUser: activeUid
              ? { ...state.ordersByUser, [activeUid]: updatedOrders }
              : state.ordersByUser,
          };
        });
      },

      getOrder: (idOrCode) => {
        if (!idOrCode) return undefined;
        const target = String(idOrCode).trim();
        const cleanTarget = target.replace(/^#/, '').toLowerCase();
        const orders = get().orders;
        const found = orders.find((o) => {
          const oCodeClean = (o.code || '').replace(/^#/, '').toLowerCase();
          const oIdClean = (o.id || '').replace(/^#/, '').toLowerCase();
          return (
            o.id === target ||
            o.code === target ||
            oCodeClean === cleanTarget ||
            oIdClean === cleanTarget
          );
        });
        if (found) return found;

        // Fallback kiểm tra các user orders khác trong store nếu có
        for (const userOrders of Object.values(get().ordersByUser)) {
          const match = userOrders.find((o) => {
            const oCodeClean = (o.code || '').replace(/^#/, '').toLowerCase();
            const oIdClean = (o.id || '').replace(/^#/, '').toLowerCase();
            return (
              o.id === target ||
              o.code === target ||
              oCodeClean === cleanTarget ||
              oIdClean === cleanTarget
            );
          });
          if (match) return match;
        }
        return undefined;
      },

      resetOrders: () => set({ orders: [], activeUserId: null }),
    }),
    {
      name: 'fu_market_orders_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.activeUserId) {
            state.orders = [];
          } else {
            state.orders = state.ordersByUser?.[state.activeUserId] || [];
          }
        }
      },
    }
  )
);
