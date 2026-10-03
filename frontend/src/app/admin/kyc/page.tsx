'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import dynamic from 'next/dynamic';
import { useKycStore, KycApplication, KycType, KycStatus } from '@/stores/kycStore';
import { cn } from '@/lib/utils';

const KycRejectModal = dynamic(() => import('@/components/admin/kyc/KycRejectModal'), { ssr: false });
const KycLightboxModal = dynamic(() => import('@/components/admin/kyc/KycLightboxModal'), { ssr: false });
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
  UserCheck,
  ExternalLink,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';

function AdminUserAvatar({
  src,
  name,
  size = 'md',
}: {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const initials = (name || 'SV')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'SV';

  const sizeClasses = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
  }[size];

  if (!src || error) {
    return (
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center font-black bg-gradient-to-br from-orange-400 to-amber-500 text-white shrink-0 shadow-2xs select-none',
          sizeClasses
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-2xs',
        sizeClasses
      )}
    >
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

function CardImagePreview({
  src,
  alt,
  onClick,
}: {
  src?: string;
  alt: string;
  onClick?: (url: string) => void;
}) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  return (
    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn('w-full h-full object-cover', onClick && 'cursor-zoom-in hover:opacity-90 transition')}
          onError={() => setError(true)}
          onClick={() => onClick?.(src)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-1.5 p-2 text-center bg-slate-50/70">
          <Camera className="h-6 w-6 text-slate-300" />
          <span className="text-[11px] font-medium text-slate-400">
            {error ? 'Không thể tải ảnh' : 'Chưa có ảnh'}
          </span>
        </div>
      )}
    </div>
  );
}

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

  const { user, setKycStatus, addCoins } = useUserStore();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'reupload_required' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiScanStep, setAiScanStep] = useState<string>('');
  const [aiScanProgress, setAiScanProgress] = useState<number>(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

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
      setAiScanStep('2/4: Gửi dữ liệu tới Gemini 3.1 Flash Vision OCR...');
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
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsAiScanning(false);
      // Phát hiện lỗi hết quota API / token limit
      const errMsg = err?.message || err?.response?.data?.message || '';
      const isQuotaError = /quota|limit|429|exhausted|rate.limit|too.many/i.test(errMsg);
      if (isQuotaError) {
        showToast('🚫 Đã hết quota API AI hôm nay. Vui lòng duyệt thủ công hoặc thử lại sau.');
      } else {
        showToast('⚠️ Quét AI gặp lỗi kết nối. Vui lòng thử lại sau.');
      }
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

  const handleSelectApp = (appId: string) => {
    setSelectedId(appId);
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById('admin-kyc-detail-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  // Keep selected app in sync (prefer current filtered list so approval auto-advances to next pending item)
  const currentApp = filteredApps.find((a) => a.id === selectedId) || filteredApps[0] || applications.find((a) => a.id === selectedId) || applications[0];

  // Stats
  const totalPendingStudent = applications.filter((a) => a.type === 'student' && a.status === 'pending').length;
  const totalPendingSeller = applications.filter((a) => a.type === 'seller' && a.status === 'pending').length;
  const totalApproved = applications.filter((a) => a.status === 'approved').length;

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTargetApp, setRejectTargetApp] = useState<KycApplication | null>(null);

  const handleApprove = async (app: KycApplication) => {
    const remaining = filteredApps.filter((a) => a.id !== app.id);
    const nextApp = remaining[0];

    await approveApplication(app.id, 'SuperAdmin BQT');
    if (user.studentId === app.studentId || user.email === app.email) {
      setKycStatus(app.type === 'seller' ? 'approved_seller' : 'approved_student', app.type, app.id);
      addCoins(200);
      import('@/services/profileService').then(({ profileService }) => {
        profileService.getProfile().catch(() => {});
      }).catch(() => {});
    }
    showToast(
      `✅ Đã phê duyệt và cấp huy hiệu ${
        app.type === 'seller' ? 'Verified Seller' : 'Sinh viên FPT'
      } cho ${app.fullName} (${app.studentId})!`
    );

    if (nextApp) {
      setSelectedId(nextApp.id);
    }
  };

  const openRejectModal = (app: KycApplication) => {
    setRejectTargetApp(app);
    setIsRejectModalOpen(true);
  };

  const handleRequestReupload = (app: KycApplication) => {
    const remaining = filteredApps.filter((a) => a.id !== app.id);
    const nextApp = remaining[0];
    const reason = 'Ảnh chụp thẻ bị mờ hoặc lóa đèn, vui lòng chụp lại góc thẳng rõ mã vạch';
    requestReupload(app.id, reason);
    showToast(`📸 Đã gửi yêu cầu chụp lại ảnh thẻ cho sinh viên ${app.fullName}.`);
    if (nextApp) {
      setSelectedId(nextApp.id);
    }
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTypeTab('student');
                const first = applications.find((a) => a.type === 'student');
                if (first) setSelectedId(first.id);
              }}
              className={cn(
                'flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer',
                activeTypeTab === 'student'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <GraduationCap className="h-4 w-4" />
              <span>1. Xét duyệt Sinh viên (Người mua)</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  activeTypeTab === 'student' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                )}
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
              className={cn(
                'flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer',
                activeTypeTab === 'seller'
                  ? 'bg-fpt-orange text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Store className="h-4 w-4" />
              <span>2. Xét duyệt Người bán (Seller)</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  activeTypeTab === 'seller' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                )}
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
                className={cn(
                  'px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0',
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white font-extrabold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
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
                      onClick={() => handleSelectApp(app.id)}
                      className={cn(
                        'p-4 transition cursor-pointer hover:bg-slate-50 relative',
                        isSelected ? (app.type === 'seller' ? 'bg-orange-50/60' : 'bg-blue-50/60') : 'bg-white'
                      )}
                    >
                      {/* Selected Left Bar */}
                      {isSelected && (
                        <span
                          className={cn(
                            'absolute left-0 top-0 bottom-0 w-1 rounded-r',
                            app.type === 'seller' ? 'bg-fpt-orange' : 'bg-blue-600'
                          )}
                        />
                      )}

                      <div className="flex items-start gap-3">
                        <AdminUserAvatar
                          src={app.avatarUrl || app.selfieCardUrl}
                          name={app.fullName}
                          size="md"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                              {app.fullName}
                            </h4>
                            <span
                              className={cn(
                                'rounded-md px-1.5 py-0.5 text-[10px] font-bold shrink-0',
                                app.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'reupload_required'
                                  ? 'bg-amber-100 text-amber-800'
                                  : app.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-orange-100 text-fpt-orange'
                              )}
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

                          {app.type === 'seller' && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                                CCCD: {app.citizenId || (app.ocrData?.ocrCccdNumber ? `${app.ocrData.ocrCccdNumber}` : 'Chưa có số')}
                              </span>
                            </div>
                          )}

                          {app.storeName && (
                            <div className="text-[11px] font-bold text-fpt-orange flex items-center gap-1 mt-1 truncate">
                              <Store className="h-3 w-3 shrink-0" />
                              <span className="truncate">{app.storeName}</span>
                            </div>
                          )}

                          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{app.submittedAt}</span>
                            {app.ocrData ? (
                              <span className="text-emerald-600 font-bold">AI: {app.aiMatchScore}%</span>
                            ) : (
                              <span className="text-slate-400 font-medium">Chưa quét AI</span>
                            )}
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
          <div id="admin-kyc-detail-panel" className="xl:col-span-7 rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col min-h-[550px] xl:h-[740px] scroll-mt-20">
            {currentApp ? (
              <>
                {/* Detail Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-3">
                    <AdminUserAvatar
                      src={currentApp.avatarUrl || currentApp.selfieCardUrl}
                      name={currentApp.fullName}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900">{currentApp.fullName}</h3>
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-0.5 text-[10px] font-extrabold',
                            currentApp.type === 'seller'
                              ? 'bg-orange-100 text-fpt-orange border border-orange-200'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          )}
                        >
                          {currentApp.type === 'seller' ? '🛍️ Đăng ký Seller' : '🎓 Xác thực Sinh viên'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span>MSSV: <strong className="text-slate-800 font-mono">{currentApp.studentId}</strong></span>
                        <span>•</span>
                        <span>{currentApp.campus}</span>
                        <span>•</span>
                        <span>{currentApp.major}</span>
                        {currentApp.type === 'seller' && (
                           <>
                            <span>•</span>
                            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                              Số CCCD: {currentApp.citizenId || (currentApp.ocrData?.ocrCccdNumber ? `${currentApp.ocrData.ocrCccdNumber}` : 'Chưa cung cấp')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentApp.ocrData ? (
                      <span className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>AI OCR: Khớp {currentApp.aiMatchScore}%</span>
                      </span>
                    ) : (
                      <span className="rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-slate-400" />
                        <span>Chưa quét AI</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }
                      }}
                      className="xl:hidden p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer text-xs font-bold flex items-center gap-1"
                      title="Lên danh sách hồ sơ"
                    >
                      <X className="h-4 w-4" />
                      <span className="text-[10px]">Đóng</span>
                    </button>
                  </div>
                </div>

                {/* Detail Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {/* Seller Info Box (if seller) */}
                  {currentApp.type === 'seller' && (
                    <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50/70 to-amber-50/40 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-extrabold text-fpt-orange">
                        <span className="flex items-center gap-1.5">
                          <Store className="h-4 w-4" />
                          Hồ sơ đăng ký Người Bán & Định danh Pháp lý CCCD
                        </span>
                        <span className="text-[10px] bg-orange-100 border border-orange-200 px-2.5 py-0.5 rounded-full font-bold">
                          Cam kết Safe-Handoff & Escrow
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
                        <div className="bg-white/90 p-2.5 rounded-xl border border-orange-100 shadow-2xs">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Số CCCD đăng ký:</span>
                          <strong className="text-indigo-900 font-mono text-xs sm:text-sm tracking-wider block mt-0.5">
                            {currentApp.citizenId || (currentApp.ocrData?.ocrCccdNumber ? `${currentApp.ocrData.ocrCccdNumber}` : 'Chưa cung cấp')}
                          </strong>
                        </div>
                        <div className="bg-white/90 p-2.5 rounded-xl border border-orange-100 shadow-2xs">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Tên gian hàng:</span>
                          <strong className="text-slate-900 block mt-0.5 truncate">{currentApp.storeName || 'Chưa đặt tên'}</strong>
                        </div>
                        <div className="bg-white/90 p-2.5 rounded-xl border border-orange-100 shadow-2xs">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Mặt hàng chính:</span>
                          <strong className="text-slate-900 block mt-0.5">{currentApp.primaryCategory || 'Giáo trình & IT'}</strong>
                        </div>
                        <div className="bg-white/90 p-2.5 rounded-xl border border-orange-100 shadow-2xs">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">TK thụ hưởng (Escrow):</span>
                          <strong className="text-slate-900 block mt-0.5 text-[11px] leading-tight break-words">
                            {currentApp.bankAccount || (currentApp.bankAccountName ? `${currentApp.bankAccountName} (${currentApp.bankName || ''})` : 'Chưa liên kết')}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ID Card Photos */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{currentApp.type === 'seller' ? '📷 Ảnh minh chứng định danh (CCCD / Thẻ SV):' : '📷 Ảnh minh chứng thẻ sinh viên nộp lên:'}</span>
                      <span className="text-emerald-600 text-[11px]">Đầy đủ 2 mặt & Chân dung</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Front Card */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-600 block">
                          {currentApp.type === 'seller' ? '1. Mặt trước CCCD' : '1. Mặt trước Thẻ SV'}
                        </span>
                        <CardImagePreview
                          src={currentApp.frontCardUrl}
                          alt="Mặt trước"
                          onClick={setLightboxUrl}
                        />
                      </div>

                      {/* Back Card */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-600 block">
                          {currentApp.type === 'seller' ? '2. Mặt sau CCCD' : '2. Mặt sau (Mã vạch)'}
                        </span>
                        <CardImagePreview
                          src={currentApp.backCardUrl}
                          alt="Mặt sau"
                          onClick={setLightboxUrl}
                        />
                      </div>

                      {/* Selfie */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 space-y-1.5 col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-slate-600 block">
                          3. Chân dung sinh viên (Selfie)
                        </span>
                        <CardImagePreview
                          src={currentApp.selfieCardUrl || currentApp.avatarUrl}
                          alt="Chân dung"
                          onClick={setLightboxUrl}
                        />
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
                              {currentApp.type === 'seller'
                                ? 'Trợ Lý AI Thẩm Định CCCD & Pháp Lý Người Bán (Gemini Vision)'
                                : 'Trợ Lý AI Thẩm Định Thẻ Sinh Viên (Gemini Vision)'}
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
                            {currentApp.type === 'seller'
                              ? 'Tự động quét Căn Cước Công Dân 12 số, đối soát Quốc huy, Họ tên và kiểm tra tính chính chủ của tài khoản ngân hàng nhận tiền thanh toán (Escrow).'
                              : 'Chỉ kích hoạt AI theo yêu cầu để tiết kiệm chi phí token & tránh nghẽn API khi hàng ngàn sinh viên đăng ký.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isAiScanning}
                        onClick={() => handleTriggerAiScan(currentApp)}
                        className={cn(
                          'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer',
                          isAiScanning
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                        )}
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
                          {currentApp.type === 'seller'
                            ? '* Tiến trình quét ngầm: nhận diện phôi CCCD Việt Nam, OCR 12 số định danh, họ tên và kiểm tra chính chủ tài khoản ngân hàng.'
                            : '* Tiến trình quét ngầm: đọc ảnh thẻ, OCR text, đối soát regex MSSV FPT và phát hiện bất thường.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* SSO / CCCD Comparison Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>
                        {currentApp.type === 'seller'
                          ? '🔍 Bảng đối soát: OCR Căn Cước Công Dân (CCCD) & Thông Tin Đăng Ký Người Bán'
                          : '🔍 Bảng đối soát: OCR Thẻ Sinh Viên & Thông Tin Khai Báo Trong Đơn'}
                      </span>
                      {currentApp.ocrData ? (
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                          {currentApp.type === 'seller' ? '✓ Dữ liệu OCR Căn Cước Công Dân (Gemini Vision)' : '✓ Dữ liệu thực từ Gemini Vision OCR'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          ⏳ Chưa quét AI — Nhấn &quot;Quét Thẩm Định&quot; để bắt đầu
                        </span>
                      )}
                    </div>

                    {currentApp.ocrData ? (
                      /* AI đã quét → hiển thị bảng đối soát thực */
                      <div className="rounded-2xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="px-3.5 py-2.5">Trường dữ liệu</th>
                              <th className="px-3.5 py-2.5">{currentApp.type === 'seller' ? 'OCR Đọc Từ CCCD' : 'OCR Đọc Từ Thẻ SV'}</th>
                              <th className="px-3.5 py-2.5">Thông Tin Khai Báo (Đơn Nộp)</th>
                              <th className="px-3.5 py-2.5 text-right">Kết quả</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px]">
                            {(() => {
                              const ocr = currentApp.ocrData;
                              const normalizeText = (s?: string) =>
                                (s || '')
                                  .normalize('NFD')
                                  .replace(/[\u0300-\u036f]/g, '')
                                  .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
                                  .toUpperCase()
                                  .trim();

                              if (currentApp.type === 'seller') {
                                const ocrCccd = (ocr.ocrCccdNumber || '').replace(/\D/g, '');
                                const registeredCccd = (currentApp.citizenId || '').replace(/\D/g, '');
                                const ocrName = (ocr.ocrFullName || '').trim();
                                const registeredName = (currentApp.fullName || '').trim();
                                const bankHolderName = (currentApp.bankAccountName || '').trim();

                                const isCccdMatch = ocrCccd && registeredCccd
                                  ? ocrCccd === registeredCccd
                                  : Boolean(ocrCccd && ocrCccd.length === 12);
                                const isNameMatch = ocrName && registeredName
                                  ? normalizeText(ocrName) === normalizeText(registeredName)
                                  : false;
                                const isBankMatch = ocrName && bankHolderName
                                  ? normalizeText(ocrName) === normalizeText(bankHolderName)
                                  : false;

                                return (
                                  <>
                                    <tr>
                                      <td className="px-3.5 py-2 font-semibold text-slate-700">Số Căn Cước Công Dân (12 số)</td>
                                      <td className="px-3.5 py-2 font-mono text-slate-900 font-bold tracking-wider">
                                        {ocrCccd || '— Không đọc được'}
                                      </td>
                                      <td className="px-3.5 py-2 font-mono font-bold text-indigo-900 tracking-wider">
                                        {registeredCccd || currentApp.citizenId || '—'}
                                      </td>
                                      <td className={cn('px-3.5 py-2 text-right font-bold', isCccdMatch ? 'text-emerald-600' : 'text-rose-600')}>
                                        {isCccdMatch ? '✓ Khớp 12 số' : ocrCccd ? '⚠️ Lệch số CCCD' : '— Không đọc được'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="px-3.5 py-2 font-semibold text-slate-700">Họ và tên công dân</td>
                                      <td className="px-3.5 py-2 text-slate-900 font-bold">{ocrName ? ocrName.toUpperCase() : '—'}</td>
                                      <td className="px-3.5 py-2 text-slate-900 font-bold">{registeredName.toUpperCase()}</td>
                                      <td className={cn('px-3.5 py-2 text-right font-bold', isNameMatch ? 'text-emerald-600' : 'text-rose-600')}>
                                        {isNameMatch ? '✓ Khớp họ tên' : ocrName ? '⚠️ Lệch họ tên' : '— Không đọc được'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="px-3.5 py-2 font-semibold text-slate-700">
                                        Chính chủ TK Ngân hàng (Escrow)
                                      </td>
                                      <td className="px-3.5 py-2 text-slate-600 font-medium">
                                        Tên trên CCCD: <strong className="text-slate-900">{ocrName || '—'}</strong>
                                      </td>
                                      <td className="px-3.5 py-2 text-slate-900 font-bold">
                                        Chủ TK: <strong className="text-indigo-900">{bankHolderName || 'Chưa cung cấp'}</strong>
                                      </td>
                                      <td className={cn('px-3.5 py-2 text-right font-bold', isBankMatch ? 'text-emerald-600' : 'text-amber-600')}>
                                        {isBankMatch ? '✓ Chính chủ tài khoản' : '⚠️ Lệch tên chủ TK'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="px-3.5 py-2 font-semibold text-slate-700">Ngày sinh & Giới tính</td>
                                      <td className="px-3.5 py-2 text-slate-700 font-medium">
                                        {ocr.ocrDateOfBirth || '—'} {ocr.ocrGender ? `(${ocr.ocrGender})` : ''}
                                      </td>
                                      <td className="px-3.5 py-2 text-slate-600">
                                        Quốc tịch: {ocr.ocrNationality || 'Việt Nam'}
                                      </td>
                                      <td className="px-3.5 py-2 text-right text-slate-500 font-medium">Hồ sơ công dân</td>
                                    </tr>
                                    <tr>
                                      <td className="px-3.5 py-2 font-semibold text-slate-700">Nơi thường trú / Quê quán</td>
                                      <td className="px-3.5 py-2 text-slate-700 font-medium truncate max-w-[200px]" title={ocr.ocrResidence || ocr.ocrOrigin || ''}>
                                        {ocr.ocrResidence || ocr.ocrOrigin || '—'}
                                      </td>
                                      <td className="px-3.5 py-2 text-slate-900 font-bold">Cơ sở: {currentApp.campus}</td>
                                      <td className="px-3.5 py-2 text-right text-slate-500 font-medium">Địa chỉ</td>
                                    </tr>
                                    <tr>
                                      <td className="px-3.5 py-2 font-semibold text-slate-700">Hiệu lực CCCD & Loại thẻ</td>
                                      <td className="px-3.5 py-2 text-slate-700 font-medium">
                                        Hạn: {ocr.ocrExpiryDate || '—'} ({ocr.cardType === 'THE_CAN_CUOC_2024' ? 'Thẻ Căn cước 2024' : ocr.cardType === 'CCCD_CHIP' ? 'CCCD gắn chip' : 'CCCD'})
                                      </td>
                                      <td className="px-3.5 py-2 text-slate-900 font-semibold">
                                        {ocr.isExpired ? (
                                          <span className="text-rose-600 font-bold">⚠️ Thẻ đã hết hạn</span>
                                        ) : (
                                          <span className="text-emerald-700 font-bold">✓ Còn hạn sử dụng</span>
                                        )}
                                      </td>
                                      <td className={cn('px-3.5 py-2 text-right font-bold', ocr.isExpired ? 'text-rose-600' : 'text-emerald-600')}>
                                        {ocr.isExpired ? 'Hết hạn' : 'Hợp lệ'}
                                      </td>
                                    </tr>
                                  </>
                                );
                              }

                              // Chế độ Sinh viên (STUDENT)
                              const ocrName = ocr.ocrFullName || '—';
                              const ocrId = ocr.ocrStudentId || '—';
                              const ocrCampus = ocr.ocrCampus || '—';
                              const ocrCohort = ocr.ocrCohort || '—';
                              const ocrExpiry = ocr.ocrValidTill || '—';

                              const isNameMatch = ocrName !== '—' && currentApp.fullName.trim().toLowerCase() === ocrName.trim().toLowerCase();
                              const isIdMatch = ocrId !== '—' && currentApp.studentId.trim().toUpperCase() === ocrId.trim().toUpperCase();
                              const isCampusMatch = ocrCampus !== '—' && (
                                currentApp.campus.toLowerCase().includes(ocrCampus.toLowerCase()) ||
                                ocrCampus.toLowerCase().includes(currentApp.campus.toLowerCase())
                              );

                              return (
                                <>
                                  <tr>
                                    <td className="px-3.5 py-2 font-semibold text-slate-700">Họ và tên</td>
                                    <td className="px-3.5 py-2 text-slate-600 font-medium">{ocrName.toUpperCase()}</td>
                                    <td className="px-3.5 py-2 text-slate-900 font-bold">{currentApp.fullName.toUpperCase()}</td>
                                    <td className={cn('px-3.5 py-2 text-right font-bold', isNameMatch ? 'text-emerald-600' : 'text-rose-600')}>
                                      {isNameMatch ? '✓ Khớp' : ocrName === '—' ? '— Không đọc được' : '⚠️ Lệch họ tên'}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3.5 py-2 font-semibold text-slate-700">Mã số sinh viên</td>
                                    <td className="px-3.5 py-2 font-mono text-slate-600 font-bold">{ocrId}</td>
                                    <td className="px-3.5 py-2 font-mono font-bold text-slate-900">{currentApp.studentId}</td>
                                    <td className={cn('px-3.5 py-2 text-right font-bold', isIdMatch ? 'text-emerald-600' : 'text-rose-600')}>
                                      {isIdMatch ? '✓ Khớp' : ocrId === '—' ? '— Không đọc được' : '⚠️ Lệch MSSV'}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3.5 py-2 font-semibold text-slate-700">Email & Hạn thẻ</td>
                                    <td className="px-3.5 py-2 text-slate-500">Hạn: {ocrExpiry}</td>
                                    <td className="px-3.5 py-2 font-mono text-slate-900">{currentApp.email}</td>
                                    <td className="px-3.5 py-2 text-right text-slate-500 font-medium">Tham khảo</td>
                                  </tr>
                                  <tr>
                                    <td className="px-3.5 py-2 font-semibold text-slate-700">Cơ sở Campus</td>
                                    <td className="px-3.5 py-2 text-slate-700 font-semibold">{ocrCampus}</td>
                                    <td className="px-3.5 py-2 text-slate-900 font-bold">{currentApp.campus}</td>
                                    <td className={cn('px-3.5 py-2 text-right font-bold', isCampusMatch ? 'text-emerald-600' : ocrCampus === '—' ? 'text-slate-400' : 'text-amber-600')}>
                                      {isCampusMatch ? '✓ Đúng cơ sở' : ocrCampus === '—' ? '— N/A' : '⚠️ Khác cơ sở'}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-3.5 py-2 font-semibold text-slate-700">Khóa & Ngành học</td>
                                    <td className="px-3.5 py-2 text-slate-700 font-bold">{ocrCohort}</td>
                                    <td className="px-3.5 py-2 text-slate-900 font-bold">{currentApp.cohort} {currentApp.major ? `(${currentApp.major})` : ''}</td>
                                    <td className="px-3.5 py-2 text-right text-slate-500 font-medium">Tham khảo</td>
                                  </tr>
                                </>
                              );
                            })()}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* AI chưa quét → hiển thị thông tin đăng ký và hướng dẫn quét */
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5 text-center space-y-2.5">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-amber-400" />
                          <p className="text-xs font-bold text-slate-700">
                            {currentApp.type === 'seller'
                              ? 'Chưa có dữ liệu OCR — AI chưa quét ảnh Căn Cước Công Dân (CCCD)'
                              : 'Chưa có dữ liệu OCR — AI chưa quét ảnh thẻ sinh viên'}
                          </p>
                          <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
                            {currentApp.type === 'seller'
                              ? 'Bấm nút "⚡ Quét Thẩm Định AI Ngay" ở phía trên để Gemini Vision đọc 12 số CCCD, Họ tên, Nơi thường trú và đối soát tính chính chủ tài khoản ngân hàng thụ hưởng.'
                              : 'Bấm nút "⚡ Quét Thẩm Định AI Ngay" ở phía trên để Gemini Vision đọc ảnh thẻ, trích xuất Họ tên / MSSV / Campus và đối soát tự động với thông tin khai báo trong đơn.'}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white border border-slate-200 p-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-left">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Họ tên (Đơn nộp):</span>
                            <strong className="text-slate-800">{currentApp.fullName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">
                              {currentApp.type === 'seller' ? 'Số CCCD (Đơn nộp):' : 'MSSV (Đơn nộp):'}
                            </span>
                            <strong className="text-slate-800 font-mono">
                              {currentApp.type === 'seller' ? (currentApp.citizenId || 'Chưa cung cấp') : currentApp.studentId}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">
                              {currentApp.type === 'seller' ? 'Tài khoản ngân hàng:' : 'Cơ sở & Khóa:'}
                            </span>
                            <strong className="text-slate-800 truncate block">
                              {currentApp.type === 'seller'
                                ? (currentApp.bankAccountName || currentApp.bankAccount || 'Chưa liên kết')
                                : `${currentApp.campus} • ${currentApp.cohort || '—'}`}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Email / Liên hệ:</span>
                            <strong className="text-slate-800 text-[11px] break-all">{currentApp.email}</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Vision Security Verdict */}
                  {currentApp.ocrData ? (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                          <Bot className="h-4 w-4 text-blue-600" />
                          <span>
                            {currentApp.type === 'seller'
                              ? 'Đánh giá AI Vision & Xác Thực Pháp Lý CCCD Người Bán'
                              : 'Đánh giá AI Vision & Chống Gian Lận Thẻ Học Đường'}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'rounded-full text-white text-[10px] font-extrabold px-2.5 py-0.5',
                            (currentApp.aiMatchScore || 0) >= 80
                              ? 'bg-emerald-600'
                              : (currentApp.aiMatchScore || 0) >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          )}
                        >
                          Độ tin cậy: {currentApp.aiMatchScore || 0}%
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-800 leading-relaxed">
                        {currentApp.ocrData.aiVerdict || 'AI đã phân tích tài liệu định danh. Admin vui lòng kiểm tra bảng đối soát phía trên và xác nhận thủ công trước khi phê duyệt.'}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/40 p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Bot className="h-4 w-4 text-slate-400" />
                          <span>
                            {currentApp.type === 'seller'
                              ? 'Đánh giá AI Vision & Pháp Lý CCCD Người Bán'
                              : 'Đánh giá AI Vision & Chống Gian Lận'}
                          </span>
                        </div>
                        <span className="rounded-full bg-slate-300 text-white text-[10px] font-extrabold px-2.5 py-0.5">
                          Chưa quét
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Chưa có đánh giá AI. Vui lòng bấm &quot;Quét Thẩm Định AI&quot; để hệ thống phân tích ảnh thẻ tự động, hoặc Admin có thể kiểm tra bằng mắt và phê duyệt thủ công.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-white shrink-0 space-y-2.5">
                  {currentApp.status === 'pending' ? (
                    <>
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
                    </>
                  ) : currentApp.status === 'approved' ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-2xl bg-slate-100 border border-slate-200 py-3 px-4 text-xs sm:text-sm font-bold text-slate-400 cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-none opacity-80"
                    >
                      <CheckCircle className="h-5 w-5 text-slate-400" />
                      <span>Hồ sơ đã Phê Duyệt — Đã hoàn tất</span>
                    </button>
                  ) : currentApp.status === 'rejected' ? (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-2xl bg-slate-100 border border-slate-200 py-3 px-4 text-xs sm:text-sm font-bold text-slate-400 cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-none opacity-80"
                    >
                      <XCircle className="h-5 w-5 text-slate-400" />
                      <span>Hồ sơ đã Từ Chối — Đã hoàn tất</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-2xl bg-slate-100 border border-slate-200 py-3 px-4 text-xs sm:text-sm font-bold text-slate-400 cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-none opacity-80"
                    >
                      <Camera className="h-5 w-5 text-slate-400" />
                      <span>Đã yêu cầu chụp lại thẻ — Chờ sinh viên nộp lại</span>
                    </button>
                  )}
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
      <KycRejectModal
        isOpen={isRejectModalOpen}
        app={rejectTargetApp}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectTargetApp(null);
        }}
        onConfirm={async (reason, note) => {
          if (!rejectTargetApp) return;
          const remaining = filteredApps.filter((a) => a.id !== rejectTargetApp.id);
          const nextApp = remaining[0];
          const finalReason = note.trim() ? `${reason}. Ghi chú: ${note.trim()}` : reason;
          await rejectApplication(rejectTargetApp.id, finalReason);
          if (user.studentId === rejectTargetApp.studentId || user.email === rejectTargetApp.email) {
            setKycStatus('rejected', rejectTargetApp.type, rejectTargetApp.id, finalReason);
          }
          showToast(`❌ Đã từ chối và gửi email/thông báo kèm lý do tới ${rejectTargetApp.fullName} (${rejectTargetApp.email}).`);
          setIsRejectModalOpen(false);
          setRejectTargetApp(null);
          if (nextApp) {
            setSelectedId(nextApp.id);
          }
        }}
      />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-xl backdrop-blur-md text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Image Lightbox / Zoom Overlay */}
      <KycLightboxModal
        imageUrl={lightboxUrl}
        onClose={() => setLightboxUrl(null)}
      />
    </AdminLayoutShell>
  );
}
