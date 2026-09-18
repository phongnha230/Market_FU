import {
  BookOpen,
  Laptop,
  Shirt,
  BedDouble,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import { CampusOption, CategoryOption } from '@/types/product';

export const CAMPUSES: CampusOption[] = [
  { id: 'all', label: 'Tất cả cơ sở', shortName: 'Toàn quốc' },
  { id: 'hola', label: 'Hòa Lạc', shortName: 'Hola (HN)' },
  { id: 'dn', label: 'Đà Nẵng', shortName: 'FPT ĐN' },
  { id: 'hcm', label: 'TP. Hồ Chí Minh', shortName: 'FPT HCM' },
  { id: 'ct', label: 'Cần Thơ', shortName: 'FPT CT' },
  { id: 'qn', label: 'Quy Nhơn', shortName: 'FPT QN' },
];

export const CATEGORIES = [
  {
    id: 'books',
    name: 'Sách & Tài liệu',
    label: 'Sách & Giáo trình',
    description: 'Giáo trình, slide tóm tắt',
    count: '438 tin',
    liveCount: 142,
    icon: BookOpen,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'group-hover:border-orange-200',
  },
  {
    id: 'electronics',
    name: 'Thiết bị điện tử',
    label: 'Thiết bị điện tử',
    description: 'Laptop, phím cơ, màn hình',
    count: '612 tin',
    liveCount: 210,
    icon: Laptop,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'group-hover:border-blue-200',
  },
  {
    id: 'fashion',
    name: 'Thời trang & Phụ kiện',
    label: 'Thời trang & Vovinam',
    description: 'Vovinam, polo FPT, hoodie',
    count: '325 tin',
    liveCount: 89,
    icon: Shirt,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'group-hover:border-rose-200',
  },
  {
    id: 'dorm',
    name: 'Đồ dùng & KTX',
    label: 'Đồ dùng & KTX',
    description: 'Bàn gấp, quạt, tủ vải mini',
    count: '280 tin',
    liveCount: 115,
    icon: BedDouble,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'group-hover:border-emerald-200',
  },
  {
    id: 'hobbies',
    name: 'Giải trí & Đam mê',
    label: 'Giải trí & Game',
    description: 'Switch, boardgame, đàn',
    count: '142 tin',
    liveCount: 64,
    icon: Gamepad2,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'group-hover:border-indigo-200',
  },
  {
    id: 'services',
    name: 'Tiện ích khác',
    label: 'Tiện ích khác',
    description: 'Vé bus Hola, thẻ gym KTX',
    count: '95 tin',
    liveCount: 32,
    icon: Sparkles,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'group-hover:border-amber-200',
  },
];

export const HOT_TAGS = [
  '#GiaoTrinhPRF192',
  '#MacBookAir',
  '#PassDoKTX',
  '#XeMayHola',
  '#TuLanhMini',
  '#TaiNgheChongOn',
  '#AoVovinam',
];

export const PRICE_PRESETS = [
  { id: 'under-100k', label: '< 100k', min: 0, max: 100000 },
  { id: '100k-500k', label: '100k - 500k', min: 100000, max: 500000 },
  { id: '500k-2m', label: '500k - 2Tr', min: 500000, max: 2000000 },
  { id: 'over-2m', label: '> 2 Triệu', min: 2000000, max: 99999999 },
];

export const PRODUCT_CONDITIONS = [
  { id: 'fullbox', label: 'Mới 100% (Full box)' },
  { id: 'likenew', label: 'Mới 99% (Like New)' },
  { id: 'good', label: 'Đã qua sử dụng (Tốt)' },
  { id: 'urgent', label: 'Cần pass gấp (Giảm sâu)', highlight: true },
];

export const PICKUP_LOCATIONS = [
  { id: 'canteen', label: 'Căng-tin / Food Court Hola' },
  { id: 'dom', label: 'Sảnh tòa Dom KTX (A, B, C, D)' },
  { id: 'freeship', label: 'Free Ship nội bộ Campus' },
];
