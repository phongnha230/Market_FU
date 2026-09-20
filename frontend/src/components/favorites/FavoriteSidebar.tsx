'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Flame,
  Bell,
  ShieldCheck,
  Building2,
  BookOpen,
  Coffee,
  MapPin,
} from 'lucide-react';
import { Card, Button, Input, Label, Progress } from '@/components/ui';

interface FavoriteSidebarProps {
  onSubscribeAlert: (keyword: string, price: string) => void;
  onShowToast: (msg: string) => void;
}

export default function FavoriteSidebar({
  onSubscribeAlert,
  onShowToast,
}: FavoriteSidebarProps) {
  const [alertKeyword, setAlertKeyword] = useState('');
  const [alertPrice, setAlertPrice] = useState('500.000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertKeyword.trim()) {
      onShowToast(
        '⚠️ Vui lòng nhập tên món đồ bạn muốn săn (VD: Màn hình, Xe điện, Sách PRF...)'
      );
      return;
    }
    onSubscribeAlert(alertKeyword, alertPrice);
    setAlertKeyword('');
  };

  return (
    <div className="lg:col-span-4 space-y-5">
      {/* WIDGET 1: VÍ SINH VIÊN FPT */}
      <Card className="rounded-2xl border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-fpt-orange uppercase tracking-wider">
          <span>VÍ SINH VIÊN FPT</span>
          <ExternalLink className="h-3.5 w-3.5 text-fpt-orange" />
        </div>

        <div className="mt-3">
          <span className="text-xs text-slate-500 font-medium">Tiết kiệm ước tính</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ~1.850.000đ
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
            Ở giá trên 12 món bạn đã lưu so với giá thị trường & niêm yết tại các đại lý bán lẻ mới.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <Progress
            value={46}
            className="h-2 w-full bg-slate-100"
            indicatorClassName="bg-gradient-to-r from-fpt-orange to-emerald-500 duration-500"
          />
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700">Tiết kiệm 46% chi phí kỳ học</span>
            <span className="text-slate-400">Mục tiêu: 2.500.000đ</span>
          </div>
        </div>
      </Card>

      {/* WIDGET 2: CAMPUS DEAL ALERT */}
      <Card className="rounded-2xl border-orange-100 bg-white p-5 shadow-xs">
        <div className="flex items-start gap-2.5">
          <div className="rounded-xl bg-orange-100/70 p-2 text-fpt-orange shrink-0">
            <Flame className="h-5 w-5 fill-fpt-orange" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Campus Deal Alert</h3>
            <p className="text-[11px] text-fpt-orange font-semibold">
              Bật radar tìm đồ pass nhanh
            </p>
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Hệ thống sẽ gửi thông báo đẩy đến Telegram/App FPT 5Campus ngay khi có sinh viên pass món bạn cần.
        </p>

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-2.5">
          <div>
            <Label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              MÓN ĐỒ CẦN SĂN
            </Label>
            <Input
              type="text"
              value={alertKeyword}
              onChange={(e) => setAlertKeyword(e.target.value)}
              placeholder="VD: Màn hình 144Hz, Xe Cub 50, Giáo trình..."
              className="h-auto w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-fpt-orange transition"
            />
          </div>

          <div>
            <Label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              MỨC GIÁ KỲ VỌNG (VNĐ)
            </Label>
            <div className="relative">
              <Input
                type="text"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder="Dưới 500.000"
                className="h-auto w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 pr-12 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-fpt-orange transition"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                VNĐ
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="h-auto w-full mt-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition cursor-pointer"
          >
            <Bell className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Đăng ký nhận thông báo</span>
          </Button>
        </form>
      </Card>

      {/* WIDGET 3: ĐIỂM GIAO DỊCH AN TOÀN (HOLA) */}
      <Card className="rounded-2xl border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 text-slate-900">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <h3 className="text-sm font-bold text-slate-900">Điểm giao dịch an toàn (Hola)</h3>
        </div>

        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
          Nên hẹn kiểm tra hàng & thanh toán trực tiếp tại các khu vực có camera an ninh và bàn ghế công cộng:
        </p>

        <div className="mt-3.5 space-y-3">
          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5">
            <div className="rounded-lg bg-orange-100 p-1.5 text-fpt-orange shrink-0 mt-0.5">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Sảnh Tòa Alpha (Tầng 1)</h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Đầy đủ ổ cắm điện để test laptop, màn hình máy tính
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5">
            <div className="rounded-lg bg-orange-100 p-1.5 text-fpt-orange shrink-0 mt-0.5">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Thư viện Gamma (Tầng 2 & 3)</h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Khu vực yên tĩnh, kiểm tra kỹ giáo trình & sách vở
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5">
            <div className="rounded-lg bg-orange-100 p-1.5 text-fpt-orange shrink-0 mt-0.5">
              <Coffee className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Căng-tin KTX Dom E & Dom A</h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Thuận tiện giao dịch đồ gia dụng, nồi cơm, quạt điện KTX
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3.5 border-t border-slate-100 pt-2.5 text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              onShowToast(
                '🛡️ Đường dây nóng BQL Hola Market: 024.7300.1866 hoặc sảnh Alpha'
              )
            }
            className="h-auto p-0 font-normal hover:bg-transparent text-[11px] font-semibold text-slate-500 hover:text-fpt-orange transition cursor-pointer"
          >
            Gặp sự cố giao dịch? <span className="underline decoration-slate-300 ml-1">Báo cáo Ban Quản Lý Sàn</span>
          </Button>
        </div>
      </Card>

      {/* WIDGET 4: TÌM KIẾM Ở CƠ SỞ KHÁC */}
      <Card className="rounded-2xl border-slate-200/80 bg-slate-50/70 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-700">Tìm kiếm ở cơ sở khác?</div>
            <div className="text-[11px] text-slate-500">Đà Nẵng, TP.HCM, Cần Thơ, Quy Nhơn</div>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-auto shrink-0 rounded-lg border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
        >
          <Link href="/posts">
            Đổi cơ sở
          </Link>
        </Button>
      </Card>
    </div>
  );
}
