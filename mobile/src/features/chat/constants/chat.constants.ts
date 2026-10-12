import { ChatMessage, ChatPartner } from '../types/chat.types';

export const DEFAULT_PARTNER: ChatPartner = {
  id: '',
  name: 'Người dùng FPT',
  major: 'Sinh viên FPT',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  isOnline: false,
};

export const INITIAL_MESSAGES: ChatMessage[] = [];

export const QUICK_REPLIES = [
  'Đã đến điểm hẹn rồi nhé!',
  'Bạn đang ở vị trí nào?',
  'Đợi mình 5 phút nhé',
  'Cho mình xem thêm ảnh đồ với',
];
