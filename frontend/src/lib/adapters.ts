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
  switch (campus?.toUpperCase()) {
    case 'HOL':
    case 'HOLA':
      return 'Hòa Lạc';
    case 'HCM':
      return 'Hồ Chí Minh';
    case 'DAD':
    case 'DN':
      return 'Đà Nẵng';
    case 'QN':
      return 'Quy Nhơn';
    case 'CT':
      return 'Cần Thơ';
    case 'ALL':
      return 'Tất cả cơ sở';
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

  const sellerId = item.sellerId || item.seller?.id || item.seller?.userId || item.seller?._id;
  const sellerObj: Seller = {
    id: sellerId,
    name: item.seller?.profile?.fullName || item.seller?.fullName || item.seller?.name || 'Sinh viên FPT',
    cohort: item.seller?.profile?.campus ? formatCampusTag(item.seller.profile.campus) : (item.seller?.studentVerification?.studentId || item.seller?.cohort || 'FPT University'),
    initial: ((item.seller?.profile?.fullName || item.seller?.fullName || item.seller?.name || 'U')[0] || 'U').toUpperCase(),
    verified: item.seller?.profile?.isKycVerified || item.seller?.studentVerification?.status === 'APPROVED' || item.seller?.verified === true,
    avatarUrl: item.seller?.profile?.avatarUrl || item.seller?.avatarUrl || undefined,
    rating: item.seller?.profile?.reputationScore ? Math.min(5.0, Number((item.seller.profile.reputationScore / 20).toFixed(1))) : (item.seller?.reputationScore ? Math.min(5.0, Number((item.seller.reputationScore / 20).toFixed(1))) : 0),
    reviewCount: item.seller?.reviewCount || 0,
    dealCount: item.seller?.dealCount || 0,
    responseRate: '0%',
    email: item.seller?.email || item.seller?.profile?.email,
    phoneNumber: item.seller?.phoneNumber || item.seller?.profile?.phoneNumber || item.seller?.phone,
  };

  const rawImages = Array.isArray(item.images)
    ? item.images
    : Array.isArray(item.imageUrls)
    ? item.imageUrls
    : [];
  const imageUrls: string[] = rawImages
    .map(extractImageUrl)
    .filter((url: string) => url.length > 0);

  const directImage = extractImageUrl(item.imageUrl);
  const primaryImage = imageUrls[0] || directImage || FALLBACK_PRODUCT_IMAGE;
  const allImages = imageUrls.length > 0 ? imageUrls : [primaryImage];

  return {
    id: item.id || item._id,
    sellerId,
    title: item.title || 'Sản phẩm không có tên',
    price: Number(item.price) || 0,
    originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
    imageUrl: primaryImage,
    images: allImages,
    campusTag: formatCampusTag(item.campus || item.campusTag),
    campus: item.campus,
    badges: item.badges && item.badges.length > 0 ? item.badges : badges,
    location: item.location || item.meetupLocation || formatCampusTag(item.campus),
    timeAgo: formatTimeAgo(item.createdAt),
    seller: sellerObj,
    category: typeof item.category === 'object' ? item.category?.name : (item.category || item.categoryType),
    categoryId: item.categoryId || (typeof item.category === 'object' ? item.category?.id : undefined),
    categoryType: item.categoryType,
    hashtags: Array.isArray(item.hashtags) ? item.hashtags : [],
    condition: item.condition,
    quantity: item.quantity,
    allowShipping: item.allowShipping,
    viewCount: item.viewsCount ?? item.viewCount ?? 0,
    status: item.status,
    rejectionReason: item.rejectionReason,
    approvedAt: item.approvedAt,
  };
}

/**
 * Adapter: Chuyển đổi chi tiết sản phẩm từ Backend sang ProductDetail của Frontend
 */
export function adaptBackendProductDetail(item: any): ProductDetail {
  const base = adaptBackendProduct(item);
  const rawImages = Array.isArray(item.images)
    ? item.images
    : Array.isArray(item.imageUrls)
    ? item.imageUrls
    : Array.isArray(item.galleryImages)
    ? item.galleryImages
    : (base.images && base.images.length > 0 ? base.images : []);

  const imageUrls: string[] = rawImages
    .map(extractImageUrl)
    .filter((url: string) => url.length > 0);
  const images = imageUrls.length > 0 ? imageUrls : (base.imageUrl ? [base.imageUrl] : []);

  const galleryImages = images.map((img: string, idx: number) => ({
    src: img,
    alt: `${base.title} - Ảnh ${idx + 1}${idx === 0 ? ' (Bìa)' : ''}`,
  }));

  const conditionText = formatCondition(item.condition);

  return {
    ...base,
    images,
    galleryImages,
    condition: conditionText,
    hashtags: Array.isArray(item.hashtags) ? item.hashtags : (base.hashtags || []),
    description: item.description || 'Không có mô tả chi tiết cho sản phẩm này.',
    bulletPoints: [
      { title: 'Tình trạng', content: conditionText },
      { title: 'Cơ sở', content: formatCampusTag(item.campus) },
      { title: 'Địa điểm giao dịch', content: item.meetupLocation || item.location || 'Tại khuôn viên trường' },
      { title: 'Trạng thái', content: item.status === 'AVAILABLE' ? 'Đang bán' : item.status === 'RESERVED' ? 'Đã đặt cọc' : 'Đã bán' },
    ],
    meetingNote: (item.meetupLocation || item.location) ? `Gặp trực tiếp tại: ${item.meetupLocation || item.location}` : 'Gặp trực tiếp tại KTX hoặc khuôn viên trường',
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
  const kycTypeUpper = String(kyc.type || '').toUpperCase();

  if (statusUpper === 'APPROVED') {
    kycStatus = kycTypeUpper === 'SELLER' ? 'approved_seller' : 'approved_student';
  } else if (statusUpper === 'PENDING') {
    kycStatus = 'pending';
  } else if (statusUpper === 'REJECTED') {
    kycStatus = 'rejected';
  } else if (user.role === 'SELLER' && kycTypeUpper !== 'STUDENT') {
    kycStatus = 'approved_seller';
  } else if (isEdu) {
    // Tài khoản email trường @fpt.edu.vn hoặc @fe.edu.vn mặc định đã xác thực sinh viên
    kycStatus = 'approved_student';
  }

  const userRole: UserProfile['role'] = user.role || (isEdu ? 'BUYER' : 'UNVERIFIED');

  const studentId = kyc.studentId || profile.studentId || user.studentId || '';
  const cohortMatch = studentId.match(/\d{2}/)?.[0];
  // Chỉ lấy cohort thật do người dùng nhập hoặc trích xuất từ MSSV thực tế, TUYỆT ĐỐI KHÔNG fake 'K17'
  const derivedCohort = profile.cohort || (cohortMatch ? `K${cohortMatch}` : '');
  // Chỉ lấy major thật do người dùng nhập, TUYỆT ĐỐI KHÔNG fake chuyên ngành
  const derivedMajor = profile.major || '';

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
    role: userRole,
    kycStatus,
    kycRole: kycTypeUpper === 'SELLER' || user.role === 'SELLER' ? 'seller' : 'student',
    kycApplicationId: kyc.id,
    kycRejectionReason: kyc.rejectedReason || profile.kyc?.rejectedReason || '',
    vouchers: [],
    settings: {
      emailNotifications: true,
      smsNotifications: true,
      soundEnabled: true,
      showMaskedId: true,
    },
    bankAccount: profile.bankAccount || user.bankAccount || undefined,
  };
}
