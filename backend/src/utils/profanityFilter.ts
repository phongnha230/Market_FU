import { AppError } from '../middlewares/error.middleware';

/**
 * Danh mục các nhóm từ cấm và nội dung vi phạm trên sàn giao dịch sinh viên FPT (MarketFU)
 */
export interface BannedRule {
  pattern: RegExp;
  category:
    | 'PROHIBITED_SUBSTANCE'
    | 'WEAPON_DANGEROUS'
    | 'ACADEMIC_DISHONESTY'
    | 'ADULT_CONTENT'
    | 'SCAM_GAMBLING'
    | 'PROFANITY_VULGAR';
  reason: string;
}

// Unicode boundary: tránh lỗi của \b trong Javascript với nguyên âm tiếng Việt có dấu (ă, â, đ, ê, ô, ơ, ư, ộ, v.v.)
const UB_START = '(?<![\\p{L}\\p{N}])';
const UB_END = '(?![\\p{L}\\p{N}])';

const createRegex = (patternStr: string, flags = 'iu') => {
  return new RegExp(`${UB_START}(?:${patternStr})${UB_END}`, flags);
};

// Từ khóa ngoại lệ (Safe whitelist - ví dụ: súng bắn keo, bàn học, dụng cụ học tập)
const WHITELIST_SAFE_PHRASES = [
  /súng\s*bắn\s*keo/giu,
  /sung\s*ban\s*keo/giu,
  /bàn\s*học/giu,
  /ban\s*hoc/giu,
  /học\s*tập/giu,
  /hoc\s*tap/giu,
  /học\s*phí/giu,
  /hoc\s*phi/giu,
  /học\s*bổng/giu,
  /hoc\s*bong/giu,
  /khoa\s*học/giu,
  /khoa\s*hoc/giu,
  /sinh\s*viên/giu,
  /sinh\s*vien/giu,
  /áo\s*cộc/giu,
  /ao\s*coc/giu,
  /con\s*dao\s*gọt\s*hoa\s*quả/giu,
  /dao\s*got\s*hoa\s*qua/giu,
  /dao\s*cạo/giu,
  /dao\s*cao/giu,
  /bóng\s*đá/giu,
  /bong\s*da/giu,
  /bóng\s*bàn/giu,
  /bong\s*ban/giu,
  /bóng\s*chuyền/giu,
  /bong\s*chuyen/giu,
  /bóng\s*rổ/giu,
  /bong\s*ro/giu,
  /bóng\s*đèn/giu,
  /bong\s*den/giu,
  /bánh\s*kẹo/giu,
  /banh\s*keo/giu,
];

