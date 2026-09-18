export interface ChatMessage {
  id: string;
  sender: 'other' | 'me';
  text: string;
  time: string;
  image?: string;
  isOfferAccepted?: boolean;
  offerPrice?: string;
}

export interface Conversation {
  id: string;
  name: string;
  role: 'seller' | 'buyer';
  roleLabel: string;
  cohortCampus: string;
  avatar: string;
  isOnline: boolean;
  verified: boolean;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  productImage?: string;
  pinnedProduct: {
    title: string;
    price: number;
    originalPrice?: number;
    conditionBadge: string;
    locationNote: string;
    imageUrl: string;
    suggestedOffer: string;
  };
  messages: ChatMessage[];
}

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Hoàng Minh Tú',
    role: 'seller',
    roleLabel: 'Người bán',
    cohortCampus: 'K18 AI • Hòa Lạc',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    isOnline: true,
    verified: true,
    lastMessage: 'Tú: Hẹn 17h30 chiều nay ở sảnh tòa Alpha...',
    time: '15:24',
    productImage: '/products/keyboard-detail.jpg',
    pinnedProduct: {
      title: 'Bàn phím cơ Akko 3087 v2 Silent Switch - g...',
      price: 650000,
      originalPrice: 950000,
      conditionBadge: 'Đang mở bán',
      locationNote: 'Dom A hoặc Sảnh Alpha Hòa Lạc',
      imageUrl: '/products/keyboard-detail.jpg',
      suggestedOffer: '600.000 đ',
    },
    messages: [
      {
        id: 'm-1',
        sender: 'other',
        text: 'Chào Quân! Bàn phím Akko 3087 v2 vẫn còn nhé. Hàng fullbox nguyên phụ kiện kèm keypuller và cáp zin Type-C.',
        time: '15:10',
      },
      {
        id: 'm-2',
        sender: 'me',
        text: 'Chào Tú, mình ở Dom E, phím này switch bấm êm không bạn? Đêm gõ trong phòng KTX có bị phiền bạn cùng phòng không?',
        time: '15:12',
      },
      {
        id: 'm-3',
        sender: 'other',
        text: 'Bản Silent switch này siêu êm luôn, mình chuyên gõ đêm làm đồ án. Ảnh thật góc phím và chân đế đây bạn nha:',
        image: '/products/keyboard-detail.jpg',
        time: '15:15',
      },
      {
        id: 'm-4',
        sender: 'other',
        text: 'Đề nghị giá được chấp thuận!',
        isOfferAccepted: true,
        offerPrice: '620.000 đ',
        time: '15:18',
      },
      {
        id: 'm-5',
        sender: 'me',
        text: 'Ok chốt 620k nhé. Chiều nay tầm mấy giờ bạn tiện qua sảnh Alpha test thử phím?',
        time: '15:20',
      },
      {
        id: 'm-6',
        sender: 'other',
        text: 'OK bạn nhé, hẹn 17h30 chiều nay ở sảnh tòa Alpha mình mang phím qua cho test luôn nhé! Mình mặc áo hoodie xám FPT.',
        time: '15:24',
      },
    ],
  },
  {
    id: 'conv-2',
    name: 'Trần Thu Thảo',
    role: 'buyer',
    roleLabel: 'Người mua',
    cohortCampus: 'K18 IA • Hòa Lạc',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    isOnline: true,
    verified: true,
    lastMessage: 'Bạn ơi sách còn bài tập mẫu thi PE không?',
    time: '14:10',
    unreadCount: 1,
    productImage: '/products/books-mas291.jpg',
    pinnedProduct: {
      title: 'Combo Sách PE CSL201 + MAS291 kèm đề giải mẫu',
      price: 150000,
      originalPrice: 280000,
      conditionBadge: 'Còn sách',
      locationNote: 'Thư viện Beta Hòa Lạc',
      imageUrl: '/products/books-mas291.jpg',
      suggestedOffer: '130.000 đ',
    },
    messages: [
      {
        id: 'm-201',
        sender: 'other',
        text: 'Chào bạn, mình thấy bạn đang pass combo sách MAS291 và CSL201 đúng không ạ?',
        time: '14:05',
      },
      {
        id: 'm-202',
        sender: 'other',
        text: 'Bạn ơi sách còn bài tập mẫu thi PE không? Chiều nay bạn có ở Thư viện Beta không mình qua lấy luôn!',
        time: '14:10',
      },
    ],
  },
  {
    id: 'conv-3',
    name: 'Đặng Quốc Bảo',
    role: 'seller',
    roleLabel: 'Người bán',
    cohortCampus: 'K16 GD • TP.HCM',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    isOnline: false,
    verified: true,
    lastMessage: 'Dây cáp HDMI và nguồn zin theo màn nhé b...',
    time: 'Hôm qua',
    productImage: '/products/monitor-dell-24.jpg',
    pinnedProduct: {
      title: 'Màn hình di động 15.6 inch Type-C Fullbox Q.9',
      price: 1225000,
      originalPrice: 1650000,
      conditionBadge: 'Ship Campus',
      locationNote: 'FPT TP.HCM Q.9 ➔ KTX Dom B',
      imageUrl: '/products/monitor-dell-24.jpg',
      suggestedOffer: '1.150.000 đ',
    },
    messages: [
      {
        id: 'm-301',
        sender: 'me',
        text: 'Màn hình phụ gửi từ TP.HCM về Hòa Lạc đóng hộp bọc xốp chống sốc kỹ giúp mình nhé.',
        time: '11:20',
      },
      {
        id: 'm-302',
        sender: 'other',
        text: 'Dây cáp HDMI và nguồn zin theo màn nhé bạn, mình đã quấn 4 lớp bọt khí kèm thùng carton tiêu chuẩn CampusShip rồi nhé!',
        time: '11:45',
      },
    ],
  },
  {
    id: 'conv-4',
    name: 'Nguyễn Anh',
    role: 'buyer',
    roleLabel: 'Người mua',
    cohortCampus: 'K17 SE • Hòa Lạc',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    isOnline: false,
    verified: true,
    lastMessage: 'Mình cọc trước qua MoMo rồi nhé, tối mình ...',
    time: '2 ngày trước',
    productImage: '/products/thinkpad-x1.jpg',
    pinnedProduct: {
      title: 'Chuột Logitech G102 Gen 2 Lightsync Black',
      price: 190000,
      originalPrice: 350000,
      conditionBadge: 'Đã giữ đồ',
      locationNote: 'Căng tin Dom E Hòa Lạc',
      imageUrl: '/products/thinkpad-x1.jpg',
      suggestedOffer: '170.000 đ',
    },
    messages: [
      {
        id: 'm-401',
        sender: 'other',
        text: 'Mình cọc trước qua MoMo rồi nhé, tối mình ghé Dom E lấy chuột nhé bạn!',
        time: '19:10',
      },
    ],
  },
];
