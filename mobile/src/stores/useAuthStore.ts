import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  studentId?: string;
  email: string;
  campus: string;
  avatarUrl?: string;
  isKycVerified: boolean;
  major?: string;
  rating?: number;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  logout: () => void;
}

const DEFAULT_MOCK_USER: UserProfile = {
  id: 'u1',
  name: 'Quân',
  studentId: 'HE163829',
  email: 'quan.nv@fpt.edu.vn',
  campus: 'HÒA LẠC',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  isKycVerified: true,
  major: 'K17 Kỹ thuật phần mềm (SE)',
  rating: 4.9,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEFAULT_MOCK_USER,
      token: 'mock-jwt-token-fu-market',
      isAuthenticated: true,
      setAuth: (user, token) => set({ user, token, isAuthenticated: !!token }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'fu-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore;
