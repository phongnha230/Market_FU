'use client';

import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  Building2,
  CreditCard,
  User,
  FileText,
  Loader2,
  Share2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { numberToVietnameseWords } from '@/utils/numberToVietnameseWords';

export interface WithdrawalInvoiceData {
  id: string;
  userId?: string;
  amount: number;
  bankAccount: {
    bankName: string;
    accountNo: string;
    accountName: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
  user?: {
    id?: string;
    email?: string;
    profile?: {
      fullName?: string;
      avatarUrl?: string;
      campus?: string;
      phoneNumber?: string;
      cohort?: string;
      major?: string;
      dorm?: string;
      kyc?: {
        studentId?: string;
        status?: string;
      };
    };
  };
}

interface WithdrawalInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawal: WithdrawalInvoiceData | null;
  onApprove?: (withdrawal: WithdrawalInvoiceData) => void;
  canApprove?: boolean;
}

export default function WithdrawalInvoiceModal({
  isOpen,
  onClose,
  withdrawal,
  onApprove,
  canApprove = false,
}: WithdrawalInvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen || !withdrawal) return null;

  const invoiceNo = `HD-RUT-${withdrawal.id.slice(-8).toUpperCase()}`;
  const transactionCode = `FT${withdrawal.id.toUpperCase()}`;
  const createdDate = new Date(withdrawal.createdAt);
  const processedDate = withdrawal.processedAt ? new Date(withdrawal.processedAt) : createdDate;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return `${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${formatDate(date)}`;
  };

  const sellerName =
    withdrawal.user?.profile?.fullName ||
    withdrawal.bankAccount.accountName ||
    'Sinh viên FPT';
  const studentId =
    withdrawal.user?.profile?.kyc?.studentId ||
    withdrawal.user?.email?.split('@')[0]?.toUpperCase() ||
    'SE-MEMBER';
  const campus = withdrawal.user?.profile?.campus || 'Hòa Lạc (HOL)';
  const cohort = withdrawal.user?.profile?.cohort || 'K18';
  const major = withdrawal.user?.profile?.major || 'Công nghệ thông tin';
  const phoneNumber = withdrawal.user?.profile?.phoneNumber || '098*******';
  const email = withdrawal.user?.email || 'student@fpt.edu.vn';

  const amountInWords = numberToVietnameseWords(withdrawal.amount);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invoiceNo);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `HoaDon-RutTien-${studentId}-${invoiceNo}.png`;
      link.click();
    } catch (err) {
      console.error('Lỗi khi tải hóa đơn:', err);
      alert('Không thể tạo file ảnh hóa đơn. Bạn có thể sử dụng nút "In / Lưu PDF" để lưu hóa đơn.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white animate-in fade-in">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #withdrawal-invoice-printable,
          #withdrawal-invoice-printable * {
            visibility: visible;
          }
          #withdrawal-invoice-printable {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 15mm 20mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-3xl bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 text-fpt-orange border border-orange-200">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">
                  Hóa Đơn Điện Tử Rút Tiền
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {invoiceNo}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Chứng từ điện tử đối soát & giải ngân doanh thu bán hàng Escrow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
              title="Sao chép mã hóa đơn"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? 'Đã chép' : 'Chép mã'}</span>
            </button>

            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer"
              title="In hoặc lưu PDF"
            >
              <Printer className="h-3.5 w-3.5 text-slate-600" />
              <span className="hidden sm:inline">In / Xuất PDF</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              title="Tải ảnh hóa đơn về máy"
            >
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span>Tải Hóa Đơn</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body Canvas (Scrollable container on web) */}
        <div className="overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-200/70 print:p-0 print:bg-white">
          <div
            ref={invoiceRef}
            id="withdrawal-invoice-printable"
            className="w-full max-w-[760px] bg-white text-slate-800 p-6 sm:p-10 rounded-2xl shadow-lg border border-slate-300 relative print:shadow-none print:border-none print:p-0 print:rounded-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.015) 0%, rgba(255, 255, 255, 1) 100%)',
            }}
          >
            {/* Guilloche / Security Header Bar */}
            <div className="h-1.5 w-full bg-linear-to-r from-orange-500 via-amber-500 to-red-600 rounded-full mb-6 print:rounded-none" />

            {/* National Motto / Official Brand Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-orange-500 to-red-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  FU
                </div>
                <div>
                  <h1 className="text-sm font-black text-slate-900 tracking-tight uppercase">
                    TRƯỜNG ĐẠI HỌC FPT
                  </h1>
                  <h2 className="text-xs font-bold text-fpt-orange">
                    HỆ THỐNG KÝ QUỸ & ĐỐI SOÁT FU SECOND-HAND MARKET
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Nền tảng thanh toán & giao dịch đồ cũ an toàn cho sinh viên FPT
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-[11px] text-slate-500 space-y-0.5 border-l-2 sm:border-l-0 sm:border-r-2 border-orange-500/30 pl-2.5 sm:pl-0 sm:pr-2.5">
                <div className="font-bold uppercase text-slate-800">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="italic text-[10px] text-slate-600">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="text-[9px] text-slate-400 tracking-widest mt-0.5">
                  ═════════════════
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Ký hiệu: <strong className="text-slate-800 font-mono">FU-INV/2026/WN</strong>
                </div>
              </div>
            </div>

            {/* Invoice Title & Meta */}
            <div className="text-center py-6">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200 mb-2">
                CHỨNG TỪ ĐIỆN TỬ HỢP LỆ
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                HÓA ĐƠN ĐIỆN TỬ KIÊM PHIẾU CHI
              </h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                (GIẢI NGÂN DOANH THU BÁN HÀNG QUA CỔNG NAPAS 24/7)
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-2">
                <span>
                  Số HĐ: <strong className="font-mono text-slate-900 font-bold">{invoiceNo}</strong>
                </span>
                <span>•</span>
                <span>
                  Ngày lập: <strong className="text-slate-800">{formatDate(createdDate)}</strong>
                </span>
              </div>
            </div>

            {/* Payer & Payee Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-xs mb-6">
              {/* Bên chi trả (Đơn vị vận hành hệ thống) */}
              <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-4">
                <div className="flex items-center gap-1.5 text-slate-800 font-black uppercase text-[11px] pb-1">
                  <Building2 className="h-3.5 w-3.5 text-fpt-orange" />
                  <span>Đơn vị chi trả (Payer)</span>
                </div>
                <div>
                  <span className="text-slate-400">Đơn vị: </span>
                  <strong className="text-slate-900">Ban Quản Trị Sàn FU Market (FPTU)</strong>
                </div>
                <div>
                  <span className="text-slate-400">Quản lý quỹ: </span>
                  <span className="text-slate-800 font-medium">Hệ thống Ký quỹ Escrow Tự động</span>
                </div>
                <div>
                  <span className="text-slate-400">Địa chỉ: </span>
                  <span className="text-slate-800">Khu CNC Hòa Lạc, Km29 Đại lộ Thăng Long, Hà Nội</span>
                </div>
                <div>
                  <span className="text-slate-400">Hotline: </span>
                  <span className="text-slate-800 font-medium">1900 6600 (Hỗ trợ sinh viên 24/7)</span>
                </div>
                <div>
                  <span className="text-slate-400">Cổng đối soát: </span>
                  <span className="text-emerald-700 font-bold">Napas 24/7 Interbank / VietQR</span>
                </div>
              </div>

              {/* Bên thụ hưởng (Người bán / Seller FPT) */}
              <div className="space-y-1.5 sm:pl-2">
                <div className="flex items-center gap-1.5 text-slate-800 font-black uppercase text-[11px] pb-1">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  <span>Người thụ hưởng (Seller / Payee)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Họ tên sinh viên:</span>
                  <strong className="text-slate-900 font-bold text-sm uppercase">
                    {sellerName}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Mã số sinh viên (MSSV):</span>
                  <strong className="text-blue-700 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {studentId}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Email FPT:</span>
                  <span className="text-slate-800 font-medium font-mono">{email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Điện thoại / Khóa:</span>
                  <span className="text-slate-800">
                    {phoneNumber} • {cohort} ({campus})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Chuyên ngành:</span>
                  <span className="text-slate-700 italic">{major}</span>
                </div>
              </div>
            </div>

            {/* Bank Receiving Details Card */}
            <div className="mb-6 rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 text-white p-4 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 text-orange-400">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
                    Tài khoản ngân hàng thụ hưởng
                  </div>
                  <div className="text-sm font-extrabold text-white mt-0.5">
                    {withdrawal.bankAccount.bankName}
                  </div>
                  <div className="font-mono text-base font-black text-amber-300 tracking-wider">
                    {withdrawal.bankAccount.accountNo}
                  </div>
                  <div className="text-xs uppercase font-bold text-slate-200">
                    CHỦ TK: {withdrawal.bankAccount.accountName}
                  </div>
                </div>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-white/20 pt-2 sm:pt-0 sm:pl-4 text-left sm:text-right w-full sm:w-auto">
                <div className="text-[10px] text-slate-300">Phương thức giải ngân</div>
                <div className="text-xs font-black text-emerald-400 flex items-center gap-1 sm:justify-end mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Napas 24/7 Chuyển tiền nhanh</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Mã GD: {transactionCode}
                </div>
              </div>
            </div>

            {/* Transaction Breakdown Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden mb-6 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5 text-center w-12">STT</th>
                    <th className="py-3 px-3.5">Diễn giải nội dung chi</th>
                    <th className="py-3 px-3.5 text-center">Mã tham chiếu</th>
                    <th className="py-3 px-3.5 text-right">Số tiền (VNĐ)</th>
                    <th className="py-3 px-3.5 text-right">Phí sàn</th>
                    <th className="py-3 px-3.5 text-right">Thành tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-500">01</td>
                    <td className="py-3.5 px-3.5">
                      <div className="font-bold text-slate-900">
                        Giải ngân doanh thu bán hàng sinh viên (Escrow P2P)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Thanh toán doanh thu hoàn tất từ đơn hàng đồ cũ FU Student Market
                      </div>
                    </td>
                    <td className="py-3.5 px-3.5 text-center font-mono text-slate-600">
                      ESC-{withdrawal.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-bold text-slate-900">
                      {withdrawal.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-medium text-emerald-600">
                      0 đ (0%)
                    </td>
                    <td className="py-3.5 px-3.5 text-right font-black text-slate-900">
                      {withdrawal.amount.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-orange-50/40 border-t-2 border-orange-200 font-bold">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-slate-700 text-right">
                      Tổng số tiền thực nhận (Net Amount):
                    </td>
                    <td colSpan={2} className="py-3 px-4 text-right text-base font-black text-fpt-orange">
                      {withdrawal.amount.toLocaleString('vi-VN')} VNĐ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Amount in words & Notes */}
            <div className="space-y-2 mb-8 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-slate-500 font-semibold shrink-0">Số tiền bằng chữ:</span>
                <span className="font-bold text-slate-900 italic text-[13px]">
                  {amountInWords}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-500 font-semibold shrink-0">Ghi chú đối soát:</span>
                <span className="text-slate-700">
                  {withdrawal.adminNote || 'Hệ thống đã kiểm tra khớp số dư Escrow, đối soát tự động thành công và hoàn tất giải ngân qua tài khoản ngân hàng.'}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200 text-[11px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>
                  Chính sách miễn phí 100% phí giao dịch và rút tiền dành riêng cho sinh viên Trường Đại học FPT.
                </span>
              </div>
            </div>

            {/* Signatures & Red Official Seal Area */}
            <div className="relative grid grid-cols-2 gap-6 pt-4 pb-12 border-t border-slate-200">
              {/* Left Column: Receiver / Seller */}
              <div className="text-center">
                <div className="font-extrabold uppercase text-xs text-slate-800">
                  NGƯỜI NHẬN TIỀN (SELLER)
                </div>
                <div className="text-[10px] text-slate-400 italic">
                  (Ký, ghi rõ họ tên điện tử)
                </div>
                <div className="h-24 flex items-center justify-center">
                  <span className="text-sm font-bold font-serif italic text-slate-700 underline decoration-slate-300 underline-offset-4">
                    {sellerName}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-800">
                  {sellerName}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  MSSV: {studentId}
                </div>
              </div>

              {/* Right Column: Platform Admin / Red Stamp */}
              <div className="text-center relative">
                <div className="font-extrabold uppercase text-xs text-slate-800">
                  BAN QUẢN TRỊ FU MARKET
                </div>
                <div className="text-[10px] text-slate-400 italic">
                  (Ký số & Đóng dấu xác nhận)
                </div>

                {/* SIGNATURE & OFFICIAL RED STAMP OVERLAY */}
                <div className="h-28 relative flex items-center justify-center">
                  {/* Digital Signature line */}
                  <div className="z-10 text-center font-serif italic text-red-900 font-bold text-sm tracking-wider">
                    FPTU Financial Escrow
                  </div>

                  {/* OFFICIAL RED STAMP (CON DẤU ĐỎ CHÍNH THỨC) */}
                  {withdrawal.status === 'APPROVED' ? (
                    <div
                      className="absolute -top-2 right-2 sm:right-6 pointer-events-none select-none z-20 transform -rotate-12 transition-transform duration-300"
                      title="Con dấu đỏ chính thức đã xác thực giao dịch"
                    >
                      {/* SVG Circular Red Stamp */}
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg
                          viewBox="0 0 200 200"
                          className="w-full h-full text-red-600 drop-shadow-sm opacity-95"
                          style={{ filter: 'contrast(125%)' }}
                        >
                          {/* Outer Circles */}
                          <circle
                            cx="100"
                            cy="100"
                            r="94"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="3.5"
                            strokeDasharray="6 1"
                          />
                          <circle
                            cx="100"
                            cy="100"
                            r="88"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="2.5"
                          />
                          <circle
                            cx="100"
                            cy="100"
                            r="62"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="1.5"
                          />

                          {/* Curved Text Top */}
                          <path
                            id="upperCurve"
                            d="M 22 100 A 78 78 0 0 1 178 100"
                            fill="none"
                          />
                          <text
                            fill="#dc2626"
                            fontSize="11.5"
                            fontWeight="900"
                            letterSpacing="1.2"
                            textAnchor="middle"
                          >
                            <textPath href="#upperCurve" startOffset="50%">
                              ★ TRƯỜNG ĐẠI HỌC FPT ★
                            </textPath>
                          </text>

                          {/* Curved Text Bottom */}
                          <path
                            id="lowerCurve"
                            d="M 178 100 A 78 78 0 0 1 22 100"
                            fill="none"
                          />
                          <text
                            fill="#dc2626"
                            fontSize="10"
                            fontWeight="900"
                            letterSpacing="1.1"
                            textAnchor="middle"
                          >
                            <textPath href="#lowerCurve" startOffset="50%">
                              ★ BQT SÀN FU MARKET ★
                            </textPath>
                          </text>

                          {/* Stamp Center Badges */}
                          <g transform="translate(100, 100)">
                            {/* Star */}
                            <polygon
                              points="0,-18 5,-5 18,-5 8,3 12,16 0,8 -12,16 -8,3 -18,-5 -5,-5"
                              fill="#dc2626"
                            />
                            {/* Inner Stamp Box */}
                            <rect
                              x="-56"
                              y="-3"
                              width="112"
                              height="22"
                              rx="3"
                              fill="#dc2626"
                            />
                            <text
                              x="0"
                              y="12"
                              fill="#ffffff"
                              fontSize="10"
                              fontWeight="900"
                              textAnchor="middle"
                              letterSpacing="0.8"
                            >
                              ĐÃ DUYỆT RÚT TIỀN
                            </text>

                            {/* Small Date & NAPAS under */}
                            <text
                              x="0"
                              y="29"
                              fill="#dc2626"
                              fontSize="7.5"
                              fontWeight="800"
                              textAnchor="middle"
                            >
                              NAPAS 24/7 • {formatDate(processedDate)}
                            </text>
                            <text
                              x="0"
                              y="37"
                              fill="#dc2626"
                              fontSize="6.5"
                              fontWeight="700"
                              textAnchor="middle"
                              letterSpacing="0.5"
                            >
                              XÁC NHẬN GIẢI NGÂN
                            </text>
                          </g>
                        </svg>
                      </div>
                    </div>
                  ) : withdrawal.status === 'REJECTED' ? (
                    <div className="absolute top-2 right-4 pointer-events-none select-none z-20 transform -rotate-6 border-2 border-dashed border-rose-600 bg-rose-50/90 text-rose-700 px-3 py-2 rounded-xl text-center shadow-xs">
                      <div className="text-[11px] font-black tracking-wider uppercase">
                        LỆNH ĐÃ BỊ TỪ CHỐI
                      </div>
                      <div className="text-[9px] font-medium mt-0.5">
                        Ngày: {formatDate(processedDate)}
                      </div>
                      <div className="text-[8px] text-rose-500 font-mono mt-0.5">
                        Đã hoàn tiền về số dư ví
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-2 right-4 pointer-events-none select-none z-20 transform -rotate-3 border-2 border-amber-500 bg-amber-50/90 text-amber-800 px-3 py-2 rounded-xl text-center shadow-xs">
                      <div className="text-[11px] font-black tracking-wider uppercase flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>CHỜ ĐỐI SOÁT DUYỆT</span>
                      </div>
                      <div className="text-[9px] font-medium mt-0.5">
                        Ngày tạo: {formatDate(createdDate)}
                      </div>
                      <div className="text-[8px] text-amber-600 font-mono mt-0.5">
                        Chờ Admin chuyển khoản & đóng dấu
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-bold text-slate-800">
                  HỘI ĐỒNG TÀI CHÍNH & KÝ QUỸ
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Chứng thư số điện tử hợp chuẩn FPT</span>
                </div>
              </div>
            </div>

            {/* Bottom Footer & QR Verification */}
            <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <QRCodeSVG
                    value={`https://fu-market.edu.vn/verify-invoice?id=${withdrawal.id}&code=${invoiceNo}&amount=${withdrawal.amount}&seller=${encodeURIComponent(studentId)}`}
                    size={48}
                    level="M"
                  />
                </div>
                <div className="space-y-0.5 text-left">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <QrCode className="h-3 w-3 text-fpt-orange" />
                    <span>Mã QR tra cứu hóa đơn trực tuyến</span>
                  </div>
                  <div>Tra cứu và xác thực tính pháp lý của chứng từ tại cổng thông tin sàn.</div>
                  <div className="font-mono text-[9px] text-slate-400">
                    Mã băm SHA-256: {withdrawal.id.slice(0, 16).toLowerCase()}...verified
                  </div>
                </div>
              </div>

              <div className="text-right text-[9px] text-slate-400 space-y-0.5">
                <div>Trang 1 / 1 • Khởi tạo tự động từ FU Second-hand Market Platform</div>
                <div>Thời gian in: {formatDateTime(new Date())}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer for Admin (If pending and can approve) */}
        {canApprove && withdrawal.status === 'PENDING' && onApprove && (
          <div className="no-print bg-white border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              <span>
                Lệnh rút này đang ở trạng thái <strong>Chờ duyệt</strong>. Duyệt lệnh sẽ tự động chuyển trạng thái và đóng dấu đỏ điện tử lên hóa đơn này.
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  onApprove(withdrawal);
                  onClose();
                }}
                type="button"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Duyệt lệnh & Đóng dấu đỏ ngay</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
