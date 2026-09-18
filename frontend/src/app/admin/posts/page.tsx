'use client';

import React, { useState } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Activity,
  Bot,
  Download,
  SlidersHorizontal,
  Search,
  ChevronDown,
  XCircle,
  Eye,
  Zap,
  Lock,
  Camera,
  MessageSquare,
  Star,
} from 'lucide-react';

type TabType = 'all' | 'pending' | 'risk' | 'live' | 'rejected';

const POSTS = [
  {
    id: '#POST-8921',
    campus: 'HL • HÒA LẠC',
    category: 'Đồ Công Nghệ & PC',
    riskLevel: 'high',
    riskBadge: '🔴 Rủi ro cao',
    title: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên (Fullbox)',
    price: '11.500.000đ',
    seller: 'Trần Minh Vương',
    mssv: 'K20 SE',
    aiNote: '⚠️ CẢNH BÁO NGUY CƠ CAO: Yêu cầu cọc 500k đặt trước MoMo từ người mua. Phát hiện vi phạm nghiêm trọng trong quy chế an ninh Campus. Người dùng đã thực hiện 2 lần "Cọc ngoài Momo" (vi phạm 3 lần ChucHo KTX)...',
    aiScore: 18,
    time: '1 giờ trước',
    isCritical: true,
  },
  {
    id: '#POST-4920',
    campus: 'SG • TP.HCM',
    category: 'Giáo trình & Sách',
    riskLevel: 'clean',
    riskBadge: '✅ Ổn lại/Clean',
    title: 'Tài liệu ôn tập PE MAS291 & CSL201FPT (In mới...)',
    price: '65.000đ',
    seller: 'Đỗ Phương Linh',
    mssv: 'SE171452 - K17',
    aiNote: '✅ AI Verified: Khớp 100% đồ cương Syllabus FPT 2024 môn MAS291 & CSL201. Đề quét nội dung chính tránh tài liệu ngân hàng chưa FPT sử dụng thư viện đây.',
    aiScore: 92,
    time: '28 phút trước',
    isCritical: false,
  },
  {
    id: '#POST-4918',
    campus: 'HL',
    category: 'Đồ KTX & Gia Dụng',
    riskLevel: 'pccc',
    riskBadge: '⚠️ Cần lưu ý PCCC',
    title: 'Bếp điện từ tiểu mini Sunhouse 2000W...',
    price: '220.000đ',
    seller: 'Lê Hoàng Phúc',
    mssv: 'HE171709',
    aiNote: '⚠️ Cảnh báo quy chế KTX: Công suất thiết bị 2000W vượt định mức tiêu chuẩn điện an toàn PCCC KTX FPT. Vui lòng kiểm tra lại với ban quản lý KTX.',
    aiScore: 42,
    time: '1 giờ trước',
    isCritical: false,
  },
  {
    id: '#POST-4917',
    campus: 'ĐN',
    category: 'Đồng phục VOVIMAZ',
    riskLevel: 'clean',
    riskBadge: '🟢 5 sinh viên đồng hội',
    title: 'Đồng phục Vovinam FPT size L Kiêm đại xan...',
    price: '140.000đ',
    seller: 'Trần Quốc Bảo',
    mssv: 'DS180300',
    aiNote: '✅ Đề lọc cuộc Safe-Handoff: Bán gần Sân Vovinam Toa Beta ĐN vào lúc 18:30 chiều nay. Hệ thống đã kiểm tra việc giao dịch không vượt thời gian quy định.',
    aiScore: 85,
    time: '2 giờ trước',
    isCritical: false,
  },
];

const RISK_COLORS: Record<string, string> = {
  high: 'border-l-4 border-red-400 bg-red-50/30',
  clean: '',
  pccc: 'border-l-4 border-amber-400 bg-amber-50/20',
};

