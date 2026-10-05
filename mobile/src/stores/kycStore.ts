import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getUserStore = () => {
  try {
    const { useUserStore } = require('./userStore');
    return useUserStore;
  } catch {
    return null;
  }
};

export type KycStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type KycType = 'STUDENT' | 'SELLER';

export interface KycRecord {
  status: KycStatus;
  type: KycType;
  studentId: string;
  studentName?: string;
  campus?: string;
  major?: string;
  cardImageUrl: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  rejectedReason: string | null;
}

const INITIAL_KYC_BY_USER: Record<string, KycRecord> = {};

interface KycState {
  kycByUser: Record<string, KycRecord>;
  activeUserId: string | null;

  // Convenience accessors for active user
  status: KycStatus;
  type: KycType;
  studentId: string;
  cardImageUrl: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  rejectedReason: string | null;

  // Actions
  setActiveUser: (userId: string | null) => void;
  submitKyc: (
    studentId: string,
    cardImageUrl: string,
    type?: KycType,
    extra?: { studentName?: string; campus?: string; major?: string }
  ) => Promise<void>;
  simulateApproveKyc: () => Promise<void>;
  resetKyc: () => void;
}

export const useKycStore = create<KycState>()(
  persist(
    (set, get) => ({
      kycByUser: {},
      activeUserId: null,
      status: 'NONE',
      type: 'STUDENT',
      studentId: '',
      cardImageUrl: null,
      submittedAt: null,
      verifiedAt: null,
      rejectedReason: null,

      setActiveUser: (userId) => {
        const { kycByUser } = get();
        const currentId = userId || 'anonymous';
        const rec = kycByUser[currentId] || {
          status: 'NONE',
          type: 'STUDENT',
          studentId: '',
          cardImageUrl: null,
          submittedAt: null,
          verifiedAt: null,
          rejectedReason: null,
        };

        set({
          activeUserId: userId,
          status: rec.status,
          type: rec.type,
          studentId: rec.studentId,
          cardImageUrl: rec.cardImageUrl,
          submittedAt: rec.submittedAt,
          verifiedAt: rec.verifiedAt,
          rejectedReason: rec.rejectedReason,
        });
      },

      submitKyc: async (studentId, cardImageUrl, type = 'STUDENT', extra) => {
        const { kycByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';
        const now = new Date().toISOString();

        const updatedRecord: KycRecord = {
          status: 'PENDING',
          type,
          studentId,
          studentName: extra?.studentName,
          campus: extra?.campus,
          major: extra?.major,
          cardImageUrl,
          submittedAt: now,
          verifiedAt: null,
          rejectedReason: null,
        };

        set({
          status: 'PENDING',
          type,
          studentId,
          cardImageUrl,
          submittedAt: now,
          rejectedReason: null,
          kycByUser: {
            ...kycByUser,
            [currentId]: updatedRecord,
          },
        });

        // Cập nhật trạng thái người dùng trong userStore
        const userStore = getUserStore()?.getState();
        if (userStore?.user) {
          await userStore.updateUserProfile({
            kycStatus: 'PENDING',
            studentId,
          });
        }

        // Bắn ngầm lên Backend /profile/kyc
        import('../services/profileMobileService').then(({ profileMobileService }) => {
          profileMobileService
            .submitKyc({
              studentId,
              fullName: extra?.studentName || userStore?.user?.name || 'Sinh viên FPT',
              cardImageUri: cardImageUrl || undefined,
            })
            .catch(() => {});
        });
      },

      simulateApproveKyc: async () => {
        const { kycByUser, activeUserId, type, studentId } = get();
        const currentId = activeUserId || 'anonymous';
        const now = new Date().toISOString();

        const currentRec = kycByUser[currentId];
        const updatedRecord: KycRecord = {
          ...currentRec,
          status: 'APPROVED',
          verifiedAt: now,
        };

        set({
          status: 'APPROVED',
          verifiedAt: now,
          kycByUser: {
            ...kycByUser,
            [currentId]: updatedRecord,
          },
        });

        const userStore = getUserStore()?.getState();
        if (userStore?.user) {
          await userStore.updateUserProfile({
            isKycVerified: true,
            kycStatus: 'APPROVED',
            studentId: studentId || userStore.user.studentId,
            role: type === 'SELLER' ? 'SELLER' : 'BUYER',
            avatarBadge: type === 'SELLER' ? 'TOP_SELLER' : undefined,
          });
        }
      },

      resetKyc: () => {
        const { kycByUser, activeUserId } = get();
        const currentId = activeUserId || 'anonymous';

        const resetRec: KycRecord = {
          status: 'NONE',
          type: 'STUDENT',
          studentId: '',
          cardImageUrl: null,
          submittedAt: null,
          verifiedAt: null,
          rejectedReason: null,
        };

        set({
          status: 'NONE',
          type: 'STUDENT',
          studentId: '',
          cardImageUrl: null,
          submittedAt: null,
          verifiedAt: null,
          rejectedReason: null,
          kycByUser: {
            ...kycByUser,
            [currentId]: resetRec,
          },
        });
      },
    }),
    {
      name: 'fu_kyc_storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useKycStore;
