export interface VoucherItem {
  id: string;
  code: string;
  category: 'ship' | 'it' | 'dorm' | 'coins';
  tagBadge: {
    label: string;
    rightLabel: string;
    theme: 'hot' | 'blue' | 'green' | 'purple' | 'slate' | 'amber';
  };
  iconType: 'truck' | 'laptop' | 'book' | 'graduation' | 'bike' | 'coin' | 'dorm';
  title: string;
  subBadge: string;
  description: string;
  totalLimit?: number;
  claimedCount?: number;
  usedPercentage: number;
  usedText: string;
  metaRightText: string;
  discount: number;
  minOrder?: number;
  expiry: string;
  actionType: 'saved' | 'save' | 'auto' | 'redeem';
  coinCost?: number;
  campuses: string[];
}

export function createVoucher(
  item: Omit<VoucherItem, 'usedPercentage' | 'usedText'> & {
    usedPercentage?: number;
    usedText?: string;
  }
): VoucherItem {
  const claimedCount = item.claimedCount || 0;
  const totalLimit = item.totalLimit || 100;
  const usedPercentage =
    item.usedPercentage !== undefined
      ? item.usedPercentage
      : Math.min(100, Math.round((claimedCount / totalLimit) * 100));
  const usedText =
    item.usedText ||
    (claimedCount > 0
      ? `Đã dùng ${usedPercentage}% (${claimedCount}/${totalLimit})`
      : 'Chưa có lượt dùng (0%)');

  return {
    ...item,
    claimedCount,
    totalLimit,
    usedPercentage,
    usedText,
  };
}

export interface CoinQuestItem {
  id: string;
  title: string;
  coins: number;
  description: string;
  iconType: 'review' | 'kyc' | 'post' | 'safepoint';
  statusText: string;
  isCompleted: boolean;
  actionType: 'claim' | 'claimed' | 'link';
  actionHref?: string;
  actionLabel: string;
}

