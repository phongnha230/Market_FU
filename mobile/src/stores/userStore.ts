import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../utils/safeStorage';
import { accountStorage, UserProfile, AccountRecord } from '../services/accountStorage';
import { authMobileService } from '../services/authMobileService';

export type { UserProfile, AccountRecord };

const syncUserToStores = (userId: string | null) => {
  try {
    const { useFavoriteStore } = require('./useFavoriteStore');
    const { useOrderStore } = require('./orderStore');
    const { useVoucherStore } = require('./voucherStore');
    const { useKycStore } = require('./kycStore');
    const { useWalletStore } = require('./walletStore');
    const { useChatStore } = require('./chatStore');

    useFavoriteStore?.getState()?.setActiveUser?.(userId);
    useOrderStore?.getState()?.setActiveUser?.(userId);
    useVoucherStore?.getState()?.setActiveUser?.(userId);
    useKycStore?.getState()?.setActiveUser?.(userId);
    useWalletStore?.getState()?.setActiveUser?.(userId);
    useChatStore?.getState()?.setActiveUser?.(userId);

    try {
      const { useNotificationStore } = require('./notificationStore');
      if (userId) {
        // Chỉ kích hoạt cờ isAccountSwitch khi đăng nhập hoặc chuyển sang tài khoản mới
        useNotificationStore?.getState()?.fetchNotifications?.({ isAccountSwitch: true })?.catch?.((err: any) => {
          console.warn('⚠️ [userStore] Lỗi khi fetch notifications đồng bộ tài khoản:', err);
        });
      } else {
        useNotificationStore?.getState()?.hideBanner?.();
      }
    } catch (notifErr) {
      console.warn('⚠️ [userStore] Lỗi require notificationStore:', notifErr);
    }
  } catch (e) {
    console.error('❌ [userStore] Lỗi đồng bộ user tới các store tính năng:', e);
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

          try {
            const backendRes = await authMobileService.login({
              email: identifier,
              password: password || '',
            });
            if (backendRes.user && backendRes.token) {
              set({
                user: backendRes.user,
                token: backendRes.token,
                isAuthenticated: true,
                hasCompletedOnboarding: true,
              });
              syncUserToStores(backendRes.user.id);
              try {
                const { socketMobileService } = require('../services/socketMobileService');
                socketMobileService?.updateAuthToken(backendRes.token);
              } catch (sockErr) {
                console.warn('⚠️ [userStore] Lỗi cập nhật socket token:', sockErr);
              }
              get().loadRegisteredAccounts().catch(() => {});
              try {
                const { notificationMobileService } = require('../services/notificationMobileService');
                notificationMobileService.registerForPushNotificationsAsync().catch((err: any) => {
                  console.warn('⚠️ [userStore] Lỗi đăng ký push notification:', err);
                });
              } catch (notifErr) {
                console.warn('⚠️ [userStore] Lỗi require notificationMobileService:', notifErr);
              }
              return {
                success: true,
                message: 'Đăng nhập thành công qua Backend API!',
                user: backendRes.user,
              };
            }
            return {
              success: false,
              message: 'Không nhận được thông tin xác thực từ máy chủ.',
            };
          } catch (apiErr: any) {
            const errMsg = apiErr?.response?.data?.message || apiErr?.message || 'Tài khoản hoặc mật khẩu không chính xác. Hãy kiểm tra lại!';
            return {
              success: false,
              message: errMsg,
            };
          }
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
              try {
                const { socketMobileService } = require('../services/socketMobileService');
                socketMobileService?.updateAuthToken(backendRes.token);
              } catch (sockErr) {
                console.warn('⚠️ [userStore] Lỗi cập nhật socket token:', sockErr);
              }
              try {
                const { notificationMobileService } = require('../services/notificationMobileService');
                notificationMobileService.registerForPushNotificationsAsync().catch((err: any) => {
                  console.warn('⚠️ [userStore] Lỗi đăng ký push notification:', err);
                });
              } catch (notifErr) {
                console.warn('⚠️ [userStore] Lỗi require notificationMobileService:', notifErr);
              }
              await get().loadRegisteredAccounts();
              return {
                success: true,
                message: `Đăng nhập thành công với vai trò ${backendRes.user.role}!`,
                user: backendRes.user,
              };
            }
            return {
              success: false,
              message: 'Không tìm thấy tài khoản vai trò này.',
            };
          } catch (apiErr: any) {
            const errMsg = apiErr?.response?.data?.message || apiErr?.message || 'Không thể đăng nhập tài khoản vai trò test. Vui lòng kiểm tra Backend.';
            return {
              success: false,
              message: errMsg,
            };
          }
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

          // Đăng ký trực tiếp qua Backend API
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
                hasCompletedOnboarding: true,
              });
              syncUserToStores(backendRes.user.id);
              try {
                const { socketMobileService } = require('../services/socketMobileService');
                socketMobileService?.updateAuthToken(backendRes.token);
              } catch (sockErr) {
                console.warn('⚠️ [userStore] Lỗi cập nhật socket token:', sockErr);
              }
              try {
                const { notificationMobileService } = require('../services/notificationMobileService');
                notificationMobileService.registerForPushNotificationsAsync().catch((err: any) => {
                  console.warn('⚠️ [userStore] Lỗi đăng ký push notification:', err);
                });
              } catch (notifErr) {
                console.warn('⚠️ [userStore] Lỗi require notificationMobileService:', notifErr);
              }
              await get().loadRegisteredAccounts();
              return {
                success: true,
                message: 'Đăng ký tài khoản thành công qua Backend API!',
                user: backendRes.user,
              };
            }
            return {
              success: false,
              message: 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.',
            };
          } catch (apiErr: any) {
            const errMsg = apiErr?.response?.data?.message || apiErr?.message || 'Không thể đăng ký tài khoản. Vui lòng thử lại.';
            return {
              success: false,
              message: errMsg,
            };
          }
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
          if (currentUser.id !== mergedUser.id) {
            syncUserToStores(mergedUser.id);
          }

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
        try {
          const { socketMobileService } = require('../services/socketMobileService');
          socketMobileService?.updateAuthToken(token);
        } catch (sockErr) {
          console.warn('⚠️ [userStore] Lỗi cập nhật socket token (setToken):', sockErr);
        }
      },

      updateUser: (partial: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updated = { ...currentUser, ...partial };
          set({ user: updated });
          if (currentUser.id !== updated.id) {
            syncUserToStores(updated.id);
          }
          if (typeof partial.coins === 'number') {
            try {
              const { useWalletStore } = require('./walletStore');
              useWalletStore.getState().addCoins(0);
            } catch (walletErr) {
              console.warn('⚠️ [userStore] Lỗi cập nhật ví coins:', walletErr);
            }
          }
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
        try {
          const { notificationMobileService } = require('../services/notificationMobileService');
          notificationMobileService?.unregisterDeviceToken?.().catch((err: any) => {
            console.warn('⚠️ [userStore] Lỗi hủy đăng ký push token:', err);
          });
        } catch (notifErr) {
          console.warn('⚠️ [userStore] Lỗi require notificationMobileService khi logout:', notifErr);
        }
        try {
          const { signOutGoogle } = require('../services/googleSignIn');
          signOutGoogle().catch((err: any) => {
          console.warn('⚠️ [userStore] Lỗi đăng xuất Google:', err);
        });
      } catch (googleErr) {
        console.warn('⚠️ [userStore] Lỗi require googleSignIn khi logout:', googleErr);
      }
        try {
          const { socketMobileService } = require('../services/socketMobileService');
          socketMobileService?.updateAuthToken(null);
        } catch (sockErr) {
          console.warn('⚠️ [userStore] Lỗi ngắt kết nối socket khi logout:', sockErr);
        }
        syncUserToStores(null);
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'fu_auth_storage',
      storage: createJSONStorage(() => safeAsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        registeredAccounts: state.registeredAccounts,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
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
        if (state?.token) {
          try {
            const { socketMobileService } = require('../services/socketMobileService');
            socketMobileService?.updateAuthToken(state.token);
          } catch {}
        }
      },
    }
  )
);

export const useAuthStore = useUserStore;
export default useUserStore;
