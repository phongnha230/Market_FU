import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { reportService, BackendKycVerification } from '@/services/reportService';

export type KycType = 'student' | 'seller'; // Sinh viên (Người mua) vs Người bán (Seller)
export type KycStatus = 'pending' | 'approved' | 'rejected' | 'reupload_required';

export interface KycApplication {
  id: string;
  type: KycType;
  fullName: string;
  studentId: string;
  email: string;
  campus: string;
  major: string;
  cohort: string;
  phone: string;
  frontCardUrl: string;
  backCardUrl: string;
  selfieCardUrl?: string;
  status: KycStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  aiMatchScore: number;
  // Seller-specific details
  storeName?: string;
  primaryCategory?: string;
  bankAccount?: string;
}

interface KycStoreState {
  applications: KycApplication[];
  activeTypeTab: KycType; // 'student' or 'seller'
  isLoading: boolean;
  setActiveTypeTab: (type: KycType) => void;
  fetchApplications: () => Promise<void>;
  submitApplication: (data: Omit<KycApplication, 'id' | 'status' | 'submittedAt' | 'aiMatchScore'>) => KycApplication;
  approveApplication: (id: string, reviewer?: string) => Promise<boolean>;
  rejectApplication: (id: string, reason?: string) => Promise<boolean>;
  requestReupload: (id: string, reason?: string) => void;
}

const mapBackendKyc = (bk: BackendKycVerification): KycApplication => ({
  id: bk.id,
  type: (bk.type === 'SELLER' ? 'seller' : 'student') as KycType,
  fullName: bk.user?.profile?.fullName || bk.user?.email || 'Sinh viên FPT',
  studentId: bk.studentId,
  email: bk.user?.email || '',
  campus: bk.user?.profile?.campus || 'Hòa Lạc',
  major: 'Kỹ thuật phần mềm (SE)',
  cohort: 'K18',
  phone: bk.user?.profile?.phoneNumber || '0901234567',
  frontCardUrl: bk.cardImageUrl,
  backCardUrl: bk.cardImageUrl,
  status: (bk.status === 'APPROVED' ? 'approved' : bk.status === 'REJECTED' ? 'rejected' : 'pending') as KycStatus,
  rejectionReason: bk.rejectedReason || undefined,
  submittedAt: new Date(bk.createdAt).toLocaleString('vi-VN'),
  reviewedAt: bk.reviewedAt ? new Date(bk.reviewedAt).toLocaleString('vi-VN') : undefined,
  reviewedBy: bk.reviewedBy || undefined,
  aiMatchScore: 98,
});

const INITIAL_APPLICATIONS: KycApplication[] = [
  // 1. Sinh viên (Người mua)
  {
    id: 'kyc-stu-1',
    type: 'student',
    fullName: 'Nguyễn Tuấn Anh',
    studentId: 'HE172839',
    email: 'tuananh17383@fpt.edu.vn',
    campus: 'Hòa Lạc',
    major: 'Kỹ thuật Phần mềm (SE)',
    cohort: 'K17',
    phone: '0978 123 456',
    frontCardUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    backCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    selfieCardUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    status: 'pending',
    submittedAt: '25 phút trước',
    aiMatchScore: 100,
  },
  {
    id: 'kyc-stu-2',
    type: 'student',
    fullName: 'Trần Mai Hương',
    studentId: 'SE180412',
    email: 'huongtms180412@fpt.edu.vn',
    campus: 'TP.HCM',
    major: 'Trí tuệ Nhân tạo (AI)',
    cohort: 'K18',
    phone: '0912 345 678',
    frontCardUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    backCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    status: 'pending',
    submittedAt: '1 giờ trước',
    aiMatchScore: 95,
  },
  {
    id: 'kyc-stu-3',
    type: 'student',
    fullName: 'Đặng Khang',
    studentId: 'DG180082',
    email: 'khangddg180082@fpt.edu.vn',
    campus: 'Đà Nẵng',
    major: 'Thiết kế Mỹ thuật số (GD)',
    cohort: 'K18',
    phone: '0905 888 999',
    frontCardUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    backCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    status: 'reupload_required',
    rejectionReason: 'Ảnh chụp mặt trước bị lóa ánh đèn phòng, không rõ mã vạch và họ tên',
    submittedAt: '3 giờ trước',
    aiMatchScore: 45,
  },
  // 2. Người bán (Seller)
  {
    id: 'kyc-sel-1',
    type: 'seller',
    fullName: 'Hoàng Minh Tú',
    studentId: 'AI180019',
    email: 'tuhmai180019@fpt.edu.vn',
    campus: 'Hòa Lạc',
    major: 'An toàn Thông tin (IA)',
    cohort: 'K18',
    phone: '0982 111 222',
    frontCardUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    backCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    status: 'pending',
    submittedAt: '10 phút trước',
    aiMatchScore: 98,
    storeName: 'Tú TechZone Hòa Lạc',
    primaryCategory: 'Đồ Công Nghệ & Màn Hình',
    bankAccount: 'TPBank • 0982111222',
  },
];

export const useKycStore = create<KycStoreState>()(
  persist(
    (set, get) => ({
      applications: INITIAL_APPLICATIONS,
      activeTypeTab: 'student',
      isLoading: false,

      setActiveTypeTab: (type) => set({ activeTypeTab: type }),

      fetchApplications: async () => {
        try {
          set({ isLoading: true });
          const res = await reportService.getKycVerifications({ limit: 50 });
          if (res.verifications && res.verifications.length > 0) {
            set({ applications: res.verifications.map(mapBackendKyc) });
          }
        } catch {
          // offline fallback
        } finally {
          set({ isLoading: false });
        }
      },

      submitApplication: (data) => {
        const newApp: KycApplication = {
          ...data,
          id: `kyc-${Date.now()}`,
          status: 'pending',
          submittedAt: 'Vừa xong',
          aiMatchScore: Math.floor(Math.random() * 8) + 92, // 92-99%
        };

        set((state) => ({
          applications: [newApp, ...state.applications],
        }));

        return newApp;
      },

      approveApplication: async (id, reviewer = 'SuperAdmin BQT') => {
        try {
          await reportService.approveKyc(id, 200);
        } catch {
          // offline fallback
        }

        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id
              ? {
                  ...app,
                  status: 'approved',
                  reviewedAt: 'Vừa xong',
                  reviewedBy: reviewer,
                }
              : app
          ),
        }));
        return true;
      },

      rejectApplication: async (id, reason = 'Thông tin thẻ sinh viên không trùng khớp với hệ thống FAP') => {
        try {
          await reportService.rejectKyc(id, reason);
        } catch {
          // offline fallback
        }

        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id
              ? {
                  ...app,
                  status: 'rejected',
                  rejectionReason: reason,
                  reviewedAt: 'Vừa xong',
                }
              : app
          ),
        }));
        return true;
      },

      requestReupload: (id, reason = 'Ảnh thẻ mờ hoặc bị lóa sáng, vui lòng chụp lại rõ nét cả 2 mặt') => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id
              ? {
                  ...app,
                  status: 'reupload_required',
                  rejectionReason: reason,
                  reviewedAt: 'Vừa xong',
                }
              : app
          ),
        }));
      },
    }),
    {
      name: 'fu_kyc_store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