export const INITIAL_VOUCHERS: VoucherItem[] = [
  // 1. Ship Liên Campus (Card 1)
  createVoucher({
    id: 'vch-ship-100',
    code: 'FREESHIP5CAMPUS',
    category: 'ship',
    tagBadge: {
      label: '🔥 HOT / LIÊN CAMPUS',
      rightLabel: 'HSD: 30/10/2025',
      theme: 'hot',
    },
    iconType: 'truck',
    title: 'Giảm 100% Phí Vận Chuyển',
    subBadge: 'TỐI ĐA 40.000đ • ĐƠN TỪ 300K',
    description: 'Áp dụng vận chuyển liên campus giữa Hòa Lạc, TP.HCM, Đà Nẵng, Quy Nhơn và Cần Thơ qua CampusShip Express.',
    claimedCount: 0,
    totalLimit: 200,
    metaRightText: '⏱️ Còn 2 ngày',
    discount: 40000,
    minOrder: 300000,
    expiry: '30/10/2025',
    actionType: 'save',
    campuses: ['all', 'hola', 'hcm', 'danang', 'cantho', 'quynhon'],
  }),

  // 2. Trợ giá Capstone & IT (Card 2)
  createVoucher({
    id: 'vch-it-50k',
    code: 'CAPSTONE2025',
    category: 'it',
    tagBadge: {
      label: '🛠️ TRỢ GIÁ CAPSTONE & IT',
      rightLabel: 'HSD: 15/12/2025',
      theme: 'blue',
    },
    iconType: 'laptop',
    title: 'Giảm Ngay 50.000đ',
    subBadge: 'THIẾT BỊ IT & PHỤ KIỆN ĐỒ ÁN',
    description: 'Áp dụng mua laptop cũ, màn hình phụ Type-C, kit test vi điều khiển IoT từ sinh viên K16, K17 chuẩn bị ra trường.',
    claimedCount: 0,
    totalLimit: 150,
    metaRightText: 'Hạn mức: 150 lượt',
    discount: 50000,
    minOrder: 500000,
    expiry: '15/12/2025',
    actionType: 'save',
    campuses: ['all', 'hola', 'hcm', 'danang'],
  }),

  // 3. Giáo trình & Ôn thi (Card 3)
  createVoucher({
    id: 'vch-book-20k',
    code: 'FPTBOOK20K',
    category: 'it',
    tagBadge: {
      label: '📚 GIÁO TRÌNH & ÔN THI',
      rightLabel: 'HSD: 05/12/2025',
      theme: 'green',
    },
    iconType: 'book',
    title: 'Giảm 20.000đ Combo Sách',
    subBadge: 'TÀI LIỆU PE / FE & SUDE MÔN',
    description: 'Áp dụng đơn tài liệu từ 80.000đ khi giao dịch trực tiếp tại bàn giao nhận Thư viện hoặc Sảnh Alpha các Campus.',
    claimedCount: 0,
    totalLimit: 100,
    metaRightText: 'Bảo chứng FPT Library',
    discount: 20000,
    minOrder: 80000,
    expiry: '05/12/2025',
    actionType: 'save',
    campuses: ['all', 'hola', 'hcm', 'danang', 'cantho', 'quynhon'],
  }),

  // 4. Tân sinh viên K20 (Card 4)
  createVoucher({
    id: 'vch-k20-30k',
    code: 'CHAOTAN19K20',
    category: 'ship',
    tagBadge: {
      label: '🎁 TÂN SINH VIÊN K20',
      rightLabel: 'VÔ THỜI HẠN',
      theme: 'purple',
    },
    iconType: 'graduation',
    title: 'Giảm 30.000đ Đơn Đầu Tiên',
    subBadge: 'TÀI KHOẢN MỚI KÍCH HOẠT SSO',
    description: 'Áp dụng đơn đầu tiên trên FPT 5Campus cho tân sinh viên xác thực thành công địa chỉ email tân sinh viên @fpt.edu.vn.',
    claimedCount: 0,
    totalLimit: 500,
    metaRightText: 'Tự động kích hoạt',
    discount: 30000,
    minOrder: 100000,
    expiry: 'Vô thời hạn',
    actionType: 'auto',
    campuses: ['all', 'hola', 'hcm', 'danang', 'cantho', 'quynhon'],
  }),

  // 5. Ship Nội Khu KTX (Card 5)
  createVoucher({
    id: 'vch-ktx-free',
    code: 'HOALACPASS',
    category: 'dorm',
    tagBadge: {
      label: '🛵 SHIP NỘI KHU KTX',
      rightLabel: 'HSD: 31/12/2025',
      theme: 'slate',
    },
    iconType: 'bike',
    title: 'Miễn Phí 100% Giao KTX',
    subBadge: 'TẬN SẢNH DOM HOLA & TÒA E QS',
    description: 'Miễn phí giao hàng tới sảnh Dom A/B/C/D Hola & KTX Tòa E FPT TP.HCM cho mọi đơn hàng giá trị từ 50.000 đ.',
    claimedCount: 0,
    totalLimit: 120,
    metaRightText: 'Bảo trợ CLB Shipper SV',
    discount: 15000,
    minOrder: 50000,
    expiry: '31/12/2025',
    actionType: 'save',
    campuses: ['all', 'hola', 'hcm'],
  }),

  // 6. Đổi từ Coins (Card 6)
  createVoucher({
    id: 'vch-coin-25k',
    code: 'REWARDCOIN25K',
    category: 'coins',
    tagBadge: {
      label: '🪙 ĐỔI TỪ COINS',
      rightLabel: 'HOT REWARD',
      theme: 'amber',
    },
    iconType: 'coin',
    title: 'Voucher Giảm 25.000đ',
    subBadge: 'ÁP DỤNG MỌI ĐƠN HÀNG',
    description: 'Quy đổi trực tiếp từ Campus Coins tích lũy học tập & cộng đồng.',
    claimedCount: 0,
    totalLimit: 80,
    usedText: 'Giá đổi: 200 Coins',
    metaRightText: '200 Coins',
    discount: 25000,
    minOrder: 0,
    expiry: '31/12/2025',
    actionType: 'redeem',
    coinCost: 200,
    campuses: ['all', 'hola', 'hcm', 'danang', 'cantho', 'quynhon'],
  }),

  // 7. Ship Liên Miền
  createVoucher({
    id: 'vch-ship-dn-hcm',
    code: 'CAMPUSSHIP25K',
    category: 'ship',
    tagBadge: {
      label: '✈️ CAMPUSSHIP EXPRESS',
      rightLabel: 'HSD: 20/11/2025',
      theme: 'blue',
    },
    iconType: 'truck',
    title: 'Giảm 25.000đ Ship Liên Miền',
    subBadge: 'TUYẾN ĐÀ NẴNG - TP.HCM - HÒA LẠC',
    description: 'Ưu đãi chuyển phát nhanh hỏa tốc giữa các cơ sở Bắc - Trung - Nam, đóng thùng niêm phong FPT.',
    claimedCount: 0,
    totalLimit: 100,
    metaRightText: 'Hạn mức: 100 lượt',
    discount: 25000,
    minOrder: 200000,
    expiry: '20/11/2025',
    actionType: 'save',
    campuses: ['all', 'danang', 'hcm', 'hola'],
  }),

  // 8. Mekong Ship
  createVoucher({
    id: 'vch-ship-cantho',
    code: 'MEKONGSHIP',
    category: 'ship',
    tagBadge: {
      label: '🌾 CAMPUS MIỀN TÂY',
      rightLabel: 'HSD: 30/11/2025',
      theme: 'green',
    },
    iconType: 'truck',
    title: 'Freeship 100% Cần Thơ & Quy Nhơn',
    subBadge: 'ĐƠN TỪ 150K ĐẾN CƠ SỞ',
    description: 'Hỗ trợ sinh viên kết nối tài liệu giữa campus Cần Thơ và Quy Nhơn với các cơ sở lớn.',
    claimedCount: 0,
    totalLimit: 80,
    metaRightText: 'Tài trợ Hội SV',
    discount: 35000,
    minOrder: 150000,
    expiry: '30/11/2025',
    actionType: 'save',
    campuses: ['all', 'cantho', 'quynhon'],
  }),

  // 9. Weekend Ship
  createVoucher({
    id: 'vch-ship-weekend',
    code: 'WEEKENDSHIP',
    category: 'ship',
    tagBadge: {
      label: '⚡ CUỐI TUẦN TIẾT KIỆM',
      rightLabel: 'HSD: 25/11/2025',
      theme: 'purple',
    },
    iconType: 'truck',
    title: 'Giảm 15.000đ Phí Vận Chuyển',
    subBadge: 'ÁP DỤNG THỨ 7 & CHỦ NHẬT',
    description: 'Áp dụng cho mọi đơn hàng đặt giao trong 2 ngày cuối tuần qua mạng lưới bàn giao nhận.',
    claimedCount: 0,
    totalLimit: 100,
    metaRightText: 'Còn 12 ngày',
    discount: 15000,
    minOrder: 100000,
    expiry: '25/11/2025',
    actionType: 'save',
    campuses: ['all'],
  }),

  // 10. IT Monitor
  createVoucher({
    id: 'vch-it-monitor',
    code: 'ITMONITOR30',
    category: 'it',
    tagBadge: {
      label: '🖥️ HARDWARE PASS',
      rightLabel: 'HSD: 28/11/2025',
      theme: 'blue',
    },
    iconType: 'laptop',
    title: 'Giảm 30.000đ Màn Hình & Phím Cơ',
    subBadge: 'ĐỒNG HÀNH KODERS & DEVELOPERS',
    description: 'Áp dụng cho đơn hàng phụ kiện máy tính, bàn phím cơ, màn hình đồ họa sinh viên pass lại.',
    claimedCount: 0,
    totalLimit: 150,
    metaRightText: 'Hạn mức: 150 chiếc',
    discount: 30000,
    minOrder: 400000,
    expiry: '28/11/2025',
    actionType: 'save',
    campuses: ['all', 'hola', 'hcm'],
  }),

  // 11. IT Code
  createVoucher({
    id: 'vch-it-code',
    code: 'FUCODING15',
    category: 'it',
    tagBadge: {
      label: '💻 GIÁO TRÌNH LẬP TRÌNH',
      rightLabel: 'HSD: 10/12/2025',
      theme: 'green',
    },
    iconType: 'book',
    title: 'Giảm 15.000đ Sách C/Java/Python',
    subBadge: 'TÀI LIỆU KHOA KỸ THUẬT PHẦN MỀM',
    description: 'Giảm trực tiếp khi mua giáo trình chuẩn của các bộ môn PRO192, PRF192, MAD101, CSD201.',
    claimedCount: 0,
    totalLimit: 100,
    metaRightText: 'FPT Software tài trợ',
    discount: 15000,
    minOrder: 70000,
    expiry: '10/12/2025',
    actionType: 'save',
    campuses: ['all'],
  }),

  // 12. Dorm Fan
  createVoucher({
    id: 'vch-dorm-fan',
    code: 'KTXCOOL20',
    category: 'dorm',
    tagBadge: {
      label: '🛋️ TIỆN NGHI KTX',
      rightLabel: 'HSD: 15/12/2025',
      theme: 'slate',
    },
    iconType: 'dorm',
    title: 'Giảm 20.000đ Quạt & Nồi Cơm Điện',
    subBadge: 'ĐỒ GIA DỤNG PHÒNG DOM',
    description: 'Áp dụng mua quạt tích điện, bàn học gấp, ấm siêu tốc, tủ vải chuyển nhượng giữa các phòng.',
    claimedCount: 0,
    totalLimit: 90,
    metaRightText: 'Đảm bảo hoạt động tốt',
    discount: 20000,
    minOrder: 120000,
    expiry: '15/12/2025',
    actionType: 'save',
    campuses: ['all', 'hola', 'hcm'],
  }),

  // 13. Dorm Clean
  createVoucher({
    id: 'vch-dorm-clean',
    code: 'CLEANKTX10',
    category: 'dorm',
    tagBadge: {
      label: '🧹 DỌN PHÒNG & CHUYỂN DOM',
      rightLabel: 'HSD: 30/12/2025',
      theme: 'slate',
    },
    iconType: 'dorm',
    title: 'Giảm 10.000đ Dụng Cụ Vệ Sinh KTX',
    subBadge: 'CHO SINH VIÊN CHUYỂN DOM KỲ MỚI',
    description: 'Áp dụng cho giỏ hàng đồ dùng dọn dẹp, móc treo quần áo, giỏ đựng đồ bàn giao phòng.',
    claimedCount: 0,
    totalLimit: 100,
    metaRightText: 'BQL KTX FPT',
    discount: 10000,
    minOrder: 50000,
    expiry: '30/12/2025',
    actionType: 'save',
    campuses: ['all', 'hola'],
  }),

  // 14. Super Coin
  createVoucher({
    id: 'vch-coin-50k',
    code: 'SUPERCOIN50K',
    category: 'coins',
    tagBadge: {
      label: '👑 MASTER REWARD',
      rightLabel: 'SỐ LƯỢNG CÓ HẠN',
      theme: 'amber',
    },
    iconType: 'coin',
    title: 'Voucher Giảm 50.000đ Toàn Sàn',
    subBadge: 'DÀNH CHO ĐƠN TỪ 300K',
    description: 'Đổi từ 400 Campus Coins tích lũy từ điểm danh và giao dịch uy tín trên nền tảng.',
    claimedCount: 0,
    totalLimit: 50,
    usedText: 'Giá đổi: 400 Coins',
    metaRightText: '400 Coins',
    discount: 50000,
    minOrder: 300000,
    expiry: '31/12/2025',
    actionType: 'redeem',
    coinCost: 400,
    campuses: ['all'],
  }),
];