// Định nghĩa các mẫu nhận diện từ cấm (Unicode-aware, hỗ trợ cả tiếng Việt có dấu, không dấu và biến thể)
export const BANNED_PATTERNS: BannedRule[] = [
  // 1. Chất cấm, thuốc lá điện tử, chất kích thích (Nghiêm cấm theo luật & nội quy KTX ĐH FPT)
  {
    pattern: createRegex(
      'vape|pod(?:\\s*system)?|juice\\s*pod|tinh\\s*dầu\\s*vape|tinh\\s*dau\\s*vape|shisha|thuốc\\s*lá|thuoc\\s*la|cần\\s*sa|can\\s*sa|hút\\s*cần|hut\\s*can|búp\\s*cần|bup\\s*can|điếu\\s*cần|dieu\\s*can|cỏ\\s*mỹ|co\\s*my|bóng\\s*cười|bong\\s*cuoi|ma\\s*túy|ma\\s*tuy|ketamin|ecstasy|thuốc\\s*lắc|thuoc\\s*lac|kẹo\\s*lắc|keo\\s*lac|chơi\\s*ke|cắn\\s*kẹo|can\\s*keo|kẹo\\s*ke'
    ),
    category: 'PROHIBITED_SUBSTANCE',
    reason: 'Chất kích thích, thuốc lá điện tử hoặc chất gây nghiện bị nghiêm cấm trong khuôn viên ĐH FPT',
  },
  // Biến thể leetspeak/lách chữ cho vape/pod/ma túy
  {
    pattern: createRegex(
      'v[\\._\\-\\s]*a[\\._\\-\\s]*p[\\._\\-\\s]*e|p[\\._\\-\\s]*o[\\._\\-\\s]*d|m[\\._\\-\\s]*a\\s*t[\\._\\-\\s]*[úu][\\._\\-\\s]*y|c[\\._\\-\\s]*[ầa][\\._\\-\\s]*n\\s*s[\\._\\-\\s]*[aa]'
    ),
    category: 'PROHIBITED_SUBSTANCE',
    reason: 'Chất kích thích, thuốc lá điện tử hoặc chất gây nghiện bị nghiêm cấm trong khuôn viên ĐH FPT',
  },

  // 2. Vũ khí, vật liệu nổ, công cụ sát thương nguy hiểm
  {
    pattern: createRegex(
      'dao\\s*bấm|dao\\s*bam|dao\\s*găm|dao\\s*gam|kiếm(?:\\s*nhật)?|kiem(?:\\s*nhat)?|katana|mã\\s*tấu|ma\\s*tau|phóng\\s*lợn|phong\\s*lon|súng|sung|đạn|dan|bình\\s*xịt\\s*hơi\\s*cay|binh\\s*xit\\s*hoi\\s*cay|dùi\\s*cui|dui\\s*cui|roi\\s*điện|roi\\s*dien|chích\\s*điện|chich\\s*dien|pháo\\s*hoa|phao\\s*hoa|pháo\\s*nổ|phao\\s*no|lựu\\s*đạn|luu\\s*dan|côn\\s*nhị\\s*khúc|con\\s*nhi\\s*khuc'
    ),
    category: 'WEAPON_DANGEROUS',
    reason: 'Vũ khí, công cụ hỗ trợ hoặc vật liệu cháy nổ nguy hiểm bị cấm tàng trữ và mua bán',
  },

  // 3. Gian lận học thuật & Vi phạm quy chế thi cử FPT
  {
    pattern: createRegex(
      'thi\\s*hộ|thi\\s*ho|thi\\s*thuê|thi\\s*thue|thi\\s*giùm|thi\\s*gium|học\\s*hộ|hoc\\s*ho|học\\s*thuê|hoc\\s*thue|điểm\\s*danh\\s*hộ|diem\\s*danh\\s*ho|điểm\\s*danh\\s*thuê|diem\\s*danh\\s*thue|làm\\s*thuê\\s*đồ\\s*án|lam\\s*thue\\s*do\\s*an|làm\\s*đồ\\s*án\\s*thuê|lam\\s*do\\s*an\\s*thue|viết\\s*thuê\\s*luận\\s*văn|viet\\s*thue\\s*luan\\s*van|bán\\s*đề(?:\\s*thi)?|ban\\s*de(?:\\s*thi)?|hack\\s*điểm|hack\\s*diem|chạy\\s*điểm|chay\\s*diem|bằng\\s*giả|bang\\s*gia'
    ),
    category: 'ACADEMIC_DISHONESTY',
    reason: 'Gian lận học thuật, thi hộ hoặc làm thuê đồ án vi phạm nghiêm trọng Quy chế đào tạo ĐH FPT',
  },

  // 4. Văn hóa phẩm đồi trụy & dịch vụ nhạy cảm
  {
    pattern: createRegex(
      'khiêu\\s*dâm|khieu\\s*dam|thuốc\\s*kích\\s*dục|thuoc\\s*kich\\s*duc|đồi\\s*trụy|doi\\s*truy|phim\\s*sex|clip\\s*nóng|clip\\s*nong|gái\\s*gọi|gai\\s*goi|mại\\s*dâm|mai\\s*dam|sex\\s*toy|sextoy|búp\\s*bê\\s*tình\\s*dục|bup\\s*be\\s*tinh\\s*duc'
    ),
    category: 'ADULT_CONTENT',
    reason: 'Văn hóa phẩm đồi trụy, dụng cụ kích dục hoặc dịch vụ nhạy cảm không được phép đăng bán',
  },

  // 5. Cờ bạc, cá độ, lừa đảo tài chính & cho vay nặng lãi
  {
    pattern: createRegex(
      'tài\\s*xỉu|tai\\s*xiu|đánh\\s*bạc|danh\\s*bac|cá\\s*độ|ca\\s*do|bốc\\s*bát\\s*họ|boc\\s*bat\\s*ho|vay\\s*nặng\\s*lãi|vay\\s*nang\\s*lai|tiền\\s*giả|tien\\s*gia|rửa\\s*tiền|rua\\s*tien|app\\s*vay\\s*nóng|app\\s*vay\\s*nong'
    ),
    category: 'SCAM_GAMBLING',
    reason: 'Tài chính bất hợp pháp, cờ bạc, vay nặng lãi hoặc hành vi lừa đảo',
  },

  // 6. Từ ngữ thô tục, chửi thề xúc phạm thuần phong mỹ tục
  {
    pattern: createRegex(
      'địt|dit|lồn|lon|cặc|cac|buồi|buoi|đĩ|di|đụ\\s*má|du\\s*ma|đụ\\s*mẹ|du\\s*me|đm|dcm|vcl|vcll|vl|chó\\s*đẻ|cho\\s*de|óc\\s*chó|oc\\s*cho'
    ),
    category: 'PROFANITY_VULGAR',
    reason: 'Từ ngữ thô tục, chửi thề hoặc xúc phạm người khác',
  },
];

