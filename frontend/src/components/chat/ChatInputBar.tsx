'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Camera,
  MapPin,
  QrCode,
  Smile,
  Send,
  ShieldCheck,
  Building2,
  Coffee,
  BookOpen,
  Home,
  Check,
  Copy,
  X,
  ExternalLink,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { safehandoffService } from '@/services/safehandoffService';

const SAFE_POINTS = [
  {
    id: 'alpha',
    name: 'Sảnh Tòa Alpha',
    desc: 'Trạm Camera giám sát 24/7 & quầy lễ tân',
    icon: Building2,
    badge: 'An toàn nhất',
  },
  {
    id: 'beta',
    name: 'Sảnh Beta KTX',
    desc: 'Có bảo vệ trực thường trực trước sảnh Dom',
    icon: Home,
    badge: 'Tiện KTX',
  },
  {
    id: 'library',
    name: 'Thư viện Tầng 1',
    desc: 'Bàn tròn trung tâm, yên tĩnh, có điều hòa',
    icon: BookOpen,
    badge: 'Yên tĩnh',
  },
  {
    id: 'passio',
    name: 'Passio Coffee / Canteen',
    desc: 'Khu vực công cộng sầm uất, dễ tìm',
    icon: Coffee,
    badge: 'Đông vui',
  },
];

const QUICK_EMOJIS = [
  '😊', '😂', '😍', '👍', '🔥', '💯', '🤝', '📦',
  '🛵', '☕', '❤️', '🙏', '🚀', '✨', '📱', '💻',
  '💸', '🏷️', '✅', '👋'
];

interface ChatInputBarProps {
  inputText: string;
  onInputChange: (val: string) => void;
  onSendMessage: (text?: string) => void;
  onSendImage?: (file: File) => void;
  quickChips: string[];
  partnerFirstName: string;
  onShowToast: (msg: string) => void;
}

