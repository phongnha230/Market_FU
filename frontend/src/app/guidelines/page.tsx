'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  HelpCircle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  Scale,
  FileText,
  BadgeCheck,
} from 'lucide-react';

const FAQS = [
  {
    q: 'Tôi có thể giao dịch đồ cũ ở đâu an toàn nhất trong trường?',
    a: 'Bạn nên hẹn tại các trạm Safe-Handoff Hub chính thức có camera giám sát và nhân viên bảo vệ trực: Sảnh Tòa Alpha, Thư viện Gamma hoặc Căng-tin Dom (Hòa Lạc); Tòa E2a-7 (TP.HCM); Sảnh FPT City (Đà Nẵng); v.v. Không hẹn ở những góc khuất hoặc ngoài khuôn viên trường khi chưa rõ người bán.',
  },
  {
    q: 'Lỡ người bán yêu cầu chuyển khoản đặt cọc trước qua MoMo/Ngân hàng thì sao?',
    a: 'Tuyệt đối KHÔNG cọc tiền trước! Quy chế sàn FPT 5Campus nghiêm cấm việc yêu cầu cọc tiền ngoài hệ thống. Mọi giao dịch chỉ thanh toán trực tiếp sau khi hai bên đã gặp mặt, kiểm tra và ưng ý với sản phẩm.',
  },
  {
    q: 'Nếu sản phẩm mang về dùng thử bị lỗi ẩn trong 48h thì có được đổi trả không?',
    a: 'Có! Sàn FPT 5Campus áp dụng chính sách FPT Care bảo vệ 48 giờ đối với đồ điện tử. Bạn có quyền tạo phiếu khiếu nại tại mục "Quản lý đơn hàng" -> "Khiếu nại" để BQT và Phòng CTSV mở phòng chat 3 bên hỗ trợ hoàn tiền nếu đồ lỗi không đúng mô tả.',
  },
  {
    q: 'Làm thế nào để nhận diện sinh viên uy tín trên sàn?',
    a: 'Hãy kiểm tra huy hiệu xanh "Đã xác thực thẻ SV FPT" và điểm Tín nhiệm (Trust Score) trên 80 điểm. Những sinh viên có huy hiệu này đã được đối soát thẻ sinh viên và tài khoản FAP SSO chính chủ.',
  },
  {
    q: 'Quy định về thiết bị điện phòng KTX như thế nào?',
    a: 'Theo quy định an toàn PCCC của KTX FPT, nghiêm cấm các loại bếp từ, nồi lẩu điện có công suất vượt quá 1500W. Khi đăng bán đồ gia dụng KTX, người bán phải ghi rõ công suất và chỉ bàn giao thiết bị đạt chuẩn an toàn.',
  },
];

