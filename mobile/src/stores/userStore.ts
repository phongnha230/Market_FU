import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { accountStorage, UserProfile, AccountRecord } from '../services/accountStorage';
import { authMobileService } from '../services/authMobileService';
import { useFavoriteStore } from './useFavoriteStore';
import { useOrderStore } from './orderStore';
import { useVoucherStore } from './voucherStore';
import { useKycStore } from './kycStore';
import { useWalletStore } from './walletStore';
import { useProductStore } from './productStore';

export type { UserProfile, AccountRecord };

const syncUserToStores = (userId: string | null) => {
  try {
    useFavoriteStore.getState().setActiveUser(userId);
    useOrderStore.getState().setActiveUser(userId);
    useVoucherStore.getState().setActiveUser(userId);
    useKycStore.getState().setActiveUser(userId);
    useWalletStore.getState().setActiveUser(userId);

    // Đồng bộ tức thời danh sách đơn hàng & sản phẩm từ Backend
    useOrderStore.getState().fetchOrders().catch(() => {});
    useProductStore.getState().fetchProducts().catch(() => {});
  } catch (e) {
    // Non-blocking sync error prevention
  }
};

export type RoleSelectType = 'UNVERIFIED' | 'VERIFIED' | 'SELLER' | 'UNVERIFIED_STUDENT' | 'VERIFIED_STUDENT' | 'TOP_SELLER';

