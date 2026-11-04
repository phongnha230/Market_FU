import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Keyboard,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChatDetailTopBar } from '../components/ChatDetailTopBar';
import { ChatDetailProductCard } from '../components/ChatDetailProductCard';
import { ChatDetailMessageItem, MessageItem } from '../components/ChatDetailMessageItem';
import { ChatDetailInputBar } from '../components/ChatDetailInputBar';
import { chatMobileService } from '../../../services/chatMobileService';
import { productMobileService } from '../../../services/productMobileService';
import { socketMobileService } from '../../../services/socketMobileService';
import { useUserStore } from '../../../stores/userStore';
import { useChatStore } from '../../../stores/chatStore';
import { getSafeAvatar } from '../../../lib/imageResolver';
import { toBackendCampus } from '../../../lib/backendMappers';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const QUICK_REPLIES = [
  'Sản phẩm còn không bạn?',
  'Có fix thêm một chút không ạ?',
  'Hẹn sảnh Alpha lúc mấy giờ?',
  'Đã tới trạm Safe-point rồi nhé!',
];

interface QuickReplyChipProps {
  text: string;
  onSend: (text: string) => void;
}

const QuickReplyChip = React.memo<QuickReplyChipProps>(({ text, onSend }) => {
  const handlePress = useCallback(() => {
    onSend(text);
  }, [text, onSend]);

  return (
    <TouchableOpacity style={styles.quickChip} onPress={handlePress} activeOpacity={0.75}>
      <Text style={styles.quickChipText}>{text}</Text>
    </TouchableOpacity>
  );
});

