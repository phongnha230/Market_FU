import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useFavoriteStore } from './favoriteStore';
import { useVoucherStore } from './voucherStore';
import { useOrderStore } from './orderStore';
import { useNotificationStore } from './notificationStore';
import { useChatStore } from './chatStore';

export interface UserProfile {
  id?: string;
  name: string;
  studentId: string;
  cohort: string;
  major: string;
  campus: string;
  dorm: string;
  phone: string;
  email: string;
  bio: string;
  avatarUrl: string;
  coins: number;
  trustScore: number;
  savedVoucherIds: string[];
  claimedQuestIds: string[];
  lastQuestWeekKey?: string; // "2024-W03" — tuần đã claim, dùng để reset hàng tuần
  dailyCheckedIn: boolean;
  lastCheckInDate?: string; // "2024-01-15" — ngày check-in, dùng để reset hàng ngày
  kycStatus: 'unverified' | 'pending' | 'approved_student' | 'approved_seller' | 'rejected';
  role?: 'UNVERIFIED' | 'BUYER' | 'SELLER' | 'ADMIN';
  kycRole?: 'student' | 'seller';
  kycApplicationId?: string;
  kycRejectionReason?: string;
  kycSubmittedData?: any;
  vouchers: {
    id: string;
    title: string;
    code: string;
    discount: number;
    expiry: string;
  }[];
  settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    soundEnabled: boolean;
    showMaskedId: boolean;
  };
  bankAccount?: {
    bankName?: string;
    accountNo?: string;
    accountName?: string;
  };
}

interface UserState {
  user: UserProfile;
  usersById: Record<string, UserProfile>;
  isLoggedIn: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: UserProfile) => void;
  login: (email?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  setKycStatus: (status: UserProfile['kycStatus'], role?: 'student' | 'seller', appId?: string, rejectionReason?: string) => void;
  addCoins: (amount: number) => void;
  saveVoucher: (id: string, voucherData?: { id: string; title: string; code: string; discount: number; expiry: string }) => void;
  updateSettings: (settings: Partial<UserProfile['settings']>) => void;
  resetUser: () => void;
}

