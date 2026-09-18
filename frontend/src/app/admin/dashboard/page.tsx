'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import {
  BarChart3,
  FileText,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Download,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Zap,
  Bot,
  MapPin,
  Users,
  Activity,
  Star,
} from 'lucide-react';

/* ─── Static data ─── */
const CAMPUS_STATS = [
  { code: 'HOA LẠC (HL)', count: 1420, status: 'DN', color: 'bg-orange-500', sub: '37% tin / 57% Sách, IT + phần mềm', location: 'Dom A-Dom B, sảnh...' },
  { code: 'TP. HỒ CHÍ MINH (SG)', count: 1150, status: 'DN', color: 'bg-blue-500', sub: '30% IT + 15% Tech & Mac', location: 'Khu Công Nghệ Cao...' },
  { code: 'ĐÀ NẴNG (DN)', count: 580, status: 'DN', color: 'bg-teal-500', sub: '15% tin / Xe Cộ & Giao trình', location: 'FPT City, Ngũ Hành Sơn' },
  { code: 'CẦN THƠ (CT)', count: 420, status: '', color: 'bg-emerald-500', sub: '11% / Đồ gia dụng KTX', location: 'Cầu Rau Răm, An Sinh' },
  { code: 'QUY NHƠN (QN)', count: 272, status: '', color: 'bg-purple-500', sub: '7% / AI Hub Campus', location: 'Trung tâm sáng tạo Ảo...' },
];

const MODERATION_QUEUE = [
  {
    id: '#POST-4921',
    campus: 'HL + HÒA LẠC',
    category: 'Công nghệ & PC',
    badge: '🔴 Rủi ro cao',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    title: 'Màn hình LG 27 inch 4K144Hz Ultragear',
    price: '2.200.000đ',
    seller: 'Vũ Hải Nam (HE180291 - K18 AI)',
    aiCheck: 'AI Handoff Check: Am thiết tại Dom B Hòa. Giá thị trường đúng (hỗ trợ 15% used).',
    time: '14 phút trước',
    isNew: true,
    status: 'pending',
  },
  {
    id: '#POST-4920',
    campus: 'SG • TP.HCM',
    category: 'Giáo trình & Sách',
    badge: '✅ Ổn lại/Clean',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    title: 'Trọn bộ Giáo trình SWE201c + CSL201FPT (In mới...)',
    price: '150.000đ',
    seller: 'Đỗ Phương Linh (SE171452 - K17 SE)',
    aiCheck: 'AI Verified: Khớp 100%. Đồ cương Syllabus FPT 2024 môn MAS291 & CSL201. Đề quét nội dung chính tránh tài liệu ngân hàng FPT sử dụng thư viện đây.',
    time: '12 phút trước',
    isNew: false,
    status: 'clean',
  },
  {
    id: '#POST-4919',
    campus: 'HL',
    category: 'Đồ dùng KTX & Gia dụng',
    badge: '⚠️ Chờ kiểm duyệt',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    title: 'Bếp điện từ tiểu mini Sunhouse 2000W...',
    price: '220.000đ',
    seller: 'Lê Hoàng Phúc (HE171709)',
    aiCheck: '⚠ Cảnh báo quy chế KTX: Công suất thiết bị 2000W vượt định mức tiêu chuẩn điện an toàn PCCC KTX FPT...',
    time: '1 giờ trước',
    isNew: false,
    status: 'pccc_warning',
    alertType: 'Cần lưu ý PCCC',
  },
  {
    id: '#POST-4918',
    campus: 'GQ • QUY NHƠN',
    category: 'Gia dụng KTX',
    badge: 'Còn bảo hành 6 tháng',
    badgeColor: 'bg-slate-100 text-slate-600 border-slate-200',
    title: 'Nồi chiến không dầu Philips 4.5L cho phòng KTX',
    price: '350.000đ',
    seller: 'Trần Quang Huy (QE180112 - Quy Nhơn)',
    aiCheck: 'Đề quét: Công xuất 1500W phù hợp quy định tiêu thu điện KTX theo quy định.',
    time: '28 phút trước',
    isNew: false,
    status: 'pending',
  },
];

const KYC_QUEUE = [
  { name: 'Nguyễn Tuấn Anh', mssv: 'HE172839', campus: 'Hoa Lạc', email: 'tuananh@fpt.edu.vn', status: 'SSO OK', statusColor: 'bg-emerald-100 text-emerald-700' },
  { name: 'Lâm Gia Hân', mssv: 'SS180120', campus: 'TP.HCM', email: 'hanle89120@fpt.edu.vn', status: 'Chờ kiểm tra ảnh', statusColor: 'bg-amber-100 text-amber-700' },
];

