'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  X,
  RefreshCw,
  Loader2,
  Video,
  Tag,
  MapPin,
  Truck,
} from 'lucide-react';
import { ProductService } from '@/services/productService';
import { formatCampusTag, extractImageUrl } from '@/lib/adapters';

type TabType = 'all' | 'pending' | 'risk' | 'live' | 'rejected';

export interface AdminPostItem {
  id: string;
  rawId: string;
  campus: string;
  category: string;
  status: 'PENDING_APPROVAL' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN' | 'REJECTED';
  riskLevel: 'high' | 'pccc' | 'clean' | 'rejected' | 'pending';
  riskBadge: string;
  title: string;
  description?: string;
  price: string;
  rawPrice: number;
  originalPrice?: string;
  condition?: string;
  meetupLocation?: string;
  allowShipping?: boolean;
  quantity?: number;
  hashtags?: string[];
  videoUrl?: string;
  seller: string;
  sellerId?: string;
  mssv: string;
  aiNote: string;
  aiScore: number;
  time: string;
  isCritical: boolean;
  imageUrl?: string;
  images: string[];
  phone?: string;
  email?: string;
  rejectionReason?: string;
  approvedAt?: string;
  updatedAt: string;
}

function adaptBackendToAdminPost(p: any): AdminPostItem {
  const title = p.title || 'Sản phẩm không có tên';
  const priceNum = Number(p.price) || 0;
  const isPccc = title.toLowerCase().includes('bếp') || title.toLowerCase().includes('ấm');
  const isHighRisk = priceNum > 10000000 || title.toLowerCase().includes('cọc ngoài');

  const status = p.status || 'PENDING_APPROVAL';

  let riskLevel: AdminPostItem['riskLevel'] = 'clean';
  let riskBadge = '✅ Đang hiển thị';

  if (status === 'REJECTED') {
    riskLevel = 'rejected';
    riskBadge = '🚫 Đã từ chối';
  } else if (status === 'PENDING_APPROVAL') {
    if (isHighRisk) {
      riskLevel = 'high';
      riskBadge = '🔴 Nghi vấn giá cao / Chờ duyệt';
    } else if (isPccc) {
      riskLevel = 'pccc';
      riskBadge = '⚠️ Lưu ý PCCC / Chờ duyệt';
    } else {
      riskLevel = 'pending';
      riskBadge = '⏳ Chờ BQT duyệt';
    }
  } else if (status === 'AVAILABLE') {
    riskLevel = 'clean';
    riskBadge = '✅ Đang hiển thị';
  }

  // Lấy danh sách ảnh
  const rawImages = Array.isArray(p.images)
    ? p.images.map(extractImageUrl).filter(Boolean)
    : Array.isArray(p.imageUrls)
    ? p.imageUrls.map(extractImageUrl).filter(Boolean)
    : [];
  const primaryImg = rawImages[0] || extractImageUrl(p.imageUrl) || '';

  const origPriceNum = Number(p.originalPrice) || 0;
  const originalPrice = origPriceNum > 0 ? `${origPriceNum.toLocaleString('vi-VN')} đ` : undefined;
  const condition = p.condition || p.conditionState || 'Chưa cập nhật';
  const meetupLocation = p.meetupLocation || p.location || 'Tại khuôn viên Campus';
  const allowShipping = Boolean(p.allowShipping ?? p.isShipmentSupported);
  const quantity = Number(p.quantity) || 1;
  const hashtags = Array.isArray(p.hashtags)
    ? p.hashtags
    : typeof p.hashtags === 'string' && p.hashtags.trim()
    ? p.hashtags.split(',').map((s: string) => s.trim())
    : [];
  const videoUrl = p.videoUrl || p.video || '';

  const sellerName =
    p.seller?.profile?.fullName || p.seller?.fullName || p.seller?.name || 'Sinh viên FPT';
  const studentId =
    p.seller?.profile?.kyc?.studentId ||
    p.seller?.profile?.cohort ||
    p.seller?.cohort ||
    'SV FPT';
  const phone =
    p.seller?.profile?.phoneNumber || p.seller?.phoneNumber || 'Chưa cung cấp';
  const email = p.seller?.email || 'student@fpt.edu.vn';

  return {
    id: `#POST-${(p.id || '').slice(-4).toUpperCase()}`,
    rawId: p.id,
    campus: formatCampusTag(p.campus),
    category: typeof p.category === 'object' ? p.category?.name : (p.category || p.categoryType || 'Khác'),
    status,
    riskLevel,
    riskBadge,
    title,
    description: p.description,
    price: `${priceNum.toLocaleString('vi-VN')} đ`,
    rawPrice: priceNum,
    originalPrice,
    condition,
    meetupLocation,
    allowShipping,
    quantity,
    hashtags,
    videoUrl,
    seller: sellerName,
    sellerId: p.sellerId || p.seller?.id,
    mssv: studentId,
    aiNote: p.rejectionReason
      ? `🚫 Lý do từ chối: ${p.rejectionReason}`
      : isHighRisk
      ? '⚠️ CẢNH BÁO GIÁ TRỊ CAO: Đề xuất giao dịch tại điểm Safe-Handoff có camera giám sát và ký quỹ Escrow bảo hộ 48h.'
      : isPccc
      ? '⚠️ Cảnh báo quy chế KTX: Thiết bị điện cần kiểm tra công suất phù hợp định mức điện an toàn PCCC KTX FPT.'
      : status === 'PENDING_APPROVAL'
      ? '⏳ Hồ sơ mới đăng: Đang đợi Ban Quản Trị xem xét duyệt nội dung trước khi xuất bản ra thị trường.'
      : '✅ Verified: Đã duyệt bài và đang hiển thị công khai trên chợ sinh viên.',
    aiScore: status === 'REJECTED' ? 10 : isHighRisk ? 45 : isPccc ? 65 : 95,
    time: p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong',
    isCritical: isHighRisk && status === 'PENDING_APPROVAL',
    imageUrl: primaryImg,
    images: rawImages.length > 0 ? rawImages : (primaryImg ? [primaryImg] : []),
    phone,
    email,
    rejectionReason: p.rejectionReason,
    approvedAt: p.approvedAt,
    updatedAt: p.updatedAt,
  };
}

