'use client';

import React from 'react';
import Image from 'next/image';
import { OrderItem } from '@/stores/orderStore';
import { Card, Badge, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { Truck, MapPin } from 'lucide-react';

interface DisputeParcelCardProps {
  order?: OrderItem | null;
  orderCode: string;
}

export default function DisputeParcelCard({
  order,
  orderCode,
}: DisputeParcelCardProps) {
  const isInterCampus =
    order?.type === 'inter-campus' ||
    (order as any)?.orderType === 'SHIP_COD' ||
    Boolean((order as any)?.shipping?.shippingPartner);
  const isSafeHandoff = !isInterCampus;

  const displayTitle = order?.product?.title || 'Sản phẩm giao dịch';
  const displayImage =
    (typeof order?.product?.imageUrl === 'string' && order.product.imageUrl) ||
    ((order?.product?.imageUrl as any)?.imageUrl) ||
    (order?.product as any)?.images?.[0]?.imageUrl ||
    '/products/monitor-dell-24.jpg';

  const itemPrice = order?.product?.price ?? order?.payment?.price ?? 0;
  const shippingFee = isInterCampus
    ? ((order as any)?.shipping?.shippingFee ?? order?.payment?.shippingFee ?? 25000)
    : 0;
  const totalAmount = itemPrice + shippingFee;

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
  const buyerAvatarUrl =
    (order as any)?.buyer?.profile?.avatarUrl ||
    (order as any)?.buyer?.avatarUrl ||
    '';

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
  const sellerAvatarUrl =
    (order?.product?.seller as any)?.avatarUrl ||
    (order as any)?.seller?.profile?.avatarUrl ||
    (order as any)?.seller?.avatarUrl ||
    '';

  return (
    <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Thông tin sản phẩm khiếu nại
          </span>
          <span className="text-slate-400 font-mono text-xs">
            #{order?.code?.replace('#', '') || orderCode.replace('#', '')}
          </span>
        </div>

        <Badge variant="outline" className={`rounded-full text-[11px] font-bold px-2.5 py-0.5 border ${
          isInterCampus 
            ? 'bg-blue-50 text-blue-700 border-blue-200' 
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {isInterCampus ? (
            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Liên Campus: {sellerCampus} ➔ {buyerCampus}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Safe-Point: {order?.meetupLocation || sellerCampus}
            </span>
          )}
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 pt-0.5">
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
          <Image
            src={displayImage}
            alt={displayTitle}
            fill
            className="object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
            {displayTitle}
          </h3>

          <div className="flex items-baseline gap-2 flex-wrap text-xs">
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              {itemPrice.toLocaleString('vi-VN')}đ
            </span>
            {isInterCampus ? (
              <span className="text-slate-500">
                + {shippingFee.toLocaleString('vi-VN')}đ ship liên campus = <strong className="text-slate-800">{totalAmount.toLocaleString('vi-VN')}đ</strong>
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">
                (Miễn phí phí giao dịch Safe-Point)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Parties row (Compact chip style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50/80 px-3 py-2 border border-slate-100">
          <Avatar className="h-6 w-6 shrink-0 border border-slate-200">
            {buyerAvatarUrl && <AvatarImage src={buyerAvatarUrl} alt={buyerName} />}
            <AvatarFallback className="bg-fpt-orange text-white font-bold text-[10px]">
              {buyerInitial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 block font-medium">Bên khiếu nại (Bạn):</span>
            <div className="font-semibold text-slate-800 truncate">{buyerName} • <span className="text-slate-500 font-normal">{buyerCampus}</span></div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50/80 px-3 py-2 border border-slate-100">
          <Avatar className="h-6 w-6 shrink-0 border border-slate-200">
            {sellerAvatarUrl && <AvatarImage src={sellerAvatarUrl} alt={sellerName} />}
            <AvatarFallback className="bg-slate-700 text-white font-bold text-[10px]">
              {sellerInitial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 block font-medium">Người bán:</span>
            <div className="font-semibold text-slate-800 truncate">{sellerName} • <span className="text-slate-500 font-normal">{sellerCampus}</span></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
