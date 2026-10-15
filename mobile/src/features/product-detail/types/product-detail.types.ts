export interface SpecItem {
  label: string;
  value: string;
}

export interface RelatedProductItem {
  id: string;
  title: string;
  price: string;
  image: any;
  location: string;
}

export interface ProductDetailData {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  discountBadge?: string;
  conditionBadge: string;
  location: string;
  images: any[];
  specs: SpecItem[];
  description: string;
  seller: {
    id: string;
    name: string;
    major: string;
    rating?: number | null;
    reviewCount?: number;
    soldCount: number;
    activeListingsCount?: number;
    avatarUrl?: string;
    isVerified: boolean;
  };
  campus?: string;
  category?: string;
  categoryType?: string;
  sellerId?: string;
  sellerCohort?: string;
  status?: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN';
  isSoldOrReserved?: boolean;
  safePointInfo: {
    name: string;
    desc: string;
  };
  hashtags?: string[];
}

export interface ProductDetailScreenProps {
  onGoBack?: () => void;
  onTabChange?: (tab: string) => void;
  productId?: string;
}
