import { ProductItem } from '../../../stores/productStore';

export const STATUS_OPTIONS: { id: ProductItem['status']; label: string; color: string; bg: string }[] = [
  { id: 'AVAILABLE', label: 'Đang bán', color: '#059669', bg: '#ECFDF5' },
  { id: 'RESERVED', label: 'Đã có hẹn', color: '#D97706', bg: '#FFFBEB' },
  { id: 'SOLD', label: 'Đã bán', color: '#64748B', bg: '#F1F5F9' },
  { id: 'HIDDEN', label: 'Tạm ẩn tin', color: '#EF4444', bg: '#FEF2F2' },
];
