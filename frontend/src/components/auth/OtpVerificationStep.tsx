'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';

interface OtpVerificationStepProps {
  targetEmail: string;
  title?: string;
  subtitle?: React.ReactNode;
  onVerifySuccess: (otp: string) => void;
  onBack: () => void;
  onResendOtp?: () => Promise<void> | void;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function OtpVerificationStep({
  targetEmail,
  title = 'Xác thực Email sinh viên FPT',
  subtitle,
  onVerifySuccess,
  onBack,
  onResendOtp,
  onShowToast,
}: OtpVerificationStepProps) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 60-second countdown for OTP resend with anti-spam
  const MAX_RESENDS = 5;
  const [resendCount, setResendCount] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const { formattedSeconds, isExpired, reset: resetCountdown } = useCountdown(60);

  useEffect(() => {
    // Auto focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    // Auto move to next input if filled
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setDigits(newDigits);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = async () => {
    if (isResending || !isExpired || resendCount >= MAX_RESENDS) return;

    setIsResending(true);
    setResendError(null);

    try {
      if (onResendOtp) {
        await onResendOtp();
      }
      setDigits(['', '', '', '', '', '']);
      setResendCount((prev) => prev + 1);
      resetCountdown(60);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Không thể gửi lại mã OTP. Vui lòng chờ giây lát.';
      setResendError(msg);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = digits.join('');
    if (fullOtp.length < 6) {
      onShowToast('Vui lòng nhập đủ 6 chữ số mã xác thực!', 'warning');
      return;
    }

    onShowToast('Đang kiểm tra mã OTP xác thực...', 'info');
    setTimeout(() => {
      onVerifySuccess(fullOtp);
    }, 600);
  };

  return (
    <div className="space-y-5">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition mb-3 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại chỉnh sửa</span>
        </button>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>{title}</span>
          <span>📬</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {subtitle || (
            <>
              Hệ thống đã gửi mã OTP 6 số đến hòm thư:{' '}
              <strong className="text-slate-800 font-bold">{targetEmail}</strong>
            </>
          )}
        </p>
      </div>

      {/* Email Info Callout */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <Mail className="h-4 w-4 text-fpt-orange shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          Mã xác thực 6 số đã được gửi qua email. Vui lòng kiểm tra kỹ cả <strong>Hộp thư đến</strong> và thư mục <strong>Spam / Thư rác</strong> trong Gmail FPT của bạn.
        </div>
      </div>

      {/* Resend Error Alert */}
      {resendError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
          <span className="font-bold shrink-0">⚠️ Lỗi:</span>
          <span className="text-[11px]">{resendError}</span>
        </div>
      )}

      {/* 6 Digit Input Boxes */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2.5 text-center">
            NHẬP MÃ XÁC THỰC 6 CHỮ SỐ
          </label>

          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 border-slate-200 bg-white text-center text-lg sm:text-xl font-black text-slate-900 outline-none transition focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 shadow-xs"
              />
            ))}
          </div>
        </div>

        {/* Resend Countdown & Anti-Spam Control */}
        <div className="text-center text-xs text-slate-500">
          {resendCount >= MAX_RESENDS ? (
            <div className="rounded-xl border border-red-200 bg-red-50/80 p-2.5 text-[11px] font-semibold text-red-600">
              ⚠️ Bạn đã sử dụng hết số lần gửi lại mã OTP ({MAX_RESENDS}/{MAX_RESENDS} lần). Vui lòng quay lại nhập lại thông tin hoặc thử lại sau.
            </div>
          ) : !isExpired ? (
            <div className="space-y-1">
              <div>
                Gửi lại mã mới sau:{' '}
                <strong className="text-fpt-orange font-mono font-bold">{formattedSeconds}s</strong>
              </div>
              <div className="text-[10px] text-slate-400">
                (Còn {MAX_RESENDS - resendCount}/{MAX_RESENDS} lần gửi lại)
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 font-bold text-fpt-orange hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isResending && 'animate-spin')} />
                <span>{isResending ? 'Đang gửi lại mã...' : 'Gửi lại mã OTP qua email'}</span>
              </button>
              <div className="text-[10px] text-slate-400">
                (Còn {MAX_RESENDS - resendCount}/{MAX_RESENDS} lần gửi lại)
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={digits.join('').length < 6}
          className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-fpt-orange py-3.5 text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:shadow-lg transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Xác nhận mã & Hoàn tất</span>
        </button>
      </form>

      <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5 text-center text-[11px] text-slate-400">
        Không nhận được email? Hãy kiểm tra thêm hòm thư Rác (Spam) hoặc mục Cập nhật trong Gmail FPT.
      </div>
    </div>
  );
}
