'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import { useDisputeStore, DisputeItem, DisputeStatus } from '@/stores/disputeStore';
import { reportService, BackendReport } from '@/services/reportService';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  DollarSign,
  Eye,
  X,
  Package,
  Shield,
  User,
  Video,
  Camera,
  ExternalLink,
  Search,
  Filter,
  Clock,
  ShieldCheck,
  Scale,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  Building2,
  ArrowRight,
  HelpCircle,
  SlidersHorizontal,
} from 'lucide-react';

const isVideoProofUrl = (url?: string) => {
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  if (url.startsWith('data:image/')) return false;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.includes('/video/')
  );
};

const formatDateSafe = (dateVal?: string | null) => {
  if (!dateVal) return 'Chưa cập nhật';
  if (dateVal.includes('/') && dateVal.includes(':')) {
    return dateVal;
  }
  const parsed = new Date(dateVal);
  if (isNaN(parsed.getTime())) {
    return dateVal;
  }
  return parsed.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminReportsPage() {
  const { disputes, fetchDisputes, resolveDisputeByAdmin, isLoading: storeLoading } = useDisputeStore();

  const [activeTab, setActiveTab] = useState<'disputes' | 'reports'>('disputes');
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [safetyRate, setSafetyRate] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [campusFilter, setCampusFilter] = useState<string>('ALL');

  // Modal & Processing state
  const [selectedDisputeForModal, setSelectedDisputeForModal] = useState<DisputeItem | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Action confirmation dialog
  const [confirmAction, setConfirmAction] = useState<{
    dispute: DisputeItem;
    action: 'REFUND' | 'REJECT';
  } | null>(null);
  const [actionNote, setActionNote] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      const [reportsRes, analyticsRes] = await Promise.allSettled([
        reportService.getReports(),
        reportService.getSemesterAnalytics(),
      ]);
      if (reportsRes.status === 'fulfilled') {
        setReports(reportsRes.value.reports || []);
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.metrics?.safetyRate !== undefined) {
        setSafetyRate(analyticsRes.value.metrics.safetyRate);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDisputes();
    loadData();
  }, [fetchDisputes]);

  // Statistics calculation
  const stats = useMemo(() => {
    const pendingDisputes = disputes.filter((d) => d.status === 'PENDING').length;
    const refundedDisputes = disputes.filter((d) => d.status === 'REFUNDED').length;
    const rejectedDisputes = disputes.filter((d) => d.status === 'REJECTED').length;
    const pendingReports = reports.filter((r) => r.status === 'PENDING').length;

    const totalEscrowHold = disputes
      .filter((d) => d.status === 'PENDING')
      .reduce((sum, d) => sum + (d.refundAmount || 0), 0);

    return {
      pendingDisputes,
      refundedDisputes,
      rejectedDisputes,
      pendingReports,
      totalEscrowHold,
    };
  }, [disputes, reports]);

  // Filtered Disputes
  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && d.status !== statusFilter) {
        return false;
      }
      // 2. Campus Filter
      if (campusFilter !== 'ALL') {
        const campus = d.orderRaw?.buyer?.profile?.campus || d.orderRaw?.seller?.profile?.campus;
        if (campus !== campusFilter) return false;
      }
      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = d.orderCode.toLowerCase().includes(q);
        const matchReason = d.reason.toLowerCase().includes(q);
        const matchDetails = (d.details || '').toLowerCase().includes(q);
        const matchBuyer = (d.orderRaw?.buyer?.profile?.fullName || d.claimantName || '').toLowerCase().includes(q);
        const matchSeller = (d.orderRaw?.seller?.profile?.fullName || d.orderRaw?.seller?.email || '').toLowerCase().includes(q);
        const matchProduct = (d.orderRaw?.product?.title || '').toLowerCase().includes(q);
        if (!matchCode && !matchReason && !matchDetails && !matchBuyer && !matchSeller && !matchProduct) {
          return false;
        }
      }
      return true;
    });
  }, [disputes, statusFilter, campusFilter, searchQuery]);

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchReason = (r.reason || '').toLowerCase().includes(q);
        const matchDetails = (r.details || '').toLowerCase().includes(q);
        const matchTarget = (r.targetId || '').toLowerCase().includes(q);
        const matchReporter = (r.reporter?.profile?.fullName || r.reporter?.email || '').toLowerCase().includes(q);
        if (!matchReason && !matchDetails && !matchTarget && !matchReporter) {
          return false;
        }
      }
      return true;
    });
  }, [reports, statusFilter, searchQuery]);

  const handleOpenActionConfirm = (dispute: DisputeItem, action: 'REFUND' | 'REJECT') => {
    setConfirmAction({ dispute, action });
    setActionNote(
      action === 'REFUND'
        ? 'Đã đối soát video mở hộp & xác thực lỗi sản phẩm. Chấp thuận hoàn lại tiền Escrow cho Người mua.'
        : 'Đã đối soát bằng chứng: Không phát hiện lỗi kỹ thuật hoặc khiếu nại không đủ căn cứ. Giải ngân tiền cho Người bán.'
    );
  };

  const handleExecuteAction = async () => {
    if (!confirmAction) return;
    const { dispute, action } = confirmAction;
    setIsProcessing(dispute.id);
    try {
      const res = await resolveDisputeByAdmin(dispute.id, action, actionNote);
      showToast(res.message || 'Xử lý khiếu nại thành công');
      setConfirmAction(null);
      if (selectedDisputeForModal?.id === dispute.id) {
        setSelectedDisputeForModal(null);
      }
    } catch {
      showToast('Có lỗi xảy ra khi xử lý khiếu nại. Vui lòng thử lại!');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleResolveReport = async (reportId: string, action: 'BAN_USER' | 'HIDE_PRODUCT' | 'DISMISS') => {
    setIsProcessing(reportId);
    try {
      await reportService.resolveReport(reportId, { action, adminNote: 'Xử lý bởi BQT FPT 5Campus' });
      const actionLabels = {
        BAN_USER: 'Đã khóa tài khoản sinh viên vi phạm thành công',
        HIDE_PRODUCT: 'Đã ẩn bài đăng vi phạm khỏi sàn thành công',
        DISMISS: 'Đã bỏ qua báo cáo vi phạm',
      };
      showToast(actionLabels[action]);
      loadData();
    } catch {
      showToast(`Đã xử lý đối với báo cáo #${reportId}.`);
    } finally {
      setIsProcessing(null);
    }
  };

  const renderStatusBadge = (status: DisputeStatus | string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Chờ phân xử
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Đã hoàn tiền
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3 text-rose-600" />
            BQT bác bỏ
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Đã rút đơn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <AdminLayoutShell>
      <div className="space-y-6 max-w-full font-sans pb-12">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold border border-red-100 mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>BẢO HỘ GIAO DỊCH ESCROW 48H</span>
                <span className="text-red-300">•</span>
                <span className="text-slate-500 font-medium">Hệ thống FPT 5Campus Sentinel</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Quản lý Khiếu nại Tranh chấp & Vi phạm
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Đối soát video unbox & bằng chứng kỹ thuật, giải phóng hoặc hoàn tiền quỹ Escrow và xử lý báo cáo vi phạm trên toàn bộ 5 Campus FPT.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  fetchDisputes();
                  loadData();
                  showToast('Đã làm mới dữ liệu khiếu nại & báo cáo');
                }}
                disabled={storeLoading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs disabled:opacity-60"
              >
                <RotateCcw className={`h-3.5 w-3.5 text-slate-500 ${storeLoading ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Pending */}
            <div className="rounded-xl border border-amber-200/80 bg-linear-to-br from-amber-50/60 to-orange-50/40 p-4 transition hover:shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>Chờ phân xử SLA &lt;24h</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-2">
                {stats.pendingDisputes.toString().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-amber-700/90 mt-1 font-medium">
                {stats.totalEscrowHold > 0
                  ? `Đang giữ: ${stats.totalEscrowHold.toLocaleString('vi-VN')} đ`
                  : 'Không có tiền ký quỹ pending'}
              </div>
            </div>

            {/* Card 2: Refunded */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 transition hover:shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Đã bảo vệ hoàn tiền</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-2">
                {stats.refundedDisputes.toString().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-emerald-700/90 mt-1 font-medium">
                Hoàn trả người mua do lỗi hàng
              </div>
            </div>

            {/* Card 3: Rejected */}
            <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 transition hover:shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                <span>Bác bỏ & Trả Seller</span>
                <Scale className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-950 mt-2">
                {stats.rejectedDisputes.toString().padStart(2, '0')}
              </div>
              <div className="text-[11px] text-blue-700/90 mt-1 font-medium">
                Giải ngân hợp lệ cho người bán
              </div>
            </div>

            {/* Card 4: Safety Index */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Chỉ số an toàn Escrow</span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {safetyRate}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                Tỷ lệ đơn hàng an toàn không tranh chấp
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Top Bar: Tabs & Quick Switch */}
          <div className="border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('disputes');
                  setStatusFilter('ALL');
                }}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'disputes'
                    ? 'bg-fpt-orange text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Scale className="h-3.5 w-3.5" />
                <span>Khiếu nại Tranh chấp Escrow</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    activeTab === 'disputes' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {disputes.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('reports');
                  setStatusFilter('ALL');
                }}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-fpt-orange text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Báo cáo Vi phạm</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    activeTab === 'reports' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {reports.length}
                </span>
              </button>
            </div>

            {/* Filter pills by Status */}
            {activeTab === 'disputes' && (
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'PENDING', label: `Chờ duyệt (${stats.pendingDisputes})` },
                  { key: 'REFUNDED', label: 'Đã hoàn tiền' },
                  { key: 'REJECTED', label: 'Bác bỏ' },
                  { key: 'CANCELLED', label: 'Đã rút đơn' },
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setStatusFilter(st.key)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer whitespace-nowrap ${
                      statusFilter === st.key
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'disputes'
                    ? 'Tìm theo mã đơn (#ORD), người mua, lý do...'
                    : 'Tìm theo lý do, người báo cáo...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:bg-white focus:border-fpt-orange transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {activeTab === 'disputes' && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Cơ sở:</span>
                </div>
                <select
                  value={campusFilter}
                  onChange={(e) => setCampusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-fpt-orange transition"
                >
                  <option value="ALL">Tất cả Campus FPT</option>
                  <option value="HOL">Hòa Lạc (HOL)</option>
                  <option value="HCM">TP. Hồ Chí Minh (HCM)</option>
                  <option value="DAD">Đà Nẵng (DAD)</option>
                  <option value="QN">Quy Nhơn (QN)</option>
                  <option value="CT">Cần Thơ (CT)</option>
                </select>
              </div>
            )}
          </div>

          {/* TAB 1: DISPUTES TABLE */}
          {activeTab === 'disputes' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Mã Đơn & Ngày tạo</th>
                    <th className="py-3.5 px-4">Các bên tham gia</th>
                    <th className="py-3.5 px-4">Sản phẩm & Tiền ký quỹ</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Lý do & Bằng chứng</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Thao tác phán quyết</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredDisputes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <Scale className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-700">Không tìm thấy khiếu nại tranh chấp nào</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {disputes.length === 0
                            ? 'Hiện tại hệ thống không có khiếu nại nào cần giải quyết.'
                            : 'Không có khiếu nại nào khớp với bộ lọc tìm kiếm hiện tại.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredDisputes.map((d) => {
                      const buyerName = d.orderRaw?.buyer?.profile?.fullName || d.claimantName || 'Sinh viên';
                      const buyerEmail = d.orderRaw?.buyer?.email || '';
                      const buyerCampus = d.orderRaw?.buyer?.profile?.campus || 'FU';
                      const sellerName = d.orderRaw?.seller?.profile?.fullName || d.orderRaw?.seller?.email || 'Người bán';
                      const sellerCampus = d.orderRaw?.seller?.profile?.campus || 'FU';
                      const productTitle = d.orderRaw?.product?.title || 'Sản phẩm bàn giao';
                      const isVideo = isVideoProofUrl(d.proofVideoUrl);

                      return (
                        <tr
                          key={d.id}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => setSelectedDisputeForModal(d)}
                        >
                          {/* Col 1: Order Code & Date */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                              {d.orderCode}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span>{formatDateSafe(d.createdAt)}</span>
                            </div>
                            {d.orderRaw?.orderType === 'MEETUP' && (
                              <span className="inline-block mt-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                🤝 Safe-Handoff KTX
                              </span>
                            )}
                          </td>

                          {/* Col 2: Parties (Buyer vs Seller) */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                  Mua
                                </span>
                                <span className="font-bold text-slate-900 truncate max-w-[140px]" title={buyerName}>
                                  {buyerName}
                                </span>
                                <span className="text-[10px] text-slate-400">({buyerCampus})</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  Bán
                                </span>
                                <span className="font-medium text-slate-700 truncate max-w-[140px]" title={sellerName}>
                                  {sellerName}
                                </span>
                                <span className="text-[10px] text-slate-400">({sellerCampus})</span>
                              </div>
                            </div>
                          </td>

                          {/* Col 3: Product & Amount */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-medium text-slate-900 line-clamp-2 max-w-[200px]" title={productTitle}>
                              {productTitle}
                            </div>
                            <div className="mt-1 flex items-baseline gap-1">
                              <span className="text-sm font-black text-rose-600">
                                {(d.refundAmount || 0).toLocaleString('vi-VN')} đ
                              </span>
                              <span className="text-[10px] text-slate-400">Escrow</span>
                            </div>
                          </td>

                          {/* Col 4: Reason & Proof */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-bold text-slate-900 line-clamp-1">{d.reason}</div>
                            {d.details && (
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                                {d.details}
                              </p>
                            )}

                            {/* Proof Link Pill */}
                            {d.proofVideoUrl && (
                              <div className="mt-2">
                                <a
                                  href={d.proofVideoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-200 text-fpt-orange font-bold text-[11px] hover:bg-orange-100 transition"
                                >
                                  {isVideo ? <Video className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                                  <span>{isVideo ? 'Video unbox & test' : 'Ảnh lỗi máy'}</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              </div>
                            )}

                            {/* Admin Note if resolved */}
                            {d.adminNote && (
                              <div className="mt-2 text-[10px] text-slate-600 bg-slate-100/70 p-1.5 rounded-lg border border-slate-200 line-clamp-1">
                                <span className="font-bold">📝 Note:</span> {d.adminNote}
                              </div>
                            )}
                          </td>

                          {/* Col 5: Status */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            {renderStatusBadge(d.status)}
                          </td>

                          {/* Col 6: Actions */}
                          <td
                            className="py-3.5 px-4 align-top text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedDisputeForModal(d)}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
                                title="Xem hồ sơ đối soát chi tiết"
                              >
                                <Eye className="h-3.5 w-3.5 text-slate-500" />
                                <span>Chi tiết</span>
                              </button>

                              {d.status === 'PENDING' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isProcessing === d.id}
                                    onClick={() => handleOpenActionConfirm(d, 'REJECT')}
                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition cursor-pointer disabled:opacity-50"
                                    title="Bác đơn & Giải ngân Người bán"
                                  >
                                    <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                                    <span>Bác đơn</span>
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isProcessing === d.id}
                                    onClick={() => handleOpenActionConfirm(d, 'REFUND')}
                                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs disabled:opacity-50"
                                    title="Chấp thuận Hoàn tiền Người mua"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Hoàn tiền</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: REPORTS TABLE */}
          {activeTab === 'reports' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Mã BC & Ngày tạo</th>
                    <th className="py-3.5 px-4">Người gửi báo cáo</th>
                    <th className="py-3.5 px-4">Đối tượng vi phạm</th>
                    <th className="py-3.5 px-4 min-w-[260px]">Lý do & Mô tả vi phạm</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-right">Xử lý chế tài</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <AlertTriangle className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-700">Không có báo cáo vi phạm nào</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Toàn bộ bài đăng và hoạt động mua bán của sinh viên hiện đang tuân thủ nội quy.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((r) => {
                      const reporterName = r.reporter?.profile?.fullName || r.reporter?.email || 'Sinh viên';
                      const campus = r.reporter?.profile?.campus || 'FU Campus';

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 align-top font-mono font-bold text-slate-700">
                            #{r.id.slice(-6).toUpperCase()}
                            <div className="text-[11px] text-slate-400 font-sans font-normal mt-0.5">
                              {formatDateSafe(r.createdAt)}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="font-bold text-slate-900">{reporterName}</div>
                            <div className="text-[11px] text-slate-400">{campus}</div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.targetType === 'PRODUCT'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {r.targetType === 'PRODUCT' ? '📦 Tin đăng bài' : '👤 Người dùng'}
                            </span>
                            <div className="font-mono text-xs text-slate-600 mt-1">
                              #{r.targetId.slice(-8).toUpperCase()}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="font-bold text-slate-900">{r.reason}</div>
                            {r.details && (
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                                {r.details}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'PENDING'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {r.status === 'PENDING' ? '⏳ Chờ xử lý' : '✓ Đã giải quyết'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                            {r.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  disabled={isProcessing === r.id}
                                  onClick={() => handleResolveReport(r.id, 'DISMISS')}
                                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                >
                                  Bỏ qua
                                </button>
                                <button
                                  type="button"
                                  disabled={isProcessing === r.id}
                                  onClick={() => handleResolveReport(r.id, 'HIDE_PRODUCT')}
                                  className="rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                                >
                                  Ẩn bài
                                </button>
                                <button
                                  type="button"
                                  disabled={isProcessing === r.id}
                                  onClick={() => handleResolveReport(r.id, 'BAN_USER')}
                                  className="rounded-xl bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer shadow-2xs"
                                >
                                  Khóa TK
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Không cần thao tác</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DIALOG XÁC NHẬN PHÁN QUYẾT NHANH (Confirm Modal with Note input) */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                        confirmAction.action === 'REFUND'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {confirmAction.action === 'REFUND' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {confirmAction.action === 'REFUND'
                          ? 'Chấp thuận Hoàn tiền Người mua'
                          : 'Bác bỏ Khiếu nại & Giải ngân'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Đơn hàng {confirmAction.dispute.orderCode} • Quỹ Escrow:{' '}
                        <span className="font-bold text-rose-600">
                          {(confirmAction.dispute.refundAmount || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmAction(null)}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs space-y-1 text-slate-600">
                  <div>
                    <span className="font-bold text-slate-800">Lý do khiếu nại: </span>
                    <span>{confirmAction.dispute.reason}</span>
                  </div>
                  {confirmAction.dispute.details && (
                    <p className="text-slate-500 italic">"{confirmAction.dispute.details}"</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Ghi chú phán quyết của Ban Quản Trị (sẽ gửi thông báo đến các bên):
                  </label>
                  <textarea
                    rows={3}
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-fpt-orange resize-none"
                    placeholder="Nhập căn cứ phán quyết hoặc ghi chú..."
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  disabled={isProcessing === confirmAction.dispute.id}
                  onClick={handleExecuteAction}
                  className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                    confirmAction.action === 'REFUND'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isProcessing === confirmAction.dispute.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : confirmAction.action === 'REFUND' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <DollarSign className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {confirmAction.action === 'REFUND'
                      ? 'Xác nhận Hoàn tiền Escrow'
                      : 'Xác nhận Bác đơn & Giải ngân'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CHI TIẾT ĐỐI SOÁT & XEM BẰNG CHỨNG VIDEO */}
        {selectedDisputeForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/90">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-orange-100 text-fpt-orange flex items-center justify-center shrink-0">
                    <Scale className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">
                        Hồ sơ Khiếu nại {selectedDisputeForModal.orderCode}
                      </h3>
                      {renderStatusBadge(selectedDisputeForModal.status)}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Gửi lúc: {formatDateSafe(selectedDisputeForModal.createdAt)} • Ký quỹ bảo hộ Escrow FPT 48h
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDisputeForModal(null)}
                  className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                {/* 1. Mua vs Bán Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Buyer */}
                  <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-200/70 pb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Thông tin Người mua (Bên khiếu nại)</span>
                    </div>
                    <div className="space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Họ và tên:</span>
                        <span className="font-bold text-slate-900">
                          {selectedDisputeForModal.orderRaw?.buyer?.profile?.fullName || selectedDisputeForModal.claimantName || 'Sinh viên'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-medium text-slate-800">
                          {selectedDisputeForModal.orderRaw?.buyer?.email || 'Chưa cập nhật'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Điện thoại:</span>
                        <span className="font-semibold text-slate-800">
                          {selectedDisputeForModal.orderRaw?.buyer?.profile?.phoneNumber || 'Chưa cập nhật'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cơ sở Campus:</span>
                        <span className="font-medium text-slate-800">
                          {selectedDisputeForModal.orderRaw?.buyer?.profile?.campus || 'FU Campus'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Điểm uy tín:</span>
                        <span className="font-bold text-emerald-600">
                          {selectedDisputeForModal.orderRaw?.buyer?.profile?.reputationScore ?? 100} điểm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seller */}
                  <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-200/70 pb-2">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <span>Thông tin Người bán (Bị khiếu nại)</span>
                    </div>
                    <div className="space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Họ và tên:</span>
                        <span className="font-bold text-slate-900">
                          {selectedDisputeForModal.orderRaw?.seller?.profile?.fullName || selectedDisputeForModal.orderRaw?.seller?.email || 'Người bán'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-medium text-slate-800">
                          {selectedDisputeForModal.orderRaw?.seller?.email || 'Chưa cập nhật'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Điện thoại:</span>
                        <span className="font-semibold text-slate-800">
                          {selectedDisputeForModal.orderRaw?.seller?.profile?.phoneNumber || 'Chưa cập nhật'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cơ sở Campus:</span>
                        <span className="font-medium text-slate-800">
                          {selectedDisputeForModal.orderRaw?.seller?.profile?.campus || 'FU Campus'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Điểm uy tín:</span>
                        <span className="font-bold text-emerald-600">
                          {selectedDisputeForModal.orderRaw?.seller?.profile?.reputationScore ?? 100} điểm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Sản phẩm & Ký quỹ */}
                <div className="rounded-2xl border border-slate-200 p-4 bg-white space-y-3">
                  <div className="font-bold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-fpt-orange" />
                      <span>Thông tin Giao dịch & Ký quỹ Escrow</span>
                    </span>
                    <span className="text-xs font-black text-rose-600">
                      {(selectedDisputeForModal.refundAmount || 0).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                    <div>
                      <div className="text-slate-400">Tên món đồ:</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {selectedDisputeForModal.orderRaw?.product?.title || 'Sản phẩm bàn giao'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Hình thức giao dịch:</div>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {selectedDisputeForModal.orderRaw?.orderType === 'MEETUP'
                          ? `🤝 Safe-Handoff Hẹn gặp (${selectedDisputeForModal.orderRaw?.product?.meetupLocation || 'Điểm hẹn trạm KTX'})`
                          : '🚚 Giao tận nơi Ship COD'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Phương thức thanh toán:</div>
                      <div className="font-medium text-slate-800 mt-0.5">
                        {selectedDisputeForModal.orderRaw?.payment?.paymentMethod || 'VietQR / PayOS'} •{' '}
                        {selectedDisputeForModal.orderRaw?.payment?.isPaid ? 'Đã ký quỹ Escrow' : 'Chưa xác thực'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Thời hạn bao test (Warranty):</div>
                      <div className="font-medium text-slate-800 mt-0.5">
                        {selectedDisputeForModal.orderRaw?.warrantyHours || 24} giờ bảo hộ
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Bằng chứng kiểm tra thực tế & Video test */}
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-3">
                  <div className="font-bold text-amber-950 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Nội dung Khiếu nại & Bằng chứng kỹ thuật</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-900">
                      Lý do: {selectedDisputeForModal.reason}
                    </div>
                    {selectedDisputeForModal.details && (
                      <p className="text-slate-700 bg-white/90 p-3 rounded-xl border border-amber-200/80 leading-relaxed font-normal">
                        {selectedDisputeForModal.details}
                      </p>
                    )}
                  </div>

                  {/* Video / Image Proof Player */}
                  {selectedDisputeForModal.proofVideoUrl && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          {isVideoProofUrl(selectedDisputeForModal.proofVideoUrl) ? (
                            <Video className="h-4 w-4 text-fpt-orange" />
                          ) : (
                            <Camera className="h-4 w-4 text-fpt-orange" />
                          )}
                          <span>
                            {isVideoProofUrl(selectedDisputeForModal.proofVideoUrl)
                              ? 'Video quay cận cảnh mở hộp / test lỗi:'
                              : 'Hình ảnh bằng chứng kiểm tra lỗi:'}
                          </span>
                        </span>
                        <a
                          href={selectedDisputeForModal.proofVideoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-fpt-orange hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>Mở trong tab mới</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-80 w-full flex items-center justify-center border border-slate-200 shadow-inner">
                        {isVideoProofUrl(selectedDisputeForModal.proofVideoUrl) ? (
                          <video
                            src={selectedDisputeForModal.proofVideoUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img
                            src={selectedDisputeForModal.proofVideoUrl}
                            alt="Bằng chứng khiếu nại"
                            className="w-full h-full object-contain cursor-pointer hover:scale-105 transition"
                            onClick={() => window.open(selectedDisputeForModal.proofVideoUrl, '_blank')}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Ghi chú phán quyết nếu đã xử lý */}
                {selectedDisputeForModal.adminNote && (
                  <div
                    className={`rounded-2xl border p-4 space-y-1.5 ${
                      selectedDisputeForModal.status === 'CANCELLED'
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : selectedDisputeForModal.status === 'REFUNDED'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 text-xs">
                      <FileText className="h-4 w-4" />
                      <span>
                        {selectedDisputeForModal.status === 'CANCELLED'
                          ? 'Lý do người mua rút khiếu nại'
                          : 'Ghi chú phán quyết của BQT FPT'}
                      </span>
                    </div>
                    <p className="leading-relaxed bg-white/80 p-3 rounded-xl border border-slate-200/60 font-medium">
                      {selectedDisputeForModal.adminNote}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedDisputeForModal(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Đóng hồ sơ
                </button>

                {selectedDisputeForModal.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isProcessing === selectedDisputeForModal.id}
                      onClick={() => handleOpenActionConfirm(selectedDisputeForModal, 'REJECT')}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Bác đơn & Giải ngân Người bán</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing === selectedDisputeForModal.id}
                      onClick={() => handleOpenActionConfirm(selectedDisputeForModal, 'REFUND')}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Chấp thuận Hoàn tiền Người mua</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white px-5 py-3 shadow-xl backdrop-blur-md text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </AdminLayoutShell>
  );
}