export default function GuidelinesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-[#0F1B2D] via-[#162742] to-[#1F365C] text-white py-12 lg:py-16 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-fpt-orange/15 blur-3xl" />
          <div className="absolute -bottom-10 left-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-fpt-orange font-semibold">Quy tắc giao dịch</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 border border-orange-500/30 px-3.5 py-1 text-xs font-bold text-orange-300">
              <BookOpen className="h-3.5 w-3.5 text-fpt-orange" />
              <span>QUY CHẾ VẬN HÀNH CHỢ ĐỒ CŨ SINH VIÊN FPT 5CAMPUS</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Quy Tắc Giao Dịch & Cẩm Nang Mua Bán An Toàn
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Bộ quy chuẩn bảo vệ quyền lợi sinh viên Đại học FPT tại cả 5 phân hiệu: Hòa Lạc, TP.HCM,
              Đà Nẵng, Cần Thơ và Quy Nhơn. Mọi giao dịch diễn ra văn minh, minh bạch và an toàn 100%.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                100% Sinh viên SSO FPT
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Không cọc tiền ngoài sàn
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                18 điểm Safe-Handoff an toàn
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-12">
        {/* 1. QUY TRÌNH 4 BƯỚC GIAO DỊCH */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Quy Trình 4 Bước Giao Dịch P2P Tiêu Chuẩn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Mỗi sinh viên cần tuân thủ 4 bước cốt lõi này để đảm bảo giao dịch suôn sẻ và được bảo vệ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Đăng nhập & KYC Thẻ SV',
                desc: 'Đăng nhập bằng tài khoản FPT Mail (@fpt.edu.vn) và xác minh thẻ sinh viên để mở khóa đầy đủ quyền mua bán.',
                icon: BadgeCheck,
                color: 'text-blue-600 bg-blue-50 border-blue-200',
              },
              {
                step: '02',
                title: 'Trao Đổi Qua Chat Sàn',
                desc: 'Mọi thỏa thuận giá, tình trạng đồ, ảnh chi tiết cần thực hiện trong tin nhắn hệ thống để lưu vết làm bằng chứng.',
                icon: FileText,
                color: 'text-fpt-orange bg-orange-50 border-orange-200',
              },
              {
                step: '03',
                title: 'Hẹn Gặp Tại Safe-Handoff',
                desc: 'Hẹn trực tiếp tại 18 điểm giao nhận an toàn trong campus có camera và bảo vệ trường giám sát 24/7.',
                icon: MapPin,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              },
              {
                step: '04',
                title: 'Test Đồ Rồi Mới Trả Tiền',
                desc: 'Trực tiếp kiểm tra máy, bật nguồn, lướt phím, xem sách. Ưng ý mới thanh toán tiền mặt hoặc quét mã QR ngân hàng.',
                icon: ShieldCheck,
                color: 'text-purple-600 bg-purple-50 border-purple-200',
              },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:shadow-md transition space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${st.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-fpt-orange transition font-mono">
                      {st.step}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">{st.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. HÀNG HÓA CHO PHÉP VÀ NGHIÊM CẤM */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Scale className="h-5 w-5 text-fpt-orange" />
                Danh Mục Hàng Hóa Được Phép & Nghiêm Cấm
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Quy định áp dụng cho mọi tin đăng trên toàn hệ thống 5 Campus FPT.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 w-fit">
              Ban hành bởi BQT & CTSV
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allowed */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm sm:text-base">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Được Phép Mua Bán & Trao Đổi</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                {[
                  'Giáo trình, tài liệu tham khảo chính hãng, đề cương ôn tập môn học FPT.',
                  'Đồ công nghệ: Laptop, màn hình phụ, bàn phím cơ, chuột, tai nghe, iPad học tập.',
                  'Đồng phục trường: Áo phông cam FPT, võ phục Vovinam, áo khoác gió sự kiện.',
                  'Đồ dùng KTX & sinh hoạt: Bàn ghế học, giá sách, đèn bàn, quạt tích điện, bàn ủi mini.',
                  'Thiết bị gia dụng KTX công suất định mức dưới 1500W (đúng chuẩn PCCC).',
                  'Xe cộ di chuyển cá nhân: Xe máy, xe đạp điện chính chủ sinh viên đi học.',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Forbidden */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-5 space-y-4">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm sm:text-base">
                <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <span>Nghiêm Cấm Tuyệt Đối Trên Sàn</span>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                {[
                  'Mua bán tài khoản FAP, CMS, LMS, email sinh viên hoặc tài khoản trường cấp.',
                  'Tài liệu gian lận thi cử: Đề thi PE/FE bảo mật, code giải bài tập gian lận.',
                  'Yêu cầu cọc tiền ngoài sàn qua tài khoản cá nhân khi chưa gặp mặt kiểm tra hàng.',
                  'Thiết bị điện công suất trên 1500W vi phạm nội quy an toàn PCCC KTX FPT.',
                  'Thuốc lá, vape, đồ uống có cồn, chất cấm theo Bộ luật học đường FPT.',
                  'Hàng giả, hàng nhái thương hiệu, hàng không rõ nguồn gốc xuất xứ.',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 3. NGUYÊN TẮC AN TOÀN VÀ XỬ PHẠT */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Chế Tài Xử Phạt Vi Phạm Quy Chế
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Hệ thống kết hợp cùng Phòng Công tác Sinh viên (CTSV) và Ban Quản lý KTX để duy trì
              môi trường trao đổi minh bạch. Bất kỳ hành vi vi phạm nào đều bị ghi nhận vào nhật ký
              Trust Score:
            </p>

            <div className="space-y-3">
              {[
                {
                  level: 'Mức 1: Khiển trách & Trừ điểm',
                  condition: 'Boom hẹn, không đến điểm Safe-Handoff đúng giờ đã hẹn mà không báo trước.',
                  punish: 'Trừ 15 điểm Trust Score, hạn chế đăng tin 3 ngày và gắn cảnh báo.',
                },
                {
                  level: 'Mức 2: Tạm đình chỉ tài khoản',
                  condition: 'Ép người mua cọc tiền ngoài sàn, mô tả sai lệch tình trạng sản phẩm.',
                  punish: 'Khóa tài khoản 14 ngày, thu hồi huy hiệu KYC và hoàn tiền bảo lãnh cho nạn nhân.',
                },
                {
                  level: 'Mức 3: Chuyển hồ sơ học vụ',
                  condition: 'Bán tài liệu bảo mật bộ môn, gian lận học thuật, lừa đảo chiếm đoạt tài sản.',
                  punish: 'Khóa tài khoản vĩnh viễn, gửi công văn xử lý vi phạm sang Phòng CTSV và Đào tạo FPT.',
                },
              ].map((p) => (
                <div key={p.level} className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span className="text-fpt-orange">{p.level}</span>
                  </div>
                  <div className="text-xs text-slate-700">
                    <strong>Hành vi:</strong> {p.condition}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <strong>Hình thức xử lý:</strong> {p.punish}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Cần Hỗ Trợ Khiếu Nại?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nếu gặp bất kỳ vấn đề gì trong lúc mua bán hoặc phát hiện đối tượng nghi vấn, hãy tạo khiếu nại
                ngay để đội ngũ quản trị viên BQT can thiệp bảo vệ bạn trong 24h.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/safety"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-fpt-orange py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-fpt-orange-hover transition shadow-xs"
              >
                <span>Xem chính sách bảo vệ FPT Care</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/orders/dispute"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <span>Gửi yêu cầu khiếu nại</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. FAQS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center justify-center gap-2">
              <HelpCircle className="h-5 w-5 text-fpt-orange" />
              Câu Hỏi Thường Gặp Về Giao Dịch
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Giải đáp các thắc mắc phổ biến nhất của sinh viên khi mua bán trao đổi tại trường.
            </p>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-slate-100">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-fpt-orange transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed pr-6 animate-in fade-in duration-200">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
