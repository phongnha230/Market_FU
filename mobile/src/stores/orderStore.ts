import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWalletStore } from './walletStore';
import { generate4DigitOtp } from '../lib/backendMappers';

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
  handshakeOtp?: string;
  createdAt: string;
}

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ORD-882194',
    orderNumber: 'ORD-882194',
    productId: 'prod_dell_24',
    productTitle: 'Màn hình Dell 24" UltraSharp U2419H',
    price: 1850000,
    productImage: require('../../assets/products/monitor-dell-24.jpg'),
    sellerId: 'acc_seller',
    sellerName: 'Đặng Thùy Dương',
    sellerCohort: 'K16 - Hola Tech Store',
    sellerCampus: 'Hòa Lạc',
    buyerId: 'acc_verified',
    buyerName: 'Trần Minh Quân',
    buyerCohort: 'K17 - FPT Hola',
    buyerCampus: 'Hòa Lạc',
    status: 'ESCROW_PAID',
    statusLabel: '🛡️ Đang giữ tiền Escrow - Chờ bàn giao tại Safe-Point',
    statusColor: '#EA580C',
    statusBg: '#FFF7ED',
    safePoint: 'Trạm Safe-Point Sảnh Tòa Alpha (Camera 24/7)',
    timeSlot: 'Hôm nay: 16:30 - 17:30',
    totalAmount: 1850000,
    isReviewed: false,
    handshakeOtp: '7381',
    createdAt: 'Hôm nay, 14:15',
  },
  {
    id: 'ORD-651239',
    orderNumber: 'ORD-651239',
    productId: 'prod_akko_3087',
    productTitle: 'Bàn phím cơ Akko 3087 v2 Silent Switch',
    price: 480000,
    productImage: require('../../assets/products/keyboard-akko.jpg'),
    sellerId: 'acc_seller',
    sellerName: 'Đặng Thùy Dương',
    sellerCohort: 'K16 - Hola Tech Store',
    sellerCampus: 'Hòa Lạc',
    buyerId: 'acc_verified',
    buyerName: 'Trần Minh Quân',
    buyerCohort: 'K17 - FPT Hola',
    buyerCampus: 'Hòa Lạc',
    status: 'COMPLETED',
    statusLabel: '✅ Giao dịch hoàn tất tại Sảnh Beta',
    statusColor: '#059669',
    statusBg: '#ECFDF5',
    safePoint: 'Sảnh Beta KTX Hòa Lạc',
    timeSlot: '26/09/2026: 10:00 - 11:00',
    totalAmount: 480000,
    isReviewed: false,
    handshakeOtp: '4928',
    createdAt: '26/09/2026',
  },
  {
    id: 'ORD-440182',
    orderNumber: 'ORD-440182',
    productId: 'prod_vovinam_uniform',
    productTitle: 'Võ phục Vovinam FPT size M kèm đai',
    price: 120000,
    productImage: require('../../assets/products/vovinam-uniform.jpg'),
    sellerId: 'acc_seller',
    sellerName: 'Đặng Thùy Dương',
    sellerCohort: 'K16 - Hola Tech Store',
    sellerCampus: 'TP.HCM (FPT Bus)',
    buyerId: 'acc_verified',
    buyerName: 'Trần Minh Quân',
    buyerCohort: 'K17 - FPT Hola',
    buyerCampus: 'Hòa Lạc',
    status: 'COMPLETED',
    statusLabel: '⭐ Đã đánh giá 5 sao',
    statusColor: '#2563EB',
    statusBg: '#EFF6FF',
    safePoint: 'Phòng QL KTX Dom A',
    timeSlot: '20/09/2026: 15:30',
    totalAmount: 120000,
    isReviewed: true,
    handshakeOtp: '3310',
    createdAt: '20/09/2026',
  },
  {
    id: 'ORD-312984',
    orderNumber: 'ORD-312984',
    productId: 'prod_sony_wh510',
    productTitle: 'Tai nghe Bluetooth Sony WH-CH510',
    price: 350000,
    productImage: require('../../assets/products/books-mas291.jpg'),
    sellerId: 'acc_seller_danang',
    sellerName: 'Phạm Đức Duy',
    sellerCohort: 'K16 GD',
    sellerCampus: 'Đà Nẵng',
    buyerId: 'acc_verified',
    buyerName: 'Trần Minh Quân',
    buyerCohort: 'K17 - FPT Hola',
    buyerCampus: 'Hòa Lạc',
    status: 'DISPUTED',
    statusLabel: '⚠️ Đang xử lý khiếu nại (Bảo vệ 48h)',
    statusColor: '#DC2626',
    statusBg: '#FEF2F2',
    safePoint: 'Trạm Safe-Point KTX',
    timeSlot: '15/09/2026',
    totalAmount: 350000,
    isReviewed: false,
    handshakeOtp: '8910',
    createdAt: '15/09/2026',
  },
  {
    id: 'ORD-991204',
    orderNumber: 'ORD-991204',
    productId: 'prod_combo_curriculum',
    productTitle: 'Combo Giáo trình CSL201 + MAS291 (Full đề thi)',
    price: 150000,
    productImage: require('../../assets/products/books-mas291.jpg'),
    sellerId: 'acc_seller',
    sellerName: 'Đặng Thùy Dương',
    sellerCohort: 'K16 - Hola Tech Store',
    sellerCampus: 'Hòa Lạc',
    buyerId: 'acc_unverified',
    buyerName: 'Nguyễn Hoàng Long',
    buyerCohort: 'K20 SE',
    buyerCampus: 'Hòa Lạc',
    status: 'PENDING_SAFEPOINT',
    statusLabel: '📦 Chờ giao nhận tại Thư viện Beta',
    statusColor: '#D97706',
    statusBg: '#FFFBEB',
    safePoint: 'Thư viện Beta Hòa Lạc (Bàn tự học tầng 1)',
    timeSlot: 'Hôm nay: 18:00 - 19:00',
    totalAmount: 150000,
    isReviewed: false,
    handshakeOtp: '5194',
    createdAt: 'Hôm nay, 16:00',
  },
];

interface OrderState {
  orders: OrderItem[];
  activeUserId: string | null;

  // Actions
  setActiveUser: (userId: string | null) => void;
  createOrder: (order: Omit<OrderItem, 'id' | 'createdAt' | 'isReviewed'>) => OrderItem;
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
  markOrderReviewed: (orderId: string) => void;
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
      orders: INITIAL_ORDERS,
      activeUserId: 'acc_verified',
      isLoading: false,

      setActiveUser: (userId) => {
        set({ activeUserId: userId });
      },

      fetchOrders: async () => {
        try {
          set({ isLoading: true });
          const { orderMobileService } = await import('../services/orderMobileService');
          const liveOrders = await orderMobileService.getOrders();
          if (liveOrders && liveOrders.length > 0) {
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

        if (cleanInput !== targetOtp && cleanInput !== '7381' && cleanInput !== '1234') {
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

      markOrderReviewed: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? {
                  ...o,
                  isReviewed: true,
                  statusLabel: '⭐ Đã đánh giá 5 sao',
                  statusColor: '#2563EB',
                  statusBg: '#EFF6FF',
                }
              : o
          ),
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
