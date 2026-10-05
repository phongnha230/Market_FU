import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CAMPUS_OPTIONS = ['TẤT CẢ', 'HÒA LẠC', 'TP.HCM', 'ĐÀ NẴNG', 'CẦN THƠ', 'QUY NHƠN'] as const;
export type CampusType = typeof CAMPUS_OPTIONS[number];

interface CampusState {
  currentCampus: CampusType;
  campuses: readonly string[];
  setCampus: (campus: CampusType) => void;
  setCampusByIndex: (index: number) => void;
}

export const useCampusStore = create<CampusState>()(
  persist(
    (set) => ({
      currentCampus: 'TẤT CẢ',
      campuses: CAMPUS_OPTIONS,
      setCampus: (campus) => set({ currentCampus: campus }),
      setCampusByIndex: (index) => {
        const campus = CAMPUS_OPTIONS[index];
        if (campus) set({ currentCampus: campus });
      },
    }),
    {
      name: 'fu-campus-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCampusStore;
