import { CategoryItem } from '../types/home.types';
import { ProductCardProps } from '../../../components/common/ProductCard';
import { theme } from '../../../config/theme';

export const CAMPUSES: string[] = ['TẤT CẢ', 'HÒA LẠC', 'TP.HCM', 'ĐÀ NẴNG', 'CẦN THƠ', 'QUY NHƠN'];

export const CATEGORIES: CategoryItem[] = [
  {
    id: '1',
    name: 'Sách &\nGiáo trình',
    icon: 'book-outline',
    color: theme.colors.neutral.surface,
    iconColor: theme.colors.neutral.icon,
  },
  {
    id: '2',
    name: 'Laptop &\nPhụ kiện',
    icon: 'laptop-outline',
    color: theme.colors.neutral.surface,
    iconColor: theme.colors.neutral.icon,
  },
  {
    id: '3',
    name: 'Đồ dùng\nKTX',
    icon: 'business-outline',
    color: theme.colors.neutral.surface,
    iconColor: theme.colors.neutral.icon,
  },
  {
    id: '4',
    name: 'Võ phục\nVovinam',
    icon: 'body-outline',
    color: theme.colors.neutral.surface,
    iconColor: theme.colors.neutral.icon,
  },
  {
    id: '5',
    name: 'Pass đồ\ngấp',
    icon: 'flash-outline',
    color: theme.colors.neutral.surface,
    iconColor: theme.colors.neutral.icon,
  },
];

export const FEED_FILTERS: string[] = [
  'Tất cả',
  'Gần bạn',
  'Đồ KTX',
  'Giá rẻ',
  'Nổi bật',
];

export const GRID_PRODUCTS: ProductCardProps[] = [
  {
    id: '1',
    title: 'Màn hình Dell 24" UltraSharp',
    price: '1.450.000',
    location: '📍 Dom A Hola',
    seller: 'Hoàng Tú',
    sellerYear: 'K18 AI',
    image: require('../../../../assets/products/monitor-dell-24.jpg'),
    badge: '99% Fullbox',
    badgeVariant: 'white',
    isVerified: true,
  },
  {
    id: '2',
    title: 'Combo CSL201 + MAS291 kèm đề PE',
    price: '120.000',
    location: '📚 Thư viện Gamma',
    seller: 'Phương Linh',
    image: require('../../../../assets/products/books-mas291.jpg'),
    badge: 'Tặng note tóm tắt',
    badgeVariant: 'green',
    isVerified: true,
  },
  {
    id: '3',
    title: 'Bàn phím cơ FL Esport custom',
    price: '750.000',
    location: '📍 Sảnh Tòa Alpha',
    seller: 'Hải Nam',
    sellerYear: 'K17',
    image: require('../../../../assets/products/keyboard-akko.jpg'),
    badge: 'Switch êm',
    badgeVariant: 'white',
    isVerified: true,
  },
  {
    id: '4',
    title: 'Nồi nấu lẩu mini KTX 1.5L',
    price: '220.000',
    location: '🏠 Dom B KTX',
    seller: 'Quốc Bảo',
    image: require('../../../../assets/products/mini-pot-locklock.jpg'),
    badge: 'An toàn Dom',
    badgeVariant: 'white',
    isVerified: true,
  },
];
