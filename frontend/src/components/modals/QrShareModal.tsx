'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { X, QrCode, Copy, Check, Download, ExternalLink, Sparkles } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

interface QrShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string) => void;
}

export default function QrShareModal({
  isOpen,
  onClose,
  onToast,
}: QrShareModalProps) {
  const user = useUserStore((s) => s.user);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  // Đường dẫn hồ sơ công khai của sinh viên / người bán
  const publicPath = user.id
    ? `/sellers/${user.id}`
    : user.studentId
    ? `/sellers/${user.studentId}`
    : '/profile';

  const fullProfileUrl = origin ? `${origin}${publicPath}` : (typeof window !== 'undefined' ? `${window.location.origin}${publicPath}` : '');

  const handleCopyLink = async () => {
    if (!fullProfileUrl) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullProfileUrl);
        setCopied(true);
        onToast('🔗 Đã sao chép liên kết hồ sơ công khai vào bộ nhớ tạm!');
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      onToast('Không thể tự động sao chép, vui lòng sao chép thủ công.');
    }
  };

  const handleDownloadQr = () => {
    if (!canvasRef.current) {
      onToast('Chưa sẵn sàng tải ảnh QR, vui lòng thử lại.');
      return;
    }
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      const safeName = (user.studentId || user.name || 'fpt-student').replace(/\s+/g, '-');
      downloadLink.download = `QR-HoSo-${safeName}.png`;
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      onToast('📥 Đã lưu ảnh Mã QR hồ sơ (PNG chất lượng cao) về máy!');
    } catch (err) {
      console.error('Lỗi tải QR code:', err);
      onToast('Không thể tạo file ảnh QR để tải về.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="p-1 rounded-lg bg-orange-50 text-fpt-orange">
              <QrCode className="h-4 w-4" />
            </span>
            <span>Mã QR Hồ Sơ Sinh Viên</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Real Scannable QR Code */}
        <div className="mx-auto w-52 h-52 rounded-2xl border-2 border-slate-100 p-3 bg-white shadow-sm flex flex-col items-center justify-center relative group">
          {fullProfileUrl ? (
            <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100">
              <QRCodeSVG
                value={fullProfileUrl}
                size={168}
                level="Q"
                includeMargin={false}
              />
            </div>
          ) : (
            <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
              Đang tạo mã QR...
            </div>
          )}

          {/* Hidden Canvas for High-Resolution PNG Download (600x600) */}
          {fullProfileUrl && (
            <div className="hidden">
              <QRCodeCanvas
                ref={canvasRef}
                value={fullProfileUrl}
                size={600}
                level="H"
                includeMargin={true}
              />
            </div>
          )}
        </div>

        {/* Scan instruction badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">
          <Sparkles className="h-3 w-3 text-emerald-600" />
          <span>Quét bằng Camera Zalo / iPhone / Android</span>
        </div>

        {/* Student metadata */}
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-900">
            {user.name || 'Sinh viên FPT'}
            {user.studentId ? ` • ${user.studentId}` : ''}
            {user.cohort ? ` (${user.cohort})` : ''}
          </p>
          <p className="text-[11px] text-slate-500">
            {user.major ? `${user.major} • ` : ''}Campus {user.campus || 'Hòa Lạc'}
          </p>
          {fullProfileUrl && (
            <p className="text-[10px] text-slate-400 truncate max-w-xs mx-auto font-mono mt-1 px-2 py-0.5 bg-slate-50 rounded">
              {fullProfileUrl}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="pt-1 space-y-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer ${
              copied
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-fpt-orange hover:bg-fpt-orange-hover'
            }`}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết hồ sơ'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Tải ảnh QR (PNG)</span>
            </button>

            {fullProfileUrl ? (
              <a
                href={fullProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                <span>Xem hồ sơ</span>
              </a>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
