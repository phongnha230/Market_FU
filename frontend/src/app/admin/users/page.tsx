'use client';

import React, { useState } from 'react';
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
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Minus,
} from 'lucide-react';

const STUDENTS = [
  {
    name: 'Lê Minh Quân',
    mssv: 'SE172819',
    campus: 'HLA',
    major: 'Kỹ thuật Phần mềm K17',
    email: 'quanmse172819@fpt.edu.vn',
    kyc: 'verified',
    sso: 'ok',
    posts: 24,
    done: 19,
    responseTime: '~4 phút',
    responseRate: 98,
    handoffPlace: 'Sảnh Beta & Tòa Alpha HL',
    trust: 98,
    trustLabel: 'Kim Cương',
    trustColor: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    violations: 0,
    violationNote: 'Handoff: Đúng hẹn 100%',
    violationColor: 'text-emerald-600',
  },
  {
    name: 'Nguyễn Thu Thảo',
    mssv: 'SB160412',
    campus: 'SGN',
    major: 'Quản trị Kinh doanh K18',
    email: 'thaontsb160412@fpt.edu.vn',
    kyc: 'verified',
    sso: 'ok',
    posts: 12,
    done: 11,
    responseTime: '~8 phút',
    responseRate: 92,
    handoffPlace: 'Thư viện Q.9 Campus SG',
    trust: 88,
    trustLabel: 'Vàng Tiên Phong',
    trustColor: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    violations: 0,
    violationNote: 'Handoff: 1 lần dời giờ hẹn',
    violationColor: 'text-amber-500',
  },
  {
    name: 'Trần Quang Huy',
    mssv: 'GD188901',
    campus: 'DAN',
    major: 'Thiết kế Đồ họa K18',
    email: 'huytqgd180901@fpt.edu.vn',
    kyc: 'pending',
    sso: 'mismatch',
    posts: 9,
    done: 2,
    responseTime: '>4 giờ',
    responseRate: 28,
    handoffPlace: 'Bị báo cáo mô tả sai lệch',
    trust: 45,
    trustLabel: 'Cảnh Báo Đỏ',
    trustColor: 'text-red-700 bg-red-50 border-red-200',
    violations: 3,
    violationNote: 'Boom hẹn 2 lần tại Hub F-Complex',
    violationColor: 'text-red-600',
  },
  {
    name: 'Đoàn Bảo Long',
    mssv: 'IA171120',
    campus: 'CTH',
    major: 'An toàn Thông tin K17',
    email: 'longdbia171120@fpt.edu.vn',
    kyc: 'verified',
    sso: 'ok',
    posts: 15,
    done: 14,
    responseTime: '~11 phút',
    responseRate: 89,
    handoffPlace: 'Sân cỏ nhân tạo Cần Thơ',
    trust: 91,
    trustLabel: 'Vàng Tiên Phong',
    trustColor: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    violations: 0,
    violationNote: 'Đối tác giao dịch tốt',
    violationColor: 'text-emerald-600',
  },
  {
    name: 'Vũ Hoàng Mai Anh',
    mssv: 'AI190045',
    campus: 'QNH',
    major: 'Trí tuệ Nhân tạo K19',
    email: 'anhvhmai190045@fpt.edu.vn',
    kyc: 'verified',
    sso: 'ok',
    posts: 5,
    done: 4,
    responseTime: '~6 phút',
    responseRate: 80,
    handoffPlace: 'Tòa nhà Innovation Quy Nhơn',
    trust: 79,
    trustLabel: 'Bạc Tiêu Chuẩn',
    trustColor: 'text-slate-600 bg-slate-100 border-slate-200',
    violations: 0,
    violationNote: 'Tài khoản sinh viên mới K19',
    violationColor: 'text-slate-500',
  },
];

