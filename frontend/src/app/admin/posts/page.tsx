'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { useProductStore } from '@/stores/productStore';
import { ProductService } from '@/services/productService';
import { ProductItem } from '@/types/product';

type TabType = 'all' | 'pending' | 'risk' | 'live' | 'rejected';

export interface AdminPostItem {
  id: string;
  rawId: string;
  campus: string;
  category: string;
  riskLevel: 'high' | 'pccc' | 'clean' | 'rejected';
  riskBadge: string;
  title: string;
  price: string;
  seller: string;
  mssv: string;
  aiNote: string;
  aiScore: number;
  time: string;
  isCritical: boolean;
  imageUrl?: string;
  phone?: string;
  email?: string;
}

function adaptProductToAdminPost(p: ProductItem): AdminPostItem {
  const isPccc = p.title.toLowerCase().includes('bếp') || p.title.toLowerCase().includes('ấm');
  const isHighRisk = p.price > 10000000 || p.title.toLowerCase().includes('cọc ngoài');
  const riskLevel: 'high' | 'pccc' | 'clean' | 'rejected' = isHighRisk ? 'high' : isPccc ? 'pccc' : 'clean';
  const riskBadge = isHighRisk ? '🔴 Cần thẩm tra' : isPccc ? '⚠️ Lưu ý PCCC' : '✅ An toàn/Clean';

  return {
    id: `#POST-${p.id.slice(-4).toUpperCase()}`,
    rawId: p.id,
    campus: p.campus || 'Hòa Lạc',
    category: p.category || 'Đồ dùng học tập',
    riskLevel,
    riskBadge,
    title: p.title,
    price: `${p.price.toLocaleString('vi-VN')}đ`,
    seller: p.seller?.name || 'Sinh viên FPT',
    mssv: p.seller?.studentId || p.seller?.badge || 'K19',
    aiNote: isHighRisk
      ? '⚠️ CẢNH BÁO GIÁ TRỊ CAO: Đề xuất giao dịch tại điểm Safe-Handoff có camera giám sát và ký quỹ Escrow bảo hộ 48h.'
      : isPccc
      ? '⚠️ Cảnh báo quy chế KTX: Thiết bị điện cần kiểm tra công suất phù hợp định mức điện an toàn PCCC KTX FPT.'
      : '✅ AI Verified: Đã đối soát tài khoản sinh viên FPT và nội dung tin đăng không vi phạm quy chế sàn.',
    aiScore: isHighRisk ? 45 : isPccc ? 65 : 92,
    time: p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay',
    isCritical: isHighRisk,
    imageUrl: p.imageUrl,
    phone: p.seller?.phoneNumber || '0988 ••• 210',
    email: p.seller?.email || 'student@fpt.edu.vn',
  };
}

const RISK_COLORS: Record<string, string> = {
  high: 'border-l-4 border-red-400 bg-red-50/30',
  clean: '',
  pccc: 'border-l-4 border-amber-400 bg-amber-50/20',
  rejected: 'border-l-4 border-slate-400 bg-slate-100/50 opacity-70',
};

