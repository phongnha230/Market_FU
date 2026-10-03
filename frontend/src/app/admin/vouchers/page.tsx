'use client';

import React, { useState, useEffect } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import {
  Ticket,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Coffee,
  Utensils,
  Store,
  Sparkles,
  Coins,
  ShieldCheck,
  Camera,
  GraduationCap,
  MapPin,
  Clock,
  Edit2,
  Check,
  PlusCircle,
  Award,
} from 'lucide-react';
import {
  voucherService,
  BackendVoucher,
  VoucherPartner,
} from '@/services/voucherService';

const PARTNER_LABELS: Record<VoucherPartner, { name: string; color: string; icon: any }> = {
  CANTEEN: { name: 'Căn tin FPT', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Utensils },
  PASSIO: { name: 'Passio Coffee', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Coffee },
  SEVEN_ELEVEN: { name: '7-Eleven', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Store },
  OTHER: { name: 'Đối tác khác', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Sparkles },
};

interface AdminQuestItem {
  id: string;
  title: string;
  coins: number;
  description: string;
  iconType: 'review' | 'kyc' | 'post' | 'safepoint' | 'other';
  isActive: boolean;
  weeklyLimit: number;
  claimedThisWeek: number;
  managedBy: string;
}

const INITIAL_ADMIN_QUESTS: AdminQuestItem[] = [
  {
    id: 'quest-review',
    title: 'Đánh giá kèm ảnh/video sau nhận đồ',
    coins: 50,
    description: 'Giúp cộng đồng sinh viên minh bạch chất lượng đồ cũ đã qua sử dụng và tăng điểm uy tín.',
    iconType: 'review',
    isActive: true,
    weeklyLimit: 1,
    claimedThisWeek: 0,
    managedBy: 'Ban Quản Trị Sàn',
  },
  {
    id: 'quest-kyc',
    title: 'Xác thực KYC Thẻ SV & Mail FPT',
    coins: 100,
    description: 'Liên kết bảo mật tài khoản SSO @fpt.edu.vn kích hoạt huy hiệu sinh viên chuẩn 5Campus.',
    iconType: 'kyc',
    isActive: true,
    weeklyLimit: 1,
    claimedThisWeek: 0,
    managedBy: 'Phòng CTSV FPT',
  },
  {
    id: 'quest-post',
    title: 'Đăng bán 01 món đồ học tập cũ không dùng',
    coins: 30,
    description: 'Pass lại máy tính Casio, giáo trình kỳ trước hoặc phụ kiện KTX cho các em khóa dưới.',
    iconType: 'post',
    isActive: true,
    weeklyLimit: 3,
    claimedThisWeek: 0,
    managedBy: 'Đoàn Thanh Niên FPT',
  },
  {
    id: 'quest-safepoint',
    title: 'Giao dịch an toàn tại Safe-Handoff Point',
    coins: 40,
    description: 'Check-in giao nhận tại Sảnh Tòa Alpha, Reta hoặc Bàn Tiếp nhận Thư viện trường.',
    iconType: 'safepoint',
    isActive: true,
    weeklyLimit: 2,
    claimedThisWeek: 0,
    managedBy: 'Phòng An Ninh & CTSV',
  },
];

const DEFAULT_ADMIN_VOUCHERS: BackendVoucher[] = [
  {
    id: 'vch-canteen-10k',
    title: 'Voucher Cơm Căn Tin 10.000đ',
    description: 'Áp dụng cho mọi suất cơm trưa/tối tại Căng-tin Tòa Gamma (Hola) và Canteen Q.9 (HCM).',
    partner: 'CANTEEN',
    coinCost: 10,
    discountValue: 10000,
    quantity: 85,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    validDays: 14,
    isActive: true,
  },
  {
    id: 'vch-passio-15k',
    title: 'Giảm 15.000đ Passio Coffee Campus',
    description: 'Áp dụng cho mọi món nước Cà phê sữa, Trà đào hạt sen size L tại quầy Passio trong trường.',
    partner: 'PASSIO',
    coinCost: 15,
    discountValue: 15000,
    quantity: 120,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    validDays: 30,
    isActive: true,
  },
  {
    id: 'vch-7eleven-20k',
    title: 'Phiếu Mua Hàng 20.000đ 7-Eleven KTX',
    description: 'Giảm trực tiếp khi mua bánh mì, xúc xích nướng, đồ uống giải khát tại 7-Eleven sảnh KTX.',
    partner: 'SEVEN_ELEVEN',
    coinCost: 20,
    discountValue: 20000,
    quantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    validDays: 20,
    isActive: true,
  },
  {
    id: 'vch-ship-free',
    title: 'Miễn Phí Vận Chuyển CampusShip',
    description: 'Trợ giá 100% cước giao hàng nội bộ giữa các KTX và liên Campus FPT toàn quốc.',
    partner: 'OTHER',
    coinCost: 25,
    discountValue: 25000,
    quantity: 200,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    validDays: 45,
    isActive: true,
  },
];

