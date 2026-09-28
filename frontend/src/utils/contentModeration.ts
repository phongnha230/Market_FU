/**
 * Tiện ích kiểm duyệt nội dung & Chống hàng cấm, từ ngữ thô tục trên sàn FPT MarketFU
 * Đồng bộ với chính sách kiểm duyệt của Backend
 */

export interface ContentViolation {
  word: string;
  category:
    | 'PROHIBITED_SUBSTANCE'
    | 'WEAPON_DANGEROUS'
    | 'ACADEMIC_DISHONESTY'
    | 'ADULT_CONTENT'
    | 'SCAM_GAMBLING'
    | 'PROFANITY_VULGAR';
  reason: string;
  label: string;
}

const UB_START = '(?<![\\p{L}\\p{N}])';
const UB_END = '(?![\\p{L}\\p{N}])';

const createRegex = (patternStr: string, flags = 'iu') => {
  return new RegExp(`${UB_START}(?:${patternStr})${UB_END}`, flags);
};

// Từ khóa ngoại lệ (Safe whitelist - không bắt nhầm)
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

interface RuleDef {
  pattern: RegExp;
  category: ContentViolation['category'];
  label: string;
  reason: string;
}

const MODERATION_RULES: RuleDef[] = [
  // 1. Thuốc lá điện tử, vape, chất kích thích, cần sa, ma túy
  {
    pattern: createRegex(
      'vape|pod(?:\\s*system)?|juice\\s*pod|tinh\\s*dầu\\s*vape|tinh\\s*dau\\s*vape|shisha|thuốc\\s*lá|thuoc\\s*la|cần\\s*sa|can\\s*sa|hút\\s*cần|hut\\s*can|búp\\s*cần|bup\\s*can|điếu\\s*cần|dieu\\s*can|cỏ\\s*mỹ|co\\s*my|bóng\\s*cười|bong\\s*cuoi|ma\\s*túy|ma\\s*tuy|ketamin|ecstasy|thuốc\\s*lắc|thuoc\\s*lac|kẹo\\s*lắc|keo\\s*lac|chơi\\s*ke|cắn\\s*kẹo|can\\s*keo|kẹo\\s*ke'
    ),
    category: 'PROHIBITED_SUBSTANCE',
    label: 'Chất kích thích / Thuốc lá điện tử',
    reason: 'Nghiêm cấm theo Luật phòng chống tác hại thuốc lá và Quy chế nội trú ĐH FPT',
  },
  {
    pattern: createRegex(
      'v[\\._\\-\\s]*a[\\._\\-\\s]*p[\\._\\-\\s]*e|p[\\._\\-\\s]*o[\\._\\-\\s]*d|m[\\._\\-\\s]*a\\s*t[\\._\\-\\s]*[úu][\\._\\-\\s]*y|c[\\._\\-\\s]*[ầa][\\._\\-\\s]*n\\s*s[\\._\\-\\s]*[aa]'
    ),
    category: 'PROHIBITED_SUBSTANCE',
    label: 'Chất kích thích / Thuốc lá điện tử',
    reason: 'Nghiêm cấm theo Luật phòng chống tác hại thuốc lá và Quy chế nội trú ĐH FPT',
  },

  // 2. Vũ khí, vật liệu nổ nguy hiểm
  {
    pattern: createRegex(
      'dao\\s*bấm|dao\\s*bam|dao\\s*găm|dao\\s*gam|kiếm(?:\\s*nhật)?|kiem(?:\\s*nhat)?|katana|mã\\s*tấu|ma\\s*tau|phóng\\s*lợn|phong\\s*lon|súng|sung|đạn|dan|bình\\s*xịt\\s*hơi\\s*cay|binh\\s*xit\\s*hoi\\s*cay|dùi\\s*cui|dui\\s*cui|roi\\s*điện|roi\\s*dien|chích\\s*điện|chich\\s*dien|pháo\\s*hoa|phao\\s*hoa|pháo\\s*nổ|phao\\s*no|lựu\\s*đạn|luu\\s*dan|côn\\s*nhị\\s*khúc|con\\s*nhi\\s*khuc'
    ),
    category: 'WEAPON_DANGEROUS',
    label: 'Vũ khí / Vật liệu nổ nguy hiểm',
    reason: 'Vũ khí, công cụ sát thương hoặc chất nổ bị cấm tuyệt đối tại trường',
  },

  // 3. Gian lận học thuật & Vi phạm quy chế thi FPT
  {
    pattern: createRegex(
      'thi\\s*hộ|thi\\s*ho|thi\\s*thuê|thi\\s*thue|thi\\s*giùm|thi\\s*gium|học\\s*hộ|hoc\\s*ho|học\\s*thuê|hoc\\s*thue|điểm\\s*danh\\s*hộ|diem\\s*danh\\s*ho|điểm\\s*danh\\s*thuê|diem\\s*danh\\s*thue|làm\\s*thuê\\s*đồ\\s*án|lam\\s*thue\\s*do\\s*an|làm\\s*đồ\\s*án\\s*thuê|lam\\s*do\\s*an\\s*thue|viết\\s*thuê\\s*luận\\s*văn|viet\\s*thue\\s*luan\\s*van|bán\\s*đề(?:\\s*thi)?|ban\\s*de(?:\\s*thi)?|hack\\s*điểm|hack\\s*diem|chạy\\s*điểm|chay\\s*diem|bằng\\s*giả|bang\\s*gia'
    ),
    category: 'ACADEMIC_DISHONESTY',
    label: 'Gian lận học thuật / Thi hộ',
    reason: 'Hành vi vi phạm nghiêm trọng Quy chế Đào tạo ĐH FPT (có thể bị kỷ luật buộc thôi học)',
  },

  // 4. Văn hóa phẩm đồi trụy / 18+
  {
    pattern: createRegex(
      'khiêu\\s*dâm|khieu\\s*dam|thuốc\\s*kích\\s*dục|thuoc\\s*kich\\s*duc|đồi\\s*trụy|doi\\s*truy|phim\\s*sex|clip\\s*nóng|clip\\s*nong|gái\\s*gọi|gai\\s*goi|mại\\s*dâm|mai\\s*dam|sex\\s*toy|sextoy|búp\\s*bê\\s*tình\\s*dục|bup\\s*be\\s*tinh\\s*duc'
    ),
    category: 'ADULT_CONTENT',
    label: 'Nội dung người lớn / Nhạy cảm',
    reason: 'Văn hóa phẩm đồi trụy không phù hợp với môi trường giáo dục',
  },

  // 5. Cờ bạc, cá độ, vay nặng lãi
  {
    pattern: createRegex(
      'tài\\s*xỉu|tai\\s*xiu|đánh\\s*bạc|danh\\s*bac|cá\\s*độ|ca\\s*do|bốc\\s*bát\\s*họ|boc\\s*bat\\s*ho|vay\\s*nặng\\s*lãi|vay\\s*nang\\s*lai|tiền\\s*giả|tien\\s*gia|rửa\\s*tiền|rua\\s*tien|app\\s*vay\\s*nóng|app\\s*vay\\s*nong'
    ),
    category: 'SCAM_GAMBLING',
    label: 'Cờ bạc / Tài chính bất hợp pháp',
    reason: 'Hành vi cờ bạc, lừa đảo tài chính hoặc tín dụng đen',
  },

  // 6. Từ ngữ thô tục, xúc phạm
  {
    pattern: createRegex(
      'địt|dit|lồn|lon|cặc|cac|buồi|buoi|đĩ|di|đụ\\s*má|du\\s*ma|đụ\\s*mẹ|du\\s*me|đm|dcm|vcl|vcll|vl|chó\\s*đẻ|cho\\s*de|óc\\s*chó|oc\\s*cho'
    ),
    category: 'PROFANITY_VULGAR',
    label: 'Từ ngữ thô tục / Thiếu chuẩn mực',
    reason: 'Ngôn từ xúc phạm, thiếu văn minh học đường',
  },
];

