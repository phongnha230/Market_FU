'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChatMessage } from '@/types/chat';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ShieldCheck, Tag, CheckCircle2, CheckCheck, Sparkles, MapPin, Ticket, ChevronRight, Clock, AlertCircle } from 'lucide-react';

function getInitials(name?: string): string {
  if (!name) return 'SV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function OfferCountdown({ acceptedAt }: { acceptedAt?: number }) {
  const [timeLeft, setTimeLeft] = React.useState<number>(() => {
    if (!acceptedAt) return 30 * 60;
    return Math.max(0, Math.floor((acceptedAt + 30 * 60 * 1000 - Date.now()) / 1000));
  });

  React.useEffect(() => {
    if (!acceptedAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((acceptedAt + 30 * 60 * 1000 - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [acceptedAt]);

  if (timeLeft <= 0) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
        <Clock className="h-3 w-3" /> Hết hạn 30p
      </span>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-md">
      <Clock className="h-3 w-3 text-emerald-600" />
      Còn {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}

interface MessageHistoryProps {
  messages: ChatMessage[];
  partnerName: string;
  partnerAvatar: string;
  isTyping: boolean;
  containerRef?: React.Ref<HTMLDivElement>;
  productId?: string;
  productStatus?: string;
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
  productStatus,
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
          if (msg.productTicket) {
            const ticket = msg.productTicket;
            const isMe = msg.sender === 'me';
            return (
              <div key={msg.id} className="flex justify-center my-3">
                <div className="w-full max-w-md rounded-2xl border-2 border-orange-200/90 bg-gradient-to-b from-orange-50/70 via-white to-white p-4 shadow-xs space-y-3">
                  {/* Ticket Header */}
                  <div className="flex items-center justify-between border-b border-orange-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-fpt-orange text-white flex items-center justify-center shadow-xs shrink-0">
                        <Ticket className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 block">
                          FPT Market Ticket
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {isMe ? 'Thẻ hỏi mua sản phẩm' : 'Yêu cầu hỏi mua từ khách hàng'}
                        </h4>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Đang trao đổi
                    </span>
                  </div>

                  {/* Product Details Box */}
                  <div className="flex gap-3 rounded-xl bg-white border border-slate-200/90 p-2.5 shadow-2xs">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-100 bg-slate-100 shrink-0">
                      <Image
                        src={ticket.imageUrl || '/products/keyboard-akko.jpg'}
                        alt={ticket.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-1" title={ticket.title}>
                          {ticket.title}
                        </h5>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-sm font-extrabold text-fpt-orange">
                            {ticket.price?.toLocaleString('vi-VN')} đ
                          </span>
                          {ticket.conditionBadge && (
                            <span className="rounded bg-orange-100 px-1.5 py-0.2 text-[9px] font-bold text-orange-800">
                              {ticket.conditionBadge}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin className="h-3 w-3 text-fpt-orange shrink-0" />
                        <span className="truncate">{ticket.location || 'Campus FPT'}</span>
                        {ticket.sellerName && (
                          <span className="truncate text-slate-400"> • {ticket.sellerName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Message Note attached to ticket */}
                  {msg.text && (
                    <div className="rounded-xl bg-orange-50 border border-orange-200/60 px-3 py-2 text-xs text-slate-700 leading-relaxed font-medium">
                      💬 &quot;{msg.text}&quot;
                    </div>
                  )}

                  {/* Quick Ticket Action Buttons */}
                  <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span>Gửi lúc {msg.time}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {ticket.id && (
                        <Link
                          href={`/posts/${encodeURIComponent(ticket.id)}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-fpt-orange transition py-1 px-2 rounded-lg hover:bg-slate-100"
                        >
                          <span>Xem tin đăng</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      {!isSeller && (productId || ticket.id) && (
                        <Link
                          href={`/checkout?productId=${encodeURIComponent((productId || ticket.id) as string)}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-98"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                          <span>Đặt mua ngay</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (msg.isOfferAccepted) {
            const numericPrice = msg.numericOfferPrice || parseInt((msg.offerPrice || '').replace(/\D/g, ''), 10) || 0;
            const isProductUnavailable = Boolean(productStatus && productStatus !== 'AVAILABLE');
            const isExpired = Boolean(
              msg.isOfferExpired ||
              (msg.offerAcceptedAt && Date.now() - msg.offerAcceptedAt > 30 * 60 * 1000)
            );

            // 1. Trường hợp sản phẩm đã bị người khác mua trước (First-Come-First-Served)
            if (isProductUnavailable) {
              return (
                <div key={msg.id} className="flex justify-center my-2.5">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 shadow-2xs max-w-sm w-full text-xs space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-xl bg-slate-400 text-white flex items-center justify-center shrink-0">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                          <span>Món đồ đã có người mua</span>
                          <span className="rounded bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5">
                            Đã bán / Giữ chỗ
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Giá thỏa thuận trước đó: <span className="line-through">{msg.offerPrice}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      Rất tiếc! Sinh viên khác đã nhanh tay thanh toán / đặt mua món đồ này trước.
                    </div>
                  </div>
                </div>
              );
            }

            // 2. Trường hợp đã quá hạn 30 phút mà chưa tạo đơn hàng
            if (isExpired) {
              return (
                <div key={msg.id} className="flex justify-center my-2.5">
                  <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3 shadow-2xs max-w-sm w-full text-xs space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-amber-950 text-xs flex items-center justify-between">
                          <span>Thỏa thuận giá đã hết hạn</span>
                          <span className="rounded bg-amber-200/70 text-amber-800 text-[10px] font-bold px-1.5 py-0.5">
                            Quá 30 phút
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-800 font-medium">
                          Giá từng chốt: <span className="line-through">{msg.offerPrice}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-700 flex items-center justify-between">
                      <span>Ưu đãi quá 30 phút. Vui lòng thương lượng lại!</span>
                    </div>
                  </div>
                </div>
              );
            }

            // 3. Trường hợp bình thường: Còn trong hạn 30 phút và sản phẩm vẫn AVAILABLE
            return (
              <div key={msg.id} className="flex justify-center my-2.5">
                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50/40 border border-emerald-200/90 p-3 shadow-2xs max-w-sm w-full text-xs space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-emerald-950 text-xs flex items-center justify-between">
                        <span>Đã chốt giá thỏa thuận</span>
                        <OfferCountdown acceptedAt={msg.offerAcceptedAt} />
                      </div>
                      <div className="text-[11px] text-emerald-800 font-medium">
                        Giá chốt: <strong className="text-emerald-700 font-extrabold text-xs">{msg.offerPrice}</strong>
                      </div>
                    </div>
                  </div>

                  {!isSeller && productId && numericPrice > 0 && (
                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-700 font-medium">
                        Giữ ưu đãi trong 30 phút
                      </span>
                      <Link
                        href={`/checkout?productId=${encodeURIComponent(productId)}&agreedPrice=${numericPrice}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-200" />
                        <span>Đặt mua ngay ({msg.offerPrice})</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          if (msg.isOfferRejected) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="rounded-xl bg-rose-50/90 border border-rose-200/80 px-3 py-1.5 flex items-center gap-2 shadow-2xs max-w-sm text-xs">
                  <div className="h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <Tag className="h-3 w-3" />
                  </div>
                  <div className="text-[11px] text-rose-900 font-medium">
                    Đã từ chối giá đề xuất: <strong className="font-bold text-rose-700">{msg.offerPrice || 'thương lượng'}</strong>
                  </div>
                </div>
              </div>
            );
          }

          if (msg.offerPrice && !msg.isOfferAccepted && !msg.isOfferRejected) {
            const numericPrice = msg.numericOfferPrice || parseInt((msg.offerPrice || '').replace(/\D/g, ''), 10) || 0;
            return (
              <div key={msg.id} className="flex justify-center my-2.5">
                <div className="rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/40 border border-amber-200/90 p-3 shadow-2xs max-w-sm w-full text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Tag className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-amber-950 text-xs">
                          Đề nghị thương lượng giá
                        </div>
                        <div className="text-[11px] text-amber-800 font-medium">
                          Mức giá: <strong className="text-xs font-black text-fpt-orange">{msg.offerPrice}</strong>
                        </div>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200/60 shrink-0">
                      Chờ phản hồi
                    </span>
                  </div>

                  {isSeller && msg.sender !== 'me' ? (
                    <div className="pt-2 border-t border-amber-200/60 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onRejectOffer && onRejectOffer(msg.id, numericPrice)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition active:scale-95 cursor-pointer shadow-2xs"
                      >
                        Từ chối
                      </button>
                      <button
                        type="button"
                        onClick={() => onAcceptOffer && onAcceptOffer(msg.id, numericPrice)}
                        className="rounded-xl bg-gradient-to-r from-orange-500 to-fpt-orange px-3 py-1.5 text-xs font-bold text-white hover:from-orange-600 hover:to-orange-700 transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Đồng ý mức giá</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-1.5 border-t border-amber-200/50 text-[10.5px] text-amber-700 italic flex items-center gap-1">
                      <span>⏳ Đang chờ {isSeller ? 'người mua' : 'người bán'} phản hồi đề xuất...</span>
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
                <div className="relative shrink-0 mb-1">
                  <Avatar className="h-7 w-7 border border-slate-200">
                    <AvatarImage src={partnerAvatar} alt={partnerName} />
                    <AvatarFallback className="bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-[10px]">
                      {getInitials(partnerName)}
                    </AvatarFallback>
                  </Avatar>
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
