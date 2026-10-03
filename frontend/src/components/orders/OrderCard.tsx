'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { OrderItem } from '@/stores/orderStore';
import {
  CheckCircle2,
  Truck,
  Star,
  ArrowRight,
  MessageSquare,
  AlertTriangle,
  Compass,
  QrCode,
  XCircle,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';

interface OrderCardProps {
  order: OrderItem;
  currentUserId?: string;
  viewerRole?: 'buyer' | 'seller';
  onConfirmReceived: (code: string) => void;
  onOpenTracking: (order: OrderItem) => void;
  onOpenAiBot: () => void;
  onOpenQrModal?: (order: OrderItem) => void;
  onOpenPaymentModal?: (order: OrderItem) => void;
  onCancelOrder?: (orderId: string, orderCode: string) => void;
  onShipOrder?: (order: OrderItem) => void;
}

export default function OrderCard({
  order,
  currentUserId,
  viewerRole,
  onConfirmReceived,
  onOpenTracking,
  onOpenAiBot,
  onOpenQrModal,
  onOpenPaymentModal,
  onCancelOrder,
  onShipOrder,
}: OrderCardProps) {
  const isSellerViewer =
    viewerRole === 'seller' ||
    (Boolean(currentUserId) && Boolean(order.sellerId) && order.sellerId === currentUserId);
  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden py-0 gap-0">
      {/* Order Header */}
      <div className="p-4 sm:px-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-extrabold text-slate-900">{order.code}</span>
          <Badge
            variant="outline"
            className={`rounded text-[10px] font-bold px-2 py-0.5 border ${
              order.type === 'inter-campus'
                ? 'bg-orange-100 text-fpt-orange border-orange-200'
                : 'bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {order.typeLabel}
          </Badge>
          <span className="text-slate-400">• {order.timeLabel}</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-bold ${order.statusColor}`}>
          {order.status === 'shipping' ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-fpt-orange"></span>
            </span>
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
          <span>{order.statusText}</span>
        </div>
      </div>

      {/* Product Body */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
        <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
          <Image
            src={typeof order.product.imageUrl === 'string' && order.product.imageUrl ? order.product.imageUrl : ((order.product.imageUrl as any)?.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80')}
            alt={order.product.title}
            fill
            className="object-cover"
          />
          <Badge className="absolute top-1 left-1 rounded bg-slate-900/85 px-1 py-0.2 text-[9px] font-bold text-white border-none hover:bg-slate-900/85">
            {order.product.conditionBadge}
          </Badge>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
              {order.product.title}
            </h3>
            <div className="text-right shrink-0">
              <div className="text-base sm:text-lg font-black text-slate-900">
                {formatVND(order.product.price)}
              </div>
              <Badge variant="outline" className="rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 border border-emerald-200 hover:bg-emerald-50">
                {order.product.escrowBadge}
              </Badge>
            </div>
          </div>

          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
            {order.product.subtitle}
          </p>

          <div className="mt-2 text-xs text-slate-600 flex items-center gap-3 flex-wrap">
            {isSellerViewer ? (
              <span>
                👤 Khách mua: <strong>{(order as any).buyer?.profile?.fullName || (order as any).buyer?.email || 'Sinh viên FPT'}</strong>
              </span>
            ) : (
              <span>
                👤 Người bán: <strong>{order.product.seller.name}</strong> ({order.product.seller.cohortCampus})
              </span>
            )}
            <span className="text-emerald-600 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> {isSellerViewer ? 'Đã xác thực tài khoản FPT' : order.product.seller.verifiedText}
            </span>
          </div>
        </div>
      </div>

      {/* TRACKING PROGRESS ROUTE DIAGRAM */}
      {order.tracking && (
        <Card className="mx-4 sm:mx-5 mb-4 rounded-xl bg-orange-50/40 border border-orange-100 p-4 text-xs shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-fpt-orange" />
              {order.tracking.routeTitle}
            </span>
            <span className="font-bold text-fpt-orange text-[11px]">
              {order.tracking.estimatedArrival}
            </span>
          </div>

          {/* 4 Hub Steps */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-[11px] mb-3">
            {order.tracking.steps.map((st, sIdx) => (
              <div key={sIdx} className="flex flex-col items-center">
                <div
                  className={`h-2 w-full rounded-full mb-1.5 ${
                    st.status === 'completed'
                      ? 'bg-emerald-500'
                      : st.status === 'current'
                      ? 'bg-fpt-orange animate-pulse'
                      : 'bg-slate-200'
                  }`}
                ></div>
                <span
                  className={`font-semibold ${
                    st.status === 'current'
                      ? 'text-fpt-orange font-bold'
                      : st.status === 'completed'
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {st.title}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-orange-200/60">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{order.tracking.currentLocation}</span>
            </div>
            <span className="text-slate-400 font-mono">
              Mã vận đơn: {order.tracking.trackingCode}
            </span>
          </div>
        </Card>
      )}

      {/* REWARD CALLOUT BOX WITH BUTTON */}
      {order.rewardPrompt && !order.reviewed && (
        <Card className="mx-4 sm:mx-5 mb-4 rounded-xl bg-orange-50/60 border border-orange-200/80 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-none">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-fpt-orange p-2 text-white shrink-0">
              <Star className="h-5 w-5 fill-white" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                {order.rewardPrompt.title}
              </h4>
              <p className="text-xs text-slate-600 leading-tight mt-0.5">
                {order.rewardPrompt.subtitle}
              </p>
            </div>
          </div>

          <Button
            asChild
            className="h-auto shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-700 px-4 py-2 text-xs font-bold text-white hover:bg-orange-800 shadow-sm transition cursor-pointer"
          >
            <Link href={`/orders/review?code=${encodeURIComponent(order.code)}`}>
              <span>Đánh giá ngay ({order.rewardPrompt.voucherAmount})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </Card>
      )}

      {order.reviewed && (
        <Card className="mx-4 sm:mx-5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex flex-row items-center justify-between text-xs text-emerald-800 font-semibold shadow-none">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Đã hoàn tất đánh giá 5 sao cho giao dịch này và nhận thưởng Coins!
          </span>
          <Badge variant="outline" className="text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold hover:bg-white">
            +50 Coins
          </Badge>
        </Card>
      )}

      {/* Action Buttons Row */}
      <div className="p-4 sm:px-5 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5 bg-slate-50/30">
        {/* 1. Chat button */}
        <Button
          asChild
          variant="outline"
          className="h-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
        >
          <Link href={`/chat?seller=${encodeURIComponent(isSellerViewer ? ((order as any).buyer?.profile?.fullName || (order as any).buyer?.email || 'Sinh viên FPT') : order.product.seller.name)}`}>
            <MessageSquare className="h-3.5 w-3.5 text-fpt-orange" />
            <span>{isSellerViewer ? 'Chat với người mua' : 'Chat với người bán'}</span>
          </Link>
        </Button>

        {/* 2. Dispute button (Buyer only) */}
        {!isSellerViewer && (
          <Button
            asChild
            variant="outline"
            className="h-auto rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-xs font-bold hover:bg-rose-100 transition flex items-center gap-1.5"
          >
            <Link href={`/orders/dispute?code=${encodeURIComponent(order.code.replace('#', ''))}`}>
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              <span>Khiếu nại / Trả hàng</span>
            </Link>
          </Button>
        )}

        {/* 3. Cancel order button (Buyer only when processing) */}
        {!isSellerViewer && order.status === 'processing' && onCancelOrder && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancelOrder(order.id, order.code)}
            className="h-auto rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <XCircle className="h-3.5 w-3.5 text-slate-400" />
            <span>Hủy đơn</span>
          </Button>
        )}

        {/* 3.1. Payment button for unpaid orders (Buyer) */}
        {!isSellerViewer && onOpenPaymentModal && order.payment && !order.payment.isPaid && order.status !== 'completed' && (
          <Button
            type="button"
            onClick={() => onOpenPaymentModal(order)}
            className="h-auto rounded-xl bg-gradient-to-r from-orange-500 to-fpt-orange hover:from-orange-600 hover:to-orange-700 text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
          >
            <QrCode className="h-3.5 w-3.5 text-white" />
            <span>Thanh toán ngay (QR / PayOS)</span>
          </Button>
        )}

        {/* 4. Ship order button (Seller only when processing/shipping) */}
        {isSellerViewer && onShipOrder && (order.status === 'processing' || order.status === 'shipping') && (
          <Button
            type="button"
            onClick={() => onShipOrder(order)}
            className="h-auto rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Truck className="h-3.5 w-3.5 text-white" />
            <span>{order.status === 'shipping' ? 'Cập nhật vận đơn GHN' : 'Gửi hàng / Nhập mã GHN'}</span>
          </Button>
        )}

        {/* 5. Support AI bot */}
        <Button
          type="button"
          variant="outline"
          onClick={onOpenAiBot}
          className="h-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          Hỗ trợ đơn
        </Button>

        {/* 6. Tracking detail button */}
        {(order.tracking || order.type === 'inter-campus') && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenTracking(order)}
            className="h-auto rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1 cursor-pointer"
          >
            <Compass className="h-3.5 w-3.5 text-slate-500" />
            <span>Theo dõi hành trình chi tiết (Tracking)</span>
          </Button>
        )}

        {/* 7. QR Handshake button */}
        {order.type === 'safe-handoff' && order.status !== 'completed' && onOpenQrModal && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenQrModal(order)}
            className="h-auto rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 px-3.5 py-2 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <QrCode className="h-3.5 w-3.5 text-emerald-600" />
            <span>{isSellerViewer ? 'Xác nhận Bàn giao (QR/OTP)' : 'Mã QR Bàn giao'}</span>
          </Button>
        )}

        {/* 8. Confirm received button (Buyer only when shipping or delivered) */}
        {!isSellerViewer && (order.status === 'shipping' || order.status === 'delivered') && (
          <Button
            type="button"
            onClick={() => onConfirmReceived(order.code)}
            className="h-auto rounded-xl bg-orange-700 px-4 py-2 text-xs font-bold text-white hover:bg-orange-800 transition active:scale-95 shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Đã nhận hàng an toàn</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
