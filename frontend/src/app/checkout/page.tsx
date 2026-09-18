'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import KycRegistrationModal from '@/components/modals/KycRegistrationModal';
import {
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Truck,
  MapPin,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Sparkles,
  MessageSquare,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'cod'>('vietqr');
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Notes state
  const [deliveryNote, setDeliveryNote] = useState('Giao tại sảnh Dom B vào buổi chiều sau giờ học Capstone.');
  const [isEditingNote, setIsEditingNote] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText('1225000');
    setCopiedAmount(true);
    showToast('Đã sao chép số tiền 1.225.000 đ');
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('ORDER88392');
    setCopiedCode(true);
    showToast('Đã sao chép nội dung chuyển khoản ORDER88392');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentUser = useUserStore((state) => state.user);
  const isKycVerified = currentUser.kycStatus === 'approved_student' || currentUser.kycStatus === 'approved_seller';
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  const createOrder = useOrderStore((state) => state.createOrder);

  const handleConfirmOrder = () => {
    if (!isKycVerified) {
      showToast('⚠️ Vui lòng xác thực Thẻ Sinh Viên để đặt đơn Safe-Handoff và kích hoạt bảo hiểm FPT Care!');
      setIsKycModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    const newOrder = createOrder({
      product: {
        title: 'Màn hình phụ di động 15.6 inch Type-C FHD IPS (Fullbox cáp zin)',
        subtitle: 'Phù hợp học Code WEB2013 / Đồ họa • Hỗ trợ kết nối một dây Type-C PD',
        price: 1225000,
        escrowBadge: 'Đã cọc Escrow bảo hộ',
        conditionBadge: 'Like New',
        imageUrl: '/products/monitor-dell-24.jpg',
        seller: {
          name: 'Nguyễn Văn An',
          cohortCampus: 'K16 SE - FPT Q.9 TP.HCM',
          verifiedText: 'Miễn phí ký gửi liên cơ sở',
        },
      },
      type: 'inter-campus',
      deliveryNote,
      paymentMethod,
    });

    showToast(`🎉 Đặt hàng thành công! Đơn hàng ${newOrder.code} đã được lưu vào hệ thống.`);
    setTimeout(() => {
      router.push('/orders');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col justify-between font-sans">
      <Navbar />

      <main className="mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* 1. BREADCRUMBS & ESCROW BADGE */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-fpt-orange transition-colors">
              Trang chủ
            </Link>
            <span className="text-slate-400">›</span>
            <Link href="/posts" className="hover:text-fpt-orange transition-colors">
              Giỏ hàng sinh viên
            </Link>
            <span className="text-slate-400">›</span>
            <span className="text-slate-800 font-semibold">Đặt hàng & Thanh toán Liên Campus</span>
            <span className="rounded bg-orange-100/80 px-2 py-0.5 text-[11px] font-bold text-fpt-orange border border-orange-200">
              #ORD-88392-HCM-HL
            </span>
          </nav>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full self-start sm:self-auto">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Giao dịch bảo hộ Escrow KTX ĐH FPT</span>
          </div>
        </div>

        {/* Unverified KYC Warning Banner */}
        {!isKycVerified && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-amber-950 text-sm">Yêu cầu Xác thực Thẻ Sinh Viên trước khi Đặt hàng:</h4>
                <p className="text-amber-800 mt-0.5">
                  Để bảo vệ an toàn giao dịch Safe-Handoff và kích hoạt bảo hiểm hoàn tiền 48h FPT Care, người mua cần xác thực thẻ sinh viên chính chủ.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsKycModalOpen(true)}
              className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer shrink-0 text-center shadow-xs"
            >
              Xác thực Thẻ SV ngay
            </button>
          </div>
        )}

        {/* 2. MAIN 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: SECTIONS (8 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* SECTION 1: VẬN CHUYỂN LIÊN CAMPUS FPT CAMPUSSHIP */}
            <div className="rounded-2xl border border-orange-100 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-fpt-orange p-2 text-white shrink-0 shadow-xs">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                      Vận chuyển Liên Campus FPT CampusShip
                    </h2>
                    <p className="text-xs text-slate-500">
                      Tuyến liên tỉnh Bắc - Nam ưu tiên dành riêng cho sinh viên FPT
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700 border border-slate-200 self-start sm:self-auto">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  FPT Express Transit Line #01
                </span>
              </div>

              {/* Transit Route Visualization */}
              <div className="mt-5 rounded-xl bg-slate-50/80 border border-slate-200/80 p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Origin */}
                  <div className="text-left">
                    <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                      NƠI GỬI
                    </span>
                    <div className="mt-1 font-extrabold text-slate-900 text-sm">FPT TP.HCM</div>
                    <div className="text-xs text-slate-500">Campus Quận 9, TP. Thủ Đức</div>
                  </div>

                  {/* Route line & info */}
                  <div className="flex-1 flex flex-col items-center px-2">
                    <div className="flex items-center justify-between w-full text-[11px] text-slate-500 font-medium mb-1">
                      <span>Khoảng cách 1.700 km</span>
                      <span className="text-fpt-orange font-bold">2 - 3 ngày làm việc</span>
                    </div>
                    <div className="relative w-full h-2 bg-slate-200 rounded-full flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-fpt-orange to-emerald-500 rounded-full"></div>
                      <div className="absolute -top-1 bg-white border border-fpt-orange rounded-full p-0.5 shadow-xs">
                        <Truck className="h-3.5 w-3.5 text-fpt-orange" />
                      </div>
                    </div>
                    <span className="mt-1.5 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      ĐƯỢC ĐÓNG THÙNG CHỐNG SỐC KTX
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="text-left md:text-right">
                    <span className="rounded bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-fpt-orange uppercase">
                      NƠI NHẬN
                    </span>
                    <div className="mt-1 font-extrabold text-slate-900 text-sm">FPT Hòa Lạc</div>
                    <div className="text-xs text-slate-500">Khu CNC Hòa Lạc, Hà Nội</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-600 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Bảo hộ Escrow 24 giờ.</strong> Tiền được giữ trên tài khoản bảo đảm của ĐH FPT, chỉ chuyển khoản cho người bán sau 24h từ lúc bạn ký nhận và kiểm tra thiết bị hoạt động tốt.
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: ĐỊA CHỈ & ĐIỂM BÀN GIAO KTX */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-fpt-orange" />
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Địa chỉ & Điểm Bàn giao KTX
                  </h2>
                </div>
                <span className="rounded bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  XÁC THỰC FAP SSO
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SENDER CARD */}
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      BÊN GỬI (NGƯỜI BÁN)
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5">
                      Trust 96/100
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">Nguyễn Văn An</div>
                  <div className="text-xs text-slate-500 mt-0.5">MSSV: HE160392 • K16 Kỹ thuật phần mềm (SE)</div>
                  <div className="mt-2 text-xs text-slate-600 flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>KTX Tòa E (Phòng 312), Campus FPT TP.HCM (Quận 9, TP. Thủ Đức)</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Đã nộp đồ tại Safe-Handoff Point Thư viện HCM</span>
                  </div>
                </div>

                {/* RECEIVER CARD */}
                <div className="rounded-xl bg-orange-50/50 p-4 border border-orange-200/70">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[10px] font-bold text-fpt-orange uppercase tracking-wider">
                      BÊN NHẬN (BẠN)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingNote(!isEditingNote)}
                      className="text-[11px] font-bold text-fpt-orange hover:underline cursor-pointer"
                    >
                      {isEditingNote ? 'Xong' : 'Thay đổi'}
                    </button>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">Lê Minh Quân</div>
                  <div className="text-xs text-slate-500 mt-0.5">MSSV: HE172819 • 0987.654.321</div>
                  <div className="mt-2 text-xs text-slate-600 flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-fpt-orange shrink-0 mt-0.5" />
                    <span>Phòng 402, Dom B, Ký túc xá FPT Hòa Lạc, Thạch Thất, Hà Nội</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-orange-200/60 text-[11px] text-slate-700">
                    {isEditingNote ? (
                      <input
                        type="text"
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        className="w-full rounded border border-orange-300 bg-white px-2 py-1 text-xs outline-none"
                      />
                    ) : (
                      <span>
                        💬 <strong>Ghi chú bàn giao:</strong> {deliveryNote}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: KIỆN HÀNG ĐẶT MUA */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Kiện hàng đặt mua
                </h2>
                <span className="text-xs text-slate-500 font-medium">1 sản phẩm điện tử</span>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-start gap-4">
                <div className="relative h-28 w-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <Image
                    src="/products/monitor-dell-24.jpg"
                    alt="Màn hình phụ di động 15.6 inch Type-C"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 rounded bg-slate-900/85 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    HCM ➔ HL
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                      Like New 95%
                    </span>
                    <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
                      Sinh viên K16 Pass
                    </span>
                    <span className="text-[11px] text-slate-400">Đăng 3 giờ trước</span>
                  </div>

                  <h3 className="mt-1.5 text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    Màn hình phụ di động 15.6 inch Type-C (Kèm cáp Type-C & bao da chống sốc)
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    Đầy đủ phụ kiện cáp C-to-C, HDMI mini, bao da kiêm giá đỡ. Màn Full HD IPS 60Hz hiển thị code/tài liệu mượt mà, pass lại để về quê thực tập.
                  </p>

                  <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                      🛡️ Bao test 24h nhận
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                      📦 Được đồng kiểm hộp
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                      🔄 Hoàn tiền nếu lỗi
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Đơn giá niêm yết:</span>
                    <span className="text-base font-extrabold text-slate-900">1.200.000 đ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: PHƯƠNG THỨC THANH TOÁN LIÊN CAMPUS */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Phương thức Thanh toán Liên Campus
                  </h2>
                  <p className="text-xs text-slate-500">
                    Áp dụng chế độ ký quỹ đảm bảo quyền lợi khi vận chuyển khác thành phố
                  </p>
                </div>
                <span className="rounded bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-fpt-orange border border-orange-200">
                  BẢO VỆ 2 CHIỀU
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {/* OPTION 1: VIETQR NAPAS247 (ACTIVE) */}
                <div
                  onClick={() => setPaymentMethod('vietqr')}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    paymentMethod === 'vietqr'
                      ? 'border-fpt-orange bg-orange-50/20 ring-2 ring-fpt-orange/15'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'vietqr'}
                        onChange={() => setPaymentMethod('vietqr')}
                        className="h-4 w-4 text-fpt-orange focus:ring-fpt-orange"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            Quét mã QR Sàn FPT (VietQR Napas247 / Escrow An Toàn)
                          </span>
                          <span className="rounded bg-fpt-orange px-2 py-0.5 text-[10px] font-bold text-white">
                            KHUYÊN DÙNG
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                          ⚡ Xác thực tức thì 0đ phí.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 pl-7 leading-relaxed">
                    Tiền chuyển đến tài khoản Escrow trung gian của Sàn FPT 5Campus Marketplace. Chỉ giải ngân cho bạn bán sau 24h kể từ khi sinh viên nhận hàng thành công và bấm "Đã kiểm tra OK".
                  </p>

                  {/* QR CODE CARD */}
                  {paymentMethod === 'vietqr' && (
                    <div className="mt-4 ml-7 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        {/* QR Canvas Box */}
                        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[10px] font-extrabold text-slate-600 mb-1 tracking-wider uppercase">
                            VIETQR | NAPAS247
                          </div>
                          {/* Real-looking SVG QR Code with FPT icon center */}
                          <div className="relative h-36 w-36 bg-white p-2 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                              {/* QR Pattern Mockup */}
                              <rect x="0" y="0" width="28" height="28" rx="4" fill="#0f172a" />
                              <rect x="4" y="4" width="20" height="20" rx="2" fill="#ffffff" />
                              <rect x="8" y="8" width="12" height="12" rx="1" fill="#0f172a" />

                              <rect x="72" y="0" width="28" height="28" rx="4" fill="#0f172a" />
                              <rect x="76" y="4" width="20" height="20" rx="2" fill="#ffffff" />
                              <rect x="80" y="8" width="12" height="12" rx="1" fill="#0f172a" />

                              <rect x="0" y="72" width="28" height="28" rx="4" fill="#0f172a" />
                              <rect x="4" y="76" width="20" height="20" rx="2" fill="#ffffff" />
                              <rect x="8" y="80" width="12" height="12" rx="1" fill="#0f172a" />

                              {/* Matrix dots */}
                              <rect x="34" y="8" width="6" height="6" fill="#0f172a" />
                              <rect x="46" y="8" width="6" height="6" fill="#0f172a" />
                              <rect x="58" y="8" width="6" height="6" fill="#0f172a" />
                              <rect x="34" y="20" width="6" height="6" fill="#0f172a" />
                              <rect x="58" y="20" width="6" height="6" fill="#0f172a" />
                              <rect x="8" y="34" width="6" height="6" fill="#0f172a" />
                              <rect x="20" y="34" width="6" height="6" fill="#0f172a" />
                              <rect x="74" y="34" width="6" height="6" fill="#0f172a" />
                              <rect x="86" y="34" width="6" height="6" fill="#0f172a" />
                              <rect x="8" y="46" width="6" height="6" fill="#0f172a" />
                              <rect x="20" y="58" width="6" height="6" fill="#0f172a" />
                              <rect x="74" y="58" width="6" height="6" fill="#0f172a" />
                              <rect x="86" y="58" width="6" height="6" fill="#0f172a" />

                              {/* Center FPT Logo Badge */}
                              <circle cx="50" cy="50" r="14" fill="#F26F21" />
                              <text x="50" y="55" fontSize="10" fontWeight="900" fill="#ffffff" textAnchor="middle">
                                5C
                              </text>
                            </svg>
                          </div>
                          <span className="mt-2 text-[10px] font-bold text-slate-500">
                            Quét qua App Ngân hàng bất kỳ
                          </span>
                        </div>

                        {/* Bank Details */}
                        <div className="md:col-span-8 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500">Tên tài khoản:</span>
                            <span className="font-extrabold text-slate-900">SAN FPT 5CAMPUS MARKETPLACE</span>
                          </div>

                          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                            <span className="font-bold text-slate-900">TPBank (Ngân hàng Tiên Phong)</span>
                          </div>

                          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500">Số tiền chuyển khoản:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-fpt-orange text-sm sm:text-base">
                                1.225.000 đ
                              </span>
                              <button
                                type="button"
                                onClick={handleCopyAmount}
                                className="rounded p-1 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                                title="Sao chép số tiền"
                              >
                                {copiedAmount ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500">Nội dung chuyển khoản (bắt buộc):</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                ORDER88392
                              </span>
                              <button
                                type="button"
                                onClick={handleCopyCode}
                                className="inline-flex items-center gap-1 rounded-lg bg-orange-600 text-white px-2.5 py-1 text-[11px] font-bold hover:bg-orange-700 transition cursor-pointer"
                              >
                                {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                <span>Sao chép mã</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 pt-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>Hệ thống tự động đối soát giao dịch thời gian thực (Webhook 10s)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* OPTION 2: COD */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`rounded-xl border p-4 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-fpt-orange bg-orange-50/20 ring-2 ring-fpt-orange/15'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="h-4 w-4 text-fpt-orange focus:ring-fpt-orange"
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        Thanh toán khi nhận hàng (COD Liên Campus)
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">Trả tại KTX Dom B</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 pl-7 leading-relaxed">
                    Thanh toán tiền mặt hoặc chuyển khoản trực tiếp cho nhân viên giao vận FPT Express / Ban quản lý KTX Dom B sau khi bóc hộp, cắm thử cáp Type-C lên hình.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SUMMARY SIDEBAR (4 COLS) */}
          <div className="lg:col-span-4 space-y-5">
            {/* PAYMENT SUMMARY CARD */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900">Tóm tắt thanh toán</h3>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  FPT SAFE-ESCROW
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Tiền hàng tạm tính</span>
                  <span className="font-bold text-slate-800">1.200.000 đ</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    Phí ship liên campus (1.700km)
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                  </span>
                  <span className="font-medium text-slate-800">40.000 đ</span>
                </div>

                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Voucher Freeship 5Campus
                  </span>
                  <span>-15.000 đ</span>
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px] pl-3">
                  <span>• Phí vận chuyển thực tế:</span>
                  <span>25.000 đ</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Bảo hiểm đồ điện tử sinh viên
                  </span>
                  <span className="font-bold text-emerald-700">Miễn phí (Đoàn trường)</span>
                </div>

                {/* TOTAL AMOUNT */}
                <div className="pt-4 border-t border-slate-200/80">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        TỔNG THANH TOÁN
                      </div>
                      <div className="text-[10px] text-slate-400">Đã bao gồm VAT & Phí Escrow</div>
                    </div>
                    <div className="text-2xl font-black text-fpt-orange">
                      1.225.000 <span className="text-sm font-bold">đ</span>
                    </div>
                  </div>
                </div>

                {/* CTA BUTTON */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmOrder}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-fpt-orange py-3.5 text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:bg-fpt-orange-hover hover:shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  <span>{isSubmitting ? 'Đang xác nhận...' : 'Xác nhận đặt đơn & Thanh toán an toàn'}</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-tight pt-1">
                  Nhấn xác nhận đồng nghĩa với việc đồng thuận{' '}
                  <span className="underline decoration-slate-300">Quy chế thương mại nội bộ ĐH FPT</span>.
                </p>
              </div>

              {/* TRUST BADGES */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>100% Sinh viên chính quy:</strong> Cả người bán và người mua đều được xác thực danh tính qua cổng FAP / Office365 sinh viên.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Chống lừa đảo 100%:</strong> Giao nhận có camera an ninh tại Safe-Handoff Point Thư viện và Lễ tân Dom KTX.
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Cần hỗ trợ đơn hàng?</span>
                <span className="font-bold text-fpt-orange hover:underline cursor-pointer">
                  Trợ lý CTSV trực 24/7
                </span>
              </div>
            </div>

            {/* CAMPUS CULTURE CARD */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs text-slate-600 flex items-start gap-3 shadow-xs">
              <div className="rounded-lg bg-orange-100 p-2 text-fpt-orange shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Giao lưu Văn hóa 5 Campus:</h4>
                <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
                  Mỗi món đồ chuyển đi là một câu chuyện kết nối sinh viên Hòa Lạc - Sài Gòn - Đà Nẵng - Cần Thơ - Quy Nhơn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white px-5 py-3 shadow-xl backdrop-blur-md text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal KYC Registration */}
      <KycRegistrationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        defaultRole="student"
        onShowToast={showToast}
      />

      <Footer />
    </div>
  );
}
