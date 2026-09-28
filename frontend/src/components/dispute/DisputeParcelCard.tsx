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
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          CHI TIẾT BƯU KIỆN KHIẾU NẠI
        </span>
        <Badge variant="outline" className="rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold px-2.5 py-0.5 border border-blue-200 hover:bg-blue-50">
          Vận chuyển liên Campus HCM ➔ Hòa Lạc
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
        <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
          <Image
            src={order?.product.imageUrl || '/products/monitor-dell-24.jpg'}
            alt="Màn hình phụ di động"
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
              Mã đơn: {order?.code.replace('#', '') || orderCode.replace('#', '')}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mt-1">
            {order?.product.title || 'Màn hình phụ di động 15.6 inch Type-C Full HD IPS'}
          </h3>

          <div className="text-sm font-extrabold text-slate-900 mt-1">
            {order ? order.product.price.toLocaleString('vi-VN') : '1.225.000'}đ{' '}
            <span className="text-xs text-slate-500 font-normal">
              (Đã gồm 25.000đ CampusShip)
            </span>
          </div>
        </div>
      </div>

      {/* Parties row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-fpt-orange text-white font-bold text-[10px]">
              NM
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="text-[10px] text-slate-400 font-medium">NGƯỜI MUA (KHIẾU NẠI):</span>
            <div className="font-bold text-slate-800">Người mua</div>
            <div className="text-[10px] text-slate-500">Sinh viên FPT</div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-slate-800 text-white font-bold text-[10px]">
              {(order?.product?.seller?.name || 'NB')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="text-[10px] text-slate-400 font-medium">
              NGƯỜI BÁN:
            </span>
            <div className="font-bold text-slate-800">{order?.product?.seller?.name || 'Người bán'}</div>
            <div className="text-[10px] text-slate-500">{order?.product?.seller?.cohortCampus || 'FPT Campus'}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
