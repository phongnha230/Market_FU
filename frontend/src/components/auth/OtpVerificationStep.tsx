'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';

interface OtpVerificationStepProps {
  targetEmail: string;
  title?: string;
  subtitle?: React.ReactNode;
  onVerifySuccess: (otp: string) => void;
  onBack: () => void;
  onResendOtp?: () => void;
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

  // 60-second countdown for OTP resend
  const [countdownInitial, setCountdownInitial] = useState(60);
  const { formattedSeconds, isExpired } = useCountdown(countdownInitial);

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

  const handleResend = () => {
    setDigits(['', '', '', '', '', '']);
    setCountdownInitial(60);
    onShowToast(`Đã gửi lại mã OTP 6 số mới tới ${targetEmail}!`, 'info');
    onResendOtp?.();
    inputRefs.current[0]?.focus();
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

      {/* Demo helper callout */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-900 flex items-start gap-2">
        <Mail className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong>Gợi ý thử nghiệm:</strong> Bạn có thể nhập bất kỳ 6 chữ số nào (ví dụ: <code className="font-bold bg-white px-1.5 py-0.5 rounded border border-blue-200">123456</code> hoặc mã gửi đến) để xác thực.
        </div>
      </div>

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

        {/* Resend Countdown */}
        <div className="text-center text-xs text-slate-500">
          {!isExpired ? (
            <span>
              Gửi lại mã mới sau: <strong className="text-fpt-orange font-mono font-bold">{formattedSeconds}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-1 font-bold text-fpt-orange hover:underline cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Gửi lại mã OTP qua email</span>
            </button>
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
