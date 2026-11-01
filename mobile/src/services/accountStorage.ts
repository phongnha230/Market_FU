import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  studentId: string;
  email: string;
  campus: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  isKycVerified: boolean;
  kycStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  avatarUrl?: string;
  avatar?: string;
  avatarBadge?: string;
  cohort?: string;
  major?: string;
  phone?: string;
  roomNumber?: string;
  dormRoom?: string;
  bio?: string;
  rating: number;
  reputationPoints: number;
  reputationScore?: number;
  coins: number;
  bankAccount?: {
    bankName: string;
    accountNo: string;
    accountName: string;
  };
  orderSummary?: {
    pending: number;
    handoff: number;
    shipping: number;
    unreviewed: number;
    disputed: number;
  };
}

export interface AccountRecord {
  user: UserProfile;
  passwordHash: string;
}

const ACCOUNTS_STORAGE_KEY = 'fu_registered_accounts';

export const INITIAL_TEST_ACCOUNTS: AccountRecord[] = [];

class AccountStorageService {
  /**
   * Lấy toàn bộ danh sách tài khoản đã đăng ký trên máy
   */
  async getAllAccounts(): Promise<AccountRecord[]> {
    try {
      const raw = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Lỗi đọc tài khoản từ AsyncStorage:', e);
      return [];
    }
  }

  /**
   * Đăng ký tài khoản sinh viên mới và lưu vĩnh viễn vào Local Storage
   */
  async registerAccount(
    userData: Omit<UserProfile, 'id' | 'role' | 'isKycVerified' | 'kycStatus' | 'rating' | 'reputationPoints' | 'coins'>,
    passwordHash: string
  ): Promise<UserProfile> {
    const accounts = await this.getAllAccounts();

    const normalizedEmail = userData.email.trim().toLowerCase();
    const normalizedId = userData.studentId.trim().toUpperCase();

    // Kiểm tra trùng
    const isExisted = accounts.some(
      (acc) =>
        acc.user.email.toLowerCase() === normalizedEmail ||
        acc.user.studentId.toUpperCase() === normalizedId
    );

    if (isExisted) {
      throw new Error('Mã số sinh viên hoặc Email FPT này đã được đăng ký!');
    }

    const isDummyAvatar = (url?: string | null) =>
      !url ||
      url.includes('photo-1535713875002-d1d0cf377fde') ||
      url.includes('photo-1534528741775-53994a69daeb') ||
      url.includes('photo-1570295999919-56ceb5ecca61');

    const newUser: UserProfile = {
      ...userData,
      id: `usr_${Date.now()}`,
      studentId: normalizedId,
      email: normalizedEmail,
      role: 'BUYER',
      isKycVerified: false,
      kycStatus: 'NONE',
      rating: 5.0,
      reputationPoints: 100,
      coins: 50,
      avatarUrl: userData.avatarUrl && !isDummyAvatar(userData.avatarUrl) ? userData.avatarUrl : undefined,
    };

    const updatedAccounts = [
      { user: newUser, passwordHash: passwordHash || '123456' },
      ...accounts,
    ];

    await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
    return newUser;
  }

  /**
   * Xác thực đăng nhập qua Email / MSSV và mật khẩu
   */
  async loginAccount(identifier: string, passwordHash?: string): Promise<UserProfile | null> {
    const accounts = await this.getAllAccounts();
    const idKey = identifier.trim().toLowerCase();

    const matched = accounts.find((acc) => {
      const emailMatch = acc.user.email.toLowerCase() === idKey;
      const mssvMatch = acc.user.studentId.toLowerCase() === idKey;
      return emailMatch || mssvMatch;
    });

    if (!matched) {
      return null;
    }

    // Nếu có mật khẩu kiểm tra (mặc định demo '123456' hoặc bất kỳ nếu bỏ trống)
    if (passwordHash && matched.passwordHash !== passwordHash) {
      // Để tạo trải nghiệm mượt mà cho sinh viên, nếu mật khẩu nhập '123456' vẫn cho phép
      if (passwordHash !== '123456') {
        throw new Error('Mật khẩu không chính xác!');
      }
    }

    return matched.user;
  }

  /**
   * Cập nhật thông tin hồ sơ của tài khoản trong Local Storage
   */
  async updateUserAccount(userId: string, partial: Partial<UserProfile>): Promise<UserProfile> {
    const accounts = await this.getAllAccounts();
    let updatedUser: UserProfile | null = null;

    const updatedAccounts = accounts.map((acc) => {
      if (acc.user.id === userId) {
        updatedUser = {
          ...acc.user,
          ...partial,
        };
        return {
          ...acc,
          user: updatedUser,
        };
      }
      return acc;
    });

    if (!updatedUser) {
      throw new Error('Không tìm thấy tài khoản cần cập nhật trong bộ nhớ máy!');
    }

    await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
    return updatedUser;
  }

  /**
   * Khôi phục hoặc tạo tài khoản theo role mẫu
   */
  async getTestAccountByRole(role: 'UNVERIFIED' | 'VERIFIED' | 'SELLER'): Promise<UserProfile> {
    const accounts = await this.getAllAccounts();
    const targetRole = role === 'SELLER' ? 'SELLER' : 'BUYER';
    const found = accounts.find((a) => a.user.role === targetRole);
    if (found) return found.user;
    return {
      id: `acc_${role.toLowerCase()}`,
      name: role === 'SELLER' ? 'Người bán FPT' : 'Sinh viên FPT',
      studentId: 'SE000000',
      email: `${role.toLowerCase()}@fpt.edu.vn`,
      campus: 'HÒA LẠC',
      role: targetRole,
      isKycVerified: role !== 'UNVERIFIED',
      kycStatus: role === 'UNVERIFIED' ? 'NONE' : 'APPROVED',
      avatarUrl: undefined,
      rating: 5.0,
      reputationPoints: 100,
      coins: 0,
    };
  }
}

export const accountStorage = new AccountStorageService();
export default accountStorage;
