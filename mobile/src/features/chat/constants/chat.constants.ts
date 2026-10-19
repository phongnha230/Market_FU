import { ChatMessage, ChatPartner } from '../types/chat.types';

export const DEFAULT_PARTNER: ChatPartner = {
  id: '',
  name: 'Người dùng FPT',
  major: 'Sinh viên FPT',
  avatarUrl: 'https://ui-avatars.com/api/?name=FPT&background=F97316&color=fff&bold=true',
  isOnline: false,
};

export const INITIAL_MESSAGES: ChatMessage[] = [];

export const QUICK_REPLIES = [
  'Đã đến điểm hẹn rồi nhé!',
  'Bạn đang ở vị trí nào?',
  'Đợi mình 5 phút nhé',
  'Cho mình xem thêm ảnh đồ với',
];
