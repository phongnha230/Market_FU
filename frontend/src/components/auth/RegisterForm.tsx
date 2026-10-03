'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface RegisterData {
  fullName: string;
  studentId: string;
  campus: string;
  email: string;
  password: string;
}

interface RegisterFormProps {
  onProceedToOtp: (data: RegisterData) => void;
  onSwitchToLogin: () => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  serverError?: string | null;
  isLoading?: boolean;
  onClearServerError?: () => void;
}

export default function RegisterForm({
  onProceedToOtp,
  onSwitchToLogin,
  onShowToast,
  serverError,
  isLoading = false,
  onClearServerError,
}: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [campus, setCampus] = useState('Hòa Lạc');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Captcha state
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  // Generate random 5-character alphanumeric captcha
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let res = '';
    for (let i = 0; i < 5; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(res);
    setCaptchaInput('');
    setCaptchaError(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isStrongPassword = hasMinLen && hasUpper && hasNumber && hasSpecial;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail) {
      onShowToast('Vui lòng nhập định dạng email hợp lệ (Gmail, FE Mail, Outlook...)!', 'warning');
      return;
    }

    if (!isStrongPassword) {
      onShowToast('Mật khẩu chưa đạt chuẩn an toàn. Vui lòng hoàn thành các tiêu chí màu đỏ bên dưới!', 'error');
      return;
    }

    if (password !== confirmPassword) {
      onShowToast('Mật khẩu xác nhận không khớp, vui lòng nhập lại!', 'error');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setCaptchaError(true);
      onShowToast('Mã Captcha không chính xác! Vui lòng nhập lại mã mới.', 'error');
      generateCaptcha();
      return;
    }

    onShowToast('Mã Captcha chính xác! Đang gửi mã OTP về email sinh viên...', 'info');
    onProceedToOtp({
      fullName,
      studentId: studentId.toUpperCase(),
      campus,
      email,
      password,
    });
  };

  const isEmailError = Boolean(
    serverError && (serverError.toLowerCase().includes('email') || serverError.toLowerCase().includes('thư'))
  );
  const isStudentIdError = Boolean(
    serverError &&
      (serverError.toLowerCase().includes('mssv') ||
        serverError.toLowerCase().includes('mã số sinh viên') ||
        serverError.toLowerCase().includes('sinh viên'))
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Tạo tài khoản FPT</span>
          <span>🎓</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Dành riêng cho sinh viên & cán bộ thuộc 5 campus Đại học FPT
        </p>
      </div>

      {/* ⚠️ Hộp cảnh báo lỗi trực quan trên web khi bị trùng MSSV hoặc trùng Email */}
      {serverError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/95 p-3.5 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xs">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-extrabold text-rose-900">Không thể tiếp tục đăng ký:</p>
            <p className="mt-0.5 text-rose-700 font-medium leading-relaxed">{serverError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name & MSSV */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 pl-9 text-xs sm:text-sm text-slate-800 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
              />
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Mã số SV (MSSV)
              </label>
              {isStudentIdError && (
                <span className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5">
                  <AlertCircle className="h-3 w-3" /> Đã tồn tại!
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value.toUpperCase());
                  onClearServerError?.();
                }}
                placeholder="HE172819"
                required
                maxLength={10}
                className={`w-full rounded-xl border bg-white p-2.5 pl-9 text-xs sm:text-sm font-mono font-bold text-slate-800 uppercase outline-none transition ${
                  isStudentIdError
                    ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 ring-2 ring-rose-200'
                    : 'border-slate-200 focus:border-fpt-orange focus:ring-2 focus:ring-orange-100'
                }`}
              />
              <GraduationCap className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isStudentIdError ? 'text-rose-500' : 'text-slate-400'}`} />
            </div>
            {isStudentIdError ? (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                ⚠️ MSSV này đã được dùng cho tài khoản khác
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-slate-400" />
                Mỗi sinh viên chỉ được tạo 1 tài khoản bằng MSSV này
              </p>
            )}
          </div>
        </div>

        {/* Campus Selector & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cơ sở Campus
            </label>
            <div className="relative">
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 pl-9 text-xs sm:text-sm text-slate-800 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
              >
                <option value="Hòa Lạc">Campus Hòa Lạc (HL)</option>
                <option value="TP. Hồ Chí Minh">Campus TP.HCM (Q.9)</option>
                <option value="Đà Nẵng">Campus Đà Nẵng</option>
                <option value="Cần Thơ">Campus Cần Thơ</option>
                <option value="Quy Nhơn">Campus Quy Nhơn</option>
              </select>
              <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fpt-orange" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Email cá nhân / FE Mail
              </label>
              {isEmailError && (
                <span className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5">
                  <AlertCircle className="h-3 w-3" /> Đã tồn tại!
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  onClearServerError?.();
                }}
                placeholder="anv.se17@fe.edu.vn hoặc gmail..."
                required
                className={`w-full rounded-xl border bg-white p-2.5 pr-8 text-xs sm:text-sm text-slate-800 outline-none transition ${
                  isEmailError
                    ? 'border-rose-400 bg-rose-50/40 focus:border-rose-500 ring-2 ring-rose-200'
                    : 'border-slate-200 focus:border-fpt-orange focus:ring-2 focus:ring-orange-100'
                }`}
              />
              {isValidEmail && !isEmailError && (
                <CheckCircle2 className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              )}
            </div>
            {isEmailError ? (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                ⚠️ Email này đã được đăng ký tài khoản
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-slate-400" />
                Dùng để nhận mã OTP kích hoạt tài khoản
              </p>
            )}
          </div>
        </div>

        {/* Password & Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự"
                required
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 pr-9 text-xs sm:text-sm text-slate-800 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              required
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>
        </div>

        {/* Password Security Checklist with real-time visual warning cues */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              Tiêu chuẩn mật khẩu an toàn:
            </span>
            {password.length > 0 && (
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
                  : password.length > 0
                  ? 'text-rose-600 font-medium'
                  : 'text-slate-500'
              }`}
            >
              {hasMinLen ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle
                  className={`h-3.5 w-3.5 shrink-0 ${
                    password.length > 0 ? 'text-rose-500' : 'text-slate-400'
                  }`}
                />
              )}
              <span>Tối thiểu 8 ký tự</span>
            </div>

            <div
              className={`flex items-center gap-1.5 ${
                hasUpper
                  ? 'text-emerald-700 font-semibold'
                  : password.length > 0
                  ? 'text-rose-600 font-medium'
                  : 'text-slate-500'
              }`}
            >
              {hasUpper ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle
                  className={`h-3.5 w-3.5 shrink-0 ${
                    password.length > 0 ? 'text-rose-500' : 'text-slate-400'
                  }`}
                />
              )}
              <span>Ít nhất 1 chữ in hoa (A-Z)</span>
            </div>

            <div
              className={`flex items-center gap-1.5 ${
                hasNumber
                  ? 'text-emerald-700 font-semibold'
                  : password.length > 0
                  ? 'text-rose-600 font-medium'
                  : 'text-slate-500'
              }`}
            >
              {hasNumber ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle
                  className={`h-3.5 w-3.5 shrink-0 ${
                    password.length > 0 ? 'text-rose-500' : 'text-slate-400'
                  }`}
                />
              )}
              <span>Ít nhất 1 chữ số (0-9)</span>
            </div>

            <div
              className={`flex items-center gap-1.5 ${
                hasSpecial
                  ? 'text-emerald-700 font-semibold'
                  : password.length > 0
                  ? 'text-rose-600 font-medium'
                  : 'text-slate-500'
              }`}
            >
              {hasSpecial ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle
                  className={`h-3.5 w-3.5 shrink-0 ${
                    password.length > 0 ? 'text-rose-500' : 'text-slate-400'
                  }`}
                />
              )}
              <span>1 ký tự đặc biệt (!@#$%^...)</span>
            </div>
          </div>

          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p className="text-[11px] text-rose-600 font-medium pt-1.5 border-t border-rose-200/60 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
              <span>Mật khẩu xác nhận không khớp, vui lòng kiểm tra lại!</span>
            </p>
          )}
        </div>

        {/* CAPTCHA ANTI-BOT BOX */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Mã xác thực Captcha chống bot
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Phân biệt hoa/thường
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Visual Distorted Captcha Badge */}
            <div className="relative flex items-center justify-center rounded-xl border-2 border-dashed border-orange-300 bg-gradient-to-r from-orange-100 via-amber-50 to-orange-100 px-4 py-2 select-none shadow-xs">
              <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:8px_8px] opacity-25 rounded-xl"></div>
              <span className="relative font-mono text-xl sm:text-2xl font-black tracking-widest text-orange-900 line-through decoration-orange-500/50 -rotate-2 select-none">
                {captchaCode}
              </span>
            </div>

            <button
              type="button"
              onClick={generateCaptcha}
              title="Đổi mã Captcha khác"
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-fpt-orange hover:bg-orange-50 transition cursor-pointer shrink-0 shadow-xs"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/* Captcha Input */}
            <div className="flex-1">
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value.toUpperCase());
                  setCaptchaError(false);
                }}
                placeholder="Nhập 5 ký tự..."
                maxLength={5}
                required
                className={`w-full rounded-xl border bg-white p-2.5 text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-800 uppercase outline-none transition ${
                  captchaError
                    ? 'border-rose-400 bg-rose-50/50 focus:border-rose-500'
                    : 'border-slate-200 focus:border-fpt-orange focus:ring-2 focus:ring-orange-100'
                }`}
              />
            </div>
          </div>

          {captchaError && (
            <p className="text-[11px] text-rose-600 flex items-center gap-1 font-semibold">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Mã Captcha không khớp. Đã sinh mã mới để bạn thử lại.
            </p>
          )}
        </div>

        {/* Submit to OTP */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-fpt-orange py-3 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang kiểm tra & gửi mã OTP...</span>
            </>
          ) : (
            <>
              <span>Tiếp tục xác thực OTP Email</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="text-center text-xs text-slate-600 pt-1">
        Đã có tài khoản sinh viên?{' '}
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