const RISK_COLORS: Record<string, string> = {
  high: 'border-l-4 border-red-500 bg-red-50/40',
  pending: 'border-l-4 border-amber-400 bg-amber-50/20',
  pccc: 'border-l-4 border-amber-500 bg-amber-50/30',
  clean: 'border-l-4 border-emerald-400',
  rejected: 'border-l-4 border-slate-400 bg-slate-100/60 opacity-80',
};

const RISK_BADGE_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  pccc: 'bg-amber-100 text-amber-700 border-amber-200',
  clean: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-slate-200 text-slate-700 border-slate-300',
};

const QUICK_REJECT_REASONS = [
  'Ảnh không phải ảnh chụp thực tế hoặc tải từ mạng.',
  'Thiết bị điện công suất lớn vi phạm an toàn PCCC KTX FPT.',
  'Mô tả hoặc tiêu đề chứa thông tin gian lận, cọc ngoài sàn.',
  'Giá bán không trung thực hoặc sai lệch so với giá trị món đồ.',
  'Hàng hóa thuộc danh mục bị cấm trao đổi trong khuôn viên trường.',
];

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedDetail, setSelectedDetail] = useState<AdminPostItem | null>(null);
  const [processedCount, setProcessedCount] = useState(0);

  // Thống kê số lượng theo thời gian thực từ database
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    live: 0,
    rejected: 0,
  });

  // Modal Từ chối tin
  const [rejectModalTarget, setRejectModalTarget] = useState<AdminPostItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Toast thông báo
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tải dữ liệu từ backend
  const fetchProducts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await ProductService.getAdminProducts({
        campus: selectedCampus === 'all' ? undefined : selectedCampus,
        search: searchTerm.trim() || undefined,
        limit: 50,
      });

      const mapped = (res.products || []).map(adaptBackendToAdminPost);
      setPosts(mapped);

      // Cập nhật bộ đếm thật
      const pendingNum = mapped.filter((p) => p.status === 'PENDING_APPROVAL').length;
      const liveNum = mapped.filter((p) => p.status === 'AVAILABLE').length;
      const rejectedNum = mapped.filter((p) => p.status === 'REJECTED').length;

      setCounts({
        all: res.counts?.all ?? mapped.length,
        pending: res.counts?.pending ?? pendingNum,
        live: res.counts?.live ?? liveNum,
        rejected: res.counts?.rejected ?? rejectedNum,
      });

      if (mapped.length > 0 && (!selectedDetail || !mapped.some((p) => p.rawId === selectedDetail.rawId))) {
        setSelectedDetail(mapped[0]);
      }
    } catch (err: any) {
      showToast(err?.message || 'Không thể tải danh sách tin đăng từ máy chủ', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCampus, searchTerm, selectedDetail]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCampus]);

  // Phê duyệt 1 tin đăng (gọi API thật)
  const handleApprove = async (rawId: string) => {
    try {
      const currentPost = posts.find((post) => post.rawId === rawId);
      if (!currentPost?.updatedAt) throw new Error('Thiếu thời điểm cập nhật tin. Vui lòng tải lại danh sách.');
      await ProductService.approveProduct(rawId, currentPost.updatedAt);
      setPosts((prev) =>
        prev.map((p) =>
          p.rawId === rawId
            ? {
                ...p,
                status: 'AVAILABLE',
                riskLevel: 'clean',
                riskBadge: '✅ Đang hiển thị',
                aiNote: '✅ Verified: Đã duyệt bài và đang hiển thị công khai trên chợ sinh viên.',
                aiScore: 95,
              }
            : p
        )
      );

      if (selectedDetail?.rawId === rawId) {
        setSelectedDetail((prev) =>
          prev
            ? {
                ...prev,
                status: 'AVAILABLE',
                riskLevel: 'clean',
                riskBadge: '✅ Đang hiển thị',
                aiNote: '✅ Verified: Đã duyệt bài và đang hiển thị công khai trên chợ sinh viên.',
                aiScore: 95,
              }
            : null
        );
      }

      setProcessedCount((c) => c + 1);
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        live: prev.live + 1,
      }));
      showToast('✅ Đã duyệt và kích hoạt tin đăng hiển thị trên sàn!');
    } catch (err: any) {
      if (err?.response?.status === 409) await fetchProducts(true);
      showToast(`🚫 Lỗi duyệt tin: ${err?.message || 'Vui lòng thử lại'}`, 'error');
    }
  };

  // Mở modal từ chối
  const openRejectModal = (post: AdminPostItem) => {
    setRejectModalTarget(post);
    setRejectReason(QUICK_REJECT_REASONS[0]);
  };

  // Xác nhận từ chối tin đăng (gọi API thật)
  const handleConfirmReject = async () => {
    if (!rejectModalTarget) return;
    if (!rejectReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối tin đăng', 'error');
      return;
    }

    try {
      setIsRejecting(true);
      await ProductService.rejectProduct(rejectModalTarget.rawId, rejectReason.trim(), rejectModalTarget.updatedAt);

      setPosts((prev) =>
        prev.map((p) =>
          p.rawId === rejectModalTarget.rawId
            ? {
                ...p,
                status: 'REJECTED',
                riskLevel: 'rejected',
                riskBadge: '🚫 Đã từ chối',
                aiNote: `🚫 Lý do từ chối: ${rejectReason.trim()}`,
                aiScore: 10,
                rejectionReason: rejectReason.trim(),
              }
            : p
        )
      );

      if (selectedDetail?.rawId === rejectModalTarget.rawId) {
        setSelectedDetail((prev) =>
          prev
            ? {
                ...prev,
                status: 'REJECTED',
                riskLevel: 'rejected',
                riskBadge: '🚫 Đã từ chối',
                aiNote: `🚫 Lý do từ chối: ${rejectReason.trim()}`,
                aiScore: 10,
                rejectionReason: rejectReason.trim(),
              }
            : null
        );
      }

      setProcessedCount((c) => c + 1);
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        rejected: prev.rejected + 1,
      }));

      showToast('🚫 Đã từ chối tin đăng và gửi thông báo lý do tới người bán!');
      setRejectModalTarget(null);
      setRejectReason('');
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setRejectModalTarget(null);
        await fetchProducts(true);
      }
      showToast(`🚫 Lỗi từ chối: ${err?.message || 'Vui lòng thử lại'}`, 'error');
    } finally {
      setIsRejecting(false);
    }
  };

  // Duyệt nhanh tất cả tin an toàn đang chờ duyệt
  const handleApproveAllClean = async () => {
    const toApprove = posts.filter(
      (p) => p.status === 'PENDING_APPROVAL' && !p.isCritical && p.riskLevel !== 'high'
    );

    if (toApprove.length === 0) {
      showToast('Không có tin hợp lệ nào để duyệt nhanh', 'info');
      return;
    }

    let successCount = 0;
    for (const item of toApprove) {
      try {
        await ProductService.approveProduct(item.rawId, item.updatedAt);
        successCount++;
      } catch {
        // bỏ qua lỗi đơn lẻ
      }
    }

    await fetchProducts(true);
    setProcessedCount((c) => c + successCount);
    showToast(`⚡ Đã duyệt nhanh thành công ${successCount} tin đăng an toàn!`);
  };

  // Tính số lượng cho các tab
  const riskCount = posts.filter((p) => p.riskLevel === 'high' || p.riskLevel === 'pccc').length;

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (activeTab === 'pending' && p.status !== 'PENDING_APPROVAL') return false;
      if (activeTab === 'risk' && p.riskLevel !== 'high' && p.riskLevel !== 'pccc') return false;
      if (activeTab === 'live' && p.status !== 'AVAILABLE') return false;
      if (activeTab === 'rejected' && p.status !== 'REJECTED') return false;

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
    { key: 'all', label: 'Tất cả', count: counts.all },
    { key: 'pending', label: 'Chờ duyệt', count: counts.pending },
    { key: 'risk', label: 'Nguy cơ vi phạm', count: riskCount },
    { key: 'live', label: 'Đang hiển thị', count: counts.live },
    { key: 'rejected', label: 'Bị từ chối', count: counts.rejected },
  ];

  return (
    <AdminLayoutShell>
      <div className="space-y-5 max-w-full font-sans">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-semibold mb-1">
                Vận hành thị trường / <span className="text-fpt-orange font-bold">Listing Moderation Hub</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                Quản lý & Phê duyệt Tin đăng
                {loading && <Loader2 className="h-4 w-4 animate-spin text-fpt-orange" />}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quy trình kiểm duyệt bắt buộc: Tin đăng của sinh viên chỉ hiển thị công khai sau khi được BQT thẩm định.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => fetchProducts(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-fpt-orange' : ''}`} />
                Làm mới
              </button>
              <button
                onClick={handleApproveAllClean}
                disabled={counts.pending === 0}
                className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Zap className="h-4 w-4" />
                Duyệt nhanh tin ({counts.pending} chờ)
              </button>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                icon: <Clock className="h-5 w-5 text-amber-600" />,
                label: 'Chờ duyệt thật',
                value: String(counts.pending),
                sub: 'Đang xếp hàng chờ BQT',
                bg: 'bg-amber-50 border-amber-200',
              },
              {
                icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
                label: 'Nghi vấn rủi ro',
                value: String(riskCount),
                sub: 'PCCC hoặc giá trị lớn',
                bg: 'bg-red-50 border-red-200',
              },
              {
                icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
                label: 'Đã duyệt phiên này',
                value: String(processedCount),
                sub: 'Thao tác thời gian thực',
                bg: 'bg-emerald-50 border-emerald-200',
              },
              {
                icon: <Activity className="h-5 w-5 text-blue-600" />,
                label: 'Tin đang hiển thị',
                value: String(counts.live),
                sub: 'Khả dụng trên sàn',
                bg: 'bg-blue-50 border-blue-200',
              },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                <div className="flex items-center gap-2 mb-2">{s.icon}</div>
                <div className="text-xl font-black text-slate-900">{s.value}</div>
                <div className="text-[11px] font-semibold text-slate-700 mt-0.5">{s.label}</div>
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
              placeholder="Tìm kiếm theo tiêu đề, tên sinh viên, MSSV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts(true)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-fpt-orange/50 focus:outline-hidden focus:ring-2 focus:ring-fpt-orange/20 transition"
            />
          </div>
          <div className="relative">
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-8 text-sm font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả 5 cơ sở</option>
              <option value="HOL">Hòa Lạc (Hà Nội)</option>
              <option value="HCM">TP. Hồ Chí Minh</option>
              <option value="DAD">Đà Nẵng</option>
              <option value="QN">Quy Nhơn</option>
              <option value="CT">Cần Thơ</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
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
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
              <div className="ml-auto text-[11px] text-slate-400 whitespace-nowrap">
                {filteredPosts.length} tin bài
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
              {loading ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-fpt-orange" />
                  <span className="text-xs">Đang tải danh sách tin kiểm duyệt...</span>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  Không tìm thấy tin đăng nào trong danh mục này.
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.rawId}
                    onClick={() => setSelectedDetail(post)}
                    className={`p-4 cursor-pointer hover:bg-slate-50 transition ${
                      RISK_COLORS[post.riskLevel] || ''
                    } ${
                      selectedDetail?.rawId === post.rawId
                        ? 'bg-orange-50/40 ring-2 ring-inset ring-orange-200'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                            {post.id}
                          </span>
                          <span className="text-[10px] text-slate-500">{post.campus}</span>
                          <span className="text-[10px] text-slate-500">{post.category}</span>
                          <span
                            className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${
                              RISK_BADGE_COLORS[post.riskLevel] || ''
                            }`}
                          >
                            {post.riskBadge}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 truncate">{post.title}</h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          • Người bán: <strong className="text-slate-700">{post.seller}</strong> ({post.mssv})
                        </div>

                        <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200/60 px-3 py-2 text-[11px] text-slate-700 flex items-start gap-1.5">
                          <Bot className="h-3.5 w-3.5 mt-0.5 shrink-0 text-fpt-orange" />
                          <span className="line-clamp-2">{post.aiNote}</span>
                        </div>

                        {/* Buttons cho trạng thái PENDING_APPROVAL */}
                        {post.status === 'PENDING_APPROVAL' && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(post.rawId);
                              }}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white cursor-pointer hover:bg-emerald-700 shadow-2xs transition"
                            >
                              ✓ Phê duyệt tin
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openRejectModal(post);
                              }}
                              className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 cursor-pointer hover:bg-red-100 transition"
                            >
                              🚫 Từ chối
                            </button>
                          </div>
                        )}

                        {post.status === 'AVAILABLE' && (
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openRejectModal(post);
                              }}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-red-600 cursor-pointer hover:bg-red-50"
                            >
                              Khóa / Gỡ tin
                            </button>
                          </div>
                        )}

                        {post.status === 'REJECTED' && (
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(post.rawId);
                              }}
                              className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 cursor-pointer hover:bg-emerald-100"
                            >
                              Duyệt ngoại lệ lại
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-black text-fpt-orange">{post.price}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{post.time}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 flex items-center justify-between px-4 py-3">
              <span className="text-xs text-slate-500">
                Hiển thị {filteredPosts.length} trên {posts.length} tin đăng
              </span>
            </div>
          </div>

          {/* Detail Panel */}
          {selectedDetail ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-fpt-orange" />
                    Hồ sơ Thẩm định Tin đăng
                  </div>
                  <span
                    className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${
                      RISK_BADGE_COLORS[selectedDetail.riskLevel]
                    }`}
                  >
                    {selectedDetail.id}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[750px] overflow-y-auto">
                {/* Images */}
                <div className="grid grid-cols-2 gap-2">
                  {selectedDetail.images.length > 0 ? (
                    selectedDetail.images.slice(0, 4).map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group"
                      >
                        <img
                          src={img}
                          alt={`${selectedDetail.title} - ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Ảnh bìa
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 aspect-video rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs">
                      <Camera className="h-6 w-6 mb-1 text-slate-300" />
                      Chưa có hình ảnh
                    </div>
                  )}
                </div>

                {/* Tiêu đề & Giá */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1">
                  <div className="text-xs text-slate-500 font-semibold">{selectedDetail.category} • {selectedDetail.campus}</div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {selectedDetail.title}
                  </h3>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-lg font-black text-fpt-orange">
                      {selectedDetail.price}
                    </span>
                    {selectedDetail.originalPrice && (
                      <span className="text-xs text-slate-400 font-medium line-through">
                        Gốc: {selectedDetail.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Video thực tế (nếu người bán upload) */}
                {selectedDetail.videoUrl && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5 text-fpt-orange" />
                      <span>Video quay cận cảnh thực tế món đồ:</span>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-black aspect-video border border-slate-200 shadow-inner">
                      <video
                        src={selectedDetail.videoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                        preload="metadata"
                      >
                        Trình duyệt không hỗ trợ xem video trực tiếp.
                      </video>
                    </div>
                  </div>
                )}

                {/* Chi tiết thông số đăng ký */}
                <div className="rounded-xl border border-slate-200/80 p-3 space-y-2 bg-slate-50/70 text-xs">
                  <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                    <span>Thông tin chi tiết người bán khai báo:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Đăng: {selectedDetail.time}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-white p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Tình trạng ngoại quan</span>
                      <span className="font-bold text-slate-800">{selectedDetail.condition || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Số lượng kho</span>
                      <span className="font-bold text-slate-800">{selectedDetail.quantity ?? 1} món</span>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-slate-100 col-span-2">
                      <span className="text-slate-400 block text-[10px]">Phương thức giao dịch</span>
                      <span className={`font-bold flex items-center gap-1 mt-0.5 ${selectedDetail.allowShipping ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {selectedDetail.allowShipping ? <Truck className="h-3.5 w-3.5 text-emerald-600" /> : <MapPin className="h-3.5 w-3.5 text-fpt-orange" />}
                        {selectedDetail.allowShipping ? 'Hỗ trợ giao hàng qua GHN / Ship liên Campus' : 'Chỉ giao dịch trực tiếp mặt đối mặt tại trường'}
                      </span>
                    </div>
                  </div>

                  {selectedDetail.meetupLocation && (
                    <div className="text-[11px] pt-1.5 border-t border-slate-200/60 flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-fpt-orange shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500">Điểm hẹn trực tiếp mong muốn: </span>
                        <strong className="text-slate-800">{selectedDetail.meetupLocation}</strong>
                      </div>
                    </div>
                  )}

                  {selectedDetail.hashtags && selectedDetail.hashtags.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-200/60">
                      <div className="text-[10px] text-slate-500 mb-1 flex items-center gap-1">
                        <Tag className="h-3 w-3 text-slate-400" />
                        <span>Từ khóa gắn thẻ (Hashtags):</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedDetail.hashtags.map((h, i) => (
                          <span key={i} className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 font-medium">
                            #{h.replace(/^#/, '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI & BQT Notes */}
                <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                      <Bot className="h-3.5 w-3.5 text-amber-700" />
                      Ghi chú Thẩm định:
                    </span>
                    <span
                      className={`text-xs font-black ${
                        selectedDetail.status === 'REJECTED'
                          ? 'text-red-600'
                          : selectedDetail.status === 'AVAILABLE'
                          ? 'text-emerald-600'
                          : 'text-amber-700'
                      }`}
                    >
                      {selectedDetail.status === 'AVAILABLE' ? 'ĐÃ DUYỆT' : selectedDetail.status === 'REJECTED' ? 'TỪ CHỐI' : 'CHỜ DUYỆT'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedDetail.aiNote}
                  </p>
                </div>

                {/* Mô tả chi tiết */}
                {selectedDetail.description && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-600">Mô tả của người bán:</div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto">
                      {selectedDetail.description}
                    </p>
                  </div>
                )}

                {/* Seller Info */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-600">Thông tin Người bán:</div>
                  <div className="rounded-xl border border-slate-100 p-3 space-y-1.5 bg-white shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-fpt-orange text-xs font-bold text-white shrink-0">
                        {selectedDetail.seller.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{selectedDetail.seller}</div>
                        <div className="text-[10px] text-slate-500">Khóa / MSSV: {selectedDetail.mssv}</div>
                      </div>
                    </div>
                    {[
                      { label: 'Số điện thoại', value: selectedDetail.phone || 'Chưa cập nhật' },
                      { label: 'Email tài khoản', value: selectedDetail.email || 'student@fpt.edu.vn' },
                      { label: 'Cơ sở đăng bán', value: selectedDetail.campus },
                      { label: 'Trạng thái bài', value: selectedDetail.status },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">{row.label}</span>
                        <span className="font-semibold text-slate-700">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  {selectedDetail.status === 'PENDING_APPROVAL' ? (
                    <>
                      <button
                        onClick={() => handleApprove(selectedDetail.rawId)}
                        className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer active:scale-95 transition shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="h-4 w-4" />
                        ✅ Phê duyệt & Đưa lên sàn ngay
                      </button>
                      <button
                        onClick={() => openRejectModal(selectedDetail)}
                        className="w-full rounded-xl border border-red-300 bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="h-4 w-4" />
                        🚫 Từ chối bài đăng
                      </button>
                    </>
                  ) : selectedDetail.status === 'AVAILABLE' ? (
                    <button
                      onClick={() => openRejectModal(selectedDetail)}
                      className="w-full rounded-xl border border-red-300 bg-red-50 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4" />
                      🚫 Khóa tin / Gỡ khỏi trang chủ
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(selectedDetail.rawId)}
                      className="w-full rounded-xl bg-fpt-orange py-2.5 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer active:scale-95 transition shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="h-4 w-4" />
                      ✓ Duyệt ngoại lệ (Khôi phục hiển thị)
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
              Chọn một bài đăng bên trái để xem hồ sơ thẩm định.
            </div>
          )}
        </div>

        {/* Modal Từ chối tin đăng */}
        {rejectModalTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-red-600 font-bold text-base">
                  <ShieldAlert className="h-5 w-5" />
                  Từ chối duyệt bài đăng
                </div>
                <button
                  onClick={() => setRejectModalTarget(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <div className="text-xs text-slate-500 font-medium">Món đồ:</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                  {rejectModalTarget.title} ({rejectModalTarget.id})
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Người bán: {rejectModalTarget.seller} ({rejectModalTarget.mssv})
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Chọn lý do nhanh:
                </label>
                <div className="space-y-1.5">
                  {QUICK_REJECT_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRejectReason(r)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-medium border transition ${
                        rejectReason === r
                          ? 'border-red-400 bg-red-50 text-red-700 font-bold'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      • {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nội dung lý do gửi cho Người bán:
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-red-500 focus:outline-hidden focus:ring-2 focus:ring-red-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalTarget(null)}
                  disabled={isRejecting}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={isRejecting || !rejectReason.trim()}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isRejecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 shadow-xl backdrop-blur-md text-xs sm:text-sm font-semibold text-white animate-in slide-in-from-bottom-4 duration-200 ${
              toastMessage.type === 'error'
                ? 'bg-red-600'
                : toastMessage.type === 'info'
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}
      </div>
    </AdminLayoutShell>
  );
}
