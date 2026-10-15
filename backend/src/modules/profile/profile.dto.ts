import { z } from 'zod';

export const updateProfileSchema = z.preprocess(
  (val: any) => {
    if (val && typeof val === 'object') {
      return {
        ...val,
        fullName: val.fullName || val.name,
        phoneNumber: val.phoneNumber !== undefined ? val.phoneNumber : val.phone,
        dorm: val.dorm !== undefined ? val.dorm : (val.dormRoom || val.roomNumber),
      };
    }
    return val;
  },
  z.object({
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
    phoneNumber: z.string().optional().nullable(),
    campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).optional(),
    avatarUrl: z.string().refine(
      (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'),
      'Avatar URL không hợp lệ'
    ).optional(),
    cohort: z.string().max(20).optional().nullable(),
    major: z.string().max(100).optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
    dorm: z.string().max(50).optional().nullable(),
  })
);

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
  selfieCardUrl: z.string().optional(),
  fullName: z.string().optional(),
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).optional(),
  cohort: z.string().optional(),
  major: z.string().optional(),
  phoneNumber: z.string().optional(),
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
  // Thẻ SV (optional)
  cardImageUrl: z.string().optional().nullable(),
  cardBackUrl: z.string().optional().nullable(),
  selfieCardUrl: z.string().optional().nullable(),
  // Xác thực CCCD
  cccdNumber: z.string().optional().nullable(),
  cccdFrontUrl: z.string().refine(
    (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'),
    'URL ảnh CCCD mặt trước không hợp lệ'
  ).optional().nullable(),
  cccdBackUrl: z.string().refine(
    (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'),
    'URL ảnh CCCD mặt sau không hợp lệ'
  ).optional().nullable(),
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
  questId: z.string({ required_error: 'Mã nhiệm vụ là bắt buộc' }).min(1).max(80),
});
export type ClaimQuestInput = z.infer<typeof claimQuestSchema>;

export const questConditionSchema = z.enum([
  'DAILY_CHECKIN',
  'APPROVED_KYC',
  'CREATED_LISTING',
  'COMPLETED_REVIEW',
  'COMPLETED_SAFE_HANDOFF',
]);
export const questAdminInputSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(''),
  rewardCoins: z.number().int().min(1).max(200),
  conditionType: questConditionSchema,
  cadence: z.enum(['ONCE', 'DAILY', 'WEEKLY']),
  isActive: z.boolean().optional(),
  iconType: z.string().max(30).default('other'),
  managedBy: z.string().trim().max(100).default('Ban Quản Trị Sàn'),
});
export type QuestAdminInput = z.infer<typeof questAdminInputSchema>;

