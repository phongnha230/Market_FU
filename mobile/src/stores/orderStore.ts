import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  price: number;
  productImage: any;
  sellerId: string;
  sellerName: string;
  sellerCohort?: string;
  buyerId: string;
  buyerName: string;
  buyerCohort?: string;
  status: 'PENDING_SAFEPOINT' | 'HANDOVER_CONFIRMED' | 'ESCROW_PAID' | 'COMPLETED' | 'CANCELLED';
  statusLabel: string;
  safePoint: string;
  timeSlot: string;
  totalAmount: number;
  isReviewed?: boolean;
  createdAt: string;
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ORD-882194',
    productId: 'prod_dell_24',
    productTitle: 'Màn hình Dell 24" UltraSharp U2419H',
    price: 1850000,
    productImage: require('../../assets/products/monitor-dell-24.jpg'),
    sellerId: 'acc_seller',
    sellerName: 'Đặng Thùy Dương',
    sellerCohort: 'K16 - Hola Tech Store',
    buyerId: 'acc_verified',
    buyerName: 'Trần Minh Quân',
    buyerCohort: 'K17 - FPT Hola',
    status: 'PENDING_SAFEPOINT',
    statusLabel: 'Chờ giao nhận tại Safe-Point Sảnh Alpha',
    safePoint: 'Trạm Safe-Point Sảnh Tòa Alpha (Camera 24/7)',
    timeSlot: 'Hôm nay: 16:30 - 17:30',
    totalAmount: 1850000,
    isReviewed: false,
    createdAt: 'Hôm nay',
  },
];

interface OrderState {
  orders: OrderItem[];
  createOrder: (order: Omit<OrderItem, 'id' | 'createdAt' | 'isReviewed'>) => OrderItem;
  updateOrderStatus: (orderId: string, status: OrderItem['status'], statusLabel: string) => void;
  getBuyerOrders: (buyerId: string) => OrderItem[];
  getSellerOrders: (sellerId: string) => OrderItem[];
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: INITIAL_ORDERS,

      createOrder: (orderData) => {
        const newOrder: OrderItem = {
          ...orderData,
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: 'Vừa xong',
          isReviewed: false,
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      updateOrderStatus: (orderId, status, statusLabel) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status, statusLabel } : o
          ),
        }));
      },

      getBuyerOrders: (buyerId: string) => {
        return get().orders.filter((o) => o.buyerId === buyerId);
      },

      getSellerOrders: (sellerId: string) => {
        return get().orders.filter((o) => o.sellerId === sellerId);
      },
    }),
    {
      name: 'fu_orders_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useOrderStore;
