'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { ProductDetail } from '@/types/product';

interface SellerTrustCardProps {
  seller: ProductDetail['seller'];
  postId: string;
}

export default function SellerTrustCard({
  seller,
  postId,
}: SellerTrustCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-fpt-blue text-sm font-black text-white shadow-xs">
            {seller.initial || seller.name[0]}
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              {seller.name}
              {seller.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              )}
            </h4>
            <span className="text-xs text-emerald-600 font-medium">
              🛡️ Sinh viên {seller.cohort} Đã xác minh FPT Mail
            </span>
          </div>
        </div>

        <Link
          href={`/chat?seller=${encodeURIComponent(seller.name)}&postId=${encodeURIComponent(postId)}`}
          className="text-xs font-bold text-fpt-orange hover:underline cursor-pointer"
        >
          Nhắn tin &gt;
        </Link>
      </div>

      {/* 3-Col Stats */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-2 text-center text-xs">
        <div>
          <div className="font-black text-slate-900">
            {seller.rating || 4.9} ⭐
          </div>
          <div className="text-[10px] text-slate-400">
            {seller.reviewCount || 28} đánh giá
          </div>
        </div>
        <div>
          <div className="font-black text-slate-900">
            {seller.dealCount || 14}
          </div>
          <div className="text-[10px] text-slate-400">Đã giao dịch</div>
        </div>
        <div>
          <div className="font-black text-slate-900">
            {seller.responseRate || '98%'}
          </div>
          <div className="text-[10px] text-slate-400">Phản hồi (~5p)</div>
        </div>
      </div>
    </div>
  );
}
