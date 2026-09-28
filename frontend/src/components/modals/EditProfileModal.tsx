'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, CheckCircle2, GraduationCap, Mail, Camera } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

export interface UserProfileData {
  name: string;
  studentId?: string;
  cohort: string;
  major: string;
  campus: string;
  dorm: string;
  phone: string;
  email: string;
  bio: string;
  avatarUrl?: string;
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
  const user = useUserStore((state) => state.user);
  const [formData, setFormData] = useState<UserProfileData>(initialData);
  const modalAvatarRef = useRef<HTMLInputElement | null>(null);

  // Luôn đồng bộ dữ liệu hồ sơ mới nhất khi mở modal
  useEffect(() => {
    if (isOpen) {
      const activeData = { ...user, ...initialData };
      const sId = activeData.studentId || user.studentId || '';
      const cMatch = sId.match(/\d{2}/)?.[0];
      const derivedCohort = activeData.cohort || user.cohort || (cMatch ? `K${cMatch}` : 'K18');
      const isSE = sId.toUpperCase().includes('SE') || sId.toUpperCase().includes('HE');
      const derivedMajor = activeData.major || user.major || (isSE ? 'Kỹ thuật Phần mềm (SE)' : 'Công nghệ thông tin');

      setFormData({
        name: activeData.name || user.name || '',
        studentId: sId,
        cohort: derivedCohort,
        major: derivedMajor,
        campus: activeData.campus || user.campus || 'Hòa Lạc',
        dorm: activeData.dorm || user.dorm || '',
        phone: activeData.phone || user.phone || '',
        email: activeData.email || user.email || '',
        bio: activeData.bio || user.bio || '',
        avatarUrl: activeData.avatarUrl || user.avatarUrl || '',
      });
    }
  }, [isOpen, initialData, user]);

  const handleModalAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng ảnh đại diện tối đa là 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setFormData((prev) => ({ ...prev, avatarUrl: base64Url }));
      }
    };
    reader.readAsDataURL(file);
  };

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
          {/* Avatar Preview & Upload */}
          <div className="flex items-center gap-4 p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
            <input
              type="file"
              ref={modalAvatarRef}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
              onChange={handleModalAvatarUpload}
            />
            <div
              onClick={() => modalAvatarRef.current?.click()}
              className="relative group cursor-pointer shrink-0"
              title="Nhấn để đổi ảnh đại diện"
            >
              <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-white ring-2 ring-orange-200 shadow-xs bg-gradient-to-br from-orange-400 via-fpt-orange to-amber-600 flex items-center justify-center text-white font-black text-xl">
                {formData.avatarUrl || user.avatarUrl ? (
                  <img
                    src={formData.avatarUrl || user.avatarUrl}
                    alt={formData.name || 'Avatar'}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  (formData.name || user.name || 'SV').slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-slate-950/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800">Ảnh đại diện sinh viên</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Khung tròn chuẩn FPT 5Campus. Hỗ trợ PNG, JPG, WebP tối đa 5MB</p>
              <button
                type="button"
                onClick={() => modalAvatarRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-fpt-orange hover:text-fpt-orange-hover mt-1 transition cursor-pointer"
              >
                <Camera className="h-3 w-3" />
                <span>Tải ảnh mới từ thiết bị</span>
              </button>
            </div>
          </div>

          {/* MSSV & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã số sinh viên (MSSV)
              </label>
              <input
                type="text"
                value={formData.studentId || ''}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                placeholder="VD: HE172819"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 uppercase font-mono outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email tài khoản
              </label>
              <input
                type="email"
                readOnly
                value={formData.email || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

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
              placeholder="VD: Trần Đỗ Phong Nhã"
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
                placeholder="VD: K17"
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
                placeholder="VD: Kỹ thuật Phần mềm (SE)"
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
              Số điện thoại / Zalo kết nối
            </label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="VD: 0982 345 892"
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
