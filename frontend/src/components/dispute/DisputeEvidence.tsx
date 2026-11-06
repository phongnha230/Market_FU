'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Play,
  Camera,
  ShieldCheck,
  Loader2,
  Truck,
  MapPin,
  MessageSquare,
  Package,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import { reportService } from '@/services/reportService';

interface DisputeEvidenceProps {
  description: string;
  onDescriptionChange: (val: string) => void;
  dropoffPoint: string;
  onDropoffPointChange: (val: string) => void;
  isSubmitting: boolean;
  sellerName: string;
  onShowToast: (msg: string) => void;
  uploadedProofVideoUrl?: string;
  onUploadedProofVideoUrlChange?: (url: string) => void;
  isInterCampus?: boolean;
  buyerAddress?: string;
  sellerCampus?: string;
  orderCode?: string;
}

export default function DisputeEvidence({
  description,
  onDescriptionChange,
  dropoffPoint,
  onDropoffPointChange,
  isSubmitting,
  sellerName,
  onShowToast,
  uploadedProofVideoUrl,
  onUploadedProofVideoUrlChange,
  isInterCampus = false,
  buyerAddress,
  sellerCampus = 'Campus FPT',
  orderCode = '',
}: DisputeEvidenceProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = React.useState(false);
  const [evidenceList, setEvidenceList] = React.useState<
    Array<{ id: string; url: string; name: string; size: string; isVideo?: boolean }>
  >([]);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMedia(true);
    const newItems: typeof evidenceList = [];

    try {
      for (const file of Array.from(files)) {
        const isVideo = file.type.startsWith('video/');
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        let finalUrl = await readFileAsDataUrl(file);

        try {
          const uploadRes = await reportService.uploadDisputeEvidence(file);
          if (uploadRes?.url && (uploadRes.url.startsWith('http://') || uploadRes.url.startsWith('https://'))) {
            finalUrl = uploadRes.url;
            if (onUploadedProofVideoUrlChange) {
              onUploadedProofVideoUrlChange(finalUrl);
            }
          }
        } catch (err: any) {
          console.warn('⚠️ [Upload fallback to base64 Data URL]:', err?.message || err);
        }

        newItems.push({
          id: Math.random().toString(36).substring(7),
          url: finalUrl,
          name: file.name,
          size: `${sizeMb} MB`,
          isVideo,
        });
      }

      setEvidenceList((prev) => [...prev, ...newItems]);
      onShowToast(`Đã đính kèm ${newItems.length} tệp bằng chứng thực tế.`);
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveItem = (id: string) => {
    setEvidenceList((prev) => prev.filter((item) => item.id !== id));
    onShowToast('Đã xóa tệp bằng chứng.');
  };

  const cleanOrderCode = orderCode.replace(/^#/, '');

  return (
    <>
      {/* SECTION 3: EVIDENCE ATTACHMENTS (PHOTOS & VIDEO) */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            3. Hình ảnh / Video bằng chứng lỗi
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải lên ảnh chụp chi tiết vị trí lỗi, tem mác hoặc video ngắn test thực tế để người bán dễ dàng kiểm chứng.
          </p>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {evidenceList.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs"
            >
              <div className="relative aspect-[16/10] w-full bg-slate-900">
                {item.isVideo ? (
                  <video src={item.url} controls className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white w-6 h-6 flex items-center justify-center text-xs transition cursor-pointer"
                  title="Xóa tệp"
                >
                  ✕
                </button>
              </div>
              <div className="p-2 bg-white flex items-center justify-between text-[11px]">
                <div className="min-w-0 pr-1">
                  <div className="font-semibold text-slate-800 truncate">{item.name}</div>
                  <span className="text-[10px] text-slate-400">{item.size}</span>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              </div>
            </div>
          ))}

          {uploadedProofVideoUrl && evidenceList.length === 0 && (
            <div className="relative rounded-xl overflow-hidden border border-orange-200 bg-orange-50/50 p-3 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <Badge className="bg-orange-500 text-white px-1.5 py-0 border-none">VIDEO TEST</Badge>
                <span className="text-emerald-700 font-semibold">Đã đính kèm</span>
              </div>
              <div className="my-2 flex flex-col items-center justify-center text-center">
                <a
                  href={uploadedProofVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full bg-fpt-orange text-white flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition"
                >
                  <Play className="h-4 w-4 fill-white ml-0.5" />
                </a>
                <span className="font-semibold text-xs text-slate-800 mt-1">Video mở hộp / test</span>
              </div>
              <div className="text-center text-[10px] text-slate-500">Bấm để xem lại video</div>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Upload Trigger Button */}
        <Button
          type="button"
          variant="outline"
          disabled={isUploadingMedia}
          onClick={() => fileInputRef.current?.click()}
          className="h-auto w-full mt-1 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 py-2.5 text-xs font-semibold text-slate-700 hover:border-fpt-orange hover:text-fpt-orange transition flex items-center justify-center gap-1.5 cursor-pointer shadow-none disabled:opacity-60"
        >
          {isUploadingMedia ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-fpt-orange" />
              <span>Đang tải lên tệp bằng chứng...</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 text-fpt-orange" />
              <span>Tải ảnh chụp chỗ lỗi hoặc video test thực tế</span>
            </>
          )}
        </Button>
      </Card>

      {/* SECTION 4: DESCRIPTION TEXTAREA */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-900">
            4. Mô tả chi tiết tình trạng hàng
          </label>
          <span className="text-slate-400 font-mono text-[11px]">
            {description.length} / 1000 ký tự
          </span>
        </div>

        <textarea
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={
            isInterCampus
              ? 'Mô tả rõ món đồ bị lỗi điểm nào, tình trạng vỏ hộp khi nhận từ bưu tá, khác biệt so với bài đăng...'
              : 'Mô tả tình trạng lỗi khi cắm thử tại nhà, phụ kiện bị thiếu hoặc khác so với lúc trao đổi...'
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-fpt-orange focus:ring-1 focus:ring-fpt-orange transition leading-relaxed placeholder:text-slate-400"
          required
        />
      </Card>

      {/* SECTION 5: RETURNING METHOD (CLEARLY DIFFERENTIATING INTER-CAMPUS VS SAFE-HANDOFF) */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            {isInterCampus ? (
              <>
                <Truck className="h-4 w-4 text-blue-600" />
                <span>5. Phương thức chuyển hoàn về Campus {sellerCampus} (GHN)</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>5. Phương thức trao trả món đồ tại Safe-Point</span>
              </>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isInterCampus
              ? 'Đơn vận chuyển liên tỉnh: Kiện hàng sẽ được bưu cục GHN tiếp nhận và chuyển hoàn về cho người bán.'
              : 'Giao dịch trực tiếp tại trường: Hai bên sinh viên hẹn gặp trao trả lại đồ tại địa điểm an toàn.'}
          </p>
        </div>

        {isInterCampus ? (
          /* INTER-CAMPUS: COURIER PICKUP OR POST OFFICE */
          <div className="space-y-2.5 pt-0.5">
            <div
              onClick={() => onDropoffPointChange('courier_pickup')}
              className={`rounded-xl border p-3.5 cursor-pointer transition flex items-start gap-3 ${
                dropoffPoint === 'courier_pickup' || dropoffPoint === 'library'
                  ? 'border-fpt-orange bg-orange-50/40 ring-2 ring-orange-200'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="dropoffPoint"
                checked={dropoffPoint === 'courier_pickup' || dropoffPoint === 'library'}
                onChange={() => onDropoffPointChange('courier_pickup')}
                className="mt-1 text-fpt-orange focus:ring-fpt-orange"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    Bưu tá GHN đến lấy hàng tận nơi (Miễn phí)
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border-none">
                    Tiện lợi nhất
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bưu tá sẽ liên hệ theo số điện thoại và địa chỉ nhận hàng của bạn:
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    📍 {buyerAddress || 'Địa chỉ nhận hàng đã đăng ký trong đơn'}
                  </span>
                  Mã vận đơn chuyển hoàn dự kiến:{' '}
                  <strong className="font-mono text-fpt-orange">GHN-RT-{cleanOrderCode || '000000'}</strong>
                </p>
              </div>
            </div>

            <div
              onClick={() => onDropoffPointChange('post_office')}
              className={`rounded-xl border p-3.5 cursor-pointer transition flex items-start gap-3 ${
                dropoffPoint === 'post_office'
                  ? 'border-fpt-orange bg-orange-50/40 ring-2 ring-orange-200'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="dropoffPoint"
                checked={dropoffPoint === 'post_office'}
                onChange={() => onDropoffPointChange('post_office')}
                className="mt-1 text-fpt-orange focus:ring-fpt-orange"
              />
              <div className="flex-1 space-y-1">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Tự mang gửi tại bưu cục GHN đối tác gần Campus
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bạn chủ động mang kiện hàng đã đóng gói ra bưu cục GHN và đọc mã vận đơn{' '}
                  <strong className="font-mono text-fpt-orange">GHN-RT-{cleanOrderCode || '000000'}</strong> để gửi hoàn.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* SAFE-HANDOFF: MEETUP AT CAMPUS SAFE-POINT */
          <div className="space-y-2.5 pt-0.5">
            <div
              onClick={() => onDropoffPointChange('safe_point')}
              className={`rounded-xl border p-3.5 cursor-pointer transition flex items-start gap-3 ${
                dropoffPoint === 'safe_point' || dropoffPoint === 'library' || !dropoffPoint
                  ? 'border-fpt-orange bg-orange-50/40 ring-2 ring-orange-200'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="dropoffPoint"
                checked={dropoffPoint === 'safe_point' || dropoffPoint === 'library' || !dropoffPoint}
                onChange={() => onDropoffPointChange('safe_point')}
                className="mt-1 text-fpt-orange focus:ring-fpt-orange"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    Hẹn gặp tại Trạm Safe-Point sảnh trường (Thư viện / Căn tin)
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border-none">
                    Khu vực an toàn
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hai bên gặp mặt trực tiếp tại khu vực sinh hoạt chung của trường để trao trả đồ. Sau khi người bán nhận lại món hàng và bấm xác nhận, tiền Escrow sẽ hoàn ngay vào ví của bạn.
                </p>
              </div>
            </div>

            <div
              onClick={() => onDropoffPointChange('original_meetup')}
              className={`rounded-xl border p-3.5 cursor-pointer transition flex items-start gap-3 ${
                dropoffPoint === 'original_meetup'
                  ? 'border-fpt-orange bg-orange-50/40 ring-2 ring-orange-200'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="dropoffPoint"
                checked={dropoffPoint === 'original_meetup'}
                onChange={() => onDropoffPointChange('original_meetup')}
                className="mt-1 text-fpt-orange focus:ring-fpt-orange"
              />
              <div className="flex-1 space-y-1">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Hẹn gặp tại điểm bàn giao ban đầu
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gặp lại tại điểm hẹn trước đó (hoặc sảnh KTX) do hai bên tự nhắn tin thống nhất thời gian thuận tiện.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ACTION BUTTONS ROW */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Khoản tiền được giữ an toàn 100% trong Escrow cho đến khi giải quyết xong.</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <Button
            asChild
            variant="outline"
            className="h-auto rounded-xl border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Link href={`/chat?seller=${encodeURIComponent(sellerName || 'nguoiban')}`} className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-fpt-orange" />
              <span>Nhắn tin với Người bán</span>
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang gửi yêu cầu...</span>
              </span>
            ) : isInterCampus ? (
              'Gửi yêu cầu Trả hàng & Hoàn tiền'
            ) : (
              'Gửi yêu cầu Trả hàng Safe-Point'
            )}
          </Button>
        </div>
      </Card>
    </>
  );
}
