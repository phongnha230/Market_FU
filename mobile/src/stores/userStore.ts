import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { accountStorage, UserProfile, AccountRecord } from '../services/accountStorage';

export type { UserProfile, AccountRecord };

export type RoleSelectType = 'UNVERIFIED' | 'VERIFIED' | 'SELLER' | 'UNVERIFIED_STUDENT' | 'VERIFIED_STUDENT' | 'TOP_SELLER';

interface UserState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registeredAccounts: AccountRecord[];

  // Actions
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
  setAuth: (user: UserProfile, token: string) => void;
  updateUser: (partial: Partial<UserProfile>) => void; // alias backward compat
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      registeredAccounts: [],

      loadRegisteredAccounts: async () => {
        const accounts = await accountStorage.getAllAccounts();
        set({ registeredAccounts: accounts });
        return accounts;
      },

      login: async (identifier: string, password?: string) => {
        try {
          set({ isLoading: true });
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
          });
          await get().loadRegisteredAccounts();
          return {
            success: true,
            message: 'Đăng nhập thành công!',
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
          if (role === 'UNVERIFIED' || role === 'UNVERIFIED_STUDENT') targetRole = 'UNVERIFIED';
          else if (role === 'SELLER' || role === 'TOP_SELLER') targetRole = 'SELLER';
          else targetRole = 'VERIFIED';

          const testUser = await accountStorage.getTestAccountByRole(targetRole);
          const token = `token_${Date.now()}_${testUser.id}`;
          set({
            user: testUser,
            token,
            isAuthenticated: true,
          });
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
          });
          await get().loadRegisteredAccounts();
          return {
            success: true,
            message: 'Đăng ký tài khoản thành công!',
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

          // Cập nhật vĩnh viễn vào AsyncStorage qua accountStorage
          const updatedUser = await accountStorage.updateUserAccount(currentUser.id, partial);

          // Cập nhật session hiện tại
          set({ user: updatedUser });
          await get().loadRegisteredAccounts();
          return {
            success: true,
            message: 'Cập nhật hồ sơ thành công!',
            user: updatedUser,
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
      setAuth: (user: UserProfile, token: string) => {
        set({ user, token, isAuthenticated: !!token });
      },

      updateUser: (partial: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updated = { ...currentUser, ...partial };
          set({ user: updated });
          accountStorage.updateUserAccount(currentUser.id, partial).catch(() => {});
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'fu_auth_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useAuthStore = useUserStore;
export default useUserStore;
