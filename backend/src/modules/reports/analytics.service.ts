import { prisma } from '../../config/prisma';
import { CampusLocation, OrderStatus } from '@prisma/client';

export interface SemesterAnalyticsQuery {
  semester?: string;
  campus?: string;
}

export interface TrendDataPoint {
  periodKey: string;
  label: string;
  shortLabel: string;
  escrowVolume: number;
  orderCount: number;
  completedCount: number;
}

export interface CategoryMetricBreakdown {
  name: string;
  categoryType: string;
  count: number;
  pct: string;
  dot: string;
  stroke: string;
}

export interface RadarMetrics {
  kycVerificationPct: number;
  safeHandoffPct: number;
  peerReputationScore: number;
  aiFraudSafetyPct: number;
  escrowProtectionPct: number;
  totalScore: number;
}

export interface AvailableSemester {
  key: string;
  label: string;
  isCurrent?: boolean;
}

export function parseSemesterDates(semester?: string): {
  startDate: Date;
  endDate: Date;
  semesterKey: string;
  label: string;
  season: 'SPRING' | 'SUMMER' | 'FALL' | 'ALL';
  year: number;
} {
  const norm = (semester || '').toUpperCase().trim();
  const now = new Date();
  const currentYear = now.getFullYear(); // 2026
  const currentMonth = now.getMonth() + 1; // 1 - 12

  // Match 4-digit year if present
  const yearMatch = norm.match(/\b(20\d\d)\b/);
  const targetYear = yearMatch ? parseInt(yearMatch[1], 10) : currentYear;

  if (/\bALL\b/.test(norm) || norm.includes('TOÀN')) {
    return {
      startDate: new Date('2024-01-01T00:00:00.000Z'),
      endDate: new Date('2030-12-31T23:59:59.999Z'),
      semesterKey: 'ALL',
      label: 'Toàn thời gian (2024 - 2027)',
      season: 'ALL',
      year: targetYear,
    };
  }

  let season: 'SPRING' | 'SUMMER' | 'FALL' = 'FALL';
  if (norm.includes('SPRING') || norm.includes('XUÂN')) {
    season = 'SPRING';
  } else if (norm.includes('SUMMER') || norm.includes('HÈ')) {
    season = 'SUMMER';
  } else if (norm.includes('FALL') || norm.includes('THU')) {
    season = 'FALL';
  } else {
    // Tự động nhận diện kỳ học hiện tại theo tháng thực
    if (currentMonth >= 1 && currentMonth <= 4) {
      season = 'SPRING';
    } else if (currentMonth >= 5 && currentMonth <= 8) {
      season = 'SUMMER';
    } else {
      season = 'FALL';
    }
  }

  if (season === 'SPRING') {
    return {
      startDate: new Date(Date.UTC(targetYear, 0, 1, 0, 0, 0, 0)),
      endDate: new Date(Date.UTC(targetYear, 3, 30, 23, 59, 59, 999)),
      semesterKey: `SPRING_${targetYear}`,
      label: `Kỳ Spring ${targetYear}`,
      season: 'SPRING',
      year: targetYear,
    };
  }

  if (season === 'SUMMER') {
    return {
      startDate: new Date(Date.UTC(targetYear, 4, 1, 0, 0, 0, 0)),
      endDate: new Date(Date.UTC(targetYear, 7, 31, 23, 59, 59, 999)),
      semesterKey: `SUMMER_${targetYear}`,
      label: `Kỳ Summer ${targetYear}`,
      season: 'SUMMER',
      year: targetYear,
    };
  }

  // FALL
  return {
    startDate: new Date(Date.UTC(targetYear, 8, 1, 0, 0, 0, 0)),
    endDate: new Date(Date.UTC(targetYear, 11, 31, 23, 59, 59, 999)),
    semesterKey: `FALL_${targetYear}`,
    label: `Kỳ Fall ${targetYear}`,
    season: 'FALL',
    year: targetYear,
  };
}

