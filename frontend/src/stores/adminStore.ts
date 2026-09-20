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
  selectedCampus: AdminCampus;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  setSelectedCampus: (campus: AdminCampus) => void;
}

// Demo admin accounts
const ADMIN_ACCOUNTS: (AdminProfile & { password: string })[] = [
  {
    email: 'admin@fpt.edu.vn',
    password: 'Admin@2025',
    name: 'Lê Minh Quân',
    role: 'superadmin',
    campus: 'all',
    avatarInitial: 'Q',
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
    (set) => ({
      admin: {
        name: 'Lê Minh Quân',
        email: 'admin@fpt.edu.vn',
        role: 'superadmin',
        campus: 'all',
        avatarInitial: 'Q',
        permissions: ADMIN_ACCOUNTS[0].permissions,
      },
      isLoggedIn: true,
      selectedCampus: 'all',

      login: (email, password) => {
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
        return {
          success: true,
          message: `Chào mừng ${account.name} đã đăng nhập vào hệ thống quản trị!`,
        };
      },

      logout: () => set({ admin: null, isLoggedIn: false }),

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
