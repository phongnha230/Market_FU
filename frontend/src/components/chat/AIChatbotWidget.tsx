'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  History,
  Plus,
  MessageSquare,
  Clock,
  Loader2,
  ArrowLeft,
  MapPin,
  Tag,
  Gift,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { aiService } from '@/services/aiService';
import { ProductService } from '@/services/productService';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickLinks?: { label: string; url: string }[];
  suggestedProducts?: any[];
}

interface SessionItem {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  messages?: any[];
}

const CONDITION_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  NEW_100: { label: 'Mới 100%', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  LIKE_NEW_99: { label: 'Like New 99%', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700' },
  USED_GOOD: { label: 'Dùng tốt', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  USED_FAIR: { label: 'Đã dùng', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600' },
};

const CAMPUS_LABELS: Record<string, string> = {
  HOL: 'Hòa Lạc',
  HCM: 'TP.HCM',
  DAD: 'Đà Nẵng',
  QN: 'Quy Nhơn',
  CT: 'Cần Thơ',
};

const CATEGORY_LABELS: Record<string, string> = {
  DORM_ITEM: 'Đồ KTX',
  BOOKS: 'Giáo trình',
  ELECTRONICS: 'Điện tử',
  VEHICLE: 'Xe cộ',
  CLOTHING: 'Thời trang',
  OTHER: 'Khác',
};

function formatSessionTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
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
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [guestQuestionCount, setGuestQuestionCount] = useState<number>(0);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewBadge, setHasNewBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Đọc số câu hỏi guest đã gửi từ localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const count = parseInt(localStorage.getItem('fu_market_aichat_guest_count') || '0', 10);
      setGuestQuestionCount(isNaN(count) ? 0 : count);
    }
  }, []);

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

  // Tải danh sách sessions từ server
  const fetchSessions = useCallback(async () => {
    if (!isLoggedIn) return [];
    setIsLoadingHistory(true);
    try {
      const res = await aiService.getUserSessions({ page: 1, limit: 30 });
      const sessionsList: SessionItem[] = Array.isArray(res)
        ? res
        : res?.sessions || res?.data || [];
      setSessions(sessionsList);
      return sessionsList;
    } catch (e) {
      console.warn('Failed to fetch user chat sessions:', e);
      return [];
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isLoggedIn]);

  // Chọn và chuyển sang một session cũ
  const selectSession = async (sId: string) => {
    if (sId === sessionId) {
      setShowHistory(false);
      return;
    }
    setIsLoadingSession(true);
    try {
      const detail = await aiService.getSessionDetail(sId);
      if (detail?.messages && Array.isArray(detail.messages)) {
        const formatted: ChatMessage[] = detail.messages.map((m: any) => ({
          id: m.id,
          sender: m.senderRole === 'USER' ? 'user' : 'bot',
          text: m.content,
          timestamp: new Date(m.createdAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          suggestedProducts: m.suggestedProducts || [],
          quickLinks:
            m.senderRole === 'USER'
              ? undefined
              : [
                  { label: '🔍 Khám phá chợ đồ cũ', url: '/posts' },
                  { label: '🛡️ Điểm hẹn an toàn campus', url: '/safety' },
                ],
        }));
        const fullMsgs = [INITIAL_MESSAGES[0], ...formatted];
        setMessages(fullMsgs);
        setSessionId(sId);
        saveMessagesToStorage(fullMsgs, sId);
        setShowHistory(false);
      }
    } catch (e) {
      console.error('Failed to load session detail:', e);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // Bắt đầu một phiên chat mới
  const handleNewChat = () => {
    setMessages(INITIAL_MESSAGES);
    setSessionId(null);
    saveMessagesToStorage(INITIAL_MESSAGES, null);
    setShowHistory(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
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
        }
      }

      // Khi đăng nhập, tải danh sách session từ backend để đồng bộ
      if (isLoggedIn) {
        aiService
          .getUserSessions({ page: 1, limit: 30 })
          .then(async (res: any) => {
            const sessionsList: SessionItem[] = Array.isArray(res)
              ? res
              : res?.sessions || res?.data || [];
            setSessions(sessionsList);

            // Nếu có savedSessionId, đồng bộ chi tiết mới nhất từ server
            if (savedSessionId) {
              const detail = await aiService.getSessionDetail(savedSessionId).catch(() => null);
              if (detail?.messages && detail.messages.length > 0) {
                const formatted: ChatMessage[] = detail.messages.map((m: any) => ({
                  id: m.id,
                  sender: m.senderRole === 'USER' ? 'user' : 'bot',
                  text: m.content,
                  timestamp: new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  suggestedProducts: m.suggestedProducts || [],
                  quickLinks:
                    m.senderRole === 'USER'
                      ? undefined
                      : [
                          { label: '🔍 Khám phá chợ đồ cũ', url: '/posts' },
                          { label: '🛡️ Điểm hẹn an toàn campus', url: '/safety' },
                        ],
                }));
                const fullMsgs = [INITIAL_MESSAGES[0], ...formatted];
                setMessages(fullMsgs);
                setSessionId(savedSessionId);
                saveMessagesToStorage(fullMsgs, savedSessionId);
              }
            } else if ((!savedMsgsStr || savedMsgsStr === JSON.stringify(INITIAL_MESSAGES)) && sessionsList.length > 0) {
              // Nếu chưa có tin nhắn ở client và có session trên backend, tự load phiên gần nhất
              const latest = sessionsList[0];
              if (latest?.id) {
                const detail = await aiService.getSessionDetail(latest.id).catch(() => null);
                if (detail?.messages && detail.messages.length > 0) {
                  const formatted: ChatMessage[] = detail.messages.map((m: any) => ({
                    id: m.id,
                    sender: m.senderRole === 'USER' ? 'user' : 'bot',
                    text: m.content,
                    timestamp: new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                    suggestedProducts: m.suggestedProducts || [],
                    quickLinks:
                      m.senderRole === 'USER'
                        ? undefined
                        : [
                            { label: '🔍 Khám phá chợ đồ cũ', url: '/posts' },
                            { label: '🛡️ Điểm hẹn an toàn campus', url: '/safety' },
                          ],
                  }));
                  const fullMsgs = [INITIAL_MESSAGES[0], ...formatted];
                  setMessages(fullMsgs);
                  setSessionId(latest.id);
                  saveMessagesToStorage(fullMsgs, latest.id);
                }
              }
            }
          })
          .catch(() => {});
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
  }, [isOpen, messages, isTyping, showHistory]);

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
    setShowHistory(false);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setSessionId(null);
    saveMessagesToStorage(INITIAL_MESSAGES, null);
    setShowHistory(false);
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
    const isGreeting =
      /\b(hi|hello|alo|hey)\b/i.test(q) ||
      /(^|\s)(chào|ê|hé lô|helo)(\s|$)/i.test(q);
    if (isGreeting) {
      return {
        reply: `Dạ chào Cóc-er! 🐸 Hôm nay bạn đang muốn tìm món đồ gì (giáo trình, laptop, màn hình, xe đạp...) hay cần hỗ trợ thủ tục mua bán tại campus nào nè?`,
        links: [
          { label: 'Xem tin đăng mới nhất', url: '/posts' },
          { label: 'Xem danh mục hot', url: '/#categories' }
        ]
      };
    }

    // Default fallback khi ngoài chuyên môn / không khớp từ khóa
    return {
      reply: `🐸 Dạ Cóc AI là Trợ lý chuyên trách Sàn Đồ Cũ Sinh Viên FPT, mình chỉ hỗ trợ các vấn đề về mua bán đồ cũ, mẹo kiểm tra đồ, thủ tục Safe Handoff, giải đáp Escrow và hướng dẫn điểm hẹn an toàn tại 5 cơ sở trường thôi nè!\n\nNếu bạn cần tìm món đồ gì (giáo trình, đồ phòng trọ, laptop, xe cộ...) hoặc cần hỗ trợ cách đặt cọc/khiếu nại, bạn cứ gõ cho mình nhé!`,
      links: [
        { label: '🔍 Khám phá chợ đồ cũ', url: '/posts' },
        { label: '🛡️ Quy tắc giao dịch & Điểm hẹn', url: '/safety' },
        { label: '📦 Quản lý đơn hàng & Escrow', url: '/orders' }
      ]
    };
  };

  // Helper tìm kiếm sản phẩm thực tế từ hệ thống Market FU cho bot
  const searchLocalProducts = async (
    queryText: string
  ): Promise<{ products: any[]; replyText: string } | null> => {
    try {
      const qNorm = queryText
        .toLowerCase()
        .replace(/gamming/gi, 'gaming')
        .replace(/labtop/gi, 'laptop')
        .replace(/màng hình/gi, 'màn hình')
        .replace(/màn hinh/gi, 'màn hình')
        .replace(/vo phuc/gi, 'võ phục');

      const all = await ProductService.getAllProducts();
      if (!all || all.length === 0) return null;

      const stopWords = ['có', 'nào', 'liên', 'quan', 'đến', 'không', 'món', 'đồ', 'bạn', 'ơi', 'tìm', 'giúp', 'mua', 'bán', 'cho', 'mình', 'cần'];
      const tokens = qNorm
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2 && !stopWords.includes(t));

      if (tokens.length === 0) return null;

      const matched = all.filter((p) => {
        const titleNorm = (p.title || '').toLowerCase();
        const descNorm = (p.description || '').toLowerCase();
        const phrase = tokens.join(' ');
        if (titleNorm.includes(phrase) || descNorm.includes(phrase)) return true;
        return tokens.some((tk) => titleNorm.includes(tk) || descNorm.includes(tk));
      });

      if (matched.length > 0) {
        const formatted = matched.slice(0, 5).map((p) => ({
          id: p.id,
          title: p.title,
          price: p.price,
          condition: p.condition,
          campus: p.campus,
          categoryType: p.category,
          images: Array.isArray(p.images)
            ? p.images.map((img: any) => (typeof img === 'string' ? { imageUrl: img } : img))
            : [],
        }));

        const reply =
          `Chào bạn! Mình đã tìm thấy ${matched.length} món đồ phù hợp trên hệ thống Market FU:\n` +
          matched
            .slice(0, 3)
            .map((p, idx) => `${idx + 1}. **${p.title}** - Giá: ${p.price.toLocaleString('vi-VN')}đ (Campus: ${p.campus})`)
            .join('\n') +
          '\n\nBạn có thể nhấn vào thẻ sản phẩm bên dưới để xem chi tiết và liên hệ người bán nhé!';

        return { products: formatted, replyText: reply };
      }
    } catch (e) {
      console.warn('Local product search failed:', e);
    }
    return null;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    const timeString = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // Kiểm tra giới hạn cho khách chưa đăng nhập: Chỉ được hỏi thử tối đa 1 câu
    const isGuest = !isLoggedIn;
    if (isGuest && guestQuestionCount >= 1) {
      const userMsg: ChatMessage = {
        id: 'user-' + Date.now(),
        sender: 'user',
        text: query,
        timestamp: timeString,
      };
      const lockMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: '🔒 **Bạn đã dùng hết 1 lượt hỏi thử miễn phí.**\n\nVui lòng đăng nhập tài khoản sinh viên FPT để tiếp tục trò chuyện cùng Cóc AI và tra cứu sản phẩm không giới hạn.',
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

    // Ghi nhận lượt hỏi thử của khách vào state và localStorage
    if (isGuest) {
      const nextCount = guestQuestionCount + 1;
      setGuestQuestionCount(nextCount);
      if (typeof window !== 'undefined') {
        localStorage.setItem('fu_market_aichat_guest_count', String(nextCount));
      }
    }

    try {
      const userCampus = useUserStore.getState().user.campus || 'Hòa Lạc';
      const aiRes = await aiService.assistantChat(query, userCampus, sessionId || undefined);
      if (aiRes && aiRes.reply) {
        let finalProducts = aiRes.suggestedProducts || [];
        if (finalProducts.length === 0) {
          const localMatch = await searchLocalProducts(query);
          if (localMatch && localMatch.products.length > 0) {
            finalProducts = localMatch.products;
          }
        }

        const nextSessionId = aiRes.sessionId || sessionId;
        if (nextSessionId) {
          setSessionId(nextSessionId);
        }

        const replyContent = isGuest
          ? `${aiRes.reply}\n\n🔒 *Bạn vừa dùng hết 1 lượt hỏi thử miễn phí. Hãy đăng nhập tài khoản FPT để tiếp tục trò chuyện không giới hạn và lưu lịch sử nhé!*`
          : aiRes.reply;

        const botMsg: ChatMessage = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: replyContent,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          quickLinks: isGuest
            ? [
                { label: '👉 Đăng nhập để tiếp tục chat', url: `/login?redirect=${encodeURIComponent(pathname || '/')}` },
                { label: '📝 Đăng ký tài khoản', url: `/login?mode=register&redirect=${encodeURIComponent(pathname || '/')}` },
              ]
            : [
                { label: '🔍 Khám phá chợ đồ cũ', url: '/posts' },
                { label: '🛡️ Điểm hẹn an toàn campus', url: '/safety' },
              ],
          suggestedProducts: finalProducts.length > 0 ? finalProducts : undefined,
        };
        const updatedMsgs = [...nextMsgs, botMsg];
        setMessages(updatedMsgs);
        saveMessagesToStorage(updatedMsgs, nextSessionId);
        setIsTyping(false);

        // Làm mới danh sách phiên trò chuyện trên server
        if (isLoggedIn) {
          fetchSessions();
        }
        return;
      }
    } catch (err: any) {
      console.warn('⚠️ [Backend AI Chat failed, falling back to local search]:', err?.message);
    }

    // Fallback thông minh: Thử tìm món đồ tương ứng trong kho hàng của Market FU
    const localMatch = await searchLocalProducts(query);
    let fallbackReply = '';
    let fallbackLinks: any[] | undefined;
    let fallbackProducts: any[] | undefined;

    if (localMatch) {
      fallbackReply = localMatch.replyText;
      fallbackProducts = localMatch.products;
    } else {
      const generated = generateBotReply(query);
      fallbackReply = generated.reply;
      fallbackLinks = generated.links;
    }

    const replyContent = isGuest
      ? `${fallbackReply}\n\n🔒 *Bạn vừa dùng hết 1 lượt hỏi thử miễn phí. Hãy đăng nhập tài khoản FPT để tiếp tục trò chuyện không giới hạn và lưu lịch sử nhé!*`
      : fallbackReply;

    const botMsg: ChatMessage = {
      id: 'bot-' + Date.now(),
      sender: 'bot',
      text: replyContent,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      quickLinks: isGuest
        ? [
            { label: '👉 Đăng nhập để tiếp tục chat', url: `/login?redirect=${encodeURIComponent(pathname || '/')}` },
            { label: '📝 Đăng ký tài khoản', url: `/login?mode=register&redirect=${encodeURIComponent(pathname || '/')}` },
          ]
        : fallbackLinks,
      suggestedProducts: fallbackProducts,
    };
    const updatedMsgs = [...nextMsgs, botMsg];
    setMessages(updatedMsgs);
    saveMessagesToStorage(updatedMsgs, sessionId);
    setIsTyping(false);
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
          {showHistory ? (
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-md">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHistory(false)}
                  title="Quay lại hội thoại"
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors active:scale-95"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                    Lịch sử trò chuyện
                    {sessions.length > 0 && (
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-medium">
                        {sessions.length}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-orange-100">Các phiên hỏi đáp đã lưu</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-white/90">
                <button
                  onClick={handleNewChat}
                  title="Tạo đoạn chat mới"
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-full transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Mới</span>
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
          ) : (
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
                {isLoggedIn && (
                  <button
                    onClick={() => {
                      setShowHistory(true);
                      fetchSessions();
                    }}
                    title="Xem lịch sử trò chuyện"
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors active:scale-95"
                  >
                    <History className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleNewChat}
                  title="Tạo đoạn chat mới"
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleReset}
                  title="Làm mới đoạn chat hiện tại"
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
          )}

          {/* Nội dung khi mở Lịch sử trò chuyện */}
          {showHistory ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/70">
              {isLoadingSession && (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                  <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
                  <p className="text-xs text-slate-500 font-medium">Đang tải nội dung đoạn chat...</p>
                </div>
              )}

              {!isLoadingSession && isLoadingHistory && (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                  <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
                  <p className="text-xs text-slate-500 font-medium">Đang tải danh sách lịch sử...</p>
                </div>
              )}

              {!isLoadingSession && !isLoadingHistory && sessions.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 my-auto">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center border border-orange-200">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Chưa có đoạn chat nào</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                      Các cuộc trò chuyện của bạn với Cóc AI sẽ được tự động lưu tại đây.
                    </p>
                  </div>
                  <button
                    onClick={handleNewChat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Bắt đầu trò chuyện</span>
                  </button>
                </div>
              )}

              {!isLoadingSession && !isLoadingHistory && sessions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1 pb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Các phiên gần đây
                    </span>
                    <button
                      onClick={fetchSessions}
                      className="text-[10px] text-orange-600 hover:underline font-medium cursor-pointer"
                    >
                      Làm mới
                    </button>
                  </div>
                  {sessions.map((s) => {
                    const isActive = s.id === sessionId;
                    return (
                      <div
                        key={s.id}
                        onClick={() => selectSession(s.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer text-left group ${
                          isActive
                            ? 'bg-orange-50/90 border-orange-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-orange-200 hover:bg-orange-50/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <MessageSquare
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-orange-500'
                              }`}
                            />
                            <p
                              className={`text-xs font-semibold truncate ${
                                isActive ? 'text-orange-950 font-bold' : 'text-slate-800'
                              }`}
                            >
                              {s.title || 'Đoạn chat'}
                            </p>
                          </div>
                          {isActive && (
                            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                              Đang mở
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-300" />
                            {formatSessionTime(s.updatedAt || s.createdAt)}
                          </span>
                          <span className="text-orange-600 group-hover:translate-x-0.5 transition-transform flex items-center">
                            Xem lại <ChevronRight className="w-3 h-3 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Quick chips (Gợi ý câu hỏi nhanh) */}
              <div className="relative h-[42px] overflow-hidden border-b border-slate-100 bg-slate-50 px-3 py-1.5">
                <div className="overflow-x-auto pb-6 -mb-6 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0 ml-1" />
                  {SUGGESTION_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="shrink-0 text-[11px] font-medium px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-full hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/50 transition-all duration-150 shadow-xs cursor-pointer"
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

                        {/* Danh sách sản phẩm AI gợi ý thực tế từ DB với Cards & Badges đẹp mắt */}
                        {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-orange-950 flex items-center gap-1">
                                <span>📦 Gợi ý món đồ phù hợp ({msg.suggestedProducts.length}):</span>
                              </span>
                              <Link
                                href="/posts"
                                onClick={() => setIsOpen(false)}
                                className="text-[10px] text-orange-600 hover:underline font-semibold"
                              >
                                Xem tất cả →
                              </Link>
                            </div>

                            <div className="flex flex-col gap-2">
                              {msg.suggestedProducts.map((p) => {
                                const conditionInfo = p.condition ? CONDITION_LABELS[p.condition] : null;
                                const campusName = p.campus ? (CAMPUS_LABELS[p.campus] || p.campus) : null;
                                const categoryName = p.categoryType ? (CATEGORY_LABELS[p.categoryType] || p.categoryType) : null;
                                const coverImage =
                                  (typeof p.images?.[0] === 'string'
                                    ? p.images[0]
                                    : p.images?.[0]?.imageUrl) || '/products/keyboard-akko.jpg';

                                return (
                                  <Link
                                    key={p.id}
                                    href={`/posts/${p.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-stretch gap-2.5 p-2 rounded-2xl bg-white hover:bg-orange-50/40 border border-slate-200/80 hover:border-orange-300 hover:shadow-md transition-all duration-200 group text-left"
                                  >
                                    {/* Ảnh sản phẩm kèm Tag Tình trạng */}
                                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative border border-slate-200/80">
                                      <img
                                        src={coverImage}
                                        alt={p.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).src = '/products/keyboard-akko.jpg';
                                        }}
                                      />
                                      {conditionInfo && (
                                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-[1px] text-[8px] text-white font-bold text-center py-0.5 truncate px-0.5">
                                          {conditionInfo.label}
                                        </span>
                                      )}
                                    </div>

                                    {/* Nội dung thông tin món đồ */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                      <div>
                                        <p className="font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-fpt-orange transition-colors">
                                          {p.title}
                                        </p>

                                        {/* Thẻ Campus & Danh mục */}
                                        <div className="flex flex-wrap items-center gap-1 mt-1">
                                          {campusName && (
                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded-md border border-orange-200/60">
                                              <MapPin className="w-2.5 h-2.5 text-orange-500" />
                                              {campusName}
                                            </span>
                                          )}
                                          {categoryName && (
                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                                              <Tag className="w-2.5 h-2.5 text-slate-400" />
                                              {categoryName}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Giá tiền và nút Xem đồ */}
                                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100">
                                        <span className="font-extrabold text-orange-600 text-xs">
                                          {p.price?.toLocaleString('vi-VN')} đ
                                        </span>
                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-600 group-hover:bg-orange-500 group-hover:text-white px-2 py-0.5 rounded-lg transition-colors bg-orange-50">
                                          Xem đồ <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                      </div>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
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

              {/* Ô nhập tin nhắn (Input Bar) hoặc Thẻ yêu cầu Đăng nhập */}
              {!isLoggedIn && guestQuestionCount >= 1 ? (
                <div className="p-3.5 bg-gradient-to-r from-orange-50/90 via-amber-50/90 to-orange-50/90 border-t border-orange-200/80 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-orange-900">
                    <Lock className="w-3.5 h-3.5 text-fpt-orange shrink-0" />
                    <span>Bạn đã dùng hết 1 lượt hỏi thử miễn phí</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Vui lòng đăng nhập tài khoản sinh viên FPT để tiếp tục trò chuyện và tra cứu đồ cũ không giới hạn.
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
                  {/* Nhắc nhở hạn mức 1 câu thử nghiệm cho khách */}
                  {!isLoggedIn && guestQuestionCount === 0 && (
                    <div className="flex items-center justify-between mb-2 text-[10px] text-orange-800 bg-orange-50 border border-orange-200/80 rounded-xl px-2.5 py-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <Gift className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        Hỏi thử: Còn 1 câu miễn phí
                      </span>
                      <Link
                        href={`/login?redirect=${encodeURIComponent(pathname || '/')}`}
                        onClick={handleClose}
                        className="text-orange-600 font-bold hover:underline"
                      >
                        Đăng nhập để chat vô hạn
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-orange-500/30 focus-within:bg-white focus-within:border-orange-400 border border-transparent transition-all">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        !isLoggedIn
                          ? 'Hỏi thử 1 câu (ví dụ: tìm quạt, giáo trình...)'
                          : 'Hỏi Cóc AI về mua bán, campus...'
                      }
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