const REPORTS_FEED = [
  {
    id: '#FP-892',
    type: 'KHẨN CẤP VĂN PHÒ',
    title: 'Bán quyền tài liệu lắc đầu thiếu hiệu quan giáo trình / bán quyền Bộ môn',
    campus: 'Hoa Lạc',
    time: '1 giờ trước',
    reporter: 'K10 SV',
    urgent: true,
  },
  {
    id: '#FP-887',
    type: 'CẢNH BÁO SAFE-HANDOFF',
    title: 'Sinh viên không đến điểm hẹn tại Sảnh Alpha (Boom hen Handoff)',
    campus: 'Hoa Lạc',
    time: '3 giờ trước',
    reporter: 'Hệ thống',
    urgent: false,
  },
];

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} text-white`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <div className="text-xs font-semibold text-slate-500 mt-0.5">{label}</div>
        {sub && <div className="text-[11px] text-slate-400 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

/* ─── Badge ─── */
function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold ${color}`}>
      {label}
    </span>
  );
}

export default function AdminDashboard() {
  const [selectedSemester, setSelectedSemester] = useState('Fall 2024');

  return (
    <AdminLayoutShell>
      <div className="space-y-6 max-w-full">
        {/* Page Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-[11px] font-extrabold text-fpt-orange">
                  <Activity className="h-3 w-3" />
                  BỘT VẬN HÀNH TOÀN QUỐC
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Realtime Safe-Sync: Active
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">
                Trung tâm Quản trị & Điều hành FPT 5Campus Marketplace
              </h1>
              <p className="text-sm text-slate-500 max-w-2xl">
                Giám sát giao dịch, kiểm duyệt tin đăng và bảo vệ chuỗi chuyển giao Safe-Handoff giữa sinh viên 5 cơ sở.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Campus Tabs */}
              <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
                {['Tất cả 5 cơ sở', 'HL (Hòa Lạc)', 'SG (TP.HCM)', 'ĐN', 'CT', 'QN'].map((tab, i) => (
                  <button
                    key={tab}
                    className={`rounded-lg px-3 py-1.5 cursor-pointer transition ${i === 0 ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-7 text-xs font-semibold text-slate-700 shadow-xs focus:outline-hidden cursor-pointer"
                >
                  <option>Fall 2024</option>
                  <option>Spring 2025</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              </div>

              <button className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs active:scale-95 transition">
                <Download className="h-4 w-4" />
                Xuất báo cáo
              </button>
            </div>
          </div>

          {/* 4 Top Stats */}
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <FileText className="h-5 w-5" />, label: 'Tin đang hoạt động', value: '3.842', sub: '+12.4% tuần này • 5 cơ sở', color: 'bg-fpt-orange' },
              { icon: <Clock className="h-5 w-5" />, label: 'Tin chờ kiểm duyệt', value: '18', sub: '4 ca nghị viện gia đình giáo AI', color: 'bg-amber-500' },
              { icon: <ShieldCheck className="h-5 w-5" />, label: 'Hồ sơ Thẻ SV chờ', value: '14', sub: '11 khớp API FPT Edu • 3 cần xét thẻ', color: 'bg-blue-500' },
              { icon: <AlertTriangle className="h-5 w-5" />, label: 'Báo cáo & Vi phạm', value: '02', sub: '1 ca đặt cọc ngoài • 1 ca boom hen', color: 'bg-red-500' },
            ].map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Extended Stats Row */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              { label: 'AI nhận duyệt tự động', value: '14 lượt duyệt', icon: <Bot className="h-4 w-4" />, color: 'text-purple-600 bg-purple-50 border-purple-200' },
              { label: 'Trust Score trung bình 5 cơ sở', value: '98.2%', icon: <Star className="h-4 w-4" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { label: 'Tỷ lệ xác thực sinh viên thành công', value: '99.4%', icon: <CheckCircle className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50 border-blue-200' },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${s.color}`}>
                {s.icon}
                <div>
                  <div className="text-sm font-extrabold">{s.value}</div>
                  <div className="text-[11px] font-medium opacity-80">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campus Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-slate-900">
              🏫 Phân bổ Giao dịch & Mật độ Hoạt động 5 Campus FPT
            </h2>
            <div className="flex gap-2 text-[11px] font-bold">
              {['• Tin công nghệ / Sách', '• Đồ KTX / Handoff Hub'].map((t) => (
                <span key={t} className="text-slate-500">{t}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {CAMPUS_STATS.map((cs) => (
              <div key={cs.code} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`h-2.5 w-2.5 rounded-full ${cs.color}`}></span>
                  {cs.status && (
                    <span className="rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.5 text-[9px] font-bold">
                      {cs.status}
                    </span>
                  )}
                </div>
                <div className="text-xl font-black text-slate-900">{cs.count.toLocaleString('vi-VN')}</div>
                <div className="text-[10px] font-bold text-slate-700 leading-tight">{cs.code}</div>
                <div className="text-[10px] text-slate-500 leading-tight">{cs.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Grid: Moderation Queue + KYC + Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Moderation Queue (2/3) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Hàng đợi Kiểm duyệt Tin đăng (Moderation Queue)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Quy chế Campus Safe-Handoff: Chỉ duyệt đồ chính chủ, không giao bán trước</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
                  10 tin đóng đợi
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-2.5">
              {[
                { label: 'Chờ duyệt', count: 18, active: true },
                { label: 'Nghị viên vi phạm', count: 4, active: false },
                { label: 'Đã duyệt hôm nay', count: 86, active: false },
              ].map((t) => (
                <button
                  key={t.label}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer transition ${
                    t.active
                      ? 'bg-fpt-orange text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label} ({t.count})
                </button>
              ))}
              <span className="ml-auto text-[11px] text-slate-400">Bị tự...</span>
            </div>

            <div className="divide-y divide-slate-100">
              {MODERATION_QUEUE.map((post) => (
                <div key={post.id} className={`p-4 hover:bg-slate-50/50 transition ${post.badge.includes('Rủi ro') ? 'border-l-4 border-red-400 bg-red-50/30' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-2 py-0.5">{post.campus}</span>
                        <span className="text-[10px] text-slate-500">{post.category}</span>
                        {post.isNew && <span className="rounded-full bg-rose-500 text-white px-1.5 py-0.5 text-[9px] font-extrabold">New 🔥</span>}
                        <StatusBadge label={post.badge} color={post.badgeColor} />
                        {post.alertType && (
                          <StatusBadge label={`⚠️ ${post.alertType}`} color="bg-orange-100 text-orange-700 border-orange-200" />
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 truncate">{post.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>• Người bán: {post.seller}</span>
                      </div>

                      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-[11px] text-blue-700">
                        <Bot className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
                        <span>{post.aiCheck}</span>
                      </div>

                      <div className="mt-1 text-[10px] text-slate-400">Handoff: Bán trực tiếp Sảnh Alpha • {post.time}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-fpt-orange">{post.price}</div>
                      <div className="flex gap-1.5 mt-2">
                        <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
                          Xem chi tiết
                        </button>
                        <button className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 cursor-pointer">
                          Từ chối
                        </button>
                        <button className="rounded-lg bg-fpt-orange px-2.5 py-1 text-[11px] font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs">
                          Duyệt nhanh
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center border-t border-slate-100 py-3 text-xs font-semibold text-slate-400">
              Hiển thị 4 trong tổng số 18 tin chờ duyệt &nbsp;|&nbsp;
              <button className="text-fpt-orange hover:underline cursor-pointer ml-1">Xem tất cả →</button>
            </div>
          </div>

          {/* Right Panel: KYC + Reports */}
          <div className="space-y-4">
            {/* KYC Queue */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-extrabold text-slate-900">Xác thực Thẻ SV FPT (KYC)</h3>
                <span className="rounded-xl bg-blue-100 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                  14 chờ duyệt
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {KYC_QUEUE.map((sv) => (
                  <div key={sv.mssv} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white">
                        {sv.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{sv.name}</div>
                        <div className="text-[10px] text-slate-400">MSSV: {sv.mssv} • {sv.campus}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-32">{sv.email}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${sv.statusColor}`}>{sv.status}</span>
                      <button className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-600 cursor-pointer">
                        Cấp huy hiệu SV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-100 px-4 py-2 text-center">
                <Link href="/admin/kyc" className="text-[11px] font-bold text-fpt-orange hover:underline">
                  Xem thêm 2 ảnh mờ → Từ chối | Xác nhận
                </Link>
              </div>
            </div>

            {/* Reports Feed */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-extrabold text-slate-900">Khiếu nại & An toàn Campus</h3>
                <span className="rounded-xl bg-red-100 border border-red-200 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
                  2 vụ cần xử lý
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {REPORTS_FEED.map((r) => (
                  <div key={r.id} className={`px-4 py-3 ${r.urgent ? 'bg-red-50/40' : ''}`}>
                    <div className="flex items-start gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="text-[10px] font-extrabold text-slate-500">{r.id}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${r.urgent ? 'bg-red-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                            {r.type}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-900 line-clamp-2">{r.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                          <span>{r.campus}</span>
                          <span>• {r.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <button className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 cursor-pointer hover:bg-slate-50">Đồng ý</button>
                      <button className="rounded-lg bg-fpt-orange px-2 py-1 text-[10px] font-bold text-white cursor-pointer hover:bg-fpt-orange-hover">
                        Mở chat 3 bên
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
