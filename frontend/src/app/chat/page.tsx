'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CompactHeader from '@/components/layout/CompactHeader';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import PinnedProductBar from '@/components/chat/PinnedProductBar';
import MessageHistory from '@/components/chat/MessageHistory';
import ChatInputBar from '@/components/chat/ChatInputBar';
import { useMarket } from '@/context/MarketContext';
import { useUserStore } from '@/stores/userStore';
import KycRegistrationModal from '@/components/modals/KycRegistrationModal';
import { ShieldAlert, MessageSquare } from 'lucide-react';
import { Conversation, ChatMessage, ProductTicket, INITIAL_CONVERSATIONS } from '@/types/chat';
import { useChatStore } from '@/stores/chatStore';
import { useProductStore } from '@/stores/productStore';
import { socketClient } from '@/services/socketClient';
import { chatService } from '@/services/chatService';
import { formatChatSidebarTime } from '@/lib/adapters';

function resolveAvatar(
  sellerName: string,
  providedAvatar?: string | null,
  currentUser?: { name?: string; avatarUrl?: string }
): string {
  if (
    providedAvatar &&
    !providedAvatar.includes('photo-1535713875002-d1d0cf377fde') &&
    providedAvatar.trim().length > 0
  ) {
    return providedAvatar;
  }

  if (currentUser) {
    const sName = sellerName.toLowerCase().trim();
    const cName = (currentUser.name || '').toLowerCase().trim();
    const isSame =
      sName === cName ||
      (sName.length > 2 && cName.includes(sName)) ||
      (cName.length > 2 && sName.includes(cName)) ||
      (sName.includes('nhã') && cName.includes('nhã'));

    if (isSame && currentUser.avatarUrl && !currentUser.avatarUrl.includes('photo-1535713875002-d1d0cf377fde')) {
      return currentUser.avatarUrl;
    }
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    sellerName
  )}&background=ea580c&color=fff&bold=true&size=200`;
}

function parseAcceptedAt(dateVal?: string | number): number | undefined {
  if (!dateVal) return undefined;
  if (typeof dateVal === 'number') {
    return dateVal > 0 ? dateVal : undefined;
  }
  const parsed = new Date(dateVal).getTime();
  if (!isNaN(parsed) && parsed > 0) {
    return parsed;
  }
  // Fallback nếu dateVal chỉ là định dạng "HH:mm" từ cache cũ (ví dụ: "12:08")
  const timeMatch = String(dateVal).match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    if (d.getTime() > Date.now()) {
      d.setDate(d.getDate() - 1);
    }
    return d.getTime();
  }
  return undefined;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const sellerParam = searchParams.get('seller');
  const productIdParam = searchParams.get('productId') || searchParams.get('postId');
  const sellerAvatarParam = searchParams.get('sellerAvatar') || searchParams.get('avatar');
  const userIdParam = searchParams.get('userId');
  const { showToast } = useMarket();

  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentUser = useUserStore((state) => state.user);
  const isEduEmail = Boolean(
    currentUser.email?.toLowerCase().endsWith('@fpt.edu.vn') ||
    currentUser.email?.toLowerCase().endsWith('@fe.edu.vn')
  );
  const isKycVerified =
    isEduEmail ||
    currentUser.role === 'SELLER' ||
    currentUser.role === 'ADMIN' ||
    currentUser.kycStatus === 'approved_student' ||
    currentUser.kycStatus === 'approved_seller';
  const isSeller =
    currentUser.role === 'SELLER' ||
    currentUser.role === 'ADMIN' ||
    currentUser.kycStatus === 'approved_seller';
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  const chatStore = useChatStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'buy' | 'sell' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isTypingOther, setIsTypingOther] = useState(false);
  const [submittingOfferId, setSubmittingOfferId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [, setLiveTick] = useState(0);

  // Nhịp đồng hồ 1 giây để cập nhật trạng thái hết hạn thỏa thuận giá realtime
  useEffect(() => {
    const timer = setInterval(() => setLiveTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const processedUrlParamRef = useRef<string | null>(null);

  // Initialize socket & fetch live conversations
  useEffect(() => {
    if (isLoggedIn) {
      chatStore.fetchConversations();
      const cleanup = chatStore.initSocketListeners();
      return () => {
        cleanup();
      };
    }
  }, [isLoggedIn]);

  // Tự động tìm phòng chat cũ hoặc tạo phòng mới kèm Ticket mua hàng khi có seller/productId trên URL
  useEffect(() => {
    if (!isLoggedIn) return;
    if (!productIdParam && !sellerParam) return;

    const paramKey = `${productIdParam || ''}-${sellerParam || ''}`;
    if (processedUrlParamRef.current === paramKey) return;
    processedUrlParamRef.current = paramKey;

    // 1. Kiểm tra xem đã có cuộc hội thoại nào với người bán này / sản phẩm này trong chatStore chưa
    const existing = chatStore.conversations.find((c) => {
      if (productIdParam) {
        return c.productId === productIdParam;
      }
      if (sellerParam) {
        return (
          c.otherUser?.name.toLowerCase().includes(sellerParam.toLowerCase().trim()) ||
          sellerParam.toLowerCase().trim().includes(c.otherUser?.name.toLowerCase())
        );
      }
      return false;
    });

    if (existing) {
      setSelectedConvId(existing.id);
      setShowMobileChat(true);
      chatStore.setActiveConversation(existing.id);
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname);
      }
      return;
    }

    // 2. Nếu chưa có: Tạo mới cuộc hội thoại với Ticket hỏi mua sản phẩm
    const localProduct = productIdParam ? useProductStore.getState().getProductById(productIdParam) : null;
    const resolvedName = sellerParam || localProduct?.seller?.name || 'Người bán FPT';
    const resolvedAvatar = resolveAvatar(
      resolvedName,
      sellerAvatarParam || localProduct?.seller?.avatarUrl,
      currentUser
    );
    const resolvedTitle = localProduct?.title || 'Sản phẩm FPT Market';
    const resolvedPrice = localProduct?.price || 250000;
    const resolvedProductImg =
      localProduct?.imageUrl ||
      (localProduct?.images && localProduct.images[0]) ||
      '/products/keyboard-akko.jpg';
    const resolvedCondition = localProduct?.condition || (localProduct?.badges && localProduct.badges[0]) || 'Like New';
    const resolvedLocation = localProduct?.location || 'Campus FPT';
    const resolvedCohortCampus = localProduct?.seller?.cohort || 'FPT Campus';

    const newConvId = `conv-${productIdParam || 'prod'}-${encodeURIComponent(resolvedName)}`;

    const ticket: ProductTicket = {
      id: productIdParam || undefined,
      title: resolvedTitle,
      price: resolvedPrice,
      imageUrl: resolvedProductImg,
      conditionBadge: resolvedCondition,
      location: resolvedLocation,
      sellerName: resolvedName,
    };

    const nowIso = new Date().toISOString();

    const newConv: any = {
      id: newConvId,
      buyerId: currentUser.id || currentUser.studentId || 'buyer',
      sellerId: userIdParam || 'seller',
      productId: productIdParam || '',
      product: {
        id: productIdParam || 'prod-custom',
        title: resolvedTitle,
        price: resolvedPrice,
        imageUrl: resolvedProductImg,
        status: 'AVAILABLE',
      },
      otherUser: {
        id: userIdParam || '',
        name: resolvedName,
        avatarUrl: resolvedAvatar,
        campus: resolvedLocation,
        cohort: resolvedCohortCampus,
        isOnline: true,
      },
      lastMessageText: 'Bắt đầu cuộc trò chuyện',
      lastMessageAt: nowIso,
      unreadCount: 0,
    };

    const actualId = chatStore.addOrUpdateConversation(newConv, []);
    setSelectedConvId(actualId);
    setShowMobileChat(true);
    chatStore.setActiveConversation(actualId);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Đồng bộ phía backend nếu có kết nối
    if (productIdParam) {
      chatService
        .createOrGetConversation(productIdParam, userIdParam || undefined)
        .then(async (res) => {
          if (res?.id && res.id !== actualId) {
            chatStore.replaceConversationId?.(actualId, res.id);
            setSelectedConvId(res.id);
            chatStore.setActiveConversation(res.id);
            await chatStore.fetchConversations();
          }
        })
        .catch(() => {});
    }
  }, [productIdParam, sellerParam, userIdParam, sellerAvatarParam, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && selectedConvId) {
      chatStore.setActiveConversation(selectedConvId);
      chatStore.fetchMessages(selectedConvId);
    }
  }, [selectedConvId, isLoggedIn]);

  // Đồng bộ hóa danh sách hội thoại từ chatStore (MongoDB & Socket & LocalStorage)
  useEffect(() => {
    let mapped: Conversation[] = [];
    if (chatStore.conversations && chatStore.conversations.length > 0) {
      mapped = chatStore.conversations
        // 1. Loại bỏ các cuộc hội thoại rác / thừa không có tin nhắn thực và dữ liệu hỏng
        .filter((c) => {
          const isDummyEmpty =
            (c.otherUser?.name === 'Sinh viên FPT' || !c.otherUser?.name) &&
            (!c.lastMessageText || c.lastMessageText === 'Bắt đầu cuộc trò chuyện');
          return !isDummyEmpty;
        })
        .map((c) => {
          const storeMsgs = chatStore.messagesByConversation[c.id] || [];
          const isMeSeller = c.sellerId === (currentUser.id || currentUser.studentId);
          const otherRole: 'buyer' | 'seller' = isMeSeller ? 'buyer' : 'seller';
          const otherRoleLabel = isMeSeller ? 'Khách mua' : 'Người bán';
          const partnerName = c.otherUser?.name || 'Sinh viên FPT';
          const partnerAvatar = resolveAvatar(partnerName, c.otherUser?.avatarUrl, currentUser);

          return {
            id: c.id,
            name: partnerName,
            role: otherRole,
            roleLabel: otherRoleLabel,
            isMeSeller,
            cohortCampus: [c.otherUser?.cohort, c.otherUser?.campus].filter(Boolean).join(' • ') || (c.otherUser?.campus || 'FPT Campus'),
            avatar: partnerAvatar,
            isOnline: c.otherUser?.isOnline ?? true,
            verified: true,
            lastMessage: c.lastMessageText || 'Bắt đầu cuộc trò chuyện',
            time: formatChatSidebarTime(c.lastMessageAt),
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
              status: (c.product?.status as any) || 'AVAILABLE',
            },
            messages: storeMsgs.length > 0
              ? (() => {
                  const mappedList = storeMsgs.map((m, idx) => {
                    const isAcceptMsg = Boolean(
                      m.text?.includes('[OFFER_ACCEPTED]') ||
                      m.text?.toLowerCase().includes('đồng ý mức giá') ||
                      m.text?.toLowerCase().includes('đồng ý chốt')
                    );
                    const isRejectMsg = Boolean(
                      m.text?.includes('[OFFER_REJECTED]') ||
                      m.text?.toLowerCase().includes('từ chối đề xuất') ||
                      m.text?.toLowerCase().includes('chưa phù hợp')
                    );

                    // Kiểm tra xem tin nhắn này có phải là tin nhắn phản hồi [OFFER_ACCEPTED] hoặc [OFFER_REJECTED]
                    // cho một tin nhắn đề xuất giá đã tồn tại trước đó hay không.
                    // Nếu đã có tin đề xuất trước đó, tin đề xuất đó sẽ tự chuyển thành thẻ xanh/đỏ tương ứng.
                    // Tin nhắn phản hồi này không cần render thêm một thẻ trùng lặp (tránh hiển thị 2 thẻ chốt giá).
                    if (isAcceptMsg || isRejectMsg) {
                      const earlierMsgs = storeMsgs.slice(0, idx);
                      const earlierOffers = earlierMsgs.filter((em) => {
                        const emIsAcceptOrReject = Boolean(
                          em.text?.includes('[OFFER_ACCEPTED]') ||
                          em.text?.includes('[OFFER_REJECTED]') ||
                          em.text?.toLowerCase().includes('đồng ý mức giá') ||
                          em.text?.toLowerCase().includes('đồng ý chốt') ||
                          em.text?.toLowerCase().includes('từ chối đề xuất') ||
                          em.text?.toLowerCase().includes('chưa phù hợp')
                        );
                        return (Boolean(em.offerPrice) || em.messageType === 'OFFER_PRICE') && !emIsAcceptOrReject;
                      });
                      const lastPriorOffer = earlierOffers[earlierOffers.length - 1];
                      if (lastPriorOffer) {
                        return null;
                      }
                    }

                    const hasOfferPrice = Boolean(m.offerPrice || m.messageType === 'OFFER_PRICE');

                    // Kiểm tra xem sau tin nhắn này có phản hồi đồng ý, từ chối hoặc hủy đơn hay không
                    const laterMsgs = storeMsgs.slice(idx + 1);
                    const nextNewOfferIdx = laterMsgs.findIndex((later) => {
                      const laterIsAccept = Boolean(
                        later.text?.includes('[OFFER_ACCEPTED]') ||
                        later.text?.toLowerCase().includes('đồng ý mức giá') ||
                        later.text?.toLowerCase().includes('đồng ý chốt')
                      );
                      return Boolean((later.offerPrice || later.messageType === 'OFFER_PRICE') && !laterIsAccept);
                    });
                    const relevantLaterMsgs = nextNewOfferIdx !== -1 ? laterMsgs.slice(0, nextNewOfferIdx) : laterMsgs;

                    const acceptMsgItem = relevantLaterMsgs.find((later) =>
                      Boolean(
                        later.text?.includes('[OFFER_ACCEPTED]') ||
                        later.text?.toLowerCase().includes('đồng ý mức giá') ||
                        later.text?.toLowerCase().includes('đồng ý chốt')
                      )
                    );
                    const isLaterAccepted = Boolean(acceptMsgItem);
                    const isLaterRejected = relevantLaterMsgs.some((later) =>
                      Boolean(
                        later.text?.includes('[OFFER_REJECTED]') ||
                        later.text?.toLowerCase().includes('từ chối đề xuất') ||
                        later.text?.toLowerCase().includes('chưa phù hợp')
                      )
                    );

                    const isLaterOrderCancelled = laterMsgs.some((later) =>
                      Boolean(later.text?.includes('[ORDER_CANCELLED]'))
                    );
                    const isLaterRejectedAny = laterMsgs.some((later) =>
                      Boolean(
                        later.text?.includes('[OFFER_REJECTED]') ||
                        later.text?.toLowerCase().includes('từ chối đề xuất') ||
                        later.text?.toLowerCase().includes('chưa phù hợp')
                      )
                    );

                    const rawOfferAccepted = hasOfferPrice ? (isLaterAccepted || isAcceptMsg) : isAcceptMsg;
                    // Nếu đơn hàng sau đó bị hủy hoặc có từ chối trả giá mới -> hủy hiệu lực chốt giá để mặt hàng về giá gốc!
                    const isOfferCancelled = Boolean(
                      rawOfferAccepted && (isLaterOrderCancelled || isLaterRejectedAny || nextNewOfferIdx !== -1)
                    );
                    const isOfferAccepted = Boolean(rawOfferAccepted && !isOfferCancelled);
                    const isOfferRejected = Boolean((hasOfferPrice && !isAcceptMsg && isLaterRejected) || isRejectMsg);

                    // Xác định thời điểm chấp nhận deal để tính hạn 30 phút
                    let offerAcceptedAt: number | undefined;
                    if (isOfferAccepted) {
                      const targetMsg = acceptMsgItem || (isAcceptMsg ? m : undefined);
                      offerAcceptedAt = parseAcceptedAt(targetMsg?.createdAt);
                      if (!offerAcceptedAt) {
                        offerAcceptedAt = Date.now();
                      }
                    }

                    const isOfferExpired = Boolean(
                      isOfferAccepted &&
                      offerAcceptedAt &&
                      Date.now() - offerAcceptedAt > 30 * 60 * 1000
                    );

                    // Đảm bảo có mức giá hiển thị nếu tin nhắn có đề xuất
                    let displayPrice = m.offerPrice ? `${m.offerPrice.toLocaleString('vi-VN')} đ` : undefined;
                    let numPrice = m.offerPrice;
                    if (!displayPrice && m.text && hasOfferPrice) {
                      const match = m.text.match(/(\d{1,3}(?:\.\d{3})+|\d+)\s*đ?/);
                      if (match) {
                        const parsed = parseInt(match[1].replace(/\./g, ''), 10);
                        if (!isNaN(parsed) && parsed > 0) {
                          displayPrice = `${parsed.toLocaleString('vi-VN')} đ`;
                          numPrice = parsed;
                        }
                      }
                    }

                    return {
                      id: m.id,
                      sender: (m.senderId === (currentUser.id || currentUser.studentId) ? 'me' : 'other') as 'me' | 'other',
                      text: m.text || '',
                      time: m.createdAt,
                      image: m.mediaUrl || (m as any).image || (m as any).imageUrl,
                      isOfferAccepted,
                      isOfferRejected,
                      isOfferExpired,
                      isOfferCancelled,
                      offerAcceptedAt,
                      offerPrice: displayPrice,
                      numericOfferPrice: numPrice,
                      productTicket: m.productTicket,
                    };
                  });
                  return mappedList.filter(Boolean) as ChatMessage[];
                })()
              : [],
          };
        });
    }

    setConversations(mapped);
    if (mapped.length > 0) {
      if (!selectedConvId || !mapped.some((m) => m.id === selectedConvId)) {
        setSelectedConvId(mapped[0].id);
      }
    }
  }, [chatStore.conversations, chatStore.messagesByConversation, currentUser.id, currentUser.studentId, currentUser.name, currentUser.avatarUrl]);

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

  const handleDeleteConversation = (convId: string) => {
    chatStore.deleteConversation(convId);
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== convId);
      if (selectedConvId === convId) {
        setSelectedConvId(updated[0]?.id || null);
      }
      return updated;
    });
    showToast('🗑️ Đã xóa cuộc trò chuyện.', 'info');
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!isKycVerified) {
      showToast('⚠️ Bạn cần xác thực Thẻ Sinh Viên để mở khóa quyền nhắn tin!', 'warning');
      setIsKycModalOpen(true);
      return;
    }

    // Gửi qua chatStore (tự động cập nhật optimistic UI và truyền realtime qua Socket/REST)
    chatStore.sendMessage({
      conversationId: activeConv.id,
      text,
      messageType: 'TEXT',
    });

    setInputText('');
  };

  const handleSendImage = async (file: File) => {
    if (!activeConv) return;
    if (!isKycVerified) {
      showToast('⚠️ Bạn cần xác thực Thẻ Sinh Viên để mở khóa quyền gửi ảnh!', 'warning');
      setIsKycModalOpen(true);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Optimistic UI update
    const tempId = `temp-img-${Date.now()}`;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          const newMsg: ChatMessage = {
            id: tempId,
            sender: 'me',
            text: 'Đã gửi một ảnh sản phẩm',
            time: timeStr,
            image: previewUrl,
          };
          return {
            ...c,
            lastMessage: 'Bạn: [Hình ảnh]',
            time: timeStr,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    try {
      await chatService.sendMessage(
        activeConv.id,
        {
          type: 'IMAGE',
          text: 'Đã gửi một ảnh sản phẩm',
        },
        file
      );

      // Đồng bộ danh sách tin nhắn từ server (tránh gửi lặp lần 2 qua Socket)
      await chatStore.fetchMessages(activeConv.id);
      showToast('📷 Đã gửi ảnh thành công!', 'success');
    } catch (err: any) {
      console.log('⚠️ [handleSendImage error]:', err?.message);
      chatStore.sendMessage({
        conversationId: activeConv.id,
        messageType: 'IMAGE',
        text: 'Đã gửi một ảnh sản phẩm',
        mediaUrl: previewUrl,
      });
      showToast('📷 Ảnh đã được tải lên và hiển thị trong hội thoại.', 'info');
    }
  };

  const handleAcceptOffer = (msgId: string, offerPrice: number) => {
    if (!activeConv || submittingOfferId === msgId) return;
    setSubmittingOfferId(msgId);
    setTimeout(() => setSubmittingOfferId(null), 1500);

    const formattedPrice = offerPrice > 0 ? `${offerPrice.toLocaleString('vi-VN')} đ` : `${offerPrice} đ`;
    const acceptText = `[OFFER_ACCEPTED] Mình đồng ý chốt mức giá ${formattedPrice} nhé! Bạn có thể bấm nút "Đặt mua ngay" bên dưới để tiến hành thanh toán qua sàn FPT.`;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Cập nhật trạng thái tin nhắn ngay lập tức trong local state để chuyển thẻ vàng thành thẻ xanh chốt giá
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: `Bạn: ${acceptText}`,
            time: timeStr,
            messages: c.messages.map((m) =>
              m.id === msgId || (m.offerPrice && !m.isOfferAccepted && !m.isOfferRejected)
                ? { ...m, isOfferAccepted: true, isOfferRejected: false, offerAcceptedAt: Date.now() }
                : m
            ),
          };
        }
        return c;
      })
    );

    // Gửi đúng 1 tin nhắn qua chatStore (tránh double call)
    chatStore.sendMessage({
      conversationId: activeConv.id,
      text: acceptText,
      messageType: 'TEXT',
      offerPrice,
    });

    showToast(`✅ Đã đồng ý mức giá ${formattedPrice}! Người mua đã nhận được nút đặt hàng theo giá mới.`, 'success');
  };

  const handleRejectOffer = (msgId: string, offerPrice: number) => {
    if (!activeConv || submittingOfferId === msgId) return;
    setSubmittingOfferId(msgId);
    setTimeout(() => setSubmittingOfferId(null), 1500);

    const formattedPrice = offerPrice > 0 ? `${offerPrice.toLocaleString('vi-VN')} đ` : `${offerPrice} đ`;
    const rejectText = `[OFFER_REJECTED] Mức giá ${formattedPrice} chưa phù hợp bạn nhé. Bạn có thể thương lượng lại hoặc mua theo giá niêm yết nhé!`;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Cập nhật trạng thái tin nhắn ngay lập tức trong local state để ẩn nút và chuyển thẻ sang màu đỏ từ chối
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: `Bạn: ${rejectText}`,
            time: timeStr,
            messages: c.messages.map((m) =>
              m.id === msgId || (m.offerPrice && !m.isOfferAccepted && !m.isOfferRejected)
                ? { ...m, isOfferRejected: true, isOfferAccepted: false }
                : m.isOfferAccepted
                ? { ...m, isOfferAccepted: false, isOfferCancelled: true }
                : m
            ),
          };
        }
        return c;
      })
    );

    // Gửi đúng 1 tin nhắn qua chatStore (tránh double call)
    chatStore.sendMessage({
      conversationId: activeConv.id,
      text: rejectText,
      messageType: 'TEXT',
    });

    showToast(`Đã từ chối mức giá đề xuất ${formattedPrice}.`, 'info');
  };

  const handleEditMessage = async (msgId: string, newText: string) => {
    if (!activeConv) return;
    try {
      await chatStore.editMessage(activeConv.id, msgId, newText);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? {
                ...c,
                messages: c.messages.map((m) => (m.id === msgId ? { ...m, text: newText } : m)),
              }
            : c
        )
      );
      showToast('Đã chỉnh sửa tin nhắn.', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể chỉnh sửa tin nhắn này.', 'error');
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!activeConv) return;
    try {
      await chatStore.deleteMessage(activeConv.id, msgId);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? {
                ...c,
                messages: c.messages.filter((m) => m.id !== msgId),
              }
            : c
        )
      );
      showToast('Đã xóa tin nhắn.', 'info');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Không thể xóa tin nhắn này.', 'error');
    }
  };

  const isInterCampusChat = Boolean(
    activeConv?.messages.some(
      (m) =>
        m.text?.includes('[ORDER_SHIPPING_CONFIRMED]') ||
        m.text?.includes('(Giao hàng Ship COD)') ||
        m.text?.includes('(Giao hàng ship COD)') ||
        m.text?.toLowerCase().includes('liên campus') ||
        m.text?.toLowerCase().includes('ghn')
    )
  );

  const quickChips = isInterCampusChat
    ? [
        '📦 Mình đang đóng gói đơn hàng nhé!',
        'Cho mình xin mã vận đơn GHN với ạ',
        'Nhớ bọc chống sốc kỹ giúp mình nhé',
        'Hàng đã bàn giao cho bưu tá chưa bạn?',
      ]
    : [
        '⚡ Hẹn 17h30 sảnh Alpha nhé!',
        'Mình đến nơi rồi, đang đứng ở Passio',
        'Gửi mình số Zalo tiện liên hệ nhé',
        'Mang kèm củ cáp test đồ nhé bạn',
      ];

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 py-4 sm:py-6">
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 space-y-3 flex-1 flex flex-col">
          <CompactHeader
            breadcrumbs={[
              { label: 'Tin nhắn & Trao đổi P2P' },
              { label: 'Campus FPT' },
            ]}
            activeTab="chat"
          />
          <main className="flex-1 w-full flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 min-h-[420px]">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-fpt-orange border-t-transparent" />
              <p className="text-xs font-semibold">Đang tải cuộc trò chuyện...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="h-dvh overflow-hidden bg-[#F8FAFC] flex flex-col font-sans text-slate-800 py-2 sm:py-3">
        <div className="mx-auto w-full max-w-[1440px] px-2 sm:px-4 space-y-2 flex-1 min-h-0 flex flex-col">
          <CompactHeader
            breadcrumbs={[
              { label: 'Tin nhắn & Trao đổi P2P' },
              { label: 'Campus Hòa Lạc (HL)' },
            ]}
            activeTab="chat"
          />
          <main className="flex-1 w-full flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 min-h-[420px]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-fpt-orange mb-4 shadow-2xs">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Bạn chưa đăng nhập</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto text-center mt-2">
              Tính năng nhắn tin, trả giá và trao đổi trực tiếp với người bán / người mua chỉ dành cho tài khoản đã đăng nhập.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-fpt-orange hover:bg-fpt-orange-hover text-white font-bold rounded-xl px-6 h-11 text-sm shadow-xs transition"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden bg-[#F8FAFC] flex flex-col font-sans text-slate-800 py-2 sm:py-3">
      <div className="mx-auto w-full max-w-[1440px] px-2 sm:px-4 space-y-2 flex-1 min-h-0 flex flex-col">
        {/* Compact in-container Header */}
        <CompactHeader
          breadcrumbs={[
            { label: 'Tin nhắn & Trao đổi P2P' },
            { label: 'Campus Hòa Lạc (HL)' },
          ]}
          activeTab="chat"
        />

        {/* MAIN CHAT CONTAINER */}
        <main className="flex-1 min-h-0 w-full flex flex-col">
        {/* Unverified KYC Warning Banner */}
        {!isKycVerified && (
          <div className="mb-2 shrink-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900 shadow-xs">
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

        <div className="flex flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden w-full">
          {/* 1. MÀN HÌNH DI ĐỘNG / TABLET / CỬA SỔ THU NHỎ (< 1024px): CHUẨN ZALO 100% */}
          {isMobile ? (
            !showMobileChat ? (
              /* MÀN HÌNH 1 (Ảnh 2 Zalo): CHỈ HIỂN THỊ DANH SÁCH TIN NHẮN 100% */
              <ChatSidebar
                className="w-full h-full flex flex-col"
                conversations={conversations}
                selectedConvId={selectedConvId}
                onSelectConv={(id) => {
                  setSelectedConvId(id);
                  setShowMobileChat(true);
                  chatStore.setActiveConversation(id);
                  setConversations((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
                  );
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterTab={filterTab}
                onFilterChange={setFilterTab}
                onMarkAllRead={() => {
                  chatStore.markAllAsRead();
                  setConversations((prev) =>
                    prev.map((c) => ({ ...c, unreadCount: 0 }))
                  );
                  showToast('Đã đánh dấu tất cả cuộc trò chuyện là đã đọc.', 'success');
                }}
                onShowToast={(msg) => showToast(msg, 'info')}
                isSeller={isSeller}
                onDeleteConv={handleDeleteConversation}
              />
            ) : (
              /* MÀN HÌNH 2 (Ảnh 3 Zalo): CHỈ HIỂN THỊ KHUNG CHAT CHI TIẾT 100% KÈM NÚT QUAY LẠI */
              <div className="w-full h-full flex flex-col bg-[#FAFAFC] overflow-hidden">
                {activeConv ? (
                  <>
                    <ChatHeader
                      conversation={activeConv}
                      onShowToast={(msg) => showToast(msg, 'info')}
                      onDeleteConv={handleDeleteConversation}
                      onBack={() => setShowMobileChat(false)}
                    />

                    {(() => {
                      const lastOrderCreatedMsg = [...(activeConv?.messages || [])]
                        .reverse()
                        .find((m) => m.text?.includes('[ORDER_CREATED]'));
                      const lastOrderCancelledMsg = [...(activeConv?.messages || [])]
                        .reverse()
                        .find((m) => m.text?.includes('[ORDER_CANCELLED]'));
                      const lastRejectedOfferMsg = [...(activeConv?.messages || [])]
                        .reverse()
                        .find((m) => m.isOfferRejected || m.text?.includes('[OFFER_REJECTED]'));

                      const orderCreatedIdx = lastOrderCreatedMsg ? activeConv.messages.indexOf(lastOrderCreatedMsg) : -1;
                      const orderCancelledIdx = lastOrderCancelledMsg ? activeConv.messages.indexOf(lastOrderCancelledMsg) : -1;
                      const rejectedIdx = lastRejectedOfferMsg ? activeConv.messages.indexOf(lastRejectedOfferMsg) : -1;
                      const hasActiveOrder = orderCreatedIdx !== -1 && orderCreatedIdx > orderCancelledIdx;

                      const lastAcceptedOfferMsg = [...(activeConv?.messages || [])]
                        .reverse()
                        .find((m) => {
                          const isExpiredLive = Boolean(
                            m.isOfferExpired ||
                            (m.offerAcceptedAt && Date.now() - m.offerAcceptedAt > 30 * 60 * 1000)
                          );
                          return m.isOfferAccepted && !isExpiredLive && !m.isOfferCancelled;
                        });
                      const acceptedIdx = lastAcceptedOfferMsg ? activeConv.messages.indexOf(lastAcceptedOfferMsg) : -1;

                      // Nếu đơn hàng đã hủy hoặc có từ chối sau lần chốt giá -> trả mặt hàng về giá gốc niêm yết
                      const isAcceptedDealStillValid =
                        acceptedIdx !== -1 &&
                        acceptedIdx > orderCancelledIdx &&
                        acceptedIdx > rejectedIdx;

                      const activeAgreedPrice = isAcceptedDealStillValid
                        ? lastAcceptedOfferMsg?.numericOfferPrice ||
                          (lastAcceptedOfferMsg?.offerPrice
                            ? parseInt(lastAcceptedOfferMsg.offerPrice.replace(/\D/g, ''), 10)
                            : undefined)
                        : undefined;
                      const activeOrderCode = lastOrderCreatedMsg?.text?.match(/#(ORD-[A-Za-z0-9_-]+)/i)?.[1];
                      const isInterCampusOrder = Boolean(
                        lastOrderCreatedMsg?.text?.toLowerCase().includes('ship cod') ||
                        lastOrderCreatedMsg?.text?.toLowerCase().includes('liên campus') ||
                        isInterCampusChat
                      );

                      return (
                        <PinnedProductBar
                          product={activeConv.pinnedProduct}
                          partnerName={activeConv.name}
                          agreedPrice={activeAgreedPrice}
                          isSeller={activeConv.isMeSeller ?? (activeConv.role === 'buyer')}
                          hasActiveOrder={hasActiveOrder}
                          activeOrderCode={activeOrderCode}
                          isInterCampus={isInterCampusOrder}
                          onOfferPrice={(offer) => {
                            const numericPrice = parseInt(offer.replace(/[^0-9]/g, ''), 10) || 0;
                            chatStore.sendOfferPrice(activeConv.id, numericPrice);
                            showToast(`Đã gửi đề nghị giá ${offer} tới ${activeConv.name}`, 'success');
                          }}
                          onScheduleMeeting={() => {
                            const defaultLocation = 'Sảnh Alpha / Cổng KTX';
                            chatStore.proposeMeetupLocation(activeConv.id, defaultLocation);
                            showToast('Đã gửi lời hẹn điểm nhận đồ trực tiếp tại khuôn viên campus.', 'info');
                          }}
                        />
                      );
                    })()}

                    <MessageHistory
                      messages={activeConv.messages}
                      partnerName={activeConv.name}
                      partnerAvatar={activeConv.avatar}
                      isTyping={isTypingOther}
                      containerRef={chatMessagesContainerRef}
                      productId={activeConv.pinnedProduct?.id}
                      productStatus={activeConv.pinnedProduct?.status}
                      isSeller={activeConv.isMeSeller ?? (activeConv.role === 'buyer')}
                      onAcceptOffer={handleAcceptOffer}
                      onRejectOffer={handleRejectOffer}
                      onEditMessage={handleEditMessage}
                      onDeleteMessage={handleDeleteMessage}
                      onExpireDeal={() => setLiveTick((t) => t + 1)}
                    />

                    <ChatInputBar
                      inputText={inputText}
                      onInputChange={setInputText}
                      onSendMessage={handleSendMessage}
                      onSendImage={handleSendImage}
                      quickChips={quickChips}
                      partnerFirstName={activeConv.name.split(' ').slice(-1)[0]}
                      onShowToast={(msg) => showToast(msg, 'info')}
                    />
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400">
                    <p className="text-sm font-semibold">Chưa chọn cuộc trò chuyện nào</p>
                    <button
                      type="button"
                      onClick={() => setShowMobileChat(false)}
                      className="mt-3 px-4 py-2 bg-fpt-orange text-white rounded-xl text-xs font-bold"
                    >
                      Quay lại danh sách
                    </button>
                  </div>
                )}
              </div>
            )
          ) : (
            /* 2. MÀN HÌNH MÁY TÍNH LỚN (DESKTOP ≥ 1024px): 2 CỘT SONG SONG */
            <>
              {/* LEFT COLUMN: INBOX & THREADS (w-96) */}
              <ChatSidebar
                className="w-96 shrink-0 h-full border-r border-slate-200 flex flex-col"
                conversations={conversations}
                selectedConvId={selectedConvId}
                onSelectConv={(id) => {
                  setSelectedConvId(id);
                  chatStore.setActiveConversation(id);
                  setConversations((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
                  );
                }}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterTab={filterTab}
                onFilterChange={setFilterTab}
                onMarkAllRead={() => {
                  chatStore.markAllAsRead();
                  setConversations((prev) =>
                    prev.map((c) => ({ ...c, unreadCount: 0 }))
                  );
                  showToast('Đã đánh dấu tất cả cuộc trò chuyện là đã đọc.', 'success');
                }}
                onShowToast={(msg) => showToast(msg, 'info')}
                isSeller={isSeller}
                onDeleteConv={handleDeleteConversation}
              />

              {/* RIGHT COLUMN: ACTIVE CHAT ROOM (flex-1) */}
              <div className="flex-1 h-full min-w-0 bg-[#FAFAFC] flex flex-col overflow-hidden">
                {activeConv ? (
                  <>
                    <ChatHeader
                      conversation={activeConv}
                      onShowToast={(msg) => showToast(msg, 'info')}
                      onDeleteConv={handleDeleteConversation}
                    />

                    {(() => {
                      const lastOrderCreatedMsg = [...(activeConv?.messages || [])]
                        .reverse()
                        .find((m) => m.text?.includes('[ORDER_CREATED]'));
                      const lastOrderCancelledMsg = [...(activeConv?.messages || [])]
                        .reverse()
                        .find((m) => m.text?.includes('[ORDER_CANCELLED]'));
                      const lastRejectedOfferMsg = [...(activeConv?.messages || [])]
                        .reverse()
                        .find((m) => m.isOfferRejected || m.text?.includes('[OFFER_REJECTED]'));

                      const orderCreatedIdx = lastOrderCreatedMsg ? activeConv.messages.indexOf(lastOrderCreatedMsg) : -1;
                      const orderCancelledIdx = lastOrderCancelledMsg ? activeConv.messages.indexOf(lastOrderCancelledMsg) : -1;
                      const rejectedIdx = lastRejectedOfferMsg ? activeConv.messages.indexOf(lastRejectedOfferMsg) : -1;
                      const hasActiveOrder = orderCreatedIdx !== -1 && orderCreatedIdx > orderCancelledIdx;

                      const lastAcceptedOfferMsg = [...(activeConv?.messages || [])]
                        .reverse()
                        .find((m) => {
                          const isExpiredLive = Boolean(
                            m.isOfferExpired ||
                            (m.offerAcceptedAt && Date.now() - m.offerAcceptedAt > 30 * 60 * 1000)
                          );
                          return m.isOfferAccepted && !isExpiredLive && !m.isOfferCancelled;
                        });
                      const acceptedIdx = lastAcceptedOfferMsg ? activeConv.messages.indexOf(lastAcceptedOfferMsg) : -1;

                      // Nếu đơn hàng đã hủy hoặc có từ chối sau lần chốt giá -> trả mặt hàng về giá gốc niêm yết
                      const isAcceptedDealStillValid =
                        acceptedIdx !== -1 &&
                        acceptedIdx > orderCancelledIdx &&
                        acceptedIdx > rejectedIdx;

                      const activeAgreedPrice = isAcceptedDealStillValid
                        ? lastAcceptedOfferMsg?.numericOfferPrice ||
                          (lastAcceptedOfferMsg?.offerPrice
                            ? parseInt(lastAcceptedOfferMsg.offerPrice.replace(/\D/g, ''), 10)
                            : undefined)
                        : undefined;
                      const activeOrderCode = lastOrderCreatedMsg?.text?.match(/#(ORD-[A-Za-z0-9_-]+)/i)?.[1];
                      const isInterCampusOrder = Boolean(
                        lastOrderCreatedMsg?.text?.toLowerCase().includes('ship cod') ||
                        lastOrderCreatedMsg?.text?.toLowerCase().includes('liên campus') ||
                        isInterCampusChat
                      );

                      return (
                        <PinnedProductBar
                          product={activeConv.pinnedProduct}
                          partnerName={activeConv.name}
                          agreedPrice={activeAgreedPrice}
                          isSeller={activeConv.isMeSeller ?? (activeConv.role === 'buyer')}
                          hasActiveOrder={hasActiveOrder}
                          activeOrderCode={activeOrderCode}
                          isInterCampus={isInterCampusOrder}
                          onOfferPrice={(offer) => {
                            const numericPrice = parseInt(offer.replace(/[^0-9]/g, ''), 10) || 0;
                            chatStore.sendOfferPrice(activeConv.id, numericPrice);
                            showToast(`Đã gửi đề nghị giá ${offer} tới ${activeConv.name}`, 'success');
                          }}
                          onScheduleMeeting={() => {
                            const defaultLocation = 'Sảnh Alpha / Cổng KTX';
                            chatStore.proposeMeetupLocation(activeConv.id, defaultLocation);
                            showToast('Đã gửi lời hẹn điểm nhận đồ trực tiếp tại khuôn viên campus.', 'info');
                          }}
                        />
                      );
                    })()}

                    <MessageHistory
                      messages={activeConv.messages}
                      partnerName={activeConv.name}
                      partnerAvatar={activeConv.avatar}
                      isTyping={isTypingOther}
                      containerRef={chatMessagesContainerRef}
                      productId={activeConv.pinnedProduct?.id}
                      productStatus={activeConv.pinnedProduct?.status}
                      isSeller={activeConv.isMeSeller ?? (activeConv.role === 'buyer')}
                      onAcceptOffer={handleAcceptOffer}
                      onRejectOffer={handleRejectOffer}
                      onEditMessage={handleEditMessage}
                      onDeleteMessage={handleDeleteMessage}
                      onExpireDeal={() => setLiveTick((t) => t + 1)}
                    />

                    <ChatInputBar
                      inputText={inputText}
                      onInputChange={setInputText}
                      onSendMessage={handleSendMessage}
                      onSendImage={handleSendImage}
                      quickChips={quickChips}
                      partnerFirstName={activeConv.name.split(' ').slice(-1)[0]}
                      onShowToast={(msg) => showToast(msg, 'info')}
                    />
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400">
                    <p className="text-sm font-semibold">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
                  </div>
                )}
              </div>
            </>
          )}
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
