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

export function extractImageUrl(img: any): string {
  if (!img) return '';
  let url = '';
  if (typeof img === 'string') {
    url = img.trim();
  } else if (typeof img === 'object') {
    if (typeof img.imageUrl === 'string') url = img.imageUrl.trim();
    else if (typeof img.url === 'string') url = img.url.trim();
    else if (typeof img.src === 'string') url = img.src.trim();
  }

  if (!url || url.includes('api.marketfu.com') || url.includes('marketfu.com')) {
    return '';
  }

  return url;
}

const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

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
    rating: item.seller?.reputationScore ? Math.min(5.0, Number((item.seller.reputationScore / 20).toFixed(1))) : 0,
    reviewCount: item.seller?.reviewCount || 0,
    dealCount: item.seller?.dealCount || 0,
    responseRate: '0%',
  };

  const rawImages = Array.isArray(item.images) ? item.images : [];
  const imageUrls: string[] = rawImages
    .map(extractImageUrl)
    .filter((url: string) => url.length > 0);

  const directImage = extractImageUrl(item.imageUrl);
  const primaryImage = imageUrls[0] || directImage || FALLBACK_PRODUCT_IMAGE;

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
  const rawImages = Array.isArray(item.images) ? item.images : [];
  const imageUrls: string[] = rawImages
    .map(extractImageUrl)
    .filter((url: string) => url.length > 0);
  const images = imageUrls.length > 0 ? imageUrls : [base.imageUrl];

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

  const profile = user.profile || user;
  const kyc = user.studentVerification || user.kyc || profile.kyc || {};

  const emailLower = String(user.email || profile.email || '').toLowerCase().trim();
  const isEdu = emailLower.endsWith('@fpt.edu.vn') || emailLower.endsWith('@fe.edu.vn');

  let kycStatus: UserProfile['kycStatus'] = 'unverified';
  const statusUpper = String(kyc.status || '').toUpperCase();
  if (statusUpper === 'APPROVED' || user.role === 'SELLER') {
    kycStatus = user.role === 'SELLER' ? 'approved_seller' : 'approved_student';
  } else if (statusUpper === 'PENDING') {
    kycStatus = 'pending';
  } else if (statusUpper === 'REJECTED') {
    kycStatus = 'rejected';
  } else if (isEdu) {
    // Tài khoản email trường @fpt.edu.vn hoặc @fe.edu.vn mặc định đã xác thực sinh viên
    kycStatus = 'approved_student';
  }

  const studentId = kyc.studentId || profile.studentId || user.studentId || '';
  const cohortMatch = studentId.match(/\d{2}/)?.[0];
  const derivedCohort = profile.cohort || (cohortMatch ? `K${cohortMatch}` : isEdu ? 'K17' : '');
  const isSE = studentId.toUpperCase().includes('SE') || studentId.toUpperCase().includes('HE');
  const derivedMajor = profile.major || (isSE ? 'Kỹ thuật Phần mềm (SE)' : isEdu ? 'Kỹ thuật Phần mềm' : 'Công nghệ thông tin');

  return {
    id: user.userId || user.id || profile.userId || profile.id,
    name: profile.fullName || user.fullName || user.email?.split('@')[0] || 'Sinh viên FPT',
    studentId,
    cohort: derivedCohort,
    major: derivedMajor,
    campus: formatCampusTag(profile.campus || user.campus || 'HOL'),
    dorm: profile.dorm || '',
    phone: profile.phoneNumber || profile.phone || '',
    email: user.email || profile.email || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl || user.avatarUrl || '',
    coins: user.campusCoins ?? profile.campusCoins ?? 0,
    trustScore: user.reputationScore ?? profile.reputationScore ?? 100,
    savedVoucherIds: [],
    claimedQuestIds: [],
    dailyCheckedIn: false,
    kycStatus,
    kycRole: user.role === 'SELLER' ? 'seller' : 'student',
    kycApplicationId: kyc.id,
    kycRejectionReason: kyc.rejectedReason || profile.kyc?.rejectedReason || '',
    vouchers: [],
    settings: {
      emailNotifications: true,
      smsNotifications: true,
      soundEnabled: true,
      showMaskedId: true,
    },
  };
}