const TRUST_BAR_COLORS: Record<number, string> = {};
function getTrustBarColor(score: number) {
  if (score >= 90) return 'bg-cyan-500';
  if (score >= 80) return 'bg-yellow-500';
  if (score >= 60) return 'bg-amber-400';
  if (score >= 40) return 'bg-red-400';
  return 'bg-red-600';
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');

  return (
    <AdminLayoutShell>
      <div className="space-y-5 max-w-full">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold text-fpt-orange mb-1 flex items-center gap-2">
                <span>HỆ THỐNG QUẢN TRỊ TÀI KHOẢN FPT</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">🔄 Đồng bộ Dữ liệu Đào tạo FAP</span>
              </div>
              <h1 className="text-xl font-black text-slate-900">Quản lý Sinh viên & Điểm Tín nhiệm MSSV</h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Giám sát hồ sơ 5 cơ sở trường Đại học FPT, xác thực danh tính thẻ sinh viên và điều phối chỉ số Trust Score bảo vệ giao dịch P2P nội bộ.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Star className="h-4 w-4" />
                Quy tắc Trust Score
              </button>
              <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                <SlidersHorizontal className="h-4 w-4" />
                Cộng/Trừ điểm loạt
              </button>
              <button className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs">
                <Download className="h-4 w-4" />
                Xuất dữ liệu SV
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Users className="h-5 w-5 text-fpt-orange" />, label: 'Sinh viên tham gia sàn', value: '5.620', sub: '', color: 'bg-orange-50 border-orange-100' },
              { icon: <ShieldCheck className="h-5 w-5 text-blue-500" />, label: 'Đã KYC Thẻ & SSO FPT', value: '4.150', sub: '', color: 'bg-blue-50 border-blue-100' },
              { icon: <AlertTriangle className="h-5 w-5 text-red-500" />, label: 'Tài khoản cảnh báo / khóa', value: '18', sub: '', color: 'bg-red-50 border-red-100' },
              { icon: <Star className="h-5 w-5 text-purple-500" />, label: 'Trust Score trung bình', value: '94/100', sub: 'Điểm', color: 'bg-purple-50 border-purple-100' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                {s.icon}
                <div className="text-xl font-black text-slate-900 mt-2">{s.value}</div>
                <div className="text-[11px] font-semibold text-slate-600 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm MSSV (HE17..., SE18...), Họ tên, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-fpt-orange/50 focus:outline-hidden focus:ring-2 focus:ring-fpt-orange/20 transition"
            />
          </div>
          {['Mọi Campus (Hòa Lạc, SG)', 'Mọi Hạng Tín Nhiệm (Trus', 'Trạng thái: Tất'].map((f, i) => (
            <div key={i} className="relative">
              <select className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-8 text-sm font-semibold text-slate-700 focus:outline-hidden cursor-pointer">
                <option>{f}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          ))}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500">Lọc nhanh:</span>
          {[
            { label: 'Sinh viên K18 - K19', active: false },
            { label: 'Có > 10 lượt thanh lý', active: false },
            { label: 'Bị báo cáo 7 ngày qua', active: true },
            { label: 'Top 1% Tín nhiệm Campus', active: false },
          ].map((f) => (
            <button key={f.label} className={`rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer transition ${f.active ? 'bg-fpt-orange text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {f.label}
            </button>
          ))}
          <div className="ml-auto text-xs text-slate-400">Đang hiển thị 5 / 5.620 sinh viên</div>
        </div>

        {/* User Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-extrabold text-slate-500">
            <div className="col-span-3">SINH VIÊN & CƠ SỞ</div>
            <div className="col-span-2">XÁC THỰC IDENTITY</div>
            <div className="col-span-2">GIAO DỊCH & CHAT</div>
            <div className="col-span-3">CHỈ SỐ TRUST SCORE</div>
            <div className="col-span-1">NHẬT KÝ VI PHẠM</div>
            <div className="col-span-1 text-right">HÀNH ĐỘ</div>
          </div>

          <div className="divide-y divide-slate-100">
            {STUDENTS.map((sv) => (
              <div
                key={sv.mssv}
                className={`grid grid-cols-12 gap-2 items-start px-4 py-3.5 hover:bg-slate-50/50 transition ${sv.violations > 0 ? 'bg-red-50/20' : ''}`}
              >
                {/* Student Info */}
                <div className="col-span-3 flex items-start gap-2.5">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white mt-0.5 ${sv.trust >= 90 ? 'bg-cyan-500' : sv.trust >= 80 ? 'bg-yellow-500' : sv.trust >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}>
                    {sv.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate">{sv.name}</span>
                      <span className="rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold px-1.5">{sv.campus}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{sv.mssv} • {sv.major}</div>
                    <div className="text-[10px] text-slate-400 truncate">{sv.email}</div>
                  </div>
                </div>

                {/* Identity */}
                <div className="col-span-2 space-y-1">
                  <div className={`flex items-center gap-1 text-[10px] font-bold rounded-lg px-2 py-0.5 w-fit ${sv.kyc === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {sv.kyc === 'verified' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {sv.kyc === 'verified' ? 'Thẻ SV Verified' : 'Chờ xác minh lại thẻ'}
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-medium rounded-lg px-2 py-0.5 w-fit ${sv.sso === 'ok' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-600'}`}>
                    {sv.sso === 'ok' ? '✓ SSO Mail Edu OK' : '✗ SSO Edu không hợp lệ'}
                  </div>
                </div>

                {/* Transactions */}
                <div className="col-span-2">
                  <div className="text-xs font-bold text-slate-900">{sv.posts} tin đăng</div>
                  <div className="text-[10px] text-slate-500">• {sv.done} hoàn tất</div>
                  <div className="text-[10px] text-slate-500">Tốc độ rep: {sv.responseTime} ({sv.responseRate}%)</div>
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
                  <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${getTrustBarColor(sv.trust)}`}
                      style={{ width: `${sv.trust}%` }}
                    />
                  </div>
                  <div className={`text-[10px] mt-1 font-medium ${sv.trust >= 80 ? 'text-emerald-600' : sv.trust >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                    {sv.trust >= 80 ? '✓ Cực kỳ uy tín • Safe Trader' : sv.trust >= 60 ? '⚡ Thành viên tích cực' : '⚠ Nguy cơ cao • Đã hạn chế đăng tin'}
                  </div>
                </div>

                {/* Violations */}
                <div className="col-span-1">
                  <div className={`text-xs font-bold ${sv.violations > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {sv.violations > 0 ? `⚠ ${sv.violations} khiếu nại vi phạm` : '✓ 0 khiếu nại'}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${sv.violationColor}`}>{sv.violationNote}</div>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-start justify-end gap-1">
                  <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer" title="Xem chi tiết">
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button className={`rounded-lg p-1.5 cursor-pointer hover:bg-slate-100 ${sv.violations > 0 ? 'text-red-400 hover:text-red-600' : 'text-slate-400 hover:text-slate-700'}`} title="Khoá tài khoản">
                    <Lock className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <span className="text-xs text-slate-500">Hiển thị 5 trên 5.620 kết quả sinh viên FPT</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, '...', 112].map((p, i) => (
                <button key={i} className={`w-8 h-8 rounded-lg text-xs font-bold cursor-pointer ${p === 1 ? 'bg-fpt-orange text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
