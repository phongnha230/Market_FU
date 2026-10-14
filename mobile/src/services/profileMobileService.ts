import apiClient, { ApiResponse } from './apiClient';
import { UserProfile } from '../stores/userStore';
import { adaptBackendUserToMobile } from './authMobileService';
import { toBackendCampus } from '../lib/backendMappers';

export interface WithdrawalRequestPayload {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  note?: string;
}

export const profileMobileService = {
  /**
   * Lấy hồ sơ người dùng hiện tại
   */
  async getMyProfile(): Promise<UserProfile> {
    const res = await apiClient.get<ApiResponse<any>>('/profile/me');
    return adaptBackendUserToMobile(res.data.data);
  },

  /**
   * Cập nhật thông tin cá nhân
   */
  async updateMyProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiClient.patch<ApiResponse<any>>('/profile', {
      fullName: updates.name,
      phoneNumber: updates.phone,
      dorm: updates.roomNumber,
      dormRoom: updates.roomNumber,
      bio: updates.bio,
      major: updates.major,
      cohort: updates.cohort,
    });
    return adaptBackendUserToMobile(res.data.data);
  },

  /**
   * Nộp hồ sơ xác thực Thẻ Sinh Viên (KYC)
   */
  async submitKyc(data: {
    studentId: string;
    fullName: string;
    cardImageUri?: string;
  }): Promise<{ status: string; message: string }> {
    const formData = new FormData();
    formData.append('studentId', data.studentId);
    formData.append('fullName', data.fullName);

    if (data.cardImageUri) {
      const filename = data.cardImageUri.split('/').pop() || 'student_card.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('cardImage', {
        uri: data.cardImageUri,
        name: filename,
        type,
      } as any);
    }

    const res = await apiClient.post<ApiResponse<any>>('/profile/kyc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      status: res.data?.data?.status || 'PENDING',
      message: res.data?.data?.message || 'Hồ sơ thẻ sinh viên đã được gửi thành công!',
    };
  },

  /**
   * Nộp hồ sơ Onboarding Người Bán (Họ tên, SĐT, Cơ sở, Ngân hàng + Thẻ SV)
   */
  async submitSellerOnboarding(data: {
    fullName: string;
    studentId: string;
    phoneNumber: string;
    campus: string;
    bankName: string;
    accountNo: string;
    accountName: string;
    cardImageUri?: string;
  }): Promise<{ status: string; message: string }> {
    const backendCampus = toBackendCampus(data.campus) || 'HOL';

    const formData = new FormData();
    formData.append('fullName', data.fullName.trim());
    formData.append('studentId', data.studentId.trim().toUpperCase());
    formData.append('phoneNumber', data.phoneNumber.trim() || '0901234567');
    formData.append('campus', backendCampus);
    formData.append('bankName', data.bankName.trim());
    formData.append('accountNo', data.accountNo.trim());
    formData.append('accountName', data.accountName.trim().toUpperCase());

    if (data.cardImageUri) {
      const filename = data.cardImageUri.split('/').pop() || 'seller_card.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('cardImage', {
        uri: data.cardImageUri,
        name: filename,
        type,
      } as any);
    }

    const res = await apiClient.post<ApiResponse<any>>('/profile/seller-onboarding', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      status: res.data?.data?.status || 'PENDING',
      message: res.data?.data?.message || 'Nộp hồ sơ đăng ký Người Bán thành công!',
    };
  },

  /**
   * Tạo lệnh rút tiền từ Ví Campus về tài khoản ngân hàng
   * Đồng bộ tài khoản ngân hàng qua PATCH /bank-account trước khi tạo yêu cầu
   */
  async submitWithdrawal(payload: WithdrawalRequestPayload): Promise<any> {
    if (payload.bankName && payload.accountNumber && payload.accountHolderName) {
      try {
        await apiClient.patch('/profile/bank-account', {
          bankName: payload.bankName,
          accountNo: payload.accountNumber,
          accountName: payload.accountHolderName,
        });
      } catch (err: any) {
        console.log('⚠️ [Bank account sync notice]:', err?.message);
      }
    }

    const res = await apiClient.post<ApiResponse<any>>('/profile/withdrawals', {
      amount: Math.max(50000, Number(payload.amount)),
    });
    return res.data.data;
  },

  /**
   * Lấy hồ sơ công khai của một người bán / sinh viên khác
   */
  async getPublicProfile(userId: string): Promise<any> {
    try {
      const res = await apiClient.get<ApiResponse<any>>(`/profile/public/${userId}`);
      return res.data?.data;
    } catch (e: any) {
      console.log('⚠️ [Backend getPublicProfile fallback]:', e?.message);
      return null;
    }
  },

  /**
   * Lấy lịch sử biến động Xu (Sổ cái CoinTransaction)
   */
  async getCoinHistory(page: number = 1, limit: number = 20): Promise<{ transactions: any[]; total: number }> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/profile/coins/history', {
        params: { page, limit },
      });
      const data = res.data?.data;
      if (Array.isArray(data)) {
        return { transactions: data, total: data.length };
      }
      return {
        transactions: data?.transactions || [],
        total: data?.pagination?.total || (data?.transactions || []).length,
      };
    } catch (e: any) {
      console.log('⚠️ [Backend getCoinHistory fallback]:', e?.message);
      return { transactions: [], total: 0 };
    }
  },

  /**
   * Lấy lịch sử rút tiền
   */
  async getWithdrawals(page: number = 1, limit: number = 20): Promise<{ requests: any[]; total: number }> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/profile/withdrawals', {
        params: { page, limit },
      });
      const data = res.data?.data;
      if (Array.isArray(data)) {
        return { requests: data, total: data.length };
      }
      return {
        requests: data?.requests || [],
        total: data?.pagination?.total || (data?.requests || []).length,
      };
    } catch {
      return { requests: [], total: 0 };
    }
  },

  /**
   * Đổi Xu lấy Khung Avatar / Huy hiệu danh dự
   */
  async buyAvatarBadge(badgeType: 'TOP_SELLER' | 'K18_VERIFIED' | 'REPUTABLE_TRADER'): Promise<any> {
    const res = await apiClient.post<ApiResponse<any>>('/profile/badges/buy', { badgeType });
    return res.data?.data;
  },

  /**
   * Điểm danh nhận Xu hàng ngày
   */
  async checkInDaily(): Promise<{ coinsEarned: number; streak: number; message: string }> {
    const res = await apiClient.post<ApiResponse<any>>('/profile/check-in');
    return res.data.data;
  },

  /**
   * Kiểm tra trạng thái điểm danh hôm nay
   */
  async getCheckInStatus(): Promise<{ checkedInToday: boolean; streak: number }> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/profile/check-in-status');
      return res.data?.data || { checkedInToday: false, streak: 0 };
    } catch {
      return { checkedInToday: false, streak: 0 };
    }
  },

  /**
   * Nhận thưởng nhiệm vụ tuần
   */
  async claimQuest(
    questId: string,
    amount: number = 20
  ): Promise<{ message: string; coinsEarned: number }> {
    const res = await apiClient.post<ApiResponse<any>>('/profile/claim-quest', {
      questId,
      amount: Math.min(200, Math.max(1, amount)),
    });
    return res.data?.data;
  },
};

export default profileMobileService;

