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
  Users,
  Handshake,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Package,
} from 'lucide-react';
import {
  safehandoffService,
  SafeHandoffHubItem,
  HubStats,
  MeetupOrderTransaction,
  MeetupStats,
} from '@/services/safehandoffService';

const CAMPUS_LABELS: Record<string, string> = {
  HOL: 'Hòa Lạc',
  HCM: 'TP.HCM',
  DAD: 'Đà Nẵng',
  CT: 'Cần Thơ',
  QN: 'Quy Nhơn',
};

const DEFAULT_ADMIN_HUBS: SafeHandoffHubItem[] = [
  {
    id: 'hl-01',
    code: 'HL-01',
    name: 'Sảnh Chính Tòa Alpha (Tầng 1)',
    campus: 'HOL',
    storageCapacity: '42 GB',
    cameras: '2 Cam HD',
    staffCount: '8 cán bộ/ngày',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '07:30 - 21:00',
    locationDetails: 'Bàn lễ tân sảnh chính, Tòa Alpha, ĐH FPT Hòa Lạc',
    notes: 'Có bảo vệ trực 24/7, 2 camera HD giám sát bàn tiếp tân',
  },
  {
    id: 'hl-02',
    code: 'HL-02',
    name: 'Thư viện Gamma (Tầng 1)',
    campus: 'HOL',
    storageCapacity: '28 GB',
    cameras: '360° AI',
    staffCount: 'Giờ tự học',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '08:00 - 21:30',
    locationDetails: 'Bàn quầy thủ thư, Tòa Gamma, ĐH FPT Hòa Lạc',
    notes: 'Khu vực tự học, ánh sáng tốt, thích hợp test laptop và máy tính bảng',
  },
  {
    id: 'hcm-01',
    code: 'HCM-01',
    name: 'Sảnh Tòa Nhà Innovation',
    campus: 'HCM',
    storageCapacity: '35 GB',
    cameras: '2 Cam 4K',
    staffCount: '6 cán bộ/ngày',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '07:30 - 21:00',
    locationDetails: 'Sảnh trệt Tòa Innovation, Khu Công Nghệ Cao, TP.HCM',
    notes: 'Có ổ cắm sạc điện thoại & kiểm tra máy',
  },
  {
    id: 'dad-01',
    code: 'DAD-01',
    name: 'Sảnh Tòa FPT City',
    campus: 'DAD',
    storageCapacity: '25 GB',
    cameras: '2 Cam HD',
    staffCount: '4 cán bộ/ngày',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '07:30 - 20:30',
    locationDetails: 'Sảnh chính Tòa FPT Complex, Ngũ Hành Sơn, Đà Nẵng',
    notes: 'Khu vực giao dịch an toàn có nhân viên hỗ trợ',
  },
  {
    id: 'ct-01',
    code: 'CT-01',
    name: 'Sảnh Tòa Hi-Tech Cần Thơ',
    campus: 'CT',
    storageCapacity: '20 GB',
    cameras: '2 Cam HD',
    staffCount: '3 cán bộ/ngày',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '08:00 - 20:00',
    locationDetails: 'Sảnh tiếp tân Tòa Hi-Tech, Cần Thơ',
    notes: 'Giao dịch giáo trình và phụ kiện KTX',
  },
  {
    id: 'qn-01',
    code: 'QN-01',
    name: 'Sảnh Tòa AI Quy Nhơn',
    campus: 'QN',
    storageCapacity: '20 GB',
    cameras: '2 Cam HD',
    staffCount: '3 cán bộ/ngày',
    status: 'Hoạt động',
    isOperating: true,
    operatingHours: '08:00 - 20:00',
    locationDetails: 'Sảnh Trung tâm Trí tuệ Nhân tạo FPT Quy Nhơn',
    notes: 'Điểm hẹn công nghệ và phụ kiện an toàn',
  },
];

const calculateStats = (items: SafeHandoffHubItem[]): HubStats => ({
  total: items.length,
  operating: items.filter((h) => h.status === 'Hoạt động' && h.isOperating).length,
  maintenance: items.filter((h) => h.status === 'Bảo trì').length,
});

