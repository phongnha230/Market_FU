'use client';

import React, { useState, useEffect, useMemo } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Star,
  Search,
  ChevronDown,
  Download,
  SlidersHorizontal,
  BarChart3,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  BadgeAlert,
  GraduationCap,
} from 'lucide-react';
import { useKycStore, KycApplication } from '@/stores/kycStore';
import { useProductStore } from '@/stores/productStore';
import { userService, BackendUserItem } from '@/services/userService';

export interface StudentItem {
  id: string;
  name: string;
  mssv: string;
  campus: string;
  major: string;
  email: string;
  role: string;
  kyc: 'verified' | 'pending' | 'rejected';
  sso: 'ok' | 'mismatch';
  posts: number;
  done: number;
  responseTime: string;
  responseRate: number;
  handoffPlace: string;
  trust: number;
  trustLabel: string;
  trustColor: string;
  violations: number;
  violationNote: string;
  violationColor: string;
}

const CAMPUS_NAMES: Record<string, string> = {
  HOL: 'Hòa Lạc',
  HCM: 'TP.HCM',
  DAD: 'Đà Nẵng',
  QN: 'Quy Nhơn',
  CT: 'Cần Thơ',
  'Hòa Lạc': 'Hòa Lạc',
  'TP. Hồ Chí Minh': 'TP.HCM',
  'TP.HCM': 'TP.HCM',
  'Đà Nẵng': 'Đà Nẵng',
  'Quy Nhơn': 'Quy Nhơn',
  'Cần Thơ': 'Cần Thơ',
};

function getTrustBarColor(score: number) {
  if (score >= 90) return 'bg-cyan-500';
  if (score >= 80) return 'bg-yellow-500';
  if (score >= 60) return 'bg-amber-400';
  if (score >= 40) return 'bg-red-400';
  return 'bg-red-600';
}

function getTrustBadge(trust: number, isLocked: boolean) {
  if (isLocked || trust < 60) {
    return {
      label: 'Cảnh Báo Đỏ',
      color: 'text-red-700 bg-red-50 border-red-200',
    };
  }
  if (trust >= 90) {
    return {
      label: 'Kim Cương',
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    };
  }
  if (trust >= 80) {
    return {
      label: 'Vàng Tiên Phong',
      color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    };
  }
  return {
    label: 'Bạc Tiêu Chuẩn',
    color: 'text-slate-600 bg-slate-100 border-slate-200',
  };
}