/**
 * Chuẩn hóa chuỗi văn bản loại bỏ dấu tiếng Việt để kiểm tra
 */
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Kiểm tra nội dung văn bản có chứa từ cấm hoặc nội dung không hợp lệ hay không
 */
export function checkContentModeration(text: string): {
  isClean: boolean;
  violations: Array<{ word: string; category: string; reason: string }>;
  severity: 'BLOCK' | 'WARN' | 'CLEAN';
} {
  if (!text || !text.trim()) {
    return { isClean: true, violations: [], severity: 'CLEAN' };
  }

  // Bước 1: Thay thế các cụm từ an toàn thuộc Whitelist bằng token rỗng tạm thời để tránh bắt nhầm
  let sanitizedText = text;
  WHITELIST_SAFE_PHRASES.forEach((safeRegex) => {
    sanitizedText = sanitizedText.replace(safeRegex, '___SAFE_PHRASE___');
  });

  const violations: Array<{ word: string; category: string; reason: string }> = [];

  // Bước 2: Quét qua tất cả Banned Rules
  for (const rule of BANNED_PATTERNS) {
    const match = sanitizedText.match(rule.pattern);
    if (match) {
      violations.push({
        word: match[0],
        category: rule.category,
        reason: rule.reason,
      });
    }
  }

  if (violations.length === 0) {
    return { isClean: true, violations: [], severity: 'CLEAN' };
  }

  const hasCriticalBlock = violations.some((v) =>
    ['PROHIBITED_SUBSTANCE', 'WEAPON_DANGEROUS', 'ACADEMIC_DISHONESTY', 'ADULT_CONTENT', 'SCAM_GAMBLING'].includes(
      v.category
    )
  );

  return {
    isClean: false,
    violations,
    severity: hasCriticalBlock ? 'BLOCK' : 'WARN',
  };
}

/**
 * Hàm kiểm tra nhanh cho bài viết: Ném AppError nếu vi phạm
 */
export function validateProductContent(title: string, description: string, hashtags?: string[]): void {
  const combinedText = `${title || ''} ${description || ''} ${(hashtags || []).join(' ')}`;
  const result = checkContentModeration(combinedText);

  if (!result.isClean) {
    const firstViolation = result.violations[0];
    const categoryNames: Record<string, string> = {
      PROHIBITED_SUBSTANCE: 'Chất gây nghiện / Thuốc lá điện tử cấm',
      WEAPON_DANGEROUS: 'Vũ khí / Công cụ nguy hiểm',
      ACADEMIC_DISHONESTY: 'Gian lận thi cử / Học hộ / Làm thuê đồ án',
      ADULT_CONTENT: 'Nội dung người lớn / Nhạy cảm',
      SCAM_GAMBLING: 'Cờ bạc / Tài chính bất hợp pháp',
      PROFANITY_VULGAR: 'Từ ngữ thô tục / Thiếu chuẩn mực',
    };

    const categoryLabel = categoryNames[firstViolation.category] || 'Hàng cấm vi phạm quy định';

    throw new AppError(
      `Bài đăng bị từ chối do vi phạm quy chế kiểm duyệt nội dung: Phát hiện từ khóa "${firstViolation.word}" (${categoryLabel}). ${firstViolation.reason}.`,
      400,
      'PROHIBITED_CONTENT'
    );
  }
}

/**
 * Che từ ngữ thô tục bằng ký tự ***
 */
export function maskProfanity(text: string): string {
  if (!text) return text;
  let masked = text;
  for (const rule of BANNED_PATTERNS) {
    masked = masked.replace(rule.pattern, (matched) => '*'.repeat(matched.length));
  }
  return masked;
}
