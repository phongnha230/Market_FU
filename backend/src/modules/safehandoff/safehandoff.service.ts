import { prisma } from '../../config/prisma';
import { AppError } from '../../middlewares/error.middleware';
import { CampusLocation, SafeHandoffHub } from '@prisma/client';
import { geoAdd, geoSearchRadius } from '../../config/redis';
import {
  CreateSafeHandoffHubInput,
  UpdateSafeHandoffHubInput,
  QuerySafeHandoffHubsInput,
} from './safehandoff.dto';

export const HUB_COORDINATES: Record<string, { longitude: number; latitude: number }> = {
  'HL-01': { longitude: 105.5262, latitude: 21.0135 },
  'HL-02': { longitude: 105.527, latitude: 21.0142 },
  'HL-03': { longitude: 105.5285, latitude: 21.012 },
  'HL-04': { longitude: 105.529, latitude: 21.011 },
  'HL-05': { longitude: 105.5255, latitude: 21.013 },
  'HL-06': { longitude: 105.5248, latitude: 21.0125 },
  'HL-07': { longitude: 105.5298, latitude: 21.0105 },
  'HCM-01': { longitude: 106.8099, latitude: 10.8415 },
  'HCM-02': { longitude: 106.8095, latitude: 10.8418 },
  'HCM-03': { longitude: 106.8105, latitude: 10.841 },
  'DN-01': { longitude: 108.2608, latitude: 15.9691 },
  'DN-02': { longitude: 108.2615, latitude: 15.9685 },
  'CT-01': { longitude: 105.757, latitude: 10.0275 },
  'CT-02': { longitude: 105.7565, latitude: 10.028 },
  'QN-01': { longitude: 109.2195, latitude: 13.783 },
  'QN-02': { longitude: 109.22, latitude: 13.7825 },
};

