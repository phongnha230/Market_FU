'use client';

import React, { useState } from 'react';
import { ProductDetail } from '@/types/product';
import { CheckCircle2, X, Send, BadgeDollarSign } from 'lucide-react';

interface PostDetailModalsProps {
  isChatModalOpen: boolean;
  onCloseChat: () => void;
  onSendChat: (msg: string) => void;
  isOfferModalOpen: boolean;
  onCloseOffer: () => void;
  onSendOffer: (price: string, note: string) => void;
  product: ProductDetail;
}

export default function PostDetailModals({
  isChatModalOpen,
  onCloseChat,
  onSendChat,
  isOfferModalOpen,
  onCloseOffer,
  onSendOffer,
  product,
}: PostDetailModalsProps) {
  const [chatMessage, setChatMessage] = useState(
    'Chào bạn, món đồ này còn không ạ? Mình muốn hẹn xem và nhận trực tiếp tại campus.'
  );
  const [offerPrice, setOfferPrice] = useState(String(Math.round(product.price * 0.9)));
  const [offerNote, setOfferNote] = useState(
    'Mình ở cùng campus, nếu được giá này mình qua lấy luôn nhé!'
  );

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    onSendChat(chatMessage);
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    onSendOffer(offerPrice, offerNote);
  };

  return (
    <>
      {/* QUICK CHAT MODAL */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-fpt-blue text-xs font-bold text-white">
                  {product.seller.initial || product.seller.name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Nhắn tin cho {product.seller.name}
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Sinh viên {product.seller.cohort} • Phản hồi ~5 phút
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseChat}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600">Gợi ý tin nhắn nhanh:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Chào bạn, đồ này còn không ạ?',
                  'Bạn có tiện mang ra sảnh Dom KTX xem thử không?',
                  'Có fix nhẹ tiền xăng xe không bạn?',
                ].map((quickText) => (
                  <button
                    key={quickText}
                    type="button"
                    onClick={() => setChatMessage(quickText)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:border-fpt-orange hover:text-fpt-orange transition text-left cursor-pointer"
                  >
                    {quickText}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSendChat} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung tin nhắn:
                </label>
                <textarea
                  rows={4}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Nhập tin nhắn của bạn..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-fpt-orange transition resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCloseChat}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Gửi tin nhắn</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRICE OFFER MODAL */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BadgeDollarSign className="h-5 w-5 text-fpt-orange" />
                <h3 className="text-sm font-bold text-slate-900">
                  Đề nghị giá trao đổi (Trả giá)
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseOffer}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl bg-orange-50/60 border border-orange-100 p-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Giá người bán niêm yết:</span>
                <span className="font-bold text-slate-900">{formatVND(product.price)}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Hãy đề xuất mức giá hợp lý để sinh viên dễ dàng chốt deal cùng bạn.
              </p>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mức giá bạn muốn đề xuất (VND):
                </label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Nhập số tiền..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-bold text-rose-600 outline-none focus:border-fpt-orange transition"
                  required
                />
              </div>

              <div className="flex gap-1.5">
                {[
                  { label: '-10%', val: Math.round(product.price * 0.9) },
                  { label: '-20%', val: Math.round(product.price * 0.8) },
                  { label: 'Bớt 50k', val: Math.max(0, product.price - 50000) },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setOfferPrice(String(chip.val))}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 py-1 text-[11px] font-semibold text-slate-700 hover:border-fpt-orange hover:text-fpt-orange transition cursor-pointer"
                  >
                    {chip.label} ({formatVND(chip.val)})
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lời nhắn gửi người bán:
                </label>
                <textarea
                  rows={2}
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-700 outline-none focus:border-fpt-orange transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onCloseOffer}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Gửi đề xuất giá</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
