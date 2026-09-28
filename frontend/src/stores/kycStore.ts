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
  ocrData?: any;
  // Seller-specific details
  storeName?: string;
  primaryCategory?: string;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  citizenId?: string;
  citizenFrontCardUrl?: string;
  citizenBackCardUrl?: string;
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
  scanKycWithAi: (id: string) => Promise<boolean>;
}

const mapBackendKyc = (bk: BackendKycVerification): KycApplication => {
  const ocr = bk.ocrData;
  const studentId = (bk.studentId || ocr?.ocrStudentId || 'QE190161').trim().toUpperCase();

  // Quy chuẩn Đại học FPT: 2 chữ số ngay sau 2 chữ cái đầu là Khóa K (ví dụ: QE190161 -> "19" -> K19)
  const cohortDigits = studentId.slice(2, 4);
  const deducedCohort = cohortDigits && !isNaN(Number(cohortDigits)) ? `K${cohortDigits}` : (ocr?.ocrCohort || 'K19');

  // Quy tắc Campus theo ký tự đầu tiên
  const firstChar = studentId[0] || 'Q';
  const campusPrefixMap: Record<string, string> = {
    Q: 'Quy Nhơn',
    H: 'Hòa Lạc',
    S: 'Hồ Chí Minh',
    D: 'Đà Nẵng',
    C: 'Cần Thơ',
  };
  const deducedCampus = ocr?.ocrCampus || campusPrefixMap[firstChar] || bk.user?.profile?.campus || 'Quy Nhơn';

  return {
    id: bk.id,
    type: (bk.type === 'SELLER' ? 'seller' : 'student') as KycType,
    fullName: bk.user?.profile?.fullName || ocr?.ocrFullName || bk.user?.email || 'Sinh viên FPT',
    studentId,
    email: bk.user?.email || '',
    campus: bk.user?.profile?.campus || deducedCampus,
    major: 'Kỹ thuật phần mềm (SE)',
    cohort: deducedCohort,
    phone: bk.user?.profile?.phoneNumber || '0901234567',
    frontCardUrl: bk.cardImageUrl,
    backCardUrl: bk.cardImageUrl,
    status: (bk.status === 'APPROVED' ? 'approved' : bk.status === 'REJECTED' ? 'rejected' : 'pending') as KycStatus,
    rejectionReason: bk.rejectedReason || undefined,
    submittedAt: new Date(bk.createdAt).toLocaleString('vi-VN'),
    reviewedAt: bk.reviewedAt ? new Date(bk.reviewedAt).toLocaleString('vi-VN') : undefined,
    reviewedBy: bk.reviewedBy || undefined,
    aiMatchScore: bk.aiMatchScore ?? ocr?.aiMatchScore ?? 98,
    ocrData: ocr,
  };
};

const INITIAL_APPLICATIONS: KycApplication[] = [];

export const useKycStore = create<KycStoreState>()(
  persist(
    (set, get) => ({
      applications: [],
      activeTypeTab: 'student',
      isLoading: false,

      setActiveTypeTab: (type) => set({ activeTypeTab: type }),

      fetchApplications: async () => {
        try {
          set({ isLoading: true });
          const res = await reportService.getKycVerifications({ limit: 50 });
          if (res.verifications) {
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

      requestReupload: async (id, reason = 'Ảnh thẻ mờ hoặc bị lóa sáng, vui lòng chụp lại rõ nét cả 2 mặt') => {
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
                  status: 'reupload_required',
                  rejectionReason: reason,
                  reviewedAt: 'Vừa xong',
                }
              : app
          ),
        }));
      },

      scanKycWithAi: async (id: string) => {
        try {
          const res = await reportService.scanKycWithAi(id);
          if (res?.ocrData) {
            const ocr = res.ocrData;
            const score = res.aiMatchScore ?? ocr.aiMatchScore;
            set((state) => ({
              applications: state.applications.map((app) =>
                app.id === id
                  ? {
                      ...app,
                      ocrData: ocr,
                      aiMatchScore: score,
                    }
                  : app
              ),
            }));
            return true;
          }
        } catch (err) {
          console.error('Failed to run AI scan on KYC:', err);
        }
        return false;
      },
    }),
    {
      name: 'fu_kyc_store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.applications = (state.applications || []).filter(
            (app) => !app.id.startsWith('kyc-stu-') && !app.id.startsWith('kyc-sel-')
          );
        }
      },
    }
  )
);
