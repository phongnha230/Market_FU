import { PostCategory, PostCondition } from '../types/post-item.types';

export const TITLE_SUGGESTIONS = ['Fullbox', 'Đề PE', 'Mới 99%', 'Cáp sạc'];

export const CATEGORY_OPTIONS: { id: PostCategory; label: string; icon: string }[] = [
  { id: 'it', label: 'IT & Linh kiện', icon: 'laptop-outline' },
  { id: 'book', label: 'Sách & Giáo trình', icon: 'book-outline' },
  { id: 'dom', label: 'Đồ dùng KTX', icon: 'business-outline' },
  { id: 'vovinam', label: 'Võ phục Vovinam', icon: 'body-outline' },
];

export const CONDITION_OPTIONS: { id: PostCondition; label: string; sub: string }[] = [
  { id: 'new', label: 'Like new 99%', sub: 'Gần như chưa dùng' },
  { id: 'good', label: 'Dùng tốt', sub: 'Có xước nhẹ' },
  { id: 'free', label: '0đ Pass tặng', sub: 'Tặng tân sinh viên' },
];

export const SAFE_POINT_DEFAULT = 'Trạm Sảnh Alpha (Bàn test đồ SV 04 - Có ổ cắm sạc)';
