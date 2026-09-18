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
}

export default function RegisterForm({
  onProceedToOtp,
  onSwitchToLogin,
  onShowToast,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail) {
      onShowToast('Vui lòng nhập định dạng email hợp lệ (Gmail, FE Mail, Outlook...)!', 'warning');
      return;
    }

    if (password.length < 6) {
      onShowToast('Mật khẩu cần tối thiểu 6 ký tự để bảo vệ tài khoản!', 'warning');
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mã số SV (MSSV)
            </label>
            <div className="relative">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                placeholder="HE172819"
                required
                maxLength={10}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 pl-9 text-xs sm:text-sm font-mono font-bold text-slate-800 uppercase outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
              />
              <GraduationCap className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email cá nhân / FE Mail
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anv.se17@fe.edu.vn hoặc gmail..."
                required
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 pr-8 text-xs sm:text-sm text-slate-800 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
              />
              {isValidEmail && (
                <CheckCircle2 className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              )}
            </div>
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
                placeholder="Tối thiểu 6 ký tự"
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
          className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-fpt-orange py-3 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Tiếp tục xác thực OTP Email</span>
          <ArrowRight className="h-4 w-4" />
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
