import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  setActiveTypeTab: (type: KycType) => void;
  submitApplication: (data: Omit<KycApplication, 'id' | 'status' | 'submittedAt' | 'aiMatchScore'>) => KycApplication;
  approveApplication: (id: string, reviewer?: string) => void;
  rejectApplication: (id: string, reason?: string) => void;
  requestReupload: (id: string, reason?: string) => void;
}

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
    major: 'Trí tuệ Nhân tạo (AI)',
    cohort: 'K18',
    phone: '0983 234 567',
    frontCardUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    backCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    selfieCardUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    status: 'pending',
    submittedAt: '15 phút trước',
    aiMatchScore: 98,
    storeName: 'Tú Gear & Phụ Kiện Đồ Án FPT',
    primaryCategory: 'Đồ Công Nghệ & Bàn Phím',
    bankAccount: 'TPBank • 03829102910',
  },
  {
    id: 'kyc-sel-2',
    type: 'seller',
    fullName: 'Phan Linh Trang',
    studentId: 'SB170073',
    email: 'trangplsb170073@fpt.edu.vn',
    campus: 'Quy Nhơn',
    major: 'Quản trị Kinh doanh (BA)',
    cohort: 'K17',
    phone: '0935 678 123',
    frontCardUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    backCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    status: 'pending',
    submittedAt: '45 phút trước',
    aiMatchScore: 92,
    storeName: 'Trang Pass Giáo Trình K17-K19',
    primaryCategory: 'Sách & Giáo Trình',
    bankAccount: 'Vietcombank • 1029384756',
  },
  {
    id: 'kyc-sel-3',
    type: 'seller',
    fullName: 'Vũ Sắc Bồng',
    studentId: 'CS186144',
    email: 'bongvscs186144@fpt.edu.vn',
    campus: 'Cần Thơ',
    major: 'Khoa học Máy tính (CS)',
    cohort: 'K18',
    phone: '0971 222 333',
    frontCardUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    backCardUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    status: 'approved',
    submittedAt: '1 ngày trước',
    reviewedAt: 'Hôm qua',
    reviewedBy: 'SuperAdmin BQT',
    aiMatchScore: 99,
    storeName: 'Bồng Computer & Màn Hình Di Động',
    primaryCategory: 'Đồ Công Nghệ & Màn Hình',
  },
];

export const useKycStore = create<KycStoreState>()(
  persist(
    (set, get) => ({
      applications: INITIAL_APPLICATIONS,
      activeTypeTab: 'student',

      setActiveTypeTab: (type) => set({ activeTypeTab: type }),

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

      approveApplication: (id, reviewer = 'SuperAdmin BQT') => {
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
      },

      rejectApplication: (id, reason = 'Thông tin thẻ sinh viên không trùng khớp với hệ thống FAP') => {
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
