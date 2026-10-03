'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useWalletStore } from '@/stores/walletStore';
import { cn } from '@/lib/utils';
import {
  X,
  Award,
  Calendar,
  Coins,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle,
  Flag,
} from 'lucide-react';

interface VoucherModalsProps {
  isHistoryOpen: boolean;
  onCloseHistory: () => void;
  isPolicyOpen: boolean;
  onClosePolicy: () => void;
  isReportOpen: boolean;
  onCloseReport: () => void;
  coins: number;
  onReportSuccess: () => void;
}

export default function VoucherModals({
  isHistoryOpen,
  onCloseHistory,
  isPolicyOpen,
  onClosePolicy,
  isReportOpen,
  onCloseReport,
  coins,
  onReportSuccess,
}: VoucherModalsProps) {
  const [reportReason, setReportReason] = useState('scalping');
  const [reportDetails, setReportDetails] = useState('');

  const user = useUserStore((s) => s.user);
  const transactions = useWalletStore((s) => s.transactions);

  // 1. History Modal
  const renderHistoryModal = () => {
    if (!isHistoryOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Lịch Sử Ví Campus Coins</h3>
                <p className="text-xs text-slate-500">
                  {user.studentId ? `Mã SV: ${user.studentId} • ` : ''}{user.name || 'Sinh viên FPT'} ({user.campus || 'Hola'})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseHistory}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Current balance summary */}
          <div className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-orange-100 uppercase tracking-wider font-semibold">
                Số dư khả dụng
              </span>
              <div className="text-2xl font-black">{coins} Coins</div>
              <span className="text-[11px] text-orange-100 font-medium">
                = {(coins * 1000).toLocaleString('vi-VN')}đ khấu trừ đơn hàng
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-xs">
                <Award className="h-3.5 w-3.5" />
                {coins >= 500 ? 'Diamond Tier' : coins >= 200 ? 'Gold Tier' : 'Silver Tier'}
              </span>
              <p className="mt-1 text-[11px] text-orange-100">{user.campus || 'Campus FPT'}</p>
            </div>
          </div>

          {/* Transaction list */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Biến động gần đây
            </div>
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Chưa có biến động số dư xu nào.
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{tx.description}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{tx.createdAt}</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'text-xs font-black',
                      tx.amount > 0 ? 'text-emerald-600' : 'text-rose-500'
                    )}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Coins
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={onCloseHistory}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  };

  // 2. Policy Modal
  const renderPolicyModal = () => {
    if (!isPolicyOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Quy Chế Bảo Trợ & Voucher FPT Edu</h3>
                <p className="text-xs text-slate-500">Ban Công tác Sinh viên (CTSV) & Hội Sinh Viên FPT</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClosePolicy}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
            <div className="rounded-xl bg-orange-50 border border-orange-200 p-3.5 text-slate-800">
              <h5 className="font-bold text-fpt-orange mb-1">Mục đích thành lập Quỹ Trợ Giá 5Campus:</h5>
              <p>
                Quỹ được tài trợ bởi Đại học FPT cùng các đơn vị đối tác nhằm hỗ trợ chi phí chuyển giao đồ án tốt nghiệp, giáo trình PE/FE và thiết bị máy tính thực hành giữa sinh viên 5 phân hiệu cơ sở.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">1. Điều kiện áp dụng Voucher:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Mỗi voucher chỉ áp dụng cho tài khoản sinh viên đã xác thực email <code>@fpt.edu.vn</code>.</li>
                <li>Mã miễn phí vận chuyển liên campus (CampusShip) áp dụng theo tuyến vận chuyển giữa 5 điểm tiếp nhận của trường.</li>
                <li>Voucher không có giá trị quy đổi trực tiếp thành tiền mặt ngoài hệ thống P2P Campus.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">2. Cơ chế tích lũy & Tiêu chuẩn điểm Coins:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>1 Campus Coin = 100 VNĐ khi khấu trừ cước ship hoặc thanh toán Escrow.</li>
                <li>Điểm danh hàng ngày: +20 Coins/ngày.</li>
                <li>Đánh giá có tâm sau khi nhận đồ: +50 Coins.</li>
                <li>Giao dịch tại Safe-Handoff Point: +40 Coins.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 text-sm">3. Chế tài xử lý gian lận:</h4>
              <p className="text-rose-600 font-medium">
                Nghiêm cấm hành vi dùng công cụ tự động bot cày voucher, câu đơn ảo hoặc mua bán lại mã giảm giá. Các trường hợp vi phạm sẽ bị đình chỉ quyền truy cập sàn 5Campus và thông báo về phòng CTSV phân hiệu.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClosePolicy}
            className="w-full rounded-xl bg-fpt-orange py-2.5 text-xs font-bold text-white hover:bg-fpt-orange-hover transition cursor-pointer"
          >
            Tôi Đã Hiểu Rõ Quy Chế
          </button>
        </div>
      </div>
    );
  };

  // 3. Report Modal
  const renderReportModal = () => {
    if (!isReportOpen) return null;

    const handleSubmitReport = (e: React.FormEvent) => {
      e.preventDefault();
      onReportSuccess();
      onCloseReport();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Flag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Báo Cáo Sai Phạm Voucher</h3>
                <p className="text-xs text-slate-500">Bảo vệ môi trường trao đổi đồ trung thực</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseReport}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700">Loại hành vi vi phạm</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-fpt-orange focus:outline-hidden"
              >
                <option value="scalping">Thu gom hoặc bán lại voucher trái phép</option>
                <option value="fake_account">Tạo tài khoản ảo cày Coins / Gian lận điểm danh</option>
                <option value="invalid_code">Mã voucher thông báo khả dụng nhưng bị từ chối</option>
                <option value="other">Hành vi gian lận khác</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Mô tả chi tiết / Bằng chứng</label>
              <textarea
                rows={3}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Nhập mã voucher hoặc thông tin người vi phạm..."
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-fpt-orange focus:outline-hidden"
                required
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onCloseReport}
                className="w-1/2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="w-1/2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-xs cursor-pointer active:scale-95 transition"
              >
                Gửi Báo Cáo
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderHistoryModal()}
      {renderPolicyModal()}
      {renderReportModal()}
    </>
  );
}
