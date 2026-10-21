'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, Sparkles, HelpCircle } from 'lucide-react';

interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  badge?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-testid="hero-campus-trigger"]',
    title: 'Chọn cơ sở Campus FPT của bạn',
    description:
      'Chọn đúng Campus (Hòa Lạc, TP.HCM, Đà Nẵng, Quy Nhơn, Cần Thơ) để xem các món đồ đang được pass gần bạn nhất, dễ dàng hẹn gặp trực tiếp tại Sảnh hoặc KTX!',
    badge: 'Bước 1 / 4',
    placement: 'bottom',
  },
  {
    targetSelector: 'section.py-8',
    title: 'Danh mục đồ đặc trưng sinh viên FPT',
    description:
      'Khám phá các bộ sưu tập đặc thù của sinh viên FU: Giáo trình theo mã môn (PRF, CSD, MAS...), Võ phục Vovinam, Nhạc cụ dân tộc (Đàn Tranh) và combo đồ dùng phòng trọ / KTX!',
    badge: 'Bước 2 / 4',
    placement: 'top',
  },
  {
    targetSelector: 'section.py-4',
    title: 'Giao dịch an toàn & Bao test 48h',
    description:
      'An tâm mua sắm: 100% người bán xác thực thẻ sinh viên @fpt.edu.vn, hỗ trợ quét mã QR Handshake khi gặp mặt và chính sách bao test 24h-48h minh bạch!',
    badge: 'Bước 3 / 4',
    placement: 'top',
  },
  {
    targetSelector: 'a[href="/create-post"]',
    title: 'Pass đồ cũ siêu tốc cùng trợ lý AI',
    description:
      'Bạn có đồ dùng, sách vở không còn dùng đến? Bấm vào đây, AI sẽ tự động phân tích ảnh và gợi ý giá giúp bạn đăng bán đồ chỉ trong 30 giây!',
    badge: 'Bước 4 / 4',
    placement: 'bottom',
  },
];

const STORAGE_KEY = 'fu_campus_onboarding_tour_completed_v1';

