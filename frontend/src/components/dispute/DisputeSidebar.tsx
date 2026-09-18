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

interface DisputeSidebarProps {
  itemPrice?: number;
  shippingFee?: number;
  totalEscrow?: number;
  onShowToast: (msg: string) => void;
}

export default function DisputeSidebar({
  itemPrice = 1200000,
  shippingFee = 25000,
  totalEscrow = 1225000,
  onShowToast,
}: DisputeSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-5">
      {/* CARD 1: BẢO CHỨNG QUỸ SINH VIÊN */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
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
      </div>

      {/* CARD 2: TRỢ LÝ AI THẨM TRA KHIẾU NẠI */}
      <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-xs space-y-3.5">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
          <Bot className="h-4 w-4 text-fpt-orange" />
          <span>Trợ lý AI Thẩm tra Khiếu nại</span>
        </div>

        <div className="flex items-center gap-4 bg-orange-50/50 p-3.5 rounded-xl border border-orange-100">
          {/* Gauge Circle */}
          <div className="relative h-14 w-14 rounded-full border-4 border-emerald-500 flex items-center justify-center font-black text-slate-900 text-sm shrink-0 bg-white">
            94%
          </div>
          <div>
            <div className="font-extrabold text-xs sm:text-sm text-slate-900">
              Độ tin cậy khiếu nại rất cao
            </div>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
              Video xác thực kiểm tra nguồn tại sảnh Alpha trùng khớp thời gian nhận bưu phẩm.
            </p>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Người bán K16 sơ cấp chưa có tiền sử vi phạm lừa đảo.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>Hệ thống ghi nhận đơn giao liên tỉnh qua nhà xe đối tác Hòa Lạc.</span>
          </div>
        </div>
      </div>

      {/* CARD 3: CHÍNH SÁCH BẢO VỆ SINH VIÊN FPT */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Chính sách Bảo vệ Sinh viên FPT</span>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <Truck className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Miễn 100% phí gửi trả:</strong> Bưu cục CampusShip hỗ trợ vận chuyển hoàn trả thiết bị giữa các cơ sở mà không trừ ví người mua.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Hạn phản hồi 24 giờ:</strong> Nếu sinh viên bán không xác nhận phương án trong 24h, hệ thống tự động hoàn 100% tiền về ví bạn.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Kỷ luật CTSV nghiêm ngặt:</strong> Trường hợp cố ý tráo hàng hoặc gửi đồ giả sẽ bị chuyển hồ sơ sang Hội đồng Kỷ luật Ban CTSV.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onShowToast(
              '📞 Hotline Ban Điều phối CampusShip (Hola): 024.7300.1866 (Ext: 5588)'
            )
          }
          className="w-full mt-2 rounded-xl bg-rose-50 border border-rose-200 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Phone className="h-3.5 w-3.5" />
          <span>Hotline Điều phối CampusShip (Ext 5588)</span>
        </button>
      </div>
    </div>
  );
}