/**
 * Kiểm tra nội dung bài đăng
 */
export function checkPostModeration(
  title: string,
  description: string,
  hashtags?: string[]
): {
  isClean: boolean;
  violations: ContentViolation[];
  summaryMessage: string | null;
} {
  const combined = `${title || ''} ${description || ''} ${(hashtags || []).join(' ')}`;
  if (!combined.trim()) {
    return { isClean: true, violations: [], summaryMessage: null };
  }

  // Khử các cụm từ an toàn (safe whitelist)
  let cleanScanText = combined;
  WHITELIST_SAFE_PHRASES.forEach((safe) => {
    cleanScanText = cleanScanText.replace(safe, '___SAFE___');
  });

  const violations: ContentViolation[] = [];

  for (const rule of MODERATION_RULES) {
    const match = cleanScanText.match(rule.pattern);
    if (match) {
      // Tránh trùng lặp từ vi phạm
      const alreadyFound = violations.some(
        (v) => v.word.toLowerCase() === match[0].toLowerCase()
      );
      if (!alreadyFound) {
        violations.push({
          word: match[0],
          category: rule.category,
          label: rule.label,
          reason: rule.reason,
        });
      }
    }
  }

  if (violations.length === 0) {
    return { isClean: true, violations: [], summaryMessage: null };
  }

  const first = violations[0];
  const summaryMessage = `Nội dung chứa từ khóa vi phạm "${first.word}" (${first.label}). ${first.reason}.`;

  return {
    isClean: false,
    violations,
    summaryMessage,
  };
}
