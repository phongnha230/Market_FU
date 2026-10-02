import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from './userStore';

export type KycStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type KycType = 'STUDENT' | 'SELLER';

interface KycState {
  status: KycStatus;
  type: KycType;
  studentId: string;
  cardImageUrl: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  rejectedReason: string | null;

  // Actions
  submitKyc: (studentId: string, cardImageUrl: string, type?: KycType) => Promise<void>;
  simulateApproveKyc: () => Promise<void>;
  resetKyc: () => void;
}

export const useKycStore = create<KycState>()(
  persist(
    (set, get) => ({
      status: 'NONE',
      type: 'STUDENT',
      studentId: '',
      cardImageUrl: null,
      submittedAt: null,
      verifiedAt: null,
      rejectedReason: null,

      submitKyc: async (studentId: string, cardImageUrl: string, type: KycType = 'STUDENT') => {
        const now = new Date().toISOString();
        set({
          status: 'PENDING',
          type,
          studentId,
          cardImageUrl,
          submittedAt: now,
          rejectedReason: null,
        });

        // Cập nhật trạng thái người dùng sang PENDING
        const userStore = useUserStore.getState();
        if (userStore.user) {
          await userStore.updateUserProfile({
            kycStatus: 'PENDING',
            studentId,
          });
        }
      },

      simulateApproveKyc: async () => {
        const now = new Date().toISOString();
        const type = get().type;
        set({
          status: 'APPROVED',
          verifiedAt: now,
        });

        const userStore = useUserStore.getState();
        if (userStore.user) {
          await userStore.updateUserProfile({
            isKycVerified: true,
            kycStatus: 'APPROVED',
            role: type === 'SELLER' ? 'SELLER' : 'BUYER',
            avatarBadge: type === 'SELLER' ? 'TOP_SELLER' : undefined,
          });
        }
      },

      resetKyc: () => {
        set({
          status: 'NONE',
          type: 'STUDENT',
          studentId: '',
          cardImageUrl: null,
          submittedAt: null,
          verifiedAt: null,
          rejectedReason: null,
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
