import { CampusLocation, OrderType } from '@prisma/client';

export interface ShippingCalculationResult {
  shippingFee: number;
  estimatedDays: string;
  routeTitle: string;
  transitHub: string;
  trackingSteps: { title: string; desc: string }[];
}

// Bảng ma trận cước phí 5x5 giữa 5 campus FPT (Đơn vị: VNĐ)
export const CAMPUS_RATES: Record<
  CampusLocation,
  Record<CampusLocation, { fee: number; days: string; hub: string }>
> = {
  HOL: {
    HOL: { fee: 10000, days: 'Giao trong ngày', hub: 'Nội bộ KTX Hòa Lạc' },
    DAD: { fee: 30000, days: '1 - 2 ngày', hub: 'Hub Trung tâm Đà Nẵng' },
    QN:  { fee: 35000, days: '2 - 3 ngày', hub: 'Hub Nam Trung Bộ (Bình Định)' },
    HCM: { fee: 40000, days: '2 - 3 ngày', hub: 'Hub Sài Gòn (Khu CNC Q.9)' },
    CT:  { fee: 45000, days: '3 - 4 ngày', hub: 'Hub Tây Nam Bộ (Cần Thơ)' },
  },
  DAD: {
    HOL: { fee: 30000, days: '1 - 2 ngày', hub: 'Hub Nội Bài - Hòa Lạc' },
    DAD: { fee: 10000, days: 'Giao trong ngày', hub: 'Nội bộ Campus Đà Nẵng' },
    QN:  { fee: 20000, days: '1 ngày', hub: 'Tuyến xe liên tỉnh Đà Nẵng - Quy Nhơn' },
    HCM: { fee: 30000, days: '1 - 2 ngày', hub: 'Hub Sài Gòn (Khu CNC Q.9)' },
    CT:  { fee: 35000, days: '2 - 3 ngày', hub: 'Hub Tây Nam Bộ (Cần Thơ)' },
  },
  QN: {
    HOL: { fee: 35000, days: '2 - 3 ngày', hub: 'Hub Nội Bài - Hòa Lạc' },
    DAD: { fee: 20000, days: '1 ngày', hub: 'Tuyến xe liên tỉnh Quy Nhơn - Đà Nẵng' },
    QN:  { fee: 10000, days: 'Giao trong ngày', hub: 'Nội bộ Campus An Phú Thịnh' },
    HCM: { fee: 25000, days: '1 - 2 ngày', hub: 'Hub Sài Gòn (Khu CNC Q.9)' },
    CT:  { fee: 30000, days: '2 ngày', hub: 'Hub Tây Nam Bộ (Cần Thơ)' },
  },
  HCM: {
    HOL: { fee: 40000, days: '2 - 3 ngày', hub: 'Hub Nội Bài - Hòa Lạc' },
    DAD: { fee: 30000, days: '1 - 2 ngày', hub: 'Hub Trung tâm Đà Nẵng' },
    QN:  { fee: 25000, days: '1 - 2 ngày', hub: 'Hub Nam Trung Bộ (Bình Định)' },
    HCM: { fee: 10000, days: 'Giao trong ngày', hub: 'Nội bộ KTX Q.9' },
    CT:  { fee: 20000, days: '1 ngày', hub: 'Tuyến xe cao tốc Trung Lương - Cần Thơ' },
  },
  CT: {
    HOL: { fee: 45000, days: '3 - 4 ngày', hub: 'Hub Nội Bài - Hòa Lạc' },
    DAD: { fee: 35000, days: '2 - 3 ngày', hub: 'Hub Trung tâm Đà Nẵng' },
    QN:  { fee: 30000, days: '2 ngày', hub: 'Hub Nam Trung Bộ (Bình Định)' },
    HCM: { fee: 20000, days: '1 ngày', hub: 'Hub Sài Gòn (Khu CNC Q.9)' },
    CT:  { fee: 10000, days: 'Giao trong ngày', hub: 'Nội bộ Campus Cần Thơ' },
  },
};

export const CAMPUS_NAMES: Record<CampusLocation, string> = {
  HOL: 'Hòa Lạc (Hà Nội)',
  DAD: 'Đà Nẵng',
  QN: 'Quy Nhơn',
  HCM: 'TP. Hồ Chí Minh',
  CT: 'Cần Thơ',
};

/**
 * Tính toán cước phí và lộ trình chuyển phát chuẩn hóa giữa 5 campus FPT
 */
export function calculateShippingFee(params: {
  orderType: OrderType;
  fromCampus: CampusLocation;
  toCampus?: CampusLocation;
}): ShippingCalculationResult {
  const { orderType, fromCampus, toCampus = fromCampus } = params;

  // 1. Nếu là gặp trực tiếp Safe Handoff tại điểm hẹn nội bộ trường -> Miễn phí 100%
  if (orderType === 'MEETUP') {
    return {
      shippingFee: 0,
      estimatedDays: 'Hẹn gặp trực tiếp',
      routeTitle: `Safe Handoff nội bộ ${CAMPUS_NAMES[fromCampus]}`,
      transitHub: 'Quầy điều phối Campus',
      trackingSteps: [
        { title: 'Tạo đơn hẹn', desc: 'Thống nhất điểm hẹn an toàn' },
        { title: 'Có mặt tại Safe Point', desc: 'Sảnh Alpha / Thư viện / Bàn test IT' },
        { title: 'Quét mã QR Handshake', desc: 'Xác thực nhận đồ và tất toán' },
      ],
    };
  }

  // 2. Tra cứu cước phí theo ma trận liên cơ sở
  const matrix = CAMPUS_RATES[fromCampus]?.[toCampus] || {
    fee: 30000,
    days: '2 - 3 ngày',
    hub: 'FPT Central Hub',
  };

  const isSameCampus = fromCampus === toCampus;
  const routeTitle = isSameCampus
    ? `Chuyển phát nội bộ KTX ${CAMPUS_NAMES[fromCampus]}`
    : `Tuyến FPT Express Hub (${CAMPUS_NAMES[fromCampus]} ➔ ${CAMPUS_NAMES[toCampus]})`;

  return {
    shippingFee: matrix.fee,
    estimatedDays: matrix.days,
    routeTitle,
    transitHub: matrix.hub,
    trackingSteps: [
      { title: 'Bưu cục KTX tiếp nhận', desc: `Tiếp nhận tại ${CAMPUS_NAMES[fromCampus]}` },
      { title: 'Đóng thùng niêm phong', desc: 'Bọc xốp chống sốc đồ sinh viên' },
      { title: 'Trung chuyển qua Hub', desc: matrix.hub },
      { title: 'Phát tới KTX người nhận', desc: `Bàn giao tại ${CAMPUS_NAMES[toCampus]}` },
    ],
  };
}
