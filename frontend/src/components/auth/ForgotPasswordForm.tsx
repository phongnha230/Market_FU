'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import OtpVerificationStep from './OtpVerificationStep';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onResetSuccess: (email: string, newPass: string) => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function ForgotPasswordForm({
  onSwitchToLogin,
  onResetSuccess,
  onShowToast,
}: ForgotPasswordFormProps) {
  // Sub-step: 'email' | 'otp' | 'new-password'
  const [step, setStep] = useState<'email' | 'otp' | 'new-password'>('email');

  const [email, setEmail] = useState('namntk17@fe.edu.vn');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isStrongPassword = hasMinLen && hasUpper && hasNumber && hasSpecial;

  // Step 1: Submit Email
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) {
      onShowToast('Vui lòng nhập đúng định dạng email (Gmail, FE Mail...)!', 'warning');
      return;
    }
    onShowToast(`Đã gửi mã xác minh OTP 6 số đến email ${email}!`, 'info');
    setStep('otp');
  };

  // Step 2: OTP Verified
  const handleOtpVerified = (otp: string) => {
    onShowToast('Xác thực OTP danh tính thành công! Mời bạn tạo mật khẩu mới.', 'success');
    setStep('new-password');
  };

  // Step 3: Set New Password
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrongPassword) {
      onShowToast('Mật khẩu chưa đạt chuẩn an toàn. Vui lòng hoàn thành các tiêu chí màu đỏ bên dưới!', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      onShowToast('Xác nhận mật khẩu mới không khớp!', 'error');
      return;
    }
    onShowToast('Đã đặt lại mật khẩu mới thành công! Vui lòng đăng nhập lại.', 'success');
    onResetSuccess(email, newPassword);
  };

  if (step === 'otp') {
    return (
      <OtpVerificationStep
        targetEmail={email}
        title="Xác thực Đặt lại mật khẩu"
        subtitle={<>Nhập mã OTP 6 số đã gửi đến email <strong className="text-slate-800">{email}</strong> để tiếp tục.</>}
        onVerifySuccess={handleOtpVerified}
        onBack={() => setStep('email')}
        onShowToast={onShowToast}
      />
    );
  }

  if (step === 'new-password') {
    return (
      <div className="space-y-4">
        <div>
          <button
            type="button"
            onClick={() => setStep('email')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-3 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Quay lại</span>
          </button>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Thiết lập mật khẩu mới</span>
            <span>🔐</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tài khoản: <strong className="text-slate-800">{email}</strong>
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                required
                className="w-full rounded-xl border border-slate-200 p-3 pr-10 text-xs sm:text-sm text-slate-800 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
              className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>

          {/* Password Security Checklist */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                Tiêu chuẩn mật khẩu an toàn:
              </span>
              {newPassword.length > 0 && (
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                    isStrongPassword
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-rose-100 text-rose-700 border border-rose-300'
                  }`}
                >
                  {isStrongPassword ? '✓ Đạt chuẩn' : '⚠ Chưa đủ điều kiện'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              <div
                className={`flex items-center gap-1.5 ${
                  hasMinLen
                    ? 'text-emerald-700 font-semibold'
                    : newPassword.length > 0
                    ? 'text-rose-600 font-medium'
                    : 'text-slate-500'
                }`}
              >
                {hasMinLen ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle
                    className={`h-3.5 w-3.5 shrink-0 ${
                      newPassword.length > 0 ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  />
                )}
                <span>Tối thiểu 8 ký tự</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  hasUpper
                    ? 'text-emerald-700 font-semibold'
                    : newPassword.length > 0
                    ? 'text-rose-600 font-medium'
                    : 'text-slate-500'
                }`}
              >
                {hasUpper ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle
                    className={`h-3.5 w-3.5 shrink-0 ${
                      newPassword.length > 0 ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  />
                )}
                <span>Ít nhất 1 chữ in hoa (A-Z)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  hasNumber
                    ? 'text-emerald-700 font-semibold'
                    : newPassword.length > 0
                    ? 'text-rose-600 font-medium'
                    : 'text-slate-500'
                }`}
              >
                {hasNumber ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle
                    className={`h-3.5 w-3.5 shrink-0 ${
                      newPassword.length > 0 ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  />
                )}
                <span>Ít nhất 1 chữ số (0-9)</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  hasSpecial
                    ? 'text-emerald-700 font-semibold'
                    : newPassword.length > 0
                    ? 'text-rose-600 font-medium'
                    : 'text-slate-500'
                }`}
              >
                {hasSpecial ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle
                    className={`h-3.5 w-3.5 shrink-0 ${
                      newPassword.length > 0 ? 'text-rose-500' : 'text-slate-400'
                    }`}
                  />
                )}
                <span>1 ký tự đặc biệt (!@#$%^...)</span>
              </div>
            </div>

            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-[11px] text-rose-600 font-medium pt-1.5 border-t border-rose-200/60 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                <span>Mật khẩu xác nhận không khớp, vui lòng kiểm tra lại!</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-fpt-orange py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Lưu mật khẩu & Đăng nhập ngay</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-3 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại đăng nhập</span>
        </button>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Quên mật khẩu</span>
          <span>🔑</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Nhập địa chỉ email cá nhân / FE Mail đã đăng ký để nhận mã OTP khôi phục
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
              Email đăng ký
            </label>
            <span className="text-[11px] text-slate-400">Gmail, FE Mail...</span>
          </div>

          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="se172819@fe.edu.vn hoặc gmail..."
              required
              className="w-full rounded-xl border border-slate-200 p-3 pr-10 text-xs sm:text-sm text-slate-800 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
            />
            {isValidEmail && (
              <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-fpt-orange py-3.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Gửi mã OTP xác nhận danh tính</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="text-center text-xs text-slate-600 pt-2">
        Nhớ lại mật khẩu?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-fpt-orange hover:underline cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    </div>
  );
}
