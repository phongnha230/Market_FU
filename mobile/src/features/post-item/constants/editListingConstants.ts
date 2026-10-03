export interface CategoryOption {
  id: string;
  label: string;
}

export interface ConditionOption {
  id: string;
  label: string;
}

export const LISTING_CATEGORIES: CategoryOption[] = [
  { id: 'electronics', label: 'Đồ điện tử, IT' },
  { id: 'books', label: 'Sách, Giáo trình' },
  { id: 'dorm', label: 'Đồ phòng KTX' },
  { id: 'fashion', label: 'Thời trang, Võ phục' },
  { id: 'vehicle', label: 'Xe cộ, Xe đạp' },
];

export const LISTING_CONDITIONS: ConditionOption[] = [
  { id: 'NEW_100', label: 'Mới 100% (Nguyên seal)' },
  { id: 'LIKE_NEW_99', label: 'Như mới 99% (Fullbox)' },
  { id: 'USED_GOOD', label: 'Đã dùng tốt (90 - 95%)' },
  { id: 'USED_FAIR', label: 'Cũ theo thời gian (70 - 80%)' },
];
