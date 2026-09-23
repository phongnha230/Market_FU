'use client';

import React, { useState, useEffect } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import {
  Ticket,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Coffee,
  Utensils,
  Store,
  Sparkles,
} from 'lucide-react';
import {
  voucherService,
  BackendVoucher,
  VoucherPartner,
} from '@/services/voucherService';

const PARTNER_LABELS: Record<VoucherPartner, { name: string; color: string; icon: any }> = {
  CANTEEN: { name: 'Căn tin FPT', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Utensils },
  PASSIO: { name: 'Passio Coffee', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Coffee },
  SEVEN_ELEVEN: { name: '7-Eleven', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Store },
  OTHER: { name: 'Đối tác khác', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Sparkles },
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<BackendVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    partner: 'CANTEEN' as VoucherPartner,
    coinCost: 50,
    discountValue: 10000,
    quantity: 100,
    validDays: 30,
    imageUrl: '',
  });

  const loadVouchers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const params = selectedPartner !== 'ALL' ? { partner: selectedPartner as VoucherPartner } : undefined;
      const res = await voucherService.getVouchers(params);
      setVouchers(res.vouchers);
    } catch (err: any) {
      console.error('Failed to load vouchers:', err);
      setErrorMsg(err.response?.data?.error?.message || 'Không thể tải danh sách voucher.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [selectedPartner]);

  const handleToggleActive = async (voucher: BackendVoucher) => {
    try {
      const updated = await voucherService.updateVoucher(voucher.id, {
        isActive: !voucher.isActive,
      });
      setVouchers((prev) =>
        prev.map((v) => (v.id === voucher.id ? { ...v, isActive: updated.isActive } : v))
      );
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Thao tác cập nhật trạng thái thất bại.');
    }
  };

  const handleDelete = async (voucher: BackendVoucher) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa voucher "${voucher.title}"?`)) return;
    try {
      await voucherService.deleteVoucher(voucher.id);
      setVouchers((prev) => prev.filter((v) => v.id !== voucher.id));
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Xóa voucher thất bại.');
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);
      const created = await voucherService.createVoucher(formData);
      setVouchers((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        partner: 'CANTEEN',
        coinCost: 50,
        discountValue: 10000,
        quantity: 100,
        validDays: 30,
        imageUrl: '',
      });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Tạo voucher thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = vouchers.filter((v) => v.isActive).length;

  return (
    <AdminLayoutShell>
      <div className="space-y-5 font-sans">
        {/* Header & Stats Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-orange-500" />
                <h1 className="text-xl font-black text-slate-900">Quản Lý Voucher & Đặc Quyền Đối Tác</h1>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Tạo mã ưu đãi căn tin, Passio Coffee, 7-Eleven và trợ giá cho sinh viên đổi bằng Campus Coins.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadVouchers}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Thêm Voucher Mới
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Tổng Voucher', value: vouchers.length },
              { label: 'Đang mở đổi', value: activeCount, color: 'text-emerald-600' },
              { label: 'Tạm ẩn / Hết kho', value: vouchers.length - activeCount, color: 'text-slate-500' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                <div className={`text-2xl font-black ${s.color || 'text-slate-900'}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Filter */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <span className="text-xs font-bold text-slate-700 mr-2">Đối tác:</span>
          {[
            { label: 'Tất cả đối tác', value: 'ALL' },
            { label: 'Căn tin FPT', value: 'CANTEEN' },
            { label: 'Passio Coffee', value: 'PASSIO' },
            { label: '7-Eleven', value: 'SEVEN_ELEVEN' },
            { label: 'Khác', value: 'OTHER' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setSelectedPartner(p.value)}
              className={`rounded-lg px-3 py-1 text-xs font-bold cursor-pointer transition ${
                selectedPartner === p.value
                  ? 'bg-orange-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Vouchers Table / Grid */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Danh sách voucher ({vouchers.length} ưu đãi)
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Đang tải kho voucher...</div>
          ) : vouchers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">Chưa có voucher nào trong danh mục này.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {vouchers.map((voucher) => {
                const partnerInfo = PARTNER_LABELS[voucher.partner] || PARTNER_LABELS.OTHER;
                const PartnerIcon = partnerInfo.icon;

                return (
                  <div key={voucher.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                        <PartnerIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">{voucher.title}</span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${partnerInfo.color}`}>
                            {partnerInfo.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {voucher.description || 'Ưu đãi dành cho sinh viên FPT'}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1">
                          <span>Đổi: <b className="text-orange-600">{voucher.coinCost} Xu</b></span>
                          <span>•</span>
                          <span>Giảm: <b className="text-emerald-600">{voucher.discountValue.toLocaleString('vi-VN')} đ</b></span>
                          <span>•</span>
                          <span>Còn lại: <b>{voucher.quantity}</b></span>
                          <span>•</span>
                          <span>Hạn dùng: <b>{voucher.validDays} ngày</b></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleToggleActive(voucher)}
                        className={`flex items-center gap-1.5 rounded-xl border text-[11px] font-bold px-3 py-1 cursor-pointer transition ${
                          voucher.isActive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {voucher.isActive ? (
                          <>
                            <CheckCircle className="h-3.5 w-3.5" />
                            Đang mở
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3.5 w-3.5" />
                            Tạm ẩn
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(voucher)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                        title="Xóa voucher"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Thêm Voucher */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Tạo Voucher Ưu Đãi Mới</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateVoucher} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tiêu đề voucher <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cơm trưa Căn tin - Giảm 10.000đ"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Đối tác cung cấp</label>
                    <select
                      value={formData.partner}
                      onChange={(e) => setFormData({ ...formData, partner: e.target.value as VoucherPartner })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    >
                      <option value="CANTEEN">Căn tin trường FPT</option>
                      <option value="PASSIO">Passio Coffee</option>
                      <option value="SEVEN_ELEVEN">7-Eleven</option>
                      <option value="OTHER">Đối tác khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Giá trị giảm (VNĐ) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={1000}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Số Xu cần đổi <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.coinCost}
                      onChange={(e) => setFormData({ ...formData, coinCost: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Số lượng trong kho</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Hạn dùng (ngày)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.validDays}
                      onChange={(e) => setFormData({ ...formData, validDays: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Mô tả / Điều kiện áp dụng</label>
                  <textarea
                    rows={2}
                    placeholder="Áp dụng tại căng tin toàn bộ 5 Campus cho hóa đơn từ 30k..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-fpt-orange px-5 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {submitting ? 'Đang tạo...' : 'Tạo Voucher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutShell>
  );
}
