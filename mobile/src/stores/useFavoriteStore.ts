import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteState {
  favoritesByUser: Record<string, string[]>;
  activeUserId: string | null;
  favoriteIds: string[];

  // Actions
  setActiveUser: (userId: string | null) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  getFavorites: () => string[];
}

const INITIAL_FAVORITES: Record<string, string[]> = {
  acc_verified: ['prod_dell_24', 'fav_1', 'fav_2'],
  acc_seller: ['prod_akko_3087'],
  acc_unverified: [],
};

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoritesByUser: INITIAL_FAVORITES,
      activeUserId: 'acc_verified',
      favoriteIds: INITIAL_FAVORITES.acc_verified || [],

      setActiveUser: (userId) => {
        const { favoritesByUser } = get();
        const currentId = userId || 'acc_unverified';
        const userFavs = favoritesByUser[currentId] || [];
        set({
          activeUserId: userId,
          favoriteIds: userFavs,
        });
      },

      toggleFavorite: (id: string) => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'acc_unverified';
        const currentList = favoritesByUser[currentId] || [];
        const exists = currentList.includes(id);

        const updatedList = exists
          ? currentList.filter((item) => item !== id)
          : [...currentList, id];

        set({
          favoriteIds: updatedList,
          favoritesByUser: {
            ...favoritesByUser,
            [currentId]: updatedList,
          },
        });
      },

      isFavorite: (id: string) => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'acc_unverified';
        const list = favoritesByUser[currentId] || [];
        return list.includes(id);
      },

      getFavorites: () => {
        const { favoritesByUser, activeUserId } = get();
        const currentId = activeUserId || 'acc_unverified';
        return favoritesByUser[currentId] || [];
      },
    }),
    {
      name: 'fu-favorite-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useFavoriteStore;