export default function AdminSafeHandoffPage() {
  const [activeTab, setActiveTab] = useState<'hubs' | 'transactions'>('hubs');
  const [hubs, setHubs] = useState<SafeHandoffHubItem[]>(DEFAULT_ADMIN_HUBS);
  const [stats, setStats] = useState<HubStats>(calculateStats(DEFAULT_ADMIN_HUBS));
  const [transactions, setTransactions] = useState<MeetupOrderTransaction[]>([]);
  const [meetupStats, setMeetupStats] = useState<MeetupStats>({ total: 0, completed: 0, pending: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
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
      if (res.hubs && res.hubs.length > 0) {
        setHubs(res.hubs);
        setStats(res.stats || calculateStats(res.hubs));
      } else {
        const filtered = selectedCampus !== 'ALL'
          ? DEFAULT_ADMIN_HUBS.filter((h) => h.campus === selectedCampus)
          : DEFAULT_ADMIN_HUBS;
        setHubs(filtered);
        setStats(calculateStats(filtered));
      }
    } catch (err: any) {
      console.warn('⚠️ [Admin SafeHandoff API]:', err?.message || err);
      const filtered = selectedCampus !== 'ALL'
        ? DEFAULT_ADMIN_HUBS.filter((h) => h.campus === selectedCampus)
        : DEFAULT_ADMIN_HUBS;
      setHubs(filtered);
      setStats(calculateStats(filtered));
      setErrorMsg(err?.message || err?.response?.data?.error?.message || null);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const res = await safehandoffService.getMeetupTransactions({
        campus: selectedCampus !== 'ALL' ? selectedCampus : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setTransactions(res.orders || []);
      setMeetupStats(res.stats || { total: 0, completed: 0, pending: 0, cancelled: 0 });
    } catch (err: any) {
      console.warn('⚠️ [Meetup transactions API]:', err?.message || err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    } else {
      loadHubs();
    }
  }, [selectedCampus, activeTab, statusFilter]);

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
      // Local fallback toggle
      setHubs((prev) =>
        prev.map((h) => {
          if (h.id !== hub.id) return h;
          const newStatus = h.status === 'Hoạt động' ? 'Bảo trì' : 'Hoạt động';
          return { ...h, status: newStatus, isOperating: newStatus === 'Hoạt động' };
        })
      );
      setStats((prev) => {
        const wasOperating = hub.status === 'Hoạt động';
        return {
          ...prev,
          operating: wasOperating ? prev.operating - 1 : prev.operating + 1,
          maintenance: wasOperating ? prev.maintenance + 1 : prev.maintenance - 1,
        };
      });
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
      setHubs((prev) => prev.filter((h) => h.id !== hub.id));
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
        operating: hub.status === 'Hoạt động' ? prev.operating - 1 : prev.operating,
        maintenance: hub.status === 'Bảo trì' ? prev.maintenance - 1 : prev.maintenance,
      }));
    }
  };

  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);
      let created: SafeHandoffHubItem;
      try {
        created = await safehandoffService.createHub(formData);
      } catch (apiErr) {
        created = {
          id: `hub-local-${Date.now()}`,
          ...formData,
          isOperating: formData.status === 'Hoạt động',
          createdAt: new Date().toISOString(),
        };
      }
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
      setErrorMsg(err?.message || err?.response?.data?.error?.message || 'Tạo trạm mới thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayoutShell>
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('hubs')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'hubs'
                ? 'bg-fpt-orange text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>🗺 Mạng lưới Trạm Hub ({hubs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-fpt-orange text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Handshake className="h-4 w-4" />
            <span>🤝 Giám sát Giao dịch Hẹn gặp Meetup ({meetupStats.total || transactions.length})</span>
          </button>
        </div>

        {/* TAB 1: MẠNG LƯỚI TRẠM HUBS */}
        {activeTab === 'hubs' && (
          <>
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
          </>
        )}

        {/* TAB 2: GIÁM SÁT GIAO DỊCH HẸN GẶP MEETUP */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {/* Meetup Transaction Stats */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Giám sát Giao dịch Hẹn gặp Safe-Handoff</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Theo dõi trạng thái đối soát bàn giao qua OTP/QR Handshake, phát hiện boom hẹn và bảo hộ Escrow 48h.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadTransactions}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingTransactions ? 'animate-spin' : ''}`} />
                  <span>Làm mới giao dịch</span>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div className="text-xs text-slate-500">Tổng đơn Meetup</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{meetupStats.total}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Giao dịch trực tiếp 5 Campus</div>
                </div>

                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                  <div className="text-xs text-emerald-800 font-bold">Bàn giao Thành công</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">{meetupStats.completed}</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Đã xác thực OTP / QR Handshake</div>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                  <div className="text-xs text-amber-800 font-bold">Đang chờ Gặp mặt</div>
                  <div className="text-2xl font-black text-amber-700 mt-1">{meetupStats.pending}</div>
                  <div className="text-[10px] text-amber-600 mt-0.5">Chưa nhập OTP / Chưa gặp</div>
                </div>

                <div className="rounded-xl bg-rose-50 border border-rose-100 p-4">
                  <div className="text-xs text-rose-800 font-bold">Đã Hủy / Tranh chấp</div>
                  <div className="text-2xl font-black text-rose-700 mt-1">{meetupStats.cancelled}</div>
                  <div className="text-[10px] text-rose-600 mt-0.5">Bị hủy hoặc có khiếu nại</div>
                </div>
              </div>
            </div>

            {/* Filter Bar for Transactions */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Cơ sở:</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { label: 'Tất cả', value: 'ALL' },
                      { label: 'Hòa Lạc', value: 'HOL' },
                      { label: 'TP.HCM', value: 'HCM' },
                      { label: 'Đà Nẵng', value: 'DAD' },
                      { label: 'Cần Thơ', value: 'CT' },
                      { label: 'Quy Nhơn', value: 'QN' },
                    ].map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setSelectedCampus(c.value)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer transition ${
                          selectedCampus === c.value
                            ? 'bg-fpt-orange text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                  <span className="text-xs font-bold text-slate-700">Trạng thái:</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { label: 'Tất cả', value: 'ALL' },
                      { label: '⏳ Chờ gặp', value: 'PENDING' },
                      { label: '✓ Đã bàn giao', value: 'COMPLETED' },
                      { label: '✗ Đã hủy', value: 'CANCELLED' },
                    ].map((st) => (
                      <button
                        key={st.value}
                        type="button"
                        onClick={() => setStatusFilter(st.value)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer transition ${
                          statusFilter === st.value
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Meetup Orders Feed */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Lịch sử & Nhật ký Giao dịch Hẹn gặp ({transactions.length} đơn)
                </h3>
              </div>

              {loadingTransactions ? (
                <div className="p-8 text-center text-xs text-slate-400">Đang tải lịch sử giao dịch Safe-Handoff...</div>
              ) : transactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Chưa có giao dịch hẹn gặp Safe-Handoff nào phù hợp với bộ lọc này.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {transactions.map((t) => (
                    <div key={t.id} className="p-5 hover:bg-slate-50/50 transition space-y-3">
                      {/* Row 1: Code, Status & Campus */}
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {t.orderCode}
                          </span>
                          <span
                            className={`rounded-full text-[10px] font-extrabold px-2.5 py-0.5 ${
                              t.status === 'COMPLETED' || t.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'CANCELLED' || t.status === 'DISPUTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.status === 'COMPLETED' || t.status === 'DELIVERED'
                              ? '✓ ĐÃ BÀN GIAO HOÀN TẤT'
                              : t.status === 'CANCELLED' || t.status === 'DISPUTED'
                              ? '✗ ĐÃ HỦY / TRANH CHẤP'
                              : '⏳ ĐANG CHỜ GẶP MẶT'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(t.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        {t.payment && (
                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-slate-900">
                              {t.payment.totalAmount.toLocaleString('vi-VN')} đ
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {t.payment.paymentMethod === 'CASH' ? 'Tiền mặt khi gặp' : 'VietQR / PayOS'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Row 2: Location, Buyer & Seller */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        {/* Meetup Location */}
                        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                            <MapPin className="h-3.5 w-3.5 text-fpt-orange" />
                            <span>Địa điểm bàn giao:</span>
                          </div>
                          <div className="font-bold text-slate-800">
                            {t.product?.meetupLocation || `Cơ sở ${CAMPUS_LABELS[t.product?.campus || 'HOL'] || 'FU Campus'}`}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            Món: {t.product?.title || 'Sản phẩm bàn giao'}
                          </div>
                        </div>

                        {/* Buyer */}
                        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                            <Users className="h-3.5 w-3.5 text-blue-600" />
                            <span>Người mua:</span>
                          </div>
                          <div className="font-bold text-slate-800">
                            {t.buyer?.profile?.fullName || t.buyer?.email || 'Người mua'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {t.buyer?.profile?.phoneNumber || t.buyer?.email || '—'}
                          </div>
                        </div>

                        {/* Seller */}
                        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Người bán:</span>
                          </div>
                          <div className="font-bold text-slate-800">
                            {t.seller?.profile?.fullName || t.seller?.email || 'Người bán'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {t.seller?.profile?.phoneNumber || t.seller?.email || '—'}
                          </div>
                        </div>
                      </div>

                      {/* Row 3: OTP Handshake Status */}
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">Mã Handshake OTP:</span>
                          <span className="font-mono font-black text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                            {t.handshake?.handshakeOtp || '****'}
                          </span>
                        </div>

                        <div>
                          {t.handshake?.isVerified ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Đã xác thực OTP bàn giao thành công
                            </span>
                          ) : t.status === 'CANCELLED' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full text-[11px] border border-rose-200">
                              <XCircle className="h-3 w-3" />
                              Giao dịch đã hủy / Boom hẹn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full text-[11px] border border-amber-200">
                              <Clock className="h-3 w-3" />
                              Đang chờ Người bán quét mã / nhập OTP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