const DEFAULT_HUBS = [
  // Campus Hòa Lạc (7 trạm)
  {
    code: 'HL-01',
    name: 'Sảnh Chính Tòa Alpha (Tầng 1)',
    campus: CampusLocation.HOL,
    storageCapacity: '42 GB',
    cameras: '2 Cam HD',
    staffCount: '8 cán bộ/ngày',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '07:30 - 21:00',
    locationDetails: 'Bàn lễ tân sảnh chính, Tòa Alpha, ĐH FPT Hòa Lạc',
    notes: 'Có bảo vệ trực 24/7, 2 camera HD giám sát bàn tiếp tân',
  },
  {
    code: 'HL-02',
    name: 'Thư viện Gamma (Tầng 1)',
    campus: CampusLocation.HOL,
    storageCapacity: '28 GB',
    cameras: '360° AI',
    staffCount: 'Giờ tự học',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '08:00 - 21:30',
    locationDetails: 'Bàn quầy thủ thư, Tòa Gamma, ĐH FPT Hòa Lạc',
    notes: 'Khu vực tự học, ánh sáng tốt, thích hợp test laptop và máy tính bảng',
  },
  {
    code: 'HL-03',
    name: 'Dom A-B Sảnh Chính',
    campus: CampusLocation.HOL,
    storageCapacity: '35 GB',
    cameras: '4 Cam',
    staffCount: 'Cả ngày',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '06:00 - 23:00',
    locationDetails: 'Khu lễ tân sảnh KTX Dom A-B',
    notes: 'Điểm hẹn giao nhận đồ dùng phòng KTX thuận tiện giờ trưa & tối',
  },
  {
    code: 'HL-04',
    name: 'Dom E-F Điểm Hẹn Tiện Lợi',
    campus: CampusLocation.HOL,
    storageCapacity: '30 GB',
    cameras: '2 Cam AI',
    staffCount: 'Ký túc xá',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '06:00 - 23:00',
    locationDetails: 'Cạnh siêu thị mini Dom E, ĐH FPT Hòa Lạc',
    notes: 'Gần trạm VinBus và căn tin KTX',
  },
  {
    code: 'HL-05',
    name: 'Tòa Beta Tầng Trệt',
    campus: CampusLocation.HOL,
    storageCapacity: '25 GB',
    cameras: '2 Cam HD',
    staffCount: 'Ban ngày',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '07:30 - 18:00',
    locationDetails: 'Góc tự học tầng 1 Tòa Beta',
    notes: 'Khu vực tự học và câu lạc bộ',
  },
  {
    code: 'HL-06',
    name: 'Tòa Delta Phòng Chờ',
    campus: CampusLocation.HOL,
    storageCapacity: '32 GB',
    cameras: '1 Cam 360',
    staffCount: 'Giờ hành chính',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '08:00 - 17:30',
    locationDetails: 'Phòng chờ sinh viên, sảnh Tòa Delta',
    notes: 'Khu vực đón tiếp sinh viên mới',
  },
  {
    code: 'HL-07',
    name: 'Khu Thể Thao & Sân Bóng',
    campus: CampusLocation.HOL,
    storageCapacity: '20 GB',
    cameras: '2 Cam Ngoài Trời',
    staffCount: 'Chiều tối',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '16:00 - 20:30',
    locationDetails: 'Khu vực khán đài sân bóng đá số 1',
    notes: 'Điểm nhận dụng cụ thể thao, vovinam, bóng đá',
  },

  // Campus TP.HCM (4 trạm)
  {
    code: 'SG-01',
    name: 'Sảnh Tòa E2a-7 (Khu CN Cao)',
    campus: CampusLocation.HCM,
    storageCapacity: '56 GB',
    cameras: 'Trực DVC',
    staffCount: 'Trực tiếp',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '07:30 - 21:00',
    locationDetails: 'Khu vực DVC sảnh chính Tòa E2a-7, Khu Công Nghệ Cao Q9',
    notes: 'Điểm giao nhận trung tâm, camera toàn cảnh, gần cổng bảo vệ',
  },
  {
    code: 'SG-02',
    name: 'Thư viện Tòa Nhà Sáng Tạo',
    campus: CampusLocation.HCM,
    storageCapacity: '40 GB',
    cameras: '2 Cam AI',
    staffCount: 'Giờ tự học',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '08:00 - 20:00',
    locationDetails: 'Tầng 2 Thư viện Tòa Nhà Sáng Tạo',
    notes: 'Bàn giao tài liệu, giáo trình, thiết bị IT và linh kiện đồ án',
  },
  {
    code: 'SG-03',
    name: 'Sảnh Canteen Tòa Alpha',
    campus: CampusLocation.HCM,
    storageCapacity: '38 GB',
    cameras: '3 Cam HD',
    staffCount: 'Giờ ăn trưa',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '07:00 - 19:30',
    locationDetails: 'Lối vào khu ăn uống căng tin sinh viên',
    notes: 'Thuận tiện gặp mặt trao đổi hàng hóa nhanh',
  },
  {
    code: 'SG-04',
    name: 'Khu Khởi nghiệp Startup Hub',
    campus: CampusLocation.HCM,
    storageCapacity: '45 GB',
    cameras: '360° Smart',
    staffCount: 'Cả ngày',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '08:00 - 21:00',
    locationDetails: 'Tầng 3 Không gian Đổi mới Sáng tạo & Startup Hub',
    notes: 'Không gian test máy công nghệ và giao dịch lớn',
  },

  // Campus Đà Nẵng (3 trạm)
  {
    code: 'DN-01',
    name: 'Sảnh Tòa FPT City Ngũ Hành Sơn',
    campus: CampusLocation.DAD,
    storageCapacity: '19 GB',
    cameras: '1 Cam 360',
    staffCount: 'Buổi sáng',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '07:30 - 20:30',
    locationDetails: 'Sảnh chính Tòa Alpha, KĐT FPT City Ngũ Hành Sơn',
    notes: 'Khu vực thoáng mát, an ninh trường túc trực',
  },
  {
    code: 'DN-02',
    name: 'Sân Vovinam Tòa Beta',
    campus: CampusLocation.DAD,
    storageCapacity: '22 GB',
    cameras: '2 Cam Ngoài Trời',
    staffCount: 'Chiều tối',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '16:00 - 20:00',
    locationDetails: 'Nhà thi đấu Vovinam, Tòa Beta Đà Nẵng',
    notes: 'Điểm hẹn giao nhận đồng phục võ và đồ thể thao',
  },
  {
    code: 'DN-03',
    name: 'Thư viện Tòa Gamma',
    campus: CampusLocation.DAD,
    storageCapacity: '26 GB',
    cameras: '2 Cam HD',
    staffCount: 'Giờ tự học',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '08:00 - 20:00',
    locationDetails: 'Bàn thủ thư Thư viện tầng 2 Tòa Gamma',
    notes: 'Giao lưu sách, giáo trình chuẩn FU',
  },

  // Campus Cần Thơ (2 trạm)
  {
    code: 'CT-01',
    name: 'Sảnh Tòa Gamma Cần Thơ',
    campus: CampusLocation.CT,
    storageCapacity: '18 GB',
    cameras: '2 Cam',
    staffCount: 'Chiều tối',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '07:30 - 21:00',
    locationDetails: 'Sảnh Tòa Gamma, Cầu Rau Răm, Q. Ninh Kiều, Cần Thơ',
    notes: 'Điểm hẹn trung tâm có ghế ngồi và wifi tốc độ cao để test máy',
  },
  {
    code: 'CT-02',
    name: 'Sân Cỏ Nhân Tạo KTX Cần Thơ',
    campus: CampusLocation.CT,
    storageCapacity: '20 GB',
    cameras: '1 Cam AI',
    staffCount: 'Cả ngày',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '06:30 - 21:30',
    locationDetails: 'Phía sau khu Ký túc xá FPT Cần Thơ',
    notes: 'Gần khu nội trú sinh viên các tỉnh miền Tây',
  },

  // Campus Quy Nhơn (2 trạm)
  {
    code: 'QN-01',
    name: 'Trung tâm AI Hub & Innovation',
    campus: CampusLocation.QN,
    storageCapacity: '24 GB',
    cameras: '1 Cam AI',
    staffCount: '24/7',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '07:00 - 22:00',
    locationDetails: 'Sảnh Trung tâm AI & Trí tuệ nhân tạo Quy Nhơn',
    notes: 'Khuôn viên công nghệ cao, an ninh camera bảo vệ nghiêm ngặt',
  },
  {
    code: 'QN-02',
    name: 'Sảnh Tòa Nhà Điều Hành Quy Nhơn',
    campus: CampusLocation.QN,
    storageCapacity: '25 GB',
    cameras: '2 Cam HD',
    staffCount: 'Giờ hành chính',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '08:00 - 18:00',
    locationDetails: 'Sảnh lễ tân Tòa nhà điều hành FPT Quy Nhơn',
    notes: 'Bàn giao tài liệu và thiết bị học tập',
  },
];

