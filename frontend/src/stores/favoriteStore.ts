import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductItem } from '@/types/product';

import { productService } from '@/services/productService';

export interface FavoriteItem {
  id: string;
  sellerId?: string;
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
    id?: string;
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
  favoritesByUser: Record<string, FavoriteItem[]>;
  priceAlertsByUser: Record<string, PriceAlert[]>;
  activeUserId: string | null;
  favorites: FavoriteItem[];
  priceAlerts: PriceAlert[];
  setActiveUser: (userId: string | null) => void;
  fetchFavorites: () => Promise<void>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (product: ProductItem | FavoriteItem) => boolean;
  removeFavorite: (id: string) => void;
  clearSoldFavorites: () => number;
  addPriceAlert: (keyword: string, maxPrice: number, campus?: string) => void;
  removePriceAlert: (id: string) => void;
  resetFavorites: () => void;
}

export const INITIAL_FAVORITES: FavoriteItem[] = [];

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoritesByUser: {},
      priceAlertsByUser: {},
      activeUserId: null,
      favorites: [],
      priceAlerts: [],

      setActiveUser: (userId) => {
        const uId = userId ? String(userId).trim() : null;
        const state = get();
        const userFavs = uId && state.favoritesByUser[uId] ? state.favoritesByUser[uId] : [];
        const userAlerts = uId && state.priceAlertsByUser[uId] ? state.priceAlertsByUser[uId] : [];
        set({
          activeUserId: uId,
          favorites: userFavs,
          priceAlerts: userAlerts,
        });

        if (uId) {
          get().fetchFavorites().catch(() => {});
        }
      },

      fetchFavorites: async () => {
        const uId = get().activeUserId;
        if (!uId) return;

        try {
          const liveItems = await productService.getMyFavorites();
          if (Array.isArray(liveItems)) {
            const mappedFavs: FavoriteItem[] = liveItems.map((p) => ({
              id: p.id,
              sellerId: p.sellerId || (p.seller as any)?.id,
              title: p.title,
              category: 'electronics',
              price: p.price,
              originalPrice: p.originalPrice,
              status: p.status === 'sold' ? 'sold' : p.status === 'reserved' ? 'reserved' : 'available',
              location: p.location,
              imageUrl: p.imageUrl,
              badgeGreen: p.badges?.[0] || 'Like New',
              badgeOrange: p.badges?.[1],
              savedAt: new Date().toISOString(),
              seller: {
                id: p.sellerId || (p.seller as any)?.id,
                name: p.seller?.name || 'Sinh viên FPT',
                cohort: p.seller?.cohort || 'K18',
                studentIdMasked: 'HE17****',
                avatarColor: 'bg-orange-600',
                initials: p.seller?.initial || 'FU',
              },
            }));

            set((state) => ({
              favoritesByUser: {
                ...state.favoritesByUser,
                [uId]: mappedFavs,
              },
              favorites: mappedFavs,
            }));
          }
        } catch {
          // Keep existing local favorites on offline
        }
      },

      isFavorite: (id) => {
        return get().favorites.some((item) => item.id === id);
      },

      toggleFavorite: (product) => {
        const state = get();
        const userId = state.activeUserId;
        if (!userId) {
          return false;
        }

        const currentFavs = state.favoritesByUser[userId] || [];
        const exists = currentFavs.some((item) => item.id === product.id);

        let updatedFavs: FavoriteItem[];
        let result: boolean;

        if (exists) {
          updatedFavs = currentFavs.filter((item) => item.id !== product.id);
          result = false;
        } else {
          let newFav: FavoriteItem;
          if ('seller' in product && 'studentIdMasked' in product.seller) {
            newFav = product as FavoriteItem;
          } else {
            const p = product as ProductItem;
            newFav = {
              id: p.id,
              sellerId: p.sellerId || (p.seller as any)?.id,
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
                id: p.sellerId || (p.seller as any)?.id,
                name: p.seller.name,
                cohort: p.seller.cohort,
                studentIdMasked: 'HE17****',
                avatarColor: 'bg-orange-600',
                initials: p.seller.initial || 'FU',
              },
            };
          }
          updatedFavs = [newFav, ...currentFavs];
          result = true;
        }

        set({
          favoritesByUser: {
            ...state.favoritesByUser,
            [userId]: updatedFavs,
          },
          favorites: updatedFavs,
        });

        // Đồng bộ lưu bền vững xuống Database MongoDB
        productService.toggleFavorite(product.id).catch(() => {});

        return result;
      },

      removeFavorite: (id) => {
        const state = get();
        const userId = state.activeUserId;
        if (!userId) return;

        const currentFavs = state.favoritesByUser[userId] || [];
        const updatedFavs = currentFavs.filter((item) => item.id !== id);

        set({
          favoritesByUser: {
            ...state.favoritesByUser,
            [userId]: updatedFavs,
          },
          favorites: updatedFavs,
        });

        // Đồng bộ xóa khỏi wishlist trên Database MongoDB
        productService.toggleFavorite(id).catch(() => {});
      },

      clearSoldFavorites: () => {
        const state = get();
        const userId = state.activeUserId;
        if (!userId) return 0;

        const current = state.favoritesByUser[userId] || [];
        const remaining = current.filter((item) => item.status !== 'sold');
        const removedCount = current.length - remaining.length;

        set({
          favoritesByUser: {
            ...state.favoritesByUser,
            [userId]: remaining,
          },
          favorites: remaining,
        });

        return removedCount;
      },

      addPriceAlert: (keyword, maxPrice, campus = 'hola') => {
        const state = get();
        const userId = state.activeUserId;
        if (!userId) return;

        const currentAlerts = state.priceAlertsByUser[userId] || [];
        const newAlert: PriceAlert = {
          id: `alt-${Date.now()}`,
          keyword,
          maxPrice,
          campus,
          createdAt: new Date().toISOString(),
        };

        const updated = [newAlert, ...currentAlerts];
        set({
          priceAlertsByUser: {
            ...state.priceAlertsByUser,
            [userId]: updated,
          },
          priceAlerts: updated,
        });
      },

      removePriceAlert: (id) => {
        const state = get();
        const userId = state.activeUserId;
        if (!userId) return;

        const currentAlerts = state.priceAlertsByUser[userId] || [];
        const updated = currentAlerts.filter((a) => a.id !== id);

        set({
          priceAlertsByUser: {
            ...state.priceAlertsByUser,
            [userId]: updated,
          },
          priceAlerts: updated,
        });
      },

      resetFavorites: () => {
        const state = get();
        const userId = state.activeUserId;
        if (!userId) {
          set({ favorites: [], priceAlerts: [] });
          return;
        }

        set({
          favoritesByUser: {
            ...state.favoritesByUser,
            [userId]: [],
          },
          priceAlertsByUser: {
            ...state.priceAlertsByUser,
            [userId]: [],
          },
          favorites: [],
          priceAlerts: [],
        });
      },
    }),
    {
      name: 'fu_market_favorites_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Clean legacy mock favorites
        Object.keys(state.favoritesByUser || {}).forEach((uid) => {
          if (Array.isArray(state.favoritesByUser[uid])) {
            state.favoritesByUser[uid] = state.favoritesByUser[uid].filter((f) => !f.id?.startsWith('fav-'));
          }
        });
        if (state.activeUserId && state.favoritesByUser[state.activeUserId]) {
          state.favorites = state.favoritesByUser[state.activeUserId];
        } else {
          state.favorites = [];
        }
      },
    }
  )
);
