'use client';

import React, { useState } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import {
  AlertTriangle,
  MapPin,
  CheckCircle,
  ShieldCheck,
  Activity,
  MessageSquare,
  Clock,
  Camera,
  Wifi,
  Lock,
  FileText,
  Send,
  Plus,
  ExternalLink,
  Users,
} from 'lucide-react';

const REPORTS = [
  {
    id: '#FP-892',
    type: 'KHẨN CẤP VĂN PHÒ',
    typeColor: 'bg-red-500 text-white',
    campus: 'Hoa Lạc',
    reporter: 'Người dùng: K10 SV',
    time: '1 giờ trước',
    title: 'Báo cáo tải liệu lắc đầu thiếu hiệu quan giáo trình / bán quyền Bộ môn',
    desc: 'Người bán đang bán tài liệu lắc đầu PE có dữ liệu hiệu quan giáo trình thiếu, Bị lắc giá thấp thậm chí sách nguyên văn Spring Boot 100% trong lý Ky Spring 2023 xem code giải trước...',
    reporter2: { name: 'Nguyễn Bộ tình', sub: 'Đối tượng bị báo cáo' },
    accused: { name: 'Nguyễn Y.Tổ, Kỷ (K19 SV)', sub: 'Tin liên quan: SĐ 14' },
    aiMatch: '84% độ tương đồng với dữ liệu vi phạm đã xử lý',
    actions: ['Chuyển BQT Giải quyết', 'Đồng ý & Xử lý thi nghiêm', 'Gửi thư cảnh báo'],
    isUrgent: true,
  },
  {
    id: '#FP-887',
    type: 'CẢNH BÁO BOOM-HEN',
    typeColor: 'bg-amber-500 text-white',
    campus: 'Hoa Lạc / Sảnh Alpha',
    reporter: 'Hệ thống',
    time: '52 phút trước',
    title: 'Người dùng không đến điểm hẹn tại Sảnh Alpha (Boom hen Handoff bán phiên cd)',
    desc: 'Người mua tại Safe-Handoff điểm số 04 Sảnh Alpha đang 11:30 trưa nay, đã chờ 25 phút, đặt giữ và gửi 6 tin nhắn nhưng không có người bán xuất hiện...',
    reporter2: { name: 'Liên hệ hỗ trợ qua SOT', sub: '' },
    accused: { name: 'SOT: S086.xxx.231', sub: 'Xem log chat' },
    aiMatch: '92% khả năng boom hẹn',
    actions: ['Đã liên hệ được người bán', 'Liên hệ hỗ trợ qua SOT'],
    isUrgent: false,
  },
  {
    id: '#FP-875',
    type: 'NGHI VẤN GIAN LẬN NGOÀI SÀN',
    typeColor: 'bg-purple-500 text-white',
    campus: 'Khu CN Hòa Lạc',
    reporter: 'Hệ thống Bot',
    time: '2 giờ trước',
    title: 'Tài khoản nhắn tin yêu cầu cọc MoMo 200.000đ ngoài sàn để giữ laptop Gaming Asus',
    desc: 'Điều tương từ chào giảo trực tiếp tại Hub Sảnh E2a-7, mai ây chuyển cọc qua tài chí nhân trước giờ giao. Theo quy chế Sàn P2P không có thu cọc 200k trước giao dịch...',
    reporter2: { name: 'Trần Hoàng V. (SE171231)', sub: 'SDT: S086.xxx.231' },
    accused: { name: 'SDT: S086.xxx.231', sub: '' },
    aiMatch: 'Phát hiện pattern cọc ngoài sàn',
    actions: ['Khoá tài khoản sinh viên', 'Chỉ dẫn đến tường'],
    isUrgent: false,
  },
];

