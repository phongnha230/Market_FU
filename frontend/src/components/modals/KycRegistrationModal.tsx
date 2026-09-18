'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Camera,
  Upload,
  UserCheck,
  Store,
  Sparkles,
  AlertCircle,
  Building,
  GraduationCap,
  BadgeCheck,
  CreditCard,
  Check,
} from 'lucide-react';
import { useKycStore, KycType } from '@/stores/kycStore';
import { useUserStore } from '@/stores/userStore';

interface KycRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  defaultRole?: KycType;
}

const SAMPLE_FRONT_CARDS = [
  {
    label: 'Thẻ SV FPT Hà Nội (Hòa Lạc)',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Thẻ SV FPT TP.HCM',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    label: 'Thẻ SV FPT Đà Nẵng / Cần Thơ',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
];

const SAMPLE_BACK_CARD = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80';

export default function KycRegistrationModal({
  isOpen,
  onClose,
  onShowToast,
  defaultRole = 'seller',
}: KycRegistrationModalProps) {
  const { user, setKycStatus } = useUserStore();
  const { submitApplication } = useKycStore();

  const [selectedRole, setSelectedRole] = useState<KycType>(defaultRole);
  const [fullName, setFullName] = useState(user.name || 'Lê Minh Quân');
  const [studentId, setStudentId] = useState(user.studentId || 'HE172819');
  const [email, setEmail] = useState(user.email || 'quanlmse172819@fpt.edu.vn');
  const [campus, setCampus] = useState(user.campus || 'Hòa Lạc');
  const [major, setMajor] = useState(user.major || 'Kỹ thuật Phần mềm (SE)');
  const [cohort, setCohort] = useState(user.cohort || 'K17');
  const [phone, setPhone] = useState(user.phone || '0982 345 892');

  // Seller specific
  const [storeName, setStoreName] = useState('Góc Đồ Cũ K17 Hola');
  const [primaryCategory, setPrimaryCategory] = useState('Giáo trình & Phụ kiện IT');
  const [bankAccount, setBankAccount] = useState('TPBank • 03829102910');

  // Images
  const [frontCardUrl, setFrontCardUrl] = useState(SAMPLE_FRONT_CARDS[0].url);
  const [backCardUrl, setBackCardUrl] = useState(SAMPLE_BACK_CARD);
  const [selfieCardUrl, setSelfieCardUrl] = useState(user.avatarUrl);

  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !studentId.trim() || !email.trim()) {
      onShowToast('Vui lòng điền đầy đủ họ tên, mã số sinh viên và email trường.', 'error');
      return;
    }

    if (!agreed) {
      onShowToast('Vui lòng đồng ý với cam kết quy chế an toàn trường FPT.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Submit to KycStore (Admin will see it immediately!)
      const newApp = submitApplication({
        type: selectedRole,
        fullName: fullName.trim(),
        studentId: studentId.trim().toUpperCase(),
        email: email.trim(),
        campus,
        major,
        cohort,
        phone,
        frontCardUrl,
        backCardUrl,
        selfieCardUrl,
        storeName: selectedRole === 'seller' ? storeName : undefined,
        primaryCategory: selectedRole === 'seller' ? primaryCategory : undefined,
        bankAccount: selectedRole === 'seller' ? bankAccount : undefined,
      });

      // 2. Update user state
      setKycStatus('pending', selectedRole, newApp.id);

      setIsSubmitting(false);
      onShowToast(
        `🎉 Đã gửi hồ sơ xác thực ${selectedRole === 'seller' ? 'Người bán (Seller)' : 'Sinh viên'} thành công! BQT Admin sẽ thẩm định trong ít phút.`,
        'success'
      );
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 my-8 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#0F1B2D] to-[#1C3F94] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fpt-orange text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Đăng Ký Xác Thực Thẻ Sinh Viên & Seller
              </h3>
              <p className="text-xs text-slate-300">
                Cổng kiểm định thẻ SV 5 cơ sở FPT Education • Cấp quyền mua bán an toàn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: CHỌN VAI TRÒ XÁC THỰC */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Bước 1: Chọn mục đích đăng ký xác thực</span>
              <span className="text-fpt-orange">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Sinh viên (Người mua) */}
              <div
                onClick={() => setSelectedRole('student')}
                className={`relative rounded-2xl border-2 p-4 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  selectedRole === 'student'
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">Sinh Viên (Người Mua)</div>
                      <div className="text-[11px] text-emerald-700 font-medium">Xác thực Thẻ SV FPT</div>
                    </div>
                  </div>
                  {selectedRole === 'student' && (
                    <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 pl-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Nhận huy hiệu Sinh viên FPT Đã Xác Minh</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Được hưởng bảo hiểm hoàn tiền 48h FPT Care</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Tăng điểm Trust Score từ 85/100</span>
                  </li>
                </ul>
              </div>

              {/* Option 2: Người bán (Seller) */}
              <div
                onClick={() => setSelectedRole('seller')}
                className={`relative rounded-2xl border-2 p-4 transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  selectedRole === 'seller'
                    ? 'border-fpt-orange bg-orange-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 text-fpt-orange flex items-center justify-center shrink-0">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">Người Bán (Seller)</div>
                      <div className="text-[11px] text-fpt-orange font-medium">Mở gian hàng sinh viên</div>
                    </div>
                  </div>
                  {selectedRole === 'seller' && (
                    <div className="h-5 w-5 rounded-full bg-fpt-orange text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 pl-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
                    <span>Mở khóa quyền <strong>Đăng bán không giới hạn</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
                    <span>Huy hiệu độc quyền <strong>Verified Seller FPT</strong></span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
                    <span>Ưu tiên xuất hiện trang chủ & tìm kiếm</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* STEP 2: THÔNG TIN HỌC VỤ & ĐỊNH DANH */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Bước 2: Thông tin sinh viên chính quy FPT Edu</span>
              <span className="text-fpt-orange">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Họ và tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Lê Minh Quân"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Mã số sinh viên (MSSV)</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Ví dụ: HE172819"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 uppercase font-mono outline-none focus:bg-white focus:border-fpt-orange transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Email liên hệ (FE Mail / Gmail)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@fe.edu.vn hoặc gmail..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Cơ sở Campus</label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition"
                >
                  <option value="Hòa Lạc">Hà Nội (Campus Hòa Lạc)</option>
                  <option value="TP.HCM">TP. Hồ Chí Minh (Q.9)</option>
                  <option value="Đà Nẵng">Đà Nẵng (FPT City)</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Quy Nhơn">Quy Nhơn (AI Campus)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Chuyên ngành & Khóa</label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Kỹ thuật Phần mềm (SE) - K17"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Số điện thoại / Zalo nhận tin</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0982 345 892"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition"
                />
              </div>
            </div>

            {/* If role is SELLER -> Show store info */}
            {selectedRole === 'seller' && (
              <div className="mt-3 rounded-2xl bg-orange-50/50 border border-orange-200/80 p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-fpt-orange">
                  <Store className="h-4 w-4" />
                  <span>Thông tin gian hàng người bán FPT</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 mb-1 block">Tên gian hàng hiển thị</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Ví dụ: Góc Sách & Gear K17 Hola"
                      className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-fpt-orange"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 mb-1 block">Danh mục đồ bán chính</label>
                    <input
                      type="text"
                      value={primaryCategory}
                      onChange={(e) => setPrimaryCategory(e.target.value)}
                      placeholder="Giáo trình, Bàn phím cơ, Đồ KTX..."
                      className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-fpt-orange"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: TẢI ẢNH MINH CHỨNG THẺ SINH VIÊN */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>Bước 3: Ảnh minh chứng Thẻ Sinh Viên FPT</span>
                <span className="text-fpt-orange">*</span>
              </label>
              <span className="text-[10px] text-slate-400">Yêu cầu chụp rõ mặt trước & mã vạch</span>
            </div>

            {/* Quick sample pickers */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500">Hoặc chọn mẫu thẻ kiểm thử nhanh:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_FRONT_CARDS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFrontCardUrl(s.url)}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                      frontCardUrl === s.url
                        ? 'border-fpt-orange bg-orange-50 text-fpt-orange font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Front Card Preview */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>1. Mặt trước Thẻ SV</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">● Đã chọn ảnh</span>
                </div>
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <Image src={frontCardUrl} alt="Mặt trước thẻ SV" fill className="object-cover" />
                </div>
              </div>

              {/* Back Card Preview */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>2. Mặt sau Thẻ SV (Mã vạch)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">● Đã chọn ảnh</span>
                </div>
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <Image src={backCardUrl} alt="Mặt sau thẻ SV" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* AGREEMENT CHECKBOX */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2">
            <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-fpt-orange focus:ring-fpt-orange cursor-pointer"
              />
              <span className="leading-relaxed">
                Tôi cam kết là sinh viên chính quy Đại học FPT, các thông tin và ảnh thẻ cung cấp là chính chủ. Tôi cam kết tuân thủ quy chế mua bán an toàn và chịu hoàn toàn trách nhiệm học vụ nếu gian lận.
              </span>
            </label>
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-fpt-orange px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-orange-500/20 hover:bg-fpt-orange-hover transition cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isSubmitting ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ xét duyệt ngay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