export class SafeHandoffService {
  /**
   * Seed tự động 18 trạm mẫu nếu database chưa có trạm nào
   */
  async ensureSeededHubs(): Promise<void> {
    const count = await prisma.safeHandoffHub.count();
    if (count === 0) {
      await prisma.safeHandoffHub.createMany({
        data: DEFAULT_HUBS,
      });
    }
  }

  /**
   * Lấy danh sách tất cả các trạm Safe-Handoff (có thể lọc theo cơ sở)
   */
  async getHubs(query?: QuerySafeHandoffHubsInput) {
    await this.ensureSeededHubs();

    const where: any = {};
    if (query?.campus) {
      where.campus = query.campus;
    }
    if (query?.status) {
      where.status = query.status;
    }
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { locationDetails: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const hubs = await prisma.safeHandoffHub.findMany({
      where,
      orderBy: [{ campus: 'asc' }, { code: 'asc' }],
    });

    const total = hubs.length;
    const operatingCount = hubs.filter((h: SafeHandoffHub) => h.isOperating && h.status === 'Hoạt động').length;
    const maintenanceCount = hubs.filter((h: SafeHandoffHub) => h.status === 'Bảo trì').length;

    return {
      hubs,
      stats: {
        total,
        operating: operatingCount,
        maintenance: maintenanceCount,
      },
    };
  }

  /**
   * Lấy chi tiết 1 trạm theo ID hoặc Code
   */
  async getHubById(idOrCode: string) {
    const hub = await prisma.safeHandoffHub.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode.toUpperCase() }],
      },
    });

    if (!hub) {
      throw new AppError('Không tìm thấy trạm Safe-Handoff này', 404, 'HUB_NOT_FOUND');
    }

    return hub;
  }

  /**
   * Tạo mới trạm Safe-Handoff (Dành cho Admin)
   */
  async createHub(data: CreateSafeHandoffHubInput) {
    const existing = await prisma.safeHandoffHub.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError(`Mã trạm ${data.code} đã tồn tại trong hệ thống`, 409, 'HUB_CODE_EXISTS');
    }

    const hub = await prisma.safeHandoffHub.create({
      data: {
        ...data,
        isOperating: data.status === 'Hoạt động',
      },
    });

    return hub;
  }

  /**
   * Cập nhật thông tin trạm (Dành cho Admin)
   */
  async updateHub(id: string, data: UpdateSafeHandoffHubInput) {
    const existing = await prisma.safeHandoffHub.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Không tìm thấy trạm Safe-Handoff cần cập nhật', 404, 'HUB_NOT_FOUND');
    }

    if (data.code && data.code !== existing.code) {
      const codeCheck = await prisma.safeHandoffHub.findUnique({ where: { code: data.code } });
      if (codeCheck) {
        throw new AppError(`Mã trạm ${data.code} đã tồn tại`, 409, 'HUB_CODE_EXISTS');
      }
    }

    const isOperating = data.status !== undefined ? data.status === 'Hoạt động' : data.isOperating;

    const updated = await prisma.safeHandoffHub.update({
      where: { id },
      data: {
        ...data,
        ...(isOperating !== undefined ? { isOperating } : {}),
      },
    });

    return updated;
  }

  /**
   * Chuyển đổi trạng thái Hoạt động / Bảo trì của trạm
   */
  async toggleHubStatus(id: string) {
    const hub = await prisma.safeHandoffHub.findUnique({ where: { id } });
    if (!hub) {
      throw new AppError('Không tìm thấy trạm Safe-Handoff', 404, 'HUB_NOT_FOUND');
    }

    const nextStatus = hub.status === 'Hoạt động' ? 'Bảo trì' : 'Hoạt động';
    const nextOperating = nextStatus === 'Hoạt động';

    const updated = await prisma.safeHandoffHub.update({
      where: { id },
      data: {
        status: nextStatus,
        isOperating: nextOperating,
      },
    });

    return updated;
  }

  /**
   * Xóa trạm Safe-Handoff
   */
  async deleteHub(id: string) {
    const hub = await prisma.safeHandoffHub.findUnique({ where: { id } });
    if (!hub) {
      throw new AppError('Không tìm thấy trạm Safe-Handoff', 404, 'HUB_NOT_FOUND');
    }

    await prisma.safeHandoffHub.delete({ where: { id } });
    return { success: true, message: `Đã xóa trạm ${hub.name} (${hub.code})` };
  }

  /**
   * Đồng bộ tọa độ các trạm vào Redis Geo Set (campus:hubs:geo)
   */
  async ensureGeoIndexed(): Promise<void> {
    const hubs = await prisma.safeHandoffHub.findMany({
      where: { isOperating: true },
      select: { id: true, code: true },
    });

    for (const hub of hubs) {
      const coords = HUB_COORDINATES[hub.code];
      if (coords) {
        await geoAdd('campus:hubs:geo', coords.longitude, coords.latitude, hub.id);
      }
    }
  }

  /**
   * Tìm kiếm các trạm Safe-Handoff gần vị trí sinh viên nhất bằng Redis Geospatial
   */
  async getNearbyHubs(longitude: number, latitude: number, radiusKm = 10, limit = 10) {
    await this.ensureGeoIndexed();

    const matches = await geoSearchRadius('campus:hubs:geo', longitude, latitude, radiusKm, limit);

    if (matches.length === 0) {
      // Fallback: nếu không có trạm nào trong bán kính, trả về danh sách mặc định
      const allHubsResult = await this.getHubs({});
      return allHubsResult.hubs.slice(0, limit).map((h) => ({
        ...h,
        distanceKm: null,
        distanceMeters: null,
      }));
    }

    const hubIds = matches.map((m) => m.member);
    const hubs = await prisma.safeHandoffHub.findMany({
      where: { id: { in: hubIds } },
    });

    const distMap = new Map(matches.map((m) => [m.member, m.distanceKm]));

    return hubs
      .map((h) => {
        const d = distMap.get(h.id) ?? 0;
        return {
          ...h,
          distanceKm: d,
          distanceMeters: Math.round(d * 1000),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /**
   * Admin xem danh sách giao dịch hẹn gặp Safe-Handoff (MEETUP)
   */
  async getMeetupTransactions(params: {
    campus?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { campus = 'ALL', status = 'ALL', page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const baseWhere: any = {
      orderType: 'MEETUP',
    };

    if (campus && campus !== 'ALL') {
      baseWhere.product = {
        campus: campus as any,
      };
    }

    if (status && status !== 'ALL') {
      if (status === 'COMPLETED') {
        baseWhere.status = { in: ['COMPLETED', 'DELIVERED'] };
      } else if (status === 'PENDING') {
        baseWhere.status = { in: ['PENDING', 'PAID'] };
      } else if (status === 'CANCELLED') {
        baseWhere.status = { in: ['CANCELLED', 'DISPUTED'] };
      } else {
        baseWhere.status = status as any;
      }
    }

    const statsWhere: any =
      campus && campus !== 'ALL'
        ? { orderType: 'MEETUP', product: { campus: campus as any } }
        : { orderType: 'MEETUP' };

    const [totalAll, completedCount, pendingCount, cancelledCount, orders, total] = await Promise.all([
      prisma.order.count({ where: statsWhere }),
      prisma.order.count({ where: { ...statsWhere, status: { in: ['COMPLETED', 'DELIVERED'] } } }),
      prisma.order.count({ where: { ...statsWhere, status: { in: ['PENDING', 'PAID'] } } }),
      prisma.order.count({ where: { ...statsWhere, status: { in: ['CANCELLED', 'DISPUTED'] } } }),
      prisma.order.findMany({
        where: baseWhere,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
              campus: true,
              meetupLocation: true,
            },
          },
          buyer: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  phoneNumber: true,
                  campus: true,
                },
              },
            },
          },
          seller: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  phoneNumber: true,
                  campus: true,
                },
              },
            },
          },
        },
      }),
      prisma.order.count({ where: baseWhere }),
    ]);

    return {
      orders,
      stats: {
        total: totalAll,
        completed: completedCount,
        pending: pendingCount,
        cancelled: cancelledCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const safeHandoffService = new SafeHandoffService();
