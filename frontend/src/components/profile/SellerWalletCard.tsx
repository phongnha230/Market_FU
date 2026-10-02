'use client';

import React, { useState } from 'react';
import {
  Wallet,
  CreditCard,
  ShieldCheck,
  Lock,
  ArrowUpRight,
  History,
  Coins,
  Sparkles,
  HelpCircle,
  Building,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useWalletStore } from '@/stores/walletStore';
import WithdrawalModal from '@/components/modals/WithdrawalModal';

interface SellerWalletCardProps {
  onShowToast?: (msg: string) => void;
}

export default function SellerWalletCard({ onShowToast }: SellerWalletCardProps) {
  const currentUser = useUserStore((state) => state.user);
  const walletStore = useWalletStore();
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'withdraw' | 'history'>('withdraw');
  const [showEscrowInfo, setShowEscrowInfo] = useState(false);

  const userCoins = currentUser.coins || 0;
  const availableVnd = userCoins * 1000; // 1 Xu = 1.000 VNĐ
  const frozenCoins = walletStore.frozenCoins || 0;
  const frozenVnd = frozenCoins * 1000;

  const handleOpenWithdraw = () => {
    setModalInitialTab('withdraw');
    setIsWithdrawalModalOpen(true);
  };

  const handleOpenHistory = () => {
    setModalInitialTab('history');
    setIsWithdrawalModalOpen(true);
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-slate-300 transition">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500 to-amber-500 text-white shadow-xs">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Ví Doanh Thu & Ký Quỹ Escrow
                </h3>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Bảo lãnh P2P 100%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý doanh thu bán đồ cũ & tiền bảo lãnh từ người mua theo chuẩn sàn TMĐT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEscrowInfo(!showEscrowInfo)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Cơ chế bảo lãnh</span>
            </button>
            <button
              type="button"
              onClick={handleOpenHistory}
              className="text-xs font-bold text-slate-700 hover:text-fpt-orange flex items-center gap-1 py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-orange-50/50 hover:border-orange-200 transition cursor-pointer"
            >
              <History className="h-3.5 w-3.5" />
              <span>Lịch sử ví</span>
            </button>
          </div>
        </div>

        {/* Escrow Mechanism Explainer (Collapsible) */}
        {showEscrowInfo && (
          <div className="my-4 rounded-xl bg-blue-50/80 border border-blue-200 p-4 text-xs text-blue-900 leading-relaxed animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-blue-950 font-bold">Quy trình giữ tiền bảo lãnh Escrow:</strong>
                <p>
                  1. Khi người mua đặt cọc qua VietQR / PayOS, tiền được sàn giữ an toàn trong ví Escrow.
                </p>
                <p>
                  2. Bạn chuẩn bị đồ và bàn giao tại trạm Safe-Point (Sảnh Alpha) hoặc gửi FPT Bus / GHN.
                </p>
                <p>
                  3. Khi người mua quét mã QR Handshake hoặc hết thời hạn 48h bao test, tiền sẽ tự động được giải ngân vào <strong>Số dư khả dụng</strong> để bạn rút về tài khoản ngân hàng cá nhân.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
          {/* 1. SỐ DƯ KHẢ DỤNG */}
          <div className="rounded-xl border border-amber-200/90 bg-linear-to-br from-amber-50/70 to-orange-50/70 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">Số dư khả dụng</span>
                <span className="rounded-full bg-white/90 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Rút ngay
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-950 mt-2 tracking-tight">
                {availableVnd.toLocaleString('vi-VN')} <span className="text-xs font-bold text-amber-700">đ</span>
              </div>
              <div className="text-[11px] font-semibold text-amber-800/80 mt-0.5">
                Tương đương {userCoins.toLocaleString('vi-VN')} FPT Coin
              </div>
            </div>
            <p className="text-[10px] text-amber-700/80 mt-3 pt-2 border-t border-amber-200/60">
              ✓ Tiền đã giải ngân từ các đơn hoàn tất
            </p>
          </div>

          {/* 2. ĐANG GIỮ KÝ QUỸ ESCROW */}
          <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-blue-600" />
                  Đang giữ Escrow
                </span>
                <span className="rounded-full bg-blue-100/90 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  Tạm giữ
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-blue-950 mt-2 tracking-tight">
                {frozenVnd.toLocaleString('vi-VN')} <span className="text-xs font-bold text-blue-700">đ</span>
              </div>
              <div className="text-[11px] font-semibold text-blue-800/80 mt-0.5">
                Đang bảo lưu an toàn tại sàn
              </div>
            </div>
            <p className="text-[10px] text-blue-700/80 mt-3 pt-2 border-t border-blue-200/60">
              ✓ Giải ngân sau khi người mua nhận đồ
            </p>
          </div>

          {/* 3. TÀI KHOẢN NGÂN HÀNG LIÊN KẾT */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-slate-500" />
                  Tài khoản nhận tiền
                </span>
                <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Đã liên kết
                </span>
              </div>
              <div className="text-sm font-black text-slate-900 mt-2">
                MB Bank (Quân Đội)
              </div>
              <div className="text-xs font-mono font-bold text-slate-600 mt-0.5">
                0000305848243
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
              Chủ TK: {currentUser.name || 'SINH VIEN FPT'}
            </p>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="h-4 w-4 text-fpt-orange" />
            <span>Phí giao dịch & rút tiền: <strong className="text-emerald-600 font-bold">0đ (Tài trợ 100% cho SV)</strong></span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenWithdraw}
              disabled={availableVnd < 50000}
              className="w-full sm:w-auto rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white px-5 py-2.5 text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
            >
              <CreditCard className="h-4 w-4" />
              <span>Rút tiền về Ngân hàng (ATM)</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        initialTab={modalInitialTab}
        onSuccess={() => {
          if (onShowToast) {
            onShowToast('🎉 Đã gửi yêu cầu rút tiền về tài khoản ngân hàng thành công!');
          }
        }}
      />
    </>
  );
}
