import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  orders: OrderItem[];
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
      orders: INITIAL_ORDERS,

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

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      updateOrderStatus: (idOrCode, status, statusText) => {
        set((state) => ({
          orders: state.orders.map((o) => {
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
          }),
        }));
      },

      markOrderReviewed: (idOrCode) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id === idOrCode || o.code === idOrCode) {
              return {
                ...o,
                reviewed: true,
                status: 'completed',
                statusText: 'Đã đánh giá 5 sao • Đã nhận +50 Coins',
                statusColor: 'text-emerald-600',
              };
            }
            return o;
          }),
        }));
      },

      getOrder: (idOrCode) => {
        return get().orders.find((o) => o.id === idOrCode || o.code === idOrCode);
      },

      resetOrders: () => set({ orders: INITIAL_ORDERS }),
    }),
    {
      name: 'fu_market_orders_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
    }
  )
);
