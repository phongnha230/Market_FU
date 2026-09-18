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
  {
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
    usedPercentage: 82,
    usedText: 'Đã dùng 82%',
    metaRightText: '⏱️ Còn 2 ngày',
    discount: 40000,
    minOrder: 300000,
    expiry: '30/10/2025',
    actionType: 'saved',
    campuses: ['all', 'hola', 'hcm', 'danang', 'cantho', 'quynhon'],
  },

  // 2. Trợ giá Capstone & IT (Card 2)
  {
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
    usedPercentage: 45,
    usedText: 'Đã dùng 45%',
    metaRightText: 'Còn lại: 110 lượt',
    discount: 50000,
    minOrder: 500000,
    expiry: '15/12/2025',
    actionType: 'save',
    campuses: ['all', 'hola', 'hcm', 'danang'],
  },

  // 3. Giáo trình & Ôn thi (Card 3)
  {
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
    usedPercentage: 65,
    usedText: 'Đã dùng 65%',
    metaRightText: 'Bảo chứng FPT Library',
    discount: 20000,
    minOrder: 80000,
    expiry: '05/12/2025',
    actionType: 'save',
    campuses: ['all', 'hola', 'hcm', 'danang', 'cantho', 'quynhon'],
  },

  // 4. Tân sinh viên K20 (Card 4)
  {
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
    usedPercentage: 74,
    usedText: 'Đã cấp: 1.640 bạn',
    metaRightText: 'Tự động kích hoạt',
    discount: 30000,
    minOrder: 100000,
    expiry: 'Vô thời hạn',
    actionType: 'auto',
    campuses: ['all', 'hola', 'hcm', 'danang', 'cantho', 'quynhon'],
  },

  // 5. Ship Nội Khu KTX (Card 5)
  {
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
    usedPercentage: 38,
    usedText: 'Đã dùng 38%',
    metaRightText: 'Bảo trợ CLB Shipper SV',
    discount: 15000,
    minOrder: 50000,
    expiry: '31/12/2025',
    actionType: 'save',
    campuses: ['all', 'hola', 'hcm'],
  },

  // 6. Đổi từ Coins (Card 6)
  {
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
    description: 'Quy đổi trực tiếp từ Campus Coins tích lũy học tập & cộng đồng. Số dư hiện có của bạn: 350 Coins.',
    usedPercentage: 90,
    usedText: 'Giá đổi: 200 Coins',
    metaRightText: '✓ Đã đủ điều kiện đổi',
    discount: 25000,
    minOrder: 0,
    expiry: '31/12/2025',
    actionType: 'redeem',
    coinCost: 200,
    campuses: ['all', 'hola', 'hcm', 'danang', 'cantho', 'quynhon'],
  },

  // Additional Vouchers to fulfill counts (Ship: 5, IT: 4, Dorm: 3, Coins: 2 -> Total 14)
  {
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
    usedPercentage: 52,
    usedText: 'Đã dùng 52%',
    metaRightText: 'Còn lại: 85 lượt',
    discount: 25000,
    minOrder: 200000,
    expiry: '20/11/2025',
    actionType: 'save',
    campuses: ['all', 'danang', 'hcm', 'hola'],
  },
  {
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
    usedPercentage: 60,
    usedText: 'Đã dùng 60%',
    metaRightText: 'Tài trợ Hội SV',
    discount: 35000,
    minOrder: 150000,
    expiry: '30/11/2025',
    actionType: 'save',
    campuses: ['all', 'cantho', 'quynhon'],
  },
  {
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
    usedPercentage: 40,
    usedText: 'Đã dùng 40%',
    metaRightText: 'Còn 12 ngày',
    discount: 15000,
    minOrder: 100000,
    expiry: '25/11/2025',
    actionType: 'save',
    campuses: ['all'],
  },
  {
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
    usedPercentage: 70,
    usedText: 'Đã dùng 70%',
    metaRightText: 'Hạn mức: 200 chiếc',
    discount: 30000,
    minOrder: 400000,
    expiry: '28/11/2025',
    actionType: 'save',
    campuses: ['all', 'hola', 'hcm'],
  },
  {
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
    usedPercentage: 85,
    usedText: 'Đã dùng 85%',
    metaRightText: 'FPT Software tài trợ',
    discount: 15000,
    minOrder: 70000,
    expiry: '10/12/2025',
    actionType: 'save',
    campuses: ['all'],
  },
  {
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
    usedPercentage: 55,
    usedText: 'Đã dùng 55%',
    metaRightText: 'Đảm bảo hoạt động tốt',
    discount: 20000,
    minOrder: 120000,
    expiry: '15/12/2025',
    actionType: 'save',
    campuses: ['all', 'hola', 'hcm'],
  },
  {
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
    usedPercentage: 30,
    usedText: 'Đã dùng 30%',
    metaRightText: 'BQL KTX FPT',
    discount: 10000,
    minOrder: 50000,
    expiry: '30/12/2025',
    actionType: 'save',
    campuses: ['all', 'hola'],
  },
  {
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
    usedPercentage: 92,
    usedText: 'Giá đổi: 400 Coins',
    metaRightText: 'Cần thêm 50 Coins',
    discount: 50000,
    minOrder: 300000,
    expiry: '31/12/2025',
    actionType: 'redeem',
    coinCost: 400,
    campuses: ['all'],
  },
];

export const INITIAL_QUESTS: CoinQuestItem[] = [
  {
    id: 'quest-review',
    title: 'Đánh giá kèm ảnh/video sau nhận đồ',
    coins: 50,
    description: 'Giúp cộng đồng sinh viên minh bạch chất lượng đồ cũ đã qua sử dụng và tăng điểm uy tín.',
    iconType: 'review',
    statusText: '✓ Đã hoàn thành 1 giao dịch',
    isCompleted: true,
    actionType: 'claim',
    actionLabel: 'Nhận 50 Coins',
  },
  {
    id: 'quest-kyc',
    title: 'Xác thực KYC Thẻ SV & Mail FPT',
    coins: 100,
    description: 'Liên kết bảo mật tài khoản SSO @fpt.edu.vn kích hoạt huy hiệu sinh viên chuẩn Hola Campus.',
    iconType: 'kyc',
    statusText: '✓ Đã hoàn thành (Hòa Lạc K17)',
    isCompleted: true,
    actionType: 'claimed',
    actionLabel: 'Đã nhận ✓',
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
    statusText: '✓ Đã check-in hôm nay (Sảnh Alpha)',
    isCompleted: true,
    actionType: 'claim',
    actionLabel: 'Nhận 40 Coins',
  },
];
