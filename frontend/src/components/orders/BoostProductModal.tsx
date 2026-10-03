'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Zap,
  Pin,
  RefreshCw,
  Coins,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Package,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { ProductItem } from '@/types/product';
import { ProductService } from '@/services/productService';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';

interface BoostProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  onSuccess: (message: string) => void;
}

export default function BoostProductModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: BoostProductModalProps) {
  const user = useUserStore((s) => s.user);
  const deductCoins = useUserStore((s) => s.deductCoins);

  const [selectedPlan, setSelectedPlan] = useState<'BUMP' | 'PIN_24H' | 'RENEW'>('BUMP');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const currentCoins = user.coins || 0;

  const PLANS = [
    {
      id: 'BUMP' as const,
      title: 'Đẩy tin tức thì (BUMP)',
      badge: 'Phổ biến',
      cost: 100,
      description: 'Đưa sản phẩm lên top 1 trang chủ & danh mục ngay lập tức. Tiếp cận sinh viên đang online.',
      icon: <Zap className="h-5 w-5 text-fpt-orange" />,
    },
    {
      id: 'PIN_24H' as const,
      title: 'Ghim tin VIP 24H (PIN)',
      badge: 'Hiệu quả cao',
      cost: 300,
      description: 'Ghim cố định ở dải banner ưu tiên trong 24 giờ kèm huy hiệu "HOT". Tăng 300% lượt xem.',
      icon: <Pin className="h-5 w-5 text-purple-600" />,
    },
    {
      id: 'RENEW' as const,
      title: 'Gia hạn thêm 30 ngày',
      badge: 'Miễn phí',
      cost: 0,
      description: 'Gia hạn thời gian mở bán thêm 30 ngày kể từ hôm nay, tránh tin bị đóng do quá hạn.',
      icon: <RefreshCw className="h-5 w-5 text-emerald-600" />,
    },
  ];

  const currentPlanObj = PLANS.find((p) => p.id === selectedPlan)!;
  const isAffordable = currentCoins >= currentPlanObj.cost;

  const handleConfirm = async () => {
    if (!isAffordable && currentPlanObj.cost > 0) {
      setErrorMsg(`Bạn không đủ FPT Coin (cần ${currentPlanObj.cost} Xu, hiện có ${currentCoins} Xu).`);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      if (selectedPlan === 'RENEW') {
        await ProductService.renewProduct(product.id);
        onSuccess(`Đã gia hạn tin đăng "${product.title}" thêm 30 ngày thành công!`);
      } else {
        await ProductService.boostProduct(product.id, selectedPlan);
        if (currentPlanObj.cost > 0) {
          deductCoins(currentPlanObj.cost);
        }
        onSuccess(
          selectedPlan === 'BUMP'
            ? `⚡ Đã đẩy tin "${product.title}" lên đầu trang thành công! (-100 Xu)`
            : `📌 Đã ghim tin VIP "${product.title}" 24H thành công! (-300 Xu)`
        );
      }
      onClose();
    } catch (err: unknown) {
      const apiErr = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setErrorMsg(apiErr || 'Không thể thực hiện yêu cầu lúc này. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatVND = (num: number) => num.toLocaleString('vi-VN') + ' đ';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Công cụ tăng tốc bán hàng (Seller Boost)
              </h3>
              <p className="text-xs text-slate-500">
                Đẩy tin ưu tiên và gia hạn bài đăng bằng FPT Coin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Product Snippet */}
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-200 shrink-0">
            {typeof product.imageUrl === 'string' && product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400">
                <Package className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{product.title}</h4>
            <div className="text-xs font-extrabold text-fpt-orange mt-0.5">
              {formatVND(product.price)}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-400">Ví hiện có</div>
            <div className="text-xs font-bold text-amber-600 flex items-center gap-1 justify-end">
              <Coins className="h-3 w-3" />
              <span>{currentCoins.toLocaleString('vi-VN')} Xu</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Plan Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 block">
            Chọn gói hỗ trợ bán nhanh
          </label>
          <div className="space-y-2">
            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className={cn(
                    'p-3.5 rounded-xl border cursor-pointer transition select-none flex items-start gap-3',
                    isSelected
                      ? 'border-orange-400 bg-orange-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <div className="pt-0.5 shrink-0">{plan.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900">{plan.title}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-bold border-orange-200 text-fpt-orange bg-orange-50">
                          {plan.badge}
                        </Badge>
                      </div>
                      <div className="text-xs font-extrabold text-amber-600 shrink-0">
                        {plan.cost === 0 ? '0 Xu' : `${plan.cost} Xu`}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {currentPlanObj.cost > 0 ? (
              <span>
                Thanh toán: <strong className="text-amber-600">{currentPlanObj.cost} FPT Coin</strong>
              </span>
            ) : (
              <span className="text-emerald-600 font-bold">Hoàn toàn miễn phí</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || (!isAffordable && currentPlanObj.cost > 0)}
              className="rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white px-5 py-2 text-xs font-bold transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang kích hoạt...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Kích hoạt ngay</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
