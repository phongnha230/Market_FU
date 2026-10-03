'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { reportService, BackendReport, ReportStatus } from '@/services/reportService';
import { cn } from '@/lib/utils';

interface MyReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyReportsModal({ isOpen, onClose }: MyReportsModalProps) {
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const res = await reportService.getMyReports(1, 50);
      setReports(res.reports || []);
    } catch {
      // Fallback
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
            ⏳ Đang chờ BQT duyệt
          </Badge>
        );
      case 'INVESTIGATING':
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
            🔍 Đang thẩm tra
          </Badge>
        );
      case 'RESOLVED':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
            ✅ Đã xử lý kỷ luật
          </Badge>
        );
      case 'DISMISSED':
        return (
          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-bold">
            🚫 Bác bỏ (Không vi phạm)
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Lịch sử tố cáo vi phạm
              </h3>
              <p className="text-xs text-slate-500">
                Theo dõi tiến trình xử lý các báo cáo bạn đã gửi tới BQT
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-fpt-orange" />
              <span className="text-xs">Đang tải lịch sử báo cáo của bạn...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4 text-center">
              <ShieldAlert className="h-8 w-8 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">Bạn chưa gửi báo cáo vi phạm nào</p>
              <p className="text-[11px] text-slate-400">
                Khi phát hiện hành vi gian lận hoặc bài đăng không phù hợp, hãy bấm &quot;Báo cáo&quot; để giữ môi trường sàn an toàn.
              </p>
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      {rep.targetType === 'PRODUCT' ? '📦 Tố cáo bài đăng' : '👤 Tố cáo người dùng'}
                    </span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(rep.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  {getStatusBadge(rep.status)}
                </div>

                <div className="text-xs text-slate-700">
                  <strong>Lý do:</strong> {rep.reason}
                </div>

                {rep.details && (
                  <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                    &quot;{rep.details}&quot;
                  </p>
                )}

                {rep.adminNote && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-[11px] text-emerald-800">
                    <strong>Phản hồi từ BQT:</strong> {rep.adminNote}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={loadReports}
            disabled={isLoading}
            className="h-8 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 mr-1', isLoading && 'animate-spin')} />
            Làm mới
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
