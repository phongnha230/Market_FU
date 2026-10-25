'use client';

import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Bot,
  Truck,
  Clock,
  ShieldAlert,
  Phone,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';

interface DisputeSidebarProps {
  itemPrice?: number;
  shippingFee?: number;
  totalEscrow?: number;
  aiConfidenceScore?: number;
  sellerCohort?: string;
  onShowToast: (msg: string) => void;
}

export default function DisputeSidebar({
  itemPrice = 0,
  shippingFee = 0,
  totalEscrow = 0,
  aiConfidenceScore = 0,
  sellerCohort,
  onShowToast,
}: DisputeSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-5">
      {/* CARD 1: BẢO CHỨNG QUỸ SINH VIÊN */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            BẢO CHỨNG QUỸ SINH VIÊN
          </span>
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
        </div>

        <div className="space-y-2 text-xs text-slate-600 divide-y divide-slate-100">
          <div className="flex items-center justify-between pt-1">
            <span>Giá trị món đồ đăng ký:</span>
            <span className="font-bold text-slate-800">
              {itemPrice.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span>Phí ship Liên Campus bảo lưu:</span>
            <span className="font-bold text-slate-800">
              {shippingFee.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 text-sm font-black text-slate-900">
            <span>Tổng tiền Escrow đóng băng:</span>
            <span className="text-base text-rose-600 font-black">
              {totalEscrow.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>100% tiền được đảm bảo trong tài khoản chuyên thu FPT</span>
        </div>
      </Card>

      {/* CARD 2: TRỢ LÝ AI THẨM TRA KHIẾU NẠI */}
      <Card className="rounded-2xl border border-orange-100 bg-white p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
          <Bot className="h-4 w-4 text-fpt-orange" />
          <span>Trợ lý AI Thẩm tra Khiếu nại</span>
        </div>

        <div className="flex items-center gap-4 bg-orange-50/50 p-3.5 rounded-xl border border-orange-100">
          {/* Gauge Circle */}
          <div className={`relative h-14 w-14 rounded-full border-4 ${aiConfidenceScore > 70 ? 'border-emerald-500' : aiConfidenceScore > 0 ? 'border-amber-500' : 'border-slate-300'} flex items-center justify-center font-black text-slate-900 text-sm shrink-0 bg-white`}>
            {aiConfidenceScore}%
          </div>
          <div>
            <div className="font-extrabold text-xs sm:text-sm text-slate-900">
              {aiConfidenceScore > 70 ? 'Độ tin cậy hồ sơ hợp lệ' : aiConfidenceScore > 0 ? 'Đang phân tích đối chiếu' : 'Chờ đính kèm bằng chứng'}
            </div>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
              {aiConfidenceScore > 0
                ? 'Hệ thống tự động đối chiếu thời gian bàn giao và video bằng chứng để bảo vệ quyền lợi đôi bên.'
                : 'Vui lòng đính kèm video bóc hộp hoặc ảnh chi tiết lỗi để kích hoạt AI thẩm tra tự động.'}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Xác thực danh tính sinh viên thông qua tài khoản SSO FPT.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Tiền Escrow được phong tỏa tạm thời 100% trong thời gian xem xét.</span>
          </div>
        </div>
      </Card>

      {/* CARD 3: CHÍNH SÁCH BẢO VỆ SINH VIÊN FPT */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Chính sách Bảo vệ Sinh viên FPT</span>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <Truck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Miễn 100% phí gửi trả:</strong> Hỗ trợ hoàn trả thiết bị thông qua các Safe-Handoff Hub tại sảnh campus mà không phát sinh thêm phí.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Hạn phản hồi 24 giờ:</strong> Nếu sinh viên bán không phản hồi phương án trong 24h, hệ thống tự động xử lý theo đề xuất của người mua.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Kỷ luật CTSV nghiêm ngặt:</strong> Trường hợp cố ý tráo hàng hoặc gian lận sẽ bị xử lý kỷ luật theo quy chế công tác sinh viên.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onShowToast(
              '📞 Tổng đài Hỗ trợ Sinh viên FPT Market: 1900.636.009 (Ext: 888)'
            )
          }
          className="h-auto w-full mt-2 rounded-xl bg-rose-50 border border-rose-200 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
        >
          <Phone className="h-3.5 w-3.5" />
          <span>Hỗ trợ Ban Quản Trị Campus</span>
        </Button>
      </Card>
    </div>
  );
}
