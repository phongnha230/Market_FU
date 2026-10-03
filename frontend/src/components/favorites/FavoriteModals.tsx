'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FavoriteItem } from '@/stores/favoriteStore';
import { X, Send, MapPin, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteModalsProps {
  chattingItem: FavoriteItem | null;
  onCloseChat: () => void;
  onSendChat: (msg: string) => void;
  previewItem: FavoriteItem | null;
  onClosePreview: () => void;
  onChatFromPreview: (item: FavoriteItem) => void;
  isPriceAlertOpen: boolean;
  onClosePriceAlert: () => void;
  onSubmitPriceAlert: (keyword: string, price: string) => void;
}

export default function FavoriteModals({
  chattingItem,
  onCloseChat,
  onSendChat,
  previewItem,
  onClosePreview,
  onChatFromPreview,
  isPriceAlertOpen,
  onClosePriceAlert,
  onSubmitPriceAlert,
}: FavoriteModalsProps) {
  const [chatMessage, setChatMessage] = useState('');
  const [alertKeyword, setAlertKeyword] = useState('');
  const [alertPrice, setAlertPrice] = useState('500.000');

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    onSendChat(chatMessage);
    setChatMessage('');
  };

  const handleSubmitPriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertKeyword.trim()) return;
    onSubmitPriceAlert(alertKeyword, alertPrice);
    setAlertKeyword('');
  };

  return (
    <>
      {/* QUICK CHAT MODAL */}
      {chattingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full text-xs font-bold text-white flex items-center justify-center',
                    chattingItem.seller.avatarColor
                  )}
                >
                  {chattingItem.seller.initials}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {chattingItem.seller.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {chattingItem.seller.cohort} · {chattingItem.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/chat?seller=${encodeURIComponent(chattingItem.seller.name)}`}
                  className="text-[11px] font-bold text-fpt-orange hover:underline px-2 py-1 rounded-lg hover:bg-orange-50 transition"
                >
                  Mở tin nhắn đầy đủ ↗
                </Link>
                <button
                  type="button"
                  onClick={onCloseChat}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Product summary card in chat */}
            <div className="p-4 bg-orange-50/40 border-b border-orange-100/60 flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                <Image
                  src={chattingItem.imageUrl}
                  alt={chattingItem.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-800 truncate">
                  {chattingItem.title}
                </h4>
                <p className="text-xs font-extrabold text-fpt-orange">
                  {formatVND(chattingItem.price)}
                </p>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
              <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-700 max-w-[85%]">
                Xin chào bạn! Mình đang pass món này tại cơ sở Hola, bạn muốn xem trực tiếp ở đâu nhỉ?
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSendChat}
              className="p-4 border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={`Nhắn hỏi mua với ${chattingItem.seller.name}...`}
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-fpt-orange"
                autoFocus
              />
              <button
                type="submit"
                className="rounded-xl bg-fpt-orange p-2 text-white hover:bg-fpt-orange-hover transition cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QUICK VIEW / PREVIEW MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100">
            <div className="relative aspect-[16/10] w-full bg-slate-100">
              <Image
                src={previewItem.imageUrl}
                alt={previewItem.title}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={onClosePreview}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow hover:bg-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-slate-900">
                  {formatVND(previewItem.price)}
                </span>
                {previewItem.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatVND(previewItem.originalPrice)}
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-base font-bold text-slate-900">
                {previewItem.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {previewItem.location}
              </p>

              <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full text-xs font-bold text-white flex items-center justify-center',
                    previewItem.seller.avatarColor
                  )}
                >
                  {previewItem.seller.initials}
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-900">
                    {previewItem.seller.name}
                  </div>
                  <div className="text-slate-500">
                    {previewItem.seller.cohort} · MSSV:{' '}
                    {previewItem.seller.studentIdMasked}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => onChatFromPreview(previewItem)}
                  className="flex-1 rounded-xl bg-fpt-orange py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-fpt-orange-hover transition cursor-pointer"
                >
                  Nhắn hỏi mua ngay
                </button>
                <Link
                  href="/posts/feat-1"
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Xem bài đăng gốc
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRICE ALERT MODAL */}
      {isPriceAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-fpt-orange" />
                <h3 className="text-base font-bold text-slate-900">
                  Đặt thông báo giá (Price Alert)
                </h3>
              </div>
              <button
                type="button"
                onClick={onClosePriceAlert}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-600">
              Nhận thông báo tức thời khi có bạn sinh viên FPT pass đồ theo tiêu chí của bạn.
            </p>

            <form onSubmit={handleSubmitPriceAlert} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Món đồ cần săn
                </label>
                <input
                  type="text"
                  value={alertKeyword}
                  onChange={(e) => setAlertKeyword(e.target.value)}
                  placeholder="VD: Màn hình Dell, Bàn phím cơ, Võ phục..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-fpt-orange"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mức giá kỳ vọng tối đa
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-12 text-xs sm:text-sm outline-none focus:border-fpt-orange"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    VNĐ
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={onClosePriceAlert}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-fpt-orange py-2.5 text-xs font-bold text-white hover:bg-fpt-orange-hover transition cursor-pointer"
                >
                  Kích hoạt radar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
