export interface NotificationItem {
  id: string;
  category: 'all' | 'order' | 'chat' | 'promo' | 'system';
  title: string;
  body: string;
  time: string;
  unread: boolean;
  icon: any;
  iconColor: string;
  iconBg: string;
  targetScreen?: string;
  targetParams?: any;
}

export type NotificationFilterType = 'all' | 'order' | 'chat' | 'promo';
