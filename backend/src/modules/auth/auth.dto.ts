import { z } from 'zod';

// Quy chuẩn mật khẩu an toàn: Tối thiểu 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt
export const strongPasswordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ cái in hoa')
  .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số')
  .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)');

// Quy chuẩn email an toàn: chuẩn hóa chữ thường và loại bỏ khoảng trắng thừa (B1-6 Fix)
export const emailSchema = z
  .string()
  .email('Email không đúng định dạng')
  .trim()
  .toLowerCase();

export const registerSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phoneNumber: z.string().optional(),
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).default('HOL'),
  recaptchaToken: z.string().optional(), // Token reCAPTCHA từ client gửi lên chống bot spam
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Thiếu Google idToken'),
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).default('HOL'),
});

export const phoneAuthSchema = z.object({
  idToken: z.string().min(1, 'Thiếu Firebase Phone idToken'),
  fullName: z.string().optional(),
  campus: z.enum(['HOL', 'HCM', 'DAD', 'QN', 'CT']).default('HOL'),
});

// ----------------------------------------------------------------------------
// 1. Thay đổi mật khẩu (User đã đăng nhập)
// ----------------------------------------------------------------------------
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(), // Có thể bỏ trống nếu tài khoản Google/Phone chưa từng tạo mật khẩu
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu mới',
    path: ['confirmPassword'],
  });

// ----------------------------------------------------------------------------
// 2. Yêu cầu gửi OTP quên mật khẩu (Chưa đăng nhập)
// ----------------------------------------------------------------------------
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// ----------------------------------------------------------------------------
// 3. Xác thực OTP & Đặt mật khẩu mới (Chưa đăng nhập)
// ----------------------------------------------------------------------------
export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    otp: z.string().length(6, 'Mã OTP phải gồm đúng 6 chữ số'),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu mới',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type PhoneAuthInput = z.infer<typeof phoneAuthSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