interface UserState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registeredAccounts: AccountRecord[];
  hasCompletedOnboarding: boolean;

  // Actions
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  loadRegisteredAccounts: () => Promise<AccountRecord[]>;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  loginAsRole: (role: RoleSelectType) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  register: (
    userData: {
      fullName?: string;
      name?: string;
      studentId: string;
      email: string;
      campus: string;
      phone?: string;
      major?: string;
      dormRoom?: string;
      roomNumber?: string;
      bio?: string;
      password?: string;
    },
    password?: string
  ) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  updateUserProfile: (partial: Partial<UserProfile>) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  setAuth: (user: UserProfile, token: string, refreshToken?: string) => void;
  updateUser: (partial: Partial<UserProfile>) => void; // alias backward compat
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      registeredAccounts: [],
      hasCompletedOnboarding: false,

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),

      loadRegisteredAccounts: async () => {
        const accounts = await accountStorage.getAllAccounts();
        set({ registeredAccounts: accounts });
        return accounts;
      },

      login: async (identifier: string, password?: string) => {
        try {
          set({ isLoading: true });

          // 1. Thử đăng nhập trực tiếp qua Backend API trước
          try {
            const backendRes = await authMobileService.login({
              email: identifier,
              password: password || '123456',
            });
            if (backendRes.user && backendRes.token) {
              set({
                user: backendRes.user,
                token: backendRes.token,
                isAuthenticated: true,
                hasCompletedOnboarding: true,
              });
              syncUserToStores(backendRes.user.id);
              await get().loadRegisteredAccounts();
              return {
                success: true,
                message: 'Đăng nhập thành công qua Backend API!',
                user: backendRes.user,
              };
            }
          } catch (apiErr: any) {
            console.log('⚠️ [Backend Auth API Unreachable/Offline, falling back to local accounts]:', apiErr?.message);
          }

          // 2. Fallback ngoại tuyến qua local accountStorage
          const loggedUser = await accountStorage.loginAccount(identifier, password);
          if (!loggedUser) {
            return {
              success: false,
              message: 'Tài khoản hoặc mật khẩu không chính xác. Hãy kiểm tra lại!',
            };
          }
          const token = `token_${Date.now()}_${loggedUser.id}`;
          set({
            user: loggedUser,
            token,
            isAuthenticated: true,
            hasCompletedOnboarding: true,
          });
          syncUserToStores(loggedUser.id);
          await get().loadRegisteredAccounts();
          return {
            success: true,
            message: 'Đăng nhập thành công (Chế độ Local/Offline)!',
            user: loggedUser,
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Lỗi khi đăng nhập',
          };
        } finally {
          set({ isLoading: false });
        }
      },

      loginAsRole: async (role: RoleSelectType) => {
        try {
          set({ isLoading: true });
          let targetRole: 'UNVERIFIED' | 'VERIFIED' | 'SELLER' = 'VERIFIED';
          let roleEmail = 'buyer@fpt.edu.vn';
          if (role === 'UNVERIFIED' || role === 'UNVERIFIED_STUDENT') {
            targetRole = 'UNVERIFIED';
            roleEmail = 'unverified@fpt.edu.vn';
          } else if (role === 'SELLER' || role === 'TOP_SELLER') {
            targetRole = 'SELLER';
            roleEmail = 'seller@fpt.edu.vn';
          } else {
            targetRole = 'VERIFIED';
            roleEmail = 'buyer@fpt.edu.vn';
          }

          // 1. Thử đăng nhập qua Backend trước để lấy JWT token thật
          try {
            const backendRes = await authMobileService.login({
              email: roleEmail,
              password: 'Password123@',
            });
            if (backendRes.user && backendRes.token) {
              set({
                user: backendRes.user,
                token: backendRes.token,
                isAuthenticated: true,
                hasCompletedOnboarding: true,
              });
              syncUserToStores(backendRes.user.id);
              await get().loadRegisteredAccounts();
              return {
                success: true,
                message: `Đăng nhập thành công với vai trò ${backendRes.user.role}!`,
                user: backendRes.user,
              };
            }
          } catch (apiErr: any) {
            console.log('ℹ️ [Backend Role Login Offline/Unreachable, using local mock]:', apiErr?.message);
          }

          // 2. Fallback ngoại tuyến
          const testUser = await accountStorage.getTestAccountByRole(targetRole);
          const token = `token_${Date.now()}_${testUser.id}`;
          set({
            user: testUser,
            token,
            isAuthenticated: true,
            hasCompletedOnboarding: true,
          });
          syncUserToStores(testUser.id);
          await get().loadRegisteredAccounts();
          return {
            success: true,
            message: `Đăng nhập thành công với vai trò ${testUser.role}!`,
            user: testUser,
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Lỗi chuyển vai trò',
          };
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData, password = '123456') => {
        try {
          set({ isLoading: true });
          const effectiveName = userData.fullName || userData.name || 'Sinh viên FPT';
          const effectivePassword = userData.password || password;

          // 1. Thử đăng ký trực tiếp qua Backend API
          try {
            const backendRes = await authMobileService.register({
              fullName: effectiveName,
              email: userData.email,
              password: effectivePassword,
              studentId: userData.studentId,
              campus: userData.campus,
            });
            if (backendRes.user && backendRes.token) {
              set({
                user: backendRes.user,
                token: backendRes.token,
                isAuthenticated: true,
              });
              syncUserToStores(backendRes.user.id);
              await accountStorage.registerAccount(
                {
                  name: effectiveName,
                  studentId: userData.studentId,
                  email: userData.email,
                  campus: userData.campus,
                  phone: userData.phone,
                  major: userData.major,
                  roomNumber: userData.roomNumber || userData.dormRoom,
                  dormRoom: userData.dormRoom || userData.roomNumber,
                  bio: userData.bio,
                },
                effectivePassword
              );
              await get().loadRegisteredAccounts();
              return {
                success: true,
                message: 'Đăng ký tài khoản thành công qua Backend API!',
                user: backendRes.user,
              };
            }
          } catch (apiErr: any) {
            console.log('⚠️ [Backend Register Unreachable, fallback local]:', apiErr?.message);
          }

          // 2. Fallback lưu trữ offline
          const newUser = await accountStorage.registerAccount(
            {
              name: effectiveName,
              studentId: userData.studentId,
              email: userData.email,
              campus: userData.campus,
              phone: userData.phone,
              major: userData.major,
              roomNumber: userData.roomNumber || userData.dormRoom,
              dormRoom: userData.dormRoom || userData.roomNumber,
              bio: userData.bio,
            },
            effectivePassword
          );

          const token = `token_${Date.now()}_${newUser.id}`;
          set({
            user: newUser,
            token,
            isAuthenticated: true,
            hasCompletedOnboarding: true,
          });
          syncUserToStores(newUser.id);
          await get().loadRegisteredAccounts();
          return {
            success: true,
            message: 'Đăng ký tài khoản thành công (Offline)!',
            user: newUser,
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Lỗi khi đăng ký tài khoản',
          };
        } finally {
          set({ isLoading: false });
        }
      },

      updateUserProfile: async (partial: Partial<UserProfile>) => {
        try {
          set({ isLoading: true });
          const currentUser = get().user;
          if (!currentUser) {
            return {
              success: false,
              message: 'Bạn chưa đăng nhập!',
            };
          }

          const mergedUser: UserProfile = { ...currentUser, ...partial };

          // 1. Luôn cập nhật session Zustand hiện tại (được persist tự động bởi middleware vào AsyncStorage)
          set({ user: mergedUser });
          syncUserToStores(mergedUser.id);

          // 2. Cập nhật vào danh sách local accountStorage nếu tài khoản này có trong máy (không ném lỗi làm chặn session)
          try {
            await accountStorage.updateUserAccount(currentUser.id, partial);
            await get().loadRegisteredAccounts();
          } catch {
            // Tài khoản đăng nhập từ Backend API thực tế không bắt buộc nằm trong local mock accounts
          }

          return {
            success: true,
            message: 'Cập nhật hồ sơ thành công!',
            user: mergedUser,
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Lỗi khi cập nhật hồ sơ',
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // Backward-compatible methods
      setAuth: (user: UserProfile, token: string, refreshToken?: string) => {
        set({
          user,
          token,
          refreshToken: refreshToken !== undefined ? refreshToken : get().refreshToken,
          isAuthenticated: !!token,
          hasCompletedOnboarding: true,
        });
        if (user && user.id) {
          syncUserToStores(user.id);
        }
      },

      updateUser: (partial: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updated = { ...currentUser, ...partial };
          set({ user: updated });
          syncUserToStores(updated.id);
          accountStorage.updateUserAccount(currentUser.id, partial).catch(() => {});
        }
      },

      logout: () => {
        const currentToken = get().token;
        if (currentToken && !currentToken.startsWith('token_')) {
          try {
            const client = require('../services/apiClient').default;
            client?.post('/auth/logout').catch(() => {});
          } catch {
            // Ignored
          }
        }
        syncUserToStores(null);
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'fu_auth_storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          const isDummy = (url?: string | null) =>
            !url ||
            url.includes('photo-1535713875002-d1d0cf377fde') ||
            url.includes('photo-1534528741775-53994a69daeb') ||
            url.includes('photo-1570295999919-56ceb5ecca61');

          if (isDummy(state.user.avatarUrl)) {
            state.user.avatarUrl = undefined;
          }
          if (isDummy(state.user.avatar)) {
            state.user.avatar = undefined;
          }
        }
        if (state?.user?.id) {
          syncUserToStores(state.user.id);
        }
      },
    }
  )
);

export const useAuthStore = useUserStore;
export default useUserStore;