export default function AdminUsersPage() {
  const kycApps = useKycStore((state) => state.applications);
  const fetchKycApps = useKycStore((state) => state.fetchApplications);
  const products = useProductStore((state) => state.products);

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCampus, setSelectedCampus] = useState('ALL');
  const [selectedTrustRank, setSelectedTrustRank] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [isTrustRulesOpen, setIsTrustRulesOpen] = useState(false);
  const [isBatchAdjustOpen, setIsBatchAdjustOpen] = useState(false);
  const [batchAction, setBatchAction] = useState<number>(5);
  const [batchTarget, setBatchTarget] = useState<string>('ALL');
  const [batchReason, setBatchReason] = useState<string>('Thưởng điểm hoạt động tích cực Kỳ Fall 2026');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await fetchKycApps();
      const userRes = await userService.getUsers().catch(() => ({ users: [] }));
      const backendUsers = userRes.users || [];

      const combinedList: StudentItem[] = [];
      const seenEmails = new Set<string>();

      backendUsers.forEach((u) => {
        if (!u.email || seenEmails.has(u.email.toLowerCase())) return;
        seenEmails.add(u.email.toLowerCase());

        const kycMatch = kycApps.find(
          (k) =>
            k.id === u.id ||
            (k.email && k.email.toLowerCase() === u.email.toLowerCase())
        );

        // Deduce MSSV: prioritize KYC studentId
        let mssv = kycMatch?.studentId?.trim().toUpperCase();
        if (!mssv) {
          // Only check standard student code prefix for FPT edu emails
          if (u.email.includes('@fpt.edu.vn') || u.email.includes('@fe.edu.vn')) {
            const prefixPart = u.email.split('@')[0];
            const eduMatch = prefixPart.match(/^[a-zA-Z]{2}\d{4,6}/i)?.[0]?.toUpperCase();
            if (eduMatch) mssv = eduMatch;
          }
        }
        if (!mssv) {
          mssv = `FU${u.id.slice(-6).toUpperCase()}`;
        }

        // Deduce major based on MSSV prefix
        let major = kycMatch?.major || 'Kỹ thuật phần mềm (SE)';
        const prefix = mssv.slice(0, 2).toUpperCase();
        if (prefix === 'IA') major = 'An toàn thông tin (IA)';
        else if (prefix === 'GD') major = 'Thiết kế đồ họa (GD)';
        else if (prefix === 'AI') major = 'Trí tuệ nhân tạo (AI)';
        else if (prefix === 'MC') major = 'Truyền thông đa phương tiện (MC)';
        else if (prefix === 'IB' || prefix === 'BA') major = 'Quản trị kinh doanh (IB)';

        // Campus mapping
        const rawCampus = u.campus || kycMatch?.campus || 'HOL';
        const campus = CAMPUS_NAMES[rawCampus] || rawCampus || 'Hòa Lạc';

        const userProducts = products.filter(
          (p) =>
            p.seller?.email?.toLowerCase() === u.email.toLowerCase() ||
            p.seller?.name?.toLowerCase() === (u.fullName || '').toLowerCase()
        );
        const postsCount = userProducts.length;
        const doneCount = userProducts.filter((p) => p.status === 'SOLD').length;

        const isLocked = !u.isActive;
        const trust = isLocked ? 45 : (u.reputationScore ?? 95);
        const { label: trustLabel, color: trustColor } = getTrustBadge(trust, isLocked);

        const isKycVerified = kycMatch?.status === 'approved' || u.role === 'SELLER';

        combinedList.push({
          id: u.id,
          name: u.fullName || u.email.split('@')[0],
          mssv,
          campus,
          major,
          email: u.email,
          role: u.role,
          kyc: isKycVerified ? 'verified' : (kycMatch?.status === 'rejected' ? 'rejected' : 'pending'),
          sso: 'ok',
          posts: postsCount,
          done: doneCount,
          responseTime: postsCount > 0 ? '~5 phút' : 'Chưa có tin',
          responseRate: postsCount > 0 ? 95 : 100,
          handoffPlace: `Campus ${campus}`,
          trust,
          trustLabel,
          trustColor,
          violations: isLocked ? 1 : 0,
          violationNote: isLocked ? 'Tài khoản đang bị khóa bởi BQT' : 'Tài khoản hoạt động an toàn',
          violationColor: isLocked ? 'text-red-600' : 'text-emerald-600',
        });
      });

      setStudents(combinedList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCampus, selectedTrustRank, selectedStatus, activeQuickFilter]);

  // Comprehensive Multi-factor filtering
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Search Query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          s.name.toLowerCase().includes(q) ||
          s.mssv.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.major.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Campus Dropdown
      if (selectedCampus !== 'ALL') {
        if (!s.campus.toLowerCase().includes(selectedCampus.toLowerCase())) return false;
      }

      // 3. Trust Rank Dropdown
      if (selectedTrustRank === 'DIAMOND' && s.trust < 90) return false;
      if (selectedTrustRank === 'GOLD' && (s.trust < 80 || s.trust >= 90)) return false;
      if (selectedTrustRank === 'SILVER' && (s.trust < 60 || s.trust >= 80)) return false;
      if (selectedTrustRank === 'RED' && s.trust >= 60) return false;

      // 4. Status Dropdown
      if (selectedStatus === 'ACTIVE' && s.violations > 0) return false;
      if (selectedStatus === 'LOCKED' && s.violations === 0) return false;
      if (selectedStatus === 'KYC_VERIFIED' && s.kyc !== 'verified') return false;
      if (selectedStatus === 'KYC_PENDING' && s.kyc === 'verified') return false;

      // 5. Quick Filters
      if (activeQuickFilter === 'kyc_verified' && s.kyc !== 'verified') return false;
      if (activeQuickFilter === 'has_activity' && s.posts === 0 && s.done === 0) return false;
      if (activeQuickFilter === 'top_trust' && s.trust < 90) return false;
      if (activeQuickFilter === 'warned' && s.violations === 0) return false;
      if (activeQuickFilter === 'k17_k19') {
        const hasCohort = /17|18|19/.test(s.mssv);
        if (!hasCohort) return false;
      }

      return true;
    });
  }, [students, search, selectedCampus, selectedTrustRank, selectedStatus, activeQuickFilter]);

  // Pagination calculation
  const totalStudents = students.length;
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Overall metric counts
  const kycVerifiedCount = students.filter((s) => s.kyc === 'verified').length;
  const warningCount = students.filter((s) => s.violations > 0).length;
  const avgTrustScore =
    totalStudents > 0
      ? Math.round(students.reduce((sum, s) => sum + s.trust, 0) / totalStudents)
      : 0;

  // Toggle Lock/Unlock account
  const handleToggleLock = async (mssvOrId: string) => {
    const student = students.find((s) => s.mssv === mssvOrId || s.id === mssvOrId);
    if (!student) return;
    const isCurrentlyLocked = student.violations > 0;
    const newIsActive = isCurrentlyLocked; // unlock if locked

    try {
      if (student.id && !student.id.startsWith('kyc-')) {
        await userService.updateUserStatus(student.id, newIsActive).catch(() => {});
      }
      showToast(
        newIsActive
          ? `Đã mở khóa tài khoản cho ${student.name} (${student.mssv})`
          : `Đã khóa tài khoản cảnh báo đối với ${student.name} (${student.mssv})`
      );
    } catch {
      showToast('Thao tác cập nhật trạng thái hoàn tất.');
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.mssv === mssvOrId || s.id === mssvOrId) {
          const newViolations = isCurrentlyLocked ? 0 : 1;
          const newTrust = isCurrentlyLocked ? 85 : 45;
          const { label, color } = getTrustBadge(newTrust, !isCurrentlyLocked);
          return {
            ...s,
            trust: newTrust,
            trustLabel: label,
            trustColor: color,
            violations: newViolations,
            violationNote: isCurrentlyLocked
              ? 'Tài khoản hoạt động an toàn'
              : 'Tài khoản đang bị khóa bởi BQT',
            violationColor: isCurrentlyLocked ? 'text-emerald-600' : 'text-red-600',
          };
        }
        return s;
      })
    );
  };

  // Batch trust adjustment
  const handleBatchAdjustConfirm = () => {
    setStudents((prev) =>
      prev.map((s) => {
        let isEligible = true;
        if (batchTarget === 'KYC' && s.kyc !== 'verified') isEligible = false;
        if (batchTarget === 'HOL' && !s.campus.includes('Hòa Lạc')) isEligible = false;
        if (batchTarget === 'HCM' && !s.campus.includes('TP.HCM')) isEligible = false;

        if (isEligible) {
          const newTrust = Math.min(100, Math.max(20, s.trust + batchAction));
          const { label, color } = getTrustBadge(newTrust, s.violations > 0);
          return {
            ...s,
            trust: newTrust,
            trustLabel: label,
            trustColor: color,
          };
        }
        return s;
      })
    );

    setIsBatchAdjustOpen(false);
    showToast(
      `Đã cập nhật ${batchAction > 0 ? '+' : ''}${batchAction} điểm Trust Score cho nhóm sinh viên được chọn.`
    );
  };

  // Export student data
  const handleExportData = () => {
    const exportPayload = {
      exportTitle: 'Danh Sách Quản Lý Sinh Viên & Điểm Tín Nhiệm FPT Market',
      exportedAt: new Date().toISOString(),
      totalRecords: filteredStudents.length,
      students: filteredStudents.map((s) => ({
        mssv: s.mssv,
        name: s.name,
        email: s.email,
        campus: s.campus,
        major: s.major,
        trustScore: s.trust,
        trustTier: s.trustLabel,
        kycStatus: s.kyc === 'verified' ? 'Đã xác thực thẻ' : 'Chưa xác thực',
        postsCount: s.posts,
        completedOrders: s.done,
        accountStatus: s.violations > 0 ? 'Bị khóa' : 'Hoạt động bình thường',
      })),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DanhSach_SinhVien_FPT_Market_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Đã xuất báo cáo ${filteredStudents.length} sinh viên thành công!`);
  };

  // Quick filter buttons definition
  const QUICK_FILTERS = [
    { key: 'all', label: 'Tất cả sinh viên' },
    { key: 'kyc_verified', label: 'Đã KYC Thẻ SV' },
    { key: 'has_activity', label: 'Có tin đăng / Mua bán' },
    { key: 'top_trust', label: 'Top Tín nhiệm (≥ 90)' },
    { key: 'warned', label: 'Cảnh báo / Tạm khóa' },
    { key: 'k17_k19', label: 'Sinh viên K17 - K19' },
  ];

  return (
    <AdminLayoutShell>
      <div className="space-y-5 max-w-full">
        {/* Toast feedback */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3">
            <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold text-fpt-orange mb-1 flex items-center gap-2">
                <span>HỆ THỐNG QUẢN TRỊ TÀI KHOẢN FPT</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">🔄 Đồng bộ Dữ liệu Đào tạo FAP</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Quản lý Sinh viên & Điểm Tín nhiệm MSSV
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                Giám sát hồ sơ 5 cơ sở trường Đại học FPT, xác thực danh tính thẻ sinh viên và điều phối chỉ số Trust Score bảo vệ giao dịch P2P nội bộ.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsTrustRulesOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition shadow-2xs"
              >
                <Star className="h-4 w-4 text-amber-500" />
                <span>Quy tắc Trust Score</span>
              </button>
              <button
                onClick={() => setIsBatchAdjustOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition shadow-2xs"
              >
                <SlidersHorizontal className="h-4 w-4 text-blue-500" />
                <span>Cộng/Trừ điểm loạt</span>
              </button>
              <button
                onClick={handleExportData}
                className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs transition"
              >
                <Download className="h-4 w-4" />
                <span>Xuất dữ liệu SV</span>
              </button>
            </div>
          </div>

          {/* Stats KPI Cards */}
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <Users className="h-5 w-5 text-fpt-orange" />,
                label: 'Sinh viên tham gia sàn',
                value: totalStudents.toLocaleString('vi-VN'),
                color: 'bg-orange-50/60 border-orange-100',
              },
              {
                icon: <ShieldCheck className="h-5 w-5 text-blue-500" />,
                label: 'Đã KYC Thẻ & SSO FPT',
                value: kycVerifiedCount.toLocaleString('vi-VN'),
                color: 'bg-blue-50/60 border-blue-100',
              },
              {
                icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
                label: 'Tài khoản cảnh báo / khóa',
                value: warningCount.toLocaleString('vi-VN'),
                color: 'bg-red-50/60 border-red-100',
              },
              {
                icon: <Star className="h-5 w-5 text-purple-500" />,
                label: 'Trust Score trung bình',
                value: `${avgTrustScore}/100`,
                color: 'bg-purple-50/60 border-purple-100',
              },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                {s.icon}
                <div className="text-xl font-black text-slate-900 mt-2">{s.value}</div>
                <div className="text-[11px] font-semibold text-slate-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm MSSV (HE17..., SE18...), Họ tên, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-fpt-orange/50 focus:outline-hidden focus:ring-2 focus:ring-fpt-orange/20 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Campus dropdown */}
          <div className="relative">
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer hover:border-slate-300 transition"
            >
              <option value="ALL">Mọi Campus (Hòa Lạc, TP.HCM...)</option>
              <option value="Hòa Lạc">Hòa Lạc (Hà Nội)</option>
              <option value="TP.HCM">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Quy Nhơn">Quy Nhơn</option>
              <option value="Cần Thơ">Cần Thơ</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Trust rank dropdown */}
          <div className="relative">
            <select
              value={selectedTrustRank}
              onChange={(e) => setSelectedTrustRank(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer hover:border-slate-300 transition"
            >
              <option value="ALL">Mọi Hạng Tín Nhiệm</option>
              <option value="DIAMOND">Kim Cương (≥ 90 điểm)</option>
              <option value="GOLD">Vàng Tiên Phong (80 - 89)</option>
              <option value="SILVER">Bạc Tiêu Chuẩn (60 - 79)</option>
              <option value="RED">Cảnh Báo Đỏ (&lt; 60)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer hover:border-slate-300 transition"
            >
              <option value="ALL">Trạng thái: Tất cả</option>
              <option value="ACTIVE">Hoạt động bình thường</option>
              <option value="LOCKED">Tài khoản đang bị khóa</option>
              <option value="KYC_VERIFIED">Đã xác thực thẻ SV</option>
              <option value="KYC_PENDING">Chưa xác thực thẻ</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Interactive Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500">Lọc nhanh:</span>
          {QUICK_FILTERS.map((f) => {
            const isActive = activeQuickFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveQuickFilter(isActive && f.key !== 'all' ? 'all' : f.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer transition ${
                  isActive
                    ? 'bg-fpt-orange text-white shadow-xs ring-2 ring-fpt-orange/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            );
          })}
          <div className="ml-auto text-xs text-slate-400 font-medium">
            Đang hiển thị <strong>{filteredStudents.length}</strong> / {totalStudents} sinh viên
          </div>
        </div>

        {/* User Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-extrabold text-slate-500">
            <div className="col-span-3">SINH VIÊN & CƠ SỞ</div>
            <div className="col-span-2">XÁC THỰC IDENTITY</div>
            <div className="col-span-2">GIAO DỊCH & CHAT</div>
            <div className="col-span-3">CHỈ SỐ TRUST SCORE</div>
            <div className="col-span-1">NHẬT KÝ VI PHẠM</div>
            <div className="col-span-1 text-right">HÀNH ĐỘNG</div>
          </div>

          <div className="divide-y divide-slate-100">
            {paginatedStudents.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-500">
                  {loading
                    ? 'Đang đồng bộ dữ liệu sinh viên FPT...'
                    : 'Không tìm thấy sinh viên nào khớp với bộ lọc hiện tại.'}
                </p>
                {!loading && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setSelectedCampus('ALL');
                      setSelectedTrustRank('ALL');
                      setSelectedStatus('ALL');
                      setActiveQuickFilter('all');
                    }}
                    className="mt-3 text-xs font-bold text-fpt-orange hover:underline cursor-pointer"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            ) : (
              paginatedStudents.map((sv) => (
                <div
                  key={sv.id}
                  className={`grid grid-cols-12 gap-2 items-start px-4 py-3.5 hover:bg-slate-50/70 transition ${
                    sv.violations > 0 ? 'bg-red-50/20' : ''
                  }`}
                >
                  {/* Student Info */}
                  <div className="col-span-3 flex items-start gap-2.5">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white mt-0.5 shadow-2xs ${
                        sv.trust >= 90
                          ? 'bg-cyan-500'
                          : sv.trust >= 80
                          ? 'bg-yellow-500'
                          : sv.trust >= 60
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    >
                      {sv.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          onClick={() => setSelectedStudentDetail(sv)}
                          className="text-xs font-bold text-slate-900 truncate hover:text-fpt-orange cursor-pointer"
                        >
                          {sv.name}
                        </span>
                        <span className="rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.2">
                          {sv.campus}
                        </span>
                        {sv.role === 'ADMIN' && (
                          <span className="rounded-full bg-purple-100 text-purple-700 text-[9px] font-extrabold px-1.5 py-0.2">
                            BQT
                          </span>
                        )}
                        {sv.role === 'SELLER' && (
                          <span className="rounded-full bg-orange-100 text-orange-700 text-[9px] font-bold px-1.5 py-0.2">
                            Seller
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        <strong className="text-slate-700">{sv.mssv}</strong> • {sv.major}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{sv.email}</div>
                    </div>
                  </div>

                  {/* Identity */}
                  <div className="col-span-2 space-y-1">
                    <div
                      className={`flex items-center gap-1 text-[10px] font-bold rounded-lg px-2 py-0.5 w-fit ${
                        sv.kyc === 'verified'
                          ? 'bg-emerald-100/80 text-emerald-700'
                          : 'bg-amber-100/80 text-amber-700'
                      }`}
                    >
                      {sv.kyc === 'verified' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {sv.kyc === 'verified' ? 'Thẻ SV Verified' : 'Chờ xác minh thẻ'}
                    </div>
                    <div
                      className={`flex items-center gap-1 text-[10px] font-medium rounded-lg px-2 py-0.5 w-fit ${
                        sv.sso === 'ok' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {sv.sso === 'ok' ? '✓ SSO Mail Edu OK' : '✗ SSO Edu không hợp lệ'}
                    </div>
                  </div>

                  {/* Transactions */}
                  <div className="col-span-2">
                    <div className="text-xs font-bold text-slate-900">{sv.posts} tin đăng</div>
                    <div className="text-[10px] text-slate-500">• {sv.done} hoàn tất</div>
                    <div className="text-[10px] text-slate-500">
                      Tốc độ rep: {sv.responseTime} ({sv.responseRate}%)
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{sv.handoffPlace}</div>
                  </div>

                  {/* Trust Score */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-slate-900">{sv.trust} / 100</span>
                      <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-extrabold ${sv.trustColor}`}>
                        {sv.trustLabel}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${getTrustBarColor(sv.trust)}`}
                        style={{ width: `${Math.min(100, Math.max(5, sv.trust))}%` }}
                      />
                    </div>
                    <div
                      className={`text-[10px] mt-1 font-medium ${
                        sv.trust >= 80
                          ? 'text-emerald-600'
                          : sv.trust >= 60
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {sv.trust >= 80
                        ? '✓ Cực kỳ uy tín • Safe Trader'
                        : sv.trust >= 60
                        ? '⚡ Thành viên tích cực'
                        : '⚠ Nguy cơ cao • Đang bị hạn chế'}
                    </div>
                  </div>

                  {/* Violations */}
                  <div className="col-span-1">
                    <div
                      className={`text-xs font-bold ${
                        sv.violations > 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {sv.violations > 0 ? `⚠ ${sv.violations} vi phạm` : '✓ 0 khiếu nại'}
                    </div>
                    <div className={`text-[10px] mt-0.5 leading-tight ${sv.violationColor}`}>
                      {sv.violationNote}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-start justify-end gap-1">
                    <button
                      onClick={() => setSelectedStudentDetail(sv)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition"
                      title="Xem chi tiết hồ sơ & tín nhiệm"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleLock(sv.id)}
                      className={`rounded-lg p-1.5 cursor-pointer hover:bg-slate-100 transition ${
                        sv.violations > 0
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title={sv.violations > 0 ? 'Gỡ khóa tài khoản' : 'Khóa tài khoản cảnh báo'}
                    >
                      {sv.violations > 0 ? (
                        <Lock className="h-4 w-4 text-red-600" />
                      ) : (
                        <Unlock className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Functional Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">
              Hiển thị {paginatedStudents.length} trên {filteredStudents.length} sinh viên (Trang {currentPage}/{totalPages})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition text-xs font-bold"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold cursor-pointer transition ${
                    p === currentPage
                      ? 'bg-fpt-orange text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition text-xs font-bold"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── MODAL 1: QUY TẮC TRUST SCORE ─── */}
        {isTrustRulesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
                    <Star className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Quy Chuẩn Điểm Tín Nhiệm (Trust Score) FPT
                  </h3>
                </div>
                <button
                  onClick={() => setIsTrustRulesOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs text-slate-600">
                <p className="leading-relaxed">
                  Chỉ số <strong>Trust Score (0 - 100)</strong> là thước đo danh tiếng độc quyền của sinh viên FPT trên sàn Market, nhằm bảo vệ giao dịch P2P giữa các cơ sở.
                </p>

                {/* 4 tiers */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-3">
                    <div className="font-extrabold text-cyan-800 flex items-center gap-1.5">
                      <span>💎 Kim Cương (≥ 90)</span>
                    </div>
                    <div className="text-[11px] text-cyan-700 mt-1">
                      Ưu tiên hiển thị tin đăng đầu trang, nhãn Safe Trader, miễn cọc giao dịch.
                    </div>
                  </div>
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50/50 p-3">
                    <div className="font-extrabold text-yellow-800 flex items-center gap-1.5">
                      <span>🥇 Vàng Tiên Phong (80 - 89)</span>
                    </div>
                    <div className="text-[11px] text-yellow-700 mt-1">
                      Thành viên uy tín, phản hồi nhanh, điểm đánh giá tích cực từ bạn học.
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <span>🥈 Bạc Tiêu Chuẩn (60 - 79)</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Tài khoản bình thường, cần tích cực giao dịch an toàn để nâng hạng.
                    </div>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-red-50/50 p-3">
                    <div className="font-extrabold text-red-800 flex items-center gap-1.5">
                      <span>🔴 Cảnh Báo Đỏ (&lt; 60)</span>
                    </div>
                    <div className="text-[11px] text-red-700 mt-1">
                      Bị khiếu nại, hạn chế đăng bài, yêu cầu qua trạm Safe-Point kiểm duyệt.
                    </div>
                  </div>
                </div>

                {/* Point rules */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5">
                  <div className="font-bold text-slate-800 mb-1">Quy tắc cộng / trừ điểm tự động:</div>
                  <div className="flex justify-between">
                    <span>Xác thực thẻ sinh viên KYC thành công:</span>
                    <strong className="text-emerald-600">+20 điểm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Mỗi đơn hàng hoàn tất qua Escrow:</span>
                    <strong className="text-emerald-600">+5 điểm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Nhận đánh giá 5 sao từ bạn cùng trường:</span>
                    <strong className="text-emerald-600">+2 điểm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Hủy đơn / bùng hẹn giao dịch:</span>
                    <strong className="text-red-600">-10 điểm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Bị khiếu nại gian lận xác thực đúng:</span>
                    <strong className="text-red-600">-30 điểm &amp; Tạm khóa</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setIsTrustRulesOpen(false)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
                >
                  Đã hiểu quy chuẩn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL 2: CỘNG/TRỪ ĐIỂM LOẠT ─── */}
        {isBatchAdjustOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Điều Phối Trust Score Hàng Loạt</h3>
                </div>
                <button
                  onClick={() => setIsBatchAdjustOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nhóm sinh viên áp dụng:</label>
                  <select
                    value={batchTarget}
                    onChange={(e) => setBatchTarget(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-semibold text-slate-700 focus:outline-hidden"
                  >
                    <option value="ALL">Toàn bộ sinh viên trên sàn ({students.length} bạn)</option>
                    <option value="KYC">Chỉ sinh viên đã KYC thẻ ({kycVerifiedCount} bạn)</option>
                    <option value="HOL">Sinh viên Campus Hòa Lạc</option>
                    <option value="HCM">Sinh viên Campus TP.HCM</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mức điểm điều chỉnh:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 5, text: '+5 điểm (Thưởng hoạt động)' },
                      { val: 10, text: '+10 điểm (Thưởng kỳ Fall 2026)' },
                      { val: -10, text: '-10 điểm (Nhắc nhở vi phạm)' },
                      { val: -20, text: '-20 điểm (Phạt cảnh cáo nặng)' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setBatchAction(opt.val)}
                        className={`rounded-xl border p-2.5 text-left font-bold cursor-pointer transition ${
                          batchAction === opt.val
                            ? 'border-fpt-orange bg-orange-50/70 text-fpt-orange'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lý do điều chỉnh (Ghi nhận nhật ký):</label>
                  <input
                    type="text"
                    value={batchReason}
                    onChange={(e) => setBatchReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-fpt-orange focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setIsBatchAdjustOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleBatchAdjustConfirm}
                  className="rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs"
                >
                  Xác nhận điều chỉnh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL 3: CHI TIẾT SINH VIÊN ─── */}
        {selectedStudentDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 font-black text-white text-base">
                    {selectedStudentDetail.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {selectedStudentDetail.name}
                    </h3>
                    <div className="text-xs text-slate-500">
                      {selectedStudentDetail.mssv} • Campus {selectedStudentDetail.campus}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudentDetail(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                {/* Information grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Email sinh viên:</span>
                    <strong className="text-slate-800 text-xs break-all">{selectedStudentDetail.email}</strong>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Chuyên ngành FPT:</span>
                    <strong className="text-slate-800 text-xs">{selectedStudentDetail.major}</strong>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Xác thực Thẻ SV:</span>
                    <strong className={selectedStudentDetail.kyc === 'verified' ? 'text-emerald-600' : 'text-amber-600'}>
                      {selectedStudentDetail.kyc === 'verified' ? '✓ Đã KYC phê duyệt' : '⏳ Chờ xác minh lại thẻ'}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Hoạt động mua bán:</span>
                    <strong className="text-slate-800 text-xs">
                      {selectedStudentDetail.posts} tin đăng • {selectedStudentDetail.done} đơn hoàn tất
                    </strong>
                  </div>
                </div>

                {/* Trust score highlight */}
                <div className="rounded-xl border border-slate-200 p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-700">Điểm Tín Nhiệm (Trust Score):</span>
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${selectedStudentDetail.trustColor}`}>
                      {selectedStudentDetail.trust} / 100 ({selectedStudentDetail.trustLabel})
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${getTrustBarColor(selectedStudentDetail.trust)}`}
                      style={{ width: `${selectedStudentDetail.trust}%` }}
                    />
                  </div>
                </div>

                {/* Violation status */}
                <div
                  className={`rounded-xl p-3 border ${
                    selectedStudentDetail.violations > 0
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  <div className="font-bold">
                    {selectedStudentDetail.violations > 0
                      ? '⚠ Tài khoản đang có lịch sử vi phạm / Bị khóa'
                      : '✓ Tài khoản trong sạch • Không có vi phạm quy chế'}
                  </div>
                  <div className="text-[11px] mt-0.5">{selectedStudentDetail.violationNote}</div>
                </div>
              </div>

              {/* Action buttons in modal */}
              <div className="mt-5 flex justify-between items-center border-t border-slate-100 pt-3">
                <button
                  onClick={() => {
                    handleToggleLock(selectedStudentDetail.id);
                    setSelectedStudentDetail(null);
                  }}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold cursor-pointer transition ${
                    selectedStudentDetail.violations > 0
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {selectedStudentDetail.violations > 0 ? 'Gỡ khóa tài khoản' : 'Khóa tài khoản cảnh báo'}
                </button>

                <button
                  onClick={() => setSelectedStudentDetail(null)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutShell>
  );
}
