import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeLocalStorage } from '@/utils/safeStorage';

export type AdminRole = 'superadmin' | 'moderator' | 'campus_admin';
export type AdminCampus = 'all' | 'hola' | 'hcm' | 'danang' | 'cantho' | 'quynhon';

export interface AdminProfile {
  name: string;
  email: string;
  role: AdminRole;
  campus: AdminCampus;
  avatarInitial: string;
  permissions: string[];
}

interface AdminState {
  admin: AdminProfile | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  selectedCampus: AdminCampus;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  setSelectedCampus: (campus: AdminCampus) => void;
  setAccessToken: (token: string | null) => void;
  ensureAdminToken: () => Promise<string | null>;
}

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      admin: null,
      isLoggedIn: false,
      accessToken: null,
      selectedCampus: 'all',

      setAccessToken: (token) => set({ accessToken: token }),

      ensureAdminToken: async () => {
        const existing = get().accessToken;
        if (existing) return existing;
        return null;
      },

      login: async (email, password) => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            return {
              success: false,
              message: data.message || 'Email hoặc mật khẩu quản trị không đúng.',
            };
          }

          const user = data.data?.user;
          const token = data.data?.tokens?.accessToken;
          if (user?.role !== 'ADMIN') {
            return {
              success: false,
              message: 'Tài khoản này không có quyền truy cập bảng quản trị BQT.',
            };
          }

          const profile: AdminProfile = {
            name: user.profile?.fullName || user.email?.split('@')[0] || 'Quản trị viên',
            email: user.email,
            role: 'superadmin',
            campus: 'all',
            avatarInitial: (user.profile?.fullName || 'A')[0].toUpperCase(),
            permissions: [
              'posts.approve',
              'posts.reject',
              'posts.delete',
              'kyc.approve',
              'kyc.reject',
              'users.manage',
              'users.trust_score',
              'reports.handle',
              'safehandoff.manage',
              'settings.system',
            ],
          };

          if (token) {
            set({ accessToken: token });
          }
          set({ admin: profile, isLoggedIn: true });

          return {
            success: true,
            message: `Chào mừng ${profile.name} đã đăng nhập vào hệ thống quản trị!`,
          };
        } catch {
          return {
            success: false,
            message: 'Không thể kết nối đến máy chủ xác thực BQT.',
          };
        }
      },

      logout: () => set({ admin: null, isLoggedIn: false, accessToken: null }),

      setSelectedCampus: (campus) => set({ selectedCampus: campus }),
    }),
    {
      name: 'fu_admin_session',
      storage: createJSONStorage(() => safeLocalStorage),
    }
  )
);
