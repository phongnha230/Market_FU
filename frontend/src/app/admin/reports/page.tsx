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
  Eye,
  X,
  Package,
  CreditCard,
  Phone,
  Mail,
  User,
  Shield,
} from 'lucide-react';

import { safehandoffService, SafeHandoffHubItem } from '@/services/safehandoffService';
import { BackendReport } from '@/services/reportService';
import { DisputeItem } from '@/stores/disputeStore';

export default function AdminReportsPage() {
  const { disputes, fetchDisputes, resolveDisputeByAdmin } = useDisputeStore();

  const [activeTab, setActiveTab] = useState<'disputes' | 'reports'>('disputes');
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [hubs, setHubs] = useState<SafeHandoffHubItem[]>([]);
  const [safetyRate, setSafetyRate] = useState<number>(100);
  const [noteText, setNoteText] = useState('Đã đối soát video mở hộp và log giao dịch: Tình trạng thiết bị đúng như khiếu nại.');
  const [warningText, setWarningText] = useState('');
  const [emailMSSV, setEmailMSSV] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [selectedDisputeForModal, setSelectedDisputeForModal] = useState<DisputeItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadReportsAndHubs = async () => {
    try {
      const [reportsRes, hubsRes, analyticsRes] = await Promise.allSettled([
        reportService.getReports(),
        safehandoffService.getHubs(),
        reportService.getSemesterAnalytics(),
      ]);
      if (reportsRes.status === 'fulfilled') {
        setReports(reportsRes.value.reports || []);
      }
      if (hubsRes.status === 'fulfilled') {
        setHubs(hubsRes.value.hubs || []);
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.metrics?.safetyRate !== undefined) {
        setSafetyRate(analyticsRes.value.metrics.safetyRate);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchDisputes();
    loadReportsAndHubs();
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
                Giám sát bảo hộ Escrow 48h, xử lý video mở hộp khiếu nại, điều tra gian lận học vụ và quản lý {hubs.length} trạm Safe-Handoff 5 phân hiệu.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  fetchDisputes();
                  loadReportsAndHubs();
                }}
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
              <div className="text-2xl font-black text-slate-900 mt-2">{hubs.length}</div>
              <div className="text-[11px] font-semibold text-slate-700 mt-0.5">Hạ tầng điểm hẹn KTX</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Điểm Safe-Handoff 5 Campus FPT</div>
            </div>

            <div className="rounded-xl border p-4 bg-emerald-50 border-emerald-100">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <div className="text-2xl font-black text-slate-900 mt-2">{safetyRate}%</div>
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
                    🚨 Báo cáo Vi phạm ({reports.length})
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

                        {/* Action Toolbar */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setSelectedDisputeForModal(d)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-fpt-orange" />
                            <span>Chi tiết đơn hàng & Đối soát</span>
                          </button>

                          {d.status === 'PENDING' && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={isProcessing === d.id}
                                onClick={() => handleResolveDispute(d.id, 'REJECT')}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              >
                                <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                                <span>Bác đơn</span>
                              </button>

                              <button
                                type="button"
                                disabled={isProcessing === d.id}
                                onClick={() => handleResolveDispute(d.id, 'REFUND')}
                                className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Hoàn tiền Người mua</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* REPORTS TAB */}
              {activeTab === 'reports' && (
                <div className="divide-y divide-slate-100">
                  {reports.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Chưa có báo cáo vi phạm nào cần xử lý.
                    </div>
                  ) : (
                    reports.map((r) => (
                      <div key={r.id} className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className="text-[11px] font-extrabold text-slate-500">#{r.id.slice(-6).toUpperCase()}</span>
                              <span
                                className={`rounded-full text-[10px] font-extrabold px-2 py-0.5 ${
                                  r.status === 'PENDING'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {r.targetType === 'PRODUCT' ? 'Báo cáo Tin đăng' : 'Báo cáo Người dùng'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {r.reporter?.profile?.campus || 'FU Campus'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                • {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mb-1">{r.reason}</h4>
                            {r.details && (
                              <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">{r.details}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3 text-[11px]">
                          <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                            <span className="text-slate-400">Người báo cáo: </span>
                            <span className="font-bold text-slate-800">
                              {r.reporter?.profile?.fullName || r.reporter?.email || 'Sinh viên'}
                            </span>
                          </div>
                          <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                            <span className="text-slate-400">Đối tượng: </span>
                            <span className="font-bold text-slate-800">
                              {r.targetType === 'PRODUCT' ? `Sản phẩm #${r.targetId.slice(-6).toUpperCase()}` : `Sinh viên #${r.targetId.slice(-6).toUpperCase()}`}
                            </span>
                          </div>
                        </div>

                        {r.status === 'PENDING' && (
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
                        )}
                      </div>
                    ))
                  )}
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
                <span className="text-[11px] font-bold text-fpt-orange">{hubs.length} Điểm trực</span>
              </div>

              <div className="p-4 space-y-3">
                {hubs.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Chưa có trạm Safe-Handoff nào được cấu hình.
                  </div>
                ) : (
                  hubs.map((hub) => (
                    <div key={hub.id} className="rounded-xl border border-slate-200 p-3 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-slate-800">{hub.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {hub.campus} • {hub.cameras || 'Camera HD'} • {hub.operatingHours || '07:30 - 21:00'}
                        </div>
                      </div>
                      <span className={`rounded text-[10px] font-bold px-2 py-0.5 ${
                        hub.isOperating ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {hub.isOperating ? 'Trực tuyến' : 'Tạm dừng'}
                      </span>
                    </div>
                  ))
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

        {/* MODAL: CHI TIẾT ĐƠN HÀNG & ĐỐI SOÁT TRANH CHẤP */}
        {selectedDisputeForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-orange-100 text-fpt-orange flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>Hồ sơ Đơn hàng {selectedDisputeForModal.orderCode}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedDisputeForModal.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedDisputeForModal.status === 'REFUNDED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {selectedDisputeForModal.status === 'PENDING' ? 'ĐANG CHỜ PHÂN XỬ' : selectedDisputeForModal.status === 'REFUNDED' ? 'ĐÃ HOÀN TIỀN' : 'ĐÃ BÁC BỎ'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Gửi lúc: {selectedDisputeForModal.createdAt} • Bảo hộ Escrow Sàn FPT
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDisputeForModal(null)}
                  className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
                {/* 1. Bên Mua vs Bên Bán */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Buyer */}
                  <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-200/70 pb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Thông tin Người mua (Bên khiếu nại)</span>
                    </div>
                    <div className="space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Họ và tên:</span>
                        <span className="font-bold text-slate-900">{selectedDisputeForModal.orderRaw?.buyer?.profile?.fullName || selectedDisputeForModal.claimantName || 'Sinh viên'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-medium text-slate-800">{selectedDisputeForModal.orderRaw?.buyer?.email || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Điện thoại:</span>
                        <span className="font-semibold text-slate-800">{selectedDisputeForModal.orderRaw?.buyer?.profile?.phoneNumber || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cơ sở Campus:</span>
                        <span className="font-medium text-slate-800">{selectedDisputeForModal.orderRaw?.buyer?.profile?.campus || 'FU Campus'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Điểm uy tín:</span>
                        <span className="font-bold text-emerald-600">{selectedDisputeForModal.orderRaw?.buyer?.profile?.reputationScore ?? 100} điểm</span>
                      </div>
                    </div>
                  </div>

                  {/* Seller */}
                  <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-200/70 pb-2">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <span>Thông tin Người bán (Bị khiếu nại)</span>
                    </div>
                    <div className="space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Họ và tên:</span>
                        <span className="font-bold text-slate-900">{selectedDisputeForModal.orderRaw?.seller?.profile?.fullName || selectedDisputeForModal.orderRaw?.seller?.email || 'Người bán'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Email:</span>
                        <span className="font-medium text-slate-800">{selectedDisputeForModal.orderRaw?.seller?.email || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Điện thoại:</span>
                        <span className="font-semibold text-slate-800">{selectedDisputeForModal.orderRaw?.seller?.profile?.phoneNumber || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cơ sở Campus:</span>
                        <span className="font-medium text-slate-800">{selectedDisputeForModal.orderRaw?.seller?.profile?.campus || 'FU Campus'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Điểm uy tín:</span>
                        <span className="font-bold text-emerald-600">{selectedDisputeForModal.orderRaw?.seller?.profile?.reputationScore ?? 100} điểm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Sản phẩm & Chi tiết thanh toán */}
                <div className="rounded-2xl border border-slate-200 p-4 bg-white space-y-3">
                  <div className="font-bold text-slate-900 text-sm flex items-center justify-between border-b border-slate-100 pb-2">
                    <span>📦 Món đồ giao dịch</span>
                    <span className="text-xs font-black text-rose-600">
                      {selectedDisputeForModal.refundAmount ? `${selectedDisputeForModal.refundAmount.toLocaleString('vi-VN')} đ` : 'Đang tải...'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                    <div>
                      <div className="text-slate-400">Tên món đồ:</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">
                        {selectedDisputeForModal.orderRaw?.product?.title || 'Sản phẩm bàn giao'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Hình thức giao dịch:</div>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        {selectedDisputeForModal.orderRaw?.orderType === 'MEETUP'
                          ? `🤝 Safe-Handoff Hẹn gặp (${selectedDisputeForModal.orderRaw?.product?.meetupLocation || 'Điểm hẹn trạm KTX'})`
                          : '🚚 Giao tận nơi Ship COD'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Phương thức thanh toán:</div>
                      <div className="font-medium text-slate-800 mt-0.5">
                        {selectedDisputeForModal.orderRaw?.payment?.paymentMethod || 'VietQR / PayOS'} • {selectedDisputeForModal.orderRaw?.payment?.isPaid ? 'Đã thanh toán Escrow' : 'Thanh toán trực tiếp'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Thời hạn bao test (Warranty):</div>
                      <div className="font-medium text-slate-800 mt-0.5">
                        {selectedDisputeForModal.orderRaw?.warrantyHours || 24} giờ test máy
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Bằng chứng khiếu nại & Video test */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                  <div className="font-bold text-amber-950 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Nội dung Khiếu nại từ Sinh viên</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-900">
                      Lý do: {selectedDisputeForModal.reason}
                    </div>
                    {selectedDisputeForModal.details && (
                      <p className="text-slate-700 bg-white/80 p-3 rounded-xl border border-amber-200/80 leading-relaxed">
                        {selectedDisputeForModal.details}
                      </p>
                    )}
                  </div>

                  {/* Video Test */}
                  {selectedDisputeForModal.proofVideoUrl && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <Video className="h-4 w-4 text-fpt-orange" />
                          <span>Video kiểm tra mở hộp / Test thực tế:</span>
                        </span>
                        <a
                          href={selectedDisputeForModal.proofVideoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-fpt-orange hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>Mở tab mới</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="rounded-xl overflow-hidden bg-black aspect-video max-h-60 w-full flex items-center justify-center">
                        <video
                          src={selectedDisputeForModal.proofVideoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedDisputeForModal(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Đóng cửa sổ
                </button>

                {selectedDisputeForModal.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isProcessing === selectedDisputeForModal.id}
                      onClick={async () => {
                        await handleResolveDispute(selectedDisputeForModal.id, 'REJECT');
                        setSelectedDisputeForModal(null);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                      <span>Bác đơn & Trả tiền Người bán</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing === selectedDisputeForModal.id}
                      onClick={async () => {
                        await handleResolveDispute(selectedDisputeForModal.id, 'REFUND');
                        setSelectedDisputeForModal(null);
                      }}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Chấp thuận Hoàn tiền Người mua</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
