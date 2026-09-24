export interface CampusFilterOption {
  id: string;
  label: string;
  icon?: string;
  isActive?: boolean;
}

export interface CategoryTabOption {
  id: string;
  label: string;
  count?: number;
}

export interface PriceRangeOption {
  id: string;
  label: string;
  icon?: string;
}

export interface ExploreProduct {
  id: string;
  title: string;
  price: string;
  badge: string;
  badgeColor: string;
  seller: string;
  sellerBadge?: string;
  rating?: string;
  location: string;
  locationDetail?: string;
  image: any;
  greenTag?: string;
  hotTag?: boolean;
}

export interface ExploreScreenProps {
  onGoBack?: () => void;
  onTabChange?: (tab: 'home' | 'explore' | 'post' | 'chat' | 'profile') => void;
  onProductPress?: (id: string) => void;
}
