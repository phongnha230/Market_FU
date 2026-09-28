'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import {
  ShieldAlert,
  LogIn,
  UserPlus,
  X,
  MessageSquare,
  BadgeDollarSign,
  Heart,
  Package,
  Flag,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';

export type AuthActionType = 'chat' | 'offer' | 'favorite' | 'buy' | 'report' | 'voucher' | 'general';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType?: AuthActionType;
  customMessage?: string;
  redirectUrl?: string;
}

const ACTION_CONFIGS: Record<
  AuthActionType,
  { title: string; subtitle: string; icon: React.ReactNode; badge: string }
> = {
  chat: {
    title: 'Nhắn tin với người bán',
    subtitle: 'Bạn cần đăng nhập tài khoản sinh viên FPT để gửi tin nhắn trao đổi trực tiếp, tránh hành vi spam và quấy rối.',
    icon: <MessageSquare className="h-6 w-6 text-fpt-orange" />,
    badge: 'Chống spam tin nhắn',
  },
  offer: {
    title: 'Đề nghị giá trao đổi (Trả giá)',
    subtitle: 'Bạn cần đăng nhập tài khoản để gửi đề xuất giá hợp lệ tới người bán và theo dõi phản hồi trong cuộc trò chuyện.',
    icon: <BadgeDollarSign className="h-6 w-6 text-amber-500" />,
    badge: 'Xác thực người trả giá',
  },
  favorite: {
    title: 'Lưu tin vào danh sách yêu thích',
    subtitle: 'Bạn cần đăng nhập để lưu trữ bài viết này vào danh sách quan tâm riêng và nhận thông báo khi người bán giảm giá.',
    icon: <Heart className="h-6 w-6 text-rose-500" />,
    badge: 'Đồng bộ danh sách yêu thích',
  },
  buy: {
    title: 'Đặt mua & Ký quỹ an toàn',
    subtitle: 'Bạn cần đăng nhập để tạo đơn hàng, kích hoạt dịch vụ đóng gói ship nội bộ và bảo vệ ví ký quỹ Escrow 48h.',
    icon: <Package className="h-6 w-6 text-emerald-500" />,
    badge: 'Bảo vệ thanh toán Escrow',
  },
  report: {
    title: 'Báo cáo vi phạm / Nghi vấn',
    subtitle: 'Bạn cần đăng nhập tài khoản chính chủ để gửi phản ánh vi phạm, giúp Ban Quản Trị xử lý gian lận kịp thời.',
    icon: <Flag className="h-6 w-6 text-rose-600" />,
    badge: 'Minh bạch báo cáo',
  },
  voucher: {
    title: 'Sử dụng Voucher & Nhận Coins',
    subtitle: 'Bạn cần đăng nhập tài khoản sinh viên FPT để lưu voucher vào ví, đổi ưu đãi từ Campus Coins và điểm danh nhận thưởng hàng ngày.',
    icon: <Package className="h-6 w-6 text-fpt-orange" />,
    badge: 'Đặc quyền ví sinh viên',
  },
  general: {
    title: 'Yêu cầu đăng nhập',
    subtitle: 'Vui lòng đăng nhập tài khoản sinh viên FPT để tiếp tục sử dụng tính năng này trên Market FU.',
    icon: <ShieldAlert className="h-6 w-6 text-fpt-orange" />,
    badge: 'An toàn cộng đồng FPT',
  },
};

export default function AuthPromptModal({
  isOpen,
  onClose,
  actionType = 'general',
  customMessage,
  redirectUrl,
}: AuthPromptModalProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const currentUser = useUserStore((s) => s.user);
  const isEduEmail = Boolean(
    currentUser.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    currentUser.email?.toLowerCase().endsWith('@fe.edu.vn')
  );
  const isVerifiedStudent = isEduEmail || currentUser.kycStatus === 'approved_student' || currentUser.kycStatus === 'approved_seller';

  if (!isOpen) return null;

  const currentRedirect = redirectUrl || pathname || '/';
  const config = ACTION_CONFIGS[actionType] || ACTION_CONFIGS.general;

  const handleGoLogin = () => {
    onClose();
    router.push(`/login?redirect=${encodeURIComponent(currentRedirect)}`);
  };

  const handleGoRegister = () => {
    onClose();
    router.push(`/login?mode=register&redirect=${encodeURIComponent(currentRedirect)}`);
  };

  const handleGoVerifyKyc = () => {
    onClose();
    router.push('/profile');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 border border-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Icon Badge */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100 shadow-xs">
            {isLoggedIn && !isVerifiedStudent ? (
              <GraduationCap className="h-6 w-6 text-fpt-orange" />
            ) : (
              config.icon
            )}
          </div>
          <div className="space-y-1 pr-6">
            <span className="inline-block rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-extrabold text-fpt-orange uppercase tracking-wider">
              {isLoggedIn && !isVerifiedStudent ? 'Chế độ Khách vãn lai' : config.badge}
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {isLoggedIn && !isVerifiedStudent
                ? 'Yêu cầu Xác thực Thẻ Sinh viên FPT'
                : config.title}
            </h3>
          </div>
        </div>

        {/* Explanatory Context Message */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-600 leading-relaxed space-y-2">
          <p>
            {isLoggedIn && !isVerifiedStudent
              ? `Tài khoản (${currentUser.email || 'cá nhân'}) chưa xác thực Thẻ Sinh Viên. Bạn đang ở chế độ Khách vãn lai (chỉ được xem sản phẩm). Để nhắn tin, mua bán và trả giá, vui lòng nộp ảnh thẻ SV để Admin duyệt.`
              : customMessage || config.subtitle}
          </p>
          <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>Chỉ sinh viên chính quy được quyền mua bán, nhắn tin & trả giá</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-fpt-orange" />
              <span>Ngăn chặn tuyệt đối hành vi lừa đảo và tài khoản ảo mạo danh</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {isLoggedIn && !isVerifiedStudent ? (
            <>
              <button
                type="button"
                onClick={handleGoVerifyKyc}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 via-fpt-orange to-amber-600 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:shadow-lg hover:brightness-105 transition active:scale-98 cursor-pointer"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Xác thực Thẻ Sinh viên ngay</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 py-1 transition cursor-pointer"
              >
                Để sau (Tiếp tục xem sản phẩm như khách vãn lai)
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGoLogin}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 via-fpt-orange to-amber-600 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:shadow-lg hover:brightness-105 transition active:scale-98 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập ngay để tiếp tục</span>
              </button>

              <button
                type="button"
                onClick={handleGoRegister}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition active:scale-98 cursor-pointer"
              >
                <UserPlus className="h-4 w-4 text-fpt-orange" />
                <span>Tạo tài khoản mới</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 py-1 transition cursor-pointer"
              >
                Để sau (Xem tiếp sản phẩm)
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
