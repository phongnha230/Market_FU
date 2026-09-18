'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Shield,
  Volume2,
  PhoneCall,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Save,
} from 'lucide-react';
import { CAMPUSES } from '@/constants/marketplace';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampusChange?: (campus: string) => void;
  onToast: (msg: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onCampusChange,
  onToast,
}: SettingsModalProps) {
  const [defaultCampus, setDefaultCampus] = useState('hola');
  const [showPhonePublic, setShowPhonePublic] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [verifiedBuyersOnly, setVerifiedBuyersOnly] = useState(true);
  const [autoSaveDraft, setAutoSaveDraft] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCampus = localStorage.getItem('fu_default_campus');
      if (savedCampus) setDefaultCampus(savedCampus);
      const savedPhone = localStorage.getItem('fu_show_phone');
      if (savedPhone !== null) setShowPhonePublic(savedPhone === 'true');
      const savedSound = localStorage.getItem('fu_sound_enabled');
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');
      const savedStrict = localStorage.getItem('fu_strict_buyers');
      if (savedStrict !== null) setVerifiedBuyersOnly(savedStrict === 'true');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Play realistic Web Audio chime
  const playTestChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
      onToast('🔊 Đã phát âm thanh chuông thông báo thử nghiệm!');
    } catch {
      onToast('Trình duyệt không hỗ trợ Web Audio.');
    }
  };

  const handleSaveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fu_default_campus', defaultCampus);
      localStorage.setItem('fu_show_phone', String(showPhonePublic));
      localStorage.setItem('fu_sound_enabled', String(soundEnabled));
      localStorage.setItem('fu_strict_buyers', String(verifiedBuyersOnly));
    }
    if (onCampusChange) {
      onCampusChange(defaultCampus);
    }
    onToast('⚙️ Đã lưu cấu hình cài đặt thành công!');
    onClose();
  };

  const handleResetCache = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fu_default_campus');
      localStorage.removeItem('fu_show_phone');
      localStorage.removeItem('fu_sound_enabled');
      localStorage.removeItem('fu_strict_buyers');
    }
    setDefaultCampus('hola');
    setShowPhonePublic(true);
    setSoundEnabled(true);
    setVerifiedBuyersOnly(true);
    onToast('🔄 Đã khôi phục toàn bộ cài đặt mặc định của hệ thống!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-fpt-orange">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cài đặt & Tùy chọn hệ thống
              </h3>
              <p className="text-xs text-slate-500">
                Tùy chỉnh trải nghiệm sàn giao dịch sinh viên FPT 5Campus
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

        {/* Settings List */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Setting 1: Default Campus */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <MapPin className="h-4 w-4 text-fpt-orange" />
                <span>Cơ sở Campus mặc định</span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">Tự động chọn khi mở web</span>
            </div>
            <select
              value={defaultCampus}
              onChange={(e) => setDefaultCampus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 font-medium outline-none focus:border-fpt-orange cursor-pointer"
            >
              {CAMPUSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.shortName})
                </option>
              ))}
            </select>
          </div>

          {/* Setting 2: Phone Privacy Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <PhoneCall className="h-4 w-4 text-fpt-orange" />
                <span>Hiển thị Số điện thoại công khai</span>
              </div>
              <p className="text-xs text-slate-500">
                Cho phép người mua xem trực tiếp số Zalo/điện thoại trên bài đăng
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={showPhonePublic}
                onChange={(e) => setShowPhonePublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fpt-orange"></div>
            </label>
          </div>

          {/* Setting 3: Sound Notification & Play test */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Volume2 className="h-4 w-4 text-fpt-orange" />
                <span>Âm thanh tin nhắn & Chốt deal</span>
              </div>
              <p className="text-xs text-slate-500">
                Phát chuông thông báo khi có tin nhắn mới hoặc đề xuất giá
              </p>
              <button
                type="button"
                onClick={playTestChime}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-fpt-orange hover:underline pt-0.5 cursor-pointer"
              >
                <span>▶ Nghe thử âm thanh</span>
              </button>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fpt-orange"></div>
            </label>
          </div>

          {/* Setting 4: Verified Buyers Only */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Chỉ giao dịch với FPT Mail chính chủ</span>
              </div>
              <p className="text-xs text-slate-500">
                Tự động từ chối tin nhắn từ các tài khoản vãng lai chưa xác minh thẻ SV
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={verifiedBuyersOnly}
                onChange={(e) => setVerifiedBuyersOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fpt-orange"></div>
            </label>
          </div>

          {/* Setting 5: Auto save drafts */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Save className="h-4 w-4 text-fpt-orange" />
                <span>Tự động lưu bản nháp tin đăng</span>
              </div>
              <p className="text-xs text-slate-500">
                Lưu nội dung đang soạn để không bị mất khi lỡ đóng trình duyệt
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoSaveDraft}
                onChange={(e) => setAutoSaveDraft(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-fpt-orange"></div>
            </label>
          </div>
        </div>

        {/* Reset Cache & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetCache}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Khôi phục mặc định</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="flex items-center gap-1.5 rounded-xl bg-fpt-orange px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-fpt-orange-hover transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Lưu cài đặt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