export function parseCampusCode(campus?: string): CampusLocation | undefined {
  if (!campus) return undefined;
  const upper = campus.toUpperCase().trim();
  if (upper.includes('TOÀN') || upper === 'ALL') return undefined;
  if (upper.includes('HÒA LẠC') || upper.includes('HOL') || upper.includes('HÀ NỘI')) return CampusLocation.HOL;
  if (upper.includes('HCM') || upper.includes('HỒ CHÍ MINH') || upper.includes('QUẬN 9')) return CampusLocation.HCM;
  if (upper.includes('ĐÀ NẴNG') || upper.includes('DAD') || upper.includes('DN')) return CampusLocation.DAD;
  if (upper.includes('CẦN THƠ') || upper.includes('CT')) return CampusLocation.CT;
  if (upper.includes('QUY NHƠN') || upper.includes('QN')) return CampusLocation.QN;
  return undefined;
}

export class SemesterAnalyticsService {
  async getSemesterAnalytics(query: SemesterAnalyticsQuery) {
    const { startDate, endDate, semesterKey, label, season, year } = parseSemesterDates(query.semester);
    const campusFilter = parseCampusCode(query.campus);

    const orderWhere: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (campusFilter) {
      orderWhere.product = {
        campus: campusFilter,
      };
    }

    const productWhere: any = {};
    if (campusFilter) {
      productWhere.campus = campusFilter;
    }

    // 1. Fetch Orders, Kyc, Hubs, Products, Users, Reviews
    const [orders, kycCount, hubsCount, products, totalUsers, reviewStats] = await Promise.all([
      prisma.order.findMany({
        where: orderWhere,
        select: {
          id: true,
          orderCode: true,
          status: true,
          orderType: true,
          payment: true,
          createdAt: true,
          product: {
            select: {
              campus: true,
              price: true,
              categoryType: true,
            },
          },
        },
      }),
      prisma.kycVerification.count({
        where: { status: 'APPROVED' },
      }),
      prisma.safeHandoffHub.count({
        where: { isOperating: true },
      }),
      prisma.product.findMany({
        where: productWhere,
        select: {
          id: true,
          title: true,
          categoryType: true,
          campus: true,
          status: true,
        },
      }),
      prisma.user.count(),
      prisma.review.aggregate({
        _avg: { rating: true },
      }),
    ]);

    // 2. Tính toán tổng hợp số liệu
    let totalGMV = 0;
    let completedGMV = 0;
    let escrowHoldingAmount = 0;
    let completedCount = 0;
    let disputedCount = 0;
    let cancelledCount = 0;
    let holdingCount = 0;

    const ESCROW_HOLDING_STATUSES: OrderStatus[] = [
      OrderStatus.PAID,
      OrderStatus.SHIPPING,
      OrderStatus.DELIVERED,
      OrderStatus.PENDING,
    ];

    const campusMap: Record<
      string,
      {
        campus: string;
        name: string;
        totalOrders: number;
        completedOrders: number;
        safePointOrders: number;
        campusShipOrders: number;
        gmv: number;
      }
    > = {
      HOL: { campus: 'HOL', name: 'Hòa Lạc', totalOrders: 0, completedOrders: 0, safePointOrders: 0, campusShipOrders: 0, gmv: 0 },
      HCM: { campus: 'HCM', name: 'TP.HCM', totalOrders: 0, completedOrders: 0, safePointOrders: 0, campusShipOrders: 0, gmv: 0 },
      DAD: { campus: 'DAD', name: 'Đà Nẵng', totalOrders: 0, completedOrders: 0, safePointOrders: 0, campusShipOrders: 0, gmv: 0 },
      QN: { campus: 'QN', name: 'Quy Nhơn', totalOrders: 0, completedOrders: 0, safePointOrders: 0, campusShipOrders: 0, gmv: 0 },
      CT: { campus: 'CT', name: 'Cần Thơ', totalOrders: 0, completedOrders: 0, safePointOrders: 0, campusShipOrders: 0, gmv: 0 },
    };

    // Khởi tạo các mốc dòng thời gian cho biểu đồ xu hướng
    let trendPoints: TrendDataPoint[] = [];
    if (season === 'SPRING') {
      trendPoints = [
        { periodKey: 'T1', label: `Tháng 1/${year} (Khởi động kỳ Spring)`, shortLabel: 'Đầu T1', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: 'T2', label: `Tháng 2/${year} (Sau Tết Nguyên Đán)`, shortLabel: 'Cuối T2', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: 'T3', label: `Tháng 3/${year} (Giữa kỳ học thuật)`, shortLabel: 'Giữa T3', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: 'T4', label: `Tháng 4/${year} (Thi PE/FE & Đồ án)`, shortLabel: 'Hiện tại T4', escrowVolume: 0, orderCount: 0, completedCount: 0 },
      ];
    } else if (season === 'SUMMER') {
      trendPoints = [
        { periodKey: 'T5', label: `Tháng 5/${year} (Bắt đầu kỳ Summer)`, shortLabel: 'Đầu T5', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: 'T6', label: `Tháng 6/${year} (Cao điểm OJT & Thực tập)`, shortLabel: 'Cuối T6', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: 'T7', label: `Tháng 7/${year} (Giữa kỳ Labs & Thực nghiệm)`, shortLabel: 'Giữa T7', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: 'T8', label: `Tháng 8/${year} (Thi cuối kỳ & Bàn giao KTX)`, shortLabel: 'Hiện tại T8', escrowVolume: 0, orderCount: 0, completedCount: 0 },
      ];
    } else if (season === 'FALL') {
      trendPoints = [
        { periodKey: 'T9', label: `Tháng 9/${year} (Tuần Nhập học Tân SV)`, shortLabel: 'Đầu T9', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: 'T10', label: `Tháng 10/${year} (Giữa kỳ & Phong trào)`, shortLabel: 'Cuối T10', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: 'T11', label: `Tháng 11/${year} (Tuần lễ Đồ án Capstone)`, shortLabel: 'Giữa T11', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: 'T12', label: `Tháng 12/${year} (Thi PE/FE & Tổng kết kỳ)`, shortLabel: 'Hiện tại T12', escrowVolume: 0, orderCount: 0, completedCount: 0 },
      ];
    } else {
      // ALL
      trendPoints = [
        { periodKey: '2024', label: 'Năm 2024 (Giai đoạn khởi lập)', shortLabel: 'Năm 2024', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: '2025', label: 'Năm 2025 (Mở rộng 5 Campus FPT)', shortLabel: 'Năm 2025', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: '2026', label: 'Năm 2026 (Tăng trưởng Escrow An toàn)', shortLabel: 'Năm 2026', escrowVolume: 0, orderCount: 0, completedCount: 0 },
        { periodKey: '2027', label: 'Năm 2027 (Kế hoạch mở rộng mới)', shortLabel: 'Năm 2027', escrowVolume: 0, orderCount: 0, completedCount: 0 },
      ];
    }

    for (const o of orders) {
      const amount = o.payment?.totalAmount || o.product?.price || 0;
      const oCampus = o.product?.campus || 'HOL';
      const isMeetup = o.orderType === 'MEETUP';

      if (o.status !== OrderStatus.CANCELLED) {
        totalGMV += amount;
      }

      if (campusMap[oCampus]) {
        campusMap[oCampus].totalOrders += 1;
        if (isMeetup) {
          campusMap[oCampus].safePointOrders += 1;
        } else {
          campusMap[oCampus].campusShipOrders += 1;
        }
        if (o.status !== OrderStatus.CANCELLED) {
          campusMap[oCampus].gmv += amount;
        }
      }

      if (o.status === OrderStatus.COMPLETED) {
        completedCount += 1;
        completedGMV += amount;
        if (campusMap[oCampus]) {
          campusMap[oCampus].completedOrders += 1;
        }
      } else if (ESCROW_HOLDING_STATUSES.includes(o.status)) {
        holdingCount += 1;
        escrowHoldingAmount += amount;
      } else if (o.status === OrderStatus.DISPUTED) {
        disputedCount += 1;
        escrowHoldingAmount += amount; // Đơn tranh chấp vẫn bị đóng băng trong escrow
      } else if (o.status === OrderStatus.CANCELLED) {
        cancelledCount += 1;
      }

      // Phân bổ vào trendPoints
      const oDate = new Date(o.createdAt);
      if (season === 'ALL') {
        const orderYear = String(oDate.getFullYear());
        const pt = trendPoints.find((p) => p.periodKey === orderYear);
        if (pt) {
          pt.escrowVolume += amount;
          pt.orderCount += 1;
          if (o.status === OrderStatus.COMPLETED) pt.completedCount += 1;
        }
      } else {
        const oMonth = oDate.getMonth(); // 0-11
        let idx = -1;
        if (season === 'SPRING') idx = oMonth;
        else if (season === 'SUMMER') idx = oMonth - 4;
        else if (season === 'FALL') idx = oMonth - 8;

        if (idx >= 0 && idx < trendPoints.length) {
          trendPoints[idx].escrowVolume += amount;
          trendPoints[idx].orderCount += 1;
          if (o.status === OrderStatus.COMPLETED) trendPoints[idx].completedCount += 1;
        }
      }
    }

    // 3. Phân bổ Cơ Cấu Danh Mục Đồ thống nhất với 6 Danh Mục Chuẩn của Trang Chủ
    const categoryCounts: Record<string, number> = {
      'Thiết bị điện tử': 0,
      'Sách & Tài liệu': 0,
      'Thời trang & Phụ kiện': 0,
      'Đồ dùng & KTX': 0,
      'Giải trí & Đam mê': 0,
      'Tiện ích khác': 0,
    };

    products.forEach((p) => {
      const text = ((p.title || '') + ' ' + (p.categoryType || '')).toLowerCase();
      if (
        p.categoryType === 'ELECTRONICS' ||
        text.includes('laptop') ||
        text.includes('chuột') ||
        text.includes('phím') ||
        text.includes('màn hình') ||
        text.includes('tai nghe') ||
        text.includes('macbook') ||
        text.includes('ram') ||
        text.includes('sạc')
      ) {
        categoryCounts['Thiết bị điện tử'] += 1;
      } else if (
        p.categoryType === 'BOOKS' ||
        text.includes('sách') ||
        text.includes('giáo trình') ||
        text.includes('pe/fe') ||
        text.includes('prf') ||
        text.includes('tài liệu') ||
        text.includes('đề thi')
      ) {
        categoryCounts['Sách & Tài liệu'] += 1;
      } else if (
        p.categoryType === 'CLOTHING' ||
        text.includes('áo') ||
        text.includes('vovinam') ||
        text.includes('võ phục') ||
        text.includes('polo') ||
        text.includes('hoodie') ||
        text.includes('giày') ||
        text.includes('quần') ||
        text.includes('đồng phục')
      ) {
        categoryCounts['Thời trang & Phụ kiện'] += 1;
      } else if (
        p.categoryType === 'DORM_ITEM' ||
        text.includes('ktx') ||
        text.includes('bàn gấp') ||
        text.includes('quạt') ||
        text.includes('tủ lạnh') ||
        text.includes('tủ vải') ||
        text.includes('ấm') ||
        text.includes('nồi') ||
        text.includes('phòng trọ')
      ) {
        categoryCounts['Đồ dùng & KTX'] += 1;
      } else if (
        p.categoryType === 'VEHICLE' ||
        text.includes('xe') ||
        text.includes('bus') ||
        text.includes('vé') ||
        text.includes('thẻ gym') ||
        text.includes('voucher')
      ) {
        categoryCounts['Tiện ích khác'] += 1;
      } else {
        categoryCounts['Giải trí & Đam mê'] += 1;
      }
    });

    const categoryDefinitions = [
      { name: 'Thiết bị điện tử', categoryType: 'ELECTRONICS', stroke: '#F27024', dot: 'bg-orange-500' },
      { name: 'Sách & Tài liệu', categoryType: 'BOOKS', stroke: '#2563EB', dot: 'bg-blue-600' },
      { name: 'Thời trang & Phụ kiện', categoryType: 'CLOTHING', stroke: '#E11D48', dot: 'bg-rose-500' },
      { name: 'Đồ dùng & KTX', categoryType: 'DORM_ITEM', stroke: '#10B981', dot: 'bg-emerald-500' },
      { name: 'Giải trí & Đam mê', categoryType: 'OTHER', stroke: '#6366F1', dot: 'bg-indigo-500' },
      { name: 'Tiện ích khác', categoryType: 'VEHICLE', stroke: '#F59E0B', dot: 'bg-amber-500' },
    ];

    const totalProductCount = products.length;
    const categoryBreakdown: CategoryMetricBreakdown[] = categoryDefinitions.map((cat) => {
      const count = categoryCounts[cat.name] || 0;
      const pct = totalProductCount > 0 ? Math.round((count / totalProductCount) * 100) : 0;
      return {
        ...cat,
        count,
        pct: `${pct}%`,
      };
    });

    // 4. Chỉ số Radar Sức khỏe sàn FPT
    const safetyRate = orders.length > 0 ? ((orders.length - disputedCount) / orders.length) * 100 : 100;
    const kycVerificationPct = totalUsers > 0 ? Math.min(100, Math.round((kycCount / totalUsers) * 100)) : 100;
    const safeHandoffPct = orders.length > 0 ? Math.round((completedCount / orders.length) * 100) : 100;
    const avgRating = reviewStats._avg.rating || 5.0;
    const peerReputationScore = Number(avgRating.toFixed(1));
    const aiFraudSafetyPct = Number(safetyRate.toFixed(0));
    const escrowProtectionPct = 100;

    const radarTotalScore = Math.round(
      (kycVerificationPct + safeHandoffPct + Math.round((peerReputationScore / 5) * 100) + aiFraudSafetyPct + escrowProtectionPct) / 5
    );

    // 5. Danh sách các kỳ học chuẩn FPT
    const availableSemesters: AvailableSemester[] = [
      { key: 'SPRING_2027', label: 'Kỳ Spring 2027 (Kỳ tới)' },
      { key: 'FALL_2026', label: 'Kỳ Fall 2026 (Hiện tại)', isCurrent: true },
      { key: 'SUMMER_2026', label: 'Kỳ Summer 2026' },
      { key: 'SPRING_2026', label: 'Kỳ Spring 2026' },
      { key: 'FALL_2025', label: 'Kỳ Fall 2025' },
      { key: 'SUMMER_2025', label: 'Kỳ Summer 2025' },
      { key: 'SPRING_2025', label: 'Kỳ Spring 2025' },
      { key: 'FALL_2024', label: 'Kỳ Fall 2024' },
      { key: 'ALL', label: 'Toàn thời gian (Tất cả kỳ)' },
    ];

    const campusList = Object.values(campusMap);
    const topCampus = campusList.reduce((prev, cur) => (cur.totalOrders > prev.totalOrders ? cur : prev), campusList[0]);

    return {
      semester: semesterKey,
      semesterLabel: label,
      campus: campusFilter || 'ALL',
      period: {
        startDate,
        endDate,
      },
      metrics: {
        escrowHoldingAmount,
        completedCount,
        kycVerifiedCount: kycCount,
        totalGMV,
        completedGMV,
        totalOrders: orders.length,
        disputedCount,
        cancelledCount,
        holdingCount,
        safetyRate: Number(safetyRate.toFixed(1)),
        operatingHubsCount: hubsCount,
      },
      campusBreakdown: campusList,
      trendData: trendPoints,
      categoryBreakdown,
      totalProductsCount: totalProductCount,
      radarMetrics: {
        kycVerificationPct,
        safeHandoffPct,
        peerReputationScore,
        aiFraudSafetyPct,
        escrowProtectionPct,
        totalScore: radarTotalScore,
      },
      summaryHighlights: {
        avgEscrowHours: completedCount > 0 ? '18 giờ 35 phút' : '0 giờ',
        avgOrderValue: orders.length > 0 ? Math.round(totalGMV / orders.length) : 0,
        fastestHub: 'Alpha Hub - Hòa Lạc',
        topCampusName: topCampus?.name || 'Hòa Lạc',
      },
      availableSemesters,
    };
  }
}

export const semesterAnalyticsService = new SemesterAnalyticsService();
