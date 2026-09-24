import { ChatMessage, ChatPartner } from '../types/chat.types';

export const DEFAULT_PARTNER: ChatPartner = {
  id: 'nam1',
  name: 'Đinh Thành Nam',
  major: 'K17 Kỹ thuật phần mềm (SE)',
  isOnline: true,
};

export const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 'd1', type: 'date_separator', text: 'Hôm nay, 14:15' },
  {
    id: 'm1',
    type: 'text',
    text: 'Chào Nam, bàn phím này còn không bạn? Có cầm test thử switch tại chỗ được không?',
    time: '14:15',
    isRead: true,
  },
  {
    id: 'm2',
    type: 'text_received',
    text: 'Chào Quân! Còn nha bạn, phím mình mang theo balo đây rồi. Chiều nay mình học xong ca 4 ở Tòa Alpha.',
    time: '14:17',
  },
  { id: 'sg1', type: 'safe_suggestion' },
  {
    id: 'm3',
    type: 'text_received',
    text: 'Hẹn bạn 16h30 tại bàn số 04 sảnh Alpha nhé, mình đợi ở đó.',
    time: '14:18',
  },
  {
    id: 'm4',
    type: 'text',
    text: 'Ok chốt nhé Nam, mình qua ngay sau giờ học.',
    time: '14:20',
    isRead: true,
  },
  { id: 'ac1', type: 'appointment_confirmed' },
];

export const QUICK_REPLIES = [
  'Đã đến sảnh Alpha rồi!',
  'Bàn số 04 nha',
  'Đợi mình 5 phút',
  'Cho xem thêm ảnh switch',
];
