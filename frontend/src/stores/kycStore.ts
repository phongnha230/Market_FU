import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { reportService, BackendKycVerification } from '@/services/reportService';
import { safeLocalStorage } from '@/utils/safeStorage';

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
  avatarUrl?: string;
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
  const deducedCohort = bk.cohort || (cohortDigits && !isNaN(Number(cohortDigits)) ? `K${cohortDigits}` : (ocr?.ocrCohort || ''));

  // Quy tắc Campus theo dữ liệu khai báo hoặc ký tự đầu tiên
  const firstChar = studentId[0] || '';
  const campusPrefixMap: Record<string, string> = {
    Q: 'Quy Nhơn',
    H: 'Hòa Lạc',
    S: 'Hồ Chí Minh',
    D: 'Đà Nẵng',
    C: 'Cần Thơ',
  };
  const campusCodeMap: Record<string, string> = {
    HOL: 'Hòa Lạc',
    HCM: 'TP. Hồ Chí Minh',
    DAD: 'Đà Nẵng',
    QN: 'Quy Nhơn',
    CT: 'Cần Thơ',
  };
  const submittedCampus = bk.campus ? (campusCodeMap[bk.campus] || bk.campus) : undefined;
  const deducedCampus = submittedCampus || ocr?.ocrCampus || campusPrefixMap[firstChar] || (bk.user?.profile?.campus ? (campusCodeMap[bk.user.profile.campus] || bk.user.profile.campus) : 'Chưa xác định');

  return {
    id: bk.id,
    type: (bk.type === 'SELLER' ? 'seller' : 'student') as KycType,
    fullName: bk.fullName || bk.user?.profile?.fullName || ocr?.ocrFullName || bk.user?.email || 'Sinh viên FPT',
    studentId,
    email: bk.user?.email || '',
    campus: deducedCampus,
    major: bk.major || 'Kỹ thuật phần mềm (SE)',
    cohort: deducedCohort,
    phone: bk.phoneNumber || bk.user?.profile?.phoneNumber || '',
    avatarUrl: bk.user?.profile?.avatarUrl || undefined,
    frontCardUrl: bk.type === 'SELLER' && (bk.user?.profile?.kyc as any)?.cccdFrontUrl ? (bk.user?.profile?.kyc as any)?.cccdFrontUrl : bk.cardImageUrl,
    backCardUrl: bk.type === 'SELLER' && (bk.user?.profile?.kyc as any)?.cccdBackUrl ? (bk.user?.profile?.kyc as any)?.cccdBackUrl : (bk.cardBackUrl || bk.cardImageUrl),
    selfieCardUrl: bk.selfieCardUrl || bk.user?.profile?.avatarUrl || undefined,
    status: (bk.status === 'APPROVED' ? 'approved' : bk.status === 'REJECTED' ? 'rejected' : 'pending') as KycStatus,
    rejectionReason: bk.rejectedReason || undefined,
    submittedAt: new Date(bk.createdAt).toLocaleString('vi-VN'),
    reviewedAt: bk.reviewedAt ? new Date(bk.reviewedAt).toLocaleString('vi-VN') : undefined,
    reviewedBy: bk.reviewedBy || undefined,
    aiMatchScore: bk.aiMatchScore ?? ocr?.aiMatchScore ?? 0,
    ocrData: ocr,
    storeName: (bk.user?.profile as any)?.storeName || (bk.user?.profile?.fullName ? `Góc Pass Đồ ${bk.user.profile.fullName}` : undefined),
    bankName: bk.user?.profile?.bankAccount?.bankName,
    bankAccount: bk.user?.profile?.bankAccount?.accountNo ? `${bk.user?.profile?.bankAccount?.bankName} - ${bk.user?.profile?.bankAccount?.accountNo} (${bk.user?.profile?.bankAccount?.accountName})` : undefined,
    bankAccountName: bk.user?.profile?.bankAccount?.accountName,
    citizenId: (bk.user?.profile?.kyc as any)?.cccdNumber || ocr?.ocrCccdNumber || (bk.type === 'SELLER' && bk.studentId && bk.studentId.length === 12 && /^\d+$/.test(bk.studentId) ? bk.studentId : undefined),
    citizenFrontCardUrl: (bk.user?.profile?.kyc as any)?.cccdFrontUrl || (bk.type === 'SELLER' ? bk.cardImageUrl : undefined),
    citizenBackCardUrl: (bk.user?.profile?.kyc as any)?.cccdBackUrl || (bk.type === 'SELLER' ? bk.cardBackUrl || bk.cardImageUrl : undefined),
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
          try {
            const { useAdminStore } = await import('./adminStore');
            await useAdminStore.getState().ensureAdminToken();
          } catch {}

          const res = await reportService.getKycVerifications({ limit: 50 });
          if (res.verifications) {
            const backendApps = res.verifications.map(mapBackendKyc);
            set((state) => {
              const backendIds = new Set(backendApps.map((a) => a.id));
              const backendEmails = new Set(backendApps.map((a) => a.email.toLowerCase()));
              // Giữ lại các hồ sơ được gửi từ phía client / offline chưa kịp đẩy lên backend
              const preservedLocal = state.applications.filter(
                (local) => !backendIds.has(local.id) && !backendEmails.has(local.email.toLowerCase())
              );
              return { applications: [...backendApps, ...preservedLocal] };
            });
          }
        } catch {
          // offline fallback: giữ nguyên applications hiện có
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
          aiMatchScore: 0, // Chưa quét AI → 0, chỉ có giá trị thực sau khi AI quét xong
        };

        set((state) => {
          // Lọc bỏ hồ sơ cũ của cùng email nếu có để thay thế bằng hồ sơ mới nhất
          const filtered = state.applications.filter(
            (app) => app.email.toLowerCase() !== data.email.toLowerCase()
          );
          return { applications: [newApp, ...filtered] };
        });

        return newApp;
      },

      approveApplication: async (id, reviewer = 'SuperAdmin BQT') => {
        const app = get().applications.find((a) => a.id === id);
        const targetId = app?.id && app.id.length === 24 ? app.id : (app?.studentId || app?.email || id);
        try {
          await reportService.approveKyc(targetId, 200);
        } catch (err: any) {
          console.warn('⚠️ [approveApplication API warning]:', err?.message);
        }

        if (app) {
          try {
            const { useUserStore } = await import('./userStore');
            const currentUser = useUserStore.getState().user;
            if (
              currentUser.email?.toLowerCase() === app.email.toLowerCase() ||
              currentUser.studentId?.toUpperCase() === app.studentId.toUpperCase()
            ) {
              useUserStore.getState().setKycStatus(
                app.type === 'seller' ? 'approved_seller' : 'approved_student',
                app.type,
                app.id
              );
              useUserStore.getState().addCoins(200);
              const { profileService } = await import('@/services/profileService');
              await profileService.getProfile().catch(() => {});
            }
          } catch {}
        }

        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id || (app && a.email.toLowerCase() === app.email.toLowerCase())
              ? {
                  ...a,
                  status: 'approved',
                  reviewedAt: 'Vừa xong',
                  reviewedBy: reviewer,
                }
              : a
          ),
        }));
        return true;
      },

      rejectApplication: async (id, reason = 'Thông tin thẻ sinh viên không trùng khớp với hệ thống FAP') => {
        const app = get().applications.find((a) => a.id === id);
        const targetId = app?.id && app.id.length === 24 ? app.id : (app?.studentId || app?.email || id);
        try {
          await reportService.rejectKyc(targetId, reason);
        } catch (err: any) {
          console.warn('⚠️ [rejectApplication API warning]:', err?.message);
        }

        if (app) {
          try {
            const { useUserStore } = await import('./userStore');
            const currentUser = useUserStore.getState().user;
            if (
              currentUser.email?.toLowerCase() === app.email.toLowerCase() ||
              currentUser.studentId?.toUpperCase() === app.studentId.toUpperCase()
            ) {
              useUserStore.getState().setKycStatus('rejected', app.type, app.id, reason);
            }
          } catch {}
        }

        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id || (app && a.email.toLowerCase() === app.email.toLowerCase())
              ? {
                  ...a,
                  status: 'rejected',
                  rejectionReason: reason,
                  reviewedAt: 'Vừa xong',
                }
              : a
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
        const app = get().applications.find((a) => a.id === id);
        const targetId = app?.id && app.id.length === 24 ? app.id : (app?.studentId || app?.email || id);
        try {
          const res = await reportService.scanKycWithAi(targetId);
          if (res?.ocrData) {
            const ocr = res.ocrData;
            const score = res.aiMatchScore ?? ocr.aiMatchScore;
            set((state) => ({
              applications: state.applications.map((item) =>
                item.id === id || (app && item.email?.toLowerCase() === app.email.toLowerCase())
                  ? {
                      ...item,
                      ocrData: ocr,
                      aiMatchScore: score,
                    }
                  : item
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
      storage: createJSONStorage(() => safeLocalStorage),
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
