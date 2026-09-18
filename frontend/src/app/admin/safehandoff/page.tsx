'use client';

import React from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import { MapPin, Camera, Wifi, Plus, CheckCircle } from 'lucide-react';

const HUBS = [
  { id: 'HL-01', name: 'Sảnh Toa Alpha (Tầng 1)', campus: 'Hòa Lạc', storage: '42 GB', cameras: '2 Cam HD', students: '8 cán bộ/ngày', status: 'Hoạt động', ok: true },
  { id: 'HL-02', name: 'Thư viện Gamma (Tầng 1)', campus: 'Hòa Lạc', storage: '28 GB', cameras: '360° AI', students: 'Giờ tự học', status: 'Hoạt động', ok: true },
  { id: 'HL-03', name: 'Dom A-B Sảnh Chính', campus: 'Hòa Lạc', storage: '35 GB', cameras: '4 Cam', students: 'Cả ngày', status: 'Hoạt động', ok: true },
  { id: 'SG-01', name: 'Tòa E2a-7 (Khu CN Cao)', campus: 'TP.HCM', storage: '56 GB', cameras: 'Trực DVC', students: 'Trực tiếp', status: 'Hoạt động', ok: true },
  { id: 'DN-01', name: 'Sảnh FPT City Ngũ Hành Sơn', campus: 'Đà Nẵng', storage: '19 GB', cameras: '1 Cam 360', students: 'Buổi sáng', status: 'Hoạt động', ok: true },
  { id: 'CT-01', name: 'Sân cỏ nhân tạo Cần Thơ', campus: 'Cần Thơ', storage: '18 GB', cameras: '2 Cam', students: 'Chiều tối', status: 'Hoạt động', ok: true },
  { id: 'QN-01', name: 'Trung tâm Tri tuệ Nhân tạo', campus: 'Quy Nhơn', storage: '24 GB', cameras: '1 Cam AI', students: '24/7', status: 'Hoạt động', ok: true },
];

export default function AdminSafeHandoffPage() {
  return (
    <AdminLayoutShell>
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-900">Safe-Handoff Hub Network</h1>
              <p className="text-sm text-slate-500 mt-1">Quản lý mạng lưới 18 điểm giao nhận an toàn tại 5 cơ sở FPT.</p>
            </div>
            <button className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs">
              <Plus className="h-4 w-4" />
              Thêm điểm mới
            </button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Tổng điểm Safe-Handoff', value: '18' },
              { label: 'Đang hoạt động', value: '18' },
              { label: 'Cần bảo trì', value: '0' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                <div className="text-2xl font-black text-slate-900">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-extrabold text-slate-900">Danh sách điểm Safe-Handoff</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {HUBS.map((hub) => (
              <div key={hub.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{hub.name}</span>
                    <span className="rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5">{hub.id}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{hub.campus} • {hub.students}</div>
                </div>
                <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1"><Camera className="h-3.5 w-3.5" /> {hub.cameras}</div>
                  <div className="flex items-center gap-1"><Wifi className="h-3.5 w-3.5" /> {hub.storage}</div>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-emerald-100 border border-emerald-200 text-[11px] font-bold text-emerald-700 px-2.5 py-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {hub.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
