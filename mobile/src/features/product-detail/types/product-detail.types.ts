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
    rating: string;
    soldCount: number;
    avatarUrl?: string;
    isVerified: boolean;
  };
  safePointInfo: {
    name: string;
    desc: string;
  };
}

export interface ProductDetailScreenProps {
  onGoBack?: () => void;
  onTabChange?: (tab: string) => void;
  productId?: string;
}
