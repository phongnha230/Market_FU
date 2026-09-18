'use client';

import React, { useState } from 'react';
import { X, User, Phone, CheckCircle2 } from 'lucide-react';

export interface UserProfileData {
  name: string;
  cohort: string;
  major: string;
  campus: string;
  dorm: string;
  phone: string;
  email: string;
  bio: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: UserProfileData;
  onSave: (data: UserProfileData) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<UserProfileData>(initialData);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chỉnh sửa thông tin hồ sơ
              </h3>
              <p className="text-xs text-slate-500">
                Cập nhật thông tin hiển thị trên sàn giao dịch FPT 5Campus
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên hiển thị <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>

          {/* Cohort & Major */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Khóa sinh viên
              </label>
              <input
                type="text"
                value={formData.cohort}
                onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chuyên ngành
              </label>
              <input
                type="text"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
              />
            </div>
          </div>

          {/* Campus & Dorm */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cơ sở Campus
              </label>
              <select
                value={formData.campus}
                onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-fpt-orange transition cursor-pointer"
              >
                <option value="Hòa Lạc">Hòa Lạc (Hà Nội)</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Quy Nhơn">Quy Nhơn</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Khu ký túc xá / Tòa
              </label>
              <input
                type="text"
                value={formData.dorm}
                onChange={(e) => setFormData({ ...formData, dorm: e.target.value })}
                placeholder="VD: KTX Dom E"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
              />
            </div>
          </div>

          {/* Phone / Zalo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số điện thoại / Zalo kết nối <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
              />
              <Phone className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiểu sử sinh viên (Bio)
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
