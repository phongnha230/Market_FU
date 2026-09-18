'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickLinks?: { label: string; url: string }[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'bot',
    text: 'Xin chào Cóc-er! 🐸 Tôi là Cóc AI - Trợ lý thông minh của Sàn Đồ Cũ Sinh Viên FPT (Market FU).\n\nTôi có thể hỗ trợ bạn tìm đồ cũ, hướng dẫn đăng ký bán, kiểm tra điểm hẹn an toàn tại 5 Campus và quy tắc giao dịch!',
    timestamp: 'Vừa xong',
    quickLinks: [
      { label: '🛡️ Quy tắc giao dịch', url: '/guidelines' },
      { label: '📍 Điểm hẹn an toàn', url: '/safety' },
      { label: '🎓 Đăng ký thẻ SV / Bán', url: '/profile' }
    ]
  }
];

const SUGGESTION_CHIPS = [
  'Làm sao để đăng ký bán đồ?',
  'Chưa duyệt thẻ SV có mua được không?',
  'Điểm hẹn Safe Handoff ở Campus?',
  'Hệ thống FPT Coin dùng thế nào?',
  'Làm gì khi nghi ngờ bị lừa đảo?'
];

export default function AIChatbotWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewBadge, setHasNewBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isTyping]);

  // Không hiển thị bot trong trang quản trị admin
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewBadge(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
  };

  // Logic trí tuệ nhân tạo phản hồi tự động theo ngữ cảnh sinh viên FPT
  const generateBotReply = (query: string): { reply: string; links?: { label: string; url: string }[] } => {
    const q = query.toLowerCase();

    // 1. Đăng ký seller / Bán hàng
    if (q.includes('bán') || q.includes('seller') || q.includes('đăng tin') || q.includes('rao vặt')) {
      return {
        reply: `Để đăng ký làm Người bán (Seller) trên Market FU:\n\n1️⃣ Bạn vào mục **Hồ sơ cá nhân**.\n2️⃣ Chọn **Nâng cấp thành Người bán**.\n3️⃣ Tải lên ảnh Thẻ sinh viên FPT (mặt trước) và số CCCD/Căn cước.\n4️⃣ Đội ngũ Admin sẽ xét duyệt trong vòng 2 - 4 giờ.\n\n⚠️ Lưu ý: Khi đã là Seller đã duyệt, bạn mới mở khóa được nút "Đăng tin" và quản lý kho đồ!`,
        links: [
          { label: 'Tới trang Hồ sơ cá nhân', url: '/profile' },
          { label: 'Quy tắc đăng tin kiểm duyệt', url: '/guidelines' }
        ]
      };
    }

    // 2. Thẻ sinh viên / Duyệt tài khoản / Mail edu
    if (q.includes('thẻ sv') || q.includes('thẻ sinh viên') || q.includes('xác thực') || q.includes('kyc') || q.includes('mail edu') || q.includes('chưa duyệt')) {
      return {
        reply: `📢 **Chính sách tài khoản sinh viên FPT:**\n\n• Hiện tại trường FPT đã bỏ hệ thống email @fpt.edu.vn, vì vậy sàn chuyển sang **xác thực bằng Thẻ sinh viên vật lý**.\n• **Chưa xác thực:** Bạn chỉ xem được danh sách tin đăng, KHÔNG thể chat trực tiếp với người bán hay đặt cọc giữ chỗ.\n• **Đã xác thực:** Mở khóa toàn bộ quyền mua sắm, nhận mã giảm giá và tích lũy FPT Coin!`,
        links: [
          { label: 'Gửi thẻ sinh viên xác thực', url: '/profile' },
          { label: 'Chính sách bảo mật thẻ', url: '/safety' }
        ]
      };
    }

    // 3. Safe Handoff / Điểm hẹn Campus
    if (q.includes('hẹn') || q.includes('handoff') || q.includes('campus') || q.includes('địa điểm') || q.includes('hòa lạc') || q.includes('quận 9') || q.includes('đà nẵng') || q.includes('cần thơ') || q.includes('quy nhơn')) {
      return {
        reply: `📍 **Điểm hẹn giao dịch an toàn (Safe Handoff Points):**\n\n• **Hà Nội (Hòa Lạc):** Sảnh Tòa Alpha, Bàn chờ Thư viện Beta, Căn tin Tòa Gamma.\n• **TP.HCM (Quận 9):** Sảnh lớn Tòa A, Khu vực ghế đá Canteen trung tâm.\n• **Đà Nẵng:** Sảnh chính F-Complex, Khu vực Thư viện Tầng 2.\n• **Cần Thơ & Quy Nhơn:** Sảnh lễ tân hành chính, Quầy bảo vệ cổng chính.\n\n🛡️ *Tất cả các vị trí trên đều có camera an ninh và bảo vệ 24/7, tuyệt đối an toàn cho sinh viên!*`,
        links: [
          { label: 'Bản đồ Safe Handoff chi tiết', url: '/safety' }
        ]
      };
    }

    // 4. Coin / Tích điểm / Nạp tiền
    if (q.includes('coin') || q.includes('tiền') || q.includes('nạp') || q.includes('tích điểm') || q.includes('ví')) {
      return {
        reply: `🪙 **Hệ thống FPT Coin & Ưu đãi sinh viên:**\n\n• Quy đổi: **1 FPT Coin = 1.000 VNĐ**.\n• **Cách nhận Coin:** Nhận thưởng khi hoàn tất đơn hàng đầu tiên, đánh giá người bán uy tín hoặc nạp trực tiếp qua ví MoMo/Ngân hàng.\n• **Tác dụng:** Dùng Coin để khấu trừ khi cọc giữ đồ, đổi Voucher giảm giá hoặc Người bán dùng để ghim bài viết lên đầu trang!`,
        links: [
          { label: 'Kiểm tra Ví Coin trong Hồ sơ', url: '/profile' },
          { label: 'Đổi Voucher bằng Coin', url: '/vouchers' }
        ]
      };
    }

    // 5. Lừa đảo / Báo cáo / Đặt cọc / Escrow
    if (q.includes('lừa đảo') || q.includes('cọc') || q.includes('escrow') || q.includes('an toàn') || q.includes('khiếu nại') || q.includes('bảo vệ')) {
      return {
        reply: `🛡️ **Bảo vệ quyền lợi & Chống lừa đảo:**\n\n1️⃣ **Giữ tiền cọc trung gian (Escrow):** Khi cọc tiền, tiền được sàn giữ an toàn, người bán chỉ nhận được tiền sau khi bạn xác nhận đã nhận đúng đồ.\n2️⃣ **Giao dịch trực tiếp:** Ưu tiên hẹn tại khuôn viên trường (Safe Handoff).\n3️⃣ **Không chuyển khoản ngoài:** Cảnh giác tuyệt đối với người bán yêu cầu chuyển cọc qua Zalo/TK riêng.\n4️⃣ Nếu gặp vấn đề, bấm **Khiếu nại / Báo cáo** ngay trong trang đơn hàng!`,
        links: [
          { label: 'Quy tắc giao dịch FPT Market', url: '/guidelines' },
          { label: 'Xem trung tâm an toàn', url: '/safety' }
        ]
      };
    }

    // 6. Chào hỏi
    if (q.includes('chào') || q.includes('hi') || q.includes('hello') || q.includes('ê') || q.includes('alo')) {
      return {
        reply: `Dạ chào Cóc-er! 🐸 Hôm nay bạn đang muốn tìm món đồ gì (giáo trình, laptop, màn hình, xe đạp...) hay cần hỗ trợ thủ tục mua bán tại campus nào nè?`,
        links: [
          { label: 'Xem tin đăng mới nhất', url: '/posts' },
          { label: 'Xem danh mục hot', url: '/#categories' }
        ]
      };
    }

    // Default fallback
    return {
      reply: `Cảm ơn bạn đã hỏi Cóc AI! Về vấn đề "${query}", bạn có thể kiểm tra nhanh các mục hướng dẫn chính thức bên dưới hoặc gõ các từ khóa như: "bán đồ", "thẻ sinh viên", "safe handoff", "coin", hoặc "quy tắc an toàn".`,
      links: [
        { label: 'Trung tâm trợ giúp & Quy tắc', url: '/guidelines' },
        { label: 'Chính sách an toàn sinh viên', url: '/safety' },
        { label: 'Khám phá chợ đồ cũ', url: '/posts' }
      ]
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: 'Vừa xong'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Giả lập bot phản hồi tự nhiên (600ms)
    setTimeout(() => {
      const { reply, links } = generateBotReply(query);
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: reply,
        timestamp: 'Vừa xong',
        quickLinks: links
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Nút bấm nổi bật (Floating Trigger Button) */}
      {!isOpen && (
        <div className="relative group">
          {/* Tooltip mời gọi */}
          <div className="absolute right-full mr-3 bottom-1/2 translate-y-1/2 hidden md:flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <span>Hỏi Cóc AI 24/7</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <button
            onClick={handleOpen}
            aria-label="Mở Trợ lý Cóc AI"
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 text-white shadow-xl shadow-orange-500/35 hover:scale-105 active:scale-95 transition-all duration-200 hover:shadow-orange-500/50"
          >
            <Bot className="w-7 h-7" />
            
            {/* Vòng sáng nhấp nháy khi có thông báo */}
            {hasNewBadge && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            )}

            {/* Chấm trạng thái online */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      )}

      {/* Cửa sổ Chatbot Popup */}
      {isOpen && (
        <div className="flex flex-col w-[380px] max-w-[calc(100vw-32px)] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-white shadow-inner">
                <Bot className="w-6 h-6" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-orange-500 rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight text-white">Cóc Trợ Lý AI</h3>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-medium">
                    FPT Bot
                  </span>
                </div>
                <p className="text-[11px] text-orange-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  Trực tuyến 24/7 • Giải đáp tức thì
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/90">
              <button
                onClick={handleReset}
                title="Làm mới đoạn chat"
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                title="Đóng hộp chat"
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick chips (Gợi ý câu hỏi nhanh) */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 overflow-x-auto flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 ml-1" />
            {SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 text-[11px] font-medium px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-full hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/50 transition-all duration-150 shadow-xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Lịch sử tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 border border-orange-200">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="flex flex-col max-w-[82%]">
                  <div
                    className={`p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-xs shadow-md shadow-orange-500/15'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}

                    {/* Quick action links nếu bot cung cấp */}
                    {msg.quickLinks && msg.quickLinks.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                        {msg.quickLinks.map((link, lIdx) => (
                          <Link
                            key={lIdx}
                            href={link.url}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center justify-between px-2.5 py-1.5 bg-orange-50/70 hover:bg-orange-100/80 border border-orange-200/60 rounded-xl text-[11px] font-medium text-orange-700 transition-colors"
                          >
                            <span>{link.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-orange-500" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-[10px] text-slate-400 mt-1 px-1 ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Bouncing typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập tin nhắn (Input Bar) */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:bg-white focus-within:border-orange-400 border border-transparent transition-all">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi Cóc AI về mua bán, campus..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="p-1.5 rounded-xl bg-orange-500 text-white disabled:opacity-40 disabled:hover:bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all shadow-xs"
                title="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2 font-light">
              Cóc AI hỗ trợ 24/7 • Chúc Cóc-er mua bán an toàn!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
