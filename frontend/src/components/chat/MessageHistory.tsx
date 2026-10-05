'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChatMessage } from '@/types/chat';
import { ShieldCheck, Tag, CheckCircle2, CheckCheck, Sparkles, MapPin } from 'lucide-react';

interface MessageHistoryProps {
  messages: ChatMessage[];
  partnerName: string;
  partnerAvatar: string;
  isTyping: boolean;
  containerRef?: React.Ref<HTMLDivElement>;
  productId?: string;
  isSeller?: boolean;
  onAcceptOffer?: (msgId: string, offerPrice: number) => void;
  onRejectOffer?: (msgId: string, offerPrice: number) => void;
}

export default function MessageHistory({
  messages,
  partnerName,
  partnerAvatar,
  isTyping,
  containerRef,
  productId,
  isSeller,
  onAcceptOffer,
  onRejectOffer,
}: MessageHistoryProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* FPT SAFE TRADING CALLOUT BOX */}
      <div className="mx-4 mt-3 shrink-0 rounded-xl bg-blue-50/80 border border-blue-200/80 p-3 text-xs text-blue-900 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed text-[11px]">
          <strong>Khuyến nghị An toàn Giao dịch FPT:</strong> Chỉ chuyển khoản hoặc trả tiền mặt sau khi đã gặp trực tiếp, test kỹ thiết bị tại khu vực camera giám sát như Sảnh Alpha, Thư viện Gamma hoặc Căng-tin Dom. Tuyệt đối không cọc trước khi chưa gặp người bán.
        </div>
      </div>

      {/* MESSAGES HISTORY */}
      <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
        {/* Date Divider */}
        <div className="flex items-center justify-center my-2">
          <span className="rounded-full bg-slate-200/80 px-3 py-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            Hôm nay, 24 Tháng 10
          </span>
        </div>

        {messages.map((msg) => {
          if (msg.isOfferAccepted) {
            const numericPrice = msg.numericOfferPrice || parseInt((msg.offerPrice || '').replace(/\D/g, ''), 10) || 0;
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 shadow-xs max-w-md w-full text-xs space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Đã chốt giá thỏa thuận thành công!</span>
                      </div>
                      <div className="text-[11px] text-emerald-800 mt-0.5">
                        Mức giá được chấp nhận: <strong className="text-sm text-emerald-700">{msg.offerPrice}</strong>
                      </div>
                    </div>
                  </div>

                  {!isSeller && productId && numericPrice > 0 && (
                    <div className="pt-2 border-t border-emerald-200/70 flex justify-end">
                      <Link
                        href={`/checkout?productId=${encodeURIComponent(productId)}&agreedPrice=${numericPrice}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition active:scale-98"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        <span>Đặt mua ngay (Giá chốt: {msg.offerPrice})</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          if (msg.isOfferRejected) {
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-center gap-3 shadow-xs max-w-md text-xs">
                  <div className="h-8 w-8 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-rose-950">
                      Đã từ chối đề xuất giá
                    </div>
                    <div className="text-[11px] text-rose-700">
                      Mức giá đề xuất: <strong>{msg.offerPrice}</strong> đã bị từ chối
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (msg.offerPrice && !msg.isOfferAccepted && !msg.isOfferRejected) {
            const numericPrice = msg.numericOfferPrice || parseInt((msg.offerPrice || '').replace(/\D/g, ''), 10) || 0;
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 shadow-xs max-w-md w-full text-xs space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-bold text-amber-950">
                          Đề nghị thương lượng giá
                        </div>
                        <div className="text-[11px] text-amber-800">
                          Mức giá đề xuất: <strong className="text-sm text-fpt-orange">{msg.offerPrice}</strong>
                        </div>
                      </div>
                    </div>
                    <span className="rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      Chờ phản hồi
                    </span>
                  </div>

                  {isSeller ? (
                    <div className="pt-2 border-t border-amber-200/70 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onRejectOffer && onRejectOffer(msg.id, numericPrice)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Từ chối
                      </button>
                      <button
                        type="button"
                        onClick={() => onAcceptOffer && onAcceptOffer(msg.id, numericPrice)}
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                      >
                        Đồng ý mức giá này
                      </button>
                    </div>
                  ) : (
                    <div className="pt-1.5 border-t border-amber-200/60 text-[11px] text-amber-800/90 italic flex items-center gap-1">
                      <span>⏳ Đang chờ người bán phản hồi đề xuất...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          const isMeetupMsg = msg.text.includes('hẹn điểm') || msg.text.includes('Hẹn điểm') || msg.text.includes('bàn giao đồ tại Sảnh');
          if (isMeetupMsg) {
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center justify-between gap-3 shadow-xs max-w-md w-full text-xs">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950">
                        Hẹn gặp Safe-Handoff tại Campus
                      </div>
                      <div className="text-[11px] text-emerald-800 leading-tight mt-0.5">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/orders"
                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs shrink-0"
                  >
                    Mở QR hẹn
                  </Link>
                </div>
              </div>
            );
          }

          const isMe = msg.sender === 'me';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <div className="relative h-7 w-7 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0 mb-1">
                  <Image
                    src={partnerAvatar}
                    alt={partnerName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="max-w-[80%] sm:max-w-[65%] space-y-1">
                <div
                  className={`rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-fpt-orange text-white rounded-br-xs font-medium'
                      : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Embedded Photo in message */}
                  {msg.image && (
                    <div className="mt-2 relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 group">
                      <Image
                        src={msg.image}
                        alt="Ảnh thật sản phẩm"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-2 right-2 rounded-lg bg-slate-900/80 px-2 py-1 text-[10px] font-bold text-white flex items-center gap-1">
                        <span>Phóng to</span>
                        <Sparkles className="h-3 w-3" />
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 ${
                    isMe ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck className="h-3 w-3 text-emerald-500" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
            <div className="flex gap-1 items-center bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-[11px] text-slate-500 ml-1 font-medium">
                {partnerName.split(' ')[0]} đang nhập tin nhắn...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
