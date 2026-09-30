'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, User, Phone, CheckCircle2, GraduationCap, Mail, Camera, Lock } from 'lucide-react';
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
      const derivedCohort = activeData.cohort || user.cohort || (cMatch ? `K${cMatch}` : '');
      const derivedMajor = activeData.major || user.major || '';

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

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên hiển thị (Nickname) <span className="text-rose-500">*</span>
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

          {/* Phone / Zalo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số điện thoại nhận hàng / Zalo kết nối
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

          {/* Dorm */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Khu ký túc xá / Tòa nhà nhận hàng (Dorm)
            </label>
            <input
              type="text"
              value={formData.dorm}
              onChange={(e) => setFormData({ ...formData, dorm: e.target.value })}
              placeholder="VD: KTX Dom E, Phòng 302..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lời giới thiệu (Bio)
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Chia sẻ đôi điều về bạn..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-800 outline-none focus:border-fpt-orange focus:ring-2 focus:ring-orange-100 transition resize-none leading-relaxed"
            />
          </div>

          {/* FPT Student Identity (Read-only) */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span>Thông tin sinh viên FPT (Chỉ đọc)</span>
              </span>
              {user.role === 'UNVERIFIED' || !formData.studentId ? (
                <span className="text-[10px] text-amber-700 bg-amber-100/70 font-semibold px-2 py-0.5 rounded-full">
                  Chưa xác thực Thẻ SV
                </span>
              ) : (
                <span className="text-[10px] text-emerald-700 bg-emerald-100/70 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Đã xác thực chính quy
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">Mã số sinh viên (MSSV)</span>
                <div className="w-full rounded-lg border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs font-mono font-bold text-slate-700 select-none">
                  {formData.studentId || 'Chưa cập nhật'}
                </div>
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">Email tài khoản</span>
                <div className="w-full rounded-lg border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs text-slate-600 truncate select-none">
                  {formData.email || '—'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px] pt-2 border-t border-slate-200/60 text-slate-600">
              <div>
                <span className="text-slate-400">Cơ sở: </span>
                {user.role === 'UNVERIFIED' || user.kycStatus === 'unverified' ? (
                  <select
                    value={formData.campus || user.campus || 'Hòa Lạc'}
                    onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-fpt-orange"
                  >
                    <option value="Hòa Lạc">Hà Nội (Hòa Lạc)</option>
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh (Q.9)</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Quy Nhơn">Quy Nhơn</option>
                  </select>
                ) : (
                  <strong className="text-slate-700 block mt-0.5">{formData.campus || user.campus || 'Hòa Lạc'}</strong>
                )}
              </div>
              <div>
                <span className="text-slate-400">Khóa & Ngành: </span>
                <strong className="text-slate-700 block mt-0.5">
                  {formData.cohort ? formData.cohort : '—'} {formData.major ? `(${formData.major})` : ''}
                </strong>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              * MSSV, Khóa học, Chuyên ngành và Cơ sở được bảo vệ và đồng bộ tự động từ kết quả duyệt Thẻ Sinh Viên (KYC).
            </p>
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
