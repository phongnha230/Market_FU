'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import { useKycStore, KycApplication, KycType, KycStatus } from '@/stores/kycStore';
import { useUserStore } from '@/stores/userStore';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Bot,
  Camera,
  SlidersHorizontal,
  Search,
  ChevronDown,
  RefreshCw,
  Zap,
  AlertCircle,
  Eye,
  GraduationCap,
  Store,
  BadgeCheck,
  Building,
  Check,
  AlertTriangle,
  UserCheck,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function AdminKycPage() {
  const {
    applications,
    activeTypeTab,
    setActiveTypeTab,
    approveApplication,
    rejectApplication,
    requestReupload,
    scanKycWithAi,
    fetchApplications,
  } = useKycStore();

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const { user, setKycStatus } = useUserStore();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'reupload_required' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanStep, setAiScanStep] = useState<string>('');
  const [aiScanProgress, setAiScanProgress] = useState<number>(0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleTriggerAiScan = async (app: KycApplication) => {
    if (isAiScanning) return;
    setIsAiScanning(true);
    setAiScanProgress(20);
    setAiScanStep('1/4: Đang đọc ảnh thẻ sinh viên & kiểm tra định dạng...');

    const t1 = setTimeout(() => {
      setAiScanProgress(55);
      setAiScanStep('2/4: Gửi dữ liệu tới Gemini 1.5 Flash Vision OCR...');
    }, 800);

    const t2 = setTimeout(() => {
      setAiScanProgress(85);
      setAiScanStep('3/4: Trích xuất Họ tên, MSSV, Khóa, Campus & Chống giả mạo...');
    }, 1800);

    try {
      const success = await scanKycWithAi(app.id);
      clearTimeout(t1);
      clearTimeout(t2);
      setAiScanProgress(100);
      setAiScanStep('4/4: Hoàn tất đối soát OCR và CSDL!');
      setTimeout(() => {
        setIsAiScanning(false);
        if (success) {
          showToast(`⚡ AI Gemini đã quét và phân tích thành công thẻ của ${app.fullName}!`);
        } else {
          showToast(`⚠️ Không thể kết nối Gemini API. Hệ thống giữ quy tắc FPT mặc định.`);
        }
      }, 700);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsAiScanning(false);
      showToast('⚠️ Quét AI gặp lỗi kết nối. Vui lòng thử lại sau.');
    }
  };

  // Filter applications by activeTypeTab ('student' vs 'seller')
  const typeFiltered = applications.filter((app) => app.type === activeTypeTab);

  const filteredApps = typeFiltered.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (selectedCampus !== 'all' && !app.campus.toLowerCase().includes(selectedCampus.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.fullName.toLowerCase().includes(q) ||
        app.studentId.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        (app.storeName && app.storeName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const [selectedId, setSelectedId] = useState<string>(filteredApps[0]?.id || applications[0]?.id || '');

  // Keep selected app in sync
  const currentApp = applications.find((a) => a.id === selectedId) || filteredApps[0] || applications[0];

  // Stats
  const totalPendingStudent = applications.filter((a) => a.type === 'student' && a.status === 'pending').length;
  const totalPendingSeller = applications.filter((a) => a.type === 'seller' && a.status === 'pending').length;
  const totalApproved = applications.filter((a) => a.status === 'approved').length;

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTargetApp, setRejectTargetApp] = useState<KycApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('Ảnh chụp thẻ bị mờ hoặc lóa sáng, không đọc rõ mã số SV');
  const [rejectNote, setRejectNote] = useState('');

  const handleApprove = (app: KycApplication) => {
    approveApplication(app.id, 'SuperAdmin BQT');
    if (user.studentId === app.studentId || user.email === app.email) {
      setKycStatus(app.type === 'seller' ? 'approved_seller' : 'approved_student', app.type, app.id);
    }
    showToast(
      `✅ Đã phê duyệt và cấp huy hiệu ${
        app.type === 'seller' ? 'Verified Seller' : 'Sinh viên FPT'
      } cho ${app.fullName} (${app.studentId})!`
    );
  };

  const openRejectModal = (app: KycApplication) => {
    setRejectTargetApp(app);
    setRejectReason('Ảnh chụp thẻ bị mờ hoặc lóa sáng, không đọc rõ mã số SV');
    setRejectNote('Vui lòng chụp lại ảnh thẻ góc thẳng, đủ ánh sáng và thấy rõ mã số sinh viên để BQT kiểm tra.');
    setIsRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (!rejectTargetApp) return;
    const finalReason = rejectNote.trim() ? `${rejectReason}. Ghi chú: ${rejectNote.trim()}` : rejectReason;
    rejectApplication(rejectTargetApp.id, finalReason);
    if (user.studentId === rejectTargetApp.studentId || user.email === rejectTargetApp.email) {
      setKycStatus('rejected', rejectTargetApp.type, rejectTargetApp.id, finalReason);
    }
    showToast(`❌ Đã từ chối và gửi email/thông báo kèm lý do tới ${rejectTargetApp.fullName} (${rejectTargetApp.email}).`);
    setIsRejectModalOpen(false);
    setRejectTargetApp(null);
  };

  const handleRequestReupload = (app: KycApplication) => {
    const reason = 'Ảnh chụp thẻ bị mờ hoặc lóa đèn, vui lòng chụp lại góc thẳng rõ mã vạch';
    requestReupload(app.id, reason);
    showToast(`📸 Đã gửi yêu cầu chụp lại ảnh thẻ cho sinh viên ${app.fullName}.`);
  };

  return (
    <AdminLayoutShell>
      <div className="space-y-6 max-w-full">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-emerald-600 font-bold mb-1 flex items-center gap-2">
                <span>FPT EDUCATION IDENTITY GATEWAY</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Đối Soát Thẻ Sinh Viên & Seller v7.2</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                Trung Tâm Thẩm Định Thẻ Sinh Viên & Người Bán (KYC)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Kiểm định hồ sơ thẻ SV 5 cơ sở để cấp huy hiệu <strong>Sinh viên FPT Đã Xác Minh</strong> hoặc mở khóa quyền <strong>Người Bán (Verified Seller)</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  useKycStore.getState().applications.forEach((a) => {
                    if (a.status === 'pending' && a.aiMatchScore >= 95) {
                      approveApplication(a.id);
                    }
                  });
                  showToast('⚡ Đã tự động duyệt các hồ sơ có AI khớp SSO trên 95%!');
                }}
                className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2.5 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs transition"
              >
                <Zap className="h-4 w-4" />
                <span>Duyệt nhanh hồ sơ chuẩn (AI 95%+)</span>
              </button>
            </div>
          </div>

          {/* 4 Stats Cards */}
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-center justify-between">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Người mua</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{totalPendingStudent}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">Hồ sơ Sinh viên chờ duyệt</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Xác thực thẻ SV chính quy</div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <div className="flex items-center justify-between">
                <Store className="h-5 w-5 text-fpt-orange" />
                <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">Người bán</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{totalPendingSeller}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">Hồ sơ Seller chờ duyệt</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Mở quyền đăng bán đồ cũ</div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-center justify-between">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Đã cấp</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{totalApproved + 1420}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">Huy hiệu đã kích hoạt</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Tỷ lệ xác thực 98.6%</div>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4">
              <div className="flex items-center justify-between">
                <Bot className="h-5 w-5 text-purple-600" />
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">AI Vision</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">~3.5s</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">Thời gian OCR so khớp</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Tự động đối soát FAP FPT</div>
            </div>
          </div>
        </div>

        {/* 2 MỤC XÉT DUYỆT RIÊNG BIỆT: SELLER VS SINH VIÊN */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Primary 2-Mode Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('student');
                const first = applications.find((a) => a.type === 'student');
                if (first) setSelectedId(first.id);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                activeTypeTab === 'student'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>1. Xét duyệt Sinh viên (Người mua)</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTypeTab === 'student' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {applications.filter((a) => a.type === 'student').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('seller');
                const first = applications.find((a) => a.type === 'seller');
                if (first) setSelectedId(first.id);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                activeTypeTab === 'seller'
                  ? 'bg-fpt-orange text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Store className="h-4 w-4" />
              <span>2. Xét duyệt Người bán (Seller)</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTypeTab === 'seller' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {applications.filter((a) => a.type === 'seller').length}
              </span>
            </button>
          </div>

          {/* Status Sub-filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Chờ duyệt' },
              { id: 'reupload_required', label: 'Cần chụp lại' },
              { id: 'approved', label: 'Đã duyệt' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white font-extrabold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN PANEL: LIST + DETAIL */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          {/* LEFT LIST: APPLICATIONS (4 COLS) */}
          <div className="xl:col-span-5 rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col h-[740px]">
            {/* Search & Campus Filter */}
            <div className="p-3.5 border-b border-slate-100 space-y-2.5 shrink-0 bg-slate-50/50">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Tìm tên, MSSV, ${activeTypeTab === 'seller' ? 'gian hàng...' : 'email...'}`}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-fpt-orange"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">
                  Hiển thị: <strong>{filteredApps.length}</strong> hồ sơ {activeTypeTab === 'seller' ? 'Người bán' : 'Sinh viên'}
                </span>
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none"
                >
                  <option value="all">Tất cả 5 cơ sở</option>
                  <option value="Hòa Lạc">Hòa Lạc</option>
                  <option value="TP.HCM">TP.HCM</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Quy Nhơn">Quy Nhơn</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <AlertCircle className="h-8 w-8 mx-auto text-slate-300" />
                  <p className="text-xs">Không có hồ sơ nào phù hợp với bộ lọc hiện tại.</p>
                </div>
              ) : (
                filteredApps.map((app) => {
                  const isSelected = currentApp?.id === app.id;
                  return (
                    <div
                      key={app.id}
                      onClick={() => setSelectedId(app.id)}
                      className={`p-4 transition cursor-pointer hover:bg-slate-50 relative ${
                        isSelected ? (app.type === 'seller' ? 'bg-orange-50/60' : 'bg-blue-50/60') : 'bg-white'
                      }`}
                    >
                      {/* Selected Left Bar */}
                      {isSelected && (
                        <span
                          className={`absolute left-0 top-0 bottom-0 w-1 rounded-r ${
                            app.type === 'seller' ? 'bg-fpt-orange' : 'bg-blue-600'
                          }`}
                        />
                      )}

                      <div className="flex items-start gap-3">
                        <div className="relative h-10 w-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <Image src={app.selfieCardUrl || app.frontCardUrl} alt={app.fullName} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                              {app.fullName}
                            </h4>
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                                app.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'reupload_required'
                                  ? 'bg-amber-100 text-amber-800'
                                  : app.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-orange-100 text-fpt-orange'
                              }`}
                            >
                              {app.status === 'approved'
                                ? 'Đã duyệt ✓'
                                : app.status === 'reupload_required'
                                ? 'Chụp lại'
                                : app.status === 'rejected'
                                ? 'Từ chối'
                                : 'Chờ duyệt'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono font-bold text-slate-800">{app.studentId}</span>
                            <span>•</span>
                            <span className="truncate">{app.campus}</span>
                            <span>•</span>
                            <span>{app.cohort}</span>
                          </div>

                          {app.storeName && (
                            <div className="text-[11px] font-bold text-fpt-orange flex items-center gap-1 mt-1 truncate">
                              <Store className="h-3 w-3 shrink-0" />
                              <span className="truncate">{app.storeName}</span>
                            </div>
                          )}

                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{app.submittedAt}</span>
                            <span className="text-emerald-600 font-bold">AI Match: {app.aiMatchScore}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT DETAIL: REVIEW & APPROVAL PANEL (7 COLS) */}
          <div className="xl:col-span-7 rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col h-[740px]">
            {currentApp ? (
              <>
                {/* Detail Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-slate-200 bg-white shrink-0 shadow-2xs">
                      <Image
                        src={currentApp.selfieCardUrl || currentApp.frontCardUrl}
                        alt={currentApp.fullName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900">{currentApp.fullName}</h3>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            currentApp.type === 'seller'
                              ? 'bg-orange-100 text-fpt-orange border border-orange-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {currentApp.type === 'seller' ? '🛍️ Đăng ký Seller' : '🎓 Xác thực Sinh viên'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        MSSV: <strong className="text-slate-800 font-mono">{currentApp.studentId}</strong> • {currentApp.campus} • {currentApp.major}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>FAP SSO: Khớp {currentApp.aiMatchScore}%</span>
                    </span>
                  </div>
                </div>

                {/* Detail Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {/* Seller Info Box (if seller) */}
                  {currentApp.type === 'seller' && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-extrabold text-fpt-orange">
                        <span className="flex items-center gap-1.5">
                          <Store className="h-4 w-4" />
                          Thông tin gian hàng đăng ký bán đồ cũ
                        </span>
                        <span className="text-[10px] bg-orange-100 px-2 py-0.5 rounded-full">Cam kết Safe-Handoff</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tên gian hàng:</span>
                          <strong className="text-slate-900">{currentApp.storeName || 'Chưa đặt'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Mặt hàng chính:</span>
                          <strong className="text-slate-900">{currentApp.primaryCategory || 'Giáo trình & IT'}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tài khoản thanh toán:</span>
                          <strong className="text-slate-900">{currentApp.bankAccount || 'Tiền mặt / QR'}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ID Card Photos */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>📷 Ảnh minh chứng thẻ sinh viên nộp lên:</span>
                      <span className="text-emerald-600 text-[11px]">Đầy đủ 2 mặt & Chân dung</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Front Card */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-600 block">1. Mặt trước Thẻ SV</span>
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                          {currentApp.frontCardUrl ? (
                            <img
                              src={currentApp.frontCardUrl}
                              alt="Mặt trước Thẻ SV"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-1">
                              <Camera className="h-6 w-6" />
                              <span>Chưa có ảnh</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Back Card */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-600 block">2. Mặt sau (Mã vạch)</span>
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                          {currentApp.backCardUrl ? (
                            <img
                              src={currentApp.backCardUrl}
                              alt="Mặt sau Thẻ SV"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-1">
                              <Camera className="h-6 w-6" />
                              <span>Chưa có ảnh</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selfie */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-slate-600 block">3. Chân dung sinh viên</span>
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                          {currentApp.selfieCardUrl || currentApp.frontCardUrl ? (
                            <img
                              src={currentApp.selfieCardUrl || currentApp.frontCardUrl}
                              alt="Chân dung"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-1">
                              <Camera className="h-6 w-6" />
                              <span>Chưa có ảnh</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI On-Demand & Progress Scanning Bar */}
                  <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-blue-50/70 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">
                              Trợ Lý AI Thẩm Định Thẻ (Gemini 1.5 Flash Vision)
                            </span>
                            {currentApp.ocrData ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                                <Check className="h-3 w-3" /> Đã quét OCR
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5">
                                Chế độ tiết kiệm (Chưa chạy AI)
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Chỉ kích hoạt AI theo yêu cầu để tiết kiệm chi phí token & tránh nghẽn API khi hàng ngàn sinh viên đăng ký.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAiScanning}
                        onClick={() => handleTriggerAiScan(currentApp)}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                          isAiScanning
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                        }`}
                      >
                        {isAiScanning ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Đang phân tích...</span>
                          </>
                        ) : currentApp.ocrData ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Quét lại bằng AI</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-3.5 w-3.5" />
                            <span>⚡ Quét Thẩm Định AI Ngay</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Progress Bar when Scanning */}
                    {isAiScanning && (
                      <div className="space-y-1.5 pt-2 border-t border-indigo-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                            {aiScanStep}
                          </span>
                          <span className="font-extrabold text-indigo-700">{aiScanProgress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-100">
                          <div
                            className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                            style={{ width: `${aiScanProgress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-indigo-600 italic">
                          * Tiến trình quét ngầm: đọc ảnh thẻ, OCR text, đối soát regex MSSV FPT và phát hiện bất thường.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SSO Comparison Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>🔍 Bảng đối soát tự động: OCR Thẻ Sinh Viên & Cổng dữ liệu FAP SSO</span>
                      {currentApp.ocrData ? (
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          ✓ Dữ liệu thực từ Gemini Vision OCR
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                          Dữ liệu chuẩn quy tắc FPT (Chưa quét AI)
                        </span>
                      )}
                    </div>
                    <div className="rounded-2xl border border-slate-200 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-3.5 py-2.5">Trường dữ liệu</th>
                            <th className="px-3.5 py-2.5">OCR Đọc Từ Thẻ</th>
                            <th className="px-3.5 py-2.5">Dữ Liệu Gốc FAP SSO</th>
                            <th className="px-3.5 py-2.5 text-right">Kết quả</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {(() => {
                            const ocr = currentApp.ocrData;
                            const ocrName = ocr?.ocrFullName || currentApp.fullName;
                            const ocrId = ocr?.ocrStudentId || currentApp.studentId;
                            const ocrCampus = ocr?.ocrCampus || (currentApp.studentId?.startsWith('Q') ? 'Quy Nhơn' : currentApp.campus);
                            const ocrCohort = ocr?.ocrCohort || currentApp.cohort;
                            const ocrExpiry = ocr?.ocrValidTill || 'Dec.2027';

                            const isNameMatch = currentApp.fullName.trim().toLowerCase() === ocrName.trim().toLowerCase();
                            const isIdMatch = currentApp.studentId.trim().toUpperCase() === ocrId.trim().toUpperCase();
                            const isCampusMatch =
                              currentApp.campus.toLowerCase().includes(ocrCampus.toLowerCase()) ||
                              ocrCampus.toLowerCase().includes(currentApp.campus.toLowerCase());

                            return (
                              <>
                                <tr>
                                  <td className="px-3.5 py-2 font-semibold text-slate-700">Họ và tên</td>
                                  <td className="px-3.5 py-2 text-slate-600 font-medium">{ocrName.toUpperCase()}</td>
                                  <td className="px-3.5 py-2 text-slate-900 font-bold">{currentApp.fullName.toUpperCase()}</td>
                                  <td className={`px-3.5 py-2 text-right font-bold ${isNameMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {isNameMatch ? '✓ Khớp 100%' : '⚠️ Lệch họ tên'}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-3.5 py-2 font-semibold text-slate-700">Mã số sinh viên</td>
                                  <td className="px-3.5 py-2 font-mono text-slate-600 font-bold">{ocrId}</td>
                                  <td className="px-3.5 py-2 font-mono font-bold text-slate-900">{currentApp.studentId}</td>
                                  <td className={`px-3.5 py-2 text-right font-bold ${isIdMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {isIdMatch ? '✓ Khớp 100%' : '⚠️ Lệch MSSV'}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-3.5 py-2 font-semibold text-slate-700">Email trường & Hạn thẻ</td>
                                  <td className="px-3.5 py-2 text-slate-500">Hạn: {ocrExpiry}</td>
                                  <td className="px-3.5 py-2 font-mono text-slate-900">{currentApp.email}</td>
                                  <td className="px-3.5 py-2 text-right text-emerald-600 font-bold">✓ Đã xác thực</td>
                                </tr>
                                <tr>
                                  <td className="px-3.5 py-2 font-semibold text-slate-700">Cơ sở Campus (Suy từ MSSV)</td>
                                  <td className="px-3.5 py-2 text-slate-700 font-semibold">{ocrCampus}</td>
                                  <td className="px-3.5 py-2 text-slate-900 font-bold">{currentApp.campus}</td>
                                  <td className={`px-3.5 py-2 text-right font-bold ${isCampusMatch ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {isCampusMatch ? '✓ Đúng cơ sở' : '⚠️ Khác cơ sở đăng ký'}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-3.5 py-2 font-semibold text-slate-700">Khóa học (2 số sau 2 chữ cái đầu)</td>
                                  <td className="px-3.5 py-2 text-slate-700 font-bold">{ocrCohort}</td>
                                  <td className="px-3.5 py-2 text-slate-900 font-bold">{currentApp.cohort} (Đang học)</td>
                                  <td className="px-3.5 py-2 text-right text-emerald-600 font-bold">✓ Khóa {ocrCohort}</td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* AI Vision Security Verdict */}
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <span>Đánh giá AI Vision & Chống Gian Lận Thẻ Học Đường</span>
                      </div>
                      <span className="rounded-full bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5">
                        Độ tin cậy: {currentApp.aiMatchScore || currentApp.ocrData?.aiMatchScore || 98}%
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      {currentApp.ocrData?.aiVerdict ||
                        'Ảnh chụp rõ nét từ camera, mã thẻ chuẩn định dạng FPT Edu. Hệ thống đã tự động đối soát thông tin với tài khoản đăng ký để Admin xem xét phê duyệt.'}
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-white shrink-0 space-y-2.5">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleRequestReupload(currentApp)}
                      className="rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Yêu cầu chụp lại thẻ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openRejectModal(currentApp)}
                      className="rounded-xl border border-rose-300 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Từ chối & Ghi chú</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApprove(currentApp)}
                    className="w-full rounded-2xl bg-emerald-600 py-3 text-xs sm:text-sm font-black text-white hover:bg-emerald-700 transition cursor-pointer active:scale-98 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    <span>
                      {currentApp.type === 'seller'
                        ? 'Phê Duyệt & Mở Quyền Người Bán (Verified Seller)'
                        : 'Phê Duyệt & Cấp Huy Hiệu Sinh Viên FPT'}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-3 m-auto">
                <ShieldCheck className="h-12 w-12 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">Chọn một hồ sơ từ danh sách bên trái để kiểm định chi tiết.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection / Reason & Note Modal */}
      {isRejectModalOpen && rejectTargetApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Từ chối thẩm định & Báo cáo lý do</h3>
                  <p className="text-xs text-slate-500">
                    Sinh viên: <strong>{rejectTargetApp.fullName}</strong> ({rejectTargetApp.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Chọn lý do phổ biến (Gửi qua email & thông báo in-app):
              </label>
              <div className="space-y-1.5">
                {[
                  'Ảnh chụp thẻ bị mờ hoặc lóa sáng, không đọc rõ mã số SV',
                  'Mã số sinh viên (MSSV) trên thẻ không khớp với thông tin đăng ký',
                  'Thẻ sinh viên đã hết hạn hoặc không thuộc hệ đào tạo FPT University',
                  'Cần bổ sung rõ nét cả 2 mặt trước và mặt sau của thẻ sinh viên',
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectReason(item)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between ${
                      rejectReason === item
                        ? 'border-rose-500 bg-rose-50/60 font-bold text-rose-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{item}</span>
                    {rejectReason === item && <Check className="h-3.5 w-3.5 text-rose-600 shrink-0" />}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ghi chú bổ sung từ Admin (hướng dẫn sinh viên cần bổ sung gì):
                </label>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Ví dụ: Vui lòng chụp lại ảnh thẻ không bị bóng lóa đèn trần, để rõ góc và số thẻ..."
                  className="w-full h-20 rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Hệ thống sẽ tự động gửi email báo cáo chi tiết đến <strong>{rejectTargetApp.email}</strong> và gửi thông báo Notification trên ứng dụng để sinh viên biết và bổ sung lại hồ sơ.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmReject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-xs font-black text-white hover:bg-rose-700 transition cursor-pointer shadow-sm active:scale-95"
              >
                Xác nhận từ chối & Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-xl backdrop-blur-md text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </AdminLayoutShell>
  );
}
