'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Truck,
  Package,
  ArrowRight,
  MessageSquare,
  BadgeDollarSign,
  Heart,
  AlertTriangle,
  Flag,
  ShieldCheck,
} from 'lucide-react';
import { ProductDetail } from '@/types/product';
import ReportModal from '@/components/modals/ReportModal';
import { useUserStore } from '@/stores/userStore';

interface ProductActionBoxProps {
  product: ProductDetail;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenOfferModal: () => void;
  onRequireAuth?: (action: 'chat' | 'offer' | 'favorite' | 'buy' | 'report') => void;
  onShowToast?: (msg: string) => void;
}

export default function ProductActionBox({
  product,
  isFavorite,
  onToggleFavorite,
  onOpenOfferModal,
  onRequireAuth,
  onShowToast,
}: ProductActionBoxProps) {
  const router = useRouter();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const currentUser = useUserStore((s) => s.user);
  const isEduEmail = Boolean(
    currentUser.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    currentUser.email?.toLowerCase().endsWith('@fe.edu.vn')
  );
  const isVerifiedStudent = isEduEmail || currentUser.kycStatus === 'approved_student' || currentUser.kycStatus === 'approved_seller';
  const [isReportOpen, setIsReportOpen] = useState(false);

  const normalizeCampus = (raw?: string): string => {
    if (!raw) return 'HOL';
    const s = raw.toLowerCase().trim();
    if (s.includes('hồ chí minh') || s.includes('hcm') || s.includes('tp.hcm') || s.includes('sg') || s.includes('sài gòn')) return 'HCM';
    if (s.includes('đà nẵng') || s.includes('da nang') || s.includes('dad') || s.includes('dn')) return 'DAD';
    if (s.includes('quy nhơn') || s.includes('quy nhon') || s.includes('qn')) return 'QN';
    if (s.includes('cần thơ') || s.includes('can tho') || s.includes('ct')) return 'CT';
    if (s.includes('hòa lạc') || s.includes('hoa lac') || s.includes('hn') || s.includes('hà nội') || s.includes('hol')) return 'HOL';
    return 'HOL';
  };

  const CAMPUS_NAMES: Record<string, string> = {
    HOL: 'Hòa Lạc',
    HCM: 'TP. Hồ Chí Minh',
    DAD: 'Đà Nẵng',
    QN: 'Quy Nhơn',
    CT: 'Cần Thơ',
  };

  const userCampusCode = normalizeCampus(currentUser.campus || 'HOL');
  const productCampusCode = normalizeCampus(product.campus || product.campusTag || product.location);
  const isInterCampus = userCampusCode !== productCampusCode;
  const userCampusName = CAMPUS_NAMES[userCampusCode] || 'Hòa Lạc';
  const productCampusName = CAMPUS_NAMES[productCampusCode] || product.location || 'cơ sở khác';

  const isOwner = Boolean(
    isLoggedIn && (
      (currentUser.id && (product.sellerId === currentUser.id || product.seller.id === currentUser.id)) ||
      (currentUser.email && product.seller.email && currentUser.email.toLowerCase() === product.seller.email.toLowerCase()) ||
      (currentUser.name && product.seller.name && currentUser.name.trim().toLowerCase() === product.seller.name.trim().toLowerCase())
    )
  );

  return (
    <div className="space-y-2.5">
      {/* SELLER VIEWING OWN POST BANNER */}
      {isOwner ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-4 sm:p-5 space-y-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 text-blue-900 font-bold text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 leading-tight">Bài đăng của chính bạn</h4>
              <p className="text-[11px] font-normal text-blue-700">Tài khoản của bạn là người bán sản phẩm này</p>
            </div>
          </div>
          
          <p className="text-xs text-slate-600 leading-relaxed">
            Theo quy chế chống gian lận và quy tắc giao dịch Market FU, người bán <strong>không được tự đặt mua, tự trả giá hay tự tạo đơn hàng với chính mình</strong>.
          </p>

          <div className="pt-1 flex flex-col sm:flex-row gap-2">
            <Link
              href="/profile"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 text-xs font-bold transition shadow-xs cursor-pointer active:scale-98"
            >
              <span>Quản lý tin tại Hồ sơ cá nhân</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* INTER-CAMPUS DELIVERY NOTICE & BUTTON */}
          {isInterCampus && (
            <>
              <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-3 text-xs text-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Truck className="h-4 w-4 text-fpt-orange" />
                    Giao hàng Liên Campus (FPT CampusShip)
                  </span>
                  <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    Escrow 48h
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Món đồ ở cơ sở <strong>{productCampusName}</strong> khác cơ sở <strong>{userCampusName}</strong> của bạn. Hỗ trợ gửi bưu cục / GHN liên campus và bảo chứng Escrow 48h an toàn.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    if (onRequireAuth) {
                      onRequireAuth('buy');
                    } else {
                      router.push(`/login?redirect=${encodeURIComponent(`/checkout?productId=${encodeURIComponent(product.id)}`)}`);
                    }
                    return;
                  }
                  if (!isVerifiedStudent) {
                    if (onRequireAuth) {
                      onRequireAuth('buy');
                    } else {
                      router.push('/profile');
                    }
                    return;
                  }
                  router.push(`/checkout?productId=${encodeURIComponent(product.id)}`);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 via-fpt-orange to-amber-600 py-3 text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:shadow-lg transition-all active:scale-98 cursor-pointer"
              >
                <Package className="h-4.5 w-4.5 stroke-[2.5]" />
                <span>Đặt hàng Liên Campus (FPT CampusShip)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* SAME-CAMPUS SAFE HANDOFF BUTTON */}
          {!isInterCampus && (
            <>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-slate-700 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Giao dịch Safe-Handoff (Cùng Campus)
                  </span>
                  <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                    Safe Handoff
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Món đồ cùng cơ sở <strong>{productCampusName}</strong> với bạn. Bàn giao trực tiếp tại Safe-Points (Sảnh Alpha, Thư viện) và kích hoạt bảo hành 24h bằng mã QR Handshake.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    if (onRequireAuth) {
                      onRequireAuth('buy');
                    } else {
                      router.push(`/login?redirect=${encodeURIComponent(`/checkout?productId=${encodeURIComponent(product.id)}&type=meetup`)}`);
                    }
                    return;
                  }
                  if (!isVerifiedStudent) {
                    if (onRequireAuth) {
                      onRequireAuth('buy');
                    } else {
                      router.push('/profile');
                    }
                    return;
                  }
                  router.push(`/checkout?productId=${encodeURIComponent(product.id)}&type=meetup`);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-3 text-sm font-extrabold text-white shadow-md shadow-emerald-500/25 hover:shadow-lg transition-all active:scale-98 cursor-pointer"
              >
                <ShieldCheck className="h-4.5 w-4.5 stroke-[2.5]" />
                <span>Đặt hẹn Safe-Handoff (Cùng Campus)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Primary: Chat with Seller */}
          <button
            type="button"
            onClick={() => {
              if (!isLoggedIn) {
                if (onRequireAuth) {
                  onRequireAuth('chat');
                } else {
                  router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                }
                return;
              }
              if (!isVerifiedStudent) {
                if (onRequireAuth) {
                  onRequireAuth('chat');
                } else {
                  router.push('/profile');
                }
                return;
              }
              router.push(
                `/chat?seller=${encodeURIComponent(product.seller.name)}&productId=${encodeURIComponent(product.id)}&postId=${encodeURIComponent(product.id)}&sellerAvatar=${encodeURIComponent(product.seller.avatarUrl || '')}`
              );
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-fpt-orange py-3 text-sm font-bold text-white shadow-md shadow-orange-500/20 hover:bg-fpt-orange-hover hover:shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Nhắn tin ngay với người bán</span>
          </button>

          {/* Secondary Button: Offer Price */}
          <button
            type="button"
            onClick={() => {
              if (!isLoggedIn) {
                if (onRequireAuth) {
                  onRequireAuth('offer');
                } else {
                  router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
                }
                return;
              }
              if (!isVerifiedStudent) {
                if (onRequireAuth) {
                  onRequireAuth('offer');
                } else {
                  router.push('/profile');
                }
                return;
              }
              onOpenOfferModal();
            }}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-98 cursor-pointer"
          >
            <BadgeDollarSign className="h-4 w-4 text-fpt-orange" />
            <span>Đề nghị giá khác</span>
          </button>
        </>
      )}

      {/* Favorite Button */}
      <div>

        <button
          type="button"
          onClick={() => {
            if (!isLoggedIn) {
              if (onRequireAuth) {
                onRequireAuth('favorite');
              } else {
                router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
              }
              return;
            }
            onToggleFavorite();
          }}
          className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold transition active:scale-98 cursor-pointer ${
            isFavorite
              ? 'border-rose-200 bg-rose-50 text-rose-600'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
            }`}
          />
          <span>{isFavorite ? 'Đã lưu tin' : 'Lưu tin yêu thích'}</span>
        </button>
      </div>

      {/* TRANSACTION WARNING */}
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          <strong>Lưu ý giao dịch:</strong> Chỉ nên hẹn gặp trực tiếp tại Cổng trường hoặc Sảnh KTX để kiểm tra đồ cẩn thận trước khi chuyển khoản. Tuyệt đối không cọc trước.
        </p>
      </div>

      {/* REPORT BUTTON */}
      <div className="flex items-center justify-center pt-0.5">
        <button
          type="button"
          onClick={() => {
            if (!isLoggedIn) {
              if (onRequireAuth) {
                onRequireAuth('report');
              } else {
                router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
              }
              return;
            }
            setIsReportOpen(true);
          }}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-rose-600 transition cursor-pointer"
        >
          <Flag className="h-3 w-3" />
          <span>Báo cáo bài viết vi phạm / nghi vấn lừa đảo</span>
        </button>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="PRODUCT"
        targetId={product.id}
        targetTitle={product.title}
        onToast={(msg) => {
          if (onShowToast) onShowToast(msg);
        }}
      />
    </div>
  );
}
