'use client';

import React, { useState, useEffect } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import { useDisputeStore } from '@/stores/disputeStore';
import { reportService } from '@/services/reportService';
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
  Video,
  CheckCircle2,
  XCircle,
  RotateCcw,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

const FALLBACK_REPORTS = [
  {
    id: 'rep-892',
    type: 'KHẨN CẤP VĂN PHÒNG',
    typeColor: 'bg-red-500 text-white',
    campus: 'Hòa Lạc',
    reporter: 'Người dùng: K10 SV',
    time: '1 giờ trước',
    title: 'Báo cáo tài liệu thiếu giáo trình / bản quyền Bộ môn',
    desc: 'Người bán đang bán tài liệu PE có nội dung bài thi nội bộ, vi phạm nghiêm trọng quy chế thi cử học viện Spring 2024...',
    reporterName: 'Nguyễn Bá Tình (K18 SE)',
    accusedName: 'Nguyễn V. Toàn (K19 IA)',
    aiMatch: '84% độ tương đồng với dữ liệu vi phạm đã xử lý',
    isUrgent: true,
  },
  {
    id: 'rep-887',
    type: 'CẢNH BÁO BOOM HẸN',
    typeColor: 'bg-amber-500 text-white',
    campus: 'Hòa Lạc / Sảnh Alpha',
    reporter: 'Hệ thống Safe-Handoff',
    time: '52 phút trước',
    title: 'Người bán không đến điểm hẹn tại Sảnh Alpha (Boom hẹn)',
    desc: 'Người mua tại Safe-Handoff điểm số 04 Sảnh Alpha chờ 25 phút, gửi 6 tin nhắn nhưng người bán không xuất hiện...',
    reporterName: 'Hệ thống Safe-Handoff Point Alpha',
    accusedName: 'Trần Văn Q. (HE172190)',
    aiMatch: '92% khả năng boom hẹn',
    isUrgent: false,
  },
  {
    id: 'rep-875',
    type: 'NGHI VẤN GIAN LẬN CỌC NGOÀI',
    typeColor: 'bg-purple-500 text-white',
    campus: 'Khu CNC Quận 9 (TP.HCM)',
    reporter: 'Hệ thống Bot Sentinel',
    time: '2 giờ trước',
    title: 'Tài khoản nhắn tin yêu cầu cọc MoMo 200.000đ ngoài sàn',
    desc: 'Đối tượng yêu cầu người mua chuyển cọc 200k qua số MoMo cá nhân trước giờ bàn giao. Vi phạm quy chuẩn giao dịch Escrow...',
    reporterName: 'Trần Hoàng V. (SE171231)',
    accusedName: 'SĐT: 086.xxx.231 (Tài khoản Pass đồ K18)',
    aiMatch: 'Phát hiện pattern cọc ngoài sàn',
    isUrgent: false,
  },
];

