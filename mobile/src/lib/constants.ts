/**
 * Design Tokens theo GEMINI.md cho FPT Second-hand Market Mobile
 */
export const APP_COLORS = {
  // Brand Primary: Cam FPT
  primary: '#EA580C',
  primaryHover: '#C2410C',
  primaryLight: '#FFF7ED',
  primaryBorder: '#FDBA74',

  // Status & Feedback
  success: '#059669', // Emerald
  successLight: '#ECFDF5',
  warning: '#D97706', // Amber
  warningLight: '#FEF3C7',
  danger: '#DC2626',  // Red
  dangerLight: '#FEF2F2',
  info: '#0284C7',    // Sky
  infoLight: '#F0F9FF',

  // Neutrals / Slate
  background: '#FFFFFF',
  surface: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderDark: '#CBD5E1',

  // Typography
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  textInverse: '#FFFFFF',
} as const;

export const CAMPUS_LIST = ['HÒA LẠC', 'TP.HCM', 'ĐÀ NẴNG', 'CẦN THƠ'] as const;

export const SAFE_POINT_HUBS = [
  {
    id: 'alpha',
    name: 'Sảnh Tòa Alpha',
    description: 'Bàn test nguồn 220V, Camera 24/7, Bảo vệ trực',
    campus: 'HÒA LẠC',
  },
  {
    id: 'beta',
    name: 'Thư viện Beta',
    description: 'Bàn giao giáo trình & thiết bị học tập',
    campus: 'HÒA LẠC',
  },
  {
    id: 'dom_b',
    name: 'Sân KTX Dom B',
    description: 'Hẹn giao dịch nội khu sinh viên KTX',
    campus: 'HÒA LẠC',
  },
] as const;

export const MIN_TOUCH_TARGET = 44;