export const EMPTY_USER: UserProfile = {
  id: '',
  name: '',
  studentId: '',
  cohort: '',
  major: '',
  campus: 'Hòa Lạc',
  dorm: '',
  phone: '',
  email: '',
  bio: '',
  avatarUrl: '',
  coins: 0,
  trustScore: 100,
  savedVoucherIds: [],
  claimedQuestIds: [],
  dailyCheckedIn: false,
  role: 'UNVERIFIED',
  kycStatus: 'unverified',
  kycRole: 'student',
  vouchers: [],
  settings: {
    emailNotifications: true,
    smsNotifications: true,
    soundEnabled: true,
    showMaskedId: true,
  },
};

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => {
      const syncUserToCache = (updatedUser: UserProfile) => {
        const emailKey = updatedUser.email ? updatedUser.email.trim().toLowerCase() : '';
        const idKey = updatedUser.id ? updatedUser.id.trim().toLowerCase() : '';
        const primaryKey = emailKey || idKey || 'user';
        set((state) => ({
          user: updatedUser,
          usersById: {
            ...state.usersById,
            [primaryKey]: updatedUser,
            ...(emailKey ? { [emailKey]: updatedUser } : {}),
            ...(idKey ? { [idKey]: updatedUser } : {}),
          },
        }));
      };


      return {
        user: EMPTY_USER,
        usersById: {},
        isLoggedIn: false,
        accessToken: null,

        setAccessToken: (token) => set({ accessToken: token, isLoggedIn: !!token }),

        setUser: (newUser) => {
          const emailKey = newUser.email ? newUser.email.trim().toLowerCase() : '';
          const idKey = newUser.id ? newUser.id.trim().toLowerCase() : '';
          const primaryKey = emailKey || idKey || 'user';
          const existing = (emailKey && get().usersById[emailKey]) || (idKey && get().usersById[idKey]) || get().usersById[primaryKey];

          const mergedUser: UserProfile = existing
            ? {
                ...existing,
                ...newUser,
                name: newUser.name || existing.name || '',
                studentId: newUser.studentId || existing.studentId || '',
                cohort: newUser.cohort || existing.cohort || '',
                major: newUser.major || existing.major || '',
                dorm: newUser.dorm || existing.dorm || '',
                phone: newUser.phone || existing.phone || '',
                bio: newUser.bio || existing.bio || '',
                campus: newUser.campus || existing.campus || 'Hòa Lạc',
                email: newUser.email || existing.email || '',
                avatarUrl: newUser.avatarUrl || existing.avatarUrl || '',
                coins: newUser.coins !== undefined ? newUser.coins : (existing.coins !== undefined ? existing.coins : 0),
                savedVoucherIds: existing.savedVoucherIds || newUser.savedVoucherIds,
                claimedQuestIds: newUser.claimedQuestIds || existing.claimedQuestIds || [],
                dailyCheckedIn: newUser.dailyCheckedIn !== undefined ? newUser.dailyCheckedIn : (existing.dailyCheckedIn ?? false),
                vouchers: existing.vouchers || newUser.vouchers,
              }
            : {
                ...newUser,
                coins: newUser.coins !== undefined ? newUser.coins : 0,
                savedVoucherIds: newUser.savedVoucherIds || [],
                claimedQuestIds: newUser.claimedQuestIds || [],
                dailyCheckedIn: newUser.dailyCheckedIn ?? false,
                vouchers: newUser.vouchers || [],
              };

          useFavoriteStore.getState().setActiveUser(primaryKey);
          useVoucherStore.getState().setActiveUser(primaryKey);
          useOrderStore.getState().setActiveUser(primaryKey);
          useNotificationStore.getState().setActiveUser(primaryKey);
          useChatStore.getState().setActiveUser(primaryKey);

          set((state) => ({
            user: mergedUser,
            isLoggedIn: true,
            usersById: {
              ...state.usersById,
              [primaryKey]: mergedUser,
              ...(emailKey ? { [emailKey]: mergedUser } : {}),
              ...(idKey ? { [idKey]: mergedUser } : {}),
            },
          }));
        },

        login: (email) => {
          const uKey = (email || 'user').trim().toLowerCase();
          const existing = get().usersById[uKey];
          const baseUser: UserProfile = existing || {
            ...EMPTY_USER,
            id: uKey,
            email: uKey,
            name: uKey.split('@')[0],
          };

          useFavoriteStore.getState().setActiveUser(uKey);
          useVoucherStore.getState().setActiveUser(uKey);
          useOrderStore.getState().setActiveUser(uKey);
          useNotificationStore.getState().setActiveUser(uKey);
          useChatStore.getState().setActiveUser(uKey);

          set((state) => ({
            isLoggedIn: true,
            user: baseUser,
            usersById: {
              ...state.usersById,
              [uKey]: baseUser,
            },
          }));

          // Tự động đồng bộ hồ sơ & ảnh avatar Cloudflare R2 từ DB cho phiên mới
          if (email && email.includes('@') && get().accessToken) {
            import('@/services/apiClient').then(({ apiClient }) => {
              apiClient.get('/profile/me').then((res) => {
                if (res.data?.data) {
                  import('@/lib/adapters').then(({ adaptBackendUser }) => {
                    const profile = adaptBackendUser(res.data.data);
                    get().setUser(profile);
                  });
                }
              }).catch(() => {});
            }).catch(() => {});
          }
        },

        logout: () => {
          useFavoriteStore.getState().setActiveUser(null);
          useVoucherStore.getState().setActiveUser(null);
          useOrderStore.getState().setActiveUser(null);
          useNotificationStore.getState().setActiveUser(null);
          useChatStore.getState().setActiveUser(null);
          set(() => ({
            isLoggedIn: false,
            accessToken: null,
            user: EMPTY_USER,
          }));
        },

        updateProfile: (data) => {
          const updated = { ...get().user, ...data };
          syncUserToCache(updated);
        },

        setKycStatus: (status, role, appId, rejectionReason) => {
          const updated: UserProfile = {
            ...get().user,
            kycStatus: status,
            kycRole: role || get().user.kycRole,
            kycApplicationId: appId || get().user.kycApplicationId,
            kycRejectionReason: rejectionReason !== undefined ? rejectionReason : get().user.kycRejectionReason,
          };
          syncUserToCache(updated);
        },

        addCoins: (amount) => {
          const newBalance = Math.max(0, (get().user.coins || 0) + amount);
          const updated = {
            ...get().user,
            coins: newBalance,
          };
          syncUserToCache(updated);
          import('@/stores/walletStore').then(({ useWalletStore }) => {
            useWalletStore.setState({ campusCoins: newBalance });
          }).catch(() => {});
        },

        saveVoucher: (id, voucherData) => {
          const currentSaved = get().user.savedVoucherIds || [];
          if (currentSaved.includes(id)) return;
          const updatedSaved = [...currentSaved, id];
          const updatedVouchers = voucherData
            ? [...(get().user.vouchers || []), voucherData]
            : get().user.vouchers;
          const updated = {
            ...get().user,
            savedVoucherIds: updatedSaved,
            vouchers: updatedVouchers,
          };
          syncUserToCache(updated);
        },

        updateSettings: (newSettings) => {
          const updated = {
            ...get().user,
            settings: { ...get().user.settings, ...newSettings },
          };
          syncUserToCache(updated);
        },

        resetUser: () => set({ user: EMPTY_USER, isLoggedIn: false, accessToken: null }),
      };
    },
    {
      name: 'fu_market_user_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        if (!state?.accessToken || !state?.isLoggedIn || state?.user?.email?.includes('quanlmse17****')) {
          state?.logout();
          useFavoriteStore.getState().setActiveUser(null);
          useVoucherStore.getState().setActiveUser(null);
          useOrderStore.getState().setActiveUser(null);
          useNotificationStore.getState().setActiveUser(null);
          useChatStore.getState().setActiveUser(null);
        } else if (state?.user?.id || state?.user?.email) {
          const uKey = (state.user.id || state.user.email).trim().toLowerCase();
          useFavoriteStore.getState().setActiveUser(uKey);
          useVoucherStore.getState().setActiveUser(uKey);
          useOrderStore.getState().setActiveUser(uKey);
          useNotificationStore.getState().setActiveUser(uKey);
          useChatStore.getState().setActiveUser(uKey);

          // Tự động đồng bộ số dư Xu và hồ sơ mới nhất từ Backend Database khi tải lại trang
          if (typeof window !== 'undefined') {
            import('@/services/profileService').then(({ profileService }) => {
              profileService.getProfile().catch(() => {});
            }).catch(() => {});
          }
        }
      },
    }
  )
);
