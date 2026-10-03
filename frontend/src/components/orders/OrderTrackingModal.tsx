'use client';

import React, { useState, useEffect } from 'react';
import { OrderItem } from '@/stores/orderStore';
import { X, Truck, CheckCircle2, Clock, MapPin, Package, Phone } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

interface OrderTrackingModalProps {
  order: OrderItem | null;
  onClose: () => void;
}

export default function OrderTrackingModal({
  order,
  onClose,
}: OrderTrackingModalProps) {
  const [liveTracking, setLiveTracking] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  const trackingCode = liveTracking?.trackingCode || order.tracking?.trackingCode || (order as any).shipping?.trackingCode || 'FPT-SHIP-99410';
  const partner = liveTracking?.shippingPartner || order.tracking?.currentLocation || 'GHN Express';
  const routeTitle = liveTracking?.routeTitle || order.tracking?.routeTitle || 'Tuyến Chuyển phát liên Hub Campus FPT';
  const estimatedArrival = liveTracking?.estimatedArrival || order.tracking?.estimatedArrival || 'Dự kiến 1 - 2 ngày tới';
  const steps = liveTracking?.steps || order.tracking?.steps || [
    { title: 'Tiếp nhận đơn hàng', desc: 'Đã tạo trên hệ thống', status: 'completed' },
    { title: 'Đóng gói & Bưu tá nhận', desc: 'Đã bàn giao bưu cục', status: order.status !== 'processing' ? 'completed' : 'current' },
    { title: 'Vận chuyển liên Hub', desc: partner, status: order.status === 'shipping' ? 'current' : order.status === 'delivered' || order.status === 'completed' ? 'completed' : 'pending' },
    { title: 'Giao hàng tới KTX', desc: 'Sảnh KTX điểm đến', status: order.status === 'delivered' || order.status === 'completed' ? 'completed' : 'pending' },
  ];

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
                    className={cn(
                      'absolute left-[7px] top-[18px] w-0.5 h-[calc(100%+6px)]',
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                    )}
                  />
                )}
                <div
                  className={cn(
                    'h-4 w-4 rounded-full mt-0.5 shrink-0 z-10 flex items-center justify-center',
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-fpt-orange text-white ring-4 ring-orange-100 animate-pulse'
                      : 'bg-slate-200'
                  )}
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
                      className={cn(
                        'font-bold text-xs',
                        isCurrent
                          ? 'text-fpt-orange'
                          : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      )}
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
