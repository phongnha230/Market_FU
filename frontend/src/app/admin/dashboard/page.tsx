'use client';

import React, { useState } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import {
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  Shield,
  Download,
  RotateCcw,
  Calendar,
  Globe,
  ChevronDown,
  CheckCircle2,
  Lock,
  Camera,
  Check,
  ArrowRight,
  Clock,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const [selectedCampus, setSelectedCampus] = useState('Toàn quốc (5 Campus)');
  const [selectedSemester, setSelectedSemester] = useState('Kỳ Fall 2024');

  return (
    <AdminLayoutShell>
      <div className="space-y-6 max-w-[1520px] mx-auto font-sans pb-10">
        {/* ─── HEADER BAR ─── */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200/80 px-2.5 py-0.5 text-[11px] font-extrabold text-orange-600">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                TOÀN QUỐC • REALTIME ESCROW
              </span>
              <span className="text-xs text-slate-400 font-medium">Cập nhật lúc 10:42 sáng nay</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Bảng Điều Khiển Quản Trị & Biểu Đồ Hoạt Động Toàn Hệ Thống
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Theo dõi lưu lượng ký quỹ ESCROW, giao dịch an toàn 5 Campus FPT và năng lực vận hành trạm Safe-Handoff.
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Campus dropdown */}
            <div className="relative">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition">
                <Globe className="h-3.5 w-3.5 text-slate-500" />
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="appearance-none bg-transparent pr-5 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option>Toàn quốc (5 Campus)</option>
                  <option>Hòa Lạc (Hà Nội)</option>
                  <option>TP.HCM (Quận 9)</option>
                  <option>Đà Nẵng</option>
                  <option>Quy Nhơn</option>
                  <option>Cần Thơ</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Semester selector */}
            <div className="relative">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="appearance-none bg-transparent pr-5 text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option>Kỳ Fall 2024</option>
                  <option>Kỳ Spring 2025</option>
                  <option>Kỳ Summer 2024</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            {/* Refresh button */}
            <button
              onClick={() => {}}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Làm mới</span>
            </button>

            {/* Export button */}
            <button className="flex items-center gap-1.5 rounded-xl bg-[#F27024] hover:bg-[#E05C10] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-orange-500/25 transition cursor-pointer active:scale-95">
              <Download className="h-3.5 w-3.5" />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>

        {/* ─── ROW 1: 4 KEY METRIC STAT CARDS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4.5">
          {/* Card 1: Tổng quỹ Escrow bảo hộ */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-orange-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                TỔNG QUỸ ESCROW BẢO HỘ
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100/70 text-orange-600">
                <Wallet className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">485.200.000</span>
              <span className="text-xs font-bold text-slate-500">đ</span>
            </div>

            <div className="mt-3.5 flex items-end justify-between">
              {/* Mini SVG Area Sparkline */}
              <div className="w-28 h-8">
                <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="escrowSpark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F27024" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#F27024" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,25 Q15,22 30,24 T60,14 T85,16 T100,5 L100,30 L0,30 Z"
                    fill="url(#escrowSpark)"
                  />
                  <path
                    d="M0,25 Q15,22 30,24 T60,14 T85,16 T100,5"
                    fill="none"
                    stroke="#F27024"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  +18.4%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">so với T8/2024</div>
              </div>
            </div>
          </div>

          {/* Card 2: Giao dịch thành công */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                GIAO DỊCH THÀNH CÔNG
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-600">
                <ArrowLeftRight className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">3.420</span>
              <span className="text-xs font-bold text-slate-500">lượt</span>
            </div>

            <div className="mt-3.5 flex items-end justify-between">
              {/* Mini vertical bars */}
              <div className="flex items-end gap-1 h-8">
                {[30, 45, 60, 50, 75, 90, 100].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-2 rounded-t-xs bg-emerald-400"
                  />
                ))}
              </div>

              <div className="text-right">
                <div className="text-[11px] font-bold text-emerald-600 flex items-center justify-end gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  +12.6%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">248 tin hôm nay</div>
              </div>
            </div>
          </div>

          {/* Card 3: Sinh viên đã KYC / SSO */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                SINH VIÊN ĐÃ KYC / SSO
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100/70 text-blue-600">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 tracking-tight">18.250</span>
              <span className="text-xs font-bold text-slate-500">SV</span>
            </div>

            <div className="mt-3.5 flex items-center justify-between">
              {/* Circular progress ring */}
              <div className="relative flex items-center justify-center w-8 h-8">
                <svg className="w-8 h-8 transform -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="#1e293b"
                    strokeWidth="3"
                    strokeDasharray={75.4}
                    strokeDashoffset={75.4 * (1 - 0.94)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[9px] font-extrabold text-slate-800">94%</span>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-bold text-slate-700">94.2% Sinh viên trường</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Đồng bộ qua FAP Mail</div>
              </div>
            </div>
          </div>

          {/* Card 4: Tỷ lệ an toàn & Không tranh chấp */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-200 transition">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                TỶ LỆ AN TOÀN & KHÔNG TRANH CHẤP
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-600">
                <Shield className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600 tracking-tight">99.92%</span>
            </div>

            <div className="mt-3.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Escrow Active 24/7
              </span>

              <div className="text-right">
                <div className="text-[11px] font-extrabold text-rose-600">Chỉ 3 khiếu nại</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Đang xử lý trong 2h</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ROW 2: DUAL ANALYSIS PANELS (65% - 35%) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel (8 cols -> ~66%) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Xu Hướng Dòng Tiền Escrow & Số Lượng Giao Dịch
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Giai đoạn Kỳ Fall 2024 (Đỉnh điểm K20 Tân sinh viên & Tuần lễ Đồ án Capstone)
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F27024]"></span>
                    <span className="text-slate-600 text-[11px]">Dòng tiền Escrow [Triệu VNĐ]</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-800"></span>
                    <span className="text-slate-600 text-[11px]">Số đơn giao dịch</span>
                  </div>
                </div>
              </div>

              {/* Chart SVG Canvas */}
              <div className="relative mt-4 h-64 w-full">
                {/* Tooltip Callout 1: K20 Nhập học */}
                <div className="absolute left-[38%] top-[34%] -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
                  <div className="bg-[#1E293B] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap text-center">
                    <div>Tuần Nhập Học K20</div>
                    <div className="text-[9px] font-medium text-slate-300">+74% số đơn KTX</div>
                  </div>
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1E293B] mx-auto"></div>
                </div>

                {/* Tooltip Callout 2: Đỉnh Capstone */}
                <div className="absolute left-[79%] top-[25%] -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
                  <div className="bg-[#1E293B] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap text-center">
                    <div>Đỉnh Capstone: 112.5M đ</div>
                    <div className="text-[9px] font-medium text-slate-300">614 giao dịch thiết bị</div>
                  </div>
                  <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1E293B] mx-auto"></div>
                </div>

                {/* SVG Curve Chart */}
                <svg viewBox="0 0 650 210" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F27024" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F27024" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Y-Axis Horizontal Grid Lines */}
                  {[
                    { val: '120M', y: 20 },
                    { val: '90M', y: 65 },
                    { val: '60M', y: 110 },
                    { val: '30M', y: 155 },
                    { val: '0đ', y: 195 },
                  ].map((grid, idx) => (
                    <g key={idx}>
                      <text x="0" y={grid.y + 4} className="text-[9px] fill-slate-400 font-semibold">
                        {grid.val}
                      </text>
                      <line
                        x1="35"
                        y1={grid.y}
                        x2="650"
                        y2={grid.y}
                        stroke="#f1f5f9"
                        strokeDasharray={idx === 4 ? '' : '3,3'}
                        strokeWidth="1"
                      />
                    </g>
                  ))}

                  {/* Orange Filled Area under Escrow Curve */}
                  <path
                    d="M 50,185 C 130,175 190,105 250,105 C 310,105 340,120 400,95 C 460,70 515,80 575,72 C 605,68 630,76 645,80 L 645,195 L 50,195 Z"
                    fill="url(#areaGradient)"
                  />

                  {/* Orange Curve: Escrow Volume */}
                  <path
                    d="M 50,185 C 130,175 190,105 250,105 C 310,105 340,120 400,95 C 460,70 515,80 575,72 C 605,68 630,76 645,80"
                    fill="none"
                    stroke="#F27024"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Dark Blue/Navy Curve: Transaction Count */}
                  <path
                    d="M 50,190 C 120,185 180,125 250,120 C 310,115 350,140 410,115 C 470,90 515,95 575,86 C 610,82 635,88 645,92"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                    strokeDasharray="4,3"
                    strokeLinecap="round"
                  />

                  {/* Highlight dots */}
                  <circle cx="250" cy="105" r="4.5" fill="#F27024" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="250" cy="120" r="3.5" fill="#1E293B" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="575" cy="72" r="4.5" fill="#F27024" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="575" cy="86" r="3.5" fill="#1E293B" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* X-Axis Labels */}
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pl-8 pr-2 mt-1">
                  <span>Đầu T8 (Chuẩn bị)</span>
                  <span>Cuối T9 (K20 Nhập Học)</span>
                  <span>Giữa T10 (Thi Midterm)</span>
                  <span>Tháng 11 (Bảo vệ đồ án)</span>
                  <span className="text-orange-600 font-bold">Hiện tại T12</span>
                </div>
              </div>
            </div>

            {/* Bottom 3 Metrics Strip */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100">
                <div className="text-[10px] font-semibold text-slate-400">Thời gian escrow trung bình</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">18 giờ 35 phút</div>
              </div>
              <div className="rounded-xl bg-slate-50/70 p-3 border border-slate-100">
                <div className="text-[10px] font-semibold text-slate-400">Giá trị đơn trung bình (AOV)</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">425.000 VNĐ / món</div>
              </div>
              <div className="rounded-xl bg-orange-50/60 p-3 border border-orange-100">
                <div className="text-[10px] font-semibold text-orange-700">Trạm bàn giao nhanh nhất</div>
                <div className="text-sm font-black text-orange-600 mt-0.5">Alpha Hub - Hola (7 phút)</div>
              </div>
            </div>
          </div>

          {/* Right Panel: Cơ Cấu Danh Mục Đồ (4 cols -> ~34%) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-2.5 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Cơ Cấu Danh Mục Đồ</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tỷ lệ mặt hàng sinh viên đăng ký quỹ trao đổi
                </p>
              </div>

              {/* Donut Chart */}
              <div className="relative flex items-center justify-center my-4 h-44">
                <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
                  {/* Segment 1: Thiết bị IT (38%) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="58"
                    stroke="#F27024"
                    strokeWidth="22"
                    strokeDasharray="138 226"
                    strokeDashoffset="0"
                    fill="transparent"
                  />
                  {/* Segment 2: Giáo trình (26%) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="58"
                    stroke="#2563EB"
                    strokeWidth="22"
                    strokeDasharray="94 270"
                    strokeDashoffset="-138"
                    fill="transparent"
                  />
                  {/* Segment 3: KTX (18%) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="58"
                    stroke="#10B981"
                    strokeWidth="22"
                    strokeDasharray="65 299"
                    strokeDashoffset="-232"
                    fill="transparent"
                  />
                  {/* Segment 4: Xe máy (12%) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="58"
                    stroke="#8B5CF6"
                    strokeWidth="22"
                    strokeDasharray="43 321"
                    strokeDashoffset="-297"
                    fill="transparent"
                  />
                  {/* Segment 5: Áo Cam (6%) */}
                  <circle
                    cx="80"
                    cy="80"
                    r="58"
                    stroke="#F59E0B"
                    strokeWidth="22"
                    strokeDasharray="24 340"
                    strokeDashoffset="-340"
                    fill="transparent"
                  />
                </svg>

                {/* Donut Center Label */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    TỔNG NIÊM YẾT
                  </span>
                  <span className="text-xl font-black text-slate-900 tracking-tight">14.850</span>
                  <span className="text-[9px] font-extrabold text-emerald-600">Tin đang mở</span>
                </div>
              </div>

              {/* Category Breakdown List */}
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Thiết bị IT & Màn hình phụ', pct: '38%', count: '5.643 tin', dot: 'bg-orange-500' },
                  { name: 'Giáo trình & Sách PE/FE', pct: '26%', count: '3.861 tin', dot: 'bg-blue-600' },
                  { name: 'Đồ dùng KTX & Đời sống', pct: '18%', count: '2.673 tin', dot: 'bg-emerald-500' },
                  { name: 'Xe máy & Xe đạp điện', pct: '12%', count: '1.782 tin', dot: 'bg-purple-500' },
                  { name: 'Áo Cam Merch & Thể thao', pct: '6%', count: '891 tin', dot: 'bg-amber-500' },
                ].map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${cat.dot} shrink-0`}></span>
                      <span className="text-slate-700 font-medium text-[11px] truncate max-w-[170px]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-extrabold text-slate-900 text-[11px]">{cat.pct}</span>
                      <span className="text-slate-400 text-[10px] w-14 text-right">{cat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── ROW 3: TWO PANELS (55% - 45%) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: So Sánh Hoạt Động Giao Dịch Giữa 5 Campus (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    So Sánh Hoạt Động Giao Dịch Giữa 5 Campus
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Phân loại theo hình thức nhận hàng tại cơ sở
                  </p>
                </div>

                <div className="flex items-center gap-3.5 text-xs font-semibold shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F27024]"></span>
                    <span className="text-slate-600 text-[11px]">Trạm Safe-Point</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-700"></span>
                    <span className="text-slate-600 text-[11px]">Bưu tá CampusShip</span>
                  </div>
                </div>
              </div>

              {/* Grouped Bar Chart */}
              <div className="mt-4 h-56 w-full">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                  {/* Y-axis gridlines */}
                  {[
                    { val: '1.200', y: 20 },
                    { val: '900', y: 65 },
                    { val: '600', y: 110 },
                    { val: '300', y: 155 },
                    { val: '0', y: 185 },
                  ].map((g, idx) => (
                    <g key={idx}>
                      <text x="0" y={g.y + 4} className="text-[9px] fill-slate-400 font-semibold">
                        {g.val}
                      </text>
                      <line x1="32" y1={g.y} x2="500" y2={g.y} stroke="#f1f5f9" strokeWidth="1" />
                    </g>
                  ))}

                  {/* 5 Campuses Grouped Bars */}
                  {[
                    { name: 'Hòa Lạc', safe: 1140, ship: 420, x: 70 },
                    { name: 'TP.HCM', safe: 980, ship: 560, x: 160 },
                    { name: 'Đà Nẵng', safe: 520, ship: 320, x: 250 },
                    { name: 'Quy Nhơn', safe: 380, ship: 190, x: 340 },
                    { name: 'Cần Thơ', safe: 460, ship: 230, x: 430 },
                  ].map((c) => {
                    const hSafe = (c.safe / 1200) * 165;
                    const hShip = (c.ship / 1200) * 165;
                    const ySafe = 185 - hSafe;
                    const yShip = 185 - hShip;

                    return (
                      <g key={c.name}>
                        {/* Safe Point Orange Bar */}
                        <rect
                          x={c.x - 18}
                          y={ySafe}
                          width="16"
                          height={hSafe}
                          rx="3"
                          fill="#F27024"
                        />
                        <text
                          x={c.x - 10}
                          y={ySafe - 4}
                          textAnchor="middle"
                          className="text-[9px] fill-orange-600 font-extrabold"
                        >
                          {c.safe}
                        </text>

                        {/* CampusShip Navy Bar */}
                        <rect
                          x={c.x + 2}
                          y={yShip}
                          width="16"
                          height={hShip}
                          rx="3"
                          fill="#334155"
                        />
                        <text
                          x={c.x + 10}
                          y={yShip - 4}
                          textAnchor="middle"
                          className="text-[9px] fill-slate-600 font-extrabold"
                        >
                          {c.ship}
                        </text>

                        {/* Campus label */}
                        <text
                          x={c.x}
                          y="198"
                          textAnchor="middle"
                          className="text-[10px] fill-slate-600 font-bold"
                        >
                          {c.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Footnote */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>72.4% giao dịch ưu tiên trao tay tại khuôn viên trường</span>
              </div>
              <span className="font-extrabold text-orange-600 tracking-wide text-[11px]">
                FPT HOÀ LẠC DẪN ĐẦU QUY MÔ
              </span>
            </div>
          </div>

          {/* Right: Chỉ Số Sức Khỏe Sàn (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Chỉ Số Sức Khỏe Sàn</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Đo lường mức độ minh bạch và an ninh giao dịch FPT
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700">
                  96.8 / 100 PTS
                </span>
              </div>

              {/* Spider / Radar Chart */}
              <div className="relative flex items-center justify-center my-3 h-52">
                <svg viewBox="0 0 280 200" className="w-full h-full overflow-visible">
                  {/* Concentric Pentagons */}
                  {[0.25, 0.5, 0.75, 1.0].map((scale, i) => (
                    <polygon
                      key={i}
                      points="140,25 210,75 185,155 95,155 70,75"
                      transform={`scale(${scale}) translate(${140 * (1 - scale)}, ${100 * (1 - scale)})`}
                      fill="transparent"
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Radial Axis Lines */}
                  <line x1="140" y1="100" x2="140" y2="25" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="140" y1="100" x2="210" y2="75" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="140" y1="100" x2="185" y2="155" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="140" y1="100" x2="95" y2="155" stroke="#cbd5e1" strokeWidth="1" />
                  <line x1="140" y1="100" x2="70" y2="75" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Filled Radar Polygon */}
                  <polygon
                    points="140,28 206,78 181,152 98,153 73,78"
                    fill="#F27024"
                    fillOpacity="0.18"
                    stroke="#F27024"
                    strokeWidth="2"
                  />

                  {/* Vertex Dots */}
                  <circle cx="140" cy="28" r="3" fill="#F27024" />
                  <circle cx="206" cy="78" r="3" fill="#F27024" />
                  <circle cx="181" cy="152" r="3" fill="#F27024" />
                  <circle cx="98" cy="153" r="3" fill="#F27024" />
                  <circle cx="73" cy="78" r="3" fill="#F27024" />

                  {/* Axis Text Labels */}
                  <text x="140" y="15" textAnchor="middle" className="text-[9px] fill-slate-700 font-bold">
                    Xác minh Sinh Viên (99%)
                  </text>
                  <text x="215" y="80" textAnchor="start" className="text-[9px] fill-slate-700 font-bold">
                    Safe-Handoff (96%)
                  </text>
                  <text x="185" y="170" textAnchor="middle" className="text-[9px] fill-slate-700 font-bold">
                    Uy tín Peer (4.9/5)
                  </text>
                  <text x="95" y="170" textAnchor="middle" className="text-[9px] fill-slate-700 font-bold">
                    Chặn Gian Lận AI (99.1%)
                  </text>
                  <text x="65" y="80" textAnchor="end" className="text-[9px] fill-slate-700 font-bold">
                    Tỷ lệ Giữ Tiền (98%)
                  </text>
                </svg>
              </div>

              {/* Bottom 2 mini status cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Tự động khóa tài khoản vi phạm</div>
                    <div className="text-xs font-black text-slate-900">&lt; 15 giây qua AI</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2.5">
                  <Clock className="h-5 w-5 text-orange-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Phản hồi BQT FPT</div>
                    <div className="text-xs font-black text-slate-900">14 phút trung bình</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── ROW 4: QUY TRÌNH KÝ QUỸ ESCROW & GIÁM SÁT TRẠM SAFE-HANDOFF ─── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Quy Trình Ký Quỹ Escrow & Giám Sát Trạm Safe-Handoff Thời Gian Thực
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Mô hình giao dịch được bảo trợ 100% bằng tài khoản ví trung gian và camera an ninh 5 Campus
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 shrink-0">
              <Camera className="h-3.5 w-3.5 text-emerald-600" />
              Camera AI Đang Giám Sát
            </span>
          </div>

          {/* 4 Process Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Step 01 */}
            <div className="rounded-2xl border border-orange-200/70 bg-orange-50/30 p-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F27024] text-white font-black text-[11px]">
                    01
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    SV NGƯỜI MUA
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">Chốt Đơn & Xác Nhận</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sinh viên 2 bên xác minh MSSV qua FAP SSO và ấn định điểm hẹn tại campus.
                </p>
              </div>
              <div className="mt-3 pt-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer">
                  Khóa tin trên sàn
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="rounded-2xl border border-orange-200/70 bg-orange-50/30 p-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F27024] text-white font-black text-[11px]">
                    02
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    HỆ THỐNG FPT
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">Ký Quỹ Ví Escrow</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Tiền được đóng băng an toàn tại ví trung gian FPT Pay, không ai có thể can thiệp rút trước.
                </p>
              </div>
              <div className="mt-3 pt-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <Lock className="h-3 w-3 text-emerald-600" />
                  Bảo hộ 100% tiền cọc
                </span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="rounded-2xl border border-orange-200/70 bg-orange-50/30 p-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F27024] text-white font-black text-[11px]">
                    03
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">
                    TẠI SAFE-POINT
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">Kiểm Hàng Có Camera</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Hai bên gặp tại bàn giao dịch có camera 24/7, test máy và quét mã QR xác nhận tình trạng.
                </p>
              </div>
              <div className="mt-3 pt-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  Có lưu video đối chứng 📋
                </span>
              </div>
            </div>

            {/* Step 04 */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-[11px]">
                    04
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700">
                    HOÀN TẤT
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900">Giải Ngân Tức Thì</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Người mua bấm hài lòng hoặc hệ thống tự động giải ngân cho người bán sau 24h không khiếu nại.
                </p>
              </div>
              <div className="mt-3 pt-2">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Đánh giá 5 sao & tích điểm
                </span>
              </div>
            </div>
          </div>

          {/* 4 Live Campus Hub Stations Monitoring Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-2">
            {/* Station 1: Sảnh Alpha (Hòa Lạc) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="text-xs font-black text-slate-900">Sảnh Alpha (Hòa Lạc)</span>
                </div>
                <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                  Cao điểm
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Công suất trạm:</span>
                  <span className="font-extrabold text-slate-800">98% (49/50 lượt/h)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Trợ tá BQT: 2 bạn trực quầy hỗ trợ kiểm tra đồ
              </div>
            </div>

            {/* Station 2: Thư Viện Beta (Hòa Lạc) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500"></span>
                  <span className="text-xs font-black text-slate-900">Thư Viện Beta (Hòa Lạc)</span>
                </div>
                <span className="rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                  Ổn định
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Công suất trạm:</span>
                  <span className="font-extrabold text-slate-800">82% (41/50 lượt/h)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Khu vực yên tĩnh: Chuyên bàn giao sách và laptop
              </div>
            </div>

            {/* Station 3: Sảnh Innovation (TP.HCM) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-black text-slate-900">Sảnh Innovation (TP.HCM)</span>
                </div>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  Sôi nổi
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Công suất trạm:</span>
                  <span className="font-extrabold text-slate-800">94% (47/50 lượt/h)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Khu công nghệ cao Q9: Đang có 6 đơn máy tính đợi test
              </div>
            </div>

            {/* Station 4: FPT City (Đà Nẵng) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-black text-slate-900">FPT City (Đà Nẵng)</span>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Bình thường
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Công suất trạm:</span>
                  <span className="font-extrabold text-slate-800">76% (38/50 lượt/h)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                Sảnh Tòa Nhà Alpha Ngũ Hành Sơn
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
