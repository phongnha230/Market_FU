'use client';

import React, { useState } from 'react';
import { OrderItem } from '@/stores/orderStore';
import { X, Truck, PackageCheck } from 'lucide-react';
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
  const [trackingCode, setTrackingCode] = useState('');
  const [partner, setPartner] = useState('GHTK');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) {
      setErrorMsg('Vui lòng nhập mã vận đơn thực tế.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await orderService.updateShippingStatus(order.id, {
        status: 'SHIPPING',
        trackingCode: trackingCode.trim().toUpperCase(),
      });
      onSuccess(order.id, trackingCode.trim().toUpperCase());
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Cập nhật mã vận đơn thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

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
                Xác nhận gửi hàng & Nhập mã vận đơn
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
            <div>Người giao: <span className="font-semibold text-slate-700">{order.product.seller.name}</span></div>
            <div>Cơ sở / Tuyến: <span className="text-slate-700">{order.product.seller.cohortCampus || 'Campus FPT'}</span></div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Đơn vị vận chuyển</label>
            <select
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-orange-500 focus:outline-hidden"
            >
              <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
              <option value="VIETTEL_POST">Viettel Post</option>
              <option value="SPX">Shopee Xpress (SPX)</option>
              <option value="CAMPUS_SHIP">CampusShip Xe Tuyến FPT</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">
              Mã vận đơn (Tracking Code) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: GHTK102938475"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono font-bold focus:border-orange-500 focus:outline-hidden uppercase"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Hệ thống sẽ cập nhật trạng thái đơn sang Đang vận chuyển và thông báo cho người mua.
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
              className="rounded-xl bg-orange-600 hover:bg-orange-700 px-5 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <PackageCheck className="h-3.5 w-3.5" />
              <span>{submitting ? 'Đang cập nhật...' : 'Xác nhận gửi hàng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