export default function CampusTourGuide() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 1. Kiểm tra trạng thái đã xem tour chưa khi tải trang
  useEffect(() => {
    setMounted(true);
    try {
      const hasCompleted = localStorage.getItem(STORAGE_KEY);
      if (!hasCompleted) {
        // Đợi 1.2s sau khi trang tải xong mới kích hoạt tour mượt mà
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('Lỗi khi đọc trạng thái tour:', e);
    }
  }, []);

  // 2. Tính toán vị trí phần tử mục tiêu (Target Element)
  const updateTargetPosition = useCallback(() => {
    if (!isOpen) return;
    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.targetSelector) as HTMLElement | null;
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  // Cuộn mượt đến phần tử mục tiêu mỗi khi chuyển bước
  useEffect(() => {
    if (!isOpen) return;

    const step = TOUR_STEPS[currentStep];
    if (!step) return;

    const el = document.querySelector(step.targetSelector) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Đợi scroll hoàn tất rồi đo lại toạ độ
      const timer = setTimeout(() => {
        updateTargetPosition();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStep, updateTargetPosition]);

  // Cập nhật vị trí khi resize hoặc cuộn trang
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, { passive: true });

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [isOpen, updateTargetPosition]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Lỗi khi lưu trạng thái tour:', e);
    }
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  if (!mounted) return null;

  const currentStepData = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  // Tính vị trí popover và mũi tên (arrow)
  let popoverTop = 100;
  let popoverLeft = 100;
  let arrowPlacement = 'top';

  if (targetRect) {
    const popoverWidth = 340;
    const padding = 16;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    // Căn giữa theo phần tử mục tiêu theo chiều ngang
    const targetCenterX = targetRect.left + targetRect.width / 2;
    popoverLeft = Math.max(padding, Math.min(targetCenterX - popoverWidth / 2, windowWidth - popoverWidth - padding));

    const preferPlacement = currentStepData.placement || 'bottom';

    if (preferPlacement === 'bottom' && targetRect.bottom + 220 < windowHeight) {
      popoverTop = targetRect.bottom + 14;
      arrowPlacement = 'top'; // Mũi tên nằm ở đỉnh popover chỉ ngược lên
    } else if (preferPlacement === 'top' && targetRect.top - 220 > 0) {
      popoverTop = targetRect.top - 210;
      arrowPlacement = 'bottom'; // Mũi tên nằm ở đáy popover chỉ ngược xuống
    } else if (targetRect.bottom + 220 < windowHeight) {
      popoverTop = targetRect.bottom + 14;
      arrowPlacement = 'top';
    } else {
      popoverTop = Math.max(padding, targetRect.top - 210);
      arrowPlacement = 'bottom';
    }
  }

  return (
    <>
      {/* 1. Nút nhỏ góc phải dưới màn hình để xem lại hướng dẫn bất cứ lúc nào */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleReplay}
          title="Xem lại hướng dẫn khám phá web"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-lg shadow-slate-900/10 border border-slate-200/90 hover:border-orange-300 hover:text-fpt-orange hover:shadow-xl transition-all duration-200 cursor-pointer group active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-fpt-orange animate-pulse" />
          <span className="hidden sm:inline">Hướng dẫn sử dụng</span>
        </button>
      )}

      {/* 2. Modal Tour chính */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] pointer-events-auto">
            {/* Lớp phủ làm tối màn hình (Backdrop) */}
            <div
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1.5px] transition-opacity duration-300"
              onClick={handleClose}
            />

            {/* Vùng khoanh sáng phần tử mục tiêu (Spotlight Ring) */}
            {targetRect && (
              <div
                style={{
                  top: `${Math.max(0, targetRect.top - 6)}px`,
                  left: `${Math.max(0, targetRect.left - 6)}px`,
                  width: `${targetRect.width + 12}px`,
                  height: `${targetRect.height + 12}px`,
                }}
                className="absolute rounded-2xl ring-4 ring-orange-500/80 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)] pointer-events-none transition-all duration-300 ease-out animate-pulse"
              />
            )}

            {/* Khung Popover chỉ dẫn phong cách Coursera FPT */}
            <div
              ref={popoverRef}
              style={{
                top: `${popoverTop}px`,
                left: `${popoverLeft}px`,
                width: '340px',
              }}
              className="absolute bg-white rounded-2xl p-5 shadow-2xl shadow-slate-950/25 border border-slate-200/90 transition-all duration-300 ease-out z-[100000] animate-in fade-in-0 zoom-in-95"
            >
              {/* Mũi tên chỉ vào phần tử (Tooltip Arrow) */}
              {arrowPlacement === 'top' && (
                <div
                  style={{
                    left: targetRect
                      ? `${Math.max(20, Math.min(300, targetRect.left + targetRect.width / 2 - popoverLeft))}px`
                      : '50%',
                  }}
                  className="absolute -top-2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-200/90 rotate-45"
                />
              )}
              {arrowPlacement === 'bottom' && (
                <div
                  style={{
                    left: targetRect
                      ? `${Math.max(20, Math.min(300, targetRect.left + targetRect.width / 2 - popoverLeft))}px`
                      : '50%',
                  }}
                  className="absolute -bottom-2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-200/90 rotate-45"
                />
              )}

              {/* Nút đóng [X] ở góc phải trên */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Đóng hướng dẫn"
                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg transition"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header của Popover */}
              <div className="flex items-center gap-2 mb-2 pr-6">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 text-[10px] font-extrabold text-fpt-orange uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  {currentStepData.badge}
                </span>
              </div>

              {/* Tiêu đề & Nội dung */}
              <h3 className="text-base font-bold text-slate-900 leading-snug mb-1.5">
                {currentStepData.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {currentStepData.description}
              </p>

              {/* Dãy chấm tiến trình (Progress dots) & Nút bấm hành động */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  {TOUR_STEPS.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentStep ? 'w-5 bg-fpt-orange' : 'w-1.5 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    >
                      <ChevronLeft className="h-4 w-4 inline -ml-1" />
                      Lùi
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-fpt-orange hover:from-orange-600 hover:to-fpt-orange-hover rounded-xl shadow-xs shadow-orange-500/20 active:scale-95 transition"
                  >
                    <span>{isLastStep ? 'Khám phá ngay' : 'Tiếp theo'}</span>
                    {!isLastStep && <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
