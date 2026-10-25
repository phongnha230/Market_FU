'use client';

import React from 'react';
import Image from 'next/image';
import { OrderItem } from '@/stores/orderStore';
import { Card, Badge, Avatar, AvatarFallback } from '@/components/ui';

interface DisputeParcelCardProps {
  order?: OrderItem | null;
  orderCode: string;
}

export default function DisputeParcelCard({
  order,
  orderCode,
}: DisputeParcelCardProps) {
  const isInterCampus = order?.type === 'inter-campus';
  const displayTitle = order?.product?.title || 'Sản phẩm giao dịch';
  const displayImage =
    (typeof order?.product?.imageUrl === 'string' && order.product.imageUrl) ||
    ((order?.product?.imageUrl as any)?.imageUrl) ||
    (order?.product as any)?.images?.[0]?.imageUrl ||
    '/products/monitor-dell-24.jpg';

  const priceVal = order?.product?.price ?? order?.payment?.price ?? 0;
  const isSafeHandoff = order?.type === 'safe-handoff';

  // Buyer Info
  const buyerName =
    (order as any)?.buyer?.fullName ||
    (order as any)?.buyer?.profile?.fullName ||
    (order as any)?.buyer?.name ||
    (order as any)?.buyerName ||
    'Người mua FPT';
  const buyerCampus =
    (order as any)?.buyer?.campus ||
    (order as any)?.buyer?.profile?.campus ||
    'Campus FPT';
  const buyerInitial = (buyerName || 'M').trim()[0].toUpperCase();

  // Seller Info
  const sellerName =
    order?.product?.seller?.name ||
    (order as any)?.seller?.fullName ||
    (order as any)?.seller?.profile?.fullName ||
    (order as any)?.seller?.email ||
    'Người bán FPT';
  const sellerCampus =
    order?.product?.seller?.cohortCampus ||
    (order as any)?.seller?.profile?.campus ||
    (order as any)?.seller?.campus ||
    'Campus FPT';
  const sellerInitial = (sellerName || 'S').trim()[0].toUpperCase();

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          CHI TIẾT BƯU KIỆN KHIẾU NẠI
        </span>
        <Badge variant="outline" className="rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 border border-blue-200 hover:bg-blue-50">
          {isInterCampus
            ? `Vận chuyển liên Campus (${sellerCampus} ➔ ${buyerCampus})`
            : isSafeHandoff
            ? `Giao nhận trực tiếp Safe-Point (${order?.meetupLocation || sellerCampus})`
            : `Giao dịch nội bộ ${sellerCampus}`}
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
        <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
          <Image
            src={displayImage}
            alt={displayTitle}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <Badge className="rounded bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 border-none hover:bg-rose-100">
              Phát sinh khiếu nại
            </Badge>
            <span className="text-slate-500 font-mono">
              Mã đơn: {order?.code?.replace('#', '') || orderCode.replace('#', '')}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mt-1 line-clamp-2">
            {displayTitle}
          </h3>

          <div className="text-sm font-extrabold text-slate-900 mt-1">
            {priceVal.toLocaleString('vi-VN')}đ{' '}
            <span className="text-xs text-slate-500 font-normal">
              {isInterCampus ? '(Bao gồm phí bảo hộ CampusShip)' : '(Bảo hộ Escrow sinh viên)'}
            </span>
          </div>
        </div>
      </div>

      {/* Parties row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-fpt-orange text-white font-bold text-[10px]">
              {buyerInitial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 font-medium">NGƯỜI MUA (KHIẾU NẠI):</span>
            <div className="font-bold text-slate-800 truncate">{buyerName}</div>
            <div className="text-[10px] text-slate-500 truncate">{buyerCampus}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-slate-800 text-white font-bold text-[10px]">
              {sellerInitial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 font-medium">NGƯỜI BÁN:</span>
            <div className="font-bold text-slate-800 truncate">{sellerName}</div>
            <div className="text-[10px] text-slate-500 truncate">{sellerCampus}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
