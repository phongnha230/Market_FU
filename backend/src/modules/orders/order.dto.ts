import { z } from 'zod';

export const createOrderSchema = z
  .object({
    productId: z.string().min(1, 'productId không được để trống'),
    orderType: z.enum(['MEETUP', 'SHIP_COD'], {
      errorMap: () => ({ message: 'orderType phải là MEETUP hoặc SHIP_COD' }),
    }),
    coinsUsed: z.coerce.number().int().min(0, 'Số xu sử dụng không được âm').default(0),
    deliveryNote: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional(),
    paymentMethod: z.enum(['VIETQR', 'PAYOS_WEB', 'CASH']).default('VIETQR'),
    shipping: z
      .object({
        receiverName: z.string().min(2, 'Tên người nhận phải có ít nhất 2 ký tự'),
        receiverPhone: z.string().min(9, 'Số điện thoại người nhận không hợp lệ'),
        shippingAddress: z.string().min(5, 'Địa chỉ giao hàng quá ngắn'),
        destinationCampus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).optional(),
        shippingPartner: z.string().default('GHTK'),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.orderType === 'SHIP_COD' && !data.shipping) {
        return false;
      }
      return true;
    },
    {
      message: 'Đơn hàng SHIP_COD bắt buộc phải có thông tin giao hàng (shipping)',
      path: ['shipping'],
    }
  );

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const verifyHandshakeSchema = z
  .object({
    handshakeToken: z.string().max(200).optional(),
    handshakeOtp: z
      .string()
      .regex(/^\d{4}$/, 'Mã OTP fallback phải đúng 4 chữ số (1000 - 9999)')
      .optional(),
  })
  .refine((data) => data.handshakeToken || data.handshakeOtp, {
    message: 'Bắt buộc phải cung cấp handshakeToken (từ mã QR) hoặc handshakeOtp (mã 4 số)',
  });

export type VerifyHandshakeInput = z.infer<typeof verifyHandshakeSchema>;

// B3-10 (Task 3.1): Khiếu nại mở trực tiếp từ đơn hàng POST /api/orders/:id/dispute
export const createOrderDisputeSchema = z.object({
  reason: z
    .string({ required_error: 'Lý do khiếu nại là bắt buộc' })
    .min(5, 'Lý do khiếu nại tối thiểu 5 ký tự')
    .max(500, 'Lý do khiếu nại tối đa 500 ký tự'),
  proofVideoUrl: z
    .string({ required_error: 'Link video bằng chứng mở hộp/test đồ là bắt buộc' })
    .url('Đường dẫn video bằng chứng không hợp lệ'),
});

export type CreateOrderDisputeInput = z.infer<typeof createOrderDisputeSchema>;

export const updateShippingStatusSchema = z.object({
  trackingCode: z.string().min(3, 'Mã vận đơn quá ngắn').optional(),
  shippingPartner: z.string().optional(),
  status: z.enum(['SHIPPING', 'DELIVERED'], {
    errorMap: () => ({ message: 'Trạng thái vận chuyển chỉ có thể là SHIPPING hoặc DELIVERED' }),
  }),
});

export type UpdateShippingStatusInput = z.infer<typeof updateShippingStatusSchema>;

export const queryOrdersSchema = z.object({
  status: z
    .enum(['PENDING', 'PAID', 'SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED'])
    .optional(),
  role: z.enum(['BUYER', 'SELLER']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type QueryOrdersInput = z.infer<typeof queryOrdersSchema>;

export const cancelOrderSchema = z.object({
  reason: z.string().min(3, 'Lý do hủy đơn ít nhất 3 ký tự').max(255).optional(),
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export const estimateShippingSchema = z.object({
  fromCampus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT'], {
    errorMap: () => ({ message: 'fromCampus phải là HOL, HCM, DAD, QN, hoặc CT' }),
  }),
  toCampus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).optional(),
  orderType: z.enum(['MEETUP', 'SHIP_COD']).default('SHIP_COD'),
});

export type EstimateShippingInput = z.infer<typeof estimateShippingSchema>;

