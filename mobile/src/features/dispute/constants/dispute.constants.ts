import { DisputeReason, EvidenceItem } from '../types/dispute.types';

export const DISPUTE_REASONS: DisputeReason[] = [
  { id: 'wrong_item', label: 'Lỗi kỹ thuật / Không lên nguồn', icon: '⚡' },
  { id: 'wrong_spec', label: 'Sai thông số kỹ thuật đã đăng (IPS/FHD)', icon: '📊' },
  { id: 'wrong_box', label: 'Nứt vỡ do bên vận chuyển CampusShip', icon: '📦' },
];

export const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'img1',
    label: 'Ảnh 1',
    source: require('../../../../assets/products/monitor-dell-24.jpg'),
  },
  {
    id: 'img2',
    label: 'Ảnh 2',
    source: require('../../../../assets/products/keyboard-akko.jpg'),
  },
  {
    id: 'vid1',
    label: 'Video test',
    source: require('../../../../assets/products/headphones-sony.jpg'),
    isVideo: true,
    duration: '0:44',
  },
];
