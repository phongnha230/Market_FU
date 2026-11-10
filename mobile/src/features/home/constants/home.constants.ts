import { CategoryItem } from '../types/home.types';

export const CATEGORIES: CategoryItem[] = [
  {
    id: '1',
    name: 'Sách &\nGiáo trình',
    icon: 'book-outline',
  },
  {
    id: '2',
    name: 'Laptop &\nPhụ kiện',
    icon: 'laptop-outline',
  },
  {
    id: '3',
    name: 'Đồ dùng\nKTX',
    icon: 'business-outline',
  },
  {
    id: '4',
    name: 'Võ phục\nVovinam',
    icon: 'body-outline',
  },
  {
    id: '5',
    name: 'Pass đồ\ngấp',
    icon: 'flash-outline',
  },
];

export const FEED_FILTERS: string[] = [
  'Tất cả',
  'Gần bạn',
  'Đồ KTX',
  'Giá rẻ',
  'Nổi bật',
];
