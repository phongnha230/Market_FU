'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  QrCode,
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { OrderItem, useOrderStore } from '@/stores/orderStore';
import { orderService } from '@/services/orderService';
import { socketClient } from '@/services/socketClient';
import { cn } from '@/lib/utils';

interface OrderPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderItem | null;
  onPaymentSuccess?: (orderId: string) => void;
}

export default function OrderPaymentModal({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}: OrderPaymentModalProps) {
  const [activeTab, setActiveTab] = useState<'vietqr' | 'payos'>('vietqr');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const cleanOrderCode = order?.code?.replace(/^#/, '') || '';
  const totalAmount = order?.payment?.totalAmount || order?.product?.price || 0;

  // Sync initial isPaid status from order
  useEffect(() => {
    if (order?.payment?.isPaid || order?.status === 'delivered' || order?.status === 'completed') {
      setIsPaid(true);
    } else {
      setIsPaid(false);
    }

    if (order?.payment?.paymentMethod === 'PAYOS_WEB' || order?.payment?.payosCheckoutUrl) {
      setActiveTab('payos');
    } else {
      setActiveTab('vietqr');
    }
  }, [order]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Đã sao chép ${fieldName}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 1. Polling payment status every 3s while modal is open and unpaid
  useEffect(() => {
    if (!isOpen || !cleanOrderCode || isPaid) return;

    const interval = setInterval(async () => {
      try {
        const res = await orderService.checkPaymentStatus(cleanOrderCode);
        if (res?.isPaid || res?.status === 'PAID' || res?.status === 'COMPLETED') {
          setIsPaid(true);
          useOrderStore.getState().updateOrderStatus(cleanOrderCode, 'processing', 'Đã nạp Escrow bảo hộ');
          if (onPaymentSuccess && order?.id) {
            onPaymentSuccess(order.id);
          }
          clearInterval(interval);
        }
      } catch {
        // ignore polling network errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, cleanOrderCode, isPaid, order?.id, onPaymentSuccess]);

  // 2. Real-time Socket.IO listener for instant update
  useEffect(() => {
    if (!isOpen || !cleanOrderCode || isPaid) return;

    const socket = socketClient.getSocket();
    if (!socket) return;

    const handleOrderPaid = (data: any) => {
      if (data?.orderCode === cleanOrderCode || data?.orderId === order?.id) {
        setIsPaid(true);
        useOrderStore.getState().updateOrderStatus(cleanOrderCode, 'processing', 'Đã nạp Escrow bảo hộ');
        if (onPaymentSuccess && order?.id) {
          onPaymentSuccess(order.id);
        }
      }
    };

    socket.on('order_paid', handleOrderPaid);
    return () => {
      socket.off('order_paid', handleOrderPaid);
    };
  }, [isOpen, cleanOrderCode, order?.id, isPaid, onPaymentSuccess]);

  if (!isOpen || !order) return null;

  const vietqrUrl =
    order.payment?.vietqrUrl ||
    `https://img.vietqr.io/image/MB-0348888999-compact2.png?amount=${totalAmount}&addInfo=${cleanOrderCode}&accountName=SAN%20FPT%205CAMPUS`;

  const payosUrl = order.payment?.payosCheckoutUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-60 rounded-full bg-slate-900 text-white px-4 py-1.5 text-xs font-semibold shadow-lg animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Thanh toán Đơn #{cleanOrderCode}
                </h3>
                <span className="rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                  Escrow Bảo Hộ
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Chuyển khoản an toàn • Tự động xác nhận sau 3-5 giây
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SUCCESS STATE */}
        {isPaid ? (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm animate-in zoom-in-75">
              <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-slate-900">
                Thanh toán Escrow thành công!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Hệ thống đã nhận đủ <strong className="text-slate-900">{totalAmount.toLocaleString('vi-VN')} đ</strong> cho đơn hàng #{cleanOrderCode}. Tiền được sàn bảo lãnh 100% trong ví Escrow.
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-center justify-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Bảo vệ hoàn tiền 48h sau khi nhận hàng</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 text-xs transition cursor-pointer"
            >
              Đóng cửa sổ
            </button>
          </div>
        ) : (
          /* UNPAID PAYMENT OPTIONS */
          <div className="p-5 sm:p-6 space-y-4">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('vietqr')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer',
                  activeTab === 'vietqr'
                    ? 'bg-white text-fpt-orange shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <QrCode className="h-4 w-4" />
                <span>VietQR Napas247</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('payos')}
                className={cn(
                  'flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer',
                  activeTab === 'payos'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <CreditCard className="h-4 w-4" />
                <span>PayOS Gateway</span>
              </button>
            </div>

            {/* TAB 1: VIETQR DIRECT */}
            {activeTab === 'vietqr' && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* QR Canvas */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-50/60 border border-orange-200 text-center">
                  <div className="text-[10px] font-black text-slate-700 mb-1 tracking-wider uppercase">
                    VIETQR • NAPAS 24/7
                  </div>
                  <div className="relative h-44 w-44 bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden">
                    <Image
                      src={vietqrUrl}
                      alt="VietQR Chuyển khoản Sàn FPT"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Tự động khớp lệnh sau 3s</span>
                  </div>
                </div>

                {/* Transfer Info */}
                <div className="sm:col-span-7 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Ngân hàng:</span>
                    <span className="font-extrabold text-slate-900">MB Bank (Quân Đội)</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        0348888999
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('0348888999', 'Số tài khoản')}
                        className="p-1 rounded text-slate-500 hover:bg-slate-100 cursor-pointer"
                        title="Sao chép"
                      >
                        {copiedField === 'Số tài khoản' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Chủ tài khoản:</span>
                    <span className="font-bold text-slate-900 text-[11px]">
                      SAN FPT 5CAMPUS MARKETPLACE
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Số tiền:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-fpt-orange text-sm">
                        {totalAmount.toLocaleString('vi-VN')} đ
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(totalAmount.toString(), 'Số tiền')}
                        className="p-1 rounded text-slate-500 hover:bg-slate-100 cursor-pointer"
                        title="Sao chép"
                      >
                        {copiedField === 'Số tiền' ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-orange-50/80 p-2.5 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-950 font-bold text-[11px]">
                        Nội dung chuyển khoản:
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(cleanOrderCode, 'Nội dung chuyển khoản')}
                        className="inline-flex items-center gap-1 rounded bg-fpt-orange text-white px-2 py-0.5 text-[10px] font-bold hover:bg-fpt-orange/90 transition cursor-pointer"
                      >
                        {copiedField === 'Nội dung chuyển khoản' ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>Sao chép</span>
                      </button>
                    </div>
                    <div className="mt-1 font-mono font-black text-fpt-orange text-xs bg-white px-2 py-1 rounded border border-orange-200">
                      {cleanOrderCode}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PAYOS GATEWAY */}
            {activeTab === 'payos' && (
              <div className="space-y-4 py-2">
                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-extrabold text-blue-950 text-sm">
                        Cổng thanh toán bảo mật PayOS
                      </span>
                    </div>
                    <span className="rounded bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5">
                      TIỆN LỢI & ĐA NĂNG
                    </span>
                  </div>

                  <p className="text-slate-600 leading-relaxed">
                    Cổng PayOS cung cấp giao diện thanh toán chính thức có sẵn mã VietQR động, hỗ trợ quét từ mọi ứng dụng ngân hàng hoặc thanh toán bằng thẻ ATM nội địa Napas / thẻ quốc tế Visa, Mastercard.
                  </p>

                  <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between">
                    <span className="text-slate-600">Số tiền cần thanh toán:</span>
                    <span className="font-black text-blue-700 text-base">
                      {totalAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {payosUrl ? (
                  <a
                    href={payosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-xs sm:text-sm transition shadow-sm cursor-pointer"
                  >
                    <span>Mở trang thanh toán PayOS ngay</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      Đơn hàng chưa có link PayOS trực tiếp. Bạn có thể quét mã VietQR ở tab bên cạnh để thanh toán tức thì!
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('vietqr')}
                      className="rounded-xl border border-orange-200 bg-orange-50 text-fpt-orange font-bold px-4 py-2 text-xs hover:bg-orange-100 transition cursor-pointer"
                    >
                      Chuyển sang Quét mã VietQR
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Escrow Footer Guarantee */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bảo hộ Escrow FPT:</strong> Tiền được giữ tạm thời tại tài khoản bảo chứng của sàn. Người bán chỉ được giải ngân sau khi bạn nhận hàng và kiểm tra hoạt động tốt trong 48h.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
