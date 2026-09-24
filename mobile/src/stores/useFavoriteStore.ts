import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteState {
  favoriteIds: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (id: string) => {
        const { favoriteIds } = get();
        const exists = favoriteIds.includes(id);
        set({
          favoriteIds: exists
            ? favoriteIds.filter((item) => item !== id)
            : [...favoriteIds, id],
        });
      },
      isFavorite: (id: string) => get().favoriteIds.includes(id),
    }),
    {
      name: 'fu-favorite-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useFavoriteStore;
