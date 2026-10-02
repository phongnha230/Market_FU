import { ENV } from '../../config/env';
import { CampusLocation } from '@prisma/client';

export interface GhnCampusInfo {
  districtId: number;
  wardCode: string;
  provinceName: string;
  districtName: string;
  wardName: string;
  defaultAddress: string;
}

/**
 * Bảng ánh xạ tọa độ hành chính 5 Campus FPT theo mã chuẩn của GHN API v2
 */
export const GHN_CAMPUS_MAPPING: Record<CampusLocation, GhnCampusInfo> = {
  HOL: {
    districtId: 1542, // Huyện Thạch Thất, Hà Nội
    wardCode: '1B1506', // Xã Thạch Hòa
    provinceName: 'Hà Nội',
    districtName: 'Huyện Thạch Thất',
    wardName: 'Xã Thạch Hòa',
    defaultAddress: 'Khu CNC Hòa Lạc, Km29 Đại lộ Thăng Long, Thạch Thất, Hà Nội',
  },
  HCM: {
    districtId: 1451, // TP. Thủ Đức, TP. Hồ Chí Minh
    wardCode: '20912', // Phường Long Thạnh Mỹ
    provinceName: 'Hồ Chí Minh',
    districtName: 'TP. Thủ Đức',
    wardName: 'Phường Long Thạnh Mỹ',
    defaultAddress: 'Đường D1, Khu Công Nghệ Cao, Long Thạnh Mỹ, TP. Thủ Đức, TP.HCM',
  },
  DAD: {
    districtId: 1534, // Quận Ngũ Hành Sơn, Đà Nẵng
    wardCode: '40404', // Phường Hòa Hải
    provinceName: 'Đà Nẵng',
    districtName: 'Quận Ngũ Hành Sơn',
    wardName: 'Phường Hòa Hải',
    defaultAddress: 'Khu đô thị FPT City, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng',
  },
  QN: {
    districtId: 1618, // TP. Quy Nhơn, Bình Định
    wardCode: '430101', // Phường Nhơn Bình
    provinceName: 'Bình Định',
    districtName: 'TP. Quy Nhơn',
    wardName: 'Phường Nhơn Bình',
    defaultAddress: 'Khu đô thị An Phú Thịnh, Nhơn Bình, TP. Quy Nhơn, Bình Định',
  },
  CT: {
    districtId: 1572, // Quận Ninh Kiều, Cần Thơ
    wardCode: '550106', // Phường An Bình
    provinceName: 'Cần Thơ',
    districtName: 'Quận Ninh Kiều',
    wardName: 'Phường An Bình',
    defaultAddress: 'Số 600 đường Nguyễn Văn Cừ (nối dài), An Bình, Ninh Kiều, Cần Thơ',
  },
};

export interface GhnFeeCalculationParams {
  fromCampus: CampusLocation;
  toCampus: CampusLocation;
  weightGram?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  insuranceValue?: number;
}

export interface GhnCreateOrderParams {
  orderCode: string;
  fromCampus: CampusLocation;
  toCampus?: CampusLocation;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  productTitle: string;
  codAmount?: number;
  weightGram?: number;
}

export interface GhnTrackingLog {
  status: string;
  statusText: string;
  time: string;
  location?: string;
  shipperName?: string;
  shipperPhone?: string;
}

export class GhnService {
  private get apiUrl(): string {
    return ENV.GHN_API_URL || 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2';
  }

  private get apiToken(): string {
    return ENV.GHN_API_TOKEN || '';
  }

  private get shopId(): string {
    return ENV.GHN_SHOP_ID || '';
  }

  public isConfigured(): boolean {
    return Boolean(this.apiToken && this.shopId);
  }

  /**
   * Tính cước vận chuyển thực tế qua GHN API
   */
  async calculateFee(params: GhnFeeCalculationParams): Promise<{
    fee: number;
    expectedDeliveryTime?: string;
  } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const fromInfo = GHN_CAMPUS_MAPPING[params.fromCampus];
    const toInfo = GHN_CAMPUS_MAPPING[params.toCampus];
    if (!fromInfo || !toInfo) return null;

