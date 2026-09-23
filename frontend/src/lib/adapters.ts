import { ProductItem, ProductDetail, Seller } from '@/types/product';
import { UserProfile } from '@/stores/userStore';

export function formatCondition(condition?: string): string {
  switch (condition) {
    case 'NEW_100':
      return 'Mới 100%';
    case 'LIKE_NEW_99':
      return 'Like New 99%';
    case 'USED_GOOD':
      return 'Đã qua sử dụng (Tốt)';
    case 'USED_FAIR':
      return 'Đã qua sử dụng (Khá)';
    default:
      return condition || 'Đã qua sử dụng';
  }
}

export function formatCampusTag(campus?: string): string {
  switch (campus) {
    case 'HOL':
      return 'Hòa Lạc';
    case 'HCM':
      return 'Hồ Chí Minh';
    case 'DAD':
      return 'Đà Nẵng';
    case 'QN':
      return 'Quy Nhơn';
    case 'CT':
      return 'Cần Thơ';
    default:
      return campus || 'Hòa Lạc';
  }
}

export function formatTimeAgo(dateStr?: string | Date): string {
  if (!dateStr) return 'Vừa xong';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Vừa xong';
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

/**
 * Adapter: Chuyển đổi đối tượng Product từ Backend sang ProductItem chuẩn của Frontend
 */
export function adaptBackendProduct(item: any): ProductItem {
  if (!item) {
    throw new Error('Product data is missing');
  }

  const badges: string[] = [];
  if (item.condition) badges.push(formatCondition(item.condition));
  if (item.isBoosted) badges.push('🔥 Nổi bật');
  if (item.price === 0) badges.push('Tặng miễn phí');

  const sellerObj: Seller = {
    name: item.seller?.fullName || item.seller?.name || 'Sinh viên FPT',
    cohort: item.seller?.studentVerification?.studentId || item.seller?.cohort || 'FPT University',
    initial: ((item.seller?.fullName || item.seller?.name || 'U')[0] || 'U').toUpperCase(),
    verified: item.seller?.studentVerification?.status === 'APPROVED' || item.seller?.verified === true,
    avatarUrl: item.seller?.avatarUrl || undefined,
    rating: item.seller?.reputationScore ? Math.min(5.0, Number((item.seller.reputationScore / 20).toFixed(1))) : 5.0,
    reviewCount: item.seller?.reviewCount || 0,
    dealCount: item.seller?.dealCount || 0,
    responseRate: '98%',
  };

  const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : [];
  const primaryImage = images[0] || item.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  return {
    id: item.id || item._id,
    title: item.title || 'Sản phẩm không có tên',
    price: Number(item.price) || 0,
    originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
    imageUrl: primaryImage,
    campusTag: formatCampusTag(item.campus || item.campusTag),
    badges: item.badges && item.badges.length > 0 ? item.badges : badges,
    location: item.location || formatCampusTag(item.campus),
    timeAgo: formatTimeAgo(item.createdAt),
    seller: sellerObj,
    category: typeof item.category === 'object' ? item.category?.name : item.category,
    viewCount: item.viewsCount ?? item.viewCount ?? 0,
  };
}

/**
 * Adapter: Chuyển đổi chi tiết sản phẩm từ Backend sang ProductDetail của Frontend
 */
export function adaptBackendProductDetail(item: any): ProductDetail {
  const base = adaptBackendProduct(item);
  const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : [base.imageUrl];

  const galleryImages = images.map((img: string, idx: number) => ({
    src: img,
    alt: `${base.title} - Ảnh ${idx + 1}`,
  }));

  return {
    ...base,
    galleryImages,
    condition: formatCondition(item.condition),
    description: item.description || 'Không có mô tả chi tiết cho sản phẩm này.',
    bulletPoints: [
      { title: 'Tình trạng', content: formatCondition(item.condition) },
      { title: 'Cơ sở', content: formatCampusTag(item.campus) },
      { title: 'Địa điểm giao dịch', content: item.location || 'Tại khuôn viên trường' },
      { title: 'Trạng thái', content: item.status === 'AVAILABLE' ? 'Đang bán' : item.status === 'RESERVED' ? 'Đã đặt cọc' : 'Đã bán' },
    ],
    meetingNote: item.location ? `Gặp trực tiếp tại: ${item.location}` : 'Gặp trực tiếp tại KTX hoặc khuôn viên trường',
  };
}

/**
 * Adapter: Chuyển đổi thông tin User từ Backend sang UserProfile của Frontend
 */
export function adaptBackendUser(user: any): UserProfile {
  if (!user) {
    throw new Error('User data is missing');
  }

  const profile = user.profile || {};
  const kyc = user.studentVerification || {};

  let kycStatus: UserProfile['kycStatus'] = 'unverified';
  if (kyc.status === 'APPROVED') {
    kycStatus = user.role === 'SELLER' ? 'approved_seller' : 'approved_student';
  } else if (kyc.status === 'PENDING') {
    kycStatus = 'pending';
  } else if (kyc.status === 'REJECTED') {
    kycStatus = 'rejected';
  }

  return {
    name: profile.fullName || user.email?.split('@')[0] || 'Sinh viên FPT',
    studentId: kyc.studentId || profile.studentId || '',
    cohort: profile.cohort || 'K17',
    major: profile.major || 'Kỹ thuật phần mềm',
    campus: formatCampusTag(profile.campus || user.campus || 'HOL'),
    dorm: profile.dorm || 'KTX',
    phone: profile.phone || '',
    email: user.email || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    coins: user.campusCoins ?? 0,
    trustScore: user.reputationScore ?? 100,
    savedVoucherIds: [],
    claimedQuestIds: [],
    dailyCheckedIn: false,
    kycStatus,
    kycRole: user.role === 'SELLER' ? 'seller' : 'student',
    kycApplicationId: kyc.id,
    vouchers: [],
    settings: {
      emailNotifications: true,
      smsNotifications: true,
      soundEnabled: true,
      showMaskedId: true,
    },
  };
}
