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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Official Google 4-Color Icon SVG
export function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface LoginFormProps {
  onSwitchMode: (mode: 'register' | 'forgot-password') => void;
  /** email + password để parent kiểm tra admin hay student */
  onLoginSuccess: (email: string, password: string) => void;
  onGoogleSuccess?: (idToken: string) => void;
  isGoogleLoading?: boolean;
  onFptMailSso?: () => void;
  demoState: 'normal' | 'error' | 'loading';
  setDemoState: (st: 'normal' | 'error' | 'loading') => void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function LoginForm({
  onSwitchMode,
  onLoginSuccess,
  onGoogleSuccess,
  isGoogleLoading = false,
  onFptMailSso,
  demoState,
  setDemoState,
  onShowToast,
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isGsiRendered, setIsGsiRendered] = useState(false);
  const googleBtnRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '663740442323-t83hnbr1ov37avr41volic86ea29ks41.apps.googleusercontent.com';

    const renderGsiButton = () => {
      const google = typeof window !== 'undefined' ? (window as any).google : undefined;
      if (google?.accounts?.id && googleBtnRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: any) => {
              if (response?.credential) {
                onGoogleSuccess?.(response.credential);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          googleBtnRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: googleBtnRef.current.offsetWidth || 380,
            locale: 'vi',
          });
          setIsGsiRendered(true);
        } catch (err) {
          console.error('Lỗi hiển thị nút Google:', err);
        }
      }
    };

    renderGsiButton();
    const interval = setInterval(() => {
      const google = typeof window !== 'undefined' ? (window as any).google : undefined;
      if (google?.accounts?.id && googleBtnRef.current && !isGsiRendered) {
        renderGsiButton();
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onGoogleSuccess, isGsiRendered]);

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

      {/* Official Google Sign-In Button */}
      <div className="w-full flex flex-col items-center min-h-[44px]">
        <div
          ref={googleBtnRef}
          className={`w-full flex justify-center [&>div]:w-full [&_iframe]:w-full! [&_iframe]:max-w-[420px] ${
            isGsiRendered ? 'block' : 'hidden'
          }`}
        />

        {!isGsiRendered && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const google = typeof window !== 'undefined' ? (window as any).google : undefined;
              if (google?.accounts?.id) {
                google.accounts.id.prompt();
              } else if (onFptMailSso) {
                onFptMailSso();
              } else {
                onShowToast('Đang kết nối máy chủ Google...', 'info');
              }
            }}
            disabled={isGoogleLoading}
            className="w-full h-auto flex items-center justify-between rounded-xl border-slate-200 bg-white p-3 hover:bg-slate-50 transition shadow-2xs cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 flex items-center justify-center shrink-0">
                {isGoogleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                ) : (
                  <GoogleIcon className="h-5 w-5" />
                )}
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-slate-900">
                {isGoogleLoading ? 'Đang xác thực Google...' : 'Đăng nhập bằng Google'}
              </span>
            </div>
            <span className="rounded bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5">
              Google
            </span>
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <Separator className="bg-slate-100" />
        <span className="absolute bg-white px-3 text-[11px] text-slate-400 font-medium">
          hoặc đăng nhập bằng Email / Mã SV
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email / MSSV Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <Label htmlFor="login-email" className="font-bold text-slate-700 flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5 text-slate-500" />
              Email hoặc Mã Sinh Viên (MSSV)
            </Label>
            <span className="text-[11px] text-slate-400">Gmail, FE Mail hoặc MSSV</span>
          </div>

          <div className="relative">
            <Input
              id="login-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="se172819@fe.edu.vn hoặc SE172819, gmail..."
              required
              className={`w-full rounded-xl border p-3 pr-10 h-auto text-xs sm:text-sm text-slate-800 outline-none transition ${demoState === 'error'
                  ? 'border-rose-400 bg-rose-50/30 focus-visible:ring-rose-500'
                  : 'border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-100 focus-visible:border-fpt-orange'
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
            <Label htmlFor="login-password" className="font-bold text-slate-700 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              Mật khẩu
            </Label>
          </div>

          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full rounded-xl border p-3 pr-10 h-auto text-xs sm:text-sm text-slate-800 outline-none transition ${demoState === 'error'
                  ? 'border-rose-400 bg-rose-50/30 focus-visible:ring-rose-500'
                  : 'border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-100 focus-visible:border-fpt-orange'
                }`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-transparent transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
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

          <Button
            type="button"
            variant="link"
            onClick={() => onSwitchMode('forgot-password')}
            className="p-0 h-auto font-bold text-fpt-orange hover:underline cursor-pointer"
          >
            Quên mật khẩu?
          </Button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={demoState === 'loading'}
          className="w-full rounded-xl bg-fpt-orange py-3.5 h-auto text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:bg-fpt-orange-hover hover:shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
        >
          {demoState === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang đăng nhập...</span>
            </>
          ) : (
            <span>Đăng nhập</span>
          )}
        </Button>
      </form>

      {/* Demo Credentials Quick-Select */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Chọn tài khoản mẫu để thử nghiệm nhanh:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEmail('namntk17@fe.edu.vn');
              setPassword('FptStudent@2024');
              if (demoState === 'error') setDemoState('normal');
            }}
            className="rounded-lg border-slate-200 bg-white p-2.5 h-auto text-left flex-col items-start justify-start hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer group shadow-2xs"
          >
            <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1 group-hover:text-emerald-700">
              🎓 Sinh viên FPT
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">namntk17@fe.edu.vn</div>
            <div className="text-[9px] text-emerald-600 font-bold mt-1">→ Vào Sàn chợ đồ cũ</div>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEmail('admin@fpt.edu.vn');
              setPassword('Admin@2025');
              if (demoState === 'error') setDemoState('normal');
            }}
            className="rounded-lg border-slate-200 bg-white p-2.5 h-auto text-left flex-col items-start justify-start hover:border-fpt-orange hover:bg-orange-50/40 transition cursor-pointer group shadow-2xs"
          >
            <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1 group-hover:text-fpt-orange">
              🛡️ Quản trị viên (BQT)
            </div>
            <div className="text-[10px] text-slate-500 font-mono truncate mt-0.5">admin@fpt.edu.vn</div>
            <div className="text-[9px] text-fpt-orange font-bold mt-1">→ Vào Admin Panel</div>
          </Button>
        </div>
      </div>

      {/* Register Callout */}
      <div className="text-center text-xs text-slate-600">
        Chưa có tài khoản 5Campus?{' '}
        <Button
          type="button"
          variant="link"
          onClick={() => onSwitchMode('register')}
          className="p-0 h-auto font-bold text-fpt-orange hover:underline cursor-pointer"
        >
          Đăng ký ngay
        </Button>
      </div>
    </div>
  );
}
