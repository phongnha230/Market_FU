import { DisputeReason, EvidenceItem } from '../types/dispute.types';

export const DISPUTE_REASONS: DisputeReason[] = [
  { id: 'defect', label: 'Thiết bị lỗi chức năng / Không hoạt động khi cắm thử', icon: '⚡' },
  { id: 'wrong_item', label: 'Giao sai sản phẩm / Khác xa hình ảnh và mô tả bài đăng', icon: '🔄' },
  { id: 'damaged', label: 'Hàng bị bể vỡ / Trầy xước nặng trong quá trình vận chuyển', icon: '📦' },
  { id: 'missing', label: 'Thiếu phụ kiện / Quà tặng kèm theo như thỏa thuận', icon: '🧩' },
  { id: 'fake', label: 'Nghi vấn hàng nhái / Không đúng thông số linh kiện cam kết', icon: '⚠️' },
];

export const EVIDENCE_ITEMS: EvidenceItem[] = [];
