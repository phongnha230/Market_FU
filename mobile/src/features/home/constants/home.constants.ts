import { CategoryItem } from '../types/home.types';
import { ProductCardProps } from '../../../components/common/ProductCard';

export const CAMPUSES: string[] = ['TẤT CẢ', 'HÒA LẠC', 'TP.HCM', 'ĐÀ NẴNG', 'CẦN THƠ', 'QUY NHƠN'];

export const CATEGORIES: CategoryItem[] = [
  {
    id: '1',
    name: 'Sách &\nGiáo trình',
    icon: 'book-outline',
    color: '#EFF6FF',
    iconColor: '#BE185D',
    badge: 'PE/FE',
    badgeColor: '#10B981',
  },
  {
    id: '2',
    name: 'Laptop &\nPhụ kiện',
    icon: 'laptop-outline',
    color: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: '3',
    name: 'Đồ dùng\nKTX',
    icon: 'business-outline',
    color: '#EFF6FF',
    iconColor: '#7C3AED',
  },
  {
    id: '4',
    name: 'Võ phục\nVovinam',
    icon: 'body-outline',
    color: '#EFF6FF',
    iconColor: '#0284C7',
  },
  {
    id: '5',
    name: 'Pass đồ\ngấp',
    icon: 'flash',
    color: '#FFF7ED',
    iconColor: '#EA580C',
    badge: 'GẤP',
    badgeColor: '#EF4444',
  },
];

export const FEED_FILTERS: string[] = [
  'TẤT CẢ',
  '🧭 GẦN BẠN (<500M)',
  '🏠 ĐỒ KTX',
  '💰 PASS RẺ',
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
