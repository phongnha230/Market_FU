import { CoinQuestItem, VoucherItem, MissionItem } from '../types/voucher.types';
import { INITIAL_AVAILABLE_VOUCHERS, Voucher } from '../../../stores/voucherStore';

export { INITIAL_AVAILABLE_VOUCHERS };

export const INITIAL_QUESTS: CoinQuestItem[] = [
  {
    id: 'quest-checkin',
    title: 'Điểm danh nhận Xu hàng ngày',
    coins: 20,
    description: 'Duy trì chuỗi điểm danh đều đặn mỗi ngày nhận ngay +20 Campus Coins.',
    statusText: 'Chưa điểm danh hôm nay',
    isCompleted: false,
    actionType: 'link',
    actionLabel: 'Điểm danh ngay',
    iconName: 'calendar',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'quest-kyc',
    title: 'Xác thực KYC Thẻ SV & Mail FPT',
    coins: 100,
    description: 'Liên kết bảo mật tài khoản SSO @fpt.edu.vn kích hoạt huy hiệu sinh viên chuẩn Hola Campus.',
    statusText: 'Chưa xác thực thẻ SV',
    isCompleted: false,
    actionType: 'link',
    actionLabel: 'Xác thực ngay',
    iconName: 'shield-checkmark',
    iconBg: '#EFF6FF',
    iconColor: '#1D4ED8',
  },
  {
    id: 'quest-post',
    title: 'Đăng bán 01 món đồ học tập cũ không dùng',
    coins: 30,
    description: 'Pass lại máy tính Casio, giáo trình kỳ trước hoặc phụ kiện KTX cho các em khóa dưới.',
    statusText: 'Tiến độ: 0 / 1 món',
    isCompleted: false,
    actionType: 'link',
    actionLabel: 'Đăng bán ngay',
    iconName: 'add-circle',
    iconBg: '#DCFCE7',
    iconColor: '#15803D',
  },
  {
    id: 'quest-safepoint',
    title: 'Giao dịch an toàn tại Safe-Handoff Point',
    coins: 40,
    description: 'Giao nhận tại Sảnh Tòa Alpha, Beta hoặc Bàn Tiếp nhận Thư viện trường.',
    statusText: 'Tiến độ: 0 / 1 giao dịch',
    isCompleted: false,
    actionType: 'link',
    actionLabel: 'Xem điểm hẹn',
    iconName: 'location',
    iconBg: '#F3E8FF',
    iconColor: '#7E22CE',
  },
];

// Mapped legacy VOUCHERS for backward compatibility
export const VOUCHERS: VoucherItem[] = INITIAL_AVAILABLE_VOUCHERS.map((v) => ({
  id: v.id,
  categoryTag: v.partnerLabel,
  categoryColor: v.partner === 'CANTEEN' ? '#EA580C' : v.partner === 'PASSIO' ? '#059669' : '#1D4ED8',
  title: v.title,
  description: v.description,
  coinCost: v.coinCost,
  hsd: `${v.validDays} ngày`,
  actionType: 'exchange',
  accentColor: v.partner === 'CANTEEN' ? '#EA580C' : v.partner === 'PASSIO' ? '#059669' : '#1D4ED8',
  lightBg: v.partner === 'CANTEEN' ? '#FFF7ED' : v.partner === 'PASSIO' ? '#ECFDF5' : '#EFF6FF',
  borderColor: v.partner === 'CANTEEN' ? '#FDBA74' : v.partner === 'PASSIO' ? '#A7F3D0' : '#BFDBFE',
}));

// Mapped legacy MISSIONS
export const MISSIONS: MissionItem[] = INITIAL_QUESTS.map((q) => ({
  id: q.id,
  icon: q.iconName,
  iconBg: q.iconBg,
  iconColor: q.iconColor,
  title: q.title,
  subtitle: q.description,
  reward: `+${q.coins} Coins`,
  status: q.isCompleted ? 'done' : 'action',
  actionLabel: q.actionLabel,
}));
