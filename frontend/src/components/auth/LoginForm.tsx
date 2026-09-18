'use client';

import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface LoginFormProps {
  onSwitchMode: (mode: 'register' | 'forgot-password') => void;
  /** email + password để parent kiểm tra admin hay student */
  onLoginSuccess: (email: string, password: string) => void;
  onFptMailSso: () => void;
  demoState: 'normal' | 'error' | 'loading';
  setDemoState: (st: 'normal' | 'error' | 'loading') => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function LoginForm({
  onSwitchMode,
  onLoginSuccess,
  onFptMailSso,
  demoState,
  setDemoState,
  onShowToast,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const isFptEmail = email.trim().toLowerCase().endsWith('@fpt.edu.vn');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      onShowToast('Vui lòng nhập đầy đủ email và mật khẩu.', 'error');
      return;
    }

    setDemoState('loading');
    // Đẩy cả email + password lên parent để parent quyết định admin hay student
    setTimeout(() => {
      onLoginSuccess(email.trim(), password);
    }, 800);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Chào mừng trở lại</span>
          <span>👋</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Đăng nhập tài khoản sinh viên để tiếp tục giao dịch
        </p>
      </div>

      {/* Big Google SSO Button */}
      <button
        type="button"
        onClick={onFptMailSso}
        className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full flex items-center justify-center font-black text-blue-600 text-sm">
            G
          </div>
          <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-slate-900">
            Đăng nhập nhanh bằng Google SSO
          </span>
        </div>
        <span className="rounded bg-slate-100 text-slate-600 text-[11px] font-mono font-bold px-2 py-0.5">
          Google Workspace
        </span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-100"></div>
        <span className="absolute bg-white px-3 text-[11px] text-slate-400 font-medium">
          hoặc đăng nhập bằng Email / Mã SV
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email / MSSV Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
              Email hoặc Mã Sinh Viên (MSSV)
            </label>
            <span className="text-[11px] text-slate-400">Gmail, FE Mail hoặc MSSV</span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="se172819@fe.edu.vn hoặc SE172819, gmail..."
              required
              className={`w-full rounded-xl border p-3 pr-10 text-xs sm:text-sm text-slate-800 outline-none transition ${
                demoState === 'error'
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                  : 'border-slate-200 focus:border-fpt-orange focus:ring-2 focus:ring-orange-100'
              }`}
            />
            {email.length >= 3 && (
              <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
            )}
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <label className="font-bold text-slate-700 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              Mật khẩu
            </label>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full rounded-xl border p-3 pr-10 text-xs sm:text-sm text-slate-800 outline-none transition ${
                demoState === 'error'
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500'
                  : 'border-slate-200 focus:border-fpt-orange focus:ring-2 focus:ring-orange-100'
              }`}
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

        {/* Error Banner if error mode */}
        {demoState === 'error' && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-start gap-2 text-xs text-rose-800 animate-in fade-in duration-150">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại địa chỉ email sinh viên FPT.
            </span>
          </div>
        )}

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-fpt-orange focus:ring-fpt-orange cursor-pointer"
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>

          <button
            type="button"
            onClick={() => onSwitchMode('forgot-password')}
            className="font-bold text-fpt-orange hover:underline cursor-pointer"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={demoState === 'loading'}
          className="w-full rounded-xl bg-fpt-orange py-3.5 text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:bg-fpt-orange-hover hover:shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
        >
          {demoState === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang đăng nhập...</span>
            </>
          ) : (
            <span>Đăng nhập</span>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick-Select */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Chọn tài khoản mẫu để thử nghiệm nhanh:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setEmail('namntk17@fe.edu.vn');
              setPassword('FptStudent@2024');
              if (demoState === 'error') setDemoState('normal');
            }}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer group shadow-2xs"
          >
            <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1 group-hover:text-emerald-700">
              🎓 Sinh viên FPT
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">namntk17@fe.edu.vn</div>
            <div className="text-[9px] text-emerald-600 font-bold mt-1">→ Vào Sàn chợ đồ cũ</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setEmail('admin@fpt.edu.vn');
              setPassword('Admin@2025');
              if (demoState === 'error') setDemoState('normal');
            }}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:border-fpt-orange hover:bg-orange-50/40 transition cursor-pointer group shadow-2xs"
          >
            <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1 group-hover:text-fpt-orange">
              🛡️ Quản trị viên (BQT)
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">admin@fpt.edu.vn</div>
            <div className="text-[9px] text-fpt-orange font-bold mt-1">→ Vào Admin Panel</div>
          </button>
        </div>
      </div>

      {/* Register Callout */}
      <div className="text-center text-xs text-slate-600">
        Chưa có tài khoản 5Campus?{' '}
        <button
          type="button"
          onClick={() => onSwitchMode('register')}
          className="font-bold text-fpt-orange hover:underline cursor-pointer"
        >
          Đăng ký ngay
        </button>
      </div>
    </div>
  );
}
