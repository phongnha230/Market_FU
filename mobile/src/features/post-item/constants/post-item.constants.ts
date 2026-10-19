import { PostCategory, PostCondition } from '../types/post-item.types';

export const TITLE_SUGGESTIONS = ['Fullbox', 'Đề PE', 'Mới 99%', 'Cáp sạc'];

export const CATEGORY_OPTIONS: { id: PostCategory; label: string; icon: string }[] = [
  { id: 'books', label: 'Giáo trình & Sách học thuật FPT', icon: 'book-outline' },
  { id: 'electronics', label: 'Thiết bị điện tử & Phụ kiện IT', icon: 'laptop-outline' },
  { id: 'fashion', label: 'Thời trang & Võ phục Vovinam', icon: 'shirt-outline' },
  { id: 'dorm', label: 'Đồ dùng phòng KTX & Gia dụng', icon: 'home-outline' },
  { id: 'hobbies', label: 'Giải trí & Gaming console', icon: 'game-controller-outline' },
  { id: 'services', label: 'Tiện ích khác (Vé bus, Thẻ gym)', icon: 'ticket-outline' },
];

export const CONDITION_OPTIONS: { id: PostCondition; label: string; sub: string }[] = [
  { id: 'seal', label: 'Mới 100% Nguyên seal', sub: 'Chưa bóc hộp' },
  { id: 'likenew', label: 'Mới 99% Like new', sub: 'Gần như chưa dùng' },
  { id: 'good', label: 'Còn rất tốt (85-95%)', sub: 'Hoạt động hoàn hảo' },
  { id: 'used', label: 'Pass thanh lý / Cũ', sub: 'Có trầy xước nhẹ' },
];

export const SAFE_POINT_DEFAULT = 'Trạm Sảnh Alpha (Bàn test đồ SV 04 - Có ổ cắm sạc)';