const RISK_BADGE_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  clean: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pccc: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function AdminPostsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetail, setSelectedDetail] = useState<(typeof POSTS)[0] | null>(POSTS[0]);

  const TABS: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: 23 },
    { key: 'pending', label: 'Chờ duyệt', count: 18 },
    { key: 'risk', label: 'Nguy cơ vi phạm', count: 4 },
    { key: 'live', label: 'Đang kiếm', count: 1 },
    { key: 'rejected', label: 'Bị khóa từ chối', count: 0 },
  ];

  return (
    <AdminLayoutShell>
      <div className="space-y-5 max-w-full">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">
                Vận hành thị trường / <span className="text-fpt-orange font-bold">Listing Moderation Hub</span>
              </div>
              <h1 className="text-xl font-black text-slate-900">Quản lý & Kiểm duyệt Tin đăng</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-1 animate-pulse">
                🔴 TRỰC TIẾP
              </span>
              <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Download className="h-4 w-4" />
                Xuất Excel
              </button>
              <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                <SlidersHorizontal className="h-4 w-4" />
                Bộ lọc nâng cao
              </button>
              <button className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs">
                <Zap className="h-4 w-4" />
                Duyệt ngay All Pa.Pass (14 tin)
              </button>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: <FileText className="h-5 w-5 text-amber-500" />, label: 'Chờ duyệt tổng', value: '18', sub: 'Thời gian xử lý Tế: 14 phút', bg: 'bg-amber-50 border-amber-100' },
              { icon: <AlertTriangle className="h-5 w-5 text-red-500" />, label: 'Nghị vấn rủi ro cao', value: '04', sub: '• 2 tin cao: MetMo & khoá người bán', bg: 'bg-red-50 border-red-100' },
              { icon: <CheckCircle className="h-5 w-5 text-emerald-500" />, label: 'Đã xử lý hôm nay', value: '86', sub: '+18.4% so hôm qua', bg: 'bg-emerald-50 border-emerald-100' },
              { icon: <Activity className="h-5 w-5 text-blue-500" />, label: 'Đang online toàn hệ thống', value: '3.842', sub: 'Giao dịch thành công', bg: 'bg-blue-50 border-blue-100' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                <div className="flex items-center gap-2 mb-2">{s.icon}</div>
                <div className="text-xl font-black text-slate-900">{s.value}</div>
                <div className="text-[11px] font-semibold text-slate-600 mt-0.5">{s.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
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
              placeholder="Tìm tiêu đề đồ tế..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-fpt-orange/50 focus:outline-hidden focus:ring-2 focus:ring-fpt-orange/20 transition"
            />
          </div>
          {['Tất cả 5 cơ sở', 'Tất cả danh mục', 'Mục độ An Toàn'].map((f) => (
            <div key={f} className="relative">
              <select className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-8 text-sm font-semibold text-slate-700 focus:outline-hidden cursor-pointer">
                <option>{f}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          ))}
        </div>

        {/* Main Grid: List + Detail Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Post List */}
          <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-100 px-4 py-2.5 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer transition ${
                    activeTab === tab.key
                      ? 'bg-fpt-orange text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
              <div className="ml-auto text-[11px] text-slate-400 whitespace-nowrap">
                Sắp xếp: Rủi ro ▼ giảm dần
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {POSTS.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedDetail(post)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition ${RISK_COLORS[post.riskLevel]} ${selectedDetail?.id === post.id ? 'bg-blue-50/30 ring-2 ring-inset ring-blue-200' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{post.id}</span>
                        <span className="text-[10px] text-slate-500">{post.campus}</span>
                        <span className="text-[10px] text-slate-500">{post.category}</span>
                        <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${RISK_BADGE_COLORS[post.riskLevel]}`}>
                          {post.riskBadge}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 truncate">{post.title}</h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">• Người bán: {post.seller} ({post.mssv})</div>

                      <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-[11px] text-blue-700 flex items-start gap-1.5">
                        <Bot className="h-3.5 w-3.5 mt-0.5 shrink-0 text-blue-500" />
                        <span className="line-clamp-2">{post.aiNote}</span>
                      </div>

                      {post.isCritical && (
                        <div className="mt-1.5 flex gap-2">
                          <button className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600 cursor-pointer hover:bg-slate-50">
                            Khoá tín & Cảnh cao User
                          </button>
                          <button className="rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white cursor-pointer hover:bg-amber-600">
                            Chuyển BQT xét
                          </button>
                          <button className="rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white cursor-pointer hover:bg-red-600">
                            🚫 Khoá tín ngay
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-fpt-orange">{post.price}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{post.time}</div>
                      {!post.isCritical && (
                        <div className="flex gap-1 mt-2">
                          <button className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 cursor-pointer">
                            Từ chối
                          </button>
                          <button className="rounded-lg bg-fpt-orange px-2 py-1 text-[10px] font-bold text-white cursor-pointer hover:bg-fpt-orange-hover">
                            ✓ Phê duyệt
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 flex items-center justify-center gap-2 py-3">
              {[1, 2, 3].map((p) => (
                <button key={p} className={`w-8 h-8 rounded-lg text-sm font-bold cursor-pointer ${p === 1 ? 'bg-fpt-orange text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
              ))}
              <span className="text-slate-400 text-sm">...</span>
              <span className="text-xs text-slate-500">Hiện thị 1 – 5 trên 22 tin đăng lọc</span>
            </div>
          </div>

          {/* Detail Panel */}
          {selectedDetail && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold text-slate-900">
                    ⭐ Hồ sơ Thẩm tra Tin
                  </div>
                  <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${RISK_BADGE_COLORS[selectedDetail.riskLevel]}`}>
                    {selectedDetail.id} {selectedDetail.riskLevel === 'high' ? 'NGHỊ VẤN CAO' : ''}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Image placeholder */}
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-slate-300" />
                    </div>
                  ))}
                </div>

                {/* AI Score */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-600">Đánh giá Gian lận & Rủi ro</span>
                    <span className={`text-lg font-black ${selectedDetail.aiScore < 50 ? 'text-red-600' : selectedDetail.aiScore < 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {selectedDetail.aiScore}/100
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className={`h-2 rounded-full transition-all ${selectedDetail.aiScore < 50 ? 'bg-red-500' : selectedDetail.aiScore < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${selectedDetail.aiScore}%` }}
                    />
                  </div>
                </div>

                {/* Seller Info */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-600">Thông tin Người bán:</div>
                  <div className="rounded-xl border border-slate-100 p-3 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white shrink-0">
                        {selectedDetail.seller.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{selectedDetail.seller}</div>
                        <div className="text-[10px] text-slate-500">{selectedDetail.mssv}</div>
                      </div>
                    </div>
                    {[
                      { label: 'Số điện thoại', value: '0988 ••• 210' },
                      { label: 'Email FPT', value: 'vuong@fpt.edu.vn' },
                      { label: 'Chat', value: 'Chuẩn duyệt' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{row.label}</span>
                        <span className="font-semibold text-slate-700">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="rounded-xl border-2 border-red-300 bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 cursor-pointer active:scale-95 transition">
                    🚫 Khóa & Cấm Rao
                  </button>
                  <button className="rounded-xl border-2 border-amber-300 bg-amber-50 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 cursor-pointer active:scale-95 transition">
                    ⚠️ Yêu cầu KYC
                  </button>
                </div>
                <button className="w-full rounded-xl bg-fpt-orange py-2.5 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer active:scale-95 transition shadow-xs">
                  ✅ Duyệt nhanh tin đăng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayoutShell>
  );
}
