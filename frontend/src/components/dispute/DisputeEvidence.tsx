'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  CheckCircle2,
  Play,
  Camera,
  ShieldCheck,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';

interface DisputeEvidenceProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  dropoffPoint: 'library' | 'meet';
  onDropoffPointChange: (val: 'library' | 'meet') => void;
  isSubmitting: boolean;
  sellerName: string;
  onShowToast: (msg: string) => void;
}

export default function DisputeEvidence({
  description,
  onDescriptionChange,
  dropoffPoint,
  onDropoffPointChange,
  isSubmitting,
  sellerName,
  onShowToast,
}: DisputeEvidenceProps) {
  return (
    <>
      {/* SECTION 3: EVIDENCE ATTACHMENTS (PHOTOS & VIDEO) */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              3. Bằng chứng xác thực (Hình ảnh & Video Test)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tối thiểu 1 video test nguồn hoặc ảnh chụp rõ serial/tem vỡ để được chấp thuận hoàn 100%.
            </p>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 border border-emerald-200 hover:bg-emerald-50">
            <MapPin className="h-3 w-3" />
            Đã xác thực vị trí Dom B Hola
          </Badge>
        </div>

        {/* Media Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Photo 1: Sọc màn hình */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/products/keyboard-detail.jpg"
                alt="IMG_Soc_ManHinh.jpg"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-2.5 bg-white flex items-center justify-between text-[11px]">
              <div>
                <div className="font-bold text-slate-800 truncate">IMG_Soc_ManHinh.jpg</div>
                <span className="text-[10px] text-slate-400">2.8 MB • 14:15 Hôm nay</span>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            </div>
          </div>

          {/* Photo 2: Cắm nguồn không lên */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/products/monitor-dell-24.jpg"
                alt="IMG_CapNguon_KhongLen.jpg"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-2.5 bg-white flex items-center justify-between text-[11px]">
              <div>
                <div className="font-bold text-slate-800 truncate">IMG_CapNguon_KhongLen.jpg</div>
                <span className="text-[10px] text-slate-400">2.1 MB • 14:18 Hôm nay</span>
              </div>
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            </div>
          </div>

          {/* Video Test Card */}
          <div className="relative rounded-2xl overflow-hidden border border-blue-200 bg-blue-50/60 p-3 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <Badge className="rounded bg-rose-600 text-white px-1.5 py-0.2 border-none hover:bg-rose-600">
                VIDEO TEST
              </Badge>
              <span className="text-slate-500">10.2 MB</span>
            </div>

            <div className="my-3 flex flex-col items-center justify-center text-center">
              <div className="h-10 w-10 rounded-full bg-fpt-orange text-white flex items-center justify-center shadow-md mb-1 cursor-pointer hover:scale-105 transition">
                <Play className="h-4 w-4 fill-white ml-0.5" />
              </div>
              <span className="font-bold text-xs text-slate-800">
                Test_nguon_SanhAlpha.mp4
              </span>
              <span className="text-[10px] text-slate-500">Thời lượng: 00:48</span>
            </div>

            <div className="rounded-lg bg-white/90 p-1.5 text-center text-[10px] font-medium text-slate-600">
              Được quay tại Safe-Point Alpha
            </div>
          </div>
        </div>

        {/* Add more button */}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            onShowToast(
              '📷 Tính năng tải thêm: Bạn có thể thêm tối đa 5 ảnh chụp góc máy.'
            )
          }
          className="h-auto w-full mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-2.5 text-xs font-bold text-slate-600 hover:border-fpt-orange hover:text-fpt-orange transition flex items-center justify-center gap-1.5 cursor-pointer shadow-none"
        >
          <Camera className="h-4 w-4" />
          <span>Bổ sung thêm video unbox hoặc ảnh chụp bọc chống sốc</span>
        </Button>
      </Card>

      {/* SECTION 4: DESCRIPTION TEXTAREA */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-900">
            4. Mô tả chi tiết vấn đề khi nhận hàng
          </label>
          <span className="text-slate-400 font-mono">
            {description.length} / 1000 ký tự
          </span>
        </div>

        <textarea
          rows={4}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition leading-relaxed"
          required
        />
      </Card>

      {/* SECTION 5: DROPOFF LOCATION */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            5. Lựa chọn địa điểm hoàn trả thiết bị
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sinh viên FPT được miễn 100% chi phí chuyển hoàn khi sử dụng trạm Safe-Handoff chính thức.
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          {/* Location 1 */}
          <label
            onClick={() => onDropoffPointChange('library')}
            className={`rounded-2xl border p-3.5 cursor-pointer transition flex items-start gap-3 ${
              dropoffPoint === 'library'
                ? 'border-fpt-orange bg-orange-50/50 ring-2 ring-orange-200'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="dropoffPoint"
              checked={dropoffPoint === 'library'}
              onChange={() => onDropoffPointChange('library')}
              className="mt-1 text-fpt-orange focus:ring-fpt-orange"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Trạm Safe-Handoff Point - Sảnh Thư viện Hòa Lạc
                </span>
                <Badge className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 border-none hover:bg-emerald-100">
                  Mở cửa đến 21:00
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Nhân viên CampusShip trực quầy sẽ in phiếu gửi, niêm phong hộp và điều phối bưu tá chuyển hoàn về cơ sở FPT TP.HCM hoàn toàn miễn phí.
              </p>
            </div>
          </label>

          {/* Location 2 */}
          <label
            onClick={() => onDropoffPointChange('meet')}
            className={`rounded-2xl border p-3.5 cursor-pointer transition flex items-start gap-3 ${
              dropoffPoint === 'meet'
                ? 'border-fpt-orange bg-orange-50/50 ring-2 ring-orange-200'
                : 'border-slate-200 bg-white hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="dropoffPoint"
              checked={dropoffPoint === 'meet'}
              onChange={() => onDropoffPointChange('meet')}
              className="mt-1 text-fpt-orange focus:ring-fpt-orange"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Hẹn đối chất trực tuyến có Điều phối viên CTSV giám sát
                </span>
                <Badge className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 border-none hover:bg-blue-100">
                  Google Meet FPT
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Phù hợp nếu bạn muốn thương lượng giữ màn hình và nhận bồi hoàn một phần tiền trực tiếp từ người bán.
              </p>
            </div>
          </label>
        </div>
      </Card>

      {/* ACTION BUTTONS ROW */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Đơn khiếu nại được mã hóa trên sổ lưu giao dịch FPT Escrow.</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <Button
            asChild
            variant="outline"
            className="h-auto rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Link href={`/chat?seller=${encodeURIComponent(sellerName || 'NguyenVanAn')}`}>
              Nhắn tin với Người bán
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto rounded-xl bg-gradient-to-r from-orange-600 to-fpt-orange px-5 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-orange-500/25 hover:shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Đang gửi hồ sơ...' : 'Gửi yêu cầu Khiếu nại & Khóa Escrow'}
          </Button>
        </div>
      </Card>
    </>
  );
}
