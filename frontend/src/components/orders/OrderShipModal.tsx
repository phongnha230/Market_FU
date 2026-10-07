'use client';

import React, { useState, useEffect } from 'react';
import { OrderItem } from '@/stores/orderStore';
import { X, Truck, PackageCheck, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { orderService } from '@/services/orderService';

interface OrderShipModalProps {
  order: OrderItem | null;
  onClose: () => void;
  onSuccess: (orderId: string, trackingCode: string) => void;
}

export default function OrderShipModal({
  order,
  onClose,
  onSuccess,
}: OrderShipModalProps) {
  const [partner, setPartner] = useState('GHN');
  const [trackingCode, setTrackingCode] = useState('');
  const [targetStatus, setTargetStatus] = useState<'SHIPPING' | 'DELIVERED'>('SHIPPING');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateSampleCode = (selectedPartner: string) => {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    const prefix =
      selectedPartner === 'GHN'
        ? 'GHN'
        : selectedPartner === 'GHTK'
        ? 'GHTK'
        : selectedPartner === 'VIETTEL_POST'
        ? 'VTP'
        : selectedPartner === 'SPX'
        ? 'SPX'
        : 'CAMPUS';
    return `${prefix}${randomDigits}`;
  };

  const isInterCampus = order?.type === 'inter-campus';

  useEffect(() => {
    if (order) {
      if (order.status === 'shipping' && order.type !== 'inter-campus') {
        setTargetStatus('DELIVERED');
      } else {
        setTargetStatus('SHIPPING');
      }

      const existingCode = typeof order.tracking === 'string' ? order.tracking : order.tracking?.trackingCode;
      if (existingCode && typeof existingCode === 'string' && existingCode.trim()) {
        setTrackingCode(existingCode);
      } else {
        setTrackingCode(generateSampleCode(partner));
      }
    }
  }, [order]);

  if (!order) return null;

  const handlePartnerChange = (newPartner: string) => {
    setPartner(newPartner);
    setTrackingCode(generateSampleCode(newPartner));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) {
      setErrorMsg('Vui lòng nhập mã vận đơn thực tế hoặc bấm Tạo mã mẫu.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await orderService.updateShippingStatus(order.id, {
        status: targetStatus,
        trackingCode: trackingCode.trim().toUpperCase(),
        shippingPartner: partner,
      });
      onSuccess(order.id, trackingCode.trim().toUpperCase());
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Cập nhật vận đơn thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const isAlreadyShipping = order.status === 'shipping';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Truck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {isInterCampus
                  ? isAlreadyShipping
                    ? 'Cập nhật mã vận đơn liên Campus'
                    : 'Bàn giao bưu cục & Gửi hàng liên Campus'
                  : isAlreadyShipping
                  ? 'Cập nhật tiến trình & Giao hàng KTX'
                  : 'Xác nhận gửi hàng & Nhập mã vận đơn'}
              </h3>
              <p className="text-xs text-slate-500">Mã đơn: {order.code}</p>
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

        {errorMsg && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600 font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Sản phẩm: {order.product.title}</div>
            <div>
              Người giao: <span className="font-semibold text-slate-700">{order.product.seller.name}</span>
            </div>
            <div>
              Cơ sở / Tuyến: <span className="text-slate-700">{order.product.seller.cohortCampus || 'Campus FPT'}</span>
            </div>
            {isAlreadyShipping && (
              <div className="pt-1 text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Đơn hàng đã được bàn giao bưu cục (Đang vận chuyển)</span>
              </div>
            )}
          </div>

          {/* Nếu là đơn liên campus: Chỉ bàn giao đơn vị vận chuyển, không cho Seller chọn Đã giao tới KTX */}
          {isInterCampus ? (
            <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-3 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Truck className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Đơn hàng vận chuyển Liên Campus ({partner})</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Người bán bàn giao kiện hàng cho bưu cục GHN. Tiến trình giao tới <strong>sảnh KTX điểm đến</strong> sẽ do Bưu tá GHN hoặc Người mua xác nhận khi nhận hàng.
              </p>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-slate-700">Trạng thái vận chuyển cần cập nhật</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setTargetStatus('SHIPPING')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition cursor-pointer ${
                    targetStatus === 'SHIPPING'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🚚 Đang vận chuyển
                </button>
                <button
                  type="button"
                  onClick={() => setTargetStatus('DELIVERED')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition cursor-pointer ${
                    targetStatus === 'DELIVERED'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🏢 Đã giao tới sảnh KTX
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700">Đơn vị vận chuyển</label>
            <select
              value={partner}
              onChange={(e) => handlePartnerChange(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-orange-500 focus:outline-hidden"
            >
              <option value="GHN">Giao Hàng Nhanh (GHN Express)</option>
              <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
              <option value="VIETTEL_POST">Viettel Post</option>
              <option value="SPX">Shopee Xpress (SPX)</option>
              <option value="CAMPUS_SHIP">CampusShip Xe Tuyến FPT</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Mã vận đơn (Tracking Code) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setTrackingCode(generateSampleCode(partner))}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Sparkles className="h-3 w-3 text-orange-500" />
                <span>Tạo mã ngẫu nhiên</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="VD: GHN102938475"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-9 text-xs font-mono font-bold focus:border-orange-500 focus:outline-hidden uppercase"
              />
              <button
                type="button"
                onClick={() => setTrackingCode(generateSampleCode(partner))}
                title="Tạo mã mẫu mới"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 cursor-pointer p-0.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Mã vận đơn đã được tự động sinh sẵn cho bạn. Bạn có thể bấm &quot;Tạo mã ngẫu nhiên&quot; hoặc tự sửa lại.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95 ${
                targetStatus === 'DELIVERED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              <PackageCheck className="h-3.5 w-3.5" />
              <span>
                {submitting
                  ? 'Đang cập nhật...'
                  : targetStatus === 'DELIVERED'
                  ? 'Xác nhận: Đã giao tới KTX'
                  : isAlreadyShipping
                  ? 'Cập nhật mã vận đơn'
                  : 'Xác nhận gửi hàng'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
