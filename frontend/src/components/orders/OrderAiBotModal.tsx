'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, X, ChevronRight } from 'lucide-react';

interface OrderAiBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export default function OrderAiBotModal({
  isOpen,
  onClose,
  onShowToast,
}: OrderAiBotModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-fpt-orange" />
            <div>
              <h3 className="text-sm font-bold">Trợ lý AI Trọng tài Escrow FPT</h3>
              <p className="text-[10px] text-slate-400">Trực tuyến 24/7 • Phản hồi tức thì</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs max-h-72 overflow-y-auto">
          <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
            Xin chào bạn <strong>Lê Minh Quân</strong>! Mình có thể hỗ trợ gì cho đơn hàng <strong>#ORD-88392-HCM-HL</strong> đang vận chuyển từ TP.HCM về Hòa Lạc?
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() =>
                onShowToast(
                  '🤖 Bot: Đơn hàng đang trên xe trung chuyển FPT Express Bus qua Đà Nẵng, dự kiến đến Hòa Lạc 14:00 ngày mai.'
                )
              }
              className="text-left rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 transition text-[11px] cursor-pointer"
            >
              📍 Kiểm tra vị trí chính xác hiện tại của kiện hàng
            </button>
            <button
              type="button"
              onClick={() =>
                onShowToast(
                  '🤖 Bot: Bạn có 48h sau khi ký nhận để cắm test máy. Nếu lỗi, số tiền 1.225.000 đ sẽ được hoàn về ví.'
                )
              }
              className="text-left rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 transition text-[11px] cursor-pointer"
            >
              🛡️ Quy trình khiếu nại nếu màn hình nhận được bị lỗi/nứt
            </button>
            <Link
              href="/orders/dispute?code=ORD-88392-HCM-HL"
              onClick={onClose}
              className="text-left rounded-lg border border-rose-200 bg-rose-50/70 p-2 text-rose-800 hover:bg-rose-100 transition text-[11px] font-bold flex items-center justify-between"
            >
              <span>⚠️ Mở hồ sơ Khiếu nại & Khóa ví Escrow</span>
              <ChevronRight className="h-3.5 w-3.5 text-rose-600" />
            </Link>
          </div>
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-300 cursor-pointer"
          >
            Đóng hỗ trợ
          </button>
        </div>
      </div>
    </div>
  );
}
