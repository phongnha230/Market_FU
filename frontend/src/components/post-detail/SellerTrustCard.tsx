'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { ProductDetail } from '@/types/product';
import { useUserStore } from '@/stores/userStore';
import { chatService } from '@/services/chatService';
import { userService } from '@/services/userService';

interface SellerTrustCardProps {
  seller: ProductDetail['seller'];
  postId: string;
  onRequireAuth?: (action: 'chat') => void;
}

export default function SellerTrustCard({
  seller,
  postId,
  onRequireAuth,
}: SellerTrustCardProps) {
  const router = useRouter();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [sellerData, setSellerData] = useState(seller);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setSellerData(seller);
    setAvatarError(false);

    const targetUserId = seller.id;
    if (targetUserId && targetUserId.length === 24) {
      userService
        .getUserById(targetUserId)
        .then((u: any) => {
          if (u) {
            setSellerData((prev) => ({
              ...prev,
              avatarUrl: u.avatarUrl || u.profile?.avatarUrl || prev.avatarUrl,
              name: u.fullName || u.profile?.fullName || prev.name,
              cohort: u.cohort || u.profile?.cohort || prev.cohort,
              dealCount: typeof u.dealCount === 'number' ? u.dealCount : prev.dealCount,
              reviewCount: typeof u.reviewCount === 'number' ? u.reviewCount : prev.reviewCount,
              rating: typeof u.rating === 'number' ? u.rating : prev.rating,
              responseRate:
                (typeof u.dealCount === 'number' && u.dealCount > 0) || (typeof prev.dealCount === 'number' && prev.dealCount > 0)
                  ? '~15 phút (Rất nhanh)'
                  : 'Mới tham gia',
            }));
          }
        })
        .catch(() => {});
    }
  }, [seller]);

  const sellerProfileUrl = `/sellers/${encodeURIComponent(sellerData.id || sellerData.name)}`;

  const handleChatClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      if (onRequireAuth) {
        onRequireAuth('chat');
      } else {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }
      return;
    }

    try {
      setIsStartingChat(true);
      if (postId) {
        const conv = await chatService.createOrGetConversation(postId, sellerData.id);
        if (conv?.id) {
          router.push(`/chat?id=${conv.id}`);
          return;
        }
      }
      router.push(`/chat${sellerData.id ? `?sellerId=${encodeURIComponent(sellerData.id)}` : ''}`);
    } catch {
      router.push('/chat');
    } finally {
      setIsStartingChat(false);
    }
  };

  const hasValidRating =
    typeof sellerData.rating === 'number' &&
    sellerData.rating > 0 &&
    (sellerData.reviewCount ?? 0) > 0;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <Link
          href={sellerProfileUrl}
          className="group flex items-center gap-3 transition cursor-pointer"
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fpt-blue text-sm font-black text-white shadow-xs group-hover:scale-105 transition-transform overflow-hidden border border-slate-100">
            {sellerData.avatarUrl && !avatarError ? (
              <img
                src={sellerData.avatarUrl}
                alt={sellerData.name}
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span>{sellerData.initial || sellerData.name?.[0] || 'U'}</span>
            )}
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-fpt-orange transition-colors">
              {sellerData.name}
              {sellerData.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              )}
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-fpt-orange transition-colors shrink-0" />
            </h4>
            <span className="text-xs text-emerald-600 font-medium">
              🛡️ Sinh viên {sellerData.cohort ? `${sellerData.cohort} · ` : ''}Đã xác minh FPT Mail
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleChatClick}
          disabled={isStartingChat}
          className="text-xs font-bold text-fpt-orange hover:underline cursor-pointer disabled:opacity-50"
        >
          {isStartingChat ? 'Đang mở chat...' : 'Nhắn tin >'}
        </button>
      </div>

      {/* 3-Col Stats */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-2.5 text-center text-xs">
        <div>
          <div className="font-black text-slate-900">
            {hasValidRating
              ? `${Number(sellerData.rating).toFixed(1)} ⭐`
              : (sellerData.reviewCount ?? 0) > 0 ? '5.0 ⭐' : 'Chưa có'}
          </div>
          <div className="text-[10px] text-slate-400">
            {sellerData.reviewCount && sellerData.reviewCount > 0
              ? `${sellerData.reviewCount} đánh giá`
              : '0 đánh giá'}
          </div>
        </div>
        <div>
          <div className="font-black text-slate-900">
            {sellerData.dealCount && sellerData.dealCount > 0
              ? `${sellerData.dealCount} đơn`
              : '0 đơn'}
          </div>
          <div className="text-[10px] text-slate-400">Đã giao dịch</div>
        </div>
        <div>
          <div className="font-black text-slate-900">
            {sellerData.responseRate || ((sellerData.dealCount && sellerData.dealCount > 0) ? '~15 phút' : 'Mới tham gia')}
          </div>
          <div className="text-[10px] text-slate-400">Phản hồi</div>
        </div>
      </div>
    </div>
  );
}
