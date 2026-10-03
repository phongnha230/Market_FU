import apiClient, { ApiResponse } from './apiClient';

export interface SafeHandoffHub {
  id: string;
  name: string;
  campus: string;
  description: string;
  hasCctv: boolean;
  hasPower220v: boolean;
  hasGuard247: boolean;
  operatingHours: string;
  isActive: boolean;
}

const DEFAULT_HUBS: SafeHandoffHub[] = [
  {
    id: 'hub_alpha',
    name: 'Trạm Safe-Point Sảnh Tòa Alpha',
    campus: 'HÒA LẠC',
    description: 'Bàn test có nguồn 220V, camera an ninh và bảo vệ trực 24/7.',
    hasCctv: true,
    hasPower220v: true,
    hasGuard247: true,
    operatingHours: '07:00 - 22:00',
    isActive: true,
  },
  {
    id: 'hub_beta',
    name: 'Trạm Safe-Point Thư viện Beta',
    campus: 'HÒA LẠC',
    description: 'Khu vực bàn giao giáo trình, laptop và thiết bị học tập yên tĩnh.',
    hasCctv: true,
    hasPower220v: true,
    hasGuard247: true,
    operatingHours: '08:00 - 21:00',
    isActive: true,
  },
  {
    id: 'hub_dom_b',
    name: 'Trạm Safe-Point Sân KTX Dom B',
    campus: 'HÒA LẠC',
    description: 'Điểm hẹn giao dịch nội khu KTX sinh viên thuận tiện buổi tối.',
    hasCctv: true,
    hasPower220v: false,
    hasGuard247: true,
    operatingHours: '06:00 - 23:00',
    isActive: true,
  },
];

export const safeHandoffMobileService = {
  /**
   * Lấy danh sách các trạm hẹn an toàn theo Campus
   */
  async getHubs(campus?: string): Promise<SafeHandoffHub[]> {
    try {
      const { toBackendCampus, fromBackendCampus } = await import('../lib/backendMappers');
      const backendCampus = campus ? toBackendCampus(campus) : undefined;
      const res = await apiClient.get<ApiResponse<any[]>>('/safe-handoff', {
        params: { campus: backendCampus },
      });
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data.map((h) => ({
          id: h.id || h.code || h._id,
          name: h.name,
          campus: fromBackendCampus(h.campus),
          description: h.locationDetails || h.description || h.notes || 'Trạm có camera giám sát và nhân viên trực hỗ trợ.',
          hasCctv: h.hasCctv ?? Boolean(h.cameras && h.cameras !== '0'),
          hasPower220v: h.hasPower220v ?? true,
          hasGuard247: h.hasGuard247 ?? Boolean(h.staffCount && h.staffCount !== '0'),
          operatingHours: h.operatingHours || '07:30 - 21:00',
          isActive: h.isOperating ?? (h.status === 'Hoạt động' || Boolean(h.isActive)),
        }));
      }
    } catch (e: any) {
      console.log('⚠️ [Backend SafeHandoff offline]:', e?.message);
    }
    return DEFAULT_HUBS;
  },
};

export default safeHandoffMobileService;
