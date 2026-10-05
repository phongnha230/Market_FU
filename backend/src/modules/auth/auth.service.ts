import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../config/prisma';
import { ENV } from '../../config/env';
import { firebaseAuth } from '../../config/firebase';
import { sendOtpEmail, sendPasswordResetOtpEmail } from '../../config/mail';
import { generateTokens, verifyRefreshToken, RefreshTokenPayload } from '../../utils/token';
import { AppError } from '../../middlewares/error.middleware';
import { getCache, setCache, delCache } from '../../config/redis';
import { logger } from '../../config/logger';
import {
  RegisterInput,
  SendRegisterOtpInput,
  VerifyRegisterOtpInput,
  ResendRegisterOtpInput,
  LoginInput,
  GoogleAuthInput,
  PhoneAuthInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.dto';

const googleClient = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

interface PendingRegisterEntry {
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber?: string;
  studentId?: string;
  campus: 'HOL' | 'HCM' | 'DAD' | 'QN' | 'CT';
  otp: string;
  attempts: number;
  resendCount: number;
  expiresAt: number;
}

interface PasswordResetEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

interface LoginAttemptRecord {
  attempts: number;
  lockedUntil?: number;
}

export class AuthService {
  // 1a. Gửi OTP đăng ký tài khoản (Lưu tạm vào Redis, TUYỆT ĐỐI KHÔNG LƯU VÀO DB KHI CHƯA XÁC THỰC OTP)
  async sendRegisterOtp(input: SendRegisterOtpInput) {
    const email = input.email.trim().toLowerCase();

    // 0. Chặn Spam / Cooldown gửi OTP (tối thiểu 60s giữa mỗi lần gửi mã tới cùng email)
    const cooldownUntil = await getCache<number>(`otp_cooldown:${email}`);
    if (cooldownUntil && cooldownUntil > Date.now()) {
      const waitSeconds = Math.max(1, Math.ceil((cooldownUntil - Date.now()) / 1000));
      throw new AppError(
        `Vui lòng đợi ${waitSeconds} giây trước khi yêu cầu gửi mã OTP tiếp theo.`,
        429,
        'OTP_COOLDOWN'
      );
    }

    // 1. Kiểm tra xem email này đã tồn tại trong DB chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Email này đã được đăng ký tài khoản', 409, 'EMAIL_EXISTS');
    }

    // 2. Kiểm tra xem Mã số sinh viên (MSSV) đã tồn tại trong DB chưa
    if (input.studentId?.trim()) {
      const studentIdUpper = input.studentId.trim().toUpperCase();
      const existingProfileWithStudentId = await prisma.profile.findFirst({
        where: {
          kyc: {
            is: {
              studentId: {
                equals: studentIdUpper,
                mode: 'insensitive',
              },
            },
          },
        },
      });

      const existingKycVerification = await prisma.kycVerification.findFirst({
        where: {
          studentId: {
            equals: studentIdUpper,
            mode: 'insensitive',
          },
        },
      });

      if (existingProfileWithStudentId || existingKycVerification) {
        throw new AppError(
          `Mã số sinh viên (MSSV) "${studentIdUpper}" đã được đăng ký tài khoản. Mỗi sinh viên chỉ được sử dụng 1 tài khoản duy nhất.`,
          409,
          'STUDENT_ID_EXISTS'
        );
      }
    }

    // 2. Hash mật khẩu trước khi lưu cache tạm
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    // 3. Sinh mã OTP 6 chữ số CSPRNG ngẫu nhiên
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 phút

    const pendingData: PendingRegisterEntry = {
      email,
      passwordHash,
      fullName: input.fullName.trim(),
      phoneNumber: input.phoneNumber?.trim() || '',
      studentId: input.studentId?.trim(),
      campus: input.campus,
      otp,
      attempts: 0,
      resendCount: 0,
      expiresAt,
    };

    // 4. Lưu dữ liệu đăng ký tạm vào Redis (TTL 300s = 5 phút)
    // LƯU Ý: KHÔNG LƯU BẢN GHI NÀO VÀO MONGODB/PRISMA TẠI ĐÂY!
    await setCache(`reg_pending:${email}`, pendingData, 300);

    // 5. Gửi email OTP
    try {
      await sendOtpEmail(email, otp, input.fullName.trim());
    } catch (mailError: any) {
      // Hủy phiên cache nếu gửi mail thất bại để tránh người dùng bị kẹt
      await delCache(`reg_pending:${email}`);
      throw new AppError(
        `Không thể gửi email OTP (Lỗi dịch vụ Mail: ${mailError?.message || 'Gửi thất bại'}). Vui lòng kiểm tra cấu hình Mail Server trong .env.`,
        500,
        'MAIL_DELIVERY_FAILED'
      );
    }

    // Thiết lập Cooldown 60s
    await setCache(`otp_cooldown:${email}`, Date.now() + 60 * 1000, 60);

    return {
      email,
      requireOtp: true,
      message: 'Mã xác thực OTP đã được gửi tới email của bạn (hiệu lực trong 5 phút)',
    };
  }

  // 1b. Gửi lại mã OTP đăng ký (nếu chưa hết hạn phiên đăng ký)
  async resendRegisterOtp(input: ResendRegisterOtpInput) {
    const email = input.email.trim().toLowerCase();

    // 0. Chặn Spam / Cooldown 60s giữa các lần gửi lại
    const cooldownUntil = await getCache<number>(`otp_cooldown:${email}`);
    if (cooldownUntil && cooldownUntil > Date.now()) {
      const waitSeconds = Math.max(1, Math.ceil((cooldownUntil - Date.now()) / 1000));
      throw new AppError(
        `Vui lòng đợi ${waitSeconds} giây trước khi yêu cầu gửi lại mã OTP.`,
        429,
        'OTP_COOLDOWN'
      );
    }

    const pendingData = await getCache<PendingRegisterEntry>(`reg_pending:${email}`);

    if (!pendingData) {
      throw new AppError(
        'Yêu cầu đăng ký đã hết hạn hoặc không tồn tại. Vui lòng nhập lại thông tin đăng ký.',
        400,
        'REGISTER_SESSION_EXPIRED'
      );
    }

    const currentResendCount = pendingData.resendCount || 0;
    if (currentResendCount >= 5) {
      await delCache(`reg_pending:${email}`);
      await delCache(`otp_cooldown:${email}`);
      throw new AppError(
        'Bạn đã vượt quá số lần gửi lại mã OTP cho phép (tối đa 5 lần). Vui lòng thử lại sau hoặc nhập lại thông tin.',
        429,
        'TOO_MANY_OTP_REQUESTS'
      );
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    pendingData.otp = otp;
    pendingData.attempts = 0;
    pendingData.resendCount = currentResendCount + 1;
    pendingData.expiresAt = expiresAt;

    await setCache(`reg_pending:${email}`, pendingData, 300);

    try {
      await sendOtpEmail(email, otp, pendingData.fullName);
    } catch (mailError: any) {
      throw new AppError(
        `Không thể gửi lại email OTP (Lỗi dịch vụ Mail: ${mailError?.message || 'Gửi thất bại'}).`,
        500,
        'MAIL_DELIVERY_FAILED'
      );
    }

    // Thiết lập Cooldown 60s
    await setCache(`otp_cooldown:${email}`, Date.now() + 60 * 1000, 60);

    return {
      email,
      remainingResends: 5 - pendingData.resendCount,
      message: `Đã gửi lại mã OTP 6 số mới tới email của bạn (còn ${5 - pendingData.resendCount} lần gửi lại)`,
    };
  }

  // 1c. Xác thực OTP & Chỉ lưu vào DB khi mã OTP hợp lệ
  async verifyRegisterOtp(input: VerifyRegisterOtpInput) {
    const email = input.email.trim().toLowerCase();
    const pendingData = await getCache<PendingRegisterEntry>(`reg_pending:${email}`);

    if (!pendingData) {
      throw new AppError(
        'Mã OTP không tồn tại hoặc phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.',
        400,
        'OTP_EXPIRED_OR_NOT_FOUND'
      );
    }

    if (Date.now() > pendingData.expiresAt) {
      await delCache(`reg_pending:${email}`);
      throw new AppError('Mã OTP đã hết hạn (chỉ có hiệu lực 5 phút)', 400, 'OTP_EXPIRED');
    }

    if (pendingData.attempts >= 5) {
      await delCache(`reg_pending:${email}`);
      throw new AppError(
        'Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng đăng ký lại để đảm bảo an toàn.',
        400,
        'OTP_MAX_ATTEMPTS'
      );
    }

    if (pendingData.otp !== input.otp.trim()) {
      pendingData.attempts += 1;
      const remainingSeconds = Math.max(1, Math.ceil((pendingData.expiresAt - Date.now()) / 1000));
      await setCache(`reg_pending:${email}`, pendingData, remainingSeconds);
      throw new AppError(
        `Mã OTP không chính xác (còn ${5 - pendingData.attempts} lần thử)`,
        400,
        'OTP_INVALID'
      );
    }

    // OTP CHÍNH XÁC: Kiểm tra lại DB phòng trường hợp trùng lặp race condition
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await delCache(`reg_pending:${email}`);
      throw new AppError('Email này đã được đăng ký tài khoản', 409, 'EMAIL_EXISTS');
    }

    if (pendingData.studentId?.trim()) {
      const studentIdUpper = pendingData.studentId.trim().toUpperCase();
      const existingProfileWithStudentId = await prisma.profile.findFirst({
        where: {
          kyc: {
            is: {
              studentId: {
                equals: studentIdUpper,
                mode: 'insensitive',
              },
            },
          },
        },
      });

      if (existingProfileWithStudentId) {
        await delCache(`reg_pending:${email}`);
        throw new AppError(
          `Mã số sinh viên (MSSV) "${studentIdUpper}" đã được đăng ký bởi tài khoản khác.`,
          409,
          'STUDENT_ID_EXISTS'
        );
      }
    }

    // 🚀 ĐÃ XÁC THỰC OTP THÀNH CÔNG: LÚC NÀY MỚI CHÍNH THỨC TẠO TÀI KHOẢN VÀ LƯU VÀO DB
    const emailLower = pendingData.email.toLowerCase().trim();
    const isEduEmail = emailLower.endsWith('@fpt.edu.vn') || emailLower.endsWith('@fe.edu.vn');
    const initialRole = isEduEmail ? 'BUYER' : 'UNVERIFIED';

    const user = await prisma.user.create({
      data: {
        email: pendingData.email,
        passwordHash: pendingData.passwordHash,
        role: initialRole,
        profile: {
          create: {
            fullName: pendingData.fullName,
            phoneNumber: pendingData.phoneNumber || '',
            campus: pendingData.campus,
            ...(pendingData.studentId
              ? {
                  kyc: {
                    studentId: pendingData.studentId,
                    cardImageUrl: '',
                    status: isEduEmail ? 'APPROVED' : 'NONE',
                  },
                }
              : {}),
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Xóa cache đăng ký tạm sau khi đã lưu DB thành công
    await delCache(`reg_pending:${email}`);
    await delCache(`otp_cooldown:${email}`);

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
      cohort: user.profile?.cohort || null,
      major: user.profile?.major || null,
      bio: user.profile?.bio || null,
      dorm: user.profile?.dorm || null,
      campusCoins: user.profile?.campusCoins ?? 0,
      reputationScore: user.profile?.reputationScore ?? 100,
      phoneNumber: user.profile?.phoneNumber,
      avatarUrl: user.profile?.avatarUrl,
      avatarBadge: user.profile?.avatarBadge,
      kyc: user.profile?.kyc,
      bankAccount: user.profile?.bankAccount,
      createdAt: user.createdAt,
    };

    return { user: userData, tokens };
  }

  // 1d. Wrapper register tương thích ngược (nếu có OTP thì verify & tạo DB, nếu chưa có thì gửi OTP)
  async register(input: RegisterInput) {
    if (input.otp) {
      return this.verifyRegisterOtp({
        email: input.email,
        otp: input.otp,
      });
    }
    return this.sendRegisterOtp(input);
  }

  // 2. Đăng nhập Email / Mật khẩu (Có cơ chế khóa tạm thời chống Brute-force vét cạn) - B1-7: Redis-backed
  async login(input: LoginInput) {
    const emailKey = input.email.trim().toLowerCase();
    const nowMs = Date.now();
    const attemptRecord = await getCache<LoginAttemptRecord>(`login_attempt:${emailKey}`);

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
      const lockedUntil = currentAttempts >= 5 ? nowMs + 15 * 60 * 1000 : undefined;
      await setCache(
        `login_attempt:${emailKey}`,
        { attempts: currentAttempts, ...(lockedUntil && { lockedUntil }) },
        15 * 60
      );
      throw new AppError('Email hoặc mật khẩu không chính xác', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa', 403, 'ACCOUNT_LOCKED');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      const currentAttempts = (attemptRecord?.attempts || 0) + 1;
      if (currentAttempts >= 5) {
        await setCache(
          `login_attempt:${emailKey}`,
          {
            attempts: currentAttempts,
            lockedUntil: nowMs + 15 * 60 * 1000, // Tạm khóa 15 phút
          },
          15 * 60
        );
        throw new AppError(
          'Bạn đã nhập sai mật khẩu 5 lần liên tiếp. Tài khoản bị tạm khóa 15 phút để đảm bảo an toàn.',
          429,
          'ACCOUNT_TEMPORARILY_LOCKED'
        );
      } else {
        await setCache(
          `login_attempt:${emailKey}`,
          { attempts: currentAttempts },
          15 * 60
        );
        throw new AppError(
          `Email hoặc mật khẩu không chính xác. Bạn còn ${5 - currentAttempts} lần thử.`,
          401,
          'INVALID_CREDENTIALS'
        );
      }
    }

    // Đăng nhập thành công -> Xóa bộ đếm số lần thử sai
    await delCache(`login_attempt:${emailKey}`);

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
      cohort: profile?.cohort || null,
      major: profile?.major || null,
      bio: profile?.bio || null,
      dorm: profile?.dorm || null,
      campusCoins: profile?.campusCoins ?? 0,
      reputationScore: profile?.reputationScore ?? 100,
      kyc: profile?.kyc,
      bankAccount: profile?.bankAccount,
    };

    return { user: userData, tokens };
  }

  // 3. Đăng nhập Google OAuth (Web & Mobile)
  async googleAuth(input: GoogleAuthInput) {
    let payload: { email?: string; name?: string; picture?: string } | undefined;
    try {
      if (ENV.NODE_ENV === 'development' && (input.idToken.startsWith('dev_token_') || input.idToken.startsWith('mock_google_'))) {
        const rawEmail = input.idToken.replace(/^(dev_token_|mock_google_)/, '').trim().toLowerCase();
        const email = rawEmail.includes('@') ? rawEmail : `${rawEmail}@fe.edu.vn`;
        payload = {
          email,
          name: email.split('@')[0],
          picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        };
      } else {
        const allowedAudiences = [
          ENV.GOOGLE_CLIENT_ID,
          ENV.GOOGLE_ANDROID_CLIENT_ID,
          '286340231733-gh3a161bch9t883cu5nm5c80e22lpplt.apps.googleusercontent.com',
          '286340231733-qgivinnpgkh481i8ghvsp021cbo53eir.apps.googleusercontent.com',
          '1093899519891-c9r9jv1imm3s104crlhels37fl71stuo.apps.googleusercontent.com',
        ].filter(Boolean) as string[];
        const ticket = await googleClient.verifyIdToken({
          idToken: input.idToken,
          audience: allowedAudiences,
        });
        payload = ticket.getPayload();
      }
    } catch (err: any) {
      logger.error('Google verifyIdToken failed:', err?.message || err);
      throw new AppError('Google ID Token không hợp lệ hoặc đã hết hạn', 401, 'INVALID_GOOGLE_TOKEN');
    }

    if (!payload || !payload.email) {
      throw new AppError('Không thể lấy thông tin email từ tài khoản Google', 400, 'GOOGLE_EMAIL_MISSING');
    }

    const email = payload.email;
    const emailLower = email.toLowerCase().trim();
    const isEduEmail = emailLower.endsWith('@fpt.edu.vn') || emailLower.endsWith('@fe.edu.vn');
    const initialRole = 'BUYER';
    const fullName = payload.name || email.split('@')[0] || 'Người dùng Google';
    const avatarUrl = payload.picture || undefined;

    let user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: initialRole,
          profile: {
            create: {
              fullName,
              avatarUrl,
              campus: input.campus,
              ...(isEduEmail
                ? {
                    kyc: {
                      studentId: email.split('@')[0].toUpperCase(),
                      cardImageUrl: '',
                      status: 'APPROVED',
                      type: 'STUDENT',
                      verifiedAt: new Date(),
                    },
                  }
                : {}),
            },
          },
        },
        include: { profile: true },
      });
    } else if (!user.isActive) {
      throw new AppError('Tài khoản của bạn đã bị khóa', 403, 'ACCOUNT_LOCKED');
    } else if (!user.profile) {
      const newProfile = await prisma.profile.create({
        data: {
          userId: user.id,
          fullName,
          avatarUrl,
          campus: input.campus,
        },
      });
      user.profile = newProfile;
    } else if (avatarUrl && user.profile.avatarUrl !== avatarUrl) {
      const isCustomR2Avatar = user.profile.avatarUrl && (
        user.profile.avatarUrl.includes('r2.dev') ||
        user.profile.avatarUrl.includes('r2.cloudflarestorage.com') ||
        user.profile.avatarUrl.includes('/uploads/')
      );
      if (!isCustomR2Avatar) {
        const updatedProfile = await prisma.profile.update({
          where: { userId: user.id },
          data: { avatarUrl },
        });
        user.profile = updatedProfile;
      }
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
      cohort: profile?.cohort || null,
      major: profile?.major || null,
      bio: profile?.bio || null,
      dorm: profile?.dorm || null,
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
          role: 'UNVERIFIED',
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
      cohort: userProfile?.cohort || null,
      major: userProfile?.major || null,
      bio: userProfile?.bio || null,
      dorm: userProfile?.dorm || null,
      campusCoins: userProfile?.campusCoins ?? 0,
      reputationScore: userProfile?.reputationScore ?? 100,
      kyc: userProfile?.kyc,
      bankAccount: userProfile?.bankAccount,
    };

    return { user: userData, tokens };
  }

  // 5. Cấp lại Access Token từ Refresh Token (B1-5: Token Rotation & Reuse Detection)
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('Refresh Token không tồn tại', 401, 'REFRESH_TOKEN_MISSING');
    }

    let payload: RefreshTokenPayload;
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

    // B1-5: Phát hiện Tái sử dụng Refresh Token (Reuse Detection)
    if (payload.jti) {
      const isAlreadyUsed = await getCache<boolean>(`used_token:${payload.jti}`);
      if (isAlreadyUsed) {
        // Tái sử dụng token đã xoay vòng -> Khả năng cao token đã bị rò rỉ hoặc đánh cắp!
        // Tức thì tăng tokenVersion trong DB để hủy toàn bộ phiên của tài khoản này
        await prisma.user.update({
          where: { id: user.id },
          data: { tokenVersion: { increment: 1 } },
        });
        throw new AppError(
          'Cảnh báo an toàn: Phát hiện Refresh Token cũ đã qua sử dụng! Tất cả các phiên đăng nhập đã bị hủy để bảo vệ tài khoản.',
          401,
          'TOKEN_REUSE_DETECTED'
        );
      }

      // Đánh dấu token cũ này đã được sử dụng (vào blacklist của Redis trong 30 ngày)
      await setCache(`used_token:${payload.jti}`, true, 30 * 24 * 60 * 60);
    }

    // Xoay vòng cấp cặp Token mới tinh kèm jti mới
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

    // Chặn Spam Cooldown 60s giữa các lần gửi mã khôi phục mật khẩu
    const cooldownUntil = await getCache<number>(`otp_cooldown:pwd:${email}`);
    if (cooldownUntil && cooldownUntil > Date.now()) {
      const waitSeconds = Math.max(1, Math.ceil((cooldownUntil - Date.now()) / 1000));
      throw new AppError(
        `Vui lòng đợi ${waitSeconds} giây trước khi yêu cầu gửi lại mã khôi phục mật khẩu.`,
        429,
        'OTP_COOLDOWN'
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.isActive) {
      // Bảo mật (F-04): Trả về phản hồi đồng nhất, chống User Enumeration dò quét email sinh viên
      return {
        email,
        message: 'Nếu email tồn tại trong hệ thống, mã OTP xác thực đã được gửi tới email của bạn (hiệu lực trong 5 phút)',
      };
    }

    // Sinh mã OTP ngẫu nhiên 6 chữ số bằng CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 phút

    await setCache(
      `pwd_reset:${email}`,
      {
        otp,
        expiresAt,
        attempts: 0,
      },
      5 * 60
    );

    // Gửi email qua SMTP
    await sendPasswordResetOtpEmail(user.email, otp, user.profile?.fullName || 'Sinh viên FU');

    // Thiết lập Cooldown 60s
    await setCache(`otp_cooldown:pwd:${email}`, Date.now() + 60 * 1000, 60);

    return {
      email: user.email,
      message: 'Nếu email tồn tại trong hệ thống, mã OTP xác thực đã được gửi tới email của bạn (hiệu lực trong 5 phút)',
    };
  }

  // 8. Xác thực OTP & Đặt mật khẩu mới (Chưa đăng nhập) - B1-7: Redis-backed
  async resetPassword(input: ResetPasswordInput) {
    const email = input.email.trim().toLowerCase();
    const entry = await getCache<PasswordResetEntry>(`pwd_reset:${email}`);

    if (!entry) {
      throw new AppError(
        'Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu mã mới.',
        400,
        'OTP_EXPIRED_OR_NOT_FOUND'
      );
    }

    if (Date.now() > entry.expiresAt) {
      await delCache(`pwd_reset:${email}`);
      throw new AppError('Mã OTP đã hết hạn (chỉ có hiệu lực 5 phút)', 400, 'OTP_EXPIRED');
    }

    if (entry.attempts >= 5) {
      await delCache(`pwd_reset:${email}`);
      throw new AppError(
        'Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã mới để bảo mật.',
        429,
        'TOO_MANY_OTP_ATTEMPTS'
      );
    }

    if (entry.otp !== input.otp) {
      entry.attempts += 1;
      const remainingSeconds = Math.max(1, Math.round((entry.expiresAt - Date.now()) / 1000));
      await setCache(`pwd_reset:${email}`, entry, remainingSeconds);
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
    await delCache(`pwd_reset:${email}`);

    return {
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.',
    };
  }
}

export const authService = new AuthService();
