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

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord-1',
    code: '#ORD-88392-HCM-HL',
    type: 'inter-campus',
    typeLabel: 'Inter-Campus Express • FPT CampusShip',
    timeLabel: 'Tạo lúc 09:15 - Hôm qua',
    status: 'shipping',
    statusText: 'Đang trên xe trung chuyển',
    statusColor: 'text-fpt-orange',
    product: {
      title: 'Màn hình phụ di động 15.6 inch Type-C FHD IPS (Fullbox cáp zin)',
      subtitle: 'Phù hợp học Code WEB2013 / Đồ họa • Hỗ trợ kết nối một dây Type-C PD',
      price: 1225000,
      escrowBadge: 'Đã cọc Escrow bảo hộ',
      conditionBadge: 'Like New',
      imageUrl: '/products/monitor-dell-24.jpg',
      seller: {
        name: 'Nguyễn Văn An',
        cohortCampus: 'K16 SE - FPT Q.9 TP.HCM',
        verifiedText: 'Miễn phí ký gửi liên cơ sở',
      },
    },
    tracking: {
      routeTitle: 'Tuyến Hub Nam - Bắc (FPT Q.9 TP.HCM ➔ FPT Hòa Lạc)',
      estimatedArrival: 'Dự kiến đến Dom B: 14:00 Ngày mai',
      currentLocation: 'Đang trung chuyển an toàn qua FPT Express Bus Hub Đà Nẵng',
      trackingCode: 'FPT-SHIP-99410',
      steps: [
        { title: 'Kho Q.9 Rời bến', status: 'completed' },
        { title: 'Hub FPT Đà Nẵng', status: 'current' },
        { title: 'Trung chuyển Nội Bài', status: 'pending' },
        { title: 'Trạm nhận Dom B HL', status: 'pending' },
      ],
    },
  },
  {
    id: 'ord-2',
    code: '#ORD-77102-HL-HL',
    type: 'safe-handoff',
    typeLabel: 'Nội bộ Hòa Lạc - Safe Handoff',
    timeLabel: 'Giao lúc 11:30 - Hôm nay',
    status: 'delivered',
    statusText: 'Giao thành công tại Thư viện Beta',
    statusColor: 'text-emerald-600',
    reviewed: false,
    product: {
      title: 'Combo Giáo trình PE CSL201 (Data Structures) + MAS291 (Xác suất thống kê)',
      subtitle: 'Sách in chuẩn bản quyền FPT, có ghi chú giải đề thi thử PE các kỳ Fall 2023 - Summer 2024',
      price: 150000,
      escrowBadge: 'Đã tất toán ví Escrow',
      conditionBadge: 'Used - Good',
      imageUrl: '/products/books-mas291.jpg',
      seller: {
        name: 'Trần Thùy Trang',
        cohortCampus: 'K17 GD - Hola Campus',
        verifiedText: 'Đã quét mã nhận hàng tại quầy Thư viện Beta',
      },
    },
    rewardPrompt: {
      title: 'Đánh giá người bán để nâng điểm Trust Score',
      subtitle: 'Chia sẻ chất lượng tài liệu giáo trình và nhận ngay Voucher 20K áp dụng cước chuyển phát liên Hub 5 Campus!',
      voucherAmount: 'Voucher 20K',
    },
  },
];

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
                statusText: bo.status === 'COMPLETED' ? 'Giao dịch thành công' : bo.status === 'PAID' ? 'Đã nạp Escrow bảo hộ' : bo.status === 'SHIPPING' ? 'Đang vận chuyển' : bo.status === 'DELIVERED' ? 'Đã giao tới nơi' : 'Chờ xử lý',
                statusColor: statusColorMap[bo.status] || 'text-fpt-orange',
                reviewed: bo.reviews && bo.reviews.length > 0,
                buyerId: bo.buyerId,
                sellerId: bo.sellerId,
                handshake: bo.handshake,
                product: {
                  title: bo.product?.title || 'Sản phẩm FPT Market',
                  subtitle: bo.product?.meetupLocation || 'Bàn giao trực tiếp campus',
                  price: bo.payment.price,
                  escrowBadge: bo.orderType === 'SHIP_COD' ? 'Đã cọc Escrow bảo hộ 48h' : 'Xác thực QR Handshake',
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

      createOrder: ({ product, type = 'inter-campus', deliveryNote }) => {
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const newCode = `#ORD-${randomNum}-CAMPUS`;
        const newId = `ord-${Date.now()}`;

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
          product,
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
        return get().orders.find((o) => o.id === idOrCode || o.code === idOrCode);
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
          if (state.orders?.some((o) => o.id === 'ord-1' || o.id === 'ord-2')) {
            state.orders = state.orders.filter((o) => o.id !== 'ord-1' && o.id !== 'ord-2');
          }
        }
      },
    }
  )
);