export default function ChatInputBar({
  inputText,
  onInputChange,
  onSendMessage,
  onSendImage,
  quickChips,
  partnerFirstName,
  onShowToast,
}: ChatInputBarProps) {
  const [activeMenu, setActiveMenu] = useState<'safepoint' | 'qr' | 'emoji' | null>(null);
  const [copiedQr, setCopiedQr] = useState(false);
  const [safePoints, setSafePoints] = useState<Array<{ id: string; name: string; desc: string; icon: any; badge: string }>>(SAFE_POINTS);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUser = useUserStore((state) => state.user);
  const userAccountNo = currentUser.bankAccount?.accountNo || currentUser.studentId || '03984712398';
  const userBankName = currentUser.bankAccount?.bankName || 'TPBank (FPT Edu)';
  const userAccountName = currentUser.bankAccount?.accountName || currentUser.name || 'SINH VIEN FPT';
  const qrImageUrl = `https://img.vietqr.io/image/TPB-${encodeURIComponent(userAccountNo)}-compact2.png?amount=0&addInfo=Market%20FU%20Chuyen%20khoan&accountName=${encodeURIComponent(userAccountName)}`;

  // Tải danh sách điểm Safe-Point hoạt động thực tế từ Backend
  useEffect(() => {
    safehandoffService
      .getHubs()
      .then((res) => {
        if (res?.hubs && res.hubs.length > 0) {
          const mapped = res.hubs.map((hub) => ({
            id: hub.id,
            name: hub.name,
            desc: hub.locationDetails || hub.notes || `Khu vực an toàn ${hub.campus}`,
            icon: Building2,
            badge: hub.isOperating ? 'Hoạt động' : 'Tạm nghỉ',
          }));
          setSafePoints(mapped);
        }
      })
      .catch(() => {
        // Dự phòng danh sách Safe-Point mặc định nếu mạng offline
      });
  }, []);

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý chọn ảnh thật từ máy tính
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        onShowToast('⚠️ Kích thước ảnh tối đa là 10MB!');
        return;
      }
      if (onSendImage) {
        onSendImage(file);
      } else {
        onShowToast('📷 Đã chọn ảnh: ' + file.name);
      }
      // Reset input
      e.target.value = '';
    }
  };

  // Chọn điểm Safe-Point
  const handleSelectSafePoint = (point: { id: string; name: string; desc: string; icon: any; badge: string }) => {
    setActiveMenu(null);
    onSendMessage(`Hẹn điểm bàn giao đồ tại Sảnh: ${point.name} (${point.desc})`);
    onShowToast(`📍 Đã gửi vị trí hẹn gặp Safe-Point tại ${point.name}!`);
  };

  // Gửi thông tin chuyển khoản VietQR vào chat
  const handleSendVietQrCard = () => {
    setActiveMenu(null);
    onSendMessage(
      `💳 [VIETQR_NAPAS247] Thông tin chuyển khoản thanh toán:\n• Ngân hàng: ${userBankName}\n• Số tài khoản: ${userAccountNo}\n• Chủ tài khoản: ${userAccountName}\n• Vui lòng quét mã QR hoặc chuyển khoản đúng STK trên.`
    );
    onShowToast('📱 Đã gửi thông tin thẻ chuyển khoản VietQR vào hội thoại!');
  };

  // Sao chép STK
  const handleCopyAccountNo = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(userAccountNo);
      setCopiedQr(true);
      setTimeout(() => setCopiedQr(false), 2000);
      onShowToast('📋 Đã sao chép số tài khoản vào bộ nhớ tạm!');
    }
  };

  // Chọn emoji
  const handleSelectEmoji = (emoji: string) => {
    onInputChange(inputText + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="shrink-0 bg-white border-t border-slate-200 relative" ref={menuContainerRef}>
      {/* 1. POPOVER: SAFE-POINT FPT CAMPUS */}
      {activeMenu === 'safepoint' && (
        <div className="absolute bottom-full left-4 mb-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Chọn điểm hẹn Safe-Point</h4>
                <p className="text-[10px] text-slate-500">Khu vực an toàn có camera & bảo vệ FPT</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveMenu(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
            {safePoints.map((sp) => {
              const Icon = sp.icon;
              return (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => handleSelectSafePoint(sp)}
                  className="w-full text-left p-2 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-600 flex items-center justify-center shrink-0 transition">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">
                        {sp.name}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition">
                        {sp.badge}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 line-clamp-1 mt-0.5">{sp.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. POPOVER: VIETQR NAPAS247 */}
      {activeMenu === 'qr' && (
        <div className="absolute bottom-full left-12 mb-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-3.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-lg bg-orange-50 text-fpt-orange flex items-center justify-center">
                <QrCode className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Mã VietQR Napas247</h4>
                <p className="text-[10px] text-slate-500">Tài khoản nhận tiền của bạn</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveMenu(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* QR Image Preview */}
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-3 border border-slate-200/80 mb-2.5">
            <div className="relative h-44 w-44 rounded-lg overflow-hidden bg-white shadow-2xs border border-slate-100">
              <Image
                src={qrImageUrl}
                alt="Mã VietQR cá nhân"
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
            <div className="mt-2 text-center">
              <div className="text-[11px] font-bold text-slate-800 uppercase">{userAccountName}</div>
              <div className="text-[10.5px] text-slate-500 font-mono mt-0.5 flex items-center justify-center gap-1">
                <span>{userBankName}: <strong>{userAccountNo}</strong></span>
                <button
                  type="button"
                  onClick={handleCopyAccountNo}
                  className="text-slate-400 hover:text-slate-700 transition p-0.5 cursor-pointer"
                  title="Sao chép STK"
                >
                  {copiedQr ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleSendVietQrCard}
            className="w-full rounded-xl bg-fpt-orange hover:bg-fpt-orange-hover text-white text-xs font-bold py-2 px-3 shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Gửi thông tin thẻ QR vào chat</span>
          </button>
        </div>
      )}

      {/* 3. POPOVER: EMOJI PICKER */}
      {activeMenu === 'emoji' && (
        <div className="absolute bottom-full right-16 mb-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
            <span className="text-[11px] font-bold text-slate-700">Biểu tượng cảm xúc</span>
            <button
              type="button"
              onClick={() => setActiveMenu(null)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {QUICK_EMOJIS.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectEmoji(emoji)}
                className="h-9 w-9 rounded-xl hover:bg-orange-50 text-lg flex items-center justify-center transition hover:scale-110 active:scale-95 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden File Input for Camera / Photo selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* QUICK SUGGESTION CHIPS */}
      <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSendMessage(chip.replace('⚡ ', ''))}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-fpt-orange hover:text-fpt-orange hover:bg-orange-50/50 transition cursor-pointer shrink-0 shadow-2xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* CHAT INPUT BAR */}
      <div className="p-3 sm:p-4 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Media Attachment Tools */}
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <button
              type="button"
              title="Gửi ảnh kiểm tra thiết bị từ máy tính"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-orange-50 hover:text-fpt-orange rounded-xl transition cursor-pointer"
            >
              <Camera className="h-5 w-5" />
            </button>

            <button
              type="button"
              title="Ghim điểm hẹn an toàn Safe-Point Campus"
              onClick={() => setActiveMenu(activeMenu === 'safepoint' ? null : 'safepoint')}
              className={`p-2 rounded-xl transition cursor-pointer ${
                activeMenu === 'safepoint'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <MapPin className="h-5 w-5" />
            </button>

            <button
              type="button"
              title="Tạo mã QR chuyển khoản Napas247"
              onClick={() => setActiveMenu(activeMenu === 'qr' ? null : 'qr')}
              className={`p-2 rounded-xl transition cursor-pointer ${
                activeMenu === 'qr'
                  ? 'bg-orange-50 text-fpt-orange'
                  : 'hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>

          {/* Input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={`Nhập tin nhắn trao đổi với ${partnerFirstName}...`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-4 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-fpt-orange transition"
            />
            <button
              type="button"
              title="Biểu tượng cảm xúc"
              onClick={() => setActiveMenu(activeMenu === 'emoji' ? null : 'emoji')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 transition cursor-pointer ${
                activeMenu === 'emoji' ? 'text-fpt-orange' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Smile className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="rounded-xl bg-fpt-orange px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-fpt-orange-hover transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer shrink-0"
          >
            <span>Gửi</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Encryption Notice */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Tin nhắn được mã hóa qua hạ tầng sinh viên FPT Edu
          </span>
          <span>
            Nhấn <strong>Enter</strong> để gửi
          </span>
        </div>
      </div>
    </div>
  );
}
