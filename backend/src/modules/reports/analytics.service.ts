import { prisma } from '../../config/prisma';
import { CampusLocation, OrderStatus } from '@prisma/client';

export interface SemesterAnalyticsQuery {
  semester?: string;
  campus?: string;
}

export function parseSemesterDates(semester?: string): {
  startDate: Date;
  endDate: Date;
  semesterKey: string;
  label: string;
} {
  const norm = (semester || '').toUpperCase().trim();
  if (norm.includes('FALL') || norm.includes('2024')) {
    return {
      startDate: new Date('2024-09-01T00:00:00.000Z'),
      endDate: new Date('2024-12-31T23:59:59.999Z'),
      semesterKey: 'FALL_2024',
      label: 'Kỳ Fall 2024',
    };
  }
  if (norm.includes('SPRING') || norm.includes('2025')) {
    return {
      startDate: new Date('2025-01-01T00:00:00.000Z'),
      endDate: new Date('2025-04-30T23:59:59.999Z'),
      semesterKey: 'SPRING_2025',
      label: 'Kỳ Spring 2025',
    };
  }
  if (norm.includes('SUMMER')) {
    return {
      startDate: new Date('2024-05-01T00:00:00.000Z'),
      endDate: new Date('2024-08-31T23:59:59.999Z'),
      semesterKey: 'SUMMER_2024',
      label: 'Kỳ Summer 2024',
    };
  }
  // Toàn bộ
  return {
    startDate: new Date('2024-01-01T00:00:00.000Z'),
    endDate: new Date('2026-12-31T23:59:59.999Z'),
    semesterKey: 'ALL',
    label: 'Toàn thời gian (2024 - 2026)',
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
    const { startDate, endDate, semesterKey, label } = parseSemesterDates(query.semester);
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

    // 1. Fetch Orders trong kỳ
    const [orders, kycCount, hubsCount] = await Promise.all([
      prisma.order.findMany({
        where: orderWhere,
        select: {
          id: true,
          orderCode: true,
          status: true,
          payment: true,
          createdAt: true,
          product: {
            select: {
              campus: true,
              price: true,
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
    ];

    const campusMap: Record<
      string,
      { campus: string; name: string; totalOrders: number; completedOrders: number; gmv: number }
    > = {
      HOL: { campus: 'HOL', name: 'Hòa Lạc (Hà Nội)', totalOrders: 0, completedOrders: 0, gmv: 0 },
      HCM: { campus: 'HCM', name: 'TP.HCM (Quận 9)', totalOrders: 0, completedOrders: 0, gmv: 0 },
      DAD: { campus: 'DAD', name: 'Đà Nẵng', totalOrders: 0, completedOrders: 0, gmv: 0 },
      CT: { campus: 'CT', name: 'Cần Thơ', totalOrders: 0, completedOrders: 0, gmv: 0 },
      QN: { campus: 'QN', name: 'Quy Nhơn', totalOrders: 0, completedOrders: 0, gmv: 0 },
    };

    for (const o of orders) {
      const amount = o.payment?.totalAmount || o.product?.price || 0;
      const oCampus = o.product?.campus || 'HOL';

      if (o.status !== OrderStatus.CANCELLED) {
        totalGMV += amount;
      }

      if (campusMap[oCampus]) {
        campusMap[oCampus].totalOrders += 1;
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
    }

    // Dữ liệu analytics thực tế từ cơ sở dữ liệu (Bảo mật F-16: Không sinh số liệu tài chính giả mạo)
    const effectiveEscrow = escrowHoldingAmount;
    const effectiveCompleted = completedCount;
    const effectiveKyc = kycCount;
    const effectiveGMV = totalGMV;

    const safetyRate = orders.length > 0 ? ((orders.length - disputedCount) / orders.length) * 100 : 100;

    return {
      semester: semesterKey,
      semesterLabel: label,
      campus: campusFilter || 'ALL',
      period: {
        startDate,
        endDate,
      },
      metrics: {
        escrowHoldingAmount: effectiveEscrow,
        completedCount: effectiveCompleted,
        kycVerifiedCount: effectiveKyc,
        totalGMV: effectiveGMV,
        completedGMV: completedGMV,
        totalOrders: orders.length,
        disputedCount,
        cancelledCount,
        holdingCount,
        safetyRate: Number(safetyRate.toFixed(1)),
        operatingHubsCount: hubsCount,
      },
      campusBreakdown: Object.values(campusMap),
    };
  }
}

export const semesterAnalyticsService = new SemesterAnalyticsService();
