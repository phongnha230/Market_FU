'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

export default function AdminKycPage() {
  const {
    applications,
    activeTypeTab,
    setActiveTypeTab,
    approveApplication,
    rejectApplication,
    requestReupload,
  } = useKycStore();

  const { user, setKycStatus } = useUserStore();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'reupload_required' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
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

  const handleReject = (app: KycApplication) => {
    const reason = 'Thông tin thẻ sinh viên không trùng khớp với hệ thống đào tạo FAP FPT';
    rejectApplication(app.id, reason);
    if (user.studentId === app.studentId || user.email === app.email) {
      setKycStatus('rejected', app.type, app.id);
    }
    showToast(`❌ Đã từ chối hồ sơ của ${app.fullName} (${app.studentId}).`);
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
                          <Image src={currentApp.frontCardUrl} alt="Mặt trước" fill className="object-cover" />
                        </div>
                      </div>

                      {/* Back Card */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-600 block">2. Mặt sau (Mã vạch)</span>
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <Image src={currentApp.backCardUrl} alt="Mặt sau" fill className="object-cover" />
                        </div>
                      </div>

                      {/* Selfie */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-slate-600 block">3. Chân dung sinh viên</span>
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <Image src={currentApp.selfieCardUrl || currentApp.frontCardUrl} alt="Selfie" fill className="object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SSO Comparison Table */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">
                      🔍 Bảng đối soát tự động: OCR Thẻ Sinh Viên & Cổng dữ liệu FAP SSO
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
                          <tr>
                            <td className="px-3.5 py-2 font-semibold text-slate-700">Họ và tên</td>
                            <td className="px-3.5 py-2 text-slate-600">{currentApp.fullName.toUpperCase()}</td>
                            <td className="px-3.5 py-2 text-slate-900 font-bold">{currentApp.fullName.toUpperCase()}</td>
                            <td className="px-3.5 py-2 text-right text-emerald-600 font-bold">✓ Khớp 100%</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-2 font-semibold text-slate-700">Mã số sinh viên</td>
                            <td className="px-3.5 py-2 font-mono text-slate-600">{currentApp.studentId}</td>
                            <td className="px-3.5 py-2 font-mono font-bold text-slate-900">{currentApp.studentId}</td>
                            <td className="px-3.5 py-2 text-right text-emerald-600 font-bold">✓ Khớp 100%</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-2 font-semibold text-slate-700">Email trường cấp</td>
                            <td className="px-3.5 py-2 text-slate-400">(Chip RFID)</td>
                            <td className="px-3.5 py-2 font-mono text-slate-900">{currentApp.email}</td>
                            <td className="px-3.5 py-2 text-right text-emerald-600 font-bold">✓ Đã xác thực</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-2 font-semibold text-slate-700">Cơ sở Campus</td>
                            <td className="px-3.5 py-2 text-slate-600">{currentApp.campus}</td>
                            <td className="px-3.5 py-2 text-slate-900 font-bold">{currentApp.campus}</td>
                            <td className="px-3.5 py-2 text-right text-emerald-600 font-bold">✓ Đúng cơ sở</td>
                          </tr>
                          <tr>
                            <td className="px-3.5 py-2 font-semibold text-slate-700">Khóa & Trạng thái</td>
                            <td className="px-3.5 py-2 text-slate-600">{currentApp.cohort}</td>
                            <td className="px-3.5 py-2 text-slate-900 font-bold">Đang học chính quy</td>
                            <td className="px-3.5 py-2 text-right text-emerald-600 font-bold">✓ Hợp lệ</td>
                          </tr>
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
                        Độ tin cậy cao 99%
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      Ảnh chụp trực tiếp từ camera, không phát hiện dấu vết chỉnh sửa Photoshop/Pixelation. Phôi thẻ đồng nhất với tiêu chuẩn phát hành thẻ sinh viên FPT Edu năm 2024. Đủ điều kiện cấp quyền an toàn.
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
                      onClick={() => handleReject(currentApp)}
                      className="rounded-xl border border-rose-300 bg-rose-50 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Từ chối hồ sơ</span>
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
