'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ArrowUpRight, Sparkles, X } from 'lucide-react';

const PROMO_DISMISS_KEY = 'fu_home_promo_dismissed';

export default function HomePromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      setIsOpen(sessionStorage.getItem(PROMO_DISMISS_KEY) !== 'true');
    } catch (error) {
      console.error('Không đọc được trạng thái banner quảng cáo:', error);
      setIsOpen(true);
    }
  }, []);

  const closePopup = useCallback(() => {
    try {
      sessionStorage.setItem(PROMO_DISMISS_KEY, 'true');
    } catch (error) {
      console.error('Không lưu được trạng thái banner quảng cáo:', error);
    }
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePopup();
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [closePopup, isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-[3px]"
        aria-hidden="true"
        onClick={closePopup}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-promo-title"
        aria-describedby="home-promo-description"
        className="relative w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closePopup}
          aria-label="Đóng quảng cáo"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/90 text-slate-700 shadow-sm transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="relative isolate overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 px-7 pb-10 pt-12 text-white sm:px-12 sm:pb-14 sm:pt-16">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[42px] border-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-40 right-20 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              FU Second-hand Market
            </span>
            <h2 id="home-promo-title" className="mt-6 text-3xl font-black leading-tight sm:text-5xl">
              Đồ cũ còn tốt, tìm chủ mới thật nhanh.
            </h2>
            <p id="home-promo-description" className="mt-4 max-w-md text-base leading-relaxed text-orange-50 sm:text-lg">
              Khám phá các tin đăng từ cộng đồng sinh viên FPT hoặc đăng món đồ bạn không còn dùng đến.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/posts"
                onClick={closePopup}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-orange-700 shadow-lg transition hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Xem tin đăng <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/create-post"
                onClick={closePopup}
                className="inline-flex min-h-12 items-center rounded-xl border border-white/60 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Đăng tin ngay
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
