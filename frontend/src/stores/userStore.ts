import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  dailyCheckedIn: boolean;
  kycStatus: 'unverified' | 'pending' | 'approved_student' | 'approved_seller' | 'rejected';
  kycRole?: 'student' | 'seller';
  kycApplicationId?: string;
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
}

interface UserState {
  user: UserProfile;
  isLoggedIn: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  setUser: (user: UserProfile) => void;
  login: (email?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  setKycStatus: (status: UserProfile['kycStatus'], role?: 'student' | 'seller', appId?: string) => void;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  addCoins: (amount: number) => void;
  saveVoucher: (id: string, voucherData?: { id: string; title: string; code: string; discount: number; expiry: string }) => void;
  checkInDaily: () => { success: boolean; coinsAdded: number };
  claimQuestCoins: (questId: string, amount: number) => { success: boolean; amount: number };
  updateSettings: (settings: Partial<UserProfile['settings']>) => void;
  resetUser: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'user-default',
  name: 'Lê Minh Quân',
  studentId: 'HE172819',
  cohort: 'K17 SE',
  major: 'Kỹ thuật phần mềm',
  campus: 'Hòa Lạc',
  dorm: 'KTX Dom E',
  phone: '0982 345 892',
  email: 'quanlmse17****@fpt.edu.vn',
  bio: 'Sinh viên K17 Software Engineering tại Hola. Hay pass lại sách IT (PRF, PRO, CSL, MAS), linh kiện PC/Bàn phím cơ và đồ gia dụng KTX Dom A/E.',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  coins: 350,
  trustScore: 98,
  savedVoucherIds: ['vch-ship-100'],
  claimedQuestIds: ['quest-kyc'],
  dailyCheckedIn: false,
  kycStatus: 'approved_seller',
  kycRole: 'seller',
  vouchers: [
    {
      id: 'vch-ship-100',
      title: 'Giảm 100% Phí Vận Chuyển CampusShip',
      code: 'FREESHIP5CAMPUS',
      discount: 40000,
      expiry: '30/10/2025',
    },
    {
      id: 'vch-20k',
      title: 'Voucher giảm 20.000đ CampusShip Liên Campus',
      code: 'HOLASHIP20K',
      discount: 20000,
      expiry: '31/12/2026',
    },
  ],
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
    (set) => ({
      user: DEFAULT_USER,
      isLoggedIn: true,
      accessToken: null,

      setAccessToken: (token) => set({ accessToken: token }),
      setUser: (user) => set({ user }),

      login: (email) =>
        set((state) => ({
          isLoggedIn: true,
          user: email ? { ...state.user, email } : state.user,
        })),

      logout: () =>
        set(() => ({
          isLoggedIn: false,
          accessToken: null,
        })),

      updateProfile: (data) =>
        set((state) => ({
          user: { ...state.user, ...data },
        })),

      setKycStatus: (status, role, appId) =>
        set((state) => ({
          user: {
            ...state.user,
            kycStatus: status,
            kycRole: role || state.user.kycRole,
            kycApplicationId: appId || state.user.kycApplicationId,
          },
        })),

      changePassword: (oldPass, newPass) => {
        if (!oldPass || !newPass) {
          return { success: false, message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới!' };
        }
        if (newPass.length < 6) {
          return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
        }
        return { success: true, message: 'Đổi mật khẩu thành công! Hãy dùng mật khẩu mới trong lần đăng nhập tới.' };
      },

      addCoins: (amount) =>
        set((state) => ({
          user: {
            ...state.user,
            coins: Math.max(0, state.user.coins + amount),
          },
        })),

      saveVoucher: (id, voucherData) =>
        set((state) => {
          const currentSaved = state.user.savedVoucherIds || [];
          if (currentSaved.includes(id)) return state;
          const updatedSaved = [...currentSaved, id];
          const updatedVouchers = voucherData
            ? [...(state.user.vouchers || []), voucherData]
            : state.user.vouchers;
          return {
            user: {
              ...state.user,
              savedVoucherIds: updatedSaved,
              vouchers: updatedVouchers,
            },
          };
        }),

      checkInDaily: () => {
        let result = { success: false, coinsAdded: 0 };
        set((state) => {
          if (state.user.dailyCheckedIn) {
            result = { success: false, coinsAdded: 0 };
            return state;
          }
          result = { success: true, coinsAdded: 20 };
          return {
            user: {
              ...state.user,
              coins: state.user.coins + 20,
              dailyCheckedIn: true,
            },
          };
        });
        return result;
      },

      claimQuestCoins: (questId, amount) => {
        let result = { success: false, amount: 0 };
        set((state) => {
          const claimed = state.user.claimedQuestIds || [];
          if (claimed.includes(questId)) {
            result = { success: false, amount: 0 };
            return state;
          }
          result = { success: true, amount };
          return {
            user: {
              ...state.user,
              coins: state.user.coins + amount,
              claimedQuestIds: [...claimed, questId],
            },
          };
        });
        return result;
      },

      updateSettings: (newSettings) =>
        set((state) => ({
          user: {
            ...state.user,
            settings: { ...state.user.settings, ...newSettings },
          },
        })),

      resetUser: () => set({ user: DEFAULT_USER }),
    }),
    {
      name: 'fu_market_user_storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
    }
  )
);
