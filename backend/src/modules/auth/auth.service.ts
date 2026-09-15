import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { firebaseAuth } from '../../config/firebase';
import { sendPasswordResetOtpEmail } from '../../config/mail';
import { generateTokens, verifyRefreshToken } from '../../utils/token';
import { AppError } from '../../middlewares/error.middleware';
import {
  RegisterInput,
  LoginInput,
  GoogleAuthInput,
  PhoneAuthInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.dto';

const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

interface PasswordResetEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

// Bảng lưu trữ OTP tạm thời trong bộ nhớ RAM có thời hạn TTL 5 phút
const passwordResetStore = new Map<string, PasswordResetEntry>();

// Bảng theo dõi số lần đăng nhập sai theo Email chống Brute-force vét cạn mật khẩu
interface LoginAttemptRecord {
  attempts: number;
  lockedUntil?: number;
}
const loginAttemptStore = new Map<string, LoginAttemptRecord>();

// Định kỳ dọn dẹp các OTP và tài khoản hết hạn khóa mỗi 10 phút để tránh rò rỉ RAM
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of passwordResetStore.entries()) {
    if (now > entry.expiresAt) {
      passwordResetStore.delete(email);
    }
  }
  for (const [email, record] of loginAttemptStore.entries()) {
    if (record.lockedUntil && now > record.lockedUntil) {
      loginAttemptStore.delete(email);
    }
  }
}, 10 * 60 * 1000).unref();

