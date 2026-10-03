'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Coins,
  RefreshCw,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { OrderItem } from '@/stores/orderStore';
import { orderService } from '@/services/orderService';
import { cn } from '@/lib/utils';

interface OrderCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderItem | null;
  isSellerViewer?: boolean;
  onSuccess: (orderId: string, orderCode: string, reason: string) => void;
}

const BUYER_REASONS = [
  'Tôi muốn đổi địa chỉ nhận hàng hoặc phương thức thanh toán',
  'Tôi đổi ý, không có nhu cầu mua sản phẩm này nữa',
  'Người bán không phản hồi tin nhắn hoặc không hẹn được lịch gặp',
  'Tìm thấy sản phẩm khác có giá tốt hơn hoặc phù hợp hơn',
  'Thời gian chuẩn bị / vận chuyển hàng quá lâu',
  'Lý do khác (điền chi tiết bên dưới)',
];

const SELLER_REASONS = [
  'Sản phẩm bị hỏng hóc hoặc thất lạc trước khi bàn giao',
  'Không thể liên hệ được với người mua để hẹn nhận hàng',
  'Có việc bận đột xuất, không thể bàn giao/gửi hàng theo hẹn',
  'Sản phẩm đã bán qua kênh trực tiếp khác ngoài ứng dụng',
  'Phát hiện sai sót về giá niêm yết hoặc mô tả sản phẩm',
  'Lý do khác (điền chi tiết bên dưới)',
];

export default function OrderCancelModal({
  isOpen,
  onClose,
  order,
  isSellerViewer = false,
  onSuccess,
}: OrderCancelModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const reasonsList = isSellerViewer ? SELLER_REASONS : BUYER_REASONS;
  const isCustom = selectedReason.includes('Lý do khác');
  const coinsUsed = order.payment?.coinsUsed || 0;

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      setErrorMsg('Vui lòng chọn một lý do hủy đơn hàng.');
      return;
    }

    if (isCustom && customReason.trim().length < 6) {
      setErrorMsg('Vui lòng nhập lý do cụ thể (tối thiểu 6 ký tự).');
      return;
    }

    const finalReason = isCustom
      ? customReason.trim()
      : customReason.trim()
      ? `${selectedReason}: ${customReason.trim()}`
      : selectedReason;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      await orderService.cancelOrder(order.id, finalReason);
      onSuccess(order.id, order.code, finalReason);
      onClose();
    } catch (err: unknown) {
      const apiError = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setErrorMsg(apiError || 'Không thể hủy đơn hàng lúc này. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Xác nhận hủy đơn hàng
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-slate-700">{order.code}</span>
                <span className="text-[11px] text-slate-400">•</span>
                <span className="text-[11px] text-rose-600 font-medium">
                  {isSellerViewer ? 'Người bán yêu cầu hủy' : 'Người mua yêu cầu hủy'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Product Card Snippet */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-slate-200 shrink-0">
            {order.product?.imageUrl ? (
              <Image
                src={order.product.imageUrl}
                alt={order.product.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400">
                <Package className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {order.product?.title || 'Sản phẩm giao dịch'}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-extrabold text-fpt-orange">
                {formatVND(order.payment?.totalAmount || order.product?.price || 0)}
              </span>
              <span className="text-[10px] text-slate-400">
                {order.typeLabel || 'Safe Handoff'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCancelSubmit} className="space-y-4">
          {/* Reason Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Vui lòng chọn lý do hủy đơn <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {reasonsList.map((reason, index) => {
                const isSelected = selectedReason === reason;
                return (
                  <label
                    key={index}
                    onClick={() => {
                      setSelectedReason(reason);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition select-none',
                      isSelected
                        ? 'border-rose-300 bg-rose-50/60 font-semibold text-rose-900 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                    )}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-4 w-4 text-rose-600 border-slate-300 focus:ring-rose-500 cursor-pointer accent-rose-600"
                    />
                    <span className="leading-tight">{reason}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Custom Reason Textarea */}
          {isCustom && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-slate-700 block">
                Mô tả chi tiết lý do <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Nhập chi tiết lý do hủy đơn để đối tác nắm thông tin..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-hidden resize-none"
              />
              <p className="text-[11px] text-slate-400 text-right">
                {customReason.length}/200 ký tự
              </p>
            </div>
          )}

          {/* Refund & Policy Notice */}
          <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3 space-y-1.5 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Chính sách hoàn tiền & Khôi phục sản phẩm:</span>
            </div>
            <ul className="space-y-1 text-[11px] text-amber-800/90 pl-5 list-disc">
              {coinsUsed > 0 && (
                <li className="font-semibold text-amber-900">
                  <span className="inline-flex items-center gap-1">
                    <Coins className="h-3 w-3 text-amber-600 inline" />
                    Hoàn lại <strong>{coinsUsed} FPT Coin</strong> đã sử dụng vào ví Campus Coins của bạn.
                  </span>
                </li>
              )}
              <li>
                {!isSellerViewer
                  ? 'Khoản tiền đã thanh toán (nếu có) sẽ được hoàn trả tự động qua cổng Escrow.'
                  : 'Sản phẩm sẽ tự động mở bán lại (AVAILABLE) trên sàn FU Market.'}
              </li>
              <li>
                Hệ thống sẽ gửi thông báo đến đối tác giao dịch để xác nhận việc hủy đơn.
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Giữ lại đơn hàng
            </Button>
            <Button
              type="submit"
              disabled={submitting || !selectedReason}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang xử lý hủy...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Xác nhận hủy đơn</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
