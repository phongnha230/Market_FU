'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, ShieldCheck, ChevronRight } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';

interface OrderSidebarProps {
  onOpenAiBot: () => void;
  isSeller?: boolean;
  onOpenKyc?: () => void;
}

export default function OrderSidebar({ onOpenAiBot, isSeller = false, onOpenKyc }: OrderSidebarProps) {
  return (
    <div className="lg:col-span-3 space-y-4">
      {/* AI ASSISTANT CARD */}
      <Card className="rounded-2xl border border-orange-100 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-fpt-orange flex items-center gap-1">
            <Bot className="h-4 w-4" /> Trợ lý AI Hỗ Trợ Đơn
          </span>
          <Badge className="rounded bg-orange-100 text-fpt-orange text-[10px] font-bold px-1.5 py-0.2 border-none hover:bg-orange-100">
            24/7 Bot
          </Badge>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Tự động đối chiếu biên lai Safe-Handoff Point & phân xử hoàn tiền Escrow chỉ trong 10 phút.
        </p>
        <Button
          type="button"
          onClick={onOpenAiBot}
          className="h-auto w-full mt-3 rounded-xl bg-orange-700 py-2 text-xs font-bold text-white hover:bg-orange-800 transition cursor-pointer shadow-xs"
        >
          Kích hoạt trợ lý giải quyết sự cố
        </Button>
      </Card>

      {/* CAMPUS ESCROW PROTECTION CARD */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Campus Escrow Protection</span>
        </div>
        <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
          Tiền thanh toán được giữ an toàn 48 tiếng sau khi nhận đồ để kiểm tra kỹ thuật tại Lab / Phòng KTX.
        </p>
      </Card>

      {/* QUICK ACTIONS */}
      <Card className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-2 text-xs font-semibold text-slate-700 shadow-none">
        <Link
          href="/favorites"
          className="flex items-center justify-between p-2 rounded-xl hover:bg-white transition"
        >
          <span>Mục yêu thích & Đã lưu</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>
        <Link
          href="/profile"
          className="flex items-center justify-between p-2 rounded-xl hover:bg-white transition"
        >
          <span>Hồ sơ sinh viên</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>
        {isSeller ? (
          <Link
            href="/create-post"
            className="flex items-center justify-between p-2 rounded-xl hover:bg-white transition text-fpt-orange"
          >
            <span>+ Đăng bán đồ cũ</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={onOpenKyc}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white transition text-fpt-orange cursor-pointer font-semibold text-xs"
          >
            <span>🛍️ Đăng ký mở Seller</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </Card>
    </div>
  );
}
