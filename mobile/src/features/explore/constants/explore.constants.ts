import {
  CampusFilterOption,
  CategoryTabOption,
  PriceRangeOption,
  ExploreProduct,
} from '../types/explore.types';

export const CAMPUS_FILTERS: CampusFilterOption[] = [
  { id: 'hol', label: 'Hòa Lạc', isActive: true },
  { id: 'near', label: '< 500m', icon: 'navigate-outline' },
  { id: 'ktx', label: 'KTX Dom A - F' },
];

export const CATEGORY_TABS: CategoryTabOption[] = [
  { id: 'all', label: 'Tất cả', count: 248 },
  { id: 'cntt', label: 'Giáo trình CNTT', count: 84 },
  { id: 'dien', label: 'Đồ điện KT...' },
];

export const PRICE_RANGES: PriceRangeOption[] = [
  { id: 'under100', label: '< 100k' },
  { id: '100to500', label: '100k - 500k' },
  { id: '500to2m', label: '500k - 2tr' },
  { id: 'free', label: '0đ Tặng', icon: 'gift-outline' },
];

export const EXPLORE_PRODUCTS: ExploreProduct[] = [
  {
    id: '1',
    title: 'Combo Tài liệu PE Java Spring Boot + CSL201 đề...',
    price: '95.000',
    badge: 'Tài liệu PE',
    badgeColor: '#2563EB',
    seller: 'Minh Trí (K16 SE)',
    sellerBadge: 'SV FPT',
    rating: '4.9',
    location: '📍 Cách 150m • Thư viện Gamma',
    image: require('../../../../assets/products/books-mas291.jpg'),
  },
  {
    id: '2',
    title: 'Tai nghe chụp tai Sony WH-CH520 chống ồn nh...',
    price: '680.000',
    badge: 'Like new 99%',
    badgeColor: '#059669',
    seller: 'Hải Nam (K17...)',
    location: '🔧 Hẹn test trực tiếp tại Sảnh Alpha',
    image: require('../../../../assets/products/headphones-sony.jpg'),
    greenTag: 'Giao dịch an toàn',
  },
  {
    id: '3',
    title: 'Bếp từ mini phòng KTX kèm nồi lẩu chống dính...',
    price: '210.000',
    badge: 'Pass đồ KTX',
    badgeColor: '#7C3AED',
    seller: 'Thu Trang (K18 IB)',
    sellerBadge: 'Đã bán 6 món',
    location: '🏠 Dom E Hola • Có thể đổi lấy giá...',
    image: require('../../../../assets/products/mini-pot-locklock.jpg'),
  },
  {
    id: '4',
    title: 'Quạt tích điện mini gấp gọn để bàn học, 3 cấp độ gió',
    price: '85.000',
    badge: 'Pin 8 tiếng',
    badgeColor: '#EA580C',
    seller: 'Quốc Bảo (K17 AI)',
    location: '🏠 Dom C tầng 3 • Ghế lấy liên tiế...',
    image: require('../../../../assets/products/mini-fridge-aqua.jpg'),
  },
];