export class AuthService {
  // 1. Đăng ký tài khoản mật khẩu
  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('Email này đã được đăng ký tài khoản', 409, 'EMAIL_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: 'BUYER',
        profile: {
          create: {
            fullName: input.fullName,
            phoneNumber: input.phoneNumber,
            campus: input.campus,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const tokens = generateTokens(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
      user.tokenVersion ?? 0
    );

    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.profile?.fullName,
      role: user.role,
      campus: user.profile?.campus,
      campusCoins: user.profile?.campusCoins ?? 0,
      reputationScore: user.profile?.reputationScore ?? 100,
      createdAt: user.createdAt,
    };

    return { user: userData, tokens };
  }

  // 2. Đăng nhập Email / Mật khẩu (Có cơ chế khóa tạm thời chống Brute-force vét cạn)
  async login(input: LoginInput) {
    const emailKey = input.email.trim().toLowerCase();
    const nowMs = Date.now();
    const attemptRecord = loginAttemptStore.get(emailKey);

    // Kiểm tra xem tài khoản có đang bị tạm khóa 15 phút do nhập sai quá nhiều lần không
    if (attemptRecord?.lockedUntil && attemptRecord.lockedUntil > nowMs) {
      const remainingMinutes = Math.ceil((attemptRecord.lockedUntil - nowMs) / 60000);
      throw new AppError(
        `Tài khoản tạm thời bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau ${remainingMinutes} phút hoặc dùng chức năng Quên mật khẩu.`,
        429,
        'ACCOUNT_TEMPORARILY_LOCKED'
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        profile: true,
      },
    });

    if (!user || !user.passwordHash) {
      // Ghi nhận lần thử sai ngay cả khi email không tồn tại để tránh timing/enumeration attack
      const currentAttempts = (attemptRecord?.attempts || 0) + 1;
      if (currentAttempts >= 5) {
        loginAttemptStore.set(emailKey, { attempts: currentAttempts, lockedUntil: nowMs + 15 * 60 * 1000 });
      } else {
        loginAttemptStore.set(emailKey, { attempts: currentAttempts });
      }
      throw new AppError('Email hoặc mật khẩu không chính xác', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa', 403, 'ACCOUNT_LOCKED');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      const currentAttempts = (attemptRecord?.attempts || 0) + 1;
      if (currentAttempts >= 5) {
        loginAttemptStore.set(emailKey, {
          attempts: currentAttempts,
          lockedUntil: nowMs + 15 * 60 * 1000, // Tạm khóa 15 phút
        });
        throw new AppError(
          'Bạn đã nhập sai mật khẩu 5 lần liên tiếp. Tài khoản bị tạm khóa 15 phút để đảm bảo an toàn.',
          429,
          'ACCOUNT_TEMPORARILY_LOCKED'
        );
      } else {
        loginAttemptStore.set(emailKey, { attempts: currentAttempts });
        throw new AppError(
          `Email hoặc mật khẩu không chính xác. Bạn còn ${5 - currentAttempts} lần thử.`,
          401,
          'INVALID_CREDENTIALS'
        );
      }
    }

    // Đăng nhập thành công -> Xóa bộ đếm số lần thử sai
    loginAttemptStore.delete(emailKey);

    const tokens = generateTokens(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
      user.tokenVersion ?? 0
    );

    const { passwordHash, profile, ...userBase } = user;
    const userData = {
      ...userBase,
      fullName: profile?.fullName,
      avatarUrl: profile?.avatarUrl,
      avatarBadge: profile?.avatarBadge,
      phoneNumber: profile?.phoneNumber,
      campus: profile?.campus,
      campusCoins: profile?.campusCoins ?? 0,
      reputationScore: profile?.reputationScore ?? 100,
      kyc: profile?.kyc,
      bankAccount: profile?.bankAccount,
    };

    return { user: userData, tokens };
  }

  // 3. Đăng nhập Google OAuth (Web & Mobile)
  async googleAuth(input: GoogleAuthInput) {
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: input.idToken,
        audience: ENV.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      throw new AppError('Google ID Token không hợp lệ hoặc đã hết hạn', 401, 'INVALID_GOOGLE_TOKEN');
    }

    if (!payload || !payload.email) {
      throw new AppError('Không thể lấy thông tin email từ tài khoản Google', 400, 'GOOGLE_EMAIL_MISSING');
    }

    const email = payload.email;
    const fullName = payload.name || 'Sinh viên FPT';
    const avatarUrl = payload.picture || undefined;

    let user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: 'BUYER',
          profile: {
            create: {
              fullName,
              avatarUrl,
              campus: input.campus,
            },
          },
        },
        include: { profile: true },
      });
    } else if (!user.isActive) {
      throw new AppError('Tài khoản của bạn đã bị khóa', 403, 'ACCOUNT_LOCKED');
    }

    const tokens = generateTokens(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
      user.tokenVersion ?? 0
    );

    const { passwordHash, profile, ...userBase } = user;
    const userData = {
      ...userBase,
      fullName: profile?.fullName,
      avatarUrl: profile?.avatarUrl,
      avatarBadge: profile?.avatarBadge,
      phoneNumber: profile?.phoneNumber,
      campus: profile?.campus,
      campusCoins: profile?.campusCoins ?? 0,
      reputationScore: profile?.reputationScore ?? 100,
      kyc: profile?.kyc,
      bankAccount: profile?.bankAccount,
    };

    return { user: userData, tokens };
  }

  // 4. Đăng nhập Số điện thoại OTP Firebase (Hoạt động cho cả Web & Mobile)
  async phoneAuth(input: PhoneAuthInput) {
    let decodedToken;
    try {
      decodedToken = await firebaseAuth.verifyIdToken(input.idToken);
    } catch (err) {
      throw new AppError('Mã xác thực OTP điện thoại không hợp lệ hoặc đã hết hạn', 401, 'INVALID_PHONE_TOKEN');
    }

    const phoneNumber = decodedToken.phone_number;
    if (!phoneNumber) {
      throw new AppError('Không tìm thấy số điện thoại từ Firebase token', 400, 'PHONE_NUMBER_NOT_FOUND');
    }

    let profile = await prisma.profile.findFirst({
      where: { phoneNumber },
      include: { user: true },
    });

    let user: any;
    if (!profile) {
      const placeholderEmail = `${phoneNumber.replace('+', '')}@campus.fu.vn`;
      user = await prisma.user.create({
        data: {
          email: placeholderEmail,
          role: 'BUYER',
          profile: {
            create: {
              phoneNumber,
              fullName: input.fullName || `Sinh viên (${phoneNumber.slice(-4)})`,
              campus: input.campus,
            },
          },
        },
        include: { profile: true },
      });
    } else {
      user = { ...profile.user, profile };
    }

    if (!user.isActive) {
      throw new AppError('Tài khoản gắn với số điện thoại này đã bị khóa', 403, 'ACCOUNT_LOCKED');
    }

    const tokens = generateTokens(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
      user.tokenVersion ?? 0
    );

    const { passwordHash, profile: userProfile, ...userBase } = user;
    const userData = {
      ...userBase,
      fullName: userProfile?.fullName,
      avatarUrl: userProfile?.avatarUrl,
      avatarBadge: userProfile?.avatarBadge,
      phoneNumber: userProfile?.phoneNumber,
      campus: userProfile?.campus,
      campusCoins: userProfile?.campusCoins ?? 0,
      reputationScore: userProfile?.reputationScore ?? 100,
      kyc: userProfile?.kyc,
      bankAccount: userProfile?.bankAccount,
    };

    return { user: userData, tokens };
  }

  // 5. Cấp lại Access Token từ Refresh Token (Kiểm tra tokenVersion chống tái sử dụng token bị thu hồi)
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('Refresh Token không tồn tại', 401, 'REFRESH_TOKEN_MISSING');
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      throw new AppError('Refresh Token không hợp lệ hoặc đã hết hạn', 401, 'INVALID_REFRESH_TOKEN');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      throw new AppError('Tài khoản không tồn tại hoặc đã bị khóa', 401, 'USER_NOT_FOUND');
    }

    // Kiểm tra Token Version: Nếu người dùng đã đăng xuất hoặc đổi mật khẩu, tokenVersion trong DB tăng
    // → Mọi Refresh Token cũ sẽ bị thu hồi và từ chối cấp token mới
    if (payload.tokenVersion !== undefined && payload.tokenVersion !== (user.tokenVersion ?? 0)) {
      throw new AppError(
        'Phiên đăng nhập đã bị thu hồi (do đã đăng xuất hoặc thay đổi mật khẩu). Vui lòng đăng nhập lại.',
        401,
        'TOKEN_REVOKED'
      );
    }

    const tokens = generateTokens(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
      user.tokenVersion ?? 0
    );

    return tokens;
  }

  // 6. Thay đổi mật khẩu (User đã đăng nhập)
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Không tìm thấy tài khoản người dùng', 404, 'USER_NOT_FOUND');
    }

    // Nếu tài khoản đã có mật khẩu trước đó, bắt buộc phải cung cấp và so khớp mật khẩu cũ
    if (user.passwordHash) {
      if (!input.currentPassword) {
        throw new AppError('Vui lòng nhập mật khẩu hiện tại', 400, 'CURRENT_PASSWORD_REQUIRED');
      }

      const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Mật khẩu hiện tại không chính xác', 400, 'INVALID_CURRENT_PASSWORD');
      }

      const isSame = await bcrypt.compare(input.newPassword, user.passwordHash);
      if (isSame) {
        throw new AppError('Mật khẩu mới không được trùng với mật khẩu hiện tại', 400, 'PASSWORD_CANNOT_BE_SAME');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        tokenVersion: { increment: 1 }, // Thu hồi mọi Refresh Token cũ
      },
    });

    return {
      message: user.passwordHash
        ? 'Thay đổi mật khẩu thành công'
        : 'Tạo mật khẩu tài khoản thành công',
    };
  }

  // 7. Yêu cầu mã OTP khôi phục mật khẩu (Chưa đăng nhập)
  async forgotPassword(input: ForgotPasswordInput) {
    const email = input.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw new AppError('Email này chưa được đăng ký trong hệ thống', 404, 'EMAIL_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new AppError('Tài khoản gắn với email này đã bị khóa', 403, 'ACCOUNT_LOCKED');
    }

    // Sinh mã OTP ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 phút

    passwordResetStore.set(email, {
      otp,
      expiresAt,
      attempts: 0,
    });

    // In ra console trong môi trường phát triển để test dễ dàng mà không cần chờ mail
    if (ENV.NODE_ENV === 'development') {
      console.log(`🔑 [DEBUG OTP] Password Reset OTP cho ${email}: ${otp}`);
    }

    // Gửi email qua SMTP
    await sendPasswordResetOtpEmail(user.email, otp, user.profile?.fullName || 'Sinh viên FU');

    return {
      email: user.email,
      message: 'Mã OTP xác thực đã được gửi tới email của bạn (hiệu lực trong 5 phút)',
    };
  }

  // 8. Xác thực OTP & Đặt mật khẩu mới (Chưa đăng nhập)
  async resetPassword(input: ResetPasswordInput) {
    const email = input.email.trim().toLowerCase();
    const entry = passwordResetStore.get(email);

    if (!entry) {
      throw new AppError(
        'Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu mã mới.',
        400,
        'OTP_EXPIRED_OR_NOT_FOUND'
      );
    }

    if (Date.now() > entry.expiresAt) {
      passwordResetStore.delete(email);
      throw new AppError('Mã OTP đã hết hạn (chỉ có hiệu lực 5 phút)', 400, 'OTP_EXPIRED');
    }

    if (entry.attempts >= 5) {
      passwordResetStore.delete(email);
      throw new AppError(
        'Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã mới để bảo mật.',
        429,
        'TOO_MANY_OTP_ATTEMPTS'
      );
    }

    if (entry.otp !== input.otp) {
      entry.attempts += 1;
      throw new AppError(
        `Mã OTP không chính xác. Bạn còn ${5 - entry.attempts} lần thử.`,
        400,
        'INVALID_OTP'
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Tài khoản không tồn tại', 404, 'USER_NOT_FOUND');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        tokenVersion: { increment: 1 }, // Thu hồi mọi Refresh Token cũ
      },
    });

    // Xóa OTP khỏi store sau khi đã sử dụng thành công (Chống Replay Attack)
    passwordResetStore.delete(email);

    return {
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.',
    };
  }
}

export const authService = new AuthService();