export const ChatDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const flatListRef = useRef<FlatList>(null);
  const { user, isAuthenticated } = useUserStore();
  const isVerified = Boolean(
    isAuthenticated &&
      (user?.isKycVerified || user?.kycStatus === 'APPROVED' || user?.role === 'SELLER') &&
      user?.kycStatus !== 'PENDING' &&
      user?.kycStatus !== 'REJECTED'
  );
  const currentUserId = user?.id || 'me';

  const routePartner = route.params?.partner;
  const routeProduct = route.params?.product;

  const rawPartnerAvatar =
    routePartner?.avatar ||
    routeProduct?.seller?.avatarUrl ||
    routeProduct?.seller?.avatar ||
    routeProduct?.sellerAvatar ||
    '';

  const initialPartnerName = routePartner?.name || routeProduct?.sellerName || 'Người bán FPT';

  const [partner, setPartner] = useState(() => ({
    id: routePartner?.id || routeProduct?.sellerId || 'u-partner',
    name: initialPartnerName,
    avatar: getSafeAvatar(rawPartnerAvatar, initialPartnerName),
    cohort: routePartner?.cohort || routeProduct?.sellerCohort || 'Sinh viên FPT',
    isOnline: routePartner?.isOnline ?? true,
  }));

  useEffect(() => {
    if (routePartner) {
      const pName = routePartner.name || partner.name;
      setPartner((prev) => ({
        ...prev,
        ...routePartner,
        name: pName,
        avatar: getSafeAvatar(routePartner.avatar || prev.avatar, pName),
      }));
    }
  }, [routePartner]);

  const [fetchedProductMeta, setFetchedProductMeta] = useState<any>(null);
  const initialOffer = route.params?.initialOffer;
  const initialConvId = route.params?.conversationId || route.params?.id;
  const [conversationId, setConversationId] = useState<string | null>(initialConvId || null);

  const storedConv = useMemo(() => {
    const cid = conversationId || initialConvId;
    return cid ? useChatStore.getState().getConversationById(cid) : undefined;
  }, [conversationId, initialConvId]);

  // Tự động đồng bộ tên & avatar đối tác từ store/API khi vào phòng chat từ Push Notification
  useEffect(() => {
    const cid = conversationId || initialConvId;
    if (!cid) return;

    const syncPartnerInfo = async () => {
      let conv: any = useChatStore.getState().getConversationById(cid);
      const convPartnerName = conv?.partnerName || conv?.participantName;
      if (!conv || !convPartnerName || convPartnerName === 'Sinh viên FPT') {
        try {
          const list = await chatMobileService.getConversations();
          conv = list.find((c: any) => c.id === cid);
        } catch (_) {}
      }

      const finalPartnerName = conv?.partnerName || conv?.participantName;
      const finalPartnerAvatar = conv?.partnerAvatar || conv?.participantAvatar;
      const finalPartnerId = conv?.partnerId || conv?.participantId;

      if (conv && finalPartnerName) {
        setPartner((prev) => {
          const isPlaceholder =
            !prev.name ||
            prev.name === 'Người bán FPT' ||
            prev.name === 'Người mua FPT' ||
            prev.name === 'Sinh viên FPT' ||
            prev.name === 'u-partner';

          if (isPlaceholder || !routePartner?.name) {
            return {
              ...prev,
              id: finalPartnerId || prev.id,
              name: finalPartnerName,
              avatar: getSafeAvatar(finalPartnerAvatar || prev.avatar, finalPartnerName),
            };
          }
          return prev;
        });

        if (conv.buyerId && currentUserId && currentUserId !== 'me') {
          setIsBuyer(conv.buyerId === currentUserId);
        }
      }
    };

    syncPartnerInfo();
  }, [conversationId, initialConvId, currentUserId, routePartner?.name]);

  const product = useMemo(() => {
    const base = routeProduct || (storedConv && storedConv.productId ? {
      id: storedConv.productId,
      title: storedConv.productTitle || 'Sản phẩm',
      price: typeof storedConv.productPrice === 'number' && storedConv.productPrice > 0
        ? `${storedConv.productPrice.toLocaleString('vi-VN')}đ`
        : 'Thỏa thuận',
      originalPrice: typeof storedConv.productPrice === 'number' && storedConv.productPrice > 0 ? storedConv.productPrice : undefined,
      image: storedConv.productImage,
      campus: storedConv.productCampus,
      sellerCampus: storedConv.productCampus,
    } : null);

    if (!base) {
      return null;
    }

    const mergedCampus = base.campus || base.sellerCampus || fetchedProductMeta?.campus;
    const rawNumPrice =
      typeof base.originalPrice === 'number' && base.originalPrice > 0
        ? base.originalPrice
        : typeof base.price === 'number' && base.price > 0
        ? base.price
        : typeof base.price === 'string'
        ? parseInt(base.price.replace(/[^\d]/g, ''), 10) || fetchedProductMeta?.price || 0
        : fetchedProductMeta?.price || 0;

    return {
      ...base,
      campus: mergedCampus,
      sellerCampus: base.sellerCampus || mergedCampus,
      originalPrice: rawNumPrice > 0 ? rawNumPrice : undefined,
      sellerName: base.sellerName || fetchedProductMeta?.sellerName || partner.name,
      sellerCohort: base.sellerCohort || fetchedProductMeta?.sellerCohort || partner.cohort,
      sellerId: base.sellerId || fetchedProductMeta?.sellerId || partner.id,
    };
  }, [routeProduct, storedConv, fetchedProductMeta, partner.name, partner.cohort, partner.id]);

  useEffect(() => {
    const prodId = product?.id || routeProduct?.id;
    if (!prodId) return;
    if (product?.campus && typeof product?.originalPrice === 'number') return;

    let active = true;
    productMobileService
      .getProductById(prodId)
      .then((item) => {
        if (active && item) {
          setFetchedProductMeta(item);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [product?.id, product?.campus, product?.originalPrice, routeProduct?.id]);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 80);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  const [isBuyer, setIsBuyer] = useState<boolean>(() => {
    if (route.params?.isBuyer !== undefined) return Boolean(route.params.isBuyer);
    if (route.params?.initialOffer) return true;
    const prodSellerId = routeProduct?.sellerId || routeProduct?.seller?.id || routeProduct?.userId;
    if (prodSellerId && currentUserId && currentUserId !== 'me') {
      return prodSellerId !== currentUserId;
    }
    return true;
  });
  const inputTextRef = useRef(inputText);
  const initialOfferUiHandledRef = useRef(false);
  const initialOfferApiHandledRef = useRef(false);

  useEffect(() => {
    inputTextRef.current = inputText;
  }, [inputText]);

  // 1. Khởi tạo / Lấy conversationId và tin nhắn thực tế từ Backend
  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
      let activeConvId = conversationId;

      if (!activeConvId && product?.id) {
        try {
          const convRes = await chatMobileService.createOrGetConversationDetails(product.id);
          activeConvId = convRes.conversationId;
          if (isMounted && activeConvId) {
            setConversationId(activeConvId);
          }
          if (isMounted && convRes.conversation) {
            const cBuyerId = convRes.conversation.buyerId;
            const cSellerId = convRes.conversation.sellerId;
            if (cBuyerId && currentUserId) {
              setIsBuyer(cBuyerId === currentUserId);
            } else if (cSellerId && currentUserId) {
              setIsBuyer(cSellerId !== currentUserId);
            }
          }
          if (isMounted && convRes.partner) {
            const p = convRes.partner;
            const pAvatar = p.profile?.avatarUrl || p.avatarUrl || p.avatar;
            const pName = p.profile?.fullName || p.name;
            const pCohort = p.profile?.major || p.cohort;
            setPartner((prev) => {
              const finalName = pName || prev.name;
              return {
                ...prev,
                name: finalName,
                avatar: getSafeAvatar(pAvatar, finalName),
                cohort: pCohort || prev.cohort,
              };
            });
          }
        } catch (e: any) {
          console.log('⚠️ [createOrGetConversation info]:', e?.message);
        }
      }

      if (activeConvId) {
        try {
          const remoteMsgs = await chatMobileService.getMessages(activeConvId, currentUserId);
          if (isMounted && remoteMsgs && remoteMsgs.length > 0) {
            // Deduplicate remote messages by ID
            const seenIds = new Set<string>();
            const uniqueRemote = remoteMsgs.filter((m) => {
              if (seenIds.has(m.id)) return false;
              seenIds.add(m.id);
              return true;
            });

            const isProductUnavailable = Boolean((product as any)?.status && (product as any).status !== 'AVAILABLE');

            const mapped = uniqueRemote.map((m, idx) => {
              const text = m.message || '';
              const isAcceptMsg = /\[OFFER_ACCEPTED\]|đồng ý chốt/i.test(text);
              const isRejectMsg = /\[OFFER_REJECTED\]|từ chối đề xuất|chưa phù hợp/i.test(text);

              // Giống Web: Nếu đã có một thẻ đề xuất giá trước đó, thẻ đề xuất đó sẽ tự chuyển sang màu xanh/đỏ.
              // Tin nhắn phản hồi này không cần render thêm một thẻ trùng lặp (tránh hiển thị 2 thẻ chốt giá).
              if (isAcceptMsg || isRejectMsg) {
                const hasPriorOffer = uniqueRemote.slice(0, idx).some((em) => em.messageType === 'OFFER_PRICE' || Boolean(em.offerPrice));
                if (hasPriorOffer) {
                  return null;
                }
              }

              const isImg = m.messageType === 'IMAGE' || Boolean(m.imageUrl);
              const isOrder = Boolean(text.startsWith('[ORDER_CREATED]'));
              const msgType: any = isOrder
                ? 'order'
                : isImg
                ? 'image'
                : (m.messageType === 'OFFER_PRICE' && !isAcceptMsg && !isRejectMsg)
                ? 'offer'
                : m.messageType === 'MEETUP_LOCATION'
                ? 'safepoint'
                : 'text';

              let offerStatus: 'pending' | 'accepted' | 'declined' | 'expired' | 'unavailable' | 'cancelled' = 'pending';
              if (m.offerPrice) {
                const laterMsgs = uniqueRemote.slice(idx + 1);
                const acceptMsg = laterMsgs.find(
                  (lm) => lm.message?.includes('[OFFER_ACCEPTED]') || lm.message?.toLowerCase().includes('đồng ý chốt')
                ) || (m.message?.includes('[OFFER_ACCEPTED]') ? m : undefined);
                const hasAccepted = Boolean(acceptMsg);
                const hasRejected = laterMsgs.some(
                  (lm) => lm.message?.includes('[OFFER_REJECTED]') || lm.message?.toLowerCase().includes('từ chối đề xuất')
                );
                const hasCancelledOrder = laterMsgs.some((lm) => lm.message?.includes('[ORDER_CANCELLED]'));
                let isOfferExpired = false;
                if (acceptMsg?.createdAt) {
                  const diffMs = Date.now() - new Date(acceptMsg.createdAt).getTime();
                  if (diffMs > 30 * 60 * 1000) {
                    isOfferExpired = true;
                  }
                }

                if (isProductUnavailable) {
                  offerStatus = 'unavailable';
                } else if (hasAccepted && (hasCancelledOrder || hasRejected)) {
                  offerStatus = 'cancelled';
                } else if (isOfferExpired) {
                  offerStatus = 'expired';
                } else if (hasAccepted) {
                  offerStatus = 'accepted';
                } else if (hasRejected) {
                  offerStatus = 'declined';
                }
              }

              return {
                id: m.id,
                sender: m.isMe ? 'me' : 'partner',
                type: msgType,
                text: m.message,
                imageUrl: m.imageUrl,
                time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
                offerData: m.offerPrice ? {
                  originalPrice: product.originalPrice || (typeof product.price === 'number' ? product.price : 500000),
                  offeredPrice: m.offerPrice,
                  status: offerStatus,
                } : undefined,
                safePointData: m.meetupLocation ? {
                  location: m.meetupLocation,
                  timeSlot: 'Hẹn gặp giao dịch',
                } : undefined,
              };
            });

            const validMapped = mapped.filter(Boolean) as MessageItem[];

            setMessages((prev) => {
              // Giữ lại các tin nhắn optimistic đang chờ gửi nếu remote chưa có
              const pendingOptimistic = prev.filter(
                (p) => (p.id.startsWith('offer-') || p.id.startsWith('m-')) && !seenIds.has(p.id)
              );
              const filteredPending = pendingOptimistic.filter((opt) => {
                if (opt.type === 'offer') {
                  return !uniqueRemote.some(
                    (r) => r.messageType === 'OFFER_PRICE' && r.offerPrice === opt.offerData?.offeredPrice
                  );
                }
                return true;
              });
              return [...validMapped, ...filteredPending];
            });
          }
        } catch (err: any) {
          console.log('⚠️ [getMessages info]:', err?.message);
        }
      }
    };

    initChat();

    return () => {
      isMounted = false;
    };
  }, [conversationId, product?.id, currentUserId]);

  // 2. Lắng nghe Socket.IO Real-time cho phòng chat này
  useEffect(() => {
    if (!conversationId) return;

    useChatStore.getState().setActiveConversationId(conversationId);
    socketMobileService.joinConversation(conversationId);
    socketMobileService.markMessageRead(conversationId);
    useChatStore.getState().markConversationAsRead(conversationId);

    const unsubMsg = socketMobileService.onReceiveMessage((rawMsg: any) => {
      if (rawMsg?.conversationId && rawMsg.conversationId !== conversationId) return;

      // Đánh dấu đã đọc ngay vì người dùng đang ở trực tiếp trong màn hình chat này
      socketMobileService.markMessageRead(conversationId);
      useChatStore.getState().markConversationAsRead(conversationId);

      const isMe = rawMsg.senderId === currentUserId;
      const text = rawMsg.text || rawMsg.content || rawMsg.message || '';
      const isAccept = text.includes('[OFFER_ACCEPTED]') || text.toLowerCase().includes('đồng ý chốt mức giá');
      const isReject = text.includes('[OFFER_REJECTED]') || text.toLowerCase().includes('từ chối đề xuất') || text.toLowerCase().includes('chưa phù hợp');
      const isCancelOrder = text.includes('[ORDER_CANCELLED]');

      if (isAccept) {
        setMessages((prev) =>
          prev.map((m) =>
            m.type === 'offer' && m.offerData
              ? { ...m, offerData: { ...m.offerData, status: 'accepted' } }
              : m
          )
        );
      } else if (isReject) {
        setMessages((prev) =>
          prev.map((m) =>
            m.type === 'offer' && m.offerData
              ? { ...m, offerData: { ...m.offerData, status: 'declined' } }
              : m
          )
        );
      } else if (isCancelOrder) {
        setMessages((prev) =>
          prev.map((m) =>
            m.type === 'offer' && m.offerData && m.offerData.status === 'accepted'
              ? { ...m, offerData: { ...m.offerData, status: 'cancelled' } }
              : m
          )
        );
      }

      const isOrder = Boolean(text.startsWith('[ORDER_CREATED]'));
      const isImg = rawMsg.messageType === 'IMAGE' || Boolean(rawMsg.mediaUrl || rawMsg.imageUrl);
      const msgType: any = isOrder
        ? 'order'
        : isImg
        ? 'image'
        : (rawMsg.messageType === 'OFFER_PRICE' && !isAccept && !isReject)
        ? 'offer'
        : rawMsg.messageType === 'MEETUP_LOCATION'
        ? 'safepoint'
        : 'text';

      const incoming: MessageItem = {
        id: rawMsg.id || `msg_${Date.now()}`,
        sender: isMe ? 'me' : 'partner',
        type: msgType,
        text,
        imageUrl: rawMsg.mediaUrl || rawMsg.imageUrl,
        time: rawMsg.createdAt ? new Date(rawMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
        offerData: rawMsg.offerPrice ? {
          originalPrice: product.originalPrice || (typeof product.price === 'number' ? product.price : 500000),
          offeredPrice: rawMsg.offerPrice,
          status: 'pending',
        } : undefined,
        safePointData: rawMsg.meetupLocation ? {
          location: rawMsg.meetupLocation,
          timeSlot: 'Hẹn gặp giao dịch',
        } : undefined,
      };

      setMessages((prev) => {
        // Tránh trùng lặp tin nhắn theo ID đã có
        if (prev.some((m) => m.id === incoming.id)) return prev;

        // Nếu tin nhắn là [OFFER_ACCEPTED] hoặc [OFFER_REJECTED] và trong chat đã có thẻ offer trước đó, triệt tiêu bong bóng trùng lặp
        if ((isAccept || isReject) && prev.some((m) => m.type === 'offer')) {
          return prev;
        }

        // Nếu là tin nhắn mặc cả từ chính mình -> Reconcile / thay thế tin nhắn optimistic
        if (isMe && incoming.type === 'offer') {
          const pendingIdx = prev.findIndex(
            (m) =>
              m.type === 'offer' &&
              m.sender === 'me' &&
              (m.id.startsWith('offer-') || m.id.startsWith('pending-'))
          );
          if (pendingIdx !== -1) {
            const next = [...prev];
            next[pendingIdx] = incoming;
            return next;
          }
        }

        // Nếu là tin nhắn text từ chính mình -> Reconcile tin nhắn optimistic có cùng nội dung
        if (isMe && incoming.type === 'text') {
          const pendingIdx = prev.findIndex(
            (m) => m.type === 'text' && m.sender === 'me' && m.id.startsWith('m-') && m.text === incoming.text
          );
          if (pendingIdx !== -1) {
            const next = [...prev];
            next[pendingIdx] = incoming;
            return next;
          }
        }

        // Nếu là tin nhắn điểm hẹn từ chính mình -> Reconcile tin nhắn safepoint optimistic
        if (isMe && incoming.type === 'safepoint') {
          const pendingIdx = prev.findIndex(
            (m) => m.type === 'safepoint' && m.sender === 'me' && m.id.startsWith('safe-')
          );
          if (pendingIdx !== -1) {
            const next = [...prev];
            next[pendingIdx] = incoming;
            return next;
          }
        }

        return [...prev, incoming];
      });

      if (!isMe) {
        setIsTyping(false);
        try {
          Vibration.vibrate(30);
        } catch (_) {}
      }
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const unsubTyping = socketMobileService.onUserTyping((data) => {
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setIsTyping(true);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }
    });

    const unsubStopTyping = socketMobileService.onUserStopTyping((data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(false);
      }
    });

    const unsubMsgUpdated = socketMobileService.onMessageUpdated(({ conversationId: cId, messageId, text: newText }) => {
      if (cId === conversationId) {
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, text: newText } : m)));
      }
    });

    const unsubMsgDeleted = socketMobileService.onMessageDeleted(({ conversationId: cId, messageId }) => {
      if (cId === conversationId) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    });

    // Lắng nghe thêm new_message_notification như một lớp bảo hiểm kép (Double Safety Net)
    const unsubNotification = socketMobileService.onNewMessageNotification((data: any) => {
      if (data?.conversationId === conversationId) {
        socketMobileService.markMessageRead(conversationId);
        useChatStore.getState().markConversationAsRead(conversationId);
        chatMobileService
          .getMessages(conversationId, currentUserId)
          .then((remoteMsgs) => {
            if (remoteMsgs && remoteMsgs.length > 0) {
              setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const newItems: MessageItem[] = [];
                remoteMsgs.forEach((rm: any) => {
                  if (!existingIds.has(rm.id)) {
                    const isMe = rm.isMe || rm.senderId === currentUserId;
                    const text = rm.message || rm.text || '';
                    const isImg = rm.messageType === 'IMAGE' || Boolean(rm.imageUrl);
                    const isOrder = Boolean(text.startsWith('[ORDER_CREATED]'));
                    newItems.push({
                      id: rm.id,
                      sender: isMe ? 'me' : 'partner',
                      type: isOrder
                        ? 'order'
                        : isImg
                        ? 'image'
                        : rm.messageType === 'OFFER_PRICE'
                        ? 'offer'
                        : rm.messageType === 'MEETUP_LOCATION'
                        ? 'safepoint'
                        : 'text',
                      text,
                      imageUrl: rm.imageUrl,
                      time: rm.createdAt
                        ? new Date(rm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Vừa xong',
                      offerData: rm.offerPrice
                        ? {
                            originalPrice: product.originalPrice || (typeof product.price === 'number' ? product.price : 500000),
                            offeredPrice: rm.offerPrice,
                            status: 'pending',
                          }
                        : undefined,
                      safePointData: rm.meetupLocation
                        ? {
                            location: rm.meetupLocation,
                            timeSlot: 'Hẹn gặp giao dịch',
                          }
                        : undefined,
                    });
                  }
                });
                if (newItems.length > 0) {
                  try {
                    Vibration.vibrate(30);
                  } catch (_) {}
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                  return [...prev, ...newItems];
                }
                return prev;
              });
            }
          })
          .catch(() => {});
      }
    });

    return () => {
      useChatStore.getState().setActiveConversationId(null);
      socketMobileService.leaveConversation(conversationId);
      useChatStore.getState().markConversationAsRead(conversationId);
      unsubMsg();
      unsubNotification();
      unsubTyping();
      unsubStopTyping();
      unsubMsgUpdated();
      unsubMsgDeleted();
    };
  }, [conversationId, currentUserId, product.price]);

  // If navigated with initial offer from MakeOfferModal
  useEffect(() => {
    if (!initialOffer) return;

    if (!initialOfferUiHandledRef.current) {
      initialOfferUiHandledRef.current = true;
      const offerMsg: MessageItem = {
        id: 'offer-' + Date.now(),
        sender: 'me',
        type: 'offer',
        text: initialOffer.message || `Đề xuất giá mới: ${initialOffer.offeredPrice.toLocaleString('vi-VN')}đ`,
        time: 'Vừa xong',
        offerData: {
          originalPrice: initialOffer.originalPrice || (typeof product.price === 'number' ? product.price : 500000),
          offeredPrice: initialOffer.offeredPrice || 430000,
          status: 'pending',
        },
      };
      setMessages((prev) => [...prev, offerMsg]);
    }

    if (conversationId && initialOffer.offeredPrice && !initialOfferApiHandledRef.current) {
      initialOfferApiHandledRef.current = true;
      chatMobileService
        .sendOfferPrice(conversationId, initialOffer.offeredPrice, initialOffer.message)
        .then((sentMsg) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id.startsWith('offer-')
                ? {
                    ...m,
                    id: sentMsg.id,
                    text: sentMsg.message || m.text,
                  }
                : m
            )
          );
        })
        .catch((err) => {
          console.log('⚠️ [sendOfferPrice error]:', err?.message);
        });
    }
  }, [initialOffer, conversationId, product.price]);

  const handleSendMessage = useCallback((textToSend?: string) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập bằng tài khoản FPT để gửi tin nhắn.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (!isVerified) {
      Alert.alert(
        'Yêu cầu Xác thực Thẻ Sinh Viên',
        'Theo quy chế an toàn Market FU, chỉ sinh viên FPT đã xác thực thẻ SV mới được nhắn tin trao đổi đồ dùng.\n\nBạn có muốn nộp ảnh thẻ SV để xác thực ngay không?',
        [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Xác thực ngay',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Profile' }),
          },
        ]
      );
      return;
    }

    const text = (textToSend || inputTextRef.current).trim();
    if (!text) return;

    if (editingMessageId) {
      const targetId = editingMessageId;
      setEditingMessageId(null);
      setInputText('');
      setMessages((prev) => prev.map((m) => (m.id === targetId ? { ...m, text } : m)));
      if (conversationId && !targetId.startsWith('m-')) {
        chatMobileService.updateMessage(conversationId, targetId, text).catch(() => {});
      }
      return;
    }

    const optimisticId = 'm-' + Date.now();
    const newMsg: MessageItem = {
      id: optimisticId,
      sender: 'me',
      type: 'text',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    if (conversationId) {
      chatMobileService
        .sendMessage(conversationId, text, 'TEXT')
        .then((sentMsg) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === optimisticId ? { ...m, id: sentMsg.id } : m))
          );
        })
        .catch(() => {});
    }
  }, [conversationId, editingMessageId]);

  const handleMessageAction = useCallback(
    (item: MessageItem) => {
      if (item.sender !== 'me' || item.type === 'offer' || item.type === 'order') return;

      const options: any[] = [];
      if (item.type === 'text' && item.text) {
        options.push({
          text: '✏️ Chỉnh sửa tin nhắn',
          onPress: () => {
            setEditingMessageId(item.id);
            setInputText(item.text || '');
          },
        });
      }
      options.push({
        text: '🗑️ Xóa tin nhắn',
        style: 'destructive',
        onPress: () => {
          setMessages((prev) => prev.filter((m) => m.id !== item.id));
          if (editingMessageId === item.id) {
            setEditingMessageId(null);
            setInputText('');
          }
          if (conversationId && !item.id.startsWith('m-') && !item.id.startsWith('img-')) {
            chatMobileService.deleteMessage(conversationId, item.id).catch(() => {});
          }
        },
      });
      options.push({ text: 'Đóng', style: 'cancel' });

      Alert.alert('Tùy chọn tin nhắn', 'Chọn thao tác với tin nhắn của bạn:', options);
    },
    [conversationId, editingMessageId]
  );

  const handleSendSafePoint = useCallback((location: string) => {
    const newMsg: MessageItem = {
      id: 'safe-' + Date.now(),
      sender: 'me',
      type: 'safepoint',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      safePointData: {
        location,
        timeSlot: 'Hẹn gặp trong 30-45 phút tới',
      },
    };
    setMessages((prev) => [...prev, newMsg]);

    if (conversationId) {
      chatMobileService.sendMessage(conversationId, `Hẹn gặp bạn tại: ${location}`, 'MEETUP_LOCATION', undefined, location).catch(() => {});
    }
  }, [conversationId]);

  const handleAcceptOffer = useCallback(
    (msgId: string) => {
      const targetMsg = messages.find((m) => m.id === msgId);
      const offeredPrice = targetMsg?.offerData?.offeredPrice || 0;
      const formattedPrice = offeredPrice > 0 ? `${offeredPrice.toLocaleString('vi-VN')}đ` : '';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.offerData
            ? { ...m, offerData: { ...m.offerData, status: 'accepted' } }
            : m
        )
      );

      if (conversationId && offeredPrice > 0) {
        const acceptText = `[OFFER_ACCEPTED] Mình đồng ý chốt mức giá ${formattedPrice} nhé! Bạn có thể bấm nút "Đặt mua ngay" bên dưới để tiến hành thanh toán qua sàn FPT.`;
        chatMobileService
          .sendMessage(conversationId, acceptText, 'TEXT')
          .catch(() => {});
      }
      Alert.alert('Thành công', `Bạn đã chấp nhận đề xuất giá ${formattedPrice}!`);
    },
    [conversationId, messages]
  );

  const handleRejectOffer = useCallback(
    (msgId: string) => {
      const targetMsg = messages.find((m) => m.id === msgId);
      const offeredPrice = targetMsg?.offerData?.offeredPrice || 0;
      const formattedPrice = offeredPrice > 0 ? `${offeredPrice.toLocaleString('vi-VN')}đ` : '';

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.offerData
            ? { ...m, offerData: { ...m.offerData, status: 'declined' } }
            : m
        )
      );

      if (conversationId) {
        const rejectText = `[OFFER_REJECTED] Mức giá đề xuất ${formattedPrice} chưa phù hợp bạn nhé. Bạn có thể thương lượng lại hoặc mua theo giá niêm yết nhé!`;
        chatMobileService
          .sendMessage(conversationId, rejectText, 'TEXT')
          .catch(() => {});
      }
      Alert.alert('Thông báo', 'Đã từ chối mức giá đề xuất.');
    },
    [conversationId, messages]
  );

  const handleCheckoutOffer = useCallback(
    (offeredPrice: number) => {
      if (!product || !product.id) {
        Alert.alert('Thông báo', 'Không tìm thấy thông tin sản phẩm để thanh toán.');
        return;
      }
      const sellerCampusCode = toBackendCampus(product.sellerCampus || product.campus);
      const buyerCampusCode = toBackendCampus(user?.campus);
      const isDiffCampus = Boolean(
        product.isDifferentCampus ??
          (sellerCampusCode && buyerCampusCode && sellerCampusCode !== buyerCampusCode)
      );

      navigation.navigate('Checkout', {
        product: {
          ...product,
          originalPrice: product.originalPrice || (typeof product.price === 'number' ? product.price : parseInt(String(product.price || '').replace(/[^\d]/g, ''), 10) || offeredPrice),
          price: offeredPrice,
          priceStr: `${offeredPrice.toLocaleString('vi-VN')}đ`,
          isDifferentCampus: isDiffCampus,
        },
        agreedPrice: offeredPrice,
        isDifferentCampus: isDiffCampus,
        type: isDiffCampus ? 'shipping' : 'meetup',
        conversationId,
      });
    },
    [navigation, product, user?.campus, conversationId]
  );

  const handleBookSafePoint = useCallback((safePointLocation?: string) => {
    if (!product || !product.id) {
      Alert.alert('Thông báo', 'Không tìm thấy thông tin sản phẩm để đặt lịch.');
      return;
    }
    const sellerCampusCode = toBackendCampus(product.sellerCampus || product.campus);
    const buyerCampusCode = toBackendCampus(user?.campus);
    const isDiffCampus = Boolean(
      product.isDifferentCampus ??
        (sellerCampusCode && buyerCampusCode && sellerCampusCode !== buyerCampusCode)
    );

    navigation.navigate('Checkout', {
      product: {
        ...product,
        isDifferentCampus: isDiffCampus,
      },
      isDifferentCampus: isDiffCampus,
      type: isDiffCampus ? 'shipping' : 'meetup',
      safePoint: safePointLocation,
      conversationId,
    });
  }, [navigation, product, user?.campus, conversationId]);

  const handleViewOrder = useCallback((orderCode?: string) => {
    if (orderCode) {
      navigation.navigate('OrderDetail', { orderId: orderCode, product });
    } else {
      navigation.navigate('OrderList');
    }
  }, [navigation, product]);

  const handlePickSafePoint = useCallback(() => {
    Alert.alert(
      '📍 Ghim điểm hẹn Safe-Point',
      'Chọn vị trí bàn giao an toàn có camera & bảo vệ:',
      [
        {
          text: '1. Sảnh Tòa Alpha (Camera 24/7)',
          onPress: () => handleSendSafePoint('Sảnh Tòa Alpha (Trạm Camera 24/7)'),
        },
        {
          text: '2. Sảnh Beta KTX (Có bảo vệ trực)',
          onPress: () => handleSendSafePoint('Sảnh Beta KTX (Có bảo vệ trực)'),
        },
        {
          text: '3. Thư viện Tầng 1 (Khu vực yên tĩnh)',
          onPress: () => handleSendSafePoint('Thư viện Tầng 1 (Bàn tròn trung tâm)'),
        },
        {
          text: '4. Passio Coffee / Canteen Dom',
          onPress: () => handleSendSafePoint('Passio Coffee (Sảnh Canteen Dom)'),
        },
        { text: 'Đóng', style: 'cancel' },
      ]
    );
  }, [handleSendSafePoint]);

  const handleAttachPhoto = useCallback(async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập để gửi ảnh trong cuộc trò chuyện.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (!isVerified) {
      Alert.alert(
        'Yêu cầu Xác thực Thẻ Sinh Viên',
        'Bạn cần xác thực Thẻ Sinh Viên FPT trước khi gửi ảnh.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Xác thực ngay', onPress: () => navigation.navigate('MainTabs', { screen: 'Profile' }) },
        ]
      );
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để gửi ảnh thực tế sản phẩm.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const tempMsg: MessageItem = {
          id: 'img-' + Date.now(),
          sender: 'me',
          type: 'image',
          imageUrl: asset.uri,
          text: 'Đã gửi một ảnh',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, tempMsg]);

        if (conversationId) {
          chatMobileService.sendImageMessage(conversationId, asset.uri).catch((err) => {
            console.log('⚠️ [sendImageMessage error]:', err?.message);
          });
        }
      }
    } catch (err: any) {
      Alert.alert('Lỗi chọn ảnh', err?.message || 'Không thể chọn ảnh từ máy.');
    }
  }, [conversationId]);

  const renderMessageItem = useCallback(
    ({ item }: { item: MessageItem }) => (
      <ChatDetailMessageItem
        item={item}
        isBuyer={isBuyer}
        onAcceptOffer={handleAcceptOffer}
        onRejectOffer={handleRejectOffer}
        onBookSafePoint={handleBookSafePoint}
        onCheckoutOffer={handleCheckoutOffer}
        onViewOrder={handleViewOrder}
        onMessageAction={handleMessageAction}
      />
    ),
    [isBuyer, handleAcceptOffer, handleRejectOffer, handleBookSafePoint, handleCheckoutOffer, handleViewOrder, handleMessageAction]
  );

  const renderQuickReply = useCallback(
    ({ item }: { item: string }) => (
      <QuickReplyChip text={item} onSend={handleSendMessage} />
    ),
    [handleSendMessage]
  );

  const renderTypingFooter = useCallback(() => {
    if (!isTyping) return null;
    return (
      <View style={styles.typingFooter}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>{partner.name} đang soạn tin</Text>
          <View style={styles.typingDotsRow}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
      </View>
    );
  }, [isTyping, partner.name]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      <ChatDetailTopBar
        partner={partner}
        onBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('MainTabs', { screen: 'Chat' });
        }}
        onHome={() => navigation.navigate('MainTabs', { screen: 'Home' })}
      />

      {product && product.id ? (() => {
        const lastAcceptedOffer = [...messages]
          .reverse()
          .find((m) => m.type === 'offer' && m.offerData?.status === 'accepted');
        const origNumeric =
          product.originalPrice ||
          (typeof product.price === 'number'
            ? product.price
            : parseInt(String(product.price || '').replace(/[^\d]/g, ''), 10) || 0);
        const origPriceDisplay =
          origNumeric > 0 ? `${origNumeric.toLocaleString('vi-VN')}đ` : String(product.price || '');
        const activePriceDisplay = lastAcceptedOffer?.offerData?.offeredPrice
          ? `${lastAcceptedOffer.offerData.offeredPrice.toLocaleString('vi-VN')}đ (Đã chốt giá)`
          : origPriceDisplay;

        return (
          <ChatDetailProductCard
            product={{
              ...product,
              price: activePriceDisplay,
            }}
            onViewProduct={() => navigation.navigate('ProductDetail', { productId: product.id })}
          />
        );
      })() : null}

      {/* Messages List & Input */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (insets.top > 0 ? insets.top + 20 : 64) : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={renderTypingFooter}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyMessagesText}>Chưa có tin nhắn nào. Hãy gửi lời chào để bắt đầu giao dịch!</Text>
            </View>
          }
        />

        {/* Quick Replies Bar */}
        <View style={styles.quickRepliesBar}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={QUICK_REPLIES}
            keyExtractor={(item) => item}
            renderItem={renderQuickReply}
            contentContainerStyle={styles.quickRepliesList}
          />
        </View>

        {editingMessageId ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFF7ED',
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderTopWidth: 1,
              borderTopColor: '#FED7AA',
            }}
          >
            <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#EA580C' }}>
              ✏️ Đang chỉnh sửa tin nhắn...
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEditingMessageId(null);
                setInputText('');
              }}
            >
              <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#64748B' }}>Hủy</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!isAuthenticated || !isVerified ? (
          <View style={styles.authLockBanner}>
            <Ionicons name="shield-outline" size={17} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={styles.authLockText} numberOfLines={1}>
              {!isAuthenticated
                ? 'Đăng nhập bằng email FPT để gửi tin nhắn.'
                : 'Cần xác thực Thẻ Sinh Viên FPT để nhắn tin.'}
            </Text>
            <TouchableOpacity
              style={styles.authLockBtn}
              onPress={() => {
                if (!isAuthenticated) navigation.navigate('Login');
                else navigation.navigate('MainTabs', { screen: 'Profile' });
              }}
            >
              <Text style={styles.authLockBtnText}>
                {!isAuthenticated ? 'Đăng nhập' : 'Xác thực SV'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <ChatDetailInputBar
          inputText={inputText}
          onChangeText={(val) => {
            setInputText(val);
            if (conversationId) {
              if (val.length > 0) socketMobileService.sendTyping(conversationId);
              else socketMobileService.sendStopTyping(conversationId);
            }
          }}
          onSend={() => handleSendMessage()}
          onAttachPhoto={handleAttachPhoto}
          onPickSafePoint={handlePickSafePoint}
          insetsBottom={isKeyboardVisible ? 6 : insets.bottom}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  authLockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  authLockText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#9A3412',
  },
  authLockBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
  },
  authLockBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  messagesList: { paddingHorizontal: 16, paddingVertical: 14 },
  typingFooter: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  typingText: {
    fontSize: 11.5,
    color: '#64748B',
    fontStyle: 'italic',
  },
  typingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EA580C',
  },
  typingDot1: { opacity: 0.4 },
  typingDot2: { opacity: 0.7 },
  typingDot3: { opacity: 1 },
  emptyMessages: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyMessagesText: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
  },
  quickRepliesBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  quickRepliesList: { paddingHorizontal: 12, gap: 8 },
  quickChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickChipText: { fontSize: 11.5, color: '#475569', fontWeight: '600' },
});

export default ChatDetailScreen;
