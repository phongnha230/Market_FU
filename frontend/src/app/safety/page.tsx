'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { safehandoffService } from '@/services/safehandoffService';
import {
  ShieldCheck,
  MapPin,
  Camera,
  Users,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  Lock,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Award,
  RefreshCw,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const HUBS_5CAMPUS = [
  {
    campus: 'Campus Hòa Lạc (Hà Nội)',
    badge: '7 Điểm Safe-Handoff',
    locations: [
      { name: 'Sảnh Chính Tòa Alpha (Tầng 1)', note: 'Có bảo vệ trực 24/7, 2 camera HD giám sát bàn tiếp tân' },
      { name: 'Thư viện Gamma (Tầng 1)', note: 'Khu vực tự học, ánh sáng tốt, thích hợp test laptop và máy tính bảng' },
      { name: 'Căng-tin Dom A & Dom E', note: 'Điểm hẹn giao nhận đồ dùng phòng KTX thuận tiện giờ trưa & tối' },
    ],
  },
  {
    campus: 'Campus TP. Hồ Chí Minh (Q.9)',
    badge: '4 Điểm Safe-Handoff',
    locations: [
      { name: 'Sảnh Tòa E2a-7 (Khu Công nghệ cao)', note: 'Điểm giao nhận trung tâm, camera toàn cảnh, gần cổng bảo vệ' },
      { name: 'Thư viện Tòa Nhà Sáng Tạo', note: 'Bàn giao tài liệu, giáo trình, thiết bị IT và linh kiện đồ án' },
    ],
  },
  {
    campus: 'Campus Đà Nẵng',
    badge: '3 Điểm Safe-Handoff',
    locations: [
      { name: 'Sảnh Tòa FPT City Ngũ Hành Sơn', note: 'Khu vực thoáng mát, an ninh trường túc trực' },
      { name: 'Sân Vovinam Tòa Beta', note: 'Điểm hẹn giao nhận đồng phục võ và đồ thể thao' },
    ],
  },
  {
    campus: 'Campus Cần Thơ & Quy Nhơn',
    badge: '4 Điểm Safe-Handoff',
    locations: [
      { name: 'Sảnh Tòa Gamma (Cần Thơ)', note: 'Điểm hẹn trung tâm có ghế ngồi và wifi tốc độ cao để test máy' },
      { name: 'Trung tâm AI Hub & Innovation (Quy Nhơn)', note: 'Khuôn viên công nghệ cao, an ninh camera bảo vệ nghiêm ngặt' },
    ],
  },
];

export default function SafetyPage() {
  const [selectedCampusTab, setSelectedCampusTab] = useState(0);
  const [liveCampusHubs, setLiveCampusHubs] = useState<typeof HUBS_5CAMPUS | null>(null);

  React.useEffect(() => {
    safehandoffService
      .getHubs()
      .then((res) => {
        if (res.hubs && res.hubs.length > 0) {
          const hol = res.hubs.filter((h) => h.campus === 'HOL');
          const hcm = res.hubs.filter((h) => h.campus === 'HCM');
          const dad = res.hubs.filter((h) => h.campus === 'DAD');
          const ctQn = res.hubs.filter((h) => h.campus === 'CT' || h.campus === 'QN');

          const grouped = [
            {
              campus: 'Campus Hòa Lạc (Hà Nội)',
              badge: `${hol.length} Điểm Safe-Handoff`,
              locations: hol.map((h) => ({
                name: `${h.name} (${h.code})`,
                note: h.notes || h.locationDetails || 'Điểm giao nhận an toàn',
              })),
            },
            {
              campus: 'Campus TP. Hồ Chí Minh (Q.9)',
              badge: `${hcm.length} Điểm Safe-Handoff`,
              locations: hcm.map((h) => ({
                name: `${h.name} (${h.code})`,
                note: h.notes || h.locationDetails || 'Điểm giao nhận an toàn',
              })),
            },
            {
              campus: 'Campus Đà Nẵng',
              badge: `${dad.length} Điểm Safe-Handoff`,
              locations: dad.map((h) => ({
                name: `${h.name} (${h.code})`,
                note: h.notes || h.locationDetails || 'Điểm giao nhận an toàn',
              })),
            },
            {
              campus: 'Campus Cần Thơ & Quy Nhơn',
              badge: `${ctQn.length} Điểm Safe-Handoff`,
              locations: ctQn.map((h) => ({
                name: `${h.name} (${h.code})`,
                note: h.notes || h.locationDetails || 'Điểm giao nhận an toàn',
              })),
            },
          ];
          setLiveCampusHubs(grouped);
        }
      })
      .catch((err) => console.log('Using default hubs cache:', err));
  }, []);

  const displayHubs = liveCampusHubs || HUBS_5CAMPUS;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-[#071120] via-[#0F1B2D] to-[#1a2f4c] text-white py-12 lg:py-16 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-10 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-80 w-80 rounded-full bg-fpt-orange/15 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">Trung tâm An toàn FPT Care</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>CHƯƠNG TRÌNH BẢO VỆ TOÀN DIỆN SINH VIÊN FPT CARE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Bảo Vệ Bạn 100% Trong Mọi Giao Dịch P2P
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Bạn hoàn toàn yên tâm khi mua bán đồ cũ tại trường. Sàn FPT 5Campus được bảo trợ
              bởi Ban Quản Trị, Phòng CTSV và Đội ngũ An ninh tại tất cả 5 phân hiệu trường Đại học FPT.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Đổi trả & Hoàn tiền trong 48h
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Mạng lưới 18 Safe-Handoff Hub
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Hỗ trợ hòa giải tranh chấp trong 24h
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN BODY */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-12">
        {/* 1. 3 CAM KẾT VÀNG FPT CARE */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              3 Cam Kết Vàng Bảo Vệ Sinh Viên FPT
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Không còn nỗi lo bị lừa đảo hay mua phải đồ hỏng hóc khi giao dịch nội bộ trường.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'Bảo Hành 48 Giờ Trải Nghiệm',
                desc: 'Đối với đồ điện tử (laptop, điện thoại, phụ kiện), nếu phát sinh lỗi ẩn kỹ thuật không đúng mô tả của người bán, BQT hỗ trợ hoàn tiền hoặc đổi trả 100%.',
                badge: '48H CARE',
                icon: RefreshCw,
                color: 'bg-emerald-500 text-white',
                border: 'border-emerald-200 bg-white',
              },
              {
                title: 'Định Danh Xác Thực MSSV FAP',
                desc: '100% người dùng trên sàn được đồng bộ mã số sinh viên, khóa học và cơ sở qua cổng FPT Education SSO. Danh tính minh bạch, không tài khoản nặc danh.',
                badge: 'SSO VERIFIED',
                icon: Award,
                color: 'bg-blue-600 text-white',
                border: 'border-blue-200 bg-white',
              },
              {
                title: 'Hòa Giải Tranh Chấp 24 Giờ',
                desc: 'Khi có bất đồng hoặc sự cố giao dịch, BQT lập tức mở phòng chat 3 bên đối chất bằng chứng và đưa ra phán quyết công bằng, bảo vệ bên bị thiệt hại.',
                badge: 'SLA 24H',
                icon: HeartHandshake,
                color: 'bg-fpt-orange text-white',
                border: 'border-orange-200 bg-white',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={cn('rounded-2xl border p-6 shadow-xs hover:shadow-md transition space-y-4', card.border)}
                >
                  <div className="flex items-center justify-between">
                    <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shadow-md', card.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2.5 py-1 font-mono">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">{card.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. MẠNG LƯỚI SAFE-HANDOFF HUB TẠI 5 CƠ SỞ */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-extrabold text-fpt-orange uppercase tracking-wide">
                <MapPin className="h-4 w-4" />
                <span>HẠ TẦNG ĐIỂM HẸN NỘI BỘ TRƯỜNG</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
                Mạng Lưới 18 Điểm Safe-Handoff An Toàn
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Các điểm hẹn có camera an ninh độ nét cao và cán bộ bảo vệ trực để sinh viên an tâm gặp mặt thử đồ.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 font-bold w-fit">
              <Camera className="h-4 w-4 text-emerald-600" />
              <span>Giám sát camera an ninh FPT</span>
            </div>
          </div>

          {/* Campus Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {displayHubs.map((c, idx) => (
              <button
                key={c.campus}
                type="button"
                onClick={() => setSelectedCampusTab(idx)}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer shrink-0',
                  selectedCampusTab === idx
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {c.campus}
              </button>
            ))}
          </div>

          {/* Selected Campus Hubs List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {(displayHubs[selectedCampusTab] || displayHubs[0])?.locations.map((loc, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2 hover:border-emerald-300 hover:bg-emerald-50/20 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5">
                    Safe-Point
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">{loc.name}</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">{loc.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. QUY TRÌNH KHIẾU NẠI & HOÀN TIỀN */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Quy Trình 3 Bước Xử Lý Khiếu Nại & Hoàn Tiền
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Khi xảy ra sự cố phát sinh ngoài ý muốn, quyền lợi của bạn được bảo vệ qua các bước sau:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: 'Bước 1',
                title: 'Tạo phiếu khiếu nại',
                desc: 'Vào đơn hàng của bạn, bấm "Khiếu nại / Trả hàng", đính kèm ảnh chụp tình trạng sản phẩm và mô tả lỗi phát sinh.',
              },
              {
                step: 'Bước 2',
                title: 'BQT mở phòng hòa giải',
                desc: 'Trong vòng 2-4 giờ, quản trị viên mở phòng chat 3 bên mời người bán và người mua vào đối chất bằng chứng minh bạch.',
              },
              {
                step: 'Bước 3',
                title: 'Hoàn tiền hoặc đổi trả',
                desc: 'Sau khi xác minh, BQT hướng dẫn hoàn tiền qua mã QR tài khoản sinh viên hoặc đổi trả đồ trực tiếp tại Safe-Handoff Point.',
              },
            ].map((st) => (
              <div key={st.step} className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 space-y-2">
                <span className="text-xs font-black text-fpt-orange font-mono uppercase">{st.step}</span>
                <h3 className="font-bold text-sm text-slate-900">{st.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. EMERGENCY CONTACT HOTLINE */}
        <section className="rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 sm:p-8 shadow-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold backdrop-blur-xs">
              <PhoneCall className="h-3.5 w-3.5" />
              <span>ĐƯỜNG DÂY NÓNG HỖ TRỢ KHẨN CẤP</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Phát Hiện Nghi Vấn Gian Lận Hoặc Cần Can Thiệp Ngay?
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              Liên hệ trực tiếp với Ban Quản trị qua hotline trường hoặc email nội bộ. Đội ngũ an ninh campus sẵn sàng hỗ trợ bạn tại chỗ.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href="/orders/dispute"
              className="rounded-xl bg-white px-5 py-3 text-xs sm:text-sm font-extrabold text-fpt-orange hover:bg-slate-50 transition shadow-sm text-center"
            >
              Gửi Khiếu Nại Ngay
            </Link>
            <Link
              href="/guidelines"
              className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-xs sm:text-sm font-extrabold text-white hover:bg-white/20 transition text-center"
            >
              Xem Quy Tắc Giao Dịch
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