    try {
      const response = await fetch(`${this.apiUrl}/shipping-order/fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: this.apiToken,
          ShopId: this.shopId,
        },
        body: JSON.stringify({
          from_district_id: fromInfo.districtId,
          from_ward_code: fromInfo.wardCode,
          service_type_id: 2, // Chuẩn E-Commerce
          to_district_id: toInfo.districtId,
          to_ward_code: toInfo.wardCode,
          height: params.heightCm || 10,
          length: params.lengthCm || 20,
          width: params.widthCm || 15,
          weight: params.weightGram || 500,
          insurance_value: Math.min(params.insuranceValue || 0, 5000000),
        }),
      });

      const data = await response.json();
      if (data?.code === 200 && data?.data?.total) {
        return {
          fee: data.data.total,
          expectedDeliveryTime: data.data.expected_delivery_time,
        };
      }
    } catch (err) {
      console.warn('⚠️ [GHN] Lỗi khi gọi GHN Fee API:', err);
    }

    return null;
  }

  /**
   * Tạo đơn giao vận chuyển sang hệ thống bưu tá GHN
   */
  async createShippingOrder(params: GhnCreateOrderParams): Promise<{
    trackingCode: string;
    totalFee: number;
    expectedDeliveryDate?: string;
  } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const fromInfo = GHN_CAMPUS_MAPPING[params.fromCampus];
    const toInfo = params.toCampus ? GHN_CAMPUS_MAPPING[params.toCampus] : fromInfo;

    try {
      const response = await fetch(`${this.apiUrl}/shipping-order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: this.apiToken,
          ShopId: this.shopId,
        },
        body: JSON.stringify({
          payment_type_id: 2, // Người nhận trả cước / COD
          note: `Đơn Market FU #${params.orderCode} - Đồ sinh viên`,
          required_note: 'CHOXEMHANGKHONGTHU', // Cho xem hàng, không cho thử điện
          from_name: `FPT Campus Hub ${params.fromCampus}`,
          from_phone: '0987654321',
          from_address: fromInfo.defaultAddress,
          from_district_id: fromInfo.districtId,
          from_ward_code: fromInfo.wardCode,
          to_name: params.receiverName,
          to_phone: params.receiverPhone,
          to_address: params.receiverAddress,
          to_district_id: toInfo.districtId,
          to_ward_code: toInfo.wardCode,
          cod_amount: params.codAmount || 0,
          content: params.productTitle,
          weight: params.weightGram || 500,
          length: 20,
          width: 15,
          height: 10,
          service_type_id: 2,
          items: [
            {
              name: params.productTitle,
              code: params.orderCode,
              quantity: 1,
              price: params.codAmount || 0,
            },
          ],
        }),
      });

      const data = await response.json();
      if (data?.code === 200 && data?.data?.order_code) {
        return {
          trackingCode: data.data.order_code,
          totalFee: data.data.total_fee || 0,
          expectedDeliveryDate: data.data.expected_delivery_time,
        };
      } else {
        console.warn('⚠️ [GHN] Lỗi tạo đơn GHN:', data?.message || data);
      }
    } catch (err) {
      console.warn('⚠️ [GHN] Lỗi kết nối API GHN create order:', err);
    }

    return null;
  }

  /**
   * Tra cứu chi tiết tiến trình vận đơn từ GHN
   */
  async getTrackingDetail(trackingCode: string): Promise<{
    status: string;
    currentLocation?: string;
    shipperName?: string;
    shipperPhone?: string;
    logs: GhnTrackingLog[];
  } | null> {
    if (!this.isConfigured() || !trackingCode) {
      return null;
    }

    try {
      const response = await fetch(`${this.apiUrl}/shipping-order/detail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: this.apiToken,
        },
        body: JSON.stringify({ order_code: trackingCode }),
      });

      const data = await response.json();
      if (data?.code === 200 && data?.data) {
        const d = data.data;
        const logs: GhnTrackingLog[] = (d.log || []).map((l: any) => ({
          status: l.status,
          statusText: l.updated_date ? `${l.status} (${new Date(l.updated_date).toLocaleString('vi-VN')})` : l.status,
          time: l.updated_date ? new Date(l.updated_date).toLocaleString('vi-VN') : '',
        }));

        return {
          status: d.status,
          currentLocation: d.station_id ? `Trạm GHN #${d.station_id}` : 'Kho trung chuyển GHN',
          shipperName: d.shipper_name,
          shipperPhone: d.shipper_phone,
          logs,
        };
      }
    } catch (err) {
      console.warn('⚠️ [GHN] Lỗi tra cứu tracking GHN:', err);
    }

    return null;
  }
}

export const ghnService = new GhnService();
