'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import LoginForm, { GoogleIcon } from '@/components/auth/LoginForm';
import RegisterForm, { RegisterData } from '@/components/auth/RegisterForm';
import OtpVerificationStep from '@/components/auth/OtpVerificationStep';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { useMarket } from '@/context/MarketContext';
import { useAdminStore } from '@/stores/adminStore';
import { useUserStore } from '@/stores/userStore';
import { authService } from '@/services/authService';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  LogIn,
  UserPlus,
  KeyRound,
  X,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/';
  const modeParam = searchParams.get('mode');

  const { login, updateProfile, showToast } = useMarket();

  // Primary mode: 'login' | 'register' | 'forgot-password'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>(
    modeParam === 'register' ? 'register' : 'login'
  );

  // Register sub-step: 'form' | 'otp'
  const [registerStep, setRegisterStep] = useState<'form' | 'otp'>('form');
  const [pendingRegisterData, setPendingRegisterData] = useState<RegisterData | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  // Demo switcher for login: 'normal' | 'error' | 'loading'
  const [demoState, setDemoState] = useState<'normal' | 'error' | 'loading'>('normal');

  const handleLoginSuccess = async (email: string, password?: string) => {
    try {
      if (!password) {
        showToast('Vui lòng nhập mật khẩu tài khoản.', 'error');
        setDemoState('error');
        return;
      }

      const res = await authService.login({ email, password });

      // Nếu tài khoản có vai trò ADMIN từ Backend
      if (res?.user?.role === 'ADMIN') {
        const adminProfile = {
          name: res.user.profile?.fullName || res.user.email?.split('@')[0] || 'Quản trị viên',
          email: res.user.email,
          role: 'superadmin' as const,
          campus: 'all' as const,
          avatarInitial: (res.user.profile?.fullName || 'A')[0].toUpperCase(),
          permissions: [
            'posts.approve',
            'posts.reject',
            'posts.delete',
            'kyc.approve',
            'kyc.reject',
            'users.manage',
            'users.trust_score',
            'reports.handle',
            'safehandoff.manage',
            'settings.system',
          ],
        };
        useAdminStore.setState({ admin: adminProfile, isLoggedIn: true, accessToken: res.tokens?.accessToken || null });
        document.cookie = 'admin_logged_in=true; Max-Age=86400; path=/; SameSite=strict';
        showToast('🛡️ Đăng nhập Quản trị viên BQT thành công! Đang vào trung tâm điều hành...', 'success');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 800);
        return;
      }

      showToast('🎉 Đăng nhập thành công! Chào mừng bạn trở lại FPT 5Campus.', 'success');
      setTimeout(() => {
        router.push(redirectParam);
      }, 800);
    } catch (err: any) {
      setDemoState('error');
      showToast(err?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu.', 'error');
    }
  };

  // Google Auth state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Thực hiện gọi Backend POST /api/auth/google với ID Token
  const executeGoogleLogin = async (idToken: string) => {
    setIsGoogleLoading(true);
    setDemoState('loading');
    try {
      const res = await authService.loginWithGoogle(idToken);

      // Nếu tài khoản có vai trò ADMIN từ Backend
      if (res?.user?.role === 'ADMIN') {
        const adminProfile = {
          name: res.user.profile?.fullName || res.user.email?.split('@')[0] || 'Quản trị viên',
          email: res.user.email,
          role: 'superadmin' as const,
          campus: 'all' as const,
          avatarInitial: (res.user.profile?.fullName || 'A')[0].toUpperCase(),
          permissions: [
            'posts.approve',
            'posts.reject',
            'posts.delete',
            'kyc.approve',
            'kyc.reject',
            'users.manage',
            'users.trust_score',
            'reports.handle',
            'safehandoff.manage',
            'settings.system',
          ],
        };
        useAdminStore.setState({ admin: adminProfile, isLoggedIn: true });
        document.cookie = 'admin_logged_in=true; Max-Age=86400; path=/; SameSite=strict';
        showToast('🛡️ Đăng nhập Google quyền Quản trị viên BQT thành công! Đang vào dashboard...', 'success');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 800);
        return;
      }

      showToast('🎉 Đăng nhập Google thành công! Chào mừng bạn trở lại FPT 5Campus.', 'success');
      setTimeout(() => {
        router.push(redirectParam);
      }, 800);
    } catch (err: any) {
      setDemoState('normal');
      showToast(err?.message || 'Đăng nhập Google thất bại. Vui lòng kiểm tra lại.', 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Khởi tạo Google Identity Services (GIS)
  const initGoogleAuth = () => {
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '1093899519891-c9r9jv1imm3s104crlhels37fl71stuo.apps.googleusercontent.com';
    const google = typeof window !== 'undefined' ? (window as any).google : undefined;
    if (google?.accounts?.id && !(window as any).__googleGsiInitialized) {
      try {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response?.credential) {
              if (typeof (window as any).__onGoogleCredential === 'function') {
                (window as any).__onGoogleCredential(response.credential);
              } else {
                executeGoogleLogin(response.credential);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        (window as any).__googleGsiInitialized = true;
      } catch (err) {
        console.warn('Lỗi khởi tạo Google Auth:', err);
      }
    }
  };

  const handleProceedToOtp = async (data: RegisterData) => {
    setRegisterError(null);
    setIsRegisterLoading(true);
    try {
      showToast('Đang kiểm tra thông tin & gửi mã OTP...', 'info');
      const campusMap: Record<string, string> = {
        'Hòa Lạc': 'HOL',
        'Hồ Chí Minh': 'HCM',
        'Đà Nẵng': 'DAD',
        'Quy Nhơn': 'QN',
        'Cần Thơ': 'CT',
      };
      let recaptchaToken: string | undefined = undefined;
      const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      const grecaptcha = typeof window !== 'undefined' ? (window as any).grecaptcha : undefined;
      if (recaptchaSiteKey && grecaptcha?.execute) {
        try {
          recaptchaToken = await new Promise<string>((resolve, reject) => {
            grecaptcha.ready(() => {
              grecaptcha.execute(recaptchaSiteKey, { action: 'register' }).then(resolve).catch(reject);
            });
          });
        } catch (rcErr) {
          console.warn('reCAPTCHA execute fallback:', rcErr);
        }
      }
      await authService.sendRegisterOtp({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        studentId: data.studentId,
        campus: campusMap[data.campus] || 'HOL',
        recaptchaToken,
      });
      setPendingRegisterData(data);
      setRegisterStep('otp');
      showToast('✉️ Mã OTP 6 số đã được gửi tới email của bạn (hiệu lực trong 5 phút)', 'success');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Không thể gửi mã OTP xác thực';
      setRegisterError(msg);
      showToast(msg, 'error');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleResendRegisterOtp = async () => {
    if (!pendingRegisterData?.email) return;
    try {
      showToast('Đang gửi lại mã OTP mới...', 'info');
      await authService.resendRegisterOtp(pendingRegisterData.email);
      showToast(`✉️ Đã gửi lại mã OTP mới tới ${pendingRegisterData.email}`, 'success');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Không thể gửi lại mã OTP';
      showToast(msg, 'error');
      throw err;
    }
  };

  const handleRegisterOtpSuccess = async (otp: string) => {
    if (pendingRegisterData) {
      try {
        await authService.verifyRegisterOtp({
          email: pendingRegisterData.email,
          otp,
        });

        // Đảm bảo thông tin sinh viên đăng ký được lưu đầy đủ vào User Store
        const sId = pendingRegisterData.studentId?.trim().toUpperCase() || '';
        const cMatch = sId.match(/\d{2}/)?.[0];
        const derivedCohort = cMatch ? `K${cMatch}` : 'K18';
        const isSE = sId.includes('SE') || sId.includes('HE');
        const derivedMajor = isSE ? 'Kỹ thuật Phần mềm (SE)' : 'Công nghệ thông tin';

        useUserStore.getState().updateProfile({
          name: pendingRegisterData.fullName.trim(),
          studentId: sId,
          campus: pendingRegisterData.campus,
          cohort: derivedCohort,
          major: derivedMajor,
        });

        showToast('🎉 Đăng ký tài khoản FPT thành công! Bạn đã được tự động đăng nhập.', 'success');
        setTimeout(() => {
          router.push('/');
        }, 1200);
      } catch (err: any) {
        const msg =
          err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          err?.message ||
          'Mã OTP không chính xác!';
        showToast(msg, 'error');
      }
    }
  };

  const handleResetSuccess = (email: string, newPass: string) => {
    setAuthMode('login');
    showToast('🔑 Đổi mật khẩu thành công! Mời bạn đăng nhập bằng mật khẩu mới.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 justify-between">
      {/* 1. TOP HEADER */}
      <header className="w-full bg-white border-b border-slate-100 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-36 sm:h-9 sm:w-44">
            <Image
              src="/fpt-5campus-logo.png"
              alt="FPT 5Campus Marketplace"
              fill
              priority
              sizes="(max-width: 640px) 144px, 176px"
              className="object-contain object-left"
            />
          </div>
          <span className="hidden sm:inline font-black text-slate-900 text-base tracking-tight">
            5Campus
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại chợ</span>
        </Link>
      </header>

      {/* 2. MAIN 2-COLUMN CONTENT */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: BRAND & VALUE PROPOSITION (6 COLS) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Tag */}
            <Badge variant="success" className="gap-2 px-3 py-1 text-xs font-bold shadow-xs normal-case">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>CỘNG ĐỒNG P2P KHÉP KÍN FPT EDU</span>
            </Badge>

            {/* Logo & Headline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative h-9 w-40">
                  <Image
                    src="/fpt-5campus-logo.png"
                    alt="FPT 5Campus"
                    fill
                    sizes="160px"
                    className="object-contain object-left"
                  />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-slate-900 leading-[1.15] tracking-tight">
                Mua bán dễ dàng trong cộng đồng{' '}
                <span className="text-fpt-orange">FPT 5Campus</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Tìm đồ bạn cần. Bán đồ bạn không dùng. Giao dịch an toàn, trao tay trực tiếp giữa sinh viên và giảng viên FPT.
              </p>
            </div>

            {/* 5 Campuses Network */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                MẠNG LƯỚI 5 CƠ SỞ HOẠT ĐỘNG
              </div>
              <div className="flex flex-wrap gap-2">
                {['Hòa Lạc', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Cần Thơ', 'Quy Nhơn'].map((camp) => (
                  <Badge
                    key={camp}
                    variant="outline"
                    className="gap-1.5 rounded-full border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-white"
                  >
                    <MapPin className="h-3.5 w-3.5 text-fpt-orange" />
                    <span>{camp}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* 2 Big Stat Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
              <Card className="rounded-2xl border-slate-200/90 bg-white p-4 shadow-xs">
                <div className="flex items-center gap-2 text-fpt-orange mb-1">
                  <QrCode className="h-5 w-5" />
                  <span className="text-xl sm:text-2xl font-black text-slate-900">12.000+</span>
                </div>
                <p className="text-xs text-slate-500 leading-tight">
                  Sinh viên FPT 5 campus tin cậy trao đổi hàng ngày
                </p>
              </Card>

              <Card className="rounded-2xl border-slate-200/90 bg-white p-4 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xl sm:text-2xl font-black text-slate-900">100%</span>
                </div>
                <p className="text-xs text-slate-500 leading-tight">
                  Tài khoản chuẩn hóa qua email @fpt.edu.vn
                </p>
              </Card>
            </div>

            {/* Verified Student Demo Card */}
            <Card className="rounded-2xl border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-9 w-9 bg-slate-200">
                    <AvatarFallback className="font-bold text-slate-700 text-xs bg-slate-200">
                      FU
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Sinh viên FPT</h4>
                    <p className="text-[11px] text-slate-500">K17 SE • Hola Campus</p>
                  </div>
                </div>

                <Badge variant="success" className="px-2.5 py-0.5 text-[11px] font-bold gap-1 normal-case">
                  <CheckCircle2 className="h-3 w-3" />
                  Đã xác thực
                </Badge>
              </div>

              <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-2.5 flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                  <Image
                    src="/products/books-mas291.jpg"
                    alt="Giáo trình"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <span className="rounded bg-slate-200/80 px-1 text-slate-700 font-semibold">
                      Sách & Phụ kiện
                    </span>
                    <span>• Mới 98%</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-800 truncate mt-0.5">
                    Giáo trình PRF192 + Chuột Logitech G102
                  </h5>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xs font-black text-fpt-orange">190.000 đ</span>
                    <span className="text-[10px] text-slate-400 line-through">350.000 đ</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: AUTH MODES CONTAINER (6 COLS) */}
          <div className="lg:col-span-6 space-y-3">
            {/* Mode Switcher Tabs */}
            <Tabs
              value={authMode}
              onValueChange={(val) => {
                setAuthMode(val as any);
                if (val === 'register') setRegisterStep('form');
              }}
              className="w-full"
            >
              <TabsList className="w-full bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 h-auto gap-1">
                <TabsTrigger
                  value="login"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-600 hover:text-slate-900"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Đăng nhập</span>
                </TabsTrigger>

                <TabsTrigger
                  value="register"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-600 hover:text-slate-900"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Đăng ký</span>
                </TabsTrigger>

                <TabsTrigger
                  value="forgot-password"
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs text-slate-600 hover:text-slate-900"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Quên MK</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Main Auth Form Box */}
            <Card className="rounded-3xl border-slate-200/90 bg-white p-6 sm:p-8 shadow-lg shadow-slate-200/40 space-y-5">
              {/* 1. Login Mode */}
              {authMode === 'login' && (
                <LoginForm
                  onSwitchMode={(mode) => {
                    setAuthMode(mode);
                    setRegisterStep('form');
                  }}
                  onLoginSuccess={handleLoginSuccess}
                  onGoogleSuccess={executeGoogleLogin}
                  isGoogleLoading={isGoogleLoading}
                  demoState={demoState}
                  setDemoState={setDemoState}
                  onShowToast={showToast}
                />
              )}

              {/* 2. Register Mode (Form or OTP) */}
              {authMode === 'register' && (
                <>
                  {registerStep === 'form' ? (
                    <RegisterForm
                      onProceedToOtp={handleProceedToOtp}
                      onSwitchToLogin={() => setAuthMode('login')}
                      onShowToast={showToast}
                      serverError={registerError}
                      isLoading={isRegisterLoading}
                      onClearServerError={() => setRegisterError(null)}
                    />
                  ) : (
                    <OtpVerificationStep
                      targetEmail={pendingRegisterData?.email || 'anvhe172819@fpt.edu.vn'}
                      title="Xác thực OTP tạo tài khoản"
                      subtitle={
                        <>
                          Mã OTP kích hoạt tài khoản đã gửi tới email{' '}
                          <strong className="text-slate-800">{pendingRegisterData?.email}</strong>
                        </>
                      }
                      onVerifySuccess={handleRegisterOtpSuccess}
                      onBack={() => setRegisterStep('form')}
                      onResendOtp={handleResendRegisterOtp}
                      onShowToast={showToast}
                    />
                  )}
                </>
              )}

              {/* 3. Forgot Password Mode */}
              {authMode === 'forgot-password' && (
                <ForgotPasswordForm
                  onSwitchToLogin={() => setAuthMode('login')}
                  onResetSuccess={handleResetSuccess}
                  onShowToast={showToast}
                />
              )}

              {/* Security Footnote */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Mã hóa an toàn SSL 256-bit • Dành riêng cho người FPT</span>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Google Identity Services Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogleAuth}
      />
      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}

      {/* 3. BOTTOM FOOTER */}
      <footer className="w-full bg-white border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © 2024 FPT Education Campus Network. Đăng nhập bằng email @fpt.edu.vn hoặc tài khoản Google
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
          Đang tải trang đăng nhập...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
