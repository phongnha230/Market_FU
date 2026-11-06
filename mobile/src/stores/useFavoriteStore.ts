import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../utils/safeStorage';
import { productMobileService } from '../services/productMobileService';
import { useProductStore } from './productStore';

interface FavoriteState {
  favoritesByUser: Record<string, string[]>;
  activeUserId: string | null;
  favoriteIds: string[];
  savedProductsMap: Record<string, any>;
  followedSellerIds: string[];

  // Actions
  setActiveUser: (userId: string | null) => void;
  fetchFavorites: () => Promise<string[]>;
  toggleFavorite: (productId: string, productData?: any) => void;
  removeFavorite: (productId: string) => void;
  clearSoldFavorites: (soldIds: string[]) => number;
  isFavorite: (productId: string) => boolean;
  getFavorites: () => string[];
  isSellerFollowed: (sellerId: string) => boolean;
  toggleFollowSeller: (sellerId: string) => boolean;
}

const INITIAL_FAVORITES: Record<string, string[]> = {};

let inFlightFavoritesPromise: Promise<string[]> | null = null;

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoritesByUser: INITIAL_FAVORITES,
      activeUserId: null,
      favoriteIds: [],
      savedProductsMap: {},
      followedSellerIds: [],

      setActiveUser: (userId) => {
        const { favoritesByUser } = get();
        const currentId = userId || 'anonymous';
        const userFavs = favoritesByUser[currentId] || [];
        set({
          activeUserId: userId,
          favoriteIds: userFavs,
        });

        if (userId) {
          get().fetchFavorites().catch(() => {});
        }
      },

      fetchFavorites: async () => {
        if (inFlightFavoritesPromise) {
          return inFlightFavoritesPromise;
        }

        inFlightFavoritesPromise = (async () => {
          try {
            const serverFavs = await productMobileService.getMyFavorites();
            if (Array.isArray(serverFavs)) {
              const serverIds = serverFavs.map((p) => p.id);
              const { favoritesByUser, activeUserId, savedProductsMap } = get();
              const currentId = activeUserId || 'anonymous';
              const localIds = favoritesByUser[currentId] || [];

              const updatedMap = { ...(savedProductsMap || {}) };
              serverFavs.forEach((favProd) => {
                updatedMap[favProd.id] = favProd;
              });

            // Đồng bộ dữ liệu chi tiết của các sản phẩm yêu thích này vào productStore
            if (serverFavs.length > 0) {
              try {
                const store = useProductStore.getState();
                const existingMap = new Map(store.products.map((p) => [p.id, p]));
                serverFavs.forEach((favProd) => {
                  existingMap.set(favProd.id, {
                    ...(existingMap.get(favProd.id) || {}),
                    ...favProd,
                  });
                });
                useProductStore.setState({ products: Array.from(existingMap.values()) });
              } catch {}
            }

            // Gộp an toàn: Nếu server trả về kết quả, kết hợp với các id local
            const mergedIds = serverFavs.length > 0
              ? Array.from(new Set([...serverIds, ...localIds]))
              : localIds;

            set({
              favoriteIds: mergedIds,
              favoritesByUser: {
                ...favoritesByUser,
                [currentId]: mergedIds,
              },
              savedProductsMap: updatedMap,
            });
            return mergedIds;
          }
        } catch (e: any) {
          console.log('⚠️ [fetchFavorites offline]:', e?.message);
        } finally {
          inFlightFavoritesPromise = null;
        }
        return get().favoriteIds;
      })();

      return inFlightFavoritesPromise;
    },

      toggleFavorite: (id: string, productData?: any) => {
        const { favoritesByUser, activeUserId, savedProductsMap } = get();
        const currentId = activeUserId || 'anonymous';
        const currentList = favoritesByUser[currentId] || [];
        const exists = currentList.includes(id);

        const updatedList = exists
          ? currentList.filter((item) => item !== id)
          : [...currentList, id];

        const updatedMap = { ...(savedProductsMap || {}) };
        if (!exists && productData) {
          updatedMap[id] = productData;
        } else if (exists) {
          delete updatedMap[id];
        }

        set({
          favoriteIds: updatedList,
          favoritesByUser: {
            ...favoritesByUser,
            [currentId]: updatedList,
          },
          savedProductsMap: updatedMap,
        });

        // Đồng bộ dữ liệu chi tiết vào useProductStore nếu có productData
        if (!exists && productData) {
          import('./productStore').then(({ useProductStore }) => {
            const store = useProductStore.getState();
            if (!store.products.some((p) => p.id === id)) {
              useProductStore.setState({ products: [productData, ...store.products] });
            }
          }).catch(() => {});
        }

        // Bắn ngầm đồng bộ lên Backend API
        productMobileService.toggleFavorite(id).catch(() => {});
      },

      removeFavorite: (id: string) => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const currentList = favoritesByUser[currentId] || [];
        if (!currentList.includes(id)) return;

        const updatedList = currentList.filter((item) => item !== id);
        set({
          favoriteIds: updatedList,
          favoritesByUser: {
            ...favoritesByUser,
            [currentId]: updatedList,
          },
        });

        productMobileService.toggleFavorite(id).catch(() => {});
      },

      clearSoldFavorites: (soldIds: string[]) => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const currentList = favoritesByUser[currentId] || [];
        const soldSet = new Set(soldIds);

        const updatedList = currentList.filter((id) => !soldSet.has(id));
        const removedCount = currentList.length - updatedList.length;

        if (removedCount > 0) {
          set({
            favoriteIds: updatedList,
            favoritesByUser: {
              ...favoritesByUser,
              [currentId]: updatedList,
            },
          });

          // Đồng bộ xóa trên Backend cho từng id đã bán
          soldIds.forEach((id) => {
            productMobileService.toggleFavorite(id).catch(() => {});
          });
        }

        return removedCount;
      },

      isFavorite: (id: string) => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const list = favoritesByUser[currentId] || [];
        return list.includes(id);
      },

      getFavorites: () => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        return favoritesByUser[currentId] || [];
      },

      isSellerFollowed: (sellerId: string) => {
        const { followedSellerIds } = get();
        return (followedSellerIds || []).includes(sellerId);
      },

      toggleFollowSeller: (sellerId: string) => {
        const { followedSellerIds } = get();
        const list = followedSellerIds || [];
        const exists = list.includes(sellerId);
        const updated = exists ? list.filter((id) => id !== sellerId) : [...list, sellerId];
        set({ followedSellerIds: updated });
        return !exists;
      },
    }),
    {
      name: 'fu-favorite-storage',
      storage: createJSONStorage(() => safeAsyncStorage),
    }
  )
);

export default useFavoriteStore;
