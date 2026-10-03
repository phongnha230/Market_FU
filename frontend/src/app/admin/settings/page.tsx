'use client';

import React, { useState } from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import { Settings, Save, Bell, Shield, Users, Globe, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSettingsPage() {
  const [autoApprove, setAutoApprove] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer',
        value ? 'bg-fpt-orange' : 'bg-slate-200'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          value ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );

  return (
    <AdminLayoutShell>
      <div className="space-y-5 max-w-3xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="h-5 w-5 text-slate-600" />
            <h1 className="text-xl font-black text-slate-900">Cài đặt Hệ thống</h1>
          </div>
          <p className="text-sm text-slate-500">Cấu hình hoạt động của FPT 5Campus Admin Operations.</p>
        </div>

        {[
          {
            icon: <Shield className="h-5 w-5 text-blue-500" />,
            title: 'Kiểm duyệt & Bảo mật',
            settings: [
              { label: 'AI Auto-Approve (Khớp SSO ≥ 98%)', desc: 'Tự động cấp huy hiệu cho hồ sơ KYC khớp cao', value: autoApprove, onChange: setAutoApprove },
              { label: 'FPT Education SSO Gateway', desc: 'Kết nối dữ liệu đào tạo FPT (FAP, SSO)', value: ssoEnabled, onChange: setSsoEnabled },
            ],
          },
          {
            icon: <Bell className="h-5 w-5 text-amber-500" />,
            title: 'Thông báo',
            settings: [
              { label: 'Email cảnh báo vi phạm (@fpt.edu.vn)', desc: 'Gửi thông báo tự động khi phát hiện vi phạm nghiêm trọng', value: emailAlerts, onChange: setEmailAlerts },
              { label: 'Chế độ bảo trì hệ thống', desc: 'Tắt marketplace cho toàn bộ sinh viên trong lúc bảo trì', value: maintenanceMode, onChange: setMaintenanceMode },
            ],
          },
        ].map((group) => (
          <div key={group.title} className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
              {group.icon}
              <h3 className="text-sm font-extrabold text-slate-900">{group.title}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {group.settings.map((s) => (
                <div key={s.label} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{s.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.desc}</div>
                  </div>
                  <Toggle value={s.value} onChange={s.onChange} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* System Info */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-slate-500" />
            <h3 className="text-sm font-extrabold text-slate-900">Thông tin Hệ thống</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Phiên bản', value: 'V2.4 Production 5Campus' },
              { label: 'Môi trường', value: 'Production' },
              { label: 'AI Model', value: 'FPT-Vision-OCR v3.2' },
              { label: 'SSO Gateway', value: 'FPT Education SSO v6.8' },
              { label: 'Database', value: '5Campus MarketDB v4.1' },
              { label: 'Uptime', value: '99.98% (30 ngày qua)' },
            ].map((info) => (
              <div key={info.label} className="flex justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
                <span className="text-slate-500 font-medium">{info.label}</span>
                <span className="font-bold text-slate-900">{info.value}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-2 rounded-xl bg-fpt-orange px-5 py-3 text-sm font-bold text-white hover:bg-fpt-orange-hover cursor-pointer shadow-xs active:scale-95 transition">
          <Save className="h-4 w-4" />
          Lưu cài đặt
        </button>
      </div>
    </AdminLayoutShell>
  );
}
