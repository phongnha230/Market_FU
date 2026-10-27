'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileText,
  Video,
  Camera,
  ExternalLink,
  Scale,
  Eye,
  Lock,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import DisputeParcelCard from './DisputeParcelCard';

interface DisputeSellerInspectionViewProps {
  order: any;
  orderCode: string;
  dispute: any;
  onShowToast: (msg: string) => void;
}

const isVideoProofUrl = (url?: string) => {
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  if (url.startsWith('data:image/')) return false;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.includes('/video/') ||
    clean.includes('video-unbox')
  );
};

export default function DisputeSellerInspectionView({
  order,
  orderCode,
  dispute,
  onShowToast,
}: DisputeSellerInspectionViewProps) {
  const cleanCode = orderCode.startsWith('#') ? orderCode : `#${orderCode}`;
  const priceVal = order?.product?.price ?? order?.payment?.price ?? 0;

  // Buyer Info
  const buyerName =
    order?.buyer?.profile?.fullName ||
    order?.buyer?.fullName ||
    order?.buyer?.name ||
    order?.buyerName ||
    'Người mua FPT';
  const buyerEmail = order?.buyer?.email || 'Chưa cập nhật';
  const buyerPhone =
    order?.buyer?.profile?.phoneNumber ||
    order?.shipping?.receiverPhone ||
    'Chưa cập nhật';
  const buyerCampus =
    order?.buyer?.profile?.campus ||
    order?.buyer?.campus ||
    order?.shipping?.shippingAddress ||
    'Campus FPT';
  const buyerReputation =
    order?.buyer?.profile?.reputationScore ??
    order?.buyer?.reputationScore ??
    100;

  // Seller Info
  const sellerName =
    order?.product?.seller?.name ||
    order?.seller?.profile?.fullName ||
    order?.seller?.fullName ||
    order?.seller?.email ||
    'Người bán FPT';
  const sellerEmail =
    order?.seller?.email ||
    order?.product?.seller?.email ||
    'Chưa cập nhật';
  const sellerPhone =
    order?.seller?.profile?.phoneNumber ||
    'Chưa cập nhật';
  const sellerCampus =
    order?.product?.seller?.cohortCampus ||
    order?.seller?.profile?.campus ||
    order?.product?.campus ||
    'Campus FPT';
  const sellerReputation =
    order?.seller?.profile?.reputationScore ??
    order?.seller?.reputationScore ??
    100;

  const status = dispute?.status || 'PENDING';
  const disputeReason = dispute?.reason || 'Hàng lỗi kỹ thuật/hỏng hóc khi test thực tế';
  const disputeDetails =
    dispute?.details ||
    'Người mua đã phản ánh món hàng không hoạt động đúng cam kết và yêu cầu hoàn trả tiền bảo hộ Escrow.';
  const proofUrl = dispute?.proofVideoUrl || '';
  const isVideo = isVideoProofUrl(proofUrl);

  return (
    <div className="space-y-5">
      {/* 1. SELLER READ-ONLY NOTICE BANNER */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs">
        <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <Eye className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-extrabold text-sm sm:text-base text-amber-950">
              Hồ sơ Thẩm tra Khiếu nại (Chế độ Người bán - Chỉ xem)
            </h4>
            <Badge className="bg-amber-200 text-amber-900 text-[10px] font-bold border-none">
              <Lock className="h-3 w-3 mr-1 inline" /> Read-only
            </Badge>
          </div>
          <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
            Bạn đang xem hồ sơ khiếu nại do <strong>Người mua ({buyerName})</strong> tạo gửi Ban Quản Trị Campus. 
            Người bán <strong>chỉ có quyền theo dõi tiến trình và phán quyết của BQT</strong>, không thể tự ý rút đơn hoặc sửa đổi nội dung khiếu nại. 
            Toàn bộ tiền giao dịch đang được bảo lưu an toàn 100% trong quỹ Escrow FPT.
          </p>
        </div>
      </div>

      {/* 2. PARCEL CARD */}
      <DisputeParcelCard order={order} orderCode={cleanCode} />

      {/* 3. DISPUTE STATUS & ADMIN ACTIONS CARD */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Tiến trình & Hành động của Ban Quản Trị (Admin)
              </h3>
              <p className="text-xs text-slate-500">
                Mã hồ sơ: <span className="font-mono font-bold text-slate-700">{dispute?.id || `DSP-${cleanCode.replace('#', '')}`}</span> • Gửi lúc: {dispute?.createdAt || 'Gần đây'}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              status === 'REFUNDED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : status === 'REJECTED'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : status === 'CANCELLED'
                ? 'bg-slate-50 text-slate-700 border-slate-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {status === 'REFUNDED'
              ? '✓ BQT đã duyệt chấp thuận hoàn tiền'
              : status === 'REJECTED'
              ? '✕ BQT đã bác đơn & giải ngân Người bán'
              : status === 'CANCELLED'
              ? '✓ Người mua đã tự rút khiếu nại'
              : '⏳ Đang trong tiến trình thẩm định của BQT'}
          </Badge>
        </div>

        {/* Admin Action Timeline Steps */}
        <div className="space-y-3 pt-1">
          {/* Action Step 1 */}
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Hành động 1: Tiếp nhận đơn & Khóa bảo hộ quỹ Escrow 100%</span>
                <span className="text-[11px] text-emerald-600 font-semibold">Đã hoàn thành</span>
              </div>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Hệ thống tự động phong tỏa {priceVal.toLocaleString('vi-VN')} đ tại tài khoản bảo chứng Escrow để bảo vệ quyền lợi tài chính cho cả 2 bên.
              </p>
            </div>
          </div>

          {/* Action Step 2 */}
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              status !== 'PENDING' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {status !== 'PENDING' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Hành động 2: Thẩm tra Bằng chứng Kỹ thuật & Video mở hộp</span>
                <span className={`text-[11px] font-semibold ${status !== 'PENDING' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {status !== 'PENDING' ? 'Đã hoàn thành' : 'Đang xử lý'}
                </span>
              </div>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                BQT đối chiếu video unbox và ảnh kiểm tra thực tế so với bài đăng mô tả ban đầu của người bán để xác định chính xác nguyên nhân lỗi.
              </p>
            </div>
          </div>

          {/* Action Step 3 */}
          <div className={`flex items-start gap-3 rounded-xl p-3.5 border ${
            status === 'REFUNDED'
              ? 'bg-emerald-50/70 border-emerald-200'
              : status === 'REJECTED'
              ? 'bg-rose-50/70 border-rose-200'
              : status === 'CANCELLED'
              ? 'bg-slate-100 border-slate-200'
              : 'bg-indigo-50/60 border-indigo-200'
          }`}>
            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              status === 'REFUNDED'
                ? 'bg-emerald-600 text-white'
                : status === 'REJECTED'
                ? 'bg-rose-600 text-white'
                : status === 'CANCELLED'
                ? 'bg-slate-600 text-white'
                : 'bg-indigo-600 text-white'
            }`}>
              <Scale className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0 text-xs space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center justify-between flex-wrap gap-1">
                <span>Hành động 3: Phán quyết & Quyết định giải ngân của Admin</span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {dispute?.resolvedAt ? `Xử lý lúc: ${dispute.resolvedAt}` : 'Chờ phán quyết'}
                </span>
              </div>

              {status === 'PENDING' && (
                <p className="text-indigo-900 leading-relaxed font-medium">
                  ⏳ <strong>Admin đang trong thời gian thẩm định (trong vòng 24h):</strong> Bạn không cần làm gì thêm lúc này. Nếu bằng chứng của người mua không đủ căn cứ hoặc phát hiện lỗi do người dùng tự gây ra, BQT sẽ lập tức bác đơn và giải ngân 100% tiền đơn hàng cho bạn.
                </p>
              )}

              {status === 'REFUNDED' && (
                <div className="space-y-1.5 text-emerald-950">
                  <p className="font-semibold leading-relaxed">
                    ✓ <strong>Quyết định của Admin:</strong> Chấp thuận yêu cầu hoàn tiền của Người mua do phát hiện lỗi kỹ thuật không khớp cam kết bài đăng.
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    📌 <strong>Quy trình hoàn hàng:</strong> Người mua có nghĩa vụ gửi trả đúng sản phẩm về Safe-Point của bạn. Sau khi nhận lại hàng thành công, tiền mới được hoàn về ví người mua.
                  </p>
                  {dispute?.adminNote && (
                    <div className="rounded-lg bg-white/90 p-2.5 border border-emerald-300 text-[11px] text-emerald-900 font-medium">
                      <strong>Ghi chú phán quyết của BQT:</strong> {dispute.adminNote}
                    </div>
                  )}
                </div>
              )}

              {status === 'REJECTED' && (
                <div className="space-y-1.5 text-rose-950">
                  <p className="font-semibold leading-relaxed">
                    ✕ <strong>Quyết định của Admin:</strong> Bác bỏ khiếu nại của Người mua. Đã giải ngân 100% tiền đơn hàng ({priceVal.toLocaleString('vi-VN')} đ) vào ví của Người bán.
                  </p>
                  <p className="text-[11px] text-rose-800">
                    📌 Lý do: Bằng chứng người mua cung cấp không hợp lệ hoặc lỗi do người dùng tự gây ra sau khi nhận hàng. Điểm uy tín của Người bán được giữ trọn vẹn.
                  </p>
                  {dispute?.adminNote && (
                    <div className="rounded-lg bg-white/90 p-2.5 border border-rose-300 text-[11px] text-rose-900 font-medium">
                      <strong>Ghi chú từ BQT:</strong> {dispute.adminNote}
                    </div>
                  )}
                </div>
              )}

              {status === 'CANCELLED' && (
                <div className="space-y-1 text-slate-800">
                  <p className="font-semibold leading-relaxed">
                    ✓ <strong>Người mua đã tự nguyện rút khiếu nại:</strong> Hai bên đã tự thỏa thuận thành công. Đơn hàng đã được đánh dấu hoàn tất và tiền cọc đã được giải ngân cho Người bán.
                  </p>
                  {dispute?.adminNote && (
                    <div className="rounded-lg bg-white/90 p-2.5 border border-slate-300 text-[11px] text-slate-700">
                      <strong>Ghi chú:</strong> {dispute.adminNote}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 4. BUYER VS SELLER INFO (GIỐNG ADMIN VIEW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Buyer Info */}
        <div className="rounded-2xl border border-slate-200 p-4 bg-white space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-100 pb-2 text-xs">
            <User className="h-4 w-4 text-blue-600" />
            <span>Thông tin Người mua (Bên gửi khiếu nại)</span>
          </div>
          <div className="space-y-1.5 text-slate-600 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Họ và tên:</span>
              <span className="font-bold text-slate-900">{buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email FPT:</span>
              <span className="font-medium text-slate-800">{buyerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Điện thoại:</span>
              <span className="font-semibold text-slate-800">{buyerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cơ sở Campus:</span>
              <span className="font-medium text-slate-800">{buyerCampus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Điểm uy tín:</span>
              <span className="font-bold text-emerald-600">{buyerReputation} điểm</span>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="rounded-2xl border border-emerald-200/80 p-4 bg-emerald-50/30 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-emerald-200/60 pb-2 text-xs">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>Thông tin Người bán (Bị khiếu nại - Bạn)</span>
            <Badge className="ml-auto bg-emerald-100 text-emerald-800 text-[10px] border-none font-bold">
              Chính bạn
            </Badge>
          </div>
          <div className="space-y-1.5 text-slate-600 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Họ và tên:</span>
              <span className="font-bold text-slate-900">{sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email FPT:</span>
              <span className="font-medium text-slate-800">{sellerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Điện thoại:</span>
              <span className="font-semibold text-slate-800">{sellerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cơ sở Campus:</span>
              <span className="font-medium text-slate-800">{sellerCampus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Điểm uy tín:</span>
              <span className="font-bold text-emerald-600">{sellerReputation} điểm</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. EVIDENCE & DETAILS CARD */}
      <Card className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-5 sm:p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span>Nội dung Khiếu nại & Bằng chứng từ Người mua</span>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl bg-white p-3.5 border border-amber-200 space-y-1">
            <div className="text-slate-500 font-bold">Lý do người mua yêu cầu trả hàng:</div>
            <div className="font-bold text-slate-900 text-sm">{disputeReason}</div>
          </div>

          <div className="rounded-xl bg-white p-3.5 border border-amber-200 space-y-1">
            <div className="text-slate-500 font-bold">Mô tả tình trạng chi tiết từ người mua:</div>
            <div className="text-slate-700 leading-relaxed font-normal">{disputeDetails}</div>
          </div>

          {/* Video / Image Proof Player */}
          {proofUrl && (
            <div className="rounded-xl bg-white p-3.5 border border-amber-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  {isVideo ? <Video className="h-4 w-4 text-fpt-orange" /> : <Camera className="h-4 w-4 text-fpt-orange" />}
                  <span>{isVideo ? 'Video quay cận cảnh mở hộp / test lỗi:' : 'Hình ảnh bằng chứng kiểm tra lỗi:'}</span>
                </span>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-fpt-orange hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <span>Mở trong tab mới</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video max-h-72 w-full flex items-center justify-center border border-slate-200 shadow-inner">
                {isVideo ? (
                  <video src={proofUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <img
                    src={proofUrl}
                    alt="Bằng chứng khiếu nại"
                    className="w-full h-full object-contain cursor-pointer hover:scale-105 transition"
                    onClick={() => window.open(proofUrl, '_blank')}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 6. SELLER PROTECTION SCENARIOS CARD */}
      <Card className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3 text-xs">
        <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-500">
          QUY TRÌNH BẢO VỆ QUYỀN LỢI NGƯỜI BÁN TẠI FPT MARKET
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3.5 space-y-1.5">
            <div className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Khi BQT Bác bỏ khiếu nại</span>
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Nếu bằng chứng không thuyết phục hoặc lỗi do người mua tự gây ra, BQT sẽ bảo vệ Người bán và tiến hành <strong>giải ngân 100% tiền đơn hàng</strong> vào ví của bạn ngay lập tức.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-indigo-600" />
              <span>Khi BQT Duyệt trả hàng</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Người mua phải gửi trả hàng nguyên vẹn về Safe-Point của bạn trước khi được hoàn tiền. Bạn được quyền kiểm tra hàng khi nhận lại; nếu phát hiện bị tráo đồ, bạn có quyền khiếu nại ngược.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Button
            asChild
            className="w-full sm:w-auto rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white text-xs font-bold px-4 py-2 cursor-pointer shadow-xs"
          >
            <Link href={`/orders/${encodeURIComponent(cleanCode.replace('#', ''))}`}>
              <span>Xem chi tiết đơn hàng gốc</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold px-4 py-2 cursor-pointer"
          >
            <Link href="/orders">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              <span>Quay lại Quản lý đơn hàng</span>
            </Link>
          </Button>

          <div className="sm:ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>Chế độ Người bán: Chỉ xem • Không có quyền chỉnh sửa hay rút đơn</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
