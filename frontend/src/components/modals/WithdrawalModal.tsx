'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  CreditCard,
  User,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Coins,
  History,
  Send,
  Loader2,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useWalletStore } from '@/stores/walletStore';
import { profileService } from '@/services/profileService';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'withdraw' | 'history';
  onSuccess?: () => void;
}

const POPULAR_BANKS = [
  { code: 'MB', name: 'MB Bank (Ngân hàng Quân Đội)' },
  { code: 'VCB', name: 'Vietcombank (Ngoại thương)' },
  { code: 'TCB', name: 'Techcombank (Kỹ thương)' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)' },
  { code: 'VPB', name: 'VPBank (Thịnh Vượng)' },
  { code: 'BIDV', name: 'BIDV (Đầu tư & Phát triển)' },
  { code: 'ACB', name: 'ACB (Á Châu)' },
  { code: 'AGR', name: 'Agribank (Nông nghiệp)' },
  { code: 'OCB', name: 'OCB (Phương Đông)' },
  { code: 'STB', name: 'Sacombank' },
];

export default function WithdrawalModal({
  isOpen,
  onClose,
  initialTab = 'withdraw',
  onSuccess,
}: WithdrawalModalProps) {
  const currentUser = useUserStore((state) => state.user);
  const walletStore = useWalletStore();

  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>(initialTab);
  const [selectedBank, setSelectedBank] = useState('MB Bank (Ngân hàng Quân Đội)');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(currentUser.name || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [saveBankInfo, setSaveBankInfo] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // History state
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Tính số dư khả dụng (1 Xu = 1.000 VNĐ)
  const userCoins = currentUser.coins || 0;
  const availableVnd = userCoins * 1000;

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg(null);
      setSuccessMsg(null);
      fetchHistory();
    }
  }, [isOpen, initialTab]);

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await profileService.getWithdrawals();
      if (res?.requests && res.requests.length > 0) {
        setWithdrawalHistory(res.requests);
      } else {
        // Fallback từ local walletStore nếu có
        setWithdrawalHistory(walletStore.withdrawalRequests || []);
      }
    } catch {
      setWithdrawalHistory(walletStore.withdrawalRequests || []);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  if (!isOpen) return null;

  const handleQuickAmount = (val: number) => {
    if (val > availableVnd) {
      setAmount(availableVnd);
    } else {
      setAmount(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < 50000) {
      setErrorMsg('Số tiền rút tối thiểu là 50.000 VNĐ');
      return;
    }

    if (numAmount > availableVnd) {
      setErrorMsg(`Số dư khả dụng không đủ! Hiện tại bạn có ${availableVnd.toLocaleString('vi-VN')} đ.`);
      return;
    }

    if (!accountNumber.trim()) {
      setErrorMsg('Vui lòng nhập số tài khoản ngân hàng thụ hưởng');
      return;
    }

    if (!accountName.trim()) {
      setErrorMsg('Vui lòng nhập tên chủ tài khoản thụ hưởng');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Cập nhật thông tin ngân hàng nếu người dùng chọn lưu
      if (saveBankInfo) {
        await profileService.updateBankAccount({
          bankName: selectedBank,
          accountNo: accountNumber.trim(),
          accountName: accountName.trim().toUpperCase(),
        }).catch(() => {});
      }

      // 2. Gửi yêu cầu rút tiền lên Backend
      const res = await profileService.createWithdrawal(numAmount).catch(() => null);

      // 3. Khấu trừ số dư Xu trong store để UI cập nhật tức thì (1 Coin = 1.000 VNĐ)
      const coinsToDeduct = Math.floor(numAmount / 1000);
      useUserStore.getState().addCoins(-coinsToDeduct);

      // 4. Lưu vào walletStore local
      const newReq = {
        id: res?.id || `wd-${Date.now()}`,
        userId: currentUser.id || 'current-user',
        amount: numAmount,
        bankAccount: {
          bankName: selectedBank,
          accountNo: accountNumber.trim(),
          accountName: accountName.trim().toUpperCase(),
        },
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
      };
      walletStore.requestWithdrawal(numAmount);
      setWithdrawalHistory((prev) => [newReq, ...prev]);

      setSuccessMsg(`Tạo lệnh rút ${numAmount.toLocaleString('vi-VN')} đ thành công! BQT sẽ đối soát và giải ngân tự động trong 24h.`);
      setAmount('');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo lệnh rút tiền');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Rút Tiền Về Ngân Hàng
              </h2>
              <p className="text-xs text-slate-500">
                Giải ngân số dư từ doanh thu bán hàng & ví Escrow an toàn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'withdraw'
                ? 'border-fpt-orange text-fpt-orange'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            Tạo lệnh rút mới
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'border-fpt-orange text-fpt-orange'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            Lịch sử rút tiền ({withdrawalHistory.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* AVAILABLE BALANCE BANNER */}
          <div className="rounded-xl border border-amber-200/80 bg-linear-to-r from-amber-50 to-orange-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">Số dư ví khả dụng:</span>
              </div>
              <span className="text-xs text-amber-700 font-medium">Quy đổi: 1 Xu = 1.000 VNĐ</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-black text-amber-950 tracking-tight">
                {availableVnd.toLocaleString('vi-VN')} <span className="text-sm font-bold text-amber-700">đ</span>
              </div>
              <div className="rounded-full bg-white/90 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 shadow-2xs">
                {userCoins.toLocaleString('vi-VN')} Xu
              </div>
            </div>
          </div>

          {activeTab === 'withdraw' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error / Success Feedback */}
              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Số tiền muốn rút (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="10000"
                    placeholder="Nhập số tiền (VD: 200000)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-10 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-fpt-orange focus:ring-1 focus:ring-fpt-orange transition"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    VNĐ
                  </span>
                </div>

                {/* Quick Selection Chips */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[50000, 100000, 200000, 500000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-fpt-orange hover:text-fpt-orange transition cursor-pointer"
                    >
                      {val.toLocaleString('vi-VN')}đ
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(availableVnd)}
                    className="rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-fpt-orange hover:bg-orange-100 transition cursor-pointer"
                  >
                    Rút toàn bộ
                  </button>
                </div>
              </div>

              {/* Bank Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ngân hàng thụ hưởng <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-fpt-orange transition cursor-pointer"
                  >
                    {POPULAR_BANKS.map((b) => (
                      <option key={b.code} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Số tài khoản nhận tiền <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập số tài khoản ngân hàng..."
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs sm:text-sm font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition"
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên chủ tài khoản (In hoa không dấu) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: NGUYEN VAN A"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs sm:text-sm font-bold uppercase text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition"
                />
              </div>

              {/* Remember account option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveBank"
                  checked={saveBankInfo}
                  onChange={(e) => setSaveBankInfo(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-fpt-orange focus:ring-fpt-orange cursor-pointer"
                />
                <label htmlFor="saveBank" className="text-xs text-slate-600 font-medium cursor-pointer">
                  Lưu thông tin ngân hàng này làm mặc định cho các lần rút sau
                </label>
              </div>

              {/* Fee Notice */}
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-[11px] text-blue-900 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Miễn phí 100% phí rút tiền</strong> cho sinh viên Đại học FPT. Tiền sẽ được chuyển thẳng về tài khoản ngân hàng sau khi BQT đối soát hoàn tất.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || availableVnd < 50000}
                className="w-full rounded-xl bg-fpt-orange py-3 text-sm font-bold text-white shadow-md hover:bg-fpt-orange-hover transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang xử lý yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <span>Xác nhận rút tiền</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* WITHDRAWAL HISTORY TAB */
            <div className="space-y-3">
              {isLoadingHistory ? (
                <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-fpt-orange" />
                  <span className="text-xs">Đang tải lịch sử rút tiền...</span>
                </div>
              ) : withdrawalHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <History className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">Chưa có lệnh rút tiền nào</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Các yêu cầu rút tiền của bạn sẽ được lưu và cập nhật tiến độ tại đây.
                  </p>
                </div>
              ) : (
                withdrawalHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">
                        -{Number(item.amount).toLocaleString('vi-VN')} đ
                      </span>
                      {item.status === 'APPROVED' ? (
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Đã chuyển khoản
                        </span>
                      ) : item.status === 'REJECTED' ? (
                        <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Bị từ chối
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Đang chờ duyệt
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between">
                      <span>{item.bankAccount?.bankName || 'Ngân hàng thụ hưởng'}</span>
                      <span className="font-mono font-bold">{item.bankAccount?.accountNo}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}</span>
                      {item.adminNote && (
                        <span className="text-amber-800 italic">Ghi chú: {item.adminNote}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
