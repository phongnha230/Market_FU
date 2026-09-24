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

export type VoucherTabKey = 'all' | 'ship' | 'exchange';

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
