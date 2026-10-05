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

export const INITIAL_VOUCHERS: VoucherItem[] = [];

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
