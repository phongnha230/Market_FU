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
export const toBackendCampus = (campus?: string | null): BackendCampus | undefined => {
  if (!campus) return undefined;
  const c = campus.trim().toUpperCase();

  if (c === 'ALL' || c.includes('TẤT CẢ') || c.includes('TAT CA') || c.includes('TOÀN QUỐC')) {
    return undefined;
  }
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

  return undefined;
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
export const toBackendCategory = (category?: string | null): BackendCategory | undefined => {
  if (!category) return undefined;
  const cat = category.trim().toUpperCase();

  if (cat === 'ALL' || cat === 'TẤT CẢ' || cat === 'TAT CA' || cat === 'OTHER') {
    return undefined;
  }
  if (cat.includes('BOOK') || cat.includes('SÁCH') || cat.includes('GIÁO TRÌNH')) {
    return 'BOOKS';
  }
  if (cat.includes('ELEC') || cat.includes('ĐIỆN TỬ') || cat.includes('IT') || cat.includes('CÔNG NGHỆ') || cat.includes('PHỤ KIỆN')) {
    return 'ELECTRONICS';
  }
  if (cat.includes('DORM') || cat.includes('KTX') || cat.includes('PHÒNG TRỌ') || cat.includes('GIA DỤNG') || cat.includes('DOM')) {
    return 'DORM_ITEM';
  }
  if (cat.includes('CLOTH') || cat.includes('THỜI TRANG') || cat.includes('ÁO') || cat.includes('QUẦN') || cat.includes('VOVINAM')) {
    return 'CLOTHING';
  }
  if (cat.includes('VEHICLE') || cat.includes('XE') || cat.includes('XE MÁY') || cat.includes('XE ĐẠP')) {
    return 'VEHICLE';
  }

  return undefined;
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

/**
 * Kiểm tra xem một sản phẩm có khớp với danh mục được chọn hay không
 */
export const isProductInCategory = (
  product: {
    category?: string;
    categoryType?: string;
    title?: string;
    description?: string;
    hashtags?: string[];
    badge?: string;
    price?: number | string;
    originalPrice?: number | string;
  },
  selectedCategoryId: string
): boolean => {
  if (!selectedCategoryId || selectedCategoryId === 'ALL' || selectedCategoryId === 'all') {
    return true;
  }

  let catKey = String(selectedCategoryId).toLowerCase().trim();
  if (catKey.includes('sách') || catKey.includes('sach') || catKey.includes('giáo trình') || catKey.includes('giao trinh')) {
    catKey = '1';
  } else if (catKey.includes('laptop') || catKey.includes('phụ kiện') || catKey.includes('phu kien') || catKey.includes('điện tử') || catKey.includes('máy tính')) {
    catKey = '2';
  } else if (catKey.includes('đồ dùng') || catKey.includes('do dung') || catKey.includes('ktx') || catKey.includes('phòng trọ') || catKey.includes('gia dụng')) {
    catKey = '3';
  } else if (catKey.includes('võ phục') || catKey.includes('vo phuc') || catKey.includes('vovinam') || catKey.includes('đồng phục')) {
    catKey = '4';
  } else if (catKey.includes('gấp') || catKey.includes('gap') || catKey.includes('urgent') || catKey.includes('thanh lý')) {
    catKey = '5';
  }

  const rawCat = (product.category || '').toLowerCase();
  const rawType = (product.categoryType || '').toUpperCase();
  const title = (product.title || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const tags = (product.hashtags || []).map((t) => t.toLowerCase()).join(' ');
  const text = `${title} ${desc} ${tags}`;

  // 1. Sách & Giáo trình (id: '1' hoặc 'books')
  if (catKey === '1' || catKey === 'books' || catKey === 'BOOKS') {
    if (rawCat === 'books' || rawType === 'BOOKS') return true;
    if (
      text.includes('sách') ||
      text.includes('sach') ||
      text.includes('giáo trình') ||
      text.includes('giao trinh') ||
      text.includes('slide') ||
      text.includes('đề thi') ||
      text.includes('de thi') ||
      /\b(mas291|prf192|csd201|csi104|ssg104|swe201|mad101|osg202|mae101|cea201|nwc203)\b/.test(text)
    ) {
      return true;
    }
    return false;
  }

  // 2. Laptop & Phụ kiện / Đồ điện tử (id: '2' hoặc 'it' hoặc 'electronics')
  if (
    catKey === '2' ||
    catKey === 'it' ||
    catKey === 'electronics' ||
    catKey === 'ELECTRONICS'
  ) {
    const isFurniture =
      (text.includes('bàn học') ||
        text.includes('ban hoc') ||
        text.includes('bàn làm việc') ||
        text.includes('bàn gỗ') ||
        text.includes('tủ lạnh') ||
        text.includes('tu lanh') ||
        text.includes('quạt') ||
        text.includes('quat') ||
        text.includes('nệm') ||
        text.includes('đệm')) &&
      !text.includes('bàn phím') &&
      !text.includes('ban phim');

    if (isFurniture && rawType !== 'ELECTRONICS' && rawCat !== 'it' && rawCat !== 'electronics') {
      return false;
    }

    if (rawCat === 'it' || rawCat === 'electronics' || rawType === 'ELECTRONICS') {
      return !isFurniture;
    }

    const isTech =
      text.includes('laptop') ||
      text.includes('máy tính') ||
      text.includes('may tinh') ||
      text.includes('macbook') ||
      text.includes('ultrabook') ||
      text.includes('thinkpad') ||
      text.includes('lenovo') ||
      text.includes('dell') ||
      text.includes('asus') ||
      text.includes('acer') ||
      text.includes('hp') ||
      text.includes('chuột') ||
      text.includes('chuot') ||
      text.includes('bàn phím') ||
      text.includes('ban phim') ||
      text.includes('phím cơ') ||
      text.includes('phim co') ||
      text.includes('tai nghe') ||
      text.includes('headphone') ||
      text.includes('màn hình') ||
      text.includes('man hinh') ||
      text.includes('ram') ||
      text.includes('ssd') ||
      text.includes('ổ cứng') ||
      text.includes('o cung') ||
      text.includes('sạc') ||
      text.includes('sac') ||
      text.includes('cáp') ||
      text.includes('cap') ||
      text.includes('akko') ||
      text.includes('logitech') ||
      text.includes('razer') ||
      text.includes('dareu') ||
      text.includes('ipad') ||
      text.includes('airpods');

    return isTech && !isFurniture;
  }

  // 3. Đồ dùng KTX & Gia dụng (id: '3' hoặc 'dom' hoặc 'dorm' hoặc 'DORM_ITEM')
  if (
    catKey === '3' ||
    catKey === 'dom' ||
    catKey === 'dorm' ||
    catKey === 'DORM_ITEM'
  ) {
    if (rawCat === 'dom' || rawCat === 'dorm' || rawType === 'DORM_ITEM') return true;
    if (
      text.includes('ktx') ||
      text.includes('phòng trọ') ||
      text.includes('phong tro') ||
      text.includes('tủ lạnh') ||
      text.includes('tu lanh') ||
      text.includes('bàn học') ||
      text.includes('ban hoc') ||
      text.includes('bàn làm việc') ||
      text.includes('ban lam viec') ||
      text.includes('bàn gấp') ||
      text.includes('ban gap') ||
      text.includes('giá sách') ||
      text.includes('gia sach') ||
      text.includes('quạt') ||
      text.includes('quat') ||
      text.includes('đệm') ||
      text.includes('dem') ||
      text.includes('nệm') ||
      text.includes('tủ vải') ||
      text.includes('tu vai') ||
      text.includes('ấm siêu tốc') ||
      text.includes('am sieu toc') ||
      text.includes('nồi') ||
      text.includes('noi') ||
      text.includes('bếp') ||
      text.includes('bep') ||
      text.includes('ghế') ||
      text.includes('ghe') ||
      text.includes('kệ') ||
      text.includes('ke') ||
      text.includes('cooltech') ||
      text.includes('aqua') ||
      text.includes('lock&lock')
    ) {
      return true;
    }
    return false;
  }

  // 4. Võ phục Vovinam / Thời trang (id: '4' hoặc 'vovinam' hoặc 'clothing' hoặc 'CLOTHING')
  if (
    catKey === '4' ||
    catKey === 'vovinam' ||
    catKey === 'clothing' ||
    catKey === 'CLOTHING'
  ) {
    if (rawCat === 'vovinam' || rawCat === 'clothing' || rawType === 'CLOTHING') return true;
    if (
      text.includes('vovinam') ||
      text.includes('võ phục') ||
      text.includes('vo phuc') ||
      text.includes('áo') ||
      text.includes('ao') ||
      text.includes('quần') ||
      text.includes('quan') ||
      text.includes('đồng phục') ||
      text.includes('dong phuc') ||
      text.includes('polo') ||
      text.includes('hoodie') ||
      text.includes('đai') ||
      text.includes('dai') ||
      text.includes('thời trang') ||
      text.includes('thoi trang')
    ) {
      return true;
    }
    return false;
  }

  // 5. Pass đồ gấp (id: '5' hoặc 'urgent' hoặc 'gap')
  if (
    catKey === '5' ||
    catKey === 'urgent' ||
    catKey === 'gap'
  ) {
    const badge = (product.badge || '').toLowerCase();
    if (badge.includes('gấp') || badge.includes('gap')) return true;
    if (
      tags.includes('#gap') ||
      tags.includes('#passgap') ||
      text.includes('gấp') ||
      text.includes('gap') ||
      text.includes('pass nhanh') ||
      text.includes('thanh lý gấp') ||
      text.includes('bán gấp')
    ) {
      return true;
    }
    return false;
  }

  // 6. Phương tiện đi lại (id: '6' hoặc 'vehicle' hoặc 'VEHICLE')
  if (
    selectedCategoryId === '6' ||
    selectedCategoryId === 'vehicle' ||
    selectedCategoryId === 'VEHICLE'
  ) {
    if (rawCat === 'vehicle' || rawType === 'VEHICLE') return true;
    if (
      text.includes('xe máy') ||
      text.includes('xe may') ||
      text.includes('xe đạp') ||
      text.includes('xe dap') ||
      text.includes('xe điện') ||
      text.includes('xe dien') ||
      text.includes('mũ bảo hiểm')
    ) {
      return true;
    }
    return false;
  }

  // Fallback so khớp theo slug hoặc id chung
  if (rawCat && rawCat === selectedCategoryId.toLowerCase()) return true;
  if (rawType && rawType === selectedCategoryId.toUpperCase()) return true;

  return false;
};
