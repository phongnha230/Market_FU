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
  Lock,
  Landmark,
  MapPin,
  FileText,
  Trash2,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useKycStore, KycType } from '@/stores/kycStore';
import { useUserStore } from '@/stores/userStore';
import { useWalletStore } from '@/stores/walletStore';
import { profileService } from '@/services/profileService';
import { cn } from '@/lib/utils';

interface KycRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  defaultRole?: KycType;
}

const VIETNAMESE_BANKS = [
  { code: 'MB', name: 'MB Bank (Ngân hàng Quân Đội)' },
  { code: 'VCB', name: 'Vietcombank (Ngoại Thương Việt Nam)' },
  { code: 'TCB', name: 'Techcombank (Kỹ Thương)' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)' },
  { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { code: 'ACB', name: 'ACB (Á Châu)' },
  { code: 'BIDV', name: 'BIDV (Đầu Tư & Phát Triển)' },
  { code: 'CTG', name: 'VietinBank (Công Thương)' },
  { code: 'VBA', name: 'Agribank (Nông Nghiệp)' },
  { code: 'TIMO', name: 'Timo Digital Bank by BVBank' },
  { code: 'CAKE', name: 'Cake by VPBank' },
  { code: 'OCB', name: 'OCB (Phương Đông)' },
];

const SAMPLE_STUDENT_CARDS = {
  front: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  back: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
  selfie: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
};

const SAMPLE_CITIZEN_CARDS = {
  front: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
  back: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
};

export default function KycRegistrationModal({
  isOpen,
  onClose,
  onShowToast,
  defaultRole = 'student',
}: KycRegistrationModalProps) {
  const { user, setKycStatus, updateProfile } = useUserStore();
  const { submitApplication } = useKycStore();

  const isPending = user.kycStatus === 'pending';
  const isRejected = user.kycStatus === 'rejected';

  const isEduEmail = Boolean(
    user.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    user.email?.toLowerCase().endsWith('@fe.edu.vn')
  );
  const isStudentVerified = user.kycStatus === 'approved_student' || user.kycStatus === 'approved_seller' || isEduEmail;

  // Role selection: default to 'student' if unverified, or defaultRole if verified
  const effectiveDefaultRole = isStudentVerified ? (defaultRole || 'seller') : 'student';
  const [selectedRole, setSelectedRole] = useState<KycType>(effectiveDefaultRole);

  React.useEffect(() => {
    if (isOpen) {
      const targetRole = isStudentVerified
        ? ((isPending && user.kycRole) ? user.kycRole : (defaultRole || 'seller'))
        : 'student';
      setSelectedRole(targetRole);

      if (isStudentVerified) {
        // Tài khoản đã xác thực sinh viên -> Luôn đồng bộ từ thông tin sinh viên chính thức của tài khoản
        const sId = user.studentId || '';
        const cMatch = sId.match(/\d{2}/)?.[0];
        const derivedCohort = user.cohort || (cMatch ? `K${cMatch}` : '');
        const derivedMajor = user.major || '';

        setFullName(user.name || '');
        setStudentId(sId);
        setEmail(user.email || '');
        setCampus(user.campus || 'Hòa Lạc');
        setPhone(user.phone || '');
        setCohort(derivedCohort);
        setMajor(derivedMajor);

        // Phục hồi các trường thông tin Seller nếu có bản nháp seller
        if (user.kycSubmittedData?.role === 'seller') {
          const data = user.kycSubmittedData;
          if (data.storeName) setStoreName(data.storeName);
          if (data.primaryCategory) setPrimaryCategory(data.primaryCategory);
          if (data.handoffSpot) setHandoffSpot(data.handoffSpot);
          if (data.bankName) setBankName(data.bankName);
          if (data.bankAccount) setBankAccount(data.bankAccount);
          if (data.bankAccountName) setBankAccountName(data.bankAccountName);
          if (data.citizenId) setCitizenId(data.citizenId);
          if (data.citizenFrontCardUrl) setCitizenFrontCardUrl(data.citizenFrontCardUrl);
          if (data.citizenBackCardUrl) setCitizenBackCardUrl(data.citizenBackCardUrl);
        } else if (user.name) {
          setStoreName(`Góc Pass Đồ ${user.name}`);
          setBankAccountName(user.name.toUpperCase());
        }
        return;
      }

      // Tài khoản CHƯA xác thực sinh viên: Phục hồi hồ sơ đã gửi trước đó nếu có
      if (user.kycSubmittedData) {
        const data = user.kycSubmittedData;
        if (data.role && data.role === 'student') setSelectedRole(data.role);
        if (data.fullName) setFullName(data.fullName);
        if (data.studentId) setStudentId(data.studentId);
        if (data.email) setEmail(data.email);
        if (data.campus) setCampus(data.campus);
        if (data.phone) setPhone(data.phone);
        if (data.major) setMajor(data.major);
        if (data.cohort) setCohort(data.cohort);
        if (data.studentFrontCardUrl) setStudentFrontCardUrl(data.studentFrontCardUrl);
        if (data.studentBackCardUrl) setStudentBackCardUrl(data.studentBackCardUrl);
        if (data.studentSelfieUrl) setStudentSelfieUrl(data.studentSelfieUrl);
        if (data.storeName) setStoreName(data.storeName);
        if (data.primaryCategory) setPrimaryCategory(data.primaryCategory);
        if (data.handoffSpot) setHandoffSpot(data.handoffSpot);
        if (data.bankName) setBankName(data.bankName);
        if (data.bankAccount) setBankAccount(data.bankAccount);
        if (data.bankAccountName) setBankAccountName(data.bankAccountName);
        if (data.citizenId) setCitizenId(data.citizenId);
        if (data.citizenFrontCardUrl) setCitizenFrontCardUrl(data.citizenFrontCardUrl);
        if (data.citizenBackCardUrl) setCitizenBackCardUrl(data.citizenBackCardUrl);
        return;
      }

      // Tự động điền thông tin người dùng đã đăng ký
      if (user.name) setFullName(user.name);
      if (user.studentId) setStudentId(user.studentId);
      if (user.email) setEmail(user.email);
      if (user.campus) setCampus(user.campus);
      if (user.phone) setPhone(user.phone);

      const sId = user.studentId || '';
      const cMatch = sId.match(/\d{2}/)?.[0];
      const derivedCohort = user.cohort || (cMatch ? `K${cMatch}` : '');
      const derivedMajor = user.major || '';

      setCohort(derivedCohort);
      setMajor(derivedMajor);
    }
  }, [isOpen, defaultRole, isStudentVerified, user]);

  // Student Basic Info
  const [fullName, setFullName] = useState(user.name || '');
  const [studentId, setStudentId] = useState(user.studentId || '');
  const [email, setEmail] = useState(user.email || '');
  const [campus, setCampus] = useState(user.campus || 'Hòa Lạc');
  const [major, setMajor] = useState(user.major || 'Kỹ thuật Phần mềm (SE)');
  const [cohort, setCohort] = useState(user.cohort || 'K18');
  const [phone, setPhone] = useState(user.phone || '');

  // Student card uploads (Front, Back & Selfie)
  const [studentFrontCardUrl, setStudentFrontCardUrl] = useState<string>(SAMPLE_STUDENT_CARDS.front);
  const [studentBackCardUrl, setStudentBackCardUrl] = useState<string>(SAMPLE_STUDENT_CARDS.back);
  const [studentSelfieUrl, setStudentSelfieUrl] = useState<string>(user.avatarUrl || SAMPLE_STUDENT_CARDS.selfie);

  // Seller specific - Store Info
  const [storeName, setStoreName] = useState(user.name ? `Góc Pass Đồ ${user.name}` : '');
  const [primaryCategory, setPrimaryCategory] = useState('Giáo trình & Phụ kiện IT');
  const [handoffSpot, setHandoffSpot] = useState('Sảnh Tòa Alpha (Hola)');

  // Seller specific - Banking Payout Info
  const [bankName, setBankName] = useState(VIETNAMESE_BANKS[0].name);
  const [bankAccount, setBankAccount] = useState('');
  const [bankAccountName, setBankAccountName] = useState((user.name || '').toUpperCase());

  // Seller specific - Citizen ID (CCCD)
  const [citizenId, setCitizenId] = useState('');
  const [citizenFrontCardUrl, setCitizenFrontCardUrl] = useState<string>(SAMPLE_CITIZEN_CARDS.front);
  const [citizenBackCardUrl, setCitizenBackCardUrl] = useState<string>(SAMPLE_CITIZEN_CARDS.back);

  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Generic File Upload Handler
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    label: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onShowToast(`Kích thước file ${label} không được vượt quá 10MB.`, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setter(event.target.result);
        onShowToast(`Đã tải lên ảnh ${label} thành công!`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRole === 'student') {
      if (isStudentVerified) {
        onShowToast('Tài khoản của bạn đã được xác thực Thẻ Sinh Viên rồi.', 'info');
        return;
      }
      if (!fullName.trim() || !studentId.trim() || !email.trim()) {
        onShowToast('Vui lòng điền đầy đủ họ tên, mã số sinh viên và email FE.', 'error');
        return;
      }
      if (!studentFrontCardUrl || !studentBackCardUrl || !studentSelfieUrl) {
        onShowToast('Vui lòng tải lên đầy đủ 2 mặt thẻ sinh viên và ảnh chân dung.', 'error');
        return;
      }
    } else {
      // Seller role validation
      if (!isStudentVerified) {
        onShowToast('Quy định an toàn FPT Campus: Bạn cần hoàn thành Xác thực Thẻ Sinh Viên FPT trước khi mở gian hàng Người Bán!', 'error');
        return;
      }
      if (!fullName.trim() || !studentId.trim()) {
        onShowToast('Vui lòng cung cấp đầy đủ thông tin sinh viên.', 'error');
        return;
      }
      if (!bankAccount.trim() || !bankAccountName.trim()) {
        onShowToast('Vui lòng nhập Số tài khoản và Tên chủ tài khoản ngân hàng để nhận tiền Escrow.', 'error');
        return;
      }
      if (!citizenId.trim()) {
        onShowToast('Vui lòng nhập Số Căn cước công dân (CCCD).', 'error');
        return;
      }
      if (!citizenFrontCardUrl || !citizenBackCardUrl) {
        onShowToast('Vui lòng tải lên ảnh 2 mặt Căn cước công dân (CCCD).', 'error');
        return;
      }
    }

    if (!agreed) {
      onShowToast('Vui lòng tick chọn đồng ý với cam kết quy chuẩn giao dịch FPT.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const campusCode =
        campus.includes('HCM') || campus.includes('Hồ Chí Minh') ? 'HCM' :
        campus.includes('Đà Nẵng') ? 'DAD' :
        campus.includes('Cần Thơ') ? 'CT' :
        campus.includes('Quy Nhơn') ? 'QN' : 'HOL';

      if (selectedRole === 'student') {
        await profileService.submitStudentKyc({
          studentId: studentId.trim().toUpperCase(),
          cardImageUrl: studentFrontCardUrl,
          cardBackUrl: studentBackCardUrl,
          selfieCardUrl: studentSelfieUrl,
          fullName: fullName.trim(),
          campus: campusCode,
          cohort: cohort.trim(),
          major: major.trim(),
          phoneNumber: phone.trim(),
        });
      } else {
        await profileService.submitSellerOnboarding({
          fullName: fullName.trim(),
          studentId: studentId.trim().toUpperCase(),
          phoneNumber: phone.trim() || '0982345892',
          campus: campusCode,
          bankName,
          accountNo: bankAccount.trim(),
          accountName: bankAccountName.trim(),
          cccdNumber: citizenId.trim(),
          cccdFrontUrl: citizenFrontCardUrl,
          cccdBackUrl: citizenBackCardUrl,
          cardImageUrl: studentFrontCardUrl,
          cardBackUrl: studentBackCardUrl,
          selfieCardUrl: studentSelfieUrl,
        });
      }
    } catch (err: any) {
      console.error('Lỗi khi nộp hồ sơ KYC:', err);
      const msg = err.response?.data?.message || err.message;
      if (msg) {
        onShowToast(`Lưu ý: ${msg}`, 'error');
      }
    }

    // Submit application to store
    const newApp = submitApplication({
      type: selectedRole,
      fullName: fullName.trim(),
      studentId: studentId.trim().toUpperCase(),
      email: email.trim(),
      campus,
      major,
      cohort,
      phone,
      avatarUrl: user.avatarUrl || (selectedRole === 'student' ? studentSelfieUrl : undefined),
      frontCardUrl: selectedRole === 'seller' ? citizenFrontCardUrl : studentFrontCardUrl,
      backCardUrl: selectedRole === 'seller' ? citizenBackCardUrl : studentBackCardUrl,
      selfieCardUrl: selectedRole === 'seller' ? undefined : studentSelfieUrl,
      storeName: selectedRole === 'seller' ? storeName : undefined,
      primaryCategory: selectedRole === 'seller' ? primaryCategory : undefined,
      bankName: selectedRole === 'seller' ? bankName : undefined,
      bankAccount: selectedRole === 'seller' ? bankAccount : undefined,
      bankAccountName: selectedRole === 'seller' ? bankAccountName : undefined,
      citizenId: selectedRole === 'seller' ? citizenId : undefined,
      citizenFrontCardUrl: selectedRole === 'seller' ? citizenFrontCardUrl : undefined,
      citizenBackCardUrl: selectedRole === 'seller' ? citizenBackCardUrl : undefined,
    });

    // Lưu lại hiện trạng hồ sơ đã gửi đầy đủ
    const submittedData = {
      role: selectedRole,
      fullName: fullName.trim(),
      studentId: studentId.trim().toUpperCase(),
      email: email.trim(),
      campus,
      major,
      cohort,
      phone: phone.trim(),
      studentFrontCardUrl,
      studentBackCardUrl,
      studentSelfieUrl,
      storeName,
      primaryCategory,
      handoffSpot,
      bankName,
      bankAccount,
      bankAccountName,
      citizenId,
      citizenFrontCardUrl,
      citizenBackCardUrl,
      submittedAt: new Date().toLocaleString('vi-VN'),
    };

    const updates: any = {
      kycSubmittedData: submittedData,
      kycStatus: 'pending',
      kycRole: selectedRole,
      kycApplicationId: newApp.id,
      kycRejectionReason: undefined,
    };

    if (selectedRole === 'seller' && bankAccount.trim()) {
      const bankData = {
        bankName: bankName.trim(),
        accountNo: bankAccount.trim(),
        accountName: bankAccountName.trim().toUpperCase() || fullName.trim().toUpperCase(),
      };
      updates.bankAccount = bankData;
      useWalletStore.getState().setBankAccount(bankData as any);
    }

    updateProfile(updates);

    // Update user state to pending
    setKycStatus('pending', selectedRole, newApp.id);
    setIsSubmitting(false);
    onShowToast(
      `🎉 Đã gửi hồ sơ xác thực tới Ban Quản Trị Admin! BQT sẽ thẩm định và gửi thông báo/email kết quả cho bạn.`,
      'success'
    );
    onClose();
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* BANNER 1: NẾU ĐANG CHỜ DUYỆT (PENDING) -> KHÓA BẢO VỆ CHỈNH SỬA */}
          {isPending && (
            <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-4 sm:p-5 flex items-start gap-3.5 text-amber-950 shadow-xs animate-in fade-in">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
                <Clock className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                    <span>Hồ sơ đang trong quá trình xét duyệt của BQT</span>
                    <span className="inline-flex items-center rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                      Chờ duyệt
                    </span>
                  </h4>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed font-medium">
                  Hồ sơ xác thực thẻ SV của bạn đã được gửi lên hệ thống. Trong thời gian Ban Quản Trị đang đối soát, <strong>toàn bộ thông tin học vụ và ảnh thẻ được khóa an toàn, không được phép chỉnh sửa</strong> để đảm bảo tính minh bạch đối soát.
                </p>
                {user.kycSubmittedData?.submittedAt && (
                  <p className="text-[11px] text-amber-800 pt-0.5 font-semibold">
                    🕒 Thời gian gửi đơn: {user.kycSubmittedData.submittedAt}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* BANNER 2: NẾU BỊ TỪ CHỐI (REJECTED) -> MỞ KHÓA CHO PHÉP CHỈNH SỬA & NỘP LẠI */}
          {isRejected && (
            <div className="rounded-2xl bg-rose-50 border-2 border-rose-300 p-4 sm:p-5 flex items-start gap-3.5 text-rose-950 shadow-xs animate-in fade-in">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-xs">
                <AlertCircle className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm font-black text-rose-950 flex items-center gap-1.5">
                    <span>Hồ sơ chưa đạt yêu cầu • Được phép chỉnh sửa lại</span>
                    <span className="inline-flex items-center rounded-full bg-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-900">
                      Cần nộp lại
                    </span>
                  </h4>
                </div>
                <div className="rounded-xl bg-white/90 border border-rose-200 p-3 text-xs text-rose-900 space-y-1 shadow-2xs">
                  <span className="font-bold text-rose-950 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                    <span>Lý do BQT Admin từ chối:</span>
                  </span>
                  <p className="italic text-rose-800 font-medium pl-4">
                    "{user.kycRejectionReason || 'Ảnh chụp thẻ sinh viên bị chói sáng ở phần mã số MSSV. Vui lòng chụp lại rõ nét cả 2 mặt và gửi lại.'}"
                  </p>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed font-medium">
                  👉 Bạn có thể chỉnh sửa lại các thông tin hoặc đổi ảnh thẻ bên dưới, sau đó bấm <strong>"Cập nhật & Nộp lại hồ sơ"</strong> để BQT xét duyệt lại.
                </p>
              </div>
            </div>
          )}

          {/* STEP 1: CHỌN VAI TRÒ XÁC THỰC */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>Bước 1: Chọn mục đích đăng ký xác thực</span>
              <span className="text-fpt-orange">*</span>
              {isPending && <span className="text-[10px] text-amber-700 font-bold normal-case">(Đang khóa)</span>}
            </label>

            <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", isPending && "pointer-events-none opacity-85")}>
              {/* Option 1: Sinh viên (Người mua) */}
              <div
                onClick={() => !isPending && setSelectedRole('student')}
                className={`relative rounded-2xl border-2 p-4 transition flex flex-col justify-between space-y-3 ${
                  isPending ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${
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
                      <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>Sinh Viên (Người Mua)</span>
                        {isStudentVerified && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                            ✓ Đã xác thực
                          </span>
                        )}
                      </div>
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
                onClick={() => {
                  if (isPending) return;
                  if (!isStudentVerified) {
                    onShowToast('⚠️ Bạn cần hoàn thành Xác thực Thẻ Sinh Viên (Bước 1) trước khi mở gian hàng Người Bán!', 'error');
                    return;
                  }
                  setSelectedRole('seller');
                }}
                className={cn(
                  "relative rounded-2xl border-2 p-4 transition flex flex-col justify-between space-y-3",
                  isPending
                    ? "cursor-not-allowed opacity-85"
                    : !isStudentVerified
                    ? "cursor-not-allowed border-dashed border-slate-200 bg-slate-50/70 opacity-80"
                    : selectedRole === 'seller'
                    ? "border-fpt-orange bg-orange-50/40 shadow-xs cursor-pointer"
                    : "border-slate-200 bg-white hover:border-slate-300 cursor-pointer"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                      !isStudentVerified ? "bg-slate-100 text-slate-400" :
                      selectedRole === 'seller' ? "bg-orange-100 text-fpt-orange" : "bg-slate-100 text-slate-600"
                    )}>
                      {!isStudentVerified ? <Lock className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>Người Bán (Seller)</span>
                        {!isStudentVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/90 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            <Lock className="h-2.5 w-2.5" /> Khóa (Cần Thẻ SV)
                          </span>
                        ) : user.kycStatus === 'approved_seller' ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            ✓ Đã xác thực
                          </span>
                        ) : isPending && user.kycRole === 'seller' ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            ⏳ Chờ duyệt
                          </span>
                        ) : null}
                      </div>
                      <div className={cn("text-[11px] font-medium", !isStudentVerified ? "text-slate-400" : "text-fpt-orange")}>
                        {!isStudentVerified ? "Mở khóa sau khi hoàn tất Bước 1" : "Mở gian hàng sinh viên"}
                      </div>
                    </div>
                  </div>
                  {isStudentVerified && selectedRole === 'seller' && (
                    <div className="h-5 w-5 rounded-full bg-fpt-orange text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {!isStudentVerified ? (
                  <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-2.5 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Quy định an toàn FPT Campus:</strong> Bạn cần xác thực Thẻ Sinh Viên chính quy trước để BQT xác nhận danh tính trong trường rồi mới được mở bán đồ.
                    </span>
                  </div>
                ) : (
                  <ul className="text-[11px] text-slate-600 space-y-1 pl-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
                      <span>Mở khóa quyền <strong>Đăng bán không giới hạn</strong></span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
                      <span>Tài khoản nhận tiền thanh toán Escrow 48h</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-fpt-orange shrink-0" />
                      <span>Xác thực pháp lý CCCD & Huy hiệu Verified Seller</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* NẾU CHỌN SINH VIÊN (NGƯỜI MUA) */}
          {/* ======================================================== */}
          {selectedRole === 'student' && (
            isStudentVerified ? (
              /* Đã xác thực Thẻ SV -> Báo trạng thái & khóa sửa */
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-800 font-extrabold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>Tài khoản đã hoàn tất xác thực Thẻ Sinh Viên chính quy FPT</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hồ sơ học vụ của bạn đã được đối soát tự động qua FAP SSO và đang được bảo hộ định danh chính chủ. Thông tin thẻ sinh viên đã được khóa an toàn và không thể chỉnh sửa lại.
                </p>
                <div className="rounded-xl bg-white p-3.5 border border-emerald-100 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Họ và tên:</span>
                    <strong className="text-slate-800">{fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mã SV (MSSV):</span>
                    <strong className="text-slate-800">{studentId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cơ sở Campus:</span>
                    <strong className="text-slate-800">{campus}</strong>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover transition cursor-pointer shadow-xs"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>Nâng cấp lên Người Bán (Seller) để đăng bài</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Chưa xác thực Thẻ SV -> Hiển thị form điền + upload thẻ SV */
              <>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>Bước 2: Thông tin sinh viên chính quy FPT Edu</span>
                    <span className="text-fpt-orange">*</span>
                    {isPending && <span className="text-[10px] text-amber-700 font-bold normal-case">(Đang khóa)</span>}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Họ và tên sinh viên</label>
                      <input
                        type="text"
                        disabled={isPending}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={user.name || "Ví dụ: Nguyễn Tuấn Nam"}
                        className={cn(
                          "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none border-slate-200"
                        )}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Mã số sinh viên (MSSV)</label>
                      <input
                        type="text"
                        disabled={isPending}
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                        placeholder={user.studentId || "Ví dụ: HE172819"}
                        className={cn(
                          "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 uppercase font-mono outline-none focus:bg-white focus:border-fpt-orange transition",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none border-slate-200"
                        )}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Email liên hệ (FE Mail / Gmail)</label>
                      <input
                        type="email"
                        disabled={isPending}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={user.email || "Email FE hoặc Gmail của bạn"}
                        className={cn(
                          "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none border-slate-200"
                        )}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Cơ sở Campus</label>
                      <select
                        disabled={isPending}
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        className={cn(
                          "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none border-slate-200"
                        )}
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
                        disabled={isPending}
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="Kỹ thuật Phần mềm (SE) - K17"
                        className={cn(
                          "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none border-slate-200"
                        )}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Số điện thoại / Zalo nhận tin</label>
                      <input
                        type="tel"
                        disabled={isPending}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={user.phone || "0982 345 892"}
                        className={cn(
                          "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none border-slate-200"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Upload thẻ sinh viên mặt trước & mặt sau */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <span>Bước 3: Tải ảnh Thẻ Sinh Viên FPT & Chân Dung Xác Minh</span>
                      <span className="text-fpt-orange">*</span>
                      {isPending && <span className="text-[10px] text-amber-700 font-bold normal-case">(Đang khóa)</span>}
                    </label>
                    <span className="text-[10px] text-slate-400">Hỗ trợ JPG, PNG (tối đa 10MB)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Front Student Card Upload */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1">
                          <span>1. Thẻ SV Mặt Trước</span>
                          <span className="text-fpt-orange">*</span>
                        </span>
                        {studentFrontCardUrl ? (
                          <span className={cn("text-[10px] font-semibold", isPending ? "text-amber-700" : "text-emerald-600")}>
                            {isPending ? '🔒 Đã nộp BQT' : '● Đã chọn ảnh'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Chưa có ảnh</span>
                        )}
                      </div>

                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                        {studentFrontCardUrl ? (
                          <Image src={studentFrontCardUrl} alt="Mặt trước thẻ SV" fill className="object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-1">
                            <Camera className="h-6 w-6 text-slate-300" />
                            <span>Chưa chọn ảnh</span>
                          </div>
                        )}
                      </div>

                      {isPending ? (
                        <div className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 py-2 text-xs font-bold text-slate-500 cursor-not-allowed select-none">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Ảnh đã nộp • Khóa</span>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-dashed border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-fpt-orange hover:text-fpt-orange transition cursor-pointer">
                          <Upload className="h-3.5 w-3.5" />
                          <span>{studentFrontCardUrl ? 'Đổi ảnh trước' : 'Tải ảnh trước'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setStudentFrontCardUrl, 'mặt trước Thẻ SV')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Back Student Card Upload */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1">
                          <span>2. Mặt Sau (Mã vạch)</span>
                          <span className="text-fpt-orange">*</span>
                        </span>
                        {studentBackCardUrl ? (
                          <span className={cn("text-[10px] font-semibold", isPending ? "text-amber-700" : "text-emerald-600")}>
                            {isPending ? '🔒 Đã nộp BQT' : '● Đã chọn ảnh'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Chưa có ảnh</span>
                        )}
                      </div>

                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                        {studentBackCardUrl ? (
                          <Image src={studentBackCardUrl} alt="Mặt sau thẻ SV" fill className="object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-1">
                            <Camera className="h-6 w-6 text-slate-300" />
                            <span>Chưa chọn ảnh</span>
                          </div>
                        )}
                      </div>

                      {isPending ? (
                        <div className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 py-2 text-xs font-bold text-slate-500 cursor-not-allowed select-none">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Ảnh đã nộp • Khóa</span>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-dashed border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-fpt-orange hover:text-fpt-orange transition cursor-pointer">
                          <Upload className="h-3.5 w-3.5" />
                          <span>{studentBackCardUrl ? 'Đổi ảnh sau' : 'Tải ảnh sau'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setStudentBackCardUrl, 'mặt sau Thẻ SV')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Student Portrait / Selfie Upload */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1">
                          <span>3. Chân Dung SV</span>
                          <span className="text-fpt-orange">*</span>
                        </span>
                        {studentSelfieUrl ? (
                          <span className={cn("text-[10px] font-semibold", isPending ? "text-amber-700" : "text-emerald-600")}>
                            {isPending ? '🔒 Đã nộp BQT' : '● Đã chọn ảnh'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Chưa có ảnh</span>
                        )}
                      </div>

                      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-200 bg-white">
                        {studentSelfieUrl ? (
                          <Image src={studentSelfieUrl} alt="Chân dung sinh viên" fill className="object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-1">
                            <Camera className="h-6 w-6 text-slate-300" />
                            <span>Chưa chọn ảnh</span>
                          </div>
                        )}
                      </div>

                      {isPending ? (
                        <div className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 py-2 text-xs font-bold text-slate-500 cursor-not-allowed select-none">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Ảnh đã nộp • Khóa</span>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-dashed border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-fpt-orange hover:text-fpt-orange transition cursor-pointer">
                          <Upload className="h-3.5 w-3.5" />
                          <span>{studentSelfieUrl ? 'Đổi ảnh chân dung' : 'Tải chân dung'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setStudentSelfieUrl, 'chân dung sinh viên')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )
          )}

          {/* ======================================================== */}
          {/* NẾU CHỌN NGƯỜI BÁN (SELLER) */}
          {/* ======================================================== */}
          {selectedRole === 'seller' && (
            <>
              {/* KHỐI 1: HỒ SƠ ĐỊNH DANH SINH VIÊN */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>Bước 2: Hồ sơ sinh viên FPT Edu</span>
                    <span className="text-fpt-orange">*</span>
                  </label>
                  {isStudentVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Lock className="h-3 w-3" />
                      <span>Đã xác thực qua FAP SSO (Được bảo vệ)</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Sinh viên chính quy FPT</span>
                  )}
                </div>

                {isStudentVerified ? (
                  /* Đã xác thực Thẻ SV -> Hiển thị dạng thẻ cố định, không cần sửa */
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Họ tên sinh viên:</span>
                      <strong className="text-slate-800">{fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Mã SV (MSSV):</span>
                      <strong className="text-slate-800 font-mono">{studentId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Cơ sở Campus:</span>
                      <strong className="text-slate-800">{campus}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Khóa & Ngành:</span>
                      <strong className="text-slate-800">{cohort} • {major}</strong>
                    </div>
                  </div>
                ) : (
                  /* Chưa xác thực Thẻ SV -> Cho nhập thông tin SV */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Họ và tên</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Tuấn Nam"
                        disabled={isPending}
                        className={cn(
                          "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-fpt-orange transition",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none"
                        )}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 mb-1 block">Mã số sinh viên (MSSV)</label>
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="HE172819"
                        disabled={isPending}
                        className={cn(
                          "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 uppercase font-mono outline-none focus:bg-white focus:border-fpt-orange transition",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none"
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* KHỐI 2: THÔNG TIN GIAN HÀNG & KINH DOANH */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Store className="h-4 w-4 text-fpt-orange" />
                  <span>Bước 3: Thiết lập Gian hàng & Kinh doanh Campus</span>
                </label>

                <div className="rounded-2xl bg-orange-50/40 border border-orange-200/80 p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 block">Tên gian hàng hiển thị</label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Ví dụ: Góc Sách & Gear IT K17 Hola"
                        disabled={isPending}
                        className={cn(
                          "w-full rounded-xl border border-orange-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-fpt-orange",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none"
                        )}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 block">Danh mục đồ bán chính</label>
                      <select
                        value={primaryCategory}
                        onChange={(e) => setPrimaryCategory(e.target.value)}
                        disabled={isPending}
                        className={cn(
                          "w-full rounded-xl border border-orange-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-fpt-orange",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none"
                        )}
                      >
                        <option value="Giáo trình & Phụ kiện IT">Giáo trình & Tài liệu học IT</option>
                        <option value="Thiết bị & Đồ điện tử">Thiết bị & Đồ điện tử (Laptop, Gear)</option>
                        <option value="Đồ gia dụng & KTX">Đồ gia dụng phòng KTX</option>
                        <option value="Thể thao & Thời trang">Thể thao & Đời sống campus</option>
                        <option value="Đa ngành tổng hợp">Tổng hợp đa dạng</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 mb-1 block">Điểm hẹn Safe-Handoff ưu tiên</label>
                    <div className="relative">
                      <MapPin className="h-3.5 w-3.5 text-fpt-orange absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={handoffSpot}
                        onChange={(e) => setHandoffSpot(e.target.value)}
                        placeholder="Sảnh tòa Alpha, Căng-tin Dom E, Thư viện Gamma..."
                        disabled={isPending}
                        className={cn(
                          "w-full rounded-xl border border-orange-200 bg-white pl-8 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-fpt-orange",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* KHỐI 3: THÔNG TIN TÀI KHOẢN NGÂN HÀNG (ESCROW PAYOUT) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Landmark className="h-4 w-4 text-emerald-600" />
                    <span>Bước 4: Tài khoản ngân hàng nhận tiền giao dịch (Escrow)</span>
                    <span className="text-fpt-orange">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">Chuyển khoản tự động sau 48h</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Ngân hàng thụ hưởng</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      disabled={isPending}
                      className={cn(
                        "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-fpt-orange transition",
                        isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none"
                      )}
                    >
                      {VIETNAMESE_BANKS.map((b) => (
                        <option key={b.code} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Số tài khoản ngân hàng (STK)</label>
                      <input
                        type="text"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ví dụ: 0982345892 hoặc 10283948..."
                        disabled={isPending}
                        className={cn(
                          "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-fpt-orange transition",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none"
                        )}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">Tên chủ tài khoản (In hoa không dấu)</label>
                      <input
                        type="text"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                        placeholder="NGUYEN TUAN NAM"
                        disabled={isPending}
                        className={cn(
                          "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold uppercase text-slate-900 outline-none focus:border-fpt-orange transition",
                          isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none"
                        )}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    💡 <em>Lưu ý: Tên chủ tài khoản ngân hàng nên trùng khớp với thông tin sinh viên để lệnh giải ngân tiền cọc Escrow được duyệt tự động.</em>
                  </p>
                </div>
              </div>

              {/* KHỐI 4: ĐỊNH DANH CĂN CƯỚC CÔNG DÂN (CCCD) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span>Bước 5: Xác thực Căn cước công dân (CCCD)</span>
                    <span className="text-fpt-orange">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Yêu cầu bảo mật chuẩn pháp lý</span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Số Căn cước công dân (12 chữ số)</label>
                    <input
                      type="text"
                      maxLength={12}
                      value={citizenId}
                      onChange={(e) => setCitizenId(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ví dụ: 001201018923"
                      disabled={isPending}
                      className={cn(
                        "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-fpt-orange transition",
                        isPending && "bg-slate-100 text-slate-500 cursor-not-allowed select-none"
                      )}
                    />
                  </div>

                  {/* Upload 2 mặt CCCD */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Front CCCD Upload */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>1. Mặt trước CCCD</span>
                        {citizenFrontCardUrl ? (
                          <span className="text-[10px] text-emerald-600 font-semibold">● Đã có ảnh</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Chưa tải</span>
                        )}
                      </div>

                      <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        {citizenFrontCardUrl ? (
                          <>
                            <Image src={citizenFrontCardUrl} alt="Mặt trước CCCD" fill className="object-cover" />
                            {isPending && (
                              <div className="absolute top-2 right-2 rounded-full bg-slate-900/80 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                                <Lock className="h-3 w-3 text-amber-400" />
                                <span>Đã nộp BQT</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-1">
                            <CreditCard className="h-6 w-6 text-slate-300" />
                            <span>Chưa có ảnh</span>
                          </div>
                        )}
                      </div>

                      {isPending ? (
                        <div className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 py-1.5 text-xs font-bold text-slate-400 cursor-not-allowed select-none">
                          <Lock className="h-3 w-3" />
                          <span>Ảnh CCCD đã nộp • Khóa chỉnh sửa</span>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-fpt-orange hover:text-fpt-orange transition cursor-pointer">
                          <Upload className="h-3 w-3" />
                          <span>{citizenFrontCardUrl ? 'Đổi ảnh mặt trước' : 'Tải ảnh mặt trước'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setCitizenFrontCardUrl, 'mặt trước CCCD')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Back CCCD Upload */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>2. Mặt sau CCCD (Chip & Vân tay)</span>
                        {citizenBackCardUrl ? (
                          <span className="text-[10px] text-emerald-600 font-semibold">● Đã có ảnh</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Chưa tải</span>
                        )}
                      </div>

                      <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        {citizenBackCardUrl ? (
                          <>
                            <Image src={citizenBackCardUrl} alt="Mặt sau CCCD" fill className="object-cover" />
                            {isPending && (
                              <div className="absolute top-2 right-2 rounded-full bg-slate-900/80 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1 shadow">
                                <Lock className="h-3 w-3 text-amber-400" />
                                <span>Đã nộp BQT</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-1">
                            <CreditCard className="h-6 w-6 text-slate-300" />
                            <span>Chưa có ảnh</span>
                          </div>
                        )}
                      </div>

                      {isPending ? (
                        <div className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 py-1.5 text-xs font-bold text-slate-400 cursor-not-allowed select-none">
                          <Lock className="h-3 w-3" />
                          <span>Ảnh CCCD đã nộp • Khóa chỉnh sửa</span>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-fpt-orange hover:text-fpt-orange transition cursor-pointer">
                          <Upload className="h-3 w-3" />
                          <span>{citizenBackCardUrl ? 'Đổi ảnh mặt sau' : 'Tải ảnh mặt sau'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setCitizenBackCardUrl, 'mặt sau CCCD')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* AGREEMENT CHECKBOX */}
          <div className={cn("rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2", isPending && "bg-slate-100/70 border-slate-200")}>
            <label className={cn("flex items-start gap-2 text-xs text-slate-700", isPending ? "cursor-not-allowed opacity-75" : "cursor-pointer")}>
              <input
                type="checkbox"
                checked={agreed}
                disabled={isPending}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-fpt-orange focus:ring-fpt-orange disabled:cursor-not-allowed"
              />
              <span className="leading-relaxed">
                Tôi cam kết là sinh viên chính quy Đại học FPT, các thông tin học vụ, tài khoản ngân hàng và ảnh định danh cung cấp là chính chủ. Tôi cam kết tuân thủ quy chế mua bán Safe-Handoff và chính sách hoàn tiền Escrow 48h của trường FPT.
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
              Đóng
            </button>
            {isPending ? (
              <button
                type="button"
                disabled
                className="flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-300/50 px-6 py-2.5 text-xs sm:text-sm font-bold text-amber-700 cursor-not-allowed shadow-none"
              >
                <Clock className="h-4 w-4 text-amber-600" />
                <span>Đang chờ Admin duyệt (Đã khóa chỉnh sửa)</span>
              </button>
            ) : isRejected ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-rose-500/20 hover:from-rose-500 hover:to-amber-500 transition cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{isSubmitting ? 'Đang gửi lại...' : 'Cập nhật & Nộp lại hồ sơ cho Admin'}</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || (selectedRole === 'student' && isStudentVerified)}
                className="flex items-center gap-2 rounded-xl bg-fpt-orange px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-orange-500/20 hover:bg-fpt-orange-hover transition cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>
                  {isSubmitting
                    ? 'Đang gửi hồ sơ...'
                    : selectedRole === 'seller'
                    ? 'Gửi hồ sơ đăng ký Seller ngay'
                    : 'Gửi hồ sơ xác thực Thẻ SV'}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
