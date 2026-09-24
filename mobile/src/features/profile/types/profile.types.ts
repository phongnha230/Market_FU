export interface SettingItem {
  id: string;
  icon: string;
  iconLib: 'ionicons' | 'mci';
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  dotAlert?: boolean;
  chevron?: boolean;
}

export interface ProfileScreenProps {
  onGoBack?: () => void;
  onTabChange?: (tab: string) => void;
  onNavigateToDispute?: () => void;
  onNavigateToVoucher?: () => void;
}
