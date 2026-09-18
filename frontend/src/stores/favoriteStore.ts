import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductItem } from '@/types/product';

export interface FavoriteItem {
  id: string;
  title: string;
  category: 'books' | 'electronics' | 'dorm' | 'sports' | 'fashion' | 'hobbies' | 'services';
  price: number;
  originalPrice?: number;
  tag?: string;
  badgeOrange?: string;
  badgeGreen?: string;
  badgeDark?: string;
  badgeBlue?: string;
  imageOverlayBadge?: string;
  status: 'available' | 'reserved' | 'sold';
  reservedText?: string;
  inquiryCount?: number;
  location: string;
  seller: {
    name: string;
    cohort: string;
    studentIdMasked: string;
    avatarColor: string;
    initials: string;
  };
  imageUrl: string;
  savedAt: string;
}

export interface PriceAlert {
  id: string;
  keyword: string;
  maxPrice: number;
  campus: string;
  createdAt: string;
}

interface FavoriteState {
  favorites: FavoriteItem[];
  priceAlerts: PriceAlert[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (product: ProductItem | FavoriteItem) => boolean; // returns true if now favorite, false if removed
  removeFavorite: (id: string) => void;
  clearSoldFavorites: () => number;
  addPriceAlert: (keyword: string, maxPrice: number, campus?: string) => void;
  removePriceAlert: (id: string) => void;
  resetFavorites: () => void;
}

export const INITIAL_FAVORITES: FavoriteItem[] = [
  {
    id: 'fav-1',
    title: 'Màn hình Dell SE2422H 24" FHD IPS 75Hz Full Box',
    category: 'electronics',
    price: 1450000,
    originalPrice: 1600000,
    badgeOrange: 'Giảm 150.000 đ',
    badgeGreen: 'Like New 99% Fullbox',
    imageOverlayBadge: '4 người đang hỏi mua',
    status: 'available',
    inquiryCount: 4,
    location: 'Hòa Lạc (Hola) · KTX Dom A',
    seller: {
      name: 'Hoàng Minh Trí',
      cohort: 'K16 AI',
      studentIdMasked: 'HE16****',
      avatarColor: 'bg-blue-600',
      initials: 'HT',
    },
    imageUrl: '/products/monitor-dell-24.jpg',
    savedAt: '2026-09-17T10:00:00Z',
  },
  {
    id: 'fav-2',
    title: 'Combo Giáo trình CSL201 + MAS291 FPTU Kèm tóm tắt PE',
    category: 'books',
    price: 120000,
    tag: '#CSL201 #MAS291',
    badgeDark: 'Kèm tóm tắt PE 100% Pass',
    imageOverlayBadge: 'Sẵn sàng giao tại Thư viện Gamma',
    status: 'available',
    location: 'Hòa Lạc · Tòa Alpha & Thư viện',
    seller: {
      name: 'Trần Thu Thảo',
      cohort: 'K18 IA',
      studentIdMasked: 'HE18****',
      avatarColor: 'bg-pink-600',
      initials: 'TT',
    },
    imageUrl: '/products/books-mas291.jpg',
    savedAt: '2026-09-16T15:30:00Z',
  },
  {
    id: 'fav-3',
    title: 'Nồi lẩu điện mini Lock&Lock 1.5L chống dính có khay hấp',
    category: 'dorm',
    price: 250000,
    originalPrice: 380000,
    badgeBlue: 'Chuẩn quy định KTX FPT',
    status: 'available',
    location: 'Hòa Lạc · Căng-tin Dom F',
    seller: {
      name: 'Quốc Bảo',
      cohort: 'K17 GD',
      studentIdMasked: 'HE17****',
      avatarColor: 'bg-emerald-600',
      initials: 'QB',
    },
    imageUrl: '/products/mini-pot-locklock.jpg',
    savedAt: '2026-09-15T09:15:00Z',
  },
  {
    id: 'fav-4',
    title: 'Bàn phím cơ DareU EK87 Brown Switch gõ êm KTX',
    category: 'electronics',
    price: 420000,
    badgeGreen: 'Switch êm không ồn bạn cùng phòng',
    status: 'available',
    location: 'Hòa Lạc · KTX Dom B phòng 312',
    seller: {
      name: 'Nguyễn Tuấn Anh',
      cohort: 'K17 SE',
      studentIdMasked: 'HE17****',
      avatarColor: 'bg-indigo-600',
      initials: 'TA',
    },
    imageUrl: '/products/keyboard-akko.jpg',
    savedAt: '2026-09-14T18:20:00Z',
  },
  {
    id: 'fav-5',
    title: 'Võ phục Vovinam FPT size L kèm đai xanh lam',
    category: 'sports',
    price: 140000,
    originalPrice: 200000,
    badgeDark: 'Đã bao gồm 1 VPTU',
    imageOverlayBadge: 'Size L (1m65 - 1m75)',
    status: 'available',
    location: 'Hòa Lạc · Sân tập võ Võ đường',
    seller: {
      name: 'Lê Hoàng Long',
      cohort: 'K18 HL',
      studentIdMasked: 'HE18****',
      avatarColor: 'bg-purple-600',
      initials: 'HL',
    },
    imageUrl: '/products/vovinam-uniform.jpg',
    savedAt: '2026-09-13T12:00:00Z',
  },
  {
    id: 'fav-6',
    title: 'Tai nghe Bluetooth Sony WH-CH520 màu kem, pin trâu',
    category: 'electronics',
    price: 750000,
    originalPrice: 950000,
    status: 'reserved',
    reservedText: 'Người bán hẹn giao dịch tại sảnh Gamma lúc 17h chiều nay',
    location: 'Hòa Lạc · Hẹn tại Thư viện Gamma',
    seller: {
      name: 'Trịnh Minh Đức',
      cohort: 'K17 SE',
      studentIdMasked: 'HE17****',
      avatarColor: 'bg-teal-600',
      initials: 'MĐ',
    },
    imageUrl: '/products/headphones-sony.jpg',
    savedAt: '2026-09-12T08:45:00Z',
  },
];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: INITIAL_FAVORITES,
      priceAlerts: [
        {
          id: 'alert-1',
          keyword: 'Bàn phím cơ Aula F75',
          maxPrice: 600000,
          campus: 'hola',
          createdAt: new Date().toISOString(),
        },
      ],