const RISK_BADGE_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  clean: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pccc: 'bg-amber-100 text-amber-700 border-amber-200',
  rejected: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function AdminPostsPage() {
  const storeProducts = useProductStore((state) => state.products);
  const [posts, setPosts] = useState<AdminPostItem[]>(() => storeProducts.map(adaptProductToAdminPost));
  const [processedCount, setProcessedCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetail, setSelectedDetail] = useState<AdminPostItem | null>(null);

  useEffect(() => {
    ProductService.getAllProducts().then((res) => {
      const mapped = (res || []).map(adaptProductToAdminPost);
      setPosts(mapped);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedDetail && posts.length > 0) {
      setSelectedDetail(posts[0]);
    }
  }, [posts, selectedDetail]);

  const handleApprove = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, riskLevel: 'clean', isCritical: false, riskBadge: '✅ Đã duyệt' } : p))
    );
    setProcessedCount((c) => c + 1);
  };

  const handleReject = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, riskLevel: 'rejected', riskBadge: '🚫 Đã từ chối' } : p))
    );
    setProcessedCount((c) => c + 1);
  };

  const handleApproveAllClean = () => {
    const toApprove = posts.filter((p) => !p.isCritical && p.riskLevel !== 'clean' && p.riskLevel !== 'rejected');
    setPosts((prev) =>
      prev.map((p) => (!p.isCritical && p.riskLevel !== 'clean' && p.riskLevel !== 'rejected' ? { ...p, riskLevel: 'clean', riskBadge: '✅ Đã duyệt' } : p))
    );
    setProcessedCount((c) => c + toApprove.length);
  };

  const pendingCount = posts.filter((p) => p.riskLevel !== 'clean' && p.riskLevel !== 'rejected').length;
  const riskCount = posts.filter((p) => p.riskLevel === 'high' || p.riskLevel === 'pccc').length;
  const liveCount = posts.filter((p) => p.riskLevel === 'clean').length;
  const rejectedCount = posts.filter((p) => p.riskLevel === 'rejected').length;

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (activeTab === 'pending' && (p.riskLevel === 'clean' || p.riskLevel === 'rejected')) return false;
      if (activeTab === 'risk' && p.riskLevel !== 'high' && p.riskLevel !== 'pccc') return false;
      if (activeTab === 'live' && p.riskLevel !== 'clean') return false;
      if (activeTab === 'rejected' && p.riskLevel !== 'rejected') return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.mssv.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [posts, activeTab, searchTerm]);

  const TABS: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: posts.length },
    { key: 'pending', label: 'Chờ duyệt', count: pendingCount },
    { key: 'risk', label: 'Nguy cơ vi phạm', count: riskCount },
    { key: 'live', label: 'Đang hiển thị', count: liveCount },
    { key: 'rejected', label: 'Bị từ chối', count: rejectedCount },
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
              <button
                onClick={handleApproveAllClean}
                className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs"
              >
                <Zap className="h-4 w-4" />
                Duyệt nhanh tin ({pendingCount} tin)
              </button>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: <FileText className="h-5 w-5 text-amber-500" />, label: 'Chờ duyệt tổng', value: String(pendingCount), sub: 'Đang chờ xử lý', bg: 'bg-amber-50 border-amber-100' },
              { icon: <AlertTriangle className="h-5 w-5 text-red-500" />, label: 'Nghi vấn rủi ro cao', value: String(riskCount), sub: 'Cần kiểm tra kỹ', bg: 'bg-red-50 border-red-100' },
              { icon: <CheckCircle className="h-5 w-5 text-emerald-500" />, label: 'Đã xử lý phiên này', value: String(processedCount), sub: 'Thao tác BQT', bg: 'bg-emerald-50 border-emerald-100' },
              { icon: <Activity className="h-5 w-5 text-blue-500" />, label: 'Tin đang hiển thị', value: String(liveCount), sub: 'Hoạt động an toàn', bg: 'bg-blue-50 border-blue-100' },
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
              {filteredPosts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Không tìm thấy tin đăng nào trong mục này.
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setSelectedDetail(post)}
                    className={`p-4 cursor-pointer hover:bg-slate-50 transition ${RISK_COLORS[post.riskLevel] || ''} ${selectedDetail?.id === post.id ? 'bg-blue-50/30 ring-2 ring-inset ring-blue-200' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{post.id}</span>
                          <span className="text-[10px] text-slate-500">{post.campus}</span>
                          <span className="text-[10px] text-slate-500">{post.category}</span>
                          <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${RISK_BADGE_COLORS[post.riskLevel] || ''}`}>
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
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReject(post.id); }}
                              className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600 cursor-pointer hover:bg-slate-50"
                            >
                              Khoá tin & Cảnh cáo User
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApprove(post.id); }}
                              className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white cursor-pointer hover:bg-emerald-600"
                            >
                              ✓ Duyệt ngoại lệ
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReject(post.id); }}
                              className="rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white cursor-pointer hover:bg-red-600"
                            >
                              🚫 Khoá tin ngay
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-fpt-orange">{post.price}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{post.time}</div>
                        {!post.isCritical && post.riskLevel !== 'rejected' && (
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReject(post.id); }}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 cursor-pointer hover:bg-slate-50"
                            >
                              Từ chối
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApprove(post.id); }}
                              className="rounded-lg bg-fpt-orange px-2 py-1 text-[10px] font-bold text-white cursor-pointer hover:bg-fpt-orange-hover"
                            >
                              ✓ Phê duyệt
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 flex items-center justify-between px-4 py-3">
              <span className="text-xs text-slate-500">Hiển thị {filteredPosts.length} trên {posts.length} tin đăng lọc</span>
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
                  {selectedDetail.imageUrl ? (
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={selectedDetail.imageUrl}
                        alt={selectedDetail.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <Camera className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                  {[1, 2, 3].map((i) => (
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
                      { label: 'Số điện thoại', value: selectedDetail.phone || 'Chưa cập nhật' },
                      { label: 'Email FPT', value: selectedDetail.email || 'student@fpt.edu.vn' },
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
