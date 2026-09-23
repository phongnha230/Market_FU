'use client';

import React, { useState, useEffect } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import {
  MapPin,
  Camera,
  Wifi,
  Plus,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  X,
  Filter,
} from 'lucide-react';
import { safehandoffService, SafeHandoffHubItem, HubStats } from '@/services/safehandoffService';

const CAMPUS_LABELS: Record<string, string> = {
  HOL: 'Hòa Lạc',
  HCM: 'TP.HCM',
  DAD: 'Đà Nẵng',
  CT: 'Cần Thơ',
  QN: 'Quy Nhơn',
};

export default function AdminSafeHandoffPage() {
  const [hubs, setHubs] = useState<SafeHandoffHubItem[]>([]);
  const [stats, setStats] = useState<HubStats>({ total: 0, operating: 0, maintenance: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    campus: 'HOL' as 'HOL' | 'HCM' | 'DAD' | 'QN' | 'CT',
    storageCapacity: '50 GB',
    cameras: '2 Cam HD',
    staffCount: '4 cán bộ',
    status: 'Hoạt động',
    operatingHours: '07:30 - 21:00',
    locationDetails: '',
    notes: '',
  });

  const loadHubs = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const params = selectedCampus !== 'ALL' ? { campus: selectedCampus } : undefined;
      const res = await safehandoffService.getHubs(params);
      setHubs(res.hubs);
      setStats(res.stats);
    } catch (err: any) {
      console.error('Failed to load Safe-Handoff hubs:', err);
      setErrorMsg(err.response?.data?.error?.message || 'Không thể tải danh sách trạm Safe-Handoff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHubs();
  }, [selectedCampus]);

  const handleToggleStatus = async (hub: SafeHandoffHubItem) => {
    try {
      const updated = await safehandoffService.toggleHubStatus(hub.id);
      setHubs((prev) =>
        prev.map((h) => (h.id === hub.id ? { ...h, status: updated.status, isOperating: updated.isOperating } : h))
      );
      setStats((prev) => {
        const isNowOperating = updated.status === 'Hoạt động';
        return {
          ...prev,
          operating: isNowOperating ? prev.operating + 1 : prev.operating - 1,
          maintenance: isNowOperating ? prev.maintenance - 1 : prev.maintenance + 1,
        };
      });
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Thao tác đổi trạng thái thất bại');
    }
  };

  const handleDelete = async (hub: SafeHandoffHubItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa trạm ${hub.name} (${hub.code})?`)) return;
    try {
      await safehandoffService.deleteHub(hub.id);
      setHubs((prev) => prev.filter((h) => h.id !== hub.id));
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
        operating: hub.status === 'Hoạt động' ? prev.operating - 1 : prev.operating,
        maintenance: hub.status === 'Bảo trì' ? prev.maintenance - 1 : prev.maintenance,
      }));
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Xóa trạm thất bại');
    }
  };

  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);
      const created = await safehandoffService.createHub(formData);
      setHubs((prev) => [created, ...prev]);
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        operating: created.status === 'Hoạt động' ? prev.operating + 1 : prev.operating,
        maintenance: created.status === 'Bảo trì' ? prev.maintenance + 1 : prev.maintenance,
      }));
      setIsModalOpen(false);
      setFormData({
        code: '',
        name: '',
        campus: 'HOL',
        storageCapacity: '50 GB',
        cameras: '2 Cam HD',
        staffCount: '4 cán bộ',
        status: 'Hoạt động',
        operatingHours: '07:30 - 21:00',
        locationDetails: '',
        notes: '',
      });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Tạo trạm mới thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayoutShell>
      <div className="space-y-5">
        {/* Header & Stats Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900">Safe-Handoff Hub Network</h1>
              <p className="text-sm text-slate-500 mt-1">
                Quản lý mạng lưới {stats.total || 18} điểm giao nhận an toàn tại 5 cơ sở FPT (Hòa Lạc, TP.HCM, Đà Nẵng, Cần Thơ, Quy Nhơn).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadHubs}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                title="Tải lại dữ liệu"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Thêm điểm mới
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Tổng điểm Safe-Handoff', value: stats.total },
              { label: 'Đang hoạt động', value: stats.operating, color: 'text-emerald-600' },
              { label: 'Cần bảo trì / Tạm ngưng', value: stats.maintenance, color: stats.maintenance > 0 ? 'text-amber-600' : 'text-slate-900' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                <div className={`text-2xl font-black ${s.color || 'text-slate-900'}`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Lọc theo cơ sở:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Toàn bộ 5 Campus', value: 'ALL' },
                { label: 'Hòa Lạc', value: 'HOL' },
                { label: 'TP.HCM', value: 'HCM' },
                { label: 'Đà Nẵng', value: 'DAD' },
                { label: 'Cần Thơ', value: 'CT' },
                { label: 'Quy Nhơn', value: 'QN' },
              ].map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedCampus(c.value)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer transition ${
                    selectedCampus === c.value
                      ? 'bg-orange-500 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hubs List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Danh sách trạm Safe-Handoff ({hubs.length} trạm)
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Đang tải danh sách trạm Safe-Handoff từ máy chủ...</div>
          ) : hubs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">Không có trạm nào thuộc bộ lọc này.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {hubs.map((hub) => (
                <div key={hub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        hub.status === 'Hoạt động' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{hub.name}</span>
                        <span className="rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5">
                          {hub.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{CAMPUS_LABELS[hub.campus] || hub.campus}</span> •{' '}
                        {hub.staffCount} • Giờ: {hub.operatingHours}
                      </div>
                      {hub.notes && <div className="text-[10px] text-slate-400 mt-0.5 italic">{hub.notes}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Camera className="h-3.5 w-3.5 text-slate-400" /> {hub.cameras}
                      </div>
                      <div className="flex items-center gap-1">
                        <Wifi className="h-3.5 w-3.5 text-slate-400" /> {hub.storageCapacity}
                      </div>
                    </div>

                    {/* Status Toggle Button */}
                    <button
                      onClick={() => handleToggleStatus(hub)}
                      className={`flex items-center gap-1.5 rounded-xl border text-[11px] font-bold px-3 py-1 cursor-pointer transition ${
                        hub.status === 'Hoạt động'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      {hub.status === 'Hoạt động' ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Bảo trì
                        </>
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(hub)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                      title="Xóa trạm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Thêm trạm mới */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">Thêm Trạm Safe-Handoff Mới</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateHub} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Mã trạm (VD: HL-08)</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                      placeholder="HL-08"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Cơ sở (Campus)</label>
                    <select
                      value={formData.campus}
                      onChange={(e) => setFormData({ ...formData, campus: e.target.value as any })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    >
                      <option value="HOL">Hòa Lạc (Hà Nội)</option>
                      <option value="HCM">TP.HCM (Quận 9)</option>
                      <option value="DAD">Đà Nẵng</option>
                      <option value="CT">Cần Thơ</option>
                      <option value="QN">Quy Nhơn</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Tên điểm Safe-Handoff</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    placeholder="Sảnh Tòa Beta (Tầng 1)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Camera giám sát</label>
                    <input
                      type="text"
                      value={formData.cameras}
                      onChange={(e) => setFormData({ ...formData, cameras: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Tủ chứa / Dung lượng</label>
                    <input
                      type="text"
                      value={formData.storageCapacity}
                      onChange={(e) => setFormData({ ...formData, storageCapacity: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Nhân sự / Trực nhật</label>
                    <input
                      type="text"
                      value={formData.staffCount}
                      onChange={(e) => setFormData({ ...formData, staffCount: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Khung giờ hoạt động</label>
                    <input
                      type="text"
                      value={formData.operatingHours}
                      onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Ghi chú & Hướng dẫn nhận đồ</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    placeholder="Gần bảo vệ sảnh, wifi tốt, camera 24/7..."
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
                    className="rounded-xl bg-fpt-orange px-5 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Đang tạo...' : 'Tạo trạm'}
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
