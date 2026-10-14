'use client';

import React, { useState, useEffect } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import {
  CreditCard,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  QrCode,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Check,
  X,
  Loader2,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface WithdrawalItem {
  id: string;
  userId: string;
  amount: number;
  bankAccount: {
    bankName: string;
    accountNo: string;
    accountName: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
  user?: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
      campus?: string;
      phoneNumber?: string;
    };
  };
}

const BANK_CODE_MAP: Record<string, string> = {
  'MB': 'MB',
  'VCB': 'VCB',
  'TCB': 'TCB',
  'TPB': 'TPB',
  'VPB': 'VPB',
  'BIDV': 'BIDV',
  'ACB': 'ACB',
  'AGR': 'VBA',
  'OCB': 'OCB',
  'STB': 'STB',
  'CTG': 'ICB',
  'VIB': 'VIB',
  'SHB': 'SHB',
  'HDB': 'HDB',
  'MSB': 'MSB',
};

function getVietQrBankCode(bankName: string): string {
  if (!bankName) return 'MB';
  const upper = bankName.toUpperCase();
  for (const [key, code] of Object.entries(BANK_CODE_MAP)) {
    if (upper.includes(key)) return code;
  }
  if (upper.includes('VIETCOMBANK')) return 'VCB';
  if (upper.includes('VIETINBANK')) return 'ICB';
  if (upper.includes('TECHCOMBANK')) return 'TCB';
  if (upper.includes('TIÊN PHONG') || upper.includes('TIEN PHONG')) return 'TPB';
  if (upper.includes('THỊNH VƯỢNG') || upper.includes('THINH VUONG')) return 'VPB';
  if (upper.includes('QUÂN ĐỘI') || upper.includes('QUAN DOI')) return 'MB';
  if (upper.includes('Á CHÂU') || upper.includes('A CHAU')) return 'ACB';
  if (upper.includes('NÔNG NGHIỆP') || upper.includes('AGRIBANK')) return 'VBA';
  if (upper.includes('PHƯƠNG ĐÔNG') || upper.includes('PHUONG DONG')) return 'OCB';
  if (upper.includes('SÀI GÒN THƯƠNG TÍN') || upper.includes('SACOMBANK')) return 'STB';
  return bankName.split(' ')[0] || 'MB';
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item for Quick VietQR modal
  const [selectedForQr, setSelectedForQr] = useState<WithdrawalItem | null>(null);

  // Reject modal state
  const [rejectingItem, setRejectingItem] = useState<WithdrawalItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<any>(`/profile/admin/withdrawals?status=${filterStatus}`);
      const list = res.data?.data || res.data || [];
      setWithdrawals(Array.isArray(list) ? list : []);
    } catch {
      setWithdrawals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filterStatus]);

  const handleApprove = async (item: WithdrawalItem) => {
    if (!confirm(`Xác nhận đã chuyển khoản ${item.amount.toLocaleString('vi-VN')} đ cho ${item.bankAccount.accountName}?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await apiClient.patch(`/profile/admin/withdrawals/${item.id}`, {
        status: 'APPROVED',
        adminNote: 'Admin đã chuyển khoản thành công qua Napas 24/7',
      });
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === item.id ? { ...w, status: 'APPROVED', processedAt: new Date().toISOString() } : w))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối để thông báo cho sinh viên');
      return;
    }

    setIsProcessing(true);
    try {
      await apiClient.patch(`/profile/admin/withdrawals/${rejectingItem.id}`, {
        status: 'REJECTED',
        adminNote: rejectReason.trim(),
      });
      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === rejectingItem.id
            ? { ...w, status: 'REJECTED', adminNote: rejectReason.trim(), processedAt: new Date().toISOString() }
            : w
        )
      );
      setRejectingItem(null);
      setRejectReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi từ chối lệnh rút');
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats
  const pendingCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const approvedCount = withdrawals.filter((w) => w.status === 'APPROVED').length;
  const totalPendingAmount = withdrawals
    .filter((w) => w.status === 'PENDING')
    .reduce((sum, w) => sum + w.amount, 0);

  const filteredItems = withdrawals.filter((item) => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.bankAccount.accountName.toLowerCase().includes(q);
      const matchAcc = item.bankAccount.accountNo.includes(q);
      const matchBank = item.bankAccount.bankName.toLowerCase().includes(q);
      const matchUser = item.user?.profile?.fullName?.toLowerCase().includes(q);
      return matchName || matchAcc || matchBank || matchUser;
    }
    return true;
  });

  return (
    <AdminLayoutShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Quản Lý Rút Tiền Escrow & Doanh Thu
              </h1>
              <span className="rounded-full bg-orange-100 border border-orange-200 px-2.5 py-0.5 text-xs font-bold text-fpt-orange">
                Đối soát P2P
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Duyệt và giải ngân doanh thu bán đồ cho sinh viên FPT qua Napas 24/7
            </p>
          </div>

          <button
            onClick={fetchWithdrawals}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span>Chờ giải ngân</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-950 mt-2">
              {totalPendingAmount.toLocaleString('vi-VN')} <span className="text-xs font-bold">đ</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">
              {pendingCount} yêu cầu đang chờ đối soát
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>Đã chuyển thành công</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-950 mt-2">
              {approvedCount} <span className="text-xs font-bold">lệnh</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              Đã giải ngân qua Napas 24/7
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span>Bảo vệ quỹ Escrow</span>
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-950 mt-2">
              100%
            </div>
            <p className="text-[11px] text-blue-700 mt-1">
              Khấu trừ số dư tức thì, chống double-spend
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { key: 'ALL', label: 'Tất cả' },
                { key: 'PENDING', label: `Chờ duyệt (${pendingCount})` },
                { key: 'APPROVED', label: 'Đã duyệt' },
                { key: 'REJECTED', label: 'Từ chối' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  filterStatus === tab.key
                    ? 'bg-fpt-orange text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, STK, ngân hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:bg-white focus:border-fpt-orange transition"
            />
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-fpt-orange" />
              <span className="text-xs">Đang tải danh sách yêu cầu...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Wallet className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">Không có yêu cầu rút tiền nào</p>
              <p className="text-xs text-slate-400 mt-0.5">Không tìm thấy yêu cầu khớp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Sinh viên yêu cầu</th>
                    <th className="py-3.5 px-4">Số tiền rút</th>
                    <th className="py-3.5 px-4">Tài khoản nhận tiền</th>
                    <th className="py-3.5 px-4">Thời gian</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const isPending = item.status === 'PENDING';
                    const isApproved = item.status === 'APPROVED';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition">
                        {/* Sinh viên */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900">
                            {item.user?.profile?.fullName || item.bankAccount.accountName}
                          </div>
                          <div className="text-[11px] text-slate-500">{item.user?.email}</div>
                          {item.user?.profile?.campus && (
                            <span className="inline-block mt-0.5 rounded-sm bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-600">
                              {item.user.profile.campus}
                            </span>
                          )}
                        </td>

                        {/* Số tiền */}
                        <td className="py-3.5 px-4">
                          <div className="text-sm font-black text-slate-900">
                            {item.amount.toLocaleString('vi-VN')} đ
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {Math.floor(item.amount / 1000)} Xu
                          </div>
                        </td>

                        {/* Ngân hàng */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{item.bankAccount.bankName}</div>
                          <div className="font-mono font-bold text-slate-900 text-xs">
                            {item.bankAccount.accountNo}
                          </div>
                          <div className="text-[10px] uppercase font-bold text-slate-500">
                            {item.bankAccount.accountName}
                          </div>
                        </td>

                        {/* Thời gian */}
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          <div>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(item.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3.5 px-4">
                          {isApproved ? (
                            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[10px] font-bold text-emerald-700 inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Đã chuyển
                            </span>
                          ) : item.status === 'REJECTED' ? (
                            <div>
                              <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-[10px] font-bold text-rose-700 inline-flex items-center gap-1">
                                <XCircle className="h-3 w-3" /> Bị từ chối
                              </span>
                              {item.adminNote && (
                                <p className="text-[10px] text-rose-700 italic mt-1 max-w-xs">{item.adminNote}</p>
                              )}
                            </div>
                          ) : (
                            <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[10px] font-bold text-amber-700 inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Chờ duyệt
                            </span>
                          )}
                        </td>

                        {/* Hành động */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Nút bật mã VietQR chuyển khoản */}
                            <button
                              type="button"
                              onClick={() => setSelectedForQr(item)}
                              title="Bật mã VietQR để quét chuyển khoản ngay"
                              className="rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 p-1.5 text-xs font-bold transition cursor-pointer"
                            >
                              <QrCode className="h-4 w-4" />
                            </button>

                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApprove(item)}
                                  disabled={isProcessing}
                                  title="Xác nhận đã chuyển khoản thành công"
                                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Duyệt</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setRejectingItem(item)}
                                  disabled={isProcessing}
                                  title="Từ chối yêu cầu rút"
                                  className="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Từ chối</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* QUICK VIETQR MODAL FOR ADMIN TO SCAN AND TRANSFER */}
      {selectedForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-fpt-orange" />
                <h3 className="text-sm font-extrabold text-slate-900">Quét VietQR Chuyển Khoản</h3>
              </div>
              <button
                onClick={() => setSelectedForQr(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Mở App Ngân hàng của Sàn để quét mã chuyển {selectedForQr.amount.toLocaleString('vi-VN')} đ cho sinh viên:
            </p>

            <div className="flex justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={`https://img.vietqr.io/image/${getVietQrBankCode(selectedForQr.bankAccount.bankName)}-${selectedForQr.bankAccount.accountNo}-compact2.png?amount=${selectedForQr.amount}&addInfo=${encodeURIComponent(`GIAINGAN FU ${selectedForQr.id.slice(-6).toUpperCase()}`)}&accountName=${encodeURIComponent(selectedForQr.bankAccount.accountName)}`}
                alt="VietQR Chuyển tiền"
                className="w-56 h-56 rounded-lg object-contain bg-white"
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-bold text-slate-800">{selectedForQr.bankAccount.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">STK:</span>
                <span className="font-mono font-bold text-slate-900">{selectedForQr.bankAccount.accountNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chủ TK:</span>
                <span className="font-bold uppercase text-slate-900">{selectedForQr.bankAccount.accountName}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">Số tiền:</span>
                <span className="font-black text-fpt-orange text-sm">{selectedForQr.amount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {selectedForQr.status === 'PENDING' && (
              <button
                type="button"
                onClick={() => {
                  handleApprove(selectedForQr);
                  setSelectedForQr(null);
                }}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Tôi đã chuyển tiền xong (Duyệt lệnh)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <XCircle className="h-5 w-5" />
                <h3 className="text-sm font-extrabold text-slate-900">Từ Chối Lệnh Rút Tiền</h3>
              </div>
              <button
                onClick={() => setRejectingItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Khi từ chối lệnh rút {rejectingItem.amount.toLocaleString('vi-VN')} đ, số tiền/Xu sẽ được <strong>hoàn trả tự động ngay lập tức</strong> vào ví của sinh viên.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Lý do từ chối (Gửi thông báo tới sinh viên) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="VD: Số tài khoản không đúng định dạng, hoặc tên chủ tài khoản không khớp với hồ sơ KYC..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:bg-white focus:border-rose-500 transition"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isProcessing}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                <span>Xác nhận từ chối & Hoàn tiền</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayoutShell>
  );
}
