import { z } from 'zod';

export const createOrderSchema = z.object({
  productId: z.string({ required_error: 'ID món đồ không được để trống' }).min(1),
  orderType: z.enum(['MEETUP', 'SHIP_COD'], { required_error: 'Loại đơn hàng phải là MEETUP hoặc SHIP_COD' }),
  coinsToUse: z.coerce.number().int().min(0, 'Số xu khấu trừ không hợp lệ').optional().default(0),
  shippingPartner: z.string().optional().default('GHTK'),
  receiverName: z.string().min(2, 'Tên người nhận phải từ 2 ký tự').optional(),
  receiverPhone: z.string().regex(/^0[0-9]{9}$/, 'Số điện thoại nhận hàng không hợp lệ (10 số)').optional(),
  shippingAddress: z.string().min(5, 'Địa chỉ giao hàng phải chi tiết').optional(),
  deliveryNote: z.string().max(200, 'Ghi chú tối đa 200 ký tự').optional(),
}).refine((data) => {
  if (data.orderType === 'SHIP_COD') {
    return data.receiverName && data.receiverPhone && data.shippingAddress;
  }
  return true;
}, {
  message: 'Đơn hàng Ship COD bắt buộc phải cung cấp đầy đủ: Tên, SĐT và Địa chỉ nhận hàng',
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const verifyHandshakeSchema = z.object({
  token: z.string().optional(),
  otp: z.string().regex(/^[0-9]{4}$/, 'Mã OTP handshake phải gồm 4 chữ số').optional(),
}).refine((data) => data.token || data.otp, {
  message: 'Bắt buộc phải cung cấp mã QR Handshake Token hoặc mã OTP 4 số',
});
export type VerifyHandshakeInput = z.infer<typeof verifyHandshakeSchema>;

export const disputeOrderSchema = z.object({
  reason: z.string().min(10, 'Lý do khiếu nại phải từ 10 ký tự trở lên').max(1000),
  proofVideoUrl: z.string().url('Bắt buộc phải có link video quay khui hộp hoặc cận cảnh test lỗi'),
});
export type DisputeOrderInput = z.infer<typeof disputeOrderSchema>;

export const queryOrdersSchema = z.object({
  role: z.enum(['BUYER', 'SELLER']).optional().default('BUYER'),
  status: z.enum(['PENDING', 'PAID', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type QueryOrdersInput = z.infer<typeof queryOrdersSchema>;

export const shippingWebhookSchema = z.object({
  orderCode: z.string().optional(),
  trackingCode: z.string({ required_error: 'Mã vận đơn trackingCode không được để trống' }),
  status: z.enum(['SHIPPING', 'DELIVERED', 'RETURNED', 'CANCELLED']),
  shippingPartner: z.string().optional().default('GHTK'),
  note: z.string().optional(),
});
export type ShippingWebhookInput = z.infer<typeof shippingWebhookSchema>;
