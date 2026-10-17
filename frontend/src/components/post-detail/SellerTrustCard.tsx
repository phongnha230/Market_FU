'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { ProductDetail } from '@/types/product';
import { useUserStore } from '@/stores/userStore';

interface SellerTrustCardProps {
  seller: ProductDetail['seller'];
  postId: string;
  onRequireAuth?: (action: 'chat') => void;
}

import { chatService } from '@/services/chatService';

export default function SellerTrustCard({
  seller,
  postId,
  onRequireAuth,
}: SellerTrustCardProps) {
  const router = useRouter();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const [isStartingChat, setIsStartingChat] = React.useState(false);

  const sellerProfileUrl = `/sellers/${encodeURIComponent(seller.id || seller.name)}`;

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
        const conv = await chatService.createOrGetConversation(postId, seller.id);
        if (conv?.id) {
          router.push(`/chat?id=${conv.id}`);
          return;
        }
      }
      router.push(`/chat${seller.id ? `?sellerId=${encodeURIComponent(seller.id)}` : ''}`);
    } catch {
      router.push('/chat');
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <Link
          href={sellerProfileUrl}
          className="group flex items-center gap-3 transition cursor-pointer"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-fpt-blue text-sm font-black text-white shadow-xs group-hover:scale-105 transition-transform">
            {seller.initial || seller.name[0]}
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-fpt-orange transition-colors">
              {seller.name}
              {seller.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              )}
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-fpt-orange transition-colors" />
            </h4>
            <span className="text-xs text-emerald-600 font-medium">
              🛡️ Sinh viên {seller.cohort} Đã xác minh FPT Mail
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
      <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-2 text-center text-xs">
        <div>
          <div className="font-black text-slate-900">
            {seller.rating ? `${seller.rating} ⭐` : '0 ⭐'}
          </div>
          <div className="text-[10px] text-slate-400">
            {seller.reviewCount || 0} đánh giá
          </div>
        </div>
        <div>
          <div className="font-black text-slate-900">
            {seller.dealCount || 0}
          </div>
          <div className="text-[10px] text-slate-400">Đã giao dịch</div>
        </div>
        <div>
          <div className="font-black text-slate-900">
            {seller.responseRate || '0%'}
          </div>
          <div className="text-[10px] text-slate-400">Phản hồi (~0p)</div>
        </div>
      </div>
    </div>
  );
}
