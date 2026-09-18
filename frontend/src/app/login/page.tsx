'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm, { RegisterData } from '@/components/auth/RegisterForm';
import OtpVerificationStep from '@/components/auth/OtpVerificationStep';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { useMarket } from '@/context/MarketContext';
import { useAdminStore } from '@/stores/adminStore';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  LogIn,
  UserPlus,
  KeyRound,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, updateProfile, showToast } = useMarket();
  const adminLogin = useAdminStore((s) => s.login);

  // Primary mode: 'login' | 'register' | 'forgot-password'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');

  // Register sub-step: 'form' | 'otp'
  const [registerStep, setRegisterStep] = useState<'form' | 'otp'>('form');
  const [pendingRegisterData, setPendingRegisterData] = useState<RegisterData | null>(null);

  // Demo switcher for login: 'normal' | 'error' | 'loading'
  const [demoState, setDemoState] = useState<'normal' | 'error' | 'loading'>('normal');

  const handleLoginSuccess = (email: string, password?: string) => {
    // 1. Kiểm tra nếu là tài khoản Quản trị viên (BQT)
    if (password) {
      const adminResult = adminLogin(email, password);
      if (adminResult.success) {
        document.cookie = 'admin_logged_in=true; Max-Age=86400; path=/; SameSite=strict';
        showToast('🛡️ Đăng nhập Quản trị viên BQT thành công! Đang vào trung tâm điều hành...', 'success');
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 800);
        return;
      }

      // Nếu nhập email BQT nhưng sai mật khẩu
      const isKnownAdmin = ['admin@fpt.edu.vn', 'mod.hola@fpt.edu.vn'].includes(email.toLowerCase().trim());
      if (isKnownAdmin) {
        setDemoState('error');
        showToast('Mật khẩu quản trị viên BQT không chính xác. Vui lòng kiểm tra lại.', 'error');
        return;
      }
    }

    // 2. Tài khoản Sinh viên FPT 5Campus thông thường
    login(email);
    showToast('🎉 Đăng nhập thành công! Chào mừng bạn trở lại FPT 5Campus.', 'success');
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  const handleFptMailSso = () => {
    setDemoState('loading');
    setTimeout(() => {
      login('quanlmse172819@fe.edu.vn');
      showToast('🔑 Xác thực Google SSO thành công!', 'success');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }, 1000);
  };

  const handleProceedToOtp = (data: RegisterData) => {
    setPendingRegisterData(data);
    setRegisterStep('otp');
  };

  const handleRegisterOtpSuccess = (otp: string) => {
    if (pendingRegisterData) {
      updateProfile({
        name: pendingRegisterData.fullName,
        email: pendingRegisterData.email,
        studentId: pendingRegisterData.studentId,
        campus: pendingRegisterData.campus,
      });
      login(pendingRegisterData.email);
    }
    showToast('🎉 Đăng ký tài khoản FPT thành công! Bạn đã được tự động đăng nhập.', 'success');
    setTimeout(() => {
      router.push('/');
    }, 1200);
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
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>CỘNG ĐỒNG P2P KHÉP KÍN FPT EDU</span>
            </div>

            {/* Logo & Headline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative h-9 w-40">
                  <Image
                    src="/fpt-5campus-logo.png"
                    alt="FPT 5Campus"
                    fill
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
                  <span
                    key={camp}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs"
                  >
                    <MapPin className="h-3.5 w-3.5 text-fpt-orange" />
                    <span>{camp}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 2 Big Stat Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <div className="flex items-center gap-2 text-fpt-orange mb-1">
                  <QrCode className="h-5 w-5" />
                  <span className="text-xl sm:text-2xl font-black text-slate-900">12.000+</span>
                </div>
                <p className="text-xs text-slate-500 leading-tight">
                  Sinh viên FPT 5 campus tin cậy trao đổi hàng ngày
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-xl sm:text-2xl font-black text-slate-900">100%</span>
                </div>
                <p className="text-xs text-slate-500 leading-tight">
                  Tài khoản chuẩn hóa qua email @fpt.edu.vn
                </p>
              </div>
            </div>

            {/* Verified Student Demo Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                    FU
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Lê Minh Quân</h4>
                    <p className="text-[11px] text-slate-500">K17 SE • Hola Campus</p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Đã xác thực
                </span>
              </div>

              <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-2.5 flex items-center gap-3">
                <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                  <Image
                    src="/products/books-mas291.jpg"
                    alt="Giáo trình"
                    fill
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
            </div>
          </div>

          {/* RIGHT COLUMN: AUTH MODES CONTAINER (6 COLS) */}
          <div className="lg:col-span-6 space-y-3">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between text-xs bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-1 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setRegisterStep('form');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 font-bold transition cursor-pointer text-xs ${
                    authMode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Đăng nhập</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setRegisterStep('form');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 font-bold transition cursor-pointer text-xs ${
                    authMode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Đăng ký</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('forgot-password')}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 font-bold transition cursor-pointer text-xs ${
                    authMode === 'forgot-password'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Quên MK</span>
                </button>
              </div>
            </div>

            {/* Main Auth Form Box */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-lg shadow-slate-200/40 space-y-5">
              {/* 1. Login Mode */}
              {authMode === 'login' && (
                <LoginForm
                  onSwitchMode={(mode) => {
                    setAuthMode(mode);
                    setRegisterStep('form');
                  }}
                  onLoginSuccess={handleLoginSuccess}
                  onFptMailSso={handleFptMailSso}
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
            </div>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM FOOTER */}
      <footer className="w-full bg-white border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © 2024 FPT Education Campus Network. Đăng nhập bằng email @fpt.edu.vn
      </footer>
    </div>
  );
}
