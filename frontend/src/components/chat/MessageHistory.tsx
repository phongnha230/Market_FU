'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChatMessage } from '@/types/chat';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  ShieldCheck,
  Tag,
  CheckCircle2,
  CheckCheck,
  Sparkles,
  MapPin,
  Ticket,
  ChevronRight,
  Clock,
  AlertCircle,
  PackageCheck,
  Lock,
  ReceiptText,
  XCircle,
  Truck,
  CalendarCheck,
  QrCode,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react';

function getInitials(name?: string): string {
  if (!name) return 'SV';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatMessageTime(timeStr?: string): string {
  if (!timeStr) return '';
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) return timeStr;
  const d = new Date(timeStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  return timeStr;
}

function formatDateHeader(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    return `Hôm nay, ${now.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const now = new Date();
    return `Hôm nay, ${now.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  }
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `Hôm nay, ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Hôm qua, ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  }
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function OfferCountdown({ acceptedAt, onExpire }: { acceptedAt?: number; onExpire?: () => void }) {
  const calculateRemaining = () => {
    if (!acceptedAt) return 0;
    return Math.max(0, Math.floor((acceptedAt + 30 * 60 * 1000 - Date.now()) / 1000));
  };

  const [timeLeft, setTimeLeft] = React.useState<number>(calculateRemaining);

  React.useEffect(() => {
    if (!acceptedAt) return;
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
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

interface AcceptedDealCardProps {
  msg: ChatMessage;
  productStatus?: string;
  productId?: string;
  isSeller?: boolean;
  onExpireDeal?: () => void;
}

function AcceptedDealCard({
  msg,
  productStatus,
  productId,
  isSeller,
  onExpireDeal,
}: AcceptedDealCardProps) {
  const numericPrice = msg.numericOfferPrice || parseInt((msg.offerPrice || '').replace(/\D/g, ''), 10) || 0;
  const isProductUnavailable = Boolean(productStatus && productStatus !== 'AVAILABLE');

  const checkExpired = () => {
    if (msg.isOfferExpired) return true;
    if (!msg.offerAcceptedAt) return false;
    return Date.now() - msg.offerAcceptedAt > 30 * 60 * 1000;
  };

  const [isExpired, setIsExpired] = React.useState<boolean>(checkExpired);

  React.useEffect(() => {
    setIsExpired(checkExpired());
  }, [msg.isOfferExpired, msg.offerAcceptedAt]);

  React.useEffect(() => {
    if (!msg.offerAcceptedAt || isExpired) return;
    const remainingMs = msg.offerAcceptedAt + 30 * 60 * 1000 - Date.now();
    if (remainingMs <= 0) {
      setIsExpired(true);
      onExpireDeal?.();
      return;
    }
    const timer = setTimeout(() => {
      setIsExpired(true);
      onExpireDeal?.();
    }, remainingMs);
    return () => clearTimeout(timer);
  }, [msg.offerAcceptedAt, isExpired]);

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
            <span>Ưu đãi quá 30 phút. Giá sản phẩm đã quay về giá gốc!</span>
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
              <OfferCountdown
                acceptedAt={msg.offerAcceptedAt}
                onExpire={() => {
                  setIsExpired(true);
                  onExpireDeal?.();
                }}
              />
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
  onEditMessage?: (msgId: string, newText: string) => void;
  onDeleteMessage?: (msgId: string) => void;
  onExpireDeal?: () => void;
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
  onEditMessage,
  onDeleteMessage,
  onExpireDeal,
}: MessageHistoryProps) {
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.text || '');
  };

  const handleCancelEdit = () => {
    setEditingMsgId(null);
    setEditingText('');
  };

  const handleSaveEdit = (msgId: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    if (onEditMessage) {
      onEditMessage(msgId, trimmed);
    }
    setEditingMsgId(null);
    setEditingText('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* MESSAGES HISTORY */}
      <div ref={containerRef} className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3.5">
        {/* Date Divider */}
        <div className="flex items-center justify-center my-1.5">
          <span className="rounded-full bg-slate-200/80 px-3 py-1 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
            {formatDateHeader(messages[0]?.time)}
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
                      {ticket.imageUrl ? (
                        <Image
                          src={ticket.imageUrl}
                          alt={ticket.title}
                          fill
                          className="object-cover"
                        />
                      ) : null}
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

          // Trường hợp đề xuất giá từng được chốt nhưng sau đó đơn hàng bị hủy hoặc bị từ chối lại -> trở về giá gốc
          if (msg.isOfferCancelled) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="rounded-2xl bg-slate-100/90 border border-slate-200 p-3 shadow-2xs max-w-sm w-full text-xs space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-xl bg-slate-400 text-white flex items-center justify-center shrink-0">
                      <XCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-700 text-xs flex items-center justify-between">
                        <span>Thỏa thuận giá đã hủy</span>
                        <span className="rounded bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5">
                          Về giá gốc
                        </span>
                      </div>
                      {msg.offerPrice && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          Mức giá từng thương lượng: <span className="line-through">{msg.offerPrice}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/70 text-[11px] text-slate-500">
                    Đơn hàng hoặc thỏa thuận này đã bị hủy. Sản phẩm đã quay về giá gốc niêm yết.
                  </div>
                </div>
              </div>
            );
          }

          if (msg.isOfferAccepted) {
            return (
              <AcceptedDealCard
                key={msg.id}
                msg={msg}
                productStatus={productStatus}
                productId={productId}
                isSeller={isSeller}
                onExpireDeal={onExpireDeal}
              />
            );
          }

          if (msg.isOfferRejected || msg.text?.includes('[OFFER_REJECTED]')) {
            const cleanRejectText = (msg.text || '').replace(/^\[OFFER_REJECTED\]\s*/i, '');
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="rounded-xl bg-rose-50/90 border border-rose-200/80 px-3.5 py-2 flex items-center gap-2.5 shadow-2xs max-w-md text-xs">
                  <div className="h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <Tag className="h-3 w-3" />
                  </div>
                  <div className="text-[11px] text-rose-900 font-medium leading-relaxed">
                    {msg.offerPrice ? (
                      <>
                        Đã từ chối giá đề xuất: <strong className="font-bold text-rose-700">{msg.offerPrice}</strong> (Sản phẩm giữ nguyên giá gốc)
                      </>
                    ) : (
                      cleanRejectText || 'Đã từ chối mức giá đề xuất. Sản phẩm giữ nguyên giá gốc niêm yết.'
                    )}
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

          const isOrderCreatedMsg = msg.text?.includes('[ORDER_CREATED]');
          if (isOrderCreatedMsg) {
            const orderCodeMatch = msg.text.match(/#(ORD-[A-Za-z0-9_-]+)/i);
            const orderCode = orderCodeMatch ? orderCodeMatch[1] : '';
            const cleanText = msg.text.replace(/^\[ORDER_CREATED\]\s*/i, '');

            return (
              <div key={msg.id} className="flex justify-center my-3 w-full">
                <div className="rounded-2xl bg-white border border-emerald-200/90 p-4 shadow-xs max-w-md w-full">
                  {/* Header Tag + Time */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Đơn Hàng Escrow</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatMessageTime(msg.time)}
                    </span>
                  </div>

                  {/* Order Main Title */}
                  <div className="flex items-center gap-2.5 mt-3">
                    <div className="h-9 w-9 rounded-xl bg-orange-100 text-fpt-orange flex items-center justify-center shrink-0">
                      <PackageCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">
                        Đã Đặt Mua Thành Công!
                      </h5>
                      {orderCode && (
                        <span className="text-[11px] font-mono font-semibold text-slate-500">
                          Mã đơn: #{orderCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Body Text */}
                  <div className="mt-2.5 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-700 leading-relaxed">
                    <p className="font-medium text-slate-800">{cleanText}</p>
                    <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-sky-800">
                      <Lock className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span>
                        {cleanText.toLowerCase().includes('ship') ||
                        cleanText.toLowerCase().includes('giao hàng') ||
                        cleanText.toLowerCase().includes('liên campus')
                          ? 'Tiền cọc Escrow được sàn FPT giữ bảo chứng an toàn. Khoản tiền sẽ được giải ngân cho Người bán sau khi bưu tá giao hàng và qua thời gian dùng thử 48h (Golden Test Period).'
                          : 'Tiền cọc được sàn FPT giữ bảo chứng an toàn, chỉ thanh toán cho người bán khi hai bên quét mã bàn giao tại Safe Point.'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-3 flex items-center justify-end">
                    <Link
                      href={orderCode ? `/orders/${encodeURIComponent(orderCode)}` : '/orders'}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white text-xs font-bold px-3.5 py-2 transition shadow-xs cursor-pointer"
                    >
                      <ReceiptText className="h-3.5 w-3.5" />
                      <span>Xem chi tiết đơn hàng</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          }

          const isOrderCancelledMsg = msg.text?.includes('[ORDER_CANCELLED]');
          if (isOrderCancelledMsg) {
            const orderCodeMatch = msg.text.match(/#(ORD-[A-Za-z0-9_-]+)/i);
            const orderCode = orderCodeMatch ? orderCodeMatch[1] : '';
            const cleanText = msg.text.replace(/^\[ORDER_CANCELLED\]\s*/i, '');

            return (
              <div key={msg.id} className="flex justify-center my-3 w-full">
                <div className="rounded-2xl bg-rose-50/70 border border-rose-200 p-4 shadow-xs max-w-md w-full">
                  {/* Header Tag + Time */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-rose-200/60">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                      <XCircle className="h-3.5 w-3.5 text-rose-600" />
                      <span>Đơn Hàng Đã Hủy</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatMessageTime(msg.time)}
                    </span>
                  </div>

                  {/* Cancel Title */}
                  <div className="flex items-center gap-2.5 mt-3">
                    <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">
                        Đơn hàng {orderCode ? `#${orderCode}` : ''} đã bị hủy
                      </h5>
                      <span className="text-[11px] text-rose-700 font-medium">
                        Tiền cọc / Xu đã được hoàn về ví người mua • Giá sản phẩm đã quay về giá gốc
                      </span>
                    </div>
                  </div>

                  {/* Cancel Details */}
                  <div className="mt-2.5 rounded-xl bg-white/90 border border-rose-100 p-3 text-xs text-slate-700 leading-relaxed">
                    <p className="font-medium text-slate-800">{cleanText}</p>
                    <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-rose-100 text-[11px] text-slate-600">
                      <span>Món hàng đã được mở lại trạng thái Đang bán theo giá niêm yết ban đầu. Hai bên có thể tiếp tục trao đổi hoặc thương lượng lại.</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          const isShippingConfirmedMsg = msg.text?.includes('[ORDER_SHIPPING_CONFIRMED]');
          if (isShippingConfirmedMsg) {
            const orderCodeMatch = msg.text.match(/#(ORD-[A-Za-z0-9_-]+)/i);
            const orderCode = orderCodeMatch ? orderCodeMatch[1] : '';
            const cleanText = msg.text.replace(/^\[ORDER_SHIPPING_CONFIRMED\]\s*/i, '');

            return (
              <div key={msg.id} className="flex justify-center my-3 w-full">
                <div className="rounded-2xl bg-white border border-blue-200/90 p-4 shadow-xs max-w-md w-full">
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-blue-100">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                      <Truck className="h-3.5 w-3.5 text-blue-600" />
                      <span>Giao Hàng Liên Campus</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatMessageTime(msg.time)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mt-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <PackageCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">
                        Người bán đã xác nhận đơn hàng
                      </h5>
                      {orderCode && (
                        <span className="text-[11px] font-mono font-semibold text-slate-500">
                          Mã đơn: #{orderCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-700 leading-relaxed">
                    <p className="font-medium text-slate-800">{cleanText}</p>
                    <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-sky-800">
                      <Lock className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span>
                        Kiện hàng đang được đóng gói gửi bưu tá GHN / CampusShip. Tiền cọc được Escrow bảo hộ an toàn tới khi nhận hàng.
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <Link
                      href={orderCode ? `/orders/${encodeURIComponent(orderCode)}` : '/orders'}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white text-xs font-bold px-3.5 py-2 transition shadow-xs cursor-pointer"
                    >
                      <ReceiptText className="h-3.5 w-3.5" />
                      <span>Theo dõi đơn hàng</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          }

          const isAppointmentConfirmedMsg = msg.text?.includes('[APPOINTMENT_CONFIRMED]');
          if (isAppointmentConfirmedMsg) {
            const orderCodeMatch = msg.text.match(/#(ORD-[A-Za-z0-9_-]+)/i);
            const orderCode = orderCodeMatch ? orderCodeMatch[1] : '';
            const cleanText = msg.text.replace(/^\[APPOINTMENT_CONFIRMED\]\s*/i, '');

            return (
              <div key={msg.id} className="flex justify-center my-3 w-full">
                <div className="rounded-2xl bg-white border border-emerald-200/90 p-4 shadow-xs max-w-md w-full">
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-100">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Đã Chốt Hẹn Safe-Point</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatMessageTime(msg.time)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 mt-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-sm">
                        Đã xác nhận &amp; Chốt hẹn nhận hàng
                      </h5>
                      {orderCode && (
                        <span className="text-[11px] font-mono font-semibold text-slate-500">
                          Mã đơn: #{orderCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-700 leading-relaxed">
                    <p className="font-medium text-slate-800">{cleanText}</p>
                    <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-emerald-800">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Hãy gặp nhau tại điểm Safe-Point đã hẹn để kiểm tra đồ và quét mã QR Handshake để hoàn tất giao dịch.
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <Link
                      href={orderCode ? `/orders/${encodeURIComponent(orderCode)}` : '/orders'}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 transition shadow-xs cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Mở mã QR bàn giao</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          }

          const isMeetupMsg =
            msg.text?.includes('hẹn điểm') ||
            msg.text?.includes('Hẹn điểm') ||
            msg.text?.includes('bàn giao đồ tại Sảnh');
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
          const isEditing = editingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`group flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
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

              {/* Nút Chỉnh sửa & Xóa cho tin nhắn thường của chính mình */}
              {isMe && !isEditing && (onEditMessage || onDeleteMessage) && (
                <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-1 mb-5 shrink-0">
                  {onEditMessage && msg.text && !msg.image && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(msg)}
                      title="Chỉnh sửa tin nhắn"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-fpt-orange hover:border-orange-200 shadow-2xs transition cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onDeleteMessage && (
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(msg.id)}
                      title="Xóa tin nhắn"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 shadow-2xs transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
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
                  {isEditing ? (
                    <div className="space-y-2 min-w-[220px] sm:min-w-[280px]">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit(msg.id);
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        autoFocus
                        className="w-full rounded-xl bg-white text-slate-900 px-3 py-1.5 text-xs sm:text-sm font-medium outline-none ring-2 ring-orange-300"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                          <span>Hủy</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(msg.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-white text-fpt-orange hover:bg-orange-50 px-2.5 py-1 text-[11px] font-bold shadow-2xs transition cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          <span>Lưu</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                <div
                  className={`flex items-center gap-1 text-[10px] text-slate-400 px-1 ${
                    isMe ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{formatMessageTime(msg.time)}</span>
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
