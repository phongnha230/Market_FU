'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CompactHeader from '@/components/layout/CompactHeader';
import Footer from '@/components/Footer';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import PinnedProductBar from '@/components/chat/PinnedProductBar';
import MessageHistory from '@/components/chat/MessageHistory';
import ChatInputBar from '@/components/chat/ChatInputBar';
import { useMarket } from '@/context/MarketContext';
import { useUserStore } from '@/stores/userStore';
import KycRegistrationModal from '@/components/modals/KycRegistrationModal';
import { ShieldAlert, MessageSquare } from 'lucide-react';
import { Conversation, ChatMessage, INITIAL_CONVERSATIONS } from '@/types/chat';
import { useChatStore } from '@/stores/chatStore';
import { socketClient } from '@/services/socketClient';

function ChatContent() {
  const searchParams = useSearchParams();
  const sellerParam = searchParams.get('seller');
  const { showToast } = useMarket();

  const currentUser = useUserStore((state) => state.user);
  const isEduEmail = Boolean(
    currentUser.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    currentUser.email?.toLowerCase().endsWith('@fe.edu.vn')
  );
  const isKycVerified = isEduEmail || currentUser.kycStatus === 'approved_student' || currentUser.kycStatus === 'approved_seller';
  const isSeller = currentUser.kycStatus === 'approved_seller' || currentUser.kycRole === 'seller';
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  const chatStore = useChatStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'buy' | 'sell' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTypingOther] = useState(true);

  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);

  // Initialize socket & fetch live conversations
  useEffect(() => {
    chatStore.fetchConversations();
    const cleanup = chatStore.initSocketListeners();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      chatStore.setActiveConversation(selectedConvId);
      chatStore.fetchMessages(selectedConvId);
    }
  }, [selectedConvId]);

  // Đồng bộ hóa danh sách hội thoại từ chatStore (MongoDB & Socket)
  useEffect(() => {
    if (chatStore.conversations) {
      if (chatStore.conversations.length === 0) {
        setConversations([]);
        setSelectedConvId(null);
        return;
      }

      const mapped: Conversation[] = chatStore.conversations.map((c) => {
        const storeMsgs = chatStore.messagesByConversation[c.id] || [];
        const isMeSeller = c.sellerId === (currentUser.id || currentUser.studentId);
        const otherRole: 'buyer' | 'seller' = isMeSeller ? 'buyer' : 'seller';
        const otherRoleLabel = isMeSeller ? 'Khách mua' : 'Người bán';
        return {
          id: c.id,
          name: c.otherUser?.name || 'Sinh viên FPT',
          role: otherRole,
          roleLabel: otherRoleLabel,
          cohortCampus: [c.otherUser?.cohort, c.otherUser?.campus].filter(Boolean).join(' • ') || (c.otherUser?.campus || 'FPT Campus'),
          avatar: c.otherUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          isOnline: c.otherUser?.isOnline ?? true,
          verified: true,
          lastMessage: c.lastMessageText || 'Bắt đầu cuộc trò chuyện',
          time: c.lastMessageAt || 'Vừa xong',
          unreadCount: c.unreadCount || 0,
          productImage: c.product?.imageUrl,
          pinnedProduct: {
            id: c.product?.id || (c as any).productId || (c as any).product_id,
            title: c.product?.title || 'Sản phẩm FPT Market',
            price: c.product?.price || 0,
            conditionBadge: 'Đang mở bán',
            locationNote: c.otherUser?.campus || 'Campus',
            imageUrl: c.product?.imageUrl || '/products/keyboard-akko.jpg',
            suggestedOffer: `${Math.round((c.product?.price || 100000) * 0.9).toLocaleString('vi-VN')} đ`,
          },
          messages: storeMsgs.length > 0
            ? storeMsgs.map((m) => ({
                id: m.id,
                sender: (m.senderId === (currentUser.id || currentUser.studentId) ? 'me' : 'other') as 'me' | 'other',
                text: m.text || '',
                time: m.createdAt,
                offerPrice: m.offerPrice ? `${m.offerPrice.toLocaleString('vi-VN')} đ` : undefined,
              }))
            : [],
        };
      });

      setConversations(mapped);
      if (mapped.length > 0 && (!selectedConvId || !mapped.some((m) => m.id === selectedConvId))) {
        setSelectedConvId(mapped[0].id);
      }
    }
  }, [chatStore.conversations, chatStore.messagesByConversation, currentUser.id, currentUser.studentId]);

  // If query params passed a seller, match or focus
  useEffect(() => {
    if (sellerParam) {
      const match = conversations.find(
        (c) =>
          c.name.toLowerCase().includes(sellerParam.toLowerCase()) ||
          sellerParam.toLowerCase().includes(c.name.toLowerCase())
      );
      if (match) {
        setSelectedConvId(match.id);
      }
    }
  }, [sellerParam, conversations]);

  const activeConv =
    conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const scrollToBottom = () => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop =
        chatMessagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 60);
    return () => clearTimeout(timer);
  }, [selectedConvId, activeConv?.messages]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!isKycVerified) {
      showToast('⚠️ Bạn cần xác thực Thẻ Sinh Viên để mở khóa quyền nhắn tin!', 'warning');
      setIsKycModalOpen(true);
      return;
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text,
      time: timeStr,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: `Bạn: ${text}`,
            time: timeStr,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Gửi qua socket và lưu backend
    chatStore.sendMessage({
      conversationId: activeConv.id,
      text,
      messageType: 'TEXT',
    });

    setInputText('');

    // Simulate auto reply after 1.8 seconds
    setTimeout(() => {
      const autoReplies = [
        'Okie bạn nha! Mình đã note lại lịch.',
        'Nhất trí nhé bạn, có gì tới sảnh alo mình!',
        'Được luôn, mình đang mang đồ theo người đây.',
      ];
      const replyText = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      const replyMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'other',
        text: replyText,
        time: `${now.getHours().toString().padStart(2, '0')}:${(now.getMinutes() + 1).toString().padStart(2, '0')}`,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeConv.id) {
            return {
              ...c,
              lastMessage: `${c.name.split(' ')[0]}: ${replyText}`,
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1800);
  };

  const quickChips = [
    '⚡ Hẹn 17h30 sảnh Alpha nhé!',
    'Mình đến nơi rồi, đang đứng ở Passio',
    'Gửi mình số Zalo tiện liên hệ nhé',
    'Mang kèm củ cáp test đồ nhé bạn',
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 py-4 sm:py-6">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 space-y-3 flex-1 flex flex-col">
        {/* Compact in-container Header like Image 2 */}
        <CompactHeader
          breadcrumbs={[
            { label: 'Tin nhắn & Trao đổi P2P' },
            { label: 'Campus Hòa Lạc (HL)' },
          ]}
          activeTab="chat"
        />

        {/* MAIN CHAT CONTAINER */}
        <main className="flex-1 w-full flex flex-col">
        {/* Unverified KYC Warning Banner */}
        {!isKycVerified && (
          <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <span className="font-extrabold text-amber-950">Chưa xác thực Thẻ Sinh Viên:</span>{' '}
                <span className="text-amber-800">
                  Để phòng ngừa giả mạo và bảo vệ an toàn học đường, bạn cần xác thực Thẻ SV để gửi tin nhắn chat với Người bán.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsKycModalOpen(true)}
              className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer shrink-0 text-center shadow-xs"
            >
              Xác thực Thẻ SV ngay
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden h-[calc(100vh-170px)] min-h-[640px]">
          {/* LEFT COLUMN: INBOX & THREADS (4 COLS) */}
          <ChatSidebar
            conversations={conversations}
            selectedConvId={selectedConvId}
            onSelectConv={(id) => {
              setSelectedConvId(id);
              setConversations((prev) =>
                prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
              );
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterTab={filterTab}
            onFilterChange={setFilterTab}
            onMarkAllRead={() => {
              setConversations((prev) =>
                prev.map((c) => ({ ...c, unreadCount: 0 }))
              );
              showToast('Đã đánh dấu tất cả cuộc trò chuyện là đã đọc.', 'success');
            }}
            onShowToast={(msg) => showToast(msg, 'info')}
            isSeller={isSeller}
          />

          {/* RIGHT COLUMN: ACTIVE CHAT ROOM (8 COLS) */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-0 bg-[#FAFAFC] overflow-hidden">
            {activeConv ? (
              <>
                {/* Header User Bar */}
                <ChatHeader
                  conversation={activeConv}
                  onShowToast={(msg) => showToast(msg, 'info')}
                />

                {/* Pinned Product Bar */}
                <PinnedProductBar
                  product={activeConv.pinnedProduct}
                  partnerName={activeConv.name}
                  onOfferPrice={(offer) => {
                    const numericPrice = parseInt(offer.replace(/[^0-9]/g, ''), 10) || 0;
                    chatStore.sendOfferPrice(activeConv.id, numericPrice);
                    handleSendMessage(`Mình gửi đề nghị thương lượng giá: ${offer}`);
                    showToast(`Đã gửi đề nghị giá ${offer} tới ${activeConv.name}`, 'success');
                  }}
                  onScheduleMeeting={() => {
                    const defaultLocation = 'Sảnh Alpha / Cổng KTX';
                    chatStore.proposeMeetupLocation(activeConv.id, defaultLocation);
                    handleSendMessage('Mình hẹn điểm gặp bàn giao đồ tại Sảnh Alpha hoặc Cổng KTX nhé!');
                    showToast('Đã gửi lời hẹn điểm nhận đồ trực tiếp tại khuôn viên campus.', 'info');
                  }}
                />

                {/* Messages History */}
                <MessageHistory
                  messages={activeConv.messages}
                  partnerName={activeConv.name}
                  partnerAvatar={activeConv.avatar}
                  isTyping={isTypingOther}
                  containerRef={chatMessagesContainerRef}
                />

                {/* Chat Input Bar with Quick Chips */}
                <ChatInputBar
                  inputText={inputText}
                  onInputChange={setInputText}
                  onSendMessage={handleSendMessage}
                  quickChips={quickChips}
                  partnerFirstName={activeConv.name.split(' ').slice(-1)[0]}
                  onShowToast={(msg) => showToast(msg, 'info')}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-fpt-orange mb-4">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Chưa có cuộc trò chuyện nào</h3>
                <p className="text-sm max-w-sm text-slate-500 mb-6">
                  Tìm kiếm món đồ bạn thích trên sàn và bấm &quot;Nhắn tin&quot; với Người bán để thương lượng hoặc hẹn điểm gặp tại campus.
                </p>
                <Link
                  href="/posts"
                  className="rounded-xl bg-fpt-orange px-5 py-2.5 text-xs font-bold text-white hover:bg-fpt-orange-hover transition shadow-xs"
                >
                  Khám phá tin đăng
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>

      {/* Modal KYC Registration */}
      <KycRegistrationModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        defaultRole="student"
        onShowToast={showToast}
      />

      <Footer />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500 font-medium">
          Đang kết nối trung tâm tin nhắn...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
