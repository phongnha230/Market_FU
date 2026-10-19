export interface CategoryOption {
  id: string;
  label: string;
}

export interface ConditionOption {
  id: string;
  label: string;
}

export const LISTING_CATEGORIES: CategoryOption[] = [
  { id: 'books', label: 'Giáo trình & Sách học thuật FPT' },
  { id: 'electronics', label: 'Thiết bị điện tử & Phụ kiện IT' },
  { id: 'fashion', label: 'Thời trang & Võ phục Vovinam' },
  { id: 'dorm', label: 'Đồ dùng phòng KTX & Gia dụng' },
  { id: 'hobbies', label: 'Giải trí & Gaming console' },
  { id: 'services', label: 'Tiện ích khác (Vé bus, Thẻ gym)' },
];

export const LISTING_CONDITIONS: ConditionOption[] = [
  { id: 'NEW_100', label: 'Mới 100% (Nguyên seal)' },
  { id: 'LIKE_NEW_99', label: 'Như mới 99% (Fullbox)' },
  { id: 'USED_GOOD', label: 'Đã dùng tốt (90 - 95%)' },
  { id: 'USED_FAIR', label: 'Cũ theo thời gian (70 - 80%)' },
];
