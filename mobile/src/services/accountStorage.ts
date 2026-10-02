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
  coins: number;
  bankAccount?: {
    bankName: string;
    accountNo: string;
    accountName: string;
  };
}

export interface AccountRecord {
  user: UserProfile;
  passwordHash: string;
}

const ACCOUNTS_STORAGE_KEY = 'fu_registered_accounts';

export const INITIAL_TEST_ACCOUNTS: AccountRecord[] = [
  {
    passwordHash: '123456',
    user: {
      id: 'acc_unverified',
      name: 'Nguyễn Hoàng Long',
      studentId: 'SE200115',
      email: 'longnhse200115@fpt.edu.vn',
      campus: 'HÒA LẠC',
      role: 'BUYER',
      isKycVerified: false,
      kycStatus: 'NONE',
      cohort: 'K20',
      major: 'Kỹ thuật phần mềm (SE)',
      phone: '',
      roomNumber: '',
      bio: '',
      rating: 5.0,
      reputationPoints: 80,
      coins: 50,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    },
  },
  {
    passwordHash: '123456',
    user: {
      id: 'acc_verified',
      name: 'Trần Minh Quân',
      studentId: 'SE172819',
      email: 'quan.nv@fpt.edu.vn',
      campus: 'HÒA LẠC',
      role: 'BUYER',
      isKycVerified: true,
      kycStatus: 'APPROVED',
      cohort: 'K17',
      major: 'Kỹ thuật phần mềm (SE)',
      phone: '0982 345 892',
      roomNumber: 'Dom E - Phòng 304',
      bio: 'Sinh viên K17 Software Engineering tại Hola. Hay pass lại sách IT và phụ kiện đồ án.',
      rating: 4.9,
      reputationPoints: 100,
      coins: 350,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    },
  },
  {
    passwordHash: '123456',
    user: {
      id: 'acc_seller',
      name: 'Đặng Thùy Dương',
      studentId: 'SE161204',
      email: 'duongdtse161204@fpt.edu.vn',
      campus: 'HÒA LẠC',
      role: 'SELLER',
      isKycVerified: true,
      kycStatus: 'APPROVED',
      avatarBadge: 'TOP_SELLER',
      cohort: 'K16',
      major: 'An toàn thông tin (IA)',
      phone: '0918 889 999',
      roomNumber: 'Hola Tech Store (Dom B)',
      bio: 'Cửa hàng công nghệ sinh viên Hola. Chuyên màn hình Dell, bàn phím cơ, ram, ssd giá SV.',
      rating: 5.0,
      reputationPoints: 120,
      coins: 1200,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bankAccount: {
        bankName: 'Vietcombank',
        accountNo: '1029384756',
        accountName: 'DANG THUY DUONG',
      },
    },
  },
];

class AccountStorageService {
  /**
   * Lấy toàn bộ danh sách tài khoản đã đăng ký trên máy
   */
  async getAllAccounts(): Promise<AccountRecord[]> {
    try {
      const raw = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (!raw) {
        // Khởi tạo 3 tài khoản mặc định vào AsyncStorage
        await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_TEST_ACCOUNTS));
        return INITIAL_TEST_ACCOUNTS;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Lỗi đọc tài khoản từ AsyncStorage:', e);
      return INITIAL_TEST_ACCOUNTS;
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
      avatarUrl:
        userData.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
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
    if (role === 'UNVERIFIED') {
      const found = accounts.find((a) => a.user.id === 'acc_unverified');
      return found ? found.user : INITIAL_TEST_ACCOUNTS[0].user;
    }
    if (role === 'VERIFIED') {
      const found = accounts.find((a) => a.user.id === 'acc_verified');
      return found ? found.user : INITIAL_TEST_ACCOUNTS[1].user;
    }
    const found = accounts.find((a) => a.user.id === 'acc_seller');
    return found ? found.user : INITIAL_TEST_ACCOUNTS[2].user;
  }
}

export const accountStorage = new AccountStorageService();
export default accountStorage;
