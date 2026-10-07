import { Voucher, UserVoucher, VoucherPartner, UserVoucherStatus } from '../../../stores/voucherStore';

export type { Voucher, UserVoucher, VoucherPartner, UserVoucherStatus };

export type VoucherPageView = 'store' | 'my_vouchers';

export type VoucherCategoryKey = 'all' | 'coins' | 'dorm' | 'ship';

export type MyVoucherFilterKey = 'ALL' | 'UNUSED' | 'USED' | 'EXPIRED';

export interface CoinQuestItem {
  id: string;
  title: string;
  coins: number;
  description: string;
  statusText: string;
  isCompleted: boolean;
  actionType: 'claim' | 'claimed' | 'link';
  actionLabel: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
}

// Giữ lại kiểu cũ cho backward compatibility nếu có component nào import
export interface VoucherItem {
  id: string;
  categoryTag: string;
  categoryColor: string;
  hotTag?: boolean;
  priorityTag?: string;
  title: string;
  description: string;
  minOrder?: string;
  code?: string;
  hsd?: string;
  autoApply?: boolean;
  emailNote?: string;
  coinCost?: number;
  usedPercent?: number;
  daysLeft?: number;
  actionType: 'save' | 'saved' | 'ready' | 'exchange';
  accentColor: string;
  lightBg: string;
  borderColor: string;
}

export interface MissionItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  reward: string;
  status: 'done' | 'pending' | 'action';
  actionLabel?: string;
}

export interface VoucherScreenProps {
  onGoBack?: () => void;
  onTabChange?: (tab: string) => void;
}
