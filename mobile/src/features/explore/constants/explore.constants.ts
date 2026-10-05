import {
  CampusFilterOption,
  CategoryTabOption,
  PriceRangeOption,
  ExploreProduct,
} from '../types/explore.types';

export const CAMPUS_FILTERS: CampusFilterOption[] = [
  { id: 'all', label: 'Tất cả CS', isActive: true },
  { id: 'hol', label: 'Hòa Lạc' },
  { id: 'hcm', label: 'TP.HCM' },
  { id: 'dad', label: 'Đà Nẵng' },
  { id: 'ct', label: 'Cần Thơ' },
  { id: 'qn', label: 'Quy Nhơn' },
];

export const CATEGORY_TABS: CategoryTabOption[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'it', label: 'Đồ IT & Công nghệ' },
  { id: 'books', label: 'Giáo trình & Sách' },
  { id: 'dom', label: 'Đồ KTX' },
  { id: 'vovinam', label: 'Võ phục Vovinam' },
  { id: 'other', label: 'Khác' },
];

export const PRICE_RANGES: PriceRangeOption[] = [
  { id: 'under100', label: '< 100k' },
  { id: '100to500', label: '100k - 500k' },
  { id: '500to2m', label: '500k - 2tr' },
  { id: 'free', label: '0đ Tặng', icon: 'gift-outline' },
];

export const EXPLORE_PRODUCTS: ExploreProduct[] = [];
