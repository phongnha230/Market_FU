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
  ShieldAlert,
  Compass,
  QrCode,
  XCircle,
  ShieldCheck,
  ExternalLink,
  FileText,
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
  onOpenReviewDetail?: (order: OrderItem) => void;
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
  onOpenReviewDetail,
}: OrderCardProps) {
  const isSellerViewer =
    viewerRole === 'seller' ||
    (Boolean(currentUserId) && Boolean(order.sellerId) && order.sellerId === currentUserId);
  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  const isCodOrder =
    order.payment?.paymentMethod === 'CASH' ||
    Boolean(order.payment?.paymentMethod?.toLowerCase().includes('cod')) ||
    (!order.payment?.isPaid &&
      order.type === 'inter-campus' &&
      !order.payment?.paymentMethod?.toLowerCase().includes('vietqr') &&
      !order.payment?.paymentMethod?.toLowerCase().includes('payos'));

  const getEscrowBadgeMeta = () => {
    if (order.status === 'cancelled') {
      return {
        text: 'Đã hoàn tiền Escrow',
        className: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (order.type === 'safe-handoff') {
      return {
        text: 'Xác thực QR Handshake',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    }
    if (order.payment?.isPaid) {
      return {
        text: 'Đã cọc Escrow bảo hộ 48h',
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }
    if (isCodOrder) {
      return {
        text: 'Thanh toán khi nhận hàng (COD)',
        className: 'bg-sky-50 text-sky-800 border-sky-200',
      };
    }
    return {
      text: order.product.escrowBadge || 'Bảo chứng KTX 48h',
      className: 'bg-amber-50 text-amber-800 border-amber-200',
    };
  };

  const badgeMeta = getEscrowBadgeMeta();

  const canShowImmediatePayment =
    !isSellerViewer &&
    onOpenPaymentModal &&
    order.payment &&
    !order.payment.isPaid &&
    !isCodOrder &&
    ((order.status as string) === 'pending' || order.status === 'processing');

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden py-0 gap-0">
      {/* Order Header */}
      <div className="p-4 sm:px-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-50/50">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-extrabold text-slate-900">{order.code}</span>
          {isSellerViewer && (
            <Badge className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-none hover:bg-purple-100">
              🏷️ ĐƠN BÁN HÀNG
            </Badge>
          )}
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
          ) : order.status === 'disputed' ? (
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          ) : order.status === 'cancelled' ? (
            <XCircle className="h-4 w-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
          <span>{order.statusText}</span>
        </div>
      </div>

      {/* Product Body */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
        <Link
          href={`/orders/${encodeURIComponent(order.code.replace('#', ''))}`}
          className="relative h-24 w-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group block"
        >
          <Image
            src={typeof order.product.imageUrl === 'string' && order.product.imageUrl ? order.product.imageUrl : ((order.product.imageUrl as any)?.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80')}
            alt={order.product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <Badge className="absolute top-1 left-1 rounded bg-slate-900/85 px-1 py-0.2 text-[9px] font-bold text-white border-none hover:bg-slate-900/85">
            {order.product.conditionBadge}
          </Badge>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <Link
              href={`/orders/${encodeURIComponent(order.code.replace('#', ''))}`}
              className="font-bold text-sm sm:text-base text-slate-900 leading-snug hover:text-fpt-orange transition-colors"
            >
              {order.product.title}
            </Link>
            {isSellerViewer ? (
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-500 block leading-none mb-0.5">
                  Doanh thu thực nhận
                </span>
                <div className={`text-base sm:text-lg font-black ${order.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>
                  {order.status === 'cancelled' ? '0 đ' : `+${formatVND(order.product.price)}`}
                </div>
                <Badge
                  variant="outline"
                  className={`rounded text-[10px] font-bold px-1.5 py-0.5 border ${
                    order.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : order.status === 'cancelled'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : isCodOrder
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {order.status === 'completed'
                    ? 'Đã quyết toán ví'
                    : order.status === 'cancelled'
                    ? 'Đơn đã hủy / Hoàn tiền'
                    : isCodOrder
                    ? 'Chờ bưu tá thu COD'
                    : 'Đang giữ trong Escrow'}
                </Badge>
              </div>
            ) : (
              <div className="text-right shrink-0">
                <div className="text-base sm:text-lg font-black text-slate-900">
                  {formatVND(order.product.price)}
                </div>
                <Badge variant="outline" className={`rounded text-[10px] font-bold px-1.5 py-0.5 border ${badgeMeta.className}`}>
                  {badgeMeta.text}
                </Badge>
              </div>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-500 line-clamp-1">
            {order.product.subtitle}
          </p>

          <div className="mt-2 text-xs text-slate-600 flex items-center gap-3 flex-wrap">
            {isSellerViewer ? (
              <span>
                👤 Khách mua: <strong>{(order as any).buyer?.fullName || (order as any).buyer?.profile?.fullName || (order as any).buyer?.email || 'Sinh viên FPT'}</strong>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 flex-wrap">
                <span>👤 Người bán:</span>
                <Link
                  href={`/sellers/${(order as any).sellerId || (order.product?.seller as any)?.id || ''}`}
                  className="font-bold text-slate-900 hover:text-fpt-orange hover:underline inline-flex items-center gap-0.5 transition"
                  title="Ghé thăm hồ sơ & đánh giá của Người bán"
                >
                  {(order as any).seller?.fullName || order.product.seller.name}
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </Link>
                <span className="text-slate-500">({order.product.seller.cohortCampus})</span>
              </span>
            )}
            <span className="text-emerald-600 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> {isSellerViewer ? 'Đã xác thực tài khoản FPT' : order.product.seller.verifiedText}
            </span>
          </div>
        </div>
      </div>

      {/* In-transit tracking timeline - ONLY shown when actively shipping */}
      {order.status === 'shipping' && order.tracking && (
        <div className="mx-4 sm:mx-5 mb-3 rounded-xl bg-orange-50/50 border border-orange-100 p-3 text-xs">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              {order.type === 'safe-handoff' ? (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Truck className="h-3.5 w-3.5 text-fpt-orange" />
              )}
              {order.type === 'safe-handoff'
                ? `Safe-Point: ${order.meetupLocation || order.product?.subtitle || 'Sảnh Tòa Alpha'}`
                : order.tracking.routeTitle}
            </span>
            <span className="font-bold text-fpt-orange text-[11px]">
              {order.type === 'safe-handoff'
                ? (order.appointmentTime ? new Date(order.appointmentTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Hẹn gặp trực tiếp')
                : order.tracking.estimatedArrival}
            </span>
          </div>

          {/* 4 Hub Steps */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] mb-2">
            {(order.type === 'safe-handoff'
              ? [
                  { title: 'Đặt cọc', status: 'completed' },
                  { title: 'Chốt hẹn', status: 'completed' },
                  { title: 'Bàn giao QR', status: 'current' },
                  { title: 'Giải ngân', status: 'pending' },
                ]
              : order.tracking.steps
            ).map((st, sIdx) => (
              <div key={sIdx} className="flex flex-col items-center">
                <div
                  className={`h-1.5 w-full rounded-full mb-1 ${
                    st.status === 'completed'
                      ? 'bg-emerald-500'
                      : st.status === 'current'
                      ? 'bg-fpt-orange animate-pulse'
                      : 'bg-slate-200'
                  }`}
                ></div>
                <span
                  className={`font-medium ${
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

          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-orange-200/50">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
              <span className="truncate">{order.tracking.currentLocation}</span>
            </div>
            <span className="text-slate-400 font-mono text-[10px] shrink-0 ml-2">
              {order.tracking.trackingCode}
            </span>
          </div>
        </div>
      )}

      {/* DISPUTE STATUS - Compact 1-line strip */}
      {order.status === 'disputed' && (
        <div className="mx-4 sm:mx-5 mb-3 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="truncate font-medium">
              {isSellerViewer
                ? 'Đơn đang có khiếu nại trả hàng • Tiền Escrow tạm khóa bảo hộ'
                : 'Đang thẩm định hồ sơ trả hàng • Tiền Escrow tạm khóa 100%'}
            </span>
          </div>
          <Link
            href={
              isSellerViewer
                ? `/orders/${encodeURIComponent(order.code.replace('#', ''))}`
                : `/orders/dispute?code=${encodeURIComponent(order.code.replace('#', ''))}`
            }
            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 underline shrink-0 ml-2"
          >
            Chi tiết ➔
          </Link>
        </div>
      )}

      {/* CANCELLED / REFUNDED STATUS STRIP */}
      {order.status === 'cancelled' && (
        <div className="mx-4 sm:mx-5 mb-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2 min-w-0">
            <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span className="truncate font-medium">
              {isSellerViewer
                ? 'Đơn hàng đã được duyệt hoàn tiền cho Người mua • Bài đăng chuyển sang Ẩn'
                : 'Yêu cầu trả hàng đã được BQT chấp thuận • Tiền Escrow & Xu đã được xử lý hoàn trả'}
            </span>
          </div>
          <Link
            href={`/orders/dispute?code=${encodeURIComponent(order.code.replace('#', ''))}`}
            className="text-[11px] font-bold text-fpt-orange hover:underline shrink-0 ml-2"
          >
            Xem hồ sơ ➔
          </Link>
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="p-3 sm:px-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/40">
        <div className="text-xs text-slate-500 font-medium truncate w-full sm:w-auto">
          {order.tracking?.currentLocation ? (
            <span className="flex items-center gap-1 text-slate-600">
              <Compass className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
              <span className="truncate">{order.tracking.currentLocation}</span>
            </span>
          ) : (
            <span>Mã: <strong className="font-mono text-slate-800">{order.code}</strong></span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
          {/* Seller Actions */}
          {isSellerViewer ? (
            <>
              {order.status === 'shipping' && order.type === 'safe-handoff' && (
                onOpenQrModal && (
                  <Button
                    type="button"
                    onClick={() => onOpenQrModal(order)}
                    className="h-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <QrCode className="h-3.5 w-3.5 text-white" />
                    <span>Xác thực Safe-Point</span>
                  </Button>
                )
              )}
              {order.status === 'disputed' && (
                <Button
                  asChild
                  variant="outline"
                  className="h-auto rounded-xl border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Link href={`/orders/${encodeURIComponent(order.code.replace('#', ''))}`}>
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                    <span>Xem khiếu nại</span>
                  </Link>
                </Button>
              )}
              {order.status === 'completed' && order.reviewed && (
                <Button
                  type="button"
                  onClick={() => onOpenReviewDetail?.(order)}
                  variant="outline"
                  className="h-auto rounded-xl border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  title="Xem đánh giá từ người mua"
                >
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span>Xem đánh giá</span>
                </Button>
              )}
              <Button
                asChild
                className="h-auto rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 flex-1 sm:flex-initial"
              >
                <Link href={`/orders/${encodeURIComponent(order.code.replace('#', ''))}`}>
                  <span>Chi tiết đơn bán</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              {/* Buyer Actions */}
              {!canShowImmediatePayment && order.type === 'safe-handoff' && (order.status === 'pending' || order.status === 'processing') && onOpenQrModal && (
                <Button
                  type="button"
                  onClick={() => onOpenQrModal(order)}
                  variant="outline"
                  className="h-auto rounded-xl border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Mã QR Handshake / OTP</span>
                </Button>
              )}
              {canShowImmediatePayment && (
                <>
                  <Button
                    type="button"
                    onClick={() => onOpenPaymentModal(order)}
                    className="h-auto rounded-xl bg-gradient-to-r from-orange-500 to-fpt-orange hover:from-orange-600 hover:to-orange-700 text-white px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
                  >
                    <QrCode className="h-3.5 w-3.5 text-white" />
                    <span>Thanh toán ngay</span>
                  </Button>

                  {onCancelOrder && (
                    <Button
                      type="button"
                      onClick={() => onCancelOrder(order.id || order.code, order.code)}
                      variant="outline"
                      className="h-auto rounded-xl border-slate-300 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                      title="Hủy đơn hàng và hoàn lại xu/sản phẩm"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Hủy đơn</span>
                    </Button>
                  )}
                </>
              )}

              {order.status === 'disputed' && (
                <Button
                  asChild
                  variant="outline"
                  className="h-auto rounded-xl border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Link href={`/orders/dispute?code=${encodeURIComponent(order.code.replace('#', ''))}`}>
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                    <span>Tiến độ khiếu nại</span>
                  </Link>
                </Button>
              )}

              {order.status === 'delivered' && (
                <>
                  <Button
                    type="button"
                    onClick={() => onConfirmReceived(order.code)}
                    className="h-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    <span>Đã nhận hàng</span>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-auto rounded-xl border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Link href={`/orders/dispute?code=${encodeURIComponent(order.code.replace('#', ''))}`}>
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                      <span>Yêu cầu trả hàng</span>
                    </Link>
                  </Button>
                </>
              )}

              {order.status === 'completed' && (() => {
                const dispute = (order as any).dispute;
                const disputeStatus = dispute?.status;
                const disputeBtn = disputeStatus === 'REJECTED' ? (
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto rounded-xl border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title="Xem kết quả khiếu nại"
                  >
                    <Link href={`/orders/dispute?code=${encodeURIComponent(order.code.replace('#', ''))}`}>
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      <span>Xem kết quả khiếu nại</span>
                    </Link>
                  </Button>
                ) : disputeStatus === 'REFUNDED' || disputeStatus === 'RESOLVED' ? (
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto rounded-xl border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title="Xem hồ sơ hoàn tiền"
                  >
                    <Link href={`/orders/dispute?code=${encodeURIComponent(order.code.replace('#', ''))}`}>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Hồ sơ hoàn tiền</span>
                    </Link>
                  </Button>
                ) : disputeStatus === 'PENDING' ? (
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto rounded-xl border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title="Xem tiến trình khiếu nại"
                  >
                    <Link href={`/orders/dispute?code=${encodeURIComponent(order.code.replace('#', ''))}`}>
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      <span>Đang khiếu nại</span>
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="outline"
                    className="h-auto rounded-xl border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    title="Yêu cầu trả hàng & hoàn tiền"
                  >
                    <Link href={`/orders/dispute?code=${encodeURIComponent(order.code.replace('#', ''))}`}>
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                      <span>Yêu cầu trả hàng & hoàn tiền</span>
                    </Link>
                  </Button>
                );

                return order.reviewed ? (
                  <>
                    <Button
                      type="button"
                      onClick={() => onOpenReviewDetail?.(order)}
                      variant="outline"
                      className="h-auto rounded-xl border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      title="Xem lại đánh giá của bạn"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Xem lại đánh giá</span>
                    </Button>
                    {disputeBtn}
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      className="h-auto rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Link href={`/orders/review?code=${encodeURIComponent(order.code.replace('#', ''))}`}>
                        <Star className="h-3.5 w-3.5 fill-white text-white" />
                        <span>Đánh giá (+100 xu)</span>
                      </Link>
                    </Button>
                    {disputeBtn}
                  </>
                );
              })()}

              <Button
                asChild
                className="h-auto rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white px-4 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95 flex-1 sm:flex-initial"
              >
                <Link href={`/orders/${encodeURIComponent(order.code.replace('#', ''))}`}>
                  <span>Chi tiết</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
