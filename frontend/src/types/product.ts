export interface Seller {
  name: string;
  cohort: string; // e.g. "K17 SE", "FPT K18"
  initial: string;
  verified: boolean;
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  dealCount?: number;
  responseRate?: string;
}

export interface ProductItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  campusTag?: string;
  badges: string[];
  location: string;
  timeAgo?: string;
  seller: Seller;
  category?: string;
  viewCount?: number;
}

export interface ProductDetail extends ProductItem {
  galleryImages: {
    src: string;
    alt: string;
  }[];
  condition: string;
  description: string;
  bulletPoints: {
    title: string;
    content: string;
  }[];
  meetingNote?: string;
}

export interface CampusOption {
  id: string;
  label: string;
  shortName?: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  description?: string;
  count?: string | number;
  color?: string;
  bgColor?: string;
}

export interface FilterCriteria {
  campus: string;
  categories: string[];
  pricePreset?: string;
  minPrice?: string;
  maxPrice?: string;
  conditions: string[];
  locations: string[];
  sort?: string;
}