const SAFEHANDOFF_HUBS = [
  { id: '01', name: 'Sảnh Toa Alpha (Tầng 1)', campus: 'HOA LẠC', code: 'HLA 01', storage: '42 GB', cameras: '2 Cam HD (OK)', students: '8 cán bộ', status: 'ĐANG HOẠT ĐỘNG', statusColor: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { id: '02', name: 'Thư viện Gamma (Tầng 1)', campus: 'HOA LẠC', code: 'HLA 02', storage: '28 GB', cameras: '360° Cam AI', students: 'Giờ tự học', status: 'ĐANG HOẠT ĐỘNG', statusColor: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { id: '01', name: 'Tòa E2a-7 (Khu Công Nghệ Cao)', campus: 'TP. HỒ CHÍ MINH', code: 'SG 01', storage: '56 GB', cameras: 'Trực tiếp DVC', students: 'Trực tiếp DVC', status: 'ĐANG HOẠT ĐỘNG', statusColor: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { id: '01', name: 'Sảnh Tòa FPT City Ngũ Hành Sơn', campus: 'ĐÀ NẴNG', code: 'DN 01', storage: '19 GB', cameras: '1 Cam Góc', students: 'Buổi sáng', status: 'ĐANG HOẠT ĐỘNG', statusColor: 'bg-emerald-100 text-emerald-700', dot: 'bg-blue-500' },
  { id: '', name: 'Hub KTX & Điểm ve tính 5 Campus', campus: 'CÁC CAMPUS', code: '', storage: '', cameras: '', students: '', status: 'Cấm tin KTX Dom E & Dom A (Hòa Lạc)', statusColor: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', isSection: true },
];

export default function AdminReportsPage() {
  const [noteText, setNoteText] = useState('Ghi chú nội bộ BQT\nVD: Sinh viên đã được thông báo 7 lần về điều kiện giảo, có hình thức sàn phú 2 đến 3 điếm so sánh...');
  const [warningText, setWarningText] = useState('');
  const [emailMSSV, setEmailMSSV] = useState('');

  return (
    <AdminLayoutShell>
      <div className="space-y-5 max-w-full">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold text-red-600 mb-1 flex items-center gap-2">
                <span>⚡ OPS LEVEL CAO GIÁM HỌC KỲ</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Hệ thống FPT 5Campus Safety Sentinel</span>
              </div>
              <h1 className="text-xl font-black text-slate-900">Trung tâm An toàn, Báo cáo Vi phạm & Safe-Handoff</h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xl">
                Giám sát giao dịch trực tiếp, điều tra gian lận học vụ, giải quyết tranh chấp chặp quy và quản lý 18 trạm điểm an ninh toàn bộ 5 phân hiệu.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs">
                <MessageSquare className="h-4 w-4" />
                Mở phòng chat 3 bên
              </button>
              <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                <Plus className="h-4 w-4" />
                Thêm điểm Safe-Handoff mới
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-4">
            {[
              { icon: <AlertTriangle className="h-5 w-5 text-red-500" />, label: 'Tranh chấp cần xử lý', value: '02', sub: 'SLA phạt nếu < 25 phút', color: 'bg-red-50 border-red-100' },
              { icon: <MapPin className="h-5 w-5 text-blue-500" />, label: 'Hạ tầng điểm hẹn', value: '18', sub: 'Điểm Safe-Handoff Phi-Sang 5 Campus', color: 'bg-blue-50 border-blue-100' },
              { icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />, label: 'Chỉ số giao dịch an toàn', value: '99.4%', sub: '+0.3% so với tháng trước', color: 'bg-emerald-50 border-emerald-100' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                {s.icon}
                <div className="text-2xl font-black text-slate-900 mt-2">{s.value}</div>
                <div className="text-[11px] font-semibold text-slate-700 mt-0.5">{s.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {/* Reports Feed (3/5) */}
          <div className="xl:col-span-3 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                <h3 className="text-sm font-extrabold text-slate-900">🚨 Vé Khiếu nại & Báo cáo Vi phạm</h3>
                <div className="flex gap-2 text-[10px] font-bold">
                  {['a mới', 'Tất cả', 'Khẩn cấp (1)', 'Báng giá (2)'].map((t) => (
                    <button key={t} className="rounded-lg bg-slate-100 text-slate-600 px-2 py-1 cursor-pointer hover:bg-slate-200">{t}</button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {REPORTS.map((r) => (
                  <div key={r.id} className={`p-5 ${r.isUrgent ? 'bg-red-50/30' : ''}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-[11px] font-extrabold text-slate-500">{r.id}</span>
                          <span className={`rounded-full text-[10px] font-extrabold px-2 py-0.5 ${r.typeColor}`}>{r.type}</span>
                          <span className="text-[10px] text-slate-500">{r.campus}</span>
                          <span className="text-[10px] text-slate-400">• {r.time}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{r.title}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">{r.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1 rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px] space-y-1">
                        <div className="font-bold text-slate-700">Người báo cáo:</div>
                        <div className="text-slate-600">{r.reporter2.name}</div>
                        {r.reporter2.sub && <div className="text-slate-400">{r.reporter2.sub}</div>}
                      </div>
                      <div className="flex-1 rounded-xl bg-slate-50 border border-slate-100 p-3 text-[11px] space-y-1">
                        <div className="font-bold text-slate-700">Đối tượng bị báo cáo:</div>
                        <div className="text-slate-600">{r.accused.name}</div>
                        {r.accused.sub && <div className="text-slate-400">{r.accused.sub}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 mb-3">
                      <Activity className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="text-[11px] text-blue-700 font-medium">{r.aiMatch}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {r.actions.map((a) => (
                        <button key={a} className={`rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer active:scale-95 transition ${
                          a.includes('Khoá') || a.includes('Cấm') ? 'bg-red-500 text-white hover:bg-red-600' :
                          a.includes('chat') || a.includes('Mở') ? 'bg-fpt-orange text-white hover:bg-fpt-orange-hover' :
                          'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Penalty Framework */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-extrabold text-slate-900">🏛 Hành lang Quy chuẩn Xử phạt Sinh viên</h3>
                <span className="ml-auto text-[11px] text-slate-400 font-medium">🖐 TAY HỌ VỤ FPT</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { step: 'Mức 1:', label: 'Khiến trách / Boom hen', desc: '75 điểm uy, hồi, tự toàn 14 ngày lại tự lại không tự ngày lại 3 ngày', color: 'bg-amber-50 border-amber-200 text-amber-800' },
                  { step: 'Mức 2:', label: 'Đình chỉ / Gian lận', desc: 'Khoá tài khoản 14 ngày, nhận điểm ChuHo Bên (la người mua), Báo cáo MSSV FPT', color: 'bg-orange-50 border-orange-200 text-orange-800' },
                  { step: 'Mức 3:', label: 'Đề thị (Học vụ)', desc: 'Gửi cột phụ chuyển vi sự học phạm cho Phòng Đào tạo & CTSV của FPT', color: 'bg-red-50 border-red-200 text-red-800' },
                ].map((m) => (
                  <div key={m.step} className={`rounded-xl border p-3 ${m.color}`}>
                    <div className="text-[10px] font-extrabold mb-0.5">{m.step}</div>
                    <div className="text-xs font-bold">{m.label}</div>
                    <div className="text-[10px] mt-1 opacity-80">{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Safe-Handoff + Toolbox */}
          <div className="xl:col-span-2 space-y-4">
            {/* Safe-Handoff Hub Network */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-extrabold text-slate-900">🗺 Mạng lưới Safe-Handoff Hub</h3>
                <button className="text-[11px] font-bold text-fpt-orange hover:underline cursor-pointer">✦ Trải Trực tuyến</button>
              </div>

              <div className="p-4">
                {/* Campus Tabs */}
                <div className="flex gap-1 mb-3 flex-wrap">
                  {['Tất cả (18)', 'Hoa Lạc (7)', 'TP.HCM (4)', 'Đà Nẵng'].map((t, i) => (
                    <button key={t} className={`rounded-lg px-2.5 py-1 text-[10px] font-bold cursor-pointer ${i === 0 ? 'bg-fpt-orange text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                      {t}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {SAFEHANDOFF_HUBS.map((hub, i) => (
                    hub.isSection ? (
                      <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <div className="text-xs font-bold text-slate-700 mb-1">{hub.name}</div>
                        {[
                          'Cấm tin KTX Dom E & Dom A (Hòa Lạc)',
                          'Sảnh Sinh viên Toa Gamma (Cần Thơ)',
                          'Trung tâm Tri tuệ Nhân tạo (Quy Nhơn)',
                        ].map((loc) => (
                          <div key={loc} className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                            <MapPin className="h-3 w-3 text-fpt-orange" />
                            {loc}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div key={i} className="rounded-xl border border-slate-100 p-3 hover:border-slate-200 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <div className={`h-2.5 w-2.5 mt-1 rounded-full shrink-0 ${hub.dot}`}></div>
                            <div>
                              <div className="text-[11px] font-bold text-slate-900">{hub.name}</div>
                              <div className="text-[10px] text-slate-500">{hub.campus} ({hub.code})</div>
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[9px] font-extrabold ${hub.statusColor}`}>
                            {hub.status}
                          </span>
                        </div>
                        {hub.storage && (
                          <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1"><Camera className="h-3 w-3" /> {hub.cameras}</span>
                            <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> {hub.storage}</span>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* Toolbox */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-extrabold text-slate-900">🔧 Bộ Công Cụ Xử Lý Sự Cố & Văn Bản Kỷ Luật</h3>
                <div className="flex gap-2">
                  <button className="text-[11px] font-bold text-slate-500 hover:text-fpt-orange cursor-pointer">Xem lịch sử kỷ luật (248)</button>
                  <button className="text-[11px] font-bold text-slate-500 hover:text-fpt-orange cursor-pointer">Xuất báo cáo tuần (PDF)</button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Note */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-[11px] font-bold text-slate-700">Ghi chú nội bộ BQT</span>
                  </div>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700 focus:border-fpt-orange/50 focus:outline-hidden resize-none"
                  />
                  <button className="mt-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800 cursor-pointer">
                    Lưu vào hồ sơ vụ việc
                  </button>
                </div>

                {/* Warning Template */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[11px] font-bold text-slate-700">Biên bản xử lý vi phạm</span>
                  </div>
                  <textarea
                    value={warningText}
                    onChange={(e) => setWarningText(e.target.value)}
                    placeholder="Áp dụng mẫu: Mức 1: Boom hen Handoff (Trực 3 điểm tự liên thông phiếu hàng 5 lần)&#10;Mức 2: Yêu cầu cọc ngoài hệ thống&#10;Mức 3: Gian lận liên mình đến / Bán quyền FPT"
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 focus:border-fpt-orange/50 focus:outline-hidden resize-none placeholder:text-slate-400"
                  />
                  <button className="mt-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-600 cursor-pointer">
                    Áp dụng chế tài ngay
                  </button>
                </div>

                {/* Email Tool */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Send className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[11px] font-bold text-slate-700">Mẫu Email Cảnh báo (@fpt.edu.vn)</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1.5">
                    <div><span className="font-bold">Tiêu đề:</span> [FPT 5Campus Marketplace] Cảnh báo Vi phạm Quy chế Sàn P2P - Hành vi giao dịch không minh bạch</div>
                    <div className="text-[10px] text-slate-400">Mẫu 1: Boom hen Safe-Handoff (Trực 2 điểm lần còn trên) + Mẫu 2: Yêu cầu cọc ngoài hệ thống + Mẫu 3: Gian lận liên đến...</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nhập MSSV gửi mail"
                      value={emailMSSV}
                      onChange={(e) => setEmailMSSV(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-fpt-orange/50 focus:outline-hidden"
                    />
                    <button className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 cursor-pointer">
                      <Send className="h-3.5 w-3.5" />
                      Gửi Mail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