export default function AdminVouchersPage() {
  const [activeAdminTab, setActiveAdminTab] = useState<'vouchers' | 'quests'>('vouchers');

  // Vouchers state
  const [vouchers, setVouchers] = useState<BackendVoucher[]>(DEFAULT_ADMIN_VOUCHERS);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quests state
  const [quests, setQuests] = useState<AdminQuestItem[]>(INITIAL_ADMIN_QUESTS);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [editingCoins, setEditingCoins] = useState<number>(40);
  const [questFormData, setQuestFormData] = useState({
    title: '',
    description: '',
    coins: 40,
    iconType: 'other' as AdminQuestItem['iconType'],
    managedBy: 'Phòng CTSV FPT',
    weeklyLimit: 1,
  });

  // Voucher Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    partner: 'CANTEEN' as VoucherPartner,
    coinCost: 50,
    discountValue: 10000,
    quantity: 100,
    validDays: 30,
    imageUrl: '',
  });

  const loadVouchers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const params = selectedPartner !== 'ALL' ? { partner: selectedPartner as VoucherPartner } : undefined;
      const res = await voucherService.getVouchers(params);
      if (res.vouchers && res.vouchers.length > 0) {
        setVouchers(res.vouchers);
      } else {
        const filtered = selectedPartner !== 'ALL'
          ? DEFAULT_ADMIN_VOUCHERS.filter((v) => v.partner === selectedPartner)
          : DEFAULT_ADMIN_VOUCHERS;
        setVouchers(filtered);
      }
    } catch (err: any) {
      console.warn('⚠️ [Admin Vouchers API]:', err?.message || err);
      const filtered = selectedPartner !== 'ALL'
        ? DEFAULT_ADMIN_VOUCHERS.filter((v) => v.partner === selectedPartner)
        : DEFAULT_ADMIN_VOUCHERS;
      setVouchers(filtered);
      setErrorMsg(err?.message || err?.response?.data?.error?.message || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, [selectedPartner]);

  const handleToggleActive = async (voucher: BackendVoucher) => {
    try {
      const updated = await voucherService.updateVoucher(voucher.id, {
        isActive: !voucher.isActive,
      });
      setVouchers((prev) =>
        prev.map((v) => (v.id === voucher.id ? { ...v, isActive: updated.isActive } : v))
      );
    } catch (err: any) {
      // Local fallback toggle
      setVouchers((prev) =>
        prev.map((v) => (v.id === voucher.id ? { ...v, isActive: !v.isActive } : v))
      );
    }
  };

  const handleDelete = async (voucher: BackendVoucher) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa voucher "${voucher.title}"?`)) return;
    try {
      await voucherService.deleteVoucher(voucher.id);
      setVouchers((prev) => prev.filter((v) => v.id !== voucher.id));
    } catch (err: any) {
      setVouchers((prev) => prev.filter((v) => v.id !== voucher.id));
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);
      let created: BackendVoucher;
      try {
        created = await voucherService.createVoucher(formData);
      } catch (apiErr) {
        // Local fallback created object
        created = {
          id: `vch-local-${Date.now()}`,
          ...formData,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
      }
      setVouchers((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        partner: 'CANTEEN',
        coinCost: 50,
        discountValue: 10000,
        quantity: 100,
        validDays: 30,
        imageUrl: '',
      });
    } catch (err: any) {
      setErrorMsg(err?.message || err?.response?.data?.error?.message || 'Tạo voucher thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quest Actions
  const handleToggleQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, isActive: !q.isActive } : q))
    );
  };

  const handleSaveCoins = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, coins: editingCoins } : q))
    );
    setEditingQuestId(null);
  };

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questFormData.title.trim()) return;

    const newQuest: AdminQuestItem = {
      id: `quest-${Date.now()}`,
      title: questFormData.title.trim(),
      description: questFormData.description.trim(),
      coins: questFormData.coins,
      iconType: questFormData.iconType,
      isActive: true,
      weeklyLimit: questFormData.weeklyLimit,
      claimedThisWeek: 0,
      managedBy: questFormData.managedBy,
    };

    setQuests((prev) => [newQuest, ...prev]);
    setIsQuestModalOpen(false);
    setQuestFormData({
      title: '',
      description: '',
      coins: 40,
      iconType: 'other',
      managedBy: 'Phòng CTSV FPT',
      weeklyLimit: 1,
    });
  };

  const activeCount = vouchers.filter((v) => v.isActive).length;
  const activeQuestsCount = quests.filter((q) => q.isActive).length;
  const totalClaimedThisWeek = quests.reduce((acc, q) => acc + q.claimedThisWeek, 0);

  const renderQuestIcon = (iconType: AdminQuestItem['iconType']) => {
    switch (iconType) {
      case 'review':
        return <Camera className="h-4 w-4 text-orange-600" />;
      case 'kyc':
        return <GraduationCap className="h-4 w-4 text-emerald-600" />;
      case 'post':
        return <PlusCircle className="h-4 w-4 text-blue-600" />;
      case 'safepoint':
        return <MapPin className="h-4 w-4 text-purple-600" />;
      default:
        return <Award className="h-4 w-4 text-amber-600" />;
    }
  };

  return (
    <AdminLayoutShell>
      <div className="space-y-5 font-sans">
        {/* Top Tab Bar: Vouchers vs Quests */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveAdminTab('vouchers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeAdminTab === 'vouchers'
                ? 'bg-fpt-orange text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Ticket className="h-4 w-4" />
            <span>Kho Voucher & Trợ Giá ({vouchers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminTab('quests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeAdminTab === 'quests'
                ? 'bg-fpt-orange text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Coins className="h-4 w-4" />
            <span>Nhiệm Vụ Tích Xu (Campus Quests) ({quests.length})</span>
          </button>
        </div>

        {/* TAB 1: VOUCHERS MANAGEMENT */}
        {activeAdminTab === 'vouchers' && (
          <div className="space-y-5">
            {/* Header & Stats Banner */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-orange-500" />
                    <h1 className="text-xl font-black text-slate-900">Quản Lý Voucher & Đặc Quyền Đối Tác</h1>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Tạo mã ưu đãi căn tin, Passio Coffee, 7-Eleven và trợ giá cho sinh viên đổi bằng Campus Coins.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadVouchers}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm Voucher Mới
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Tổng Voucher', value: vouchers.length },
                  { label: 'Đang mở đổi', value: activeCount, color: 'text-emerald-600' },
                  { label: 'Tạm ẩn / Hết kho', value: vouchers.length - activeCount, color: 'text-slate-500' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                    <div className={`text-2xl font-black ${s.color || 'text-slate-900'}`}>{s.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Filter */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              <span className="text-xs font-bold text-slate-700 mr-2">Đối tác:</span>
              {[
                { label: 'Tất cả đối tác', value: 'ALL' },
                { label: 'Căn tin FPT', value: 'CANTEEN' },
                { label: 'Passio Coffee', value: 'PASSIO' },
                { label: '7-Eleven', value: 'SEVEN_ELEVEN' },
                { label: 'Khác', value: 'OTHER' },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setSelectedPartner(p.value)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold cursor-pointer transition ${
                    selectedPartner === p.value
                      ? 'bg-orange-500 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Vouchers Table / Grid */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Danh sách voucher ({vouchers.length} ưu đãi)
                </h3>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Đang tải kho voucher...</div>
              ) : vouchers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Chưa có voucher nào trong danh mục này.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {vouchers.map((voucher) => {
                    const partnerInfo = PARTNER_LABELS[voucher.partner] || PARTNER_LABELS.OTHER;
                    const PartnerIcon = partnerInfo.icon;

                    return (
                      <div key={voucher.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition">
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                            <PartnerIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900">{voucher.title}</span>
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${partnerInfo.color}`}>
                                {partnerInfo.name}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                voucher.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {voucher.isActive ? 'Đang mở đổi' : 'Đã tạm ẩn'}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                              <span>Giá trị: <strong className="text-slate-800">{voucher.discountValue.toLocaleString()} đ</strong></span>
                              <span>•</span>
                              <span>Cần: <strong className="text-amber-600">{voucher.coinCost} Xu</strong></span>
                              <span>•</span>
                              <span>Kho: <strong className="text-slate-800">{voucher.quantity}</strong> lượt</span>
                              <span>•</span>
                              <span>HSD: <strong className="text-slate-800">{voucher.validDays}</strong> ngày</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleToggleActive(voucher)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer border transition ${
                              voucher.isActive
                                ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {voucher.isActive ? 'Tạm ẩn' : 'Kích hoạt'}
                          </button>
                          <button
                            onClick={() => handleDelete(voucher)}
                            className="rounded-xl border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 cursor-pointer transition"
                            title="Xóa voucher"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: COIN QUESTS MANAGEMENT */}
        {activeAdminTab === 'quests' && (
          <div className="space-y-5">
            {/* Header & Stats Banner */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <h1 className="text-xl font-black text-slate-900">Quản Lý Nhiệm Vụ Tích Campus Coins</h1>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    Cấu hình mức Xu thưởng, điều kiện hoàn thành và thẩm quyền kiểm duyệt trực tiếp bởi <strong>Phòng CTSV & Đoàn Thanh Niên FPT</strong>.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsQuestModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm Nhiệm Vụ Mới
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                  <div className="text-2xl font-black text-slate-900">{quests.length}</div>
                  <div className="text-xs text-slate-500 mt-1">Nhiệm Vụ Tuần Này</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                  <div className="text-2xl font-black text-emerald-600">{activeQuestsCount}</div>
                  <div className="text-xs text-slate-500 mt-1">Đang Kích Hoạt</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                  <div className="text-2xl font-black text-fpt-orange">{totalClaimedThisWeek} SV</div>
                  <div className="text-xs text-slate-500 mt-1">Lượt Nhận Thưởng Tuần Này</div>
                </div>
              </div>
            </div>

            {/* Quests Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Danh sách nhiệm vụ tích điểm thưởng FPT Edu ({quests.length} nhiệm vụ)
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {quests.map((quest) => {
                  const isEditing = editingQuestId === quest.id;

                  return (
                    <div key={quest.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 border border-orange-100">
                          {renderQuestIcon(quest.iconType)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900">{quest.title}</span>
                            <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                              ID: {quest.id}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              quest.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {quest.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {quest.description}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span>Quản lý bởi: <strong className="text-slate-800">{quest.managedBy}</strong></span>
                            <span>•</span>
                            <span>Hạn mức: <strong className="text-slate-800">{quest.weeklyLimit} lần/tuần</strong></span>
                            <span>•</span>
                            <span>Đã trao thưởng: <strong className="text-emerald-700">{quest.claimedThisWeek} sinh viên</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Reward amount & Controls */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        {/* Coins editing */}
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-2 py-1">
                            <span className="text-xs font-bold text-amber-900">+</span>
                            <input
                              type="number"
                              min={10}
                              max={200}
                              step={5}
                              value={editingCoins}
                              onChange={(e) => setEditingCoins(Number(e.target.value))}
                              className="w-14 rounded-lg border border-amber-300 bg-white px-2 py-0.5 text-xs font-bold text-slate-900 outline-none"
                            />
                            <span className="text-xs font-bold text-amber-900">Xu</span>
                            <button
                              type="button"
                              onClick={() => handleSaveCoins(quest.id)}
                              className="rounded-lg bg-emerald-600 text-white p-1 hover:bg-emerald-700 cursor-pointer shadow-2xs"
                              title="Lưu mức thưởng"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingQuestId(null)}
                              className="rounded-lg bg-slate-200 text-slate-600 p-1 hover:bg-slate-300 cursor-pointer"
                              title="Hủy"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-orange-100 border border-orange-200 px-2.5 py-1 text-xs font-extrabold text-fpt-orange">
                              +{quest.coins} Coins
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingQuestId(quest.id);
                                setEditingCoins(quest.coins);
                              }}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                              title="Chỉnh sửa mức Xu thưởng"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Status Toggle */}
                        <button
                          onClick={() => handleToggleQuest(quest.id)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer border transition ${
                            quest.isActive
                              ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {quest.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: CREATE VOUCHER */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Tạo Mã Voucher Đối Tác Mới</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateVoucher} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tiêu đề voucher <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cơm trưa Căn tin - Giảm 10.000đ"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Đối tác cung cấp</label>
                    <select
                      value={formData.partner}
                      onChange={(e) => setFormData({ ...formData, partner: e.target.value as VoucherPartner })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    >
                      <option value="CANTEEN">Căn tin trường FPT</option>
                      <option value="PASSIO">Passio Coffee</option>
                      <option value="SEVEN_ELEVEN">7-Eleven</option>
                      <option value="OTHER">Đối tác khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Giá trị giảm (VNĐ) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={1000}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Số Xu cần đổi <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.coinCost}
                      onChange={(e) => setFormData({ ...formData, coinCost: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Số lượng trong kho</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Hạn dùng (ngày)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.validDays}
                      onChange={(e) => setFormData({ ...formData, validDays: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Mô tả / Điều kiện áp dụng</label>
                  <textarea
                    rows={2}
                    placeholder="Áp dụng tại căng tin toàn bộ 5 Campus cho hóa đơn từ 30k..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-fpt-orange px-5 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {submitting ? 'Đang tạo...' : 'Tạo Voucher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CREATE QUEST */}
        {isQuestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">Thêm Nhiệm Vụ Tích Xu Mới</h3>
                <button onClick={() => setIsQuestModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateQuest} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Tên nhiệm vụ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Tham gia thảo luận diễn đàn đồ án"
                    value={questFormData.title}
                    onChange={(e) => setQuestFormData({ ...questFormData, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Loại hoạt động</label>
                    <select
                      value={questFormData.iconType}
                      onChange={(e) => setQuestFormData({ ...questFormData, iconType: e.target.value as any })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    >
                      <option value="review">Đánh giá giao dịch</option>
                      <option value="kyc">Xác thực KYC thẻ SV</option>
                      <option value="post">Đăng bài pass đồ cũ</option>
                      <option value="safepoint">Check-in SafePoint</option>
                      <option value="other">Hoạt động phong trào khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Xu thưởng (+Xu) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={200}
                      step={5}
                      value={questFormData.coins}
                      onChange={(e) => setQuestFormData({ ...questFormData, coins: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Đơn vị chủ quản</label>
                    <select
                      value={questFormData.managedBy}
                      onChange={(e) => setQuestFormData({ ...questFormData, managedBy: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    >
                      <option value="Phòng CTSV FPT">Phòng CTSV FPT</option>
                      <option value="Đoàn Thanh Niên FPT">Đoàn Thanh Niên FPT</option>
                      <option value="Ban Quản Trị Sàn">Ban Quản Trị Sàn</option>
                      <option value="Phòng An Ninh & KTX">Phòng An Ninh & KTX</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Giới hạn tuần (lần/SV)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      value={questFormData.weeklyLimit}
                      onChange={(e) => setQuestFormData({ ...questFormData, weeklyLimit: Number(e.target.value) })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Mô tả nhiệm vụ & tiêu chí</label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả hành vi sinh viên cần thực hiện để nhận thưởng..."
                    value={questFormData.description}
                    onChange={(e) => setQuestFormData({ ...questFormData, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsQuestModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-fpt-orange px-5 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs"
                  >
                    Tạo Nhiệm Vụ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutShell>
  );
}
