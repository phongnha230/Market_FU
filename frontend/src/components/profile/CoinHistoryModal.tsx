'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Gift,
  Award,
  Zap,
  ShoppingBag,
  Landmark,
  Ticket,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { profileService, CoinTransactionItem } from '@/services/profileService';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';

interface CoinHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CoinHistoryModal({ isOpen, onClose }: CoinHistoryModalProps) {
  const user = useUserStore((s) => s.user);
  const [transactions, setTransactions] = useState<CoinTransactionItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'plus' | 'minus'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const res = await profileService.getCoinHistory(1, 50);
      setTransactions(res.transactions || []);
    } catch {
      // Handled in service fallback
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'plus') return t.amount > 0;
    if (filterType === 'minus') return t.amount < 0;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DAILY_CHECKIN':
        return <Calendar className="h-4 w-4 text-emerald-500" />;
      case 'KYC_BONUS':
        return <Award className="h-4 w-4 text-amber-500" />;
      case 'REVIEW_REWARD':
        return <Award className="h-4 w-4 text-purple-500" />;
      case 'BOOST_POST':
        return <Zap className="h-4 w-4 text-fpt-orange" />;
      case 'ORDER_DISCOUNT':
        return <ShoppingBag className="h-4 w-4 text-blue-500" />;
      case 'WITHDRAWAL':
        return <Landmark className="h-4 w-4 text-rose-500" />;
      case 'REDEEM_VOUCHER':
        return <Ticket className="h-4 w-4 text-indigo-500" />;
      default:
        return <Gift className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shrink-0">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Lịch sử biến động FPT Coin
              </h3>
              <p className="text-xs text-slate-500">
                Sổ cái chi tiết nhận thưởng và chi tiêu Xu
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

        {/* Current Balance Card */}
        <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-50 p-4 border border-amber-200/80 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Số dư ví hiện tại
            </div>
            <div className="text-2xl font-black text-amber-600 flex items-center gap-1.5 mt-0.5">
              <span>{(user.coins || 0).toLocaleString('vi-VN')}</span>
              <span className="text-sm font-bold text-amber-700">FPT Coin</span>
            </div>
          </div>
          <div className="text-right">
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold text-[11px]">
              1 Xu = 1 VNĐ
            </Badge>
            <div className="text-[11px] text-slate-400 mt-1">Dùng giảm giá khi thanh toán</div>
          </div>
        </div>

        {/* Filter Chips & Refresh */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer',
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilterType('plus')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1',
                filterType === 'plus'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <ArrowDownLeft className="h-3 w-3 text-emerald-600" />
              Cộng Xu (+)
            </button>
            <button
              type="button"
              onClick={() => setFilterType('minus')}
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1',
                filterType === 'minus'
                  ? 'bg-white text-rose-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <ArrowUpRight className="h-3 w-3 text-rose-600" />
              Trừ Xu (-)
            </button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={loadHistory}
            disabled={isLoading}
            className="h-8 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1', isLoading && 'animate-spin')} />
            Làm mới
          </Button>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
              <span className="text-xs">Đang tải lịch sử giao dịch Xu...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4 text-center">
              <Coins className="h-8 w-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Chưa có giao dịch biến động nào</p>
              <p className="text-[11px] text-slate-400">Hãy điểm danh mỗi ngày để tích lũy thêm FPT Coin nhé!</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                    <div className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl shrink-0',
                      isPositive ? 'bg-emerald-100' : 'bg-rose-100'
                    )}>
                      {getTypeIcon(tx.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate">
                        {tx.description}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span>{new Date(tx.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>Số dư sau: {tx.balanceAfter.toLocaleString('vi-VN')} Xu</span>
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    'text-xs font-black shrink-0 text-right',
                    isPositive ? 'text-emerald-600' : 'text-rose-600'
                  )}>
                    {isPositive ? `+${tx.amount.toLocaleString('vi-VN')}` : tx.amount.toLocaleString('vi-VN')} Xu
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
