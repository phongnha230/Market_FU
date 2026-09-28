import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
  phoneNumber: z.string().optional(),
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).optional(),
  avatarUrl: z.string().refine(
    (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'),
    'Avatar URL không hợp lệ'
  ).optional(),
});

export const updateBankAccountSchema = z.preprocess(
  (val: any) => {
    if (val && typeof val === 'object') {
      return {
        bankName: val.bankName,
        accountNo: val.accountNo || val.accountNumber,
        accountName: val.accountName || val.accountHolder,
      };
    }
    return val;
  },
  z.object({
    bankName: z.string().min(2, 'Vui lòng nhập tên ngân hàng'),
    accountNo: z.string().min(4, 'Vui lòng nhập số tài khoản'),
    accountName: z.string().min(2, 'Vui lòng nhập tên chủ tài khoản'),
  })
);

export const studentKycSchema = z.object({
  studentId: z.string().min(5, 'Mã số sinh viên (MSSV) không hợp lệ (VD: SE170000)'),
  cardImageUrl: z.string().optional(),
  cardBackUrl: z.string().optional(),
});

export const sellerOnboardingSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  studentId: z.string().min(5, 'Mã số sinh viên (MSSV) không hợp lệ (VD: SE170000, IA160000)'),
  phoneNumber: z.string().min(9, 'Số điện thoại tối thiểu 9-11 chữ số'),
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT'], {
    required_error: 'Vui lòng chọn cơ sở Campus (HOL, HCM, DAD, QN, CT)',
  }),
  // Thông tin ngân hàng (Escrow)
  bankName: z.string().min(2, 'Vui lòng chọn hoặc nhập tên ngân hàng'),
  accountNo: z.string().min(4, 'Vui lòng nhập số tài khoản ngân hàng'),
  accountName: z.string().min(2, 'Vui lòng nhập tên chủ tài khoản ngân hàng'),
  // Xác thực CCCD
  cccdNumber: z.string().length(12, 'Số CCCD phải đúng 12 chữ số').regex(/^\d{12}$/, 'Số CCCD chỉ gồm 12 chữ số'),
  cccdFrontUrl: z.string().url('URL ảnh CCCD mặt trước không hợp lệ'),
  cccdBackUrl: z.string().url('URL ảnh CCCD mặt sau không hợp lệ'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;
export type StudentKycInput = z.infer<typeof studentKycSchema>;
export type SellerOnboardingInput = z.infer<typeof sellerOnboardingSchema>;

export const buyBadgeSchema = z.object({
  badgeType: z.enum(['TOP_SELLER', 'K18_VERIFIED', 'REPUTABLE_TRADER'], {
    required_error: 'Loại huy hiệu phải là TOP_SELLER, K18_VERIFIED hoặc REPUTABLE_TRADER',
  }),
});
export type BuyBadgeInput = z.infer<typeof buyBadgeSchema>;

export const createWithdrawalSchema = z.object({
  amount: z.coerce.number().int().min(50000, 'Số tiền rút tối thiểu là 50.000 VNĐ'),
});
export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;

export const queryCoinHistorySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type QueryCoinHistoryInput = z.infer<typeof queryCoinHistorySchema>;

export const claimQuestSchema = z.object({
  questId: z.string({ required_error: 'Mã nhiệm vụ là bắt buộc' }),
  amount: z.coerce.number().int().positive().max(200, 'Phần thưởng nhiệm vụ tối đa 200 Xu').default(20),
});
export type ClaimQuestInput = z.infer<typeof claimQuestSchema>;

