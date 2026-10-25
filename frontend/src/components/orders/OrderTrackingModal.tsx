'use client';

import React, { useState, useEffect } from 'react';
import { OrderItem } from '@/stores/orderStore';
import { X, Truck, CheckCircle2, Clock, MapPin, Package, Phone, RefreshCw, Sparkles, ShieldCheck } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Badge } from '@/components/ui';

interface OrderTrackingModalProps {
  order: OrderItem | null;
  onClose: () => void;
  onStatusUpdated?: (status: string) => void;
  viewerRole?: 'buyer' | 'seller';
}

export default function OrderTrackingModal({
  order,
  onClose,
  onStatusUpdated,
  viewerRole = 'buyer',
}: OrderTrackingModalProps) {
  const [liveTracking, setLiveTracking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!order) return;
    let isMounted = true;
    setLoading(true);

    const targetCode = order.id || order.code.replace('#', '');
    orderService
      .getOrderTracking(targetCode)
      .then((data) => {
        if (isMounted && data) {
          setLiveTracking(data);
        }
      })
      .catch(() => {
        // Fallback to order.tracking in store
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [order]);

  if (!order) return null;

  const isSafeHandoff = order.type === 'safe-handoff' || (order as any).orderType === 'MEETUP';

  const trackingCode = isSafeHandoff
    ? (order.handshake?.handshakeOtp ? `OTP-${order.handshake.handshakeOtp}` : order.code)
    : liveTracking?.trackingCode || order.tracking?.trackingCode || (order as any).shipping?.trackingCode || 'FPT-SHIP-99410';

  const partner = isSafeHandoff
    ? 'Safe-Point FPT (Giao dịch trực tiếp)'
    : liveTracking?.shippingPartner || order.tracking?.currentLocation || 'GHN Express';

  const routeTitle = isSafeHandoff
    ? (order.product?.subtitle ? `Điểm hẹn: ${order.product.subtitle}` : 'Điểm hẹn Safe-Point • Hola Campus')
    : liveTracking?.routeTitle || order.tracking?.routeTitle || 'Tuyến Chuyển phát liên Hub Campus FPT';

  const estimatedArrival = isSafeHandoff
    ? (order.appointmentTime ? new Date(order.appointmentTime).toLocaleString('vi-VN') : 'Hẹn gặp trực tiếp tại sảnh Safe-Point')
    : liveTracking?.estimatedArrival || order.tracking?.estimatedArrival || 'Dự kiến 1 - 2 ngày tới';

  const isPaid = Boolean(order.payment?.isPaid);
  const isCompleted = order.status === 'completed';
  const isDelivered = order.status === 'delivered' || isCompleted;
  const isHandoffReady = order.status === 'processing' || order.status === 'shipping' || isDelivered;

  const safeHandoffSteps = [
    {
      title: 'Đặt cọc Escrow bảo hộ',
      desc: isPaid
        ? 'Đã đặt cọc 100% vào Quỹ Campus Escrow bảo vệ an toàn'
        : 'Chờ người mua thanh toán tiền cọc Escrow (PayOS / VietQR)',
      status: isPaid ? 'completed' : 'current',
      time: order.timeLabel,
    },
    {
      title: 'Chốt hẹn Safe-Point',
      desc: order.appointmentTime
        ? `Lịch hẹn: ${new Date(order.appointmentTime).toLocaleString('vi-VN')} tại ${order.product?.subtitle || 'Sảnh Tòa Alpha'}`
        : `Điểm hẹn: ${order.product?.subtitle || 'Sảnh chính Tòa Alpha (Tầng 1)'} • Camera AI 24/7`,
      status: isPaid ? 'completed' : 'pending',
    },
    {
      title: 'Bàn giao & Test máy tại trạm',
      desc: isDelivered
        ? 'Đã đối soát sản phẩm & quét mã QR / OTP thành công'
        : 'Gặp mặt đối soát, test máy và xuất trình mã QR / OTP',
      status: isDelivered ? 'completed' : isHandoffReady ? 'current' : 'pending',
    },
    {
      title: 'Giải ngân Escrow & Hoàn tất',
      desc: isCompleted
        ? 'Đã giải ngân tiền về ví Người bán • Kích hoạt 48 giờ bao test'
        : 'Tiền cọc Escrow tự động giải ngân về ví Người bán khi bàn giao xong',
      status: isCompleted ? 'completed' : 'pending',
    },
  ];

  const steps = isSafeHandoff
    ? (liveTracking?.steps && liveTracking.steps.some((s: any) => s.title.includes('Escrow') || s.title.includes('Safe-Point')) ? liveTracking.steps : safeHandoffSteps)
    : (liveTracking?.steps || order.tracking?.steps || [
        { title: 'Tiếp nhận đơn hàng', desc: 'Đã tạo trên hệ thống', status: 'completed' },
        { title: 'Đóng gói & Bưu tá nhận', desc: 'Đã bàn giao bưu cục', status: order.status !== 'processing' ? 'completed' : 'current' },
        { title: 'Vận chuyển liên Hub', desc: partner, status: order.status === 'shipping' ? 'current' : order.status === 'delivered' || order.status === 'completed' ? 'completed' : 'pending' },
        { title: 'Giao hàng tới KTX', desc: 'Sảnh KTX điểm đến', status: order.status === 'delivered' || order.status === 'completed' ? 'completed' : 'pending' },
      ]);
const handleSyncTracking = async () => {
    try {
      setSyncing(true);
      const updated = await orderService.getOrderTracking(order.id || order.code.replace('#', ''));
      if (updated) setLiveTracking(updated);
      if (updated?.status) onStatusUpdated?.(updated.status);
    } catch (err: any) {
      console.error('Lỗi đồng bộ:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-orange-100 text-fpt-orange flex items-center justify-center shrink-0">
              <Truck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Chi tiết hành trình vận chuyển
              </h3>
              <p className="text-xs text-slate-500 font-mono">Mã đơn: {order.code}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Carrier Info Card */}
        <div className="my-3.5 rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Package className="h-4 w-4 text-fpt-orange" />
              <span>Đối tác: <strong>{partner}</strong></span>
            </span>
            <Badge variant="outline" className="rounded bg-white text-fpt-orange border-orange-200 text-[10px] font-bold">
              {order.status === 'completed' ? 'Giao hoàn tất' : order.status === 'delivered' ? 'Đã phát tới nơi' : 'Đang luân chuyển'}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Mã vận đơn (Tracking Code):</span>
            <span className="font-mono font-bold text-slate-900">{trackingCode}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Tuyến hành trình:</span>
            <span className="font-medium text-slate-700">{routeTitle}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Dự kiến đến:</span>
            <span className="font-bold text-emerald-700">{estimatedArrival}</span>
          </div>

          {liveTracking?.shipper && (
            <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-700">
              <span>Bưu tá phụ trách: <strong>{liveTracking.shipper.name}</strong></span>
              {liveTracking.shipper.phone && (
                <a
                  href={`tel:${liveTracking.shipper.phone}`}
                  className="inline-flex items-center gap-1 text-fpt-orange font-bold hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  <span>{liveTracking.shipper.phone}</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Tracking Steps Timeline */}
        <div className="my-4 space-y-4 text-xs pl-2">
          {steps.map((st: any, idx: number) => {
            const isCompleted = st.status === 'completed';
            const isCurrent = st.status === 'current';
            return (
              <div key={idx} className="flex items-start gap-3 relative">
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-[7px] top-[18px] w-0.5 h-[calc(100%+6px)] ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
                <div
                  className={`h-4 w-4 rounded-full mt-0.5 shrink-0 z-10 flex items-center justify-center ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-fpt-orange text-white ring-4 ring-orange-100 animate-pulse'
                      : 'bg-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : isCurrent ? (
                    <div className="h-1.5 w-1.5 bg-white rounded-full" />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div
                      className={`font-bold text-xs ${
                        isCurrent
                          ? 'text-fpt-orange'
                          : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {st.title}
                    </div>
                    {st.time && (
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {st.time}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {st.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* GHN Realtime Audit Logs if any */}
        {liveTracking?.ghnLogs && liveTracking.ghnLogs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            <h4 className="font-bold text-[11px] text-slate-700 uppercase tracking-wider">
              Nhật ký quét kiện hàng từ GHN:
            </h4>
            <div className="max-h-28 overflow-y-auto space-y-1 font-mono text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
              {liveTracking.ghnLogs.map((log: any, lIdx: number) => (
                <div key={lIdx} className="flex items-start justify-between gap-1">
                  <span>• {log.statusText || log.status}</span>
                  <span className="text-slate-400 shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Khối Trạm điều phối GHN & Mô phỏng Bưu tá phát hàng */}
        {(order.status === 'shipping' || liveTracking?.status === 'SHIPPING') && (
          <div className="mt-4 rounded-xl bg-orange-50/80 border border-orange-200/90 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Truck className="h-4 w-4 text-fpt-orange" />
                <span>Tiến trình giao vận: {partner}</span>
              </div>
              <button
                type="button"
                onClick={handleSyncTracking}
                disabled={syncing}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-fpt-orange hover:underline cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ GHN'}</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              📦 <strong>Đơn hàng liên Campus:</strong> Kiện hàng đang được luân chuyển bởi {partner}. Khi bưu tá phát hàng tới KTX, hệ thống GHN (hoặc Webhook) sẽ tự động cập nhật đơn sang <strong>Đã giao tới sảnh KTX</strong> để kích hoạt 48 giờ bao test cho người mua.
            </p>

            {viewerRole === 'seller' && (
              <p className="pt-2 border-t border-orange-200/60 text-[10px] text-slate-500 italic">
                Trạng thái đã giao được xác nhận trực tiếp với hãng vận chuyển.
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer shadow-xs transition"
        >
          Đóng cửa sổ
        </button>
      </div>
    </div>
  );
}