export const INITIAL_QUESTS: CoinQuestItem[] = [
  {
    id: 'quest-review',
    title: 'Đánh giá kèm ảnh/video sau nhận đồ',
    coins: 50,
    description: 'Giúp cộng đồng sinh viên minh bạch chất lượng đồ cũ đã qua sử dụng và tăng điểm uy tín.',
    iconType: 'review',
    statusText: 'Tiến độ: 0 / 1 đánh giá',
    isCompleted: false,
    actionType: 'link',
    actionHref: '/profile',
    actionLabel: 'Đánh giá ngay',
  },
  {
    id: 'quest-kyc',
    title: 'Xác thực KYC Thẻ SV & Mail FPT',
    coins: 100,
    description: 'Liên kết bảo mật tài khoản SSO @fpt.edu.vn kích hoạt huy hiệu sinh viên chuẩn Hola Campus.',
    iconType: 'kyc',
    statusText: 'Chưa xác thực thẻ SV',
    isCompleted: false,
    actionType: 'link',
    actionHref: '/profile',
    actionLabel: 'Xác thực ngay',
  },
  {
    id: 'quest-post',
    title: 'Đăng bán 01 món đồ học tập cũ không dùng',
    coins: 30,
    description: 'Pass lại máy tính Casio, giáo trình kỳ trước hoặc phụ kiện KTX cho các em khóa dưới.',
    iconType: 'post',
    statusText: 'Tiến độ: 0 / 1 món',
    isCompleted: false,
    actionType: 'link',
    actionHref: '/create-post',
    actionLabel: 'Đăng bán ngay',
  },
  {
    id: 'quest-safepoint',
    title: 'Giao dịch an toàn tại Safe-Handoff Point',
    coins: 40,
    description: 'Check-in giao nhận tại Sảnh Tòa Alpha, Reta hoặc Bàn Tiếp nhận Thư viện trường.',
    iconType: 'safepoint',
    statusText: 'Chưa check-in điểm danh hôm nay',
    isCompleted: false,
    actionType: 'link',
    actionHref: '/vouchers',
    actionLabel: 'Điểm danh ngay',
  },
];