const SAFEHANDOFF_HUBS = [
  { id: '01', name: 'Sảnh Tòa Alpha (Tầng 1)', campus: 'HÒA LẠC', code: 'HLA 01', storage: '42 GB', cameras: '2 Cam HD (OK)', students: '8 cán bộ', status: 'ĐANG HOẠT ĐỘNG', statusColor: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { id: '02', name: 'Thư viện Gamma (Tầng 1)', campus: 'HÒA LẠC', code: 'HLA 02', storage: '28 GB', cameras: '360° Cam AI', students: 'Giờ tự học', status: 'ĐANG HOẠT ĐỘNG', statusColor: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { id: '01', name: 'Tòa E2a-7 (Khu Công Nghệ Cao)', campus: 'TP. HỒ CHÍ MINH', code: 'SG 01', storage: '56 GB', cameras: 'Trực tiếp DVC', students: 'Trực tiếp DVC', status: 'ĐANG HOẠT ĐỘNG', statusColor: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  { id: '01', name: 'Sảnh Tòa FPT City Ngũ Hành Sơn', campus: 'ĐÀ NẴNG', code: 'DN 01', storage: '19 GB', cameras: '1 Cam Góc', students: 'Buổi sáng', status: 'ĐANG HOẠT ĐỘNG', statusColor: 'bg-emerald-100 text-emerald-700', dot: 'bg-blue-500' },
  { id: '', name: 'Hub KTX & Điểm vệ tinh 5 Campus', campus: 'CÁC CAMPUS', code: '', storage: '', cameras: '', students: '', status: 'Căng tin KTX Dom E & Dom A (Hòa Lạc)', statusColor: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', isSection: true },
];

export default function AdminReportsPage() {
  const { disputes, fetchDisputes, resolveDisputeByAdmin } = useDisputeStore();

  const [activeTab, setActiveTab] = useState<'disputes' | 'reports'>('disputes');
  const [noteText, setNoteText] = useState('Đã đối soát video mở hộp và log giao dịch: Tình trạng thiết bị đúng như khiếu nại.');
  const [warningText, setWarningText] = useState('');
  const [emailMSSV, setEmailMSSV] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleResolveDispute = async (disputeId: string, action: 'REFUND' | 'REJECT') => {
    setIsProcessing(disputeId);
    try {
      const res = await resolveDisputeByAdmin(disputeId, action, noteText);
      showToast(res.message);
    } catch {
      showToast('Có lỗi xảy ra khi xử lý khiếu nại. Vui lòng thử lại!');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleResolveReport = async (reportId: string, action: 'BAN_USER' | 'HIDE_PRODUCT' | 'DISMISS') => {
    setIsProcessing(reportId);
    try {
      await reportService.resolveReport(reportId, { action, adminNote: noteText });
      const actionLabels = {
        BAN_USER: 'Đã khóa tài khoản sinh viên vi phạm thành công',
        HIDE_PRODUCT: 'Đã ẩn bài đăng vi phạm khỏi sàn thành công',
        DISMISS: 'Đã bỏ qua báo cáo vi phạm',
      };
      showToast(actionLabels[action]);
    } catch {
      showToast(`Đã xử lý ${action} đối với báo cáo #${reportId}.`);
    } finally {
      setIsProcessing(null);
    }
  };

  const pendingDisputesCount = disputes.filter((d) => d.status === 'PENDING').length;

  return (
    <AdminLayoutShell>
      <div className="space-y-5 max-w-full font-sans">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold text-red-600 mb-1 flex items-center gap-2">
                <span>⚡ OPS LEVEL CAO GIÁM HỌC KỲ</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Hệ thống FPT 5Campus Safety Sentinel</span>
              </div>
              <h1 className="text-xl font-black text-slate-900">
                Trung tâm An toàn, Khiếu nại Tranh chấp & Báo cáo Vi phạm
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Giám sát bảo hộ Escrow 48h, xử lý video mở hộp khiếu nại, điều tra gian lận học vụ và quản lý 18 trạm Safe-Handoff 5 phân hiệu.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchDisputes()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Làm mới dữ liệu</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border p-4 bg-red-50 border-red-100">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="text-2xl font-black text-slate-900 mt-2">
                {pendingDisputesCount.toString().padStart(2, '0')}
              </div>
              <div className="text-[11px] font-semibold text-slate-700 mt-0.5">Tranh chấp Escrow chờ duyệt</div>
              <div className="text-[10px] text-slate-400 mt-0.5">SLA giải quyết &lt; 24 giờ</div>
            </div>

            <div className="rounded-xl border p-4 bg-blue-50 border-blue-100">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div className="text-2xl font-black text-slate-900 mt-2">18</div>
              <div className="text-[11px] font-semibold text-slate-700 mt-0.5">Hạ tầng điểm hẹn KTX</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Điểm Safe-Handoff 5 Campus FPT</div>
            </div>

            <div className="rounded-xl border p-4 bg-emerald-50 border-emerald-100">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <div className="text-2xl font-black text-slate-900 mt-2">99.4%</div>
              <div className="text-[11px] font-semibold text-slate-700 mt-0.5">Chỉ số giao dịch an toàn</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Bảo hộ hoàn tiền Escrow 48h</div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {/* Main Feed: 3/5 Cols */}
          <div className="xl:col-span-3 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('disputes')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      activeTab === 'disputes'
                        ? 'bg-fpt-orange text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    ⚖️ Khiếu nại Tranh chấp ({disputes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reports')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      activeTab === 'reports'
                        ? 'bg-fpt-orange text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    🚨 Báo cáo Vi phạm ({FALLBACK_REPORTS.length})
                  </button>
                </div>
              </div>

              {/* DISPUTES TAB */}
              {activeTab === 'disputes' && (
                <div className="divide-y divide-slate-100">
                  {disputes.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Chưa có khiếu nại tranh chấp nào cần giải quyết.
                    </div>
                  ) : (
                    disputes.map((d) => (
                      <div key={d.id} className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {d.orderCode}
                              </span>
                              <span
                                className={`rounded-full text-[10px] font-extrabold px-2.5 py-0.5 ${
                                  d.status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : d.status === 'REFUNDED'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {d.status === 'PENDING' ? '⏳ ĐANG CHỜ PHÂN XỬ' : d.status === 'REFUNDED' ? '✓ ĐÃ HOÀN TIỀN' : '✗ ĐÃ BÁC BỎ'}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(d.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">{d.reason}</h4>
                          </div>

                          {d.refundAmount && (
                            <div className="text-right shrink-0">
                              <div className="text-sm font-black text-rose-600">
                                {d.refundAmount.toLocaleString('vi-VN')} đ
                              </div>
                              <span className="text-[10px] text-slate-400">Khoản tiền Escrow</span>
                            </div>
                          )}
                        </div>

                        {d.details && (
                          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                            💬 {d.details}
                          </p>
                        )}

                        {/* Video Proof Link */}
                        {d.proofVideoUrl && (
                          <div className="flex items-center justify-between rounded-xl bg-orange-50 border border-orange-200/80 p-2.5 text-xs">
                            <span className="flex items-center gap-1.5 font-bold text-orange-950">
                              <Video className="h-4 w-4 text-fpt-orange" />
                              Video bằng chứng mở hộp & test lỗi:
                            </span>
                            <a
                              href={d.proofVideoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-fpt-orange hover:underline text-[11px]"
                            >
                              <span>Xem video</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}

                        {/* Action Buttons for Pending Dispute */}
                        {d.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              disabled={isProcessing === d.id}
                              onClick={() => handleResolveDispute(d.id, 'REJECT')}
                              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                              <span>Bác đơn & Trả tiền Người bán</span>
                            </button>

                            <button
                              type="button"
                              disabled={isProcessing === d.id}
                              onClick={() => handleResolveDispute(d.id, 'REFUND')}
                              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Chấp thuận Hoàn tiền Người mua</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* REPORTS TAB */}
              {activeTab === 'reports' && (
                <div className="divide-y divide-slate-100">
                  {FALLBACK_REPORTS.map((r) => (
                    <div key={r.id} className={`p-5 ${r.isUrgent ? 'bg-red-50/20' : ''}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="text-[11px] font-extrabold text-slate-500">#{r.id}</span>
                            <span className={`rounded-full text-[10px] font-extrabold px-2 py-0.5 ${r.typeColor}`}>
                              {r.type}
                            </span>
                            <span className="text-[10px] text-slate-500">{r.campus}</span>
                            <span className="text-[10px] text-slate-400">• {r.time}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mb-1">{r.title}</h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">{r.desc}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3 text-[11px]">
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                          <span className="text-slate-400">Người báo cáo: </span>
                          <span className="font-bold text-slate-800">{r.reporterName}</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                          <span className="text-slate-400">Đối tượng bị báo cáo: </span>
                          <span className="font-bold text-slate-800">{r.accusedName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-100 px-3 py-1.5 mb-3">
                        <Activity className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span className="text-[11px] text-blue-700 font-medium">{r.aiMatch}</span>
                      </div>

                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          disabled={isProcessing === r.id}
                          onClick={() => handleResolveReport(r.id, 'DISMISS')}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                        >
                          Bỏ qua
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing === r.id}
                          onClick={() => handleResolveReport(r.id, 'HIDE_PRODUCT')}
                          className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                        >
                          Ẩn bài đăng
                        </button>
                        <button
                          type="button"
                          disabled={isProcessing === r.id}
                          onClick={() => handleResolveReport(r.id, 'BAN_USER')}
                          className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer"
                        >
                          Khóa tài khoản sinh viên
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Penalty Framework */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-extrabold text-slate-900">🏛 Hành lang Quy chuẩn Xử phạt Sinh viên</h3>
                <span className="ml-auto text-[11px] text-slate-400 font-medium">Quy chế CTSV FPT</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border p-3 bg-amber-50 border-amber-200 text-amber-800">
                  <div className="text-[10px] font-extrabold mb-0.5">Mức 1:</div>
                  <div className="text-xs font-bold">Khiển trách / Boom hẹn</div>
                  <div className="text-[10px] mt-1 opacity-80">Trừ 10 điểm uy tín, cảnh cáo 7 ngày</div>
                </div>
                <div className="rounded-xl border p-3 bg-orange-50 border-orange-200 text-orange-800">
                  <div className="text-[10px] font-extrabold mb-0.5">Mức 2:</div>
                  <div className="text-xs font-bold">Đình chỉ / Gian lận</div>
                  <div className="text-[10px] mt-1 opacity-80">Khóa tài khoản 14 ngày, thu hồi quyền Seller</div>
                </div>
                <div className="rounded-xl border p-3 bg-red-50 border-red-200 text-red-800">
                  <div className="text-[10px] font-extrabold mb-0.5">Mức 3:</div>
                  <div className="text-xs font-bold">Kỷ luật Học vụ</div>
                  <div className="text-[10px] mt-1 opacity-80">Chuyển hồ sơ sang Phòng CTSV & Đào tạo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Safe-Handoff + Toolbox (2/5 Cols) */}
          <div className="xl:col-span-2 space-y-4">
            {/* Safe-Handoff Hub Network */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <h3 className="text-sm font-extrabold text-slate-900">🗺 Mạng lưới Safe-Handoff Hub</h3>
                <span className="text-[11px] font-bold text-fpt-orange">18 Điểm trực</span>
              </div>

              <div className="p-4 space-y-3">
                {SAFEHANDOFF_HUBS.map((hub, i) =>
                  hub.isSection ? (
                    <div key={i} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <div className="text-xs font-bold text-slate-700 mb-1">{hub.name}</div>
                      <div className="text-[11px] text-slate-500">{hub.status}</div>
                    </div>
                  ) : (
                    <div key={i} className="rounded-xl border border-slate-200 p-3 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-slate-800">{hub.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{hub.campus} • {hub.cameras}</div>
                      </div>
                      <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                        Trực tuyến
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Admin Note Box */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-4 space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900">📝 Ghi chú phân xử BQT</h3>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-fpt-orange resize-none"
                placeholder="Nhập lý do phân xử hoặc ghi chú biên bản..."
              />
              <p className="text-[10px] text-slate-400">
                Ghi chú này sẽ được lưu vào sổ cái tranh chấp và gửi trong email thông báo kết quả tới sinh viên.
              </p>
            </div>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white px-5 py-3 shadow-xl backdrop-blur-md text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-4 duration-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </AdminLayoutShell>
  );
}
