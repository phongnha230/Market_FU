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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChatDetailTopBar } from '../components/ChatDetailTopBar';
import { ChatDetailProductCard } from '../components/ChatDetailProductCard';
import { ChatDetailMessageItem, MessageItem } from '../components/ChatDetailMessageItem';
import { ChatDetailInputBar } from '../components/ChatDetailInputBar';
import { chatMobileService } from '../../../services/chatMobileService';
import { socketMobileService } from '../../../services/socketMobileService';
import { useUserStore } from '../../../stores/userStore';
import { useChatStore } from '../../../stores/chatStore';
import { getSafeAvatar } from '../../../lib/imageResolver';
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
  const { user } = useUserStore();
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

  const product = useMemo(
    () =>
      routeProduct || {
        id: 'p1',
        title: 'Món đồ Campus',
        price: '0đ',
        image: require('../../../../assets/products/keyboard-akko.jpg'),
      },
    [routeProduct]
  );

  const initialOffer = route.params?.initialOffer;
  const initialConvId = route.params?.conversationId || route.params?.id;

  const [conversationId, setConversationId] = useState<string | null>(initialConvId || null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
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

            const acceptMsg = uniqueRemote.find(
              (m) => m.message?.includes('[OFFER_ACCEPTED]') || m.message?.toLowerCase().includes('đồng ý chốt')
            );
            const hasAccepted = Boolean(acceptMsg);
            const hasRejected = uniqueRemote.some(
              (m) => m.message?.includes('[OFFER_REJECTED]') || m.message?.toLowerCase().includes('từ chối đề xuất')
            );

            // Kiểm tra trạng thái khả dụng của món đồ và hạn 30 phút
            const isProductUnavailable = Boolean((product as any)?.status && (product as any).status !== 'AVAILABLE');
            let isOfferExpired = false;
            if (acceptMsg?.createdAt) {
              const diffMs = Date.now() - new Date(acceptMsg.createdAt).getTime();
              if (diffMs > 30 * 60 * 1000) {
                isOfferExpired = true;
              }
            }

            let defaultOfferStatus: 'pending' | 'accepted' | 'declined' | 'expired' | 'unavailable' = 'pending';
            if (isProductUnavailable) {
              defaultOfferStatus = 'unavailable';
            } else if (isOfferExpired) {
              defaultOfferStatus = 'expired';
            } else if (hasAccepted) {
              defaultOfferStatus = 'accepted';
            } else if (hasRejected) {
              defaultOfferStatus = 'declined';
            }

            const mapped: MessageItem[] = uniqueRemote.map((m) => {
              const isImg = m.messageType === 'IMAGE' || Boolean(m.imageUrl);
              const isOrder = Boolean(m.message?.startsWith('[ORDER_CREATED]'));
              const msgType: any = isOrder
                ? 'order'
                : isImg
                ? 'image'
                : m.messageType === 'OFFER_PRICE'
                ? 'offer'
                : m.messageType === 'MEETUP_LOCATION'
                ? 'safepoint'
                : 'text';
              return {
                id: m.id,
                sender: m.isMe ? 'me' : 'partner',
                type: msgType,
                text: m.message,
                imageUrl: m.imageUrl,
                time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
                offerData: m.offerPrice ? {
                  originalPrice: typeof product.price === 'number' ? product.price : 500000,
                  offeredPrice: m.offerPrice,
                  status: defaultOfferStatus,
                } : undefined,
                safePointData: m.meetupLocation ? {
                  location: m.meetupLocation,
                  timeSlot: 'Hẹn gặp giao dịch',
                } : undefined,
              };
            });

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
              return [...mapped, ...filteredPending];
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
      }

      const isOrder = Boolean(text.startsWith('[ORDER_CREATED]'));
      const isImg = rawMsg.messageType === 'IMAGE' || Boolean(rawMsg.mediaUrl || rawMsg.imageUrl);
      const msgType: any = isOrder
        ? 'order'
        : isImg
        ? 'image'
        : rawMsg.messageType === 'OFFER_PRICE'
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
          originalPrice: typeof product.price === 'number' ? product.price : 500000,
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
    });

    const unsubTyping = socketMobileService.onUserTyping((data) => {
      if (data.conversationId === conversationId && data.userId !== currentUserId) {
        setIsTyping(true);
      }
    });

    const unsubStopTyping = socketMobileService.onUserStopTyping((data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(false);
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
                            originalPrice: typeof product.price === 'number' ? product.price : 500000,
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
    const text = (textToSend || inputTextRef.current).trim();
    if (!text) return;

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
  }, [conversationId]);

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
          .sendMessage(conversationId, acceptText, 'OFFER_PRICE', offeredPrice)
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
      navigation.navigate('Checkout', {
        product: {
          ...product,
          price: offeredPrice,
          priceStr: `${offeredPrice.toLocaleString('vi-VN')}đ`,
        },
        agreedPrice: offeredPrice,
        conversationId,
      });
    },
    [navigation, product, conversationId]
  );

  const handleBookSafePoint = useCallback((safePointLocation?: string) => {
    navigation.navigate('Checkout', {
      product,
      safePoint: safePointLocation,
      conversationId,
    });
  }, [navigation, product, conversationId]);

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
      />
    ),
    [isBuyer, handleAcceptOffer, handleRejectOffer, handleBookSafePoint, handleCheckoutOffer, handleViewOrder]
  );

  const renderQuickReply = useCallback(
    ({ item }: { item: string }) => (
      <QuickReplyChip text={item} onSend={handleSendMessage} />
    ),
    [handleSendMessage]
  );

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

      <ChatDetailProductCard
        product={product}
        onViewProduct={() => navigation.navigate('ProductDetail', { productId: product.id })}
      />

      {isTyping && (
        <View style={styles.typingNotice}>
          <Text style={styles.typingText}>{partner.name} đang soạn tin nhắn...</Text>
        </View>
      )}

      {/* Messages List */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
          insetsBottom={insets.bottom}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  messagesList: { paddingHorizontal: 16, paddingVertical: 14 },
  typingNotice: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
  },
  typingText: {
    fontSize: 11,
    color: '#2563EB',
    fontStyle: 'italic',
  },
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
