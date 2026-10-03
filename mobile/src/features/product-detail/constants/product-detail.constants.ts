import { ProductDetailData, RelatedProductItem } from '../types/product-detail.types';

export const DEFAULT_PRODUCT_DETAIL: ProductDetailData = {
  id: 'p1',
  title: 'Bàn phím cơ Akko 3087 v2 Silent Switch (Orange v2 Tactile)',
  price: '650.000',
  originalPrice: '1.200.000',
  discountBadge: '-45%',
  conditionBadge: 'Like new 98%',
  location: 'Sảnh Alpha • KTX Hòa Lạc',
  images: [
    require('../../../../assets/products/keyboard-akko.jpg'),
    require('../../../../assets/products/keyboard-detail.jpg'),
    require('../../../../assets/products/monitor-dell-24.jpg'),
    require('../../../../assets/products/headphones-sony.jpg'),
  ],
  specs: [
    { label: 'LOẠI SWITCH', value: 'Akko Orange v2\n(Tactile)' },
    { label: 'CHẤT LIỆU KEYCAP', value: 'PBT Doubleshot\n(OEM)' },
    { label: 'TÌNH TRẠNG MÓD', value: 'Lube Kr4tox 205g0\n+ Lót foam' },
    { label: 'PHỤ KIỆN KÈM THEO', value: 'Fullbox, cáp\ntype-C, puller' },
  ],
  description:
    'Phím mua về dùng gõ code môn PRF & CSL trong kỳ 3, nay lên đời Custom nhôm nên pass lại cho anh em đồng môn. Switch đã lube cực êm không làm phiền bạn cùng phòng KTX ban đêm. Đầy đủ hộp và phụ kiện.',
  seller: {
    id: 's1',
    name: 'Vũ Hải',
    major: 'K17 Kỹ thuật phần mềm (SE)',
    rating: '4.9 ★',
    soldCount: 12,
    isVerified: true,
  },
  safePointInfo: {
    name: 'Safe-Handoff Sảnh Tòa Alpha',
    desc: 'Hỗ trợ bàn test cắm máy tính & đo nguồn điện trực tiếp có bảo vệ quan sát.',
  },
  hashtags: ['akko', 'banphimco', 'silent', 'gaming', 'fpt'],
};

export const RELATED_PRODUCTS: RelatedProductItem[] = [
  {
    id: 'r1',
    title: 'Chuột Logitech G304',
    price: '320.000đ',
    image: require('../../../../assets/products/mouse-g102.jpg'),
    location: 'Hola KTX',
  },
  {
    id: 'r2',
    title: 'Pad chuột đa 80x40',
    price: '70.000đ',
    image: require('../../../../assets/products/books-mas291.jpg'),
    location: 'Toa Gamma',
  },
  {
    id: 'r3',
    title: 'Màn Nit Ari 24"...',
    price: '850.000đ',
    image: require('../../../../assets/products/monitor-dell-24.jpg'),
    location: 'Toa Alpha',
  },
];
