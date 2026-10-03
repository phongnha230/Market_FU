/**
 * Bộ chuyển đổi chuẩn hóa dữ liệu giữa Mobile UI và Backend REST API / Prisma Schema
 * Tuân thủ nghiêm ngặt theo backend/prisma/schema.prisma và Zod DTOs
 */

export type BackendCampus = 'HOL' | 'HCM' | 'DAD' | 'QN' | 'CT';
export type BackendCondition = 'NEW_100' | 'LIKE_NEW_99' | 'USED_GOOD' | 'USED_FAIR';
export type BackendCategory = 'DORM_ITEM' | 'BOOKS' | 'ELECTRONICS' | 'VEHICLE' | 'CLOTHING' | 'OTHER';
export type BackendOrderType = 'MEETUP' | 'SHIP_COD';
export type BackendPaymentMethod = 'VIETQR' | 'PAYOS_WEB' | 'CASH';

/**
 * Chuyển đổi tên Campus từ hiển thị UI sang Enum chuẩn của Backend
 */
export const toBackendCampus = (campus?: string | null): BackendCampus => {
  if (!campus) return 'HOL';
  const c = campus.trim().toUpperCase();

  if (c === 'HOL' || c.includes('HÒA LẠC') || c.includes('HOA LAC') || c.includes('HÀ NỘI') || c.includes('HA NOI')) {
    return 'HOL';
  }
  if (c === 'HCM' || c.includes('HỒ CHÍ MINH') || c.includes('HO CHI MINH') || c.includes('SÀI GÒN') || c.includes('SAI GON')) {
    return 'HCM';
  }
  if (c === 'DAD' || c.includes('ĐÀ NẴNG') || c.includes('DA NANG')) {
    return 'DAD';
  }
  if (c === 'QN' || c.includes('QUY NHƠN') || c.includes('QUY NHON') || c.includes('BÌNH ĐỊNH')) {
    return 'QN';
  }
  if (c === 'CT' || c.includes('CẦN THƠ') || c.includes('CAN THO')) {
    return 'CT';
  }

  return 'HOL';
};

/**
 * Chuyển đổi Enum Backend sang tên Campus hiển thị thân thiện trên Mobile
 */
export const fromBackendCampus = (campus?: string | null): string => {
  if (!campus) return 'Hòa Lạc';
  const c = campus.trim().toUpperCase();
  switch (c) {
    case 'HOL':
      return 'Hòa Lạc';
    case 'HCM':
      return 'TP. Hồ Chí Minh';
    case 'DAD':
      return 'Đà Nẵng';
    case 'QN':
      return 'Quy Nhơn';
    case 'CT':
      return 'Cần Thơ';
    default:
      return campus;
  }
};

/**
 * Chuyển đổi tình trạng sản phẩm từ Mobile sang Enum chuẩn của Backend
 */
export const toBackendCondition = (condition?: string | null): BackendCondition => {
  if (!condition) return 'LIKE_NEW_99';
  const cond = condition.trim().toUpperCase();

  if (cond.includes('100') || cond.includes('NEW') || cond.includes('MỚI')) {
    return 'NEW_100';
  }
  if (cond.includes('99') || cond.includes('LIKE NEW') || cond.includes('NHƯ MỚI')) {
    return 'LIKE_NEW_99';
  }
  if (cond.includes('TỐT') || cond.includes('GOOD') || cond.includes('80') || cond.includes('90')) {
    return 'USED_GOOD';
  }
  if (cond.includes('CŨ') || cond.includes('FAIR') || cond.includes('TRẦY')) {
    return 'USED_FAIR';
  }

  return 'LIKE_NEW_99';
};

/**
 * Chuyển đổi Enum Backend sang tên tình trạng hiển thị thân thiện
 */
export const fromBackendCondition = (condition?: string | null): string => {
  if (!condition) return 'Like New 99%';
  const cond = condition.trim().toUpperCase();
  switch (cond) {
    case 'NEW_100':
      return 'Mới 100%';
    case 'LIKE_NEW_99':
      return 'Like New 99%';
    case 'USED_GOOD':
      return 'Đã sử dụng (Tốt)';
    case 'USED_FAIR':
      return 'Đã qua sử dụng';
    default:
      return condition;
  }
};

/**
 * Chuyển đổi danh mục sản phẩm từ Mobile sang Enum Backend
 */
export const toBackendCategory = (category?: string | null): BackendCategory => {
  if (!category) return 'OTHER';
  const cat = category.trim().toUpperCase();

  if (cat.includes('BOOK') || cat.includes('SÁCH') || cat.includes('GIÁO TRÌNH')) {
    return 'BOOKS';
  }
  if (cat.includes('ELEC') || cat.includes('ĐIỆN TỬ') || cat.includes('IT') || cat.includes('CÔNG NGHỆ') || cat.includes('PHỤ KIỆN')) {
    return 'ELECTRONICS';
  }
  if (cat.includes('DORM') || cat.includes('KTX') || cat.includes('PHÒNG TRỌ') || cat.includes('GIA DỤNG')) {
    return 'DORM_ITEM';
  }
  if (cat.includes('CLOTH') || cat.includes('THỜI TRANG') || cat.includes('ÁO') || cat.includes('QUẦN') || cat.includes('VOVINAM')) {
    return 'CLOTHING';
  }
  if (cat.includes('VEHICLE') || cat.includes('XE') || cat.includes('XE MÁY') || cat.includes('XE ĐẠP')) {
    return 'VEHICLE';
  }

  return 'OTHER';
};

/**
 * Chuyển đổi Enum Backend sang tên danh mục hiển thị
 */
export const fromBackendCategory = (category?: string | null): string => {
  if (!category) return 'Khác';
  const cat = category.trim().toUpperCase();
  switch (cat) {
    case 'BOOKS':
      return 'Sách & Giáo trình';
    case 'ELECTRONICS':
      return 'Đồ điện tử & IT';
    case 'DORM_ITEM':
      return 'Đồ dùng KTX';
    case 'CLOTHING':
      return 'Thời trang & Võ phục';
    case 'VEHICLE':
      return 'Xe cộ sinh viên';
    default:
      return 'Đồ dùng khác';
  }
};

/**
 * Chuẩn hóa phương thức thanh toán sang enum backend
 */
export const toBackendPaymentMethod = (method?: string | null): BackendPaymentMethod => {
  if (!method) return 'VIETQR';
  const m = method.trim().toUpperCase();
  if (m === 'CASH' || m.includes('TIỀN MẶT') || m.includes('HANDSHAKE')) {
    return 'CASH';
  }
  if (m === 'PAYOS' || m.includes('PAYOS_WEB')) {
    return 'PAYOS_WEB';
  }
  return 'VIETQR';
};

/**
 * Sinh mã OTP Safe-Point 4 chữ số chuẩn Backend (1000 - 9999)
 */
export const generate4DigitOtp = (): string => {
  return String(Math.floor(1000 + Math.random() * 9000));
};
