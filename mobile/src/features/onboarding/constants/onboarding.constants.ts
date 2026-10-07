export interface CampusItem {
  id: string;
  name: string;
  subName: string;
  campusCode: string;
}

export interface StationItem {
  id: string;
  label: string;
  title: string;
  badge: string;
  icon: string;
}

export interface EscrowStepItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  isActive?: boolean;
}

export const ONBOARDING_CAMPUSES: CampusItem[] = [
  { id: 'hn', name: 'Hà Nội', subName: 'Hola Campus', campusCode: 'HÒA LẠC' },
  { id: 'hcm', name: 'TP.HCM', subName: 'Khu CNC Q.9', campusCode: 'TP.HCM' },
  { id: 'dn', name: 'Đà Nẵng', subName: 'FPT City', campusCode: 'ĐÀ NẴNG' },
  { id: 'qn', name: 'Quy Nhơn', subName: 'An Phú Thịnh', campusCode: 'QUY NHƠN' },
  { id: 'ct', name: 'Cần Thơ', subName: 'Nguyễn Văn Cừ', campusCode: 'CẦN THƠ' },
];

export const ONBOARDING_STATIONS: StationItem[] = [
  {
    id: 'alpha',
    label: 'Sảnh Alpha',
    title: 'Sảnh Alpha (Tòa Innovation)',
    badge: 'Có ổ cắm test máy',
    icon: 'business-outline',
  },
  {
    id: 'beta',
    label: 'Thư viện',
    title: 'Thư viện Beta (Tầng 1)',
    badge: 'Locker tự động OTP',
    icon: 'library-outline',
  },
  {
    id: 'dom_b',
    label: 'KTX Dom B',
    title: 'KTX Dom B (Cổng Nam)',
    badge: 'Đèn sáng 24/7',
    icon: 'bed-outline',
  },
];

export const ONBOARDING_SAFETY_STEPS = [
  {
    step: 1,
    title: '1. Chọn đồ pass quanh KTX',
    badge: 'Không phí ship',
    badgeBg: '#F1F5F9',
    badgeColor: '#475569',
    numberBg: '#FFEDD5',
    numberColor: '#EA580C',
  },
  {
    step: 2,
    title: '2. Hẹn trạm có camera an ninh',
    badge: 'Test tại chỗ',
    badgeBg: '#ECFDF5',
    badgeColor: '#059669',
    numberBg: '#D1FAE5',
    numberColor: '#059669',
  },
  {
    step: 3,
    title: '3. Ship liên 5 trường FPT',
    badge: 'CampusShip',
    badgeBg: '#EFF6FF',
    badgeColor: '#2563EB',
    numberBg: '#DBEAFE',
    numberColor: '#2563EB',
  },
];

export const ONBOARDING_ESCROW_STEPS: EscrowStepItem[] = [
  {
    id: 'deposit',
    label: 'Đặt cọc',
    icon: 'bag-handle-outline',
    color: '#2563EB',
  },
  {
    id: 'hold',
    label: 'Giữ tiền',
    icon: 'lock-closed',
    color: '#F37021',
    isActive: true,
  },
  {
    id: 'test',
    label: 'Test 24h',
    icon: 'time-outline',
    color: '#7C3AED',
  },
  {
    id: 'release',
    label: 'Nhận tiền',
    icon: 'cash-outline',
    color: '#059669',
  },
];

export const ONBOARDING_GUARANTEES = [
  {
    id: 'refund',
    title: 'Hoàn tiền 100%',
    sub: 'Lỗi hoàn ngay',
    icon: 'refresh-outline',
    iconColor: '#DC2626',
    iconBg: '#FEE2E2',
  },
  {
    id: 'support',
    title: 'Hỗ trợ 24/7',
    sub: 'IT & CTSV',
    icon: 'headset-outline',
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
  },
  {
    id: 'coins',
    title: 'Đổi Campus Coins',
    sub: 'Tích điểm quà',
    icon: 'sparkles-outline',
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
  },
];
