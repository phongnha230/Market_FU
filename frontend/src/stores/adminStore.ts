import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

// Demo admin accounts
const ADMIN_ACCOUNTS: (AdminProfile & { password: string })[] = [
  {
    email: 'admin@fpt.edu.vn',
    password: 'AdminPassword123@',
    name: 'SuperAdmin BQT',
    role: 'superadmin',
    campus: 'all',
    avatarInitial: 'A',
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
  },
  {
    email: 'mod.hola@fpt.edu.vn',
    password: 'Mod@Hola2025',
    name: 'Nguyễn Thị Hà',
    role: 'campus_admin',
    campus: 'hola',
    avatarInitial: 'H',
    permissions: [
      'posts.approve',
      'posts.reject',
      'kyc.approve',
      'reports.handle',
    ],
  },
];

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

        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@fpt.edu.vn', password: 'AdminPassword123@' }),
          });
          const data = await res.json();
          if (data.success && data.data?.tokens?.accessToken) {
            const token = data.data.tokens.accessToken;
            set({ accessToken: token });
            return token;
          }
        } catch {
          // offline fallback
        }
        return null;
      },

      login: async (email, password) => {
        const account = ADMIN_ACCOUNTS.find(
          (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
        );
        if (!account) {
          return {
            success: false,
            message: 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.',
          };
        }
        const { password: _pw, ...profile } = account;
        set({ admin: profile, isLoggedIn: true });

        // Tự động xin access token ADMIN từ backend để gọi API KYC, Report
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: account.email, password }),
          });
          const data = await res.json();
          if (data.success && data.data?.tokens?.accessToken) {
            set({ accessToken: data.data.tokens.accessToken });
          }
        } catch {
          // offline fallback
        }

        return {
          success: true,
          message: `Chào mừng ${account.name} đã đăng nhập vào hệ thống quản trị!`,
        };
      },

      logout: () => set({ admin: null, isLoggedIn: false, accessToken: null }),

      setSelectedCampus: (campus) => set({ selectedCampus: campus }),
    }),
    {
      name: 'fu_admin_session',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : dummyStorage
      ),
    }
  )
);
