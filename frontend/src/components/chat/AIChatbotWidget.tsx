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
  Lock,
  LogIn,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { aiService } from '@/services/aiService';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickLinks?: { label: string; url: string }[];
  suggestedProducts?: any[];
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
  'Có bao nhiêu cách mua hàng?',
  'Quy trình trả hàng & khiếu nại 48h?',
  'Làm sao để đăng ký bán đồ?',
  'Điểm hẹn Safe Handoff ở Campus?',
  'Hệ thống FPT Coin dùng thế nào?',
];

export default function AIChatbotWidget() {
  const pathname = usePathname();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const user = useUserStore((s) => s.user);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewBadge, setHasNewBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const userKey = isLoggedIn && user?.id ? user.id : 'guest';
  const storageMessagesKey = `fu_market_aichat_messages_${userKey}`;
  const storageSessionKey = `fu_market_aichat_session_${userKey}`;

  // Helper lưu trữ tin nhắn và session id vào localStorage
  const saveMessagesToStorage = (msgs: ChatMessage[], sId?: string | null) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageMessagesKey, JSON.stringify(msgs));
        if (sId !== undefined) {
          if (sId) {
            localStorage.setItem(storageSessionKey, sId);
          } else {
            localStorage.removeItem(storageSessionKey);
          }
        }
      }
    } catch (e) {
      console.error('Failed to save AI chat messages to localStorage', e);
    }
  };

  // Khôi phục tin nhắn khi mở trang hoặc khi đổi user
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedMsgsStr = localStorage.getItem(storageMessagesKey);
      const savedSessionId = localStorage.getItem(storageSessionKey);

      if (savedSessionId) {
        setSessionId(savedSessionId);
      }

      if (savedMsgsStr) {
        const parsed = JSON.parse(savedMsgsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }

      // Nếu chưa có tin nhắn trong localStorage và user đã đăng nhập, thử load session mới nhất từ backend
      if (isLoggedIn) {
        aiService
          .getUserSessions({ page: 1, limit: 1 })
          .then(async (res: any) => {
            const sessionsList = res?.sessions || res?.data || (Array.isArray(res) ? res : []);
            const latestSession = sessionsList[0];
            if (latestSession?.id) {
              const detail = await aiService.getSessionDetail(latestSession.id);
              if (detail?.messages && detail.messages.length > 0) {
                const formatted: ChatMessage[] = detail.messages.map((m: any) => ({
                  id: m.id,
                  sender: m.senderRole === 'USER' ? 'user' : 'bot',
                  text: m.content,
                  timestamp: new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  suggestedProducts: [],
                }));
                const fullMsgs = [INITIAL_MESSAGES[0], ...formatted];
                setMessages(fullMsgs);
                setSessionId(latestSession.id);
                saveMessagesToStorage(fullMsgs, latestSession.id);
              }
            }
          })
          .catch(() => {
            // Không sao nếu backend chưa có session
          });
      }
    } catch {
      // LocalStorage parse error -> fallback
    }
  }, [userKey, isLoggedIn, storageMessagesKey, storageSessionKey]);

  const scrollToBottom = () => {
    const doScroll = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    doScroll();
    setTimeout(doScroll, 60);
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
    setSessionId(null);
    saveMessagesToStorage(INITIAL_MESSAGES, null);
  };

  // Logic trí tuệ nhân tạo phản hồi tự động theo ngữ cảnh sinh viên FPT
  const generateBotReply = (query: string): { reply: string; links?: { label: string; url: string }[] } => {
    const q = query.toLowerCase();

    // 0. Cách mua hàng & Quy trình mua hàng
    if (q.includes('cách mua') || q.includes('quy trình mua') || q.includes('mua hàng') || q.includes('bao nhiêu cách') || q.includes('đặt hàng')) {
      return {
        reply: `Trên sàn Market FU hiện có **2 hình thức mua hàng chính** an toàn cho sinh viên:\n\n1️⃣ **Giao dịch trực tiếp Safe Handoff (MEETUP):**\n• Dành cho sinh viên cùng campus.\n• Hẹn gặp tại điểm an toàn (Sảnh Alpha, Thư viện Beta, Cổng Dom KTX...).\n• Người mua đưa **Mã QR Handshake** hoặc **OTP 6 số** cho người bán quét để xác nhận nhận hàng.\n• Thanh toán: Tiền mặt hoặc VietQR.\n\n2️⃣ **Giao hàng Ship COD / Đặt cọc Escrow (SHIP_COD):**\n• Dành cho mua đồ liên campus hoặc ship tận phòng.\n• Tiền được nạp vào ví trung gian **Escrow của sàn** (khóa an toàn).\n• Người mua có **48 giờ dùng thử (Golden Test Period)** để cắm test máy móc trước khi giải ngân cho người bán!`,
        links: [
          { label: '🛡️ Điểm hẹn an toàn Safe Handoff', url: '/safety' },
          { label: '📦 Quản lý đơn hàng', url: '/orders' }
        ]
      };
    }

    // 0.1 Trả hàng, Khiếu nại, Hoàn tiền Escrow
    if (q.includes('trả hàng') || q.includes('hoàn tiền') || q.includes('khiếu nại') || q.includes('dispute') || q.includes('hỏng') || q.includes('lỗi') || q.includes('nứt')) {
      return {
        reply: `🛡️ **Quy trình Trả hàng & Khiếu nại Escrow:**\n\n1️⃣ **Thời hạn vàng 48 Giờ:** Bạn có 48 giờ sau khi nhận hàng để cắm sạc/test máy.\n2️⃣ **Khóa tiền tức thì:** Vào trang Đơn hàng -> bấm **"Khiếu nại & Trả hàng"**, hệ thống sẽ lập tức **đóng băng tiền trong ví Escrow** (người bán chưa thể nhận).\n3️⃣ **Video bằng chứng:** Tải lên video test lỗi/unboxing.\n4️⃣ **Phương án xử lý:**\n• Hoàn tiền 100%: Gửi lại hàng tại bàn lễ tân Thư viện hoặc điểm Dropoff.\n• Thương lượng bồi thường 20-50% nếu đồ chỉ trầy xước nhẹ.\n• Admin sẽ can thiệp phân xử sau 24h nếu 2 bên không thống nhất!`,
        links: [
          { label: '⚠️ Mở hồ sơ khiếu nại đơn hàng', url: '/orders/dispute?code=ORD-88392-HCM-HL' },
          { label: 'Chính sách bảo vệ người mua', url: '/guidelines' }
        ]
      };
    }

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

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    const timeString = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (!isLoggedIn) {
      const userMsg: ChatMessage = {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: query,
        timestamp: timeString,
      };
      const lockMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: '🔒 **Bạn cần đăng nhập tài khoản sinh viên FPT** để trò chuyện và tra cứu đồ cũ cùng Cóc AI.\n\nViệc này giúp bảo vệ tài nguyên máy chủ và ngăn chặn bot spam.',
        timestamp: timeString,
        quickLinks: [
          { label: '👉 Đăng nhập ngay', url: `/login?redirect=${encodeURIComponent(pathname || '/')}` },
          { label: '📝 Đăng ký tài khoản', url: `/login?mode=register&redirect=${encodeURIComponent(pathname || '/')}` },
        ],
      };
      const nextMsgs = [...messages, userMsg, lockMsg];
      setMessages(nextMsgs);
      saveMessagesToStorage(nextMsgs, sessionId);
      setInputMessage('');
      return;
    }

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: timeString,
    };

    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    saveMessagesToStorage(nextMsgs, sessionId);
    setInputMessage('');
    setIsTyping(true);

    try {
      const userCampus = useUserStore.getState().user.campus || 'Hòa Lạc';
      const aiRes = await aiService.assistantChat(query, userCampus, sessionId || undefined);
      if (aiRes && aiRes.reply) {
        const nextSessionId = aiRes.sessionId || sessionId;
        if (nextSessionId) {
          setSessionId(nextSessionId);
        }
        const botMsg: ChatMessage = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: aiRes.reply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          quickLinks: [
            { label: '🔍 Khám phá chợ đồ cũ', url: '/posts' },
            { label: '🛡️ Điểm hẹn an toàn campus', url: '/safety' },
          ],
          suggestedProducts: aiRes.suggestedProducts,
        };
        const updatedMsgs = [...nextMsgs, botMsg];
        setMessages(updatedMsgs);
        saveMessagesToStorage(updatedMsgs, nextSessionId);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fallback nếu API backend chưa sẵn sàng hoặc offline
    }

    setTimeout(() => {
      const { reply, links } = generateBotReply(query);
      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        quickLinks: links,
      };
      const updatedMsgs = [...nextMsgs, botMsg];
      setMessages(updatedMsgs);
      saveMessagesToStorage(updatedMsgs, sessionId);
      setIsTyping(false);
    }, 400);
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
          <div className="relative h-[42px] overflow-hidden border-b border-slate-100 bg-slate-50 px-3 py-1.5">
            <div className="overflow-x-auto pb-6 -mb-6 flex items-center gap-1.5">
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
          </div>

          {/* Lịch sử tin nhắn */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white text-xs break-words">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex gap-2.5', msg.sender === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5 border border-orange-200">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="flex flex-col max-w-[82%]">
                  <div
                    className={cn(
                      'p-3 rounded-2xl leading-relaxed whitespace-pre-line',
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-xs shadow-md shadow-orange-500/15'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-xs'
                    )}
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

                    {/* Danh sách sản phẩm AI gợi ý thực tế từ DB */}
                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
                        <div className="text-[11px] font-bold text-orange-950 flex items-center gap-1">
                          <span>📦 Gợi ý món đồ phù hợp ({msg.suggestedProducts.length}):</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {msg.suggestedProducts.map((p) => (
                            <Link
                              key={p.id}
                              href={`/posts/${p.id}`}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-2 p-1.5 rounded-xl bg-orange-50/70 hover:bg-orange-100/80 border border-orange-200/60 transition-colors group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0 relative">
                                <img
                                  src={p.images?.[0]?.imageUrl || '/products/keyboard-akko.jpg'}
                                  alt={p.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-800 text-[11px] truncate group-hover:text-fpt-orange">
                                  {p.title}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="font-extrabold text-orange-600">
                                    {p.price?.toLocaleString('vi-VN')} đ
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-500">{p.campus || 'Campus'}</span>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-orange-400 group-hover:text-orange-600 shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span
                    className={cn('text-[10px] text-slate-400 mt-1 px-1', msg.sender === 'user' ? 'text-right' : 'text-left')}
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

          {/* Ô nhập tin nhắn (Input Bar) hoặc Thẻ yêu cầu Đăng nhập */}
          {!isLoggedIn ? (
            <div className="p-3.5 bg-gradient-to-r from-orange-50/90 via-amber-50/90 to-orange-50/90 border-t border-orange-200/80 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-orange-900">
                <Lock className="w-3.5 h-3.5 text-fpt-orange shrink-0" />
                <span>Yêu cầu đăng nhập để nhắn với Cóc AI</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Vui lòng đăng nhập tài khoản sinh viên FPT để hỏi đáp và tìm đồ cũ, tránh spam server.
              </p>
              <div className="flex gap-2 justify-center pt-0.5">
                <Link
                  href={`/login?redirect=${encodeURIComponent(pathname || '/')}`}
                  onClick={handleClose}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-fpt-orange px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-fpt-orange-hover active:scale-95 transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập ngay</span>
                </Link>
                <Link
                  href={`/login?mode=register&redirect=${encodeURIComponent(pathname || '/')}`}
                  onClick={handleClose}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                >
                  <span>Đăng ký</span>
                </Link>
              </div>
            </div>
          ) : (
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
                  className="p-1.5 rounded-xl bg-orange-500 text-white disabled:opacity-40 disabled:hover:bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all shadow-xs cursor-pointer"
                  title="Gửi tin nhắn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-2 font-light">
                Cóc AI hỗ trợ 24/7 • Chúc Cóc-er mua bán an toàn!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
