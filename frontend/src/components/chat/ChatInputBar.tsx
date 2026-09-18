'use client';

import React from 'react';
import { Camera, MapPin, QrCode, Smile, Send, ShieldCheck } from 'lucide-react';

interface ChatInputBarProps {
  inputText: string;
  onInputChange: (val: string) => void;
  onSendMessage: (text?: string) => void;
  quickChips: string[];
  partnerFirstName: string;
  onShowToast: (msg: string) => void;
}

export default function ChatInputBar({
  inputText,
  onInputChange,
  onSendMessage,
  quickChips,
  partnerFirstName,
  onShowToast,
}: ChatInputBarProps) {
  return (
    <div className="shrink-0 bg-white border-t border-slate-200">
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
              title="Gửi ảnh kiểm tra thiết bị"
              onClick={() => onShowToast('📷 Đã mở thư viện tải ảnh kiểm tra máy.')}
              className="p-2 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition cursor-pointer"
            >
              <Camera className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="Chia sẻ vị trí bàn giao tại Campus"
              onClick={() => {
                onSendMessage(
                  '📍 Mình đang đứng ở sảnh Tòa Alpha, đối diện Passio Coffee nhé!'
                );
              }}
              className="p-2 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition cursor-pointer"
            >
              <MapPin className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="Tạo mã QR chuyển khoản sinh viên"
              onClick={() =>
                onShowToast(
                  '📱 Mã QR Napas247 TPBank của bạn đã được gắn vào hội thoại.'
                )
              }
              className="p-2 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition cursor-pointer"
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>

          {/* Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={`Nhập tin nhắn trao đổi với ${partnerFirstName}...`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-4 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-fpt-orange transition"
            />
            <button
              type="button"
              title="Biểu tượng cảm xúc"
              onClick={() => onInputChange(inputText + ' 😊 ')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
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
