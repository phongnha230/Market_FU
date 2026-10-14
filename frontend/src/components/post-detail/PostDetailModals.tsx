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
  const minAllowedPrice = Math.round(product.price * 0.5);

  const [chatMessage, setChatMessage] = useState(
    'Chào bạn, món đồ này còn không ạ? Mình muốn hẹn xem và nhận trực tiếp tại campus.'
  );
  const [discountPercent, setDiscountPercent] = useState('10');
  const [offerPrice, setOfferPrice] = useState(String(Math.round(product.price * 0.9)));
  const [offerNote, setOfferNote] = useState(
    'Mình ở cùng campus, nếu được giá này mình qua lấy luôn nhé!'
  );

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const numPct = parseFloat(discountPercent) || 0;
  const numericOfferPrice = parseInt(offerPrice.replace(/\D/g, ''), 10) || 0;
  const isOverLimit = numPct > 50 || numericOfferPrice < minAllowedPrice;
  const isInvalid = numericOfferPrice <= 0 || isNaN(numericOfferPrice);
  const hasOfferError = isOverLimit || isInvalid;

  const handleDiscountPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setDiscountPercent(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed >= 0) {
      const clamped = Math.min(100, parsed);
      const calculatedPrice = Math.max(0, Math.round(product.price * (1 - clamped / 100)));
      setOfferPrice(String(calculatedPrice));
    } else if (valStr === '') {
      setOfferPrice(String(product.price));
    }
  };

  const handleOfferPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setOfferPrice(valStr);
    const rawNumber = parseInt(valStr.replace(/\D/g, ''), 10);
    if (!isNaN(rawNumber) && product.price > 0) {
      const calculatedPct = Math.max(0, Math.round(((product.price - rawNumber) / product.price) * 100));
      setDiscountPercent(String(calculatedPct));
    } else {
      setDiscountPercent('');
    }
  };

  const handleSelectQuickDiscount = (pct: number) => {
    setDiscountPercent(String(pct));
    const calculatedPrice = Math.max(0, Math.round(product.price * (1 - pct / 100)));
    setOfferPrice(String(calculatedPrice));
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    onSendChat(chatMessage);
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasOfferError) return;
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

            {/* Price comparison & savings */}
            <div className="rounded-xl bg-orange-50/70 border border-orange-100 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Giá người bán niêm yết:</span>
                <span className="font-semibold text-slate-500 line-through">{formatVND(product.price)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-orange-100/80 pt-1.5">
                <span className="font-semibold text-slate-800">Giá bạn đề xuất:</span>
                <span className={`text-base font-extrabold ${hasOfferError ? 'text-rose-600' : 'text-fpt-orange'}`}>
                  {formatVND(numericOfferPrice)}
                </span>
              </div>
              {numericOfferPrice > 0 && !hasOfferError && (
                <div className="flex justify-between items-center text-[11px] text-emerald-700 font-medium">
                  <span>Tiết kiệm được:</span>
                  <span className="font-bold">
                    {formatVND(Math.max(0, product.price - numericOfferPrice))} (-{numPct}%)
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendOffer} className="space-y-3">
              {/* Hàng 2 ô nhập: % Muốn Giảm & Số Tiền Tương Ứng */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nhập % muốn giảm:
                    <span className="text-[10px] text-fpt-orange ml-1 font-bold">(Tối đa 50%)</span>
                  </label>
                  <div className={`relative flex items-center rounded-xl border bg-slate-50 transition focus-within:bg-white ${numPct > 50 ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 focus-within:border-fpt-orange'}`}>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={discountPercent}
                      onChange={handleDiscountPercentChange}
                      placeholder="VD: 15"
                      className="w-full bg-transparent px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                    />
                    <span className="pr-3 text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số tiền đề xuất:
                  </label>
                  <div className={`relative flex items-center rounded-xl border bg-slate-50 transition focus-within:bg-white ${hasOfferError ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 focus-within:border-fpt-orange'}`}>
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={handleOfferPriceChange}
                      placeholder="Số tiền..."
                      className={`w-full bg-transparent px-3 py-2 text-sm font-bold outline-none ${hasOfferError ? 'text-rose-600' : 'text-slate-900'}`}
                      required
                    />
                    <span className="pr-3 text-xs font-bold text-slate-500">đ</span>
                  </div>
                </div>
              </div>

              {/* Thông báo quy định hoặc cảnh báo lỗi vượt quá 50% */}
              {isOverLimit ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-[11px] text-rose-700 space-y-0.5">
                  <p className="font-bold flex items-center gap-1">
                    🚫 Mức trả giá không được vượt quá 50% giá gốc!
                  </p>
                  <p className="text-rose-600">
                    Theo quy chế giao dịch Market FU, giá thấp nhất bạn có thể đề xuất là{' '}
                    <strong>{formatVND(minAllowedPrice)}</strong> (giảm tối đa 50%).
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-2 text-[11px] text-sky-800">
                  <span>💡 Bạn có thể nhập số % hoặc bấm chọn nhanh các mốc giảm bên dưới:</span>
                </div>
              )}

              {/* Quick discount chips */}
              <div className="flex gap-1.5">
                {[
                  { label: '-10%', pct: 10 },
                  { label: '-20%', pct: 20 },
                  { label: '-30%', pct: 30 },
                  { label: '-50% (Tối đa)', pct: 50 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleSelectQuickDiscount(chip.pct)}
                    className={`flex-1 rounded-lg border py-1.5 text-[11px] font-bold transition cursor-pointer ${
                      numPct === chip.pct
                        ? 'border-fpt-orange bg-fpt-orange text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-fpt-orange hover:text-fpt-orange'
                    }`}
                  >
                    {chip.label}
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
                  placeholder="Nhập lời nhắn gửi kèm..."
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
                  disabled={hasOfferError}
                  className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-xs transition ${
                    hasOfferError
                      ? 'bg-slate-300 cursor-not-allowed opacity-70'
                      : 'bg-fpt-orange hover:bg-fpt-orange-hover cursor-pointer'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {hasOfferError
                      ? 'Mức giá không hợp lệ (Quá 50%)'
                      : `Gửi đề xuất ${formatVND(numericOfferPrice)}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