      isFavorite: (id) => {
        return get().favorites.some((item) => item.id === id);
      },

      toggleFavorite: (product) => {
        const currentFavs = get().favorites;
        const exists = currentFavs.some((item) => item.id === product.id);

        if (exists) {
          set({ favorites: currentFavs.filter((item) => item.id !== product.id) });
          return false;
        } else {
          // Convert ProductItem to FavoriteItem if needed
          let newFav: FavoriteItem;
          if ('seller' in product && 'studentIdMasked' in product.seller) {
            newFav = product as FavoriteItem;
          } else {
            const p = product as ProductItem;
            newFav = {
              id: p.id,
              title: p.title,
              category: 'electronics',
              price: p.price,
              originalPrice: p.originalPrice,
              status: 'available',
              location: p.location,
              imageUrl: p.imageUrl,
              badgeGreen: p.badges?.[0] || 'Like New',
              badgeOrange: p.badges?.[1],
              savedAt: new Date().toISOString(),
              seller: {
                name: p.seller.name,
                cohort: p.seller.cohort,
                studentIdMasked: 'HE17****',
                avatarColor: 'bg-orange-600',
                initials: p.seller.initial || 'FU',
              },
            };
          }

          set({ favorites: [newFav, ...currentFavs] });
          return true;
        }
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((item) => item.id !== id),
        }));
      },

      clearSoldFavorites: () => {
        const current = get().favorites;
        const remaining = current.filter((item) => item.status !== 'sold');
        const removedCount = current.length - remaining.length;
        set({ favorites: remaining });
        return removedCount;
      },

      addPriceAlert: (keyword, maxPrice, campus = 'hola') => {
        const newAlert: PriceAlert = {
          id: `alt-${Date.now()}`,
          keyword,
          maxPrice,
          campus,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ priceAlerts: [newAlert, ...state.priceAlerts] }));
      },

      removePriceAlert: (id) => {
        set((state) => ({
          priceAlerts: state.priceAlerts.filter((a) => a.id !== id),
        }));
      },

      resetFavorites: () => set({ favorites: INITIAL_FAVORITES }),
    }),
    {
      name: 'fu_market_favorites_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
    }
  )
);
