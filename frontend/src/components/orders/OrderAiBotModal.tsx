'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bot, X, ChevronRight, Send, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { useUserStore } from '@/stores/userStore';

interface OrderAiBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

interface MessageItem {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

export default function OrderAiBotModal({
  isOpen,
  onClose,
  onShowToast,
}: OrderAiBotModalProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Xin chào bạn! Mình là Trợ lý AI Trọng tài Escrow FPT. Mình có thể giải đáp các cách mua hàng, hướng dẫn nhận hàng an toàn, và hỗ trợ quy trình khiếu nại - khóa ví Escrow - trả hàng hoàn tiền 48h.',
      time: 'Vừa xong',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userCampus = useUserStore((state) => state.user.campus) || 'Hòa Lạc';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (queryText?: string) => {
    const text = (queryText || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await aiService.assistantChat(text, userCampus);
      if (res && res.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: res.reply,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fallback cục bộ
    }

    // Fallback response
    setTimeout(() => {
      let reply = 'Chào bạn! Về đơn hàng của bạn, bạn có thể kiểm tra chi tiết trong mục Đơn hàng hoặc bấm "Khiếu nại & Khóa Escrow" bên dưới.';
      const lower = text.toLowerCase();
      if (lower.includes('cách mua') || lower.includes('mua hàng')) {
        reply = 'Hệ thống hỗ trợ 2 cách mua hàng:\n1. Gặp mặt Safe Handoff (MEETUP): Xác nhận qua mã QR Handshake hoặc OTP 6 số.\n2. Giao hàng Ship COD / Đặt cọc Escrow (SHIP_COD): Giữ tiền trong ví Escrow, có 48h dùng thử test máy an toàn.';
      } else if (lower.includes('trả hàng') || lower.includes('khiếu nại') || lower.includes('hoàn tiền')) {
        reply = 'Quy trình Trả hàng & Khiếu nại:\n1. Trong vòng 48h kể từ khi nhận hàng, bấm "Khiếu nại & Yêu cầu Trả hàng".\n2. Hệ thống lập tức khóa tiền trong ví Escrow.\n3. Bạn gửi video bằng chứng test máy.\n4. Chọn Hoàn tiền 100% (gửi trả đồ tại sảnh thư viện) hoặc Thỏa thuận bồi thường một phần.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 400);
  };

  const quickQuestions = [
    '📦 Có bao nhiêu cách mua hàng trên sàn?',
    '🛡️ Quy trình trả hàng & khiếu nại trong 48h?',
    '🔒 Tiền Escrow được khóa bảo vệ như thế nào?',
    '📍 Vị trí kiện hàng #ORD-88392 hiện tại?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* HEADER */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-400/30">
              <Bot className="h-5 w-5 text-fpt-orange" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold leading-tight">Trợ lý AI Trọng tài Escrow FPT</h3>
                <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold">
                  Gemini 1.5 Flash
                </span>
              </div>
              <p className="text-[10px] text-slate-300">Tư vấn mua hàng, khóa tiền Escrow & giải quyết tranh chấp 24/7</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-slate-700/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QUICK QUESTION CHIPS */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="text-slate-400 font-semibold text-[10px] shrink-0">Hỏi nhanh:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:text-fpt-orange transition cursor-pointer font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        {/* MESSAGES CONTAINER */}
        <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[220px] max-h-[380px] bg-[#FAFAFC] text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-xs whitespace-pre-line leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <span className="inline-block h-2 w-2 rounded-full bg-orange-400 animate-ping"></span>
              <span>Cóc Trọng tài AI đang soạn câu trả lời...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ESCROW DISPUTE ACTION BANNER */}
        <div className="bg-amber-50 border-t border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
            <span className="text-[11px] font-medium">Hàng có lỗi? Mở khiếu nại để khóa tiền ví Escrow tức thì.</span>
          </div>
          <Link
            href="/orders/dispute?code=ORD-88392-HCM-HL"
            onClick={onClose}
            className="rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-rose-700 transition flex items-center gap-1 shrink-0"
          >
            <span>Khiếu nại ngay</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {/* INPUT BAR */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Hỏi AI về cách mua, cách nhận hàng, trả hàng hoặc khiếu nại..."
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-fpt-orange focus:ring-1 focus:ring-fpt-orange"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className="rounded-xl bg-fpt-orange p-2 text-white hover:bg-orange-600 disabled:opacity-50 transition cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
