import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCampusStore } from '../../../stores/useCampusStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { AiAssistantTopBar } from '../components/AiAssistantTopBar';
import { AiAssistantQuickPrompts } from '../components/AiAssistantQuickPrompts';
import { AiAssistantMessageItem, ChatMessage } from '../components/AiAssistantMessageItem';
import { SuggestedProductItem } from '../components/AiAssistantProductCard';
import { AiAssistantInputBar } from '../components/AiAssistantInputBar';
import { AiAssistantHistoryModal } from '../components/AiAssistantHistoryModal';
import { aiMobileService, AiSessionItem, resolveAiCampusCode } from '../../../services/aiMobileService';
import { productMobileService } from '../../../services/productMobileService';
import { chatMobileService } from '../../../services/chatMobileService';
import { CameraSubsystemModal } from '../../../components/camera/CameraSubsystemModal';
import { resolveProductImage } from '../../../lib/imageResolver';
import { fromBackendCategory } from '../../../lib/backendMappers';

export type { ChatMessage, SuggestedProductItem };

const WELCOME_MESSAGE: ChatMessage = {
  id: 'm1',
  sender: 'ai',
  text: 'Chào bạn! Tôi là Cóc AI - trợ lý chuyên sâu FPT Campus Marketplace. Tôi có thể hỗ trợ bạn định giá đồ dùng, tìm đồ học tập quanh KTX, hoặc hướng dẫn giao dịch an toàn tại trạm Safe-Point. Bạn cần hỗ trợ gì hôm nay?',
  time: 'Vừa xong',
};

const QUICK_PROMPTS = [
  '📚 Định giá giáo trình PRF192 cũ?',
  '🛡️ Quy trình khiếu nại & hoàn tiền 48h',
  '📍 Điểm hẹn Safe Handoff ở Campus',
  '⚡ Tìm điểm cắm sạc test đồ điện tử',
];

const formatCampusScope = (campus?: string) =>
  campus && campus !== 'TẤT CẢ' ? campus : '5 Campus';

/**
 * Format sản phẩm từ backend hoặc gợi ý sang SuggestedProductItem
 */
const formatSuggestedProducts = (rawProducts: any[]): SuggestedProductItem[] => {
  if (!Array.isArray(rawProducts)) return [];
  return rawProducts.map((p, idx) => {
    let conditionText = p.conditionBadge || 'Đã qua sử dụng';
    if (p.condition === 'NEW' || p.condition === 'NEW_100') conditionText = 'Mới 100%';
    else if (p.condition === 'LIKE_NEW' || p.condition === 'LIKE_NEW_99') conditionText = 'Like New 99%';
    else if (p.condition === 'GOOD' || p.condition === 'USED_GOOD') conditionText = 'Tốt 90%';
    else if (p.condition === 'FAIR' || p.condition === 'USED_FAIR') conditionText = 'Khá 80%';
    else if (typeof p.condition === 'string' && p.condition.length > 0) {
      conditionText = p.condition;
    }

    const rawImage =
      Array.isArray(p.images) && p.images.length > 0
        ? p.images[0]
        : (p.imageUrl || p.coverImage || p.image);
    const imageSource = resolveProductImage(rawImage);

    const sellerName =
      p.seller?.profile?.fullName ||
      p.seller?.name ||
      p.sellerName ||
      'Sinh viên FPT';
    const repScore = p.seller?.profile?.reputationScore ?? p.seller?.reputationScore;
    const trustText = repScore
      ? `${repScore}% Uy tín`
      : p.sellerRating
      ? `${Math.round(Number(p.sellerRating) * 20)}% Uy tín`
      : p.seller?.isKycVerified || p.seller?.role === 'SELLER' || p.sellerIsVerified
      ? '100% MSSV'
      : 'Đã duyệt';

    return {
      id: p.id || `prod_${Date.now()}_${idx}`,
      domTag: p.safePoint || p.meetupLocation || p.campus || 'Campus FPT',
      conditionBadge: conditionText,
      trustScore: trustText,
      title: p.title || 'Món đồ sinh viên FPT',
      sellerInfo: p.categoryType
        ? `Danh mục: ${fromBackendCategory(p.categoryType)}`
        : (p.category ? `Danh mục: ${fromBackendCategory(p.category)}` : `Sinh viên FPT ${p.campus || ''}`),
      price:
        typeof p.price === 'number'
          ? `${p.price.toLocaleString('vi-VN')} đ`
          : `${p.price || 0} đ`,
      image: imageSource,
      sellerId: p.sellerId || p.seller?.id,
      sellerName,
      sellerAvatar: p.seller?.profile?.avatarUrl || p.seller?.avatarUrl || p.sellerAvatar || '',
      sellerCohort: p.seller?.profile?.cohort || p.seller?.major || p.sellerCohort || 'Sinh viên FPT',
    };
  });
};

/**
 * Tìm kiếm sản phẩm thực tế từ Database / Meilisearch qua Backend API (không dùng mock/hardcode)
 */
const searchDatabaseProducts = async (
  queryText: string,
  campus?: string
): Promise<any[]> => {
  try {
    const cleanCampus = resolveAiCampusCode(campus);

    // 1. Nếu có campus cụ thể, tìm ưu tiên theo campus đó trước
    if (cleanCampus) {
      const productsInCampus = await productMobileService.getProducts({
        search: queryText,
        campus: cleanCampus,
        limit: 6,
      });
      if (productsInCampus && productsInCampus.length > 0) {
        return productsInCampus;
      }
    }

    // 2. Tìm trên toàn hệ thống 5 campus (khi chọn TẤT CẢ hoặc hỗ trợ Ship COD liên campus)
    const allProducts = await productMobileService.getProducts({
      search: queryText,
      limit: 6,
    });
    return allProducts || [];
  } catch (error) {
    console.warn('searchDatabaseProducts error:', error);
    return [];
  }
};

/**
 * Tạo câu trả lời thông minh FAQ / chính sách sàn (không hardcode sản phẩm)
 */
const generateLocalBotReply = (
  query: string,
  campus: string = 'Hòa Lạc'
): { reply: string } => {
  const q = query.toLowerCase().trim();

  // 1. Chào hỏi
  if (
    /\b(hi|hello|alo|hey)\b/i.test(q) ||
    /(^|\s)(chào|ê|hé lô|helo)(\s|$)/i.test(q)
  ) {
    return {
      reply: `Chào bạn! Tôi là Cóc AI - trợ lý sinh viên FPT tại cơ sở ${campus}. Tôi có thể giúp gì cho bạn hôm nay? (Tìm đồ học tập quanh KTX, hướng dẫn giao dịch an toàn, giải đáp chính sách Escrow...)`,
    };
  }

  // 2. Mua hàng & Quy trình
  if (
    q.includes('cách mua') ||
    q.includes('quy trình mua') ||
    q.includes('mua hàng') ||
    q.includes('đặt hàng')
  ) {
    return {
      reply: `Trên sàn Market FU hiện có 2 hình thức mua hàng chính an toàn cho sinh viên:\n\n1️⃣ Giao dịch trực tiếp Safe Handoff (MEETUP):\n• Hẹn gặp tại trạm Safe-Point (Sảnh Alpha, Thư viện Beta, Cổng Dom KTX...).\n• Người mua đưa Mã QR Handshake hoặc OTP cho người bán để xác nhận nhận hàng.\n\n2️⃣ Giao hàng Ship COD / Đặt cọc Escrow:\n• Tiền được nạp vào ví trung gian Escrow của sàn bảo vệ an toàn.\n• Người mua có 48 giờ dùng thử (Golden Test Period) để test máy móc trước khi giải ngân cho người bán!`,
    };
  }

  // 3. Trả hàng & Khiếu nại 48h
  if (
    q.includes('trả hàng') ||
    q.includes('hoàn tiền') ||
    q.includes('khiếu nại') ||
    q.includes('hỏng') ||
    q.includes('lỗi') ||
    q.includes('nứt')
  ) {
    return {
      reply: `🛡️ Quy trình Trả hàng & Khiếu nại Escrow 48h:\n\n1️⃣ Thời hạn vàng 48 Giờ: Bạn có 48 giờ sau khi nhận đồ để cắm sạc/test máy.\n2️⃣ Khóa tiền tức thì: Vào Quản lý đơn hàng -> Bấm "Khiếu nại & Trả hàng", hệ thống sẽ lập tức đóng băng tiền trong ví Escrow.\n3️⃣ Tải video bằng chứng unboxing hoặc test lỗi.\n4️⃣ Phương án: Hoàn tiền 100% hoặc thỏa thuận bồi thường một phần (20-50%). Admin sẽ phân xử sau 24h nếu 2 bên chưa thống nhất!`,
    };
  }

  // 4. Đăng ký bán / Thẻ sinh viên
  if (
    q.includes('bán') ||
    q.includes('seller') ||
    q.includes('thẻ sv') ||
    q.includes('thẻ sinh viên') ||
    q.includes('xác thực')
  ) {
    return {
      reply: `📢 Để đăng ký bán đồ và bảo đảm an toàn sinh viên FPT:\n\n1️⃣ Vào mục Hồ sơ cá nhân -> Chọn "Nâng cấp thành Người bán".\n2️⃣ Tải lên ảnh Thẻ sinh viên FPT (mặt trước) để đối soát MSSV chính quy.\n3️⃣ Sau khi duyệt (2-4 giờ), bạn mở khóa quyền đăng tin và quản lý đồ bán!`,
    };
  }

  // 5. Safe Handoff & Điểm hẹn Campus
  if (
    q.includes('hẹn') ||
    q.includes('handoff') ||
    q.includes('campus') ||
    q.includes('địa điểm') ||
    q.includes('sạc') ||
    q.includes('test')
  ) {
    return {
      reply: `📍 Điểm hẹn giao dịch an toàn (Safe Handoff Points):\n\n• Hà Nội (Hòa Lạc): Sảnh Tòa Alpha (có bàn test điện 220V + HDMI), Bàn chờ Thư viện Beta, Căn tin Gamma.\n• TP.HCM (Quận 9): Sảnh lớn Tòa A, Khu vực ghế đá Canteen trung tâm.\n• Đà Nẵng: Sảnh chính F-Complex, Thư viện Tầng 2.\n• Cần Thơ & Quy Nhơn: Sảnh lễ tân hành chính, Quầy bảo vệ cổng chính.\n\n🛡️ Tất cả vị trí đều có camera an ninh 24/7 và bảo vệ túc trực!`,
    };
  }

  // 6. Ngoài chuyên môn (Off-topic) hoặc không tìm thấy mục đích cụ thể
  return {
    reply: `🐸 Cóc AI là Trợ lý chuyên trách Sàn Đồ Cũ Sinh Viên FPT, mình hỗ trợ bạn tra cứu đồ dùng thực tế trong database sinh viên FPT, hướng dẫn quy trình Safe Handoff, khiếu nại Escrow và điểm hẹn an toàn tại 5 cơ sở trường!\n\nNếu bạn cần tìm món đồ gì (giáo trình, đồ KTX, chuột gaming, laptop, đồ điện tử...) hay cần hỗ trợ cách đặt cọc/khiếu nại, hãy nhắn cho mình nha!`,
  };
};

export const AiAssistantScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { currentCampus } = useCampusStore();
  const { user, isAuthenticated } = useAuthStore();

  const userKey = isAuthenticated && user?.id ? user.id : 'guest';
  const storageMessagesKey = `@fu_market_aichat_messages_${userKey}`;
  const storageSessionKey = `@fu_market_aichat_session_${userKey}`;
  const GUEST_COUNT_KEY = '@fu_market_aichat_guest_count';

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);
  const guestQuestionCountRef = useRef<number>(0);

  // Modal lịch sử phiên chat
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [sessionsList, setSessionsList] = useState<AiSessionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Camera Subsystem Modal cho AI Vision
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const lastVisionResultRef = useRef<any>(null);

  const flatListRef = useRef<FlatList>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Theo dõi bàn phím để tự động cuộn và nâng khung chat giống màn hình tin nhắn
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

  // 1. Đọc số câu hỏi guest từ AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(GUEST_COUNT_KEY)
      .then((val) => {
        if (val) {
          const num = parseInt(val, 10);
          guestQuestionCountRef.current = isNaN(num) ? 0 : num;
        }
      })
      .catch(() => {});
  }, []);

  // 2. Load tin nhắn & session đã lưu cho user hiện tại
  useEffect(() => {
    let isMounted = true;
    const loadSavedState = async () => {
      try {
        const [savedMsgsStr, savedSessId] = await Promise.all([
          AsyncStorage.getItem(storageMessagesKey),
          AsyncStorage.getItem(storageSessionKey),
        ]);

        if (!isMounted) return;

        if (savedMsgsStr) {
          const parsed = JSON.parse(savedMsgsStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        } else {
          setMessages([WELCOME_MESSAGE]);
        }

        if (savedSessId) {
          setSessionId(savedSessId);
        } else {
          setSessionId(null);
        }
      } catch (e) {
        console.log('Error loading saved chat state:', e);
      }
    };

    loadSavedState();
    return () => {
      isMounted = false;
    };
  }, [storageMessagesKey, storageSessionKey]);

  // Lưu tin nhắn & session ID vào AsyncStorage
  const saveChatState = async (nextMsgs: ChatMessage[], nextSessId?: string | null) => {
    try {
      await AsyncStorage.setItem(storageMessagesKey, JSON.stringify(nextMsgs));
      if (nextSessId !== undefined) {
        if (nextSessId) {
          await AsyncStorage.setItem(storageSessionKey, nextSessId);
        } else {
          await AsyncStorage.removeItem(storageSessionKey);
        }
      }
    } catch (e) {
      console.log('Error saving chat state:', e);
    }
  };

  // 3. Tải danh sách sessions khi mở History Modal
  const handleOpenHistory = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Đăng nhập để xem lịch sử',
        'Lịch sử các phiên trò chuyện chỉ được lưu khi bạn đã đăng nhập tài khoản sinh viên FPT.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    setHistoryModalVisible(true);
    setLoadingHistory(true);
    try {
      const list = await aiMobileService.getUserSessions();
      setSessionsList(list);
    } catch {
      setSessionsList([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 4. Chọn và xem lại một session cũ
  const handleSelectSession = async (selectedSessionId: string) => {
    setLoadingHistory(true);
    try {
      const detail = await aiMobileService.getSessionDetail(selectedSessionId);
      if (detail && detail.messages && Array.isArray(detail.messages)) {
        const formatted: ChatMessage[] = detail.messages.map((m: any) => ({
          id: m.id || `msg_${Date.now()}_${Math.random()}`,
          sender: m.senderRole === 'USER' ? 'user' : 'ai',
          text: m.content,
          time: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Vừa xong',
          campusHeader: m.senderRole === 'MODEL' ? `GEMINI AI - ${formatCampusScope(currentCampus)}` : undefined,
          suggestedProducts:
            m.suggestedProducts && m.suggestedProducts.length > 0
              ? formatSuggestedProducts(m.suggestedProducts)
              : undefined,
          actionChips:
            m.senderRole === 'MODEL'
              ? [
                  { id: 'safe_point', label: 'Hẹn Safe-Point', icon: 'location', color: '#EA580C' },
                  { id: 'escrow', label: 'Tạm giữ tiền Escrow', icon: 'shield-checkmark', color: '#059669' },
                ]
              : undefined,
        }));

        const finalMsgs = [WELCOME_MESSAGE, ...formatted];
        setMessages(finalMsgs);
        setSessionId(selectedSessionId);
        await saveChatState(finalMsgs, selectedSessionId);
        setHistoryModalVisible(false);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể tải chi tiết phiên trò chuyện.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // 5. Bắt đầu phiên chat mới
  const handleStartNewChat = async () => {
    setMessages([WELCOME_MESSAGE]);
    setSessionId(null);
    await saveChatState([WELCOME_MESSAGE], null);
    setHistoryModalVisible(false);
  };

  // 6. Gửi tin nhắn
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isSendingRef.current) return;

    const campusScopeLabel = formatCampusScope(currentCampus);

    // --- CHECK QUOTA KHÁCH VÃNG LAI ---
    if (!isAuthenticated) {
      // Nếu khách đã dùng hết 1 câu -> Chặn từ câu thứ 2
      if (guestQuestionCountRef.current >= 1) {
        const userMsg: ChatMessage = {
          id: `u_${Date.now()}`,
          sender: 'user',
          text: textToSend,
          time: 'Vừa xong',
        };

        const lockMsg: ChatMessage = {
          id: `lock_${Date.now()}`,
          sender: 'ai',
          time: 'Vừa xong',
          campusHeader: 'GIỚI HẠN DÙNG THỬ 1 CÂU',
          text: '🔒 Bạn đã dùng hết 1 lượt hỏi thử miễn phí dành cho khách.\n\nVui lòng đăng nhập tài khoản Sinh viên FPT để tiếp tục trò chuyện cùng Trợ lý AI, tra cứu hàng nghìn món đồ KTX và lưu lịch sử phiên chat không giới hạn!',
          actionChips: [
            { id: 'login_now', label: '👉 Đăng nhập ngay', icon: 'log-in-outline', color: '#EA580C' },
            { id: 'register_now', label: '📝 Đăng ký tài khoản', icon: 'person-add-outline', color: '#2563EB' },
          ],
        };

        const nextMsgs = [...messages, userMsg, lockMsg];
        setMessages(nextMsgs);
        saveChatState(nextMsgs, sessionId);
        setInputText('');

        Alert.alert(
          '🔒 Yêu cầu đăng nhập',
          'Bạn đã sử dụng hết 1 lượt hỏi thử miễn phí. Vui lòng đăng nhập tài khoản FPT để tiếp tục trò chuyện không giới hạn!',
          [
            { text: 'Để sau', style: 'cancel' },
            { text: 'Đăng nhập ngay', onPress: () => navigation.navigate('Login') },
          ]
        );
        return;
      }

      // Khách hỏi câu đầu tiên -> Tăng biến đếm và lưu lại
      guestQuestionCountRef.current += 1;
      AsyncStorage.setItem(GUEST_COUNT_KEY, String(guestQuestionCountRef.current)).catch(() => {});
    }

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: 'Vừa xong',
    };

    const typingId = `ai_typing_${Date.now()}`;
    const typingMsg: ChatMessage = {
      id: typingId,
      sender: 'ai',
      time: 'Đang nhập...',
      campusHeader: isAuthenticated ? `GEMINI AI - ${campusScopeLabel}` : `TRỢ LÝ AI - ${campusScopeLabel}`,
      isTyping: true,
    };

    const nextMsgs = [...messages, userMsg];
    setMessages([...nextMsgs, typingMsg]);
    setInputText('');
    saveChatState(nextMsgs, sessionId);

    isSendingRef.current = true;
    setIsSending(true);

    try {
      if (isAuthenticated) {
        try {
          // Đã đăng nhập -> Gọi backend Gemini AI Assistant với sessionId hiện tại
          const aiRes = await aiMobileService.chatWithAssistant(
            textToSend,
            currentCampus,
            sessionId || undefined
          );

          const newSessionId = aiRes.sessionId || sessionId;
          if (newSessionId) {
            setSessionId(newSessionId);
          }

          let formattedProducts = aiRes.suggestedProducts
            ? formatSuggestedProducts(aiRes.suggestedProducts)
            : [];

          // Nếu Gemini không trả danh sách sản phẩm hoặc trả rỗng, kiểm tra xem người dùng có đang hỏi đồ không
          if (formattedProducts.length === 0) {
            const isGreeting =
              /\b(hi|hello|alo|hey)\b/i.test(textToSend) ||
              /(^|\s)(chào|ê|hé lô|helo)(\s|$)/i.test(textToSend);
            if (!isGreeting) {
              const dbProducts = await searchDatabaseProducts(textToSend, currentCampus);
              if (dbProducts.length > 0) {
                formattedProducts = formatSuggestedProducts(dbProducts);
              }
            }
          }

          const aiReply: ChatMessage = {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            time: 'Vừa xong',
            campusHeader: `GEMINI AI - ${campusScopeLabel}`,
            text: aiRes.reply,
            suggestedProducts: formattedProducts.length > 0 ? formattedProducts : undefined,
            actionChips: [
              { id: 'safe_point', label: 'Hẹn Safe-Point', icon: 'location', color: '#EA580C' },
              { id: 'escrow', label: 'Tạm giữ tiền Escrow', icon: 'shield-checkmark', color: '#059669' },
            ],
          };

          const finalMsgs = [...nextMsgs, aiReply];
          setMessages(finalMsgs);
          saveChatState(finalMsgs, newSessionId);
          flatListRef.current?.scrollToEnd({ animated: true });
          return;
        } catch (err: any) {
          console.log('AI Assistant server error:', err?.message);
          const errCode = err?.response?.data?.error?.code || '';
          const status = err?.response?.status;
          const isExplicitReject =
            status === 400 ||
            status === 429 ||
            errCode === 'CONTENT_MODERATION_BLOCKED' ||
            errCode === 'AI_RATE_LIMIT_EXCEEDED';

          let fallbackProducts: SuggestedProductItem[] = [];
          if (!isExplicitReject) {
            const isGreeting =
              /\b(hi|hello|alo|hey)\b/i.test(textToSend) ||
              /(^|\s)(chào|ê|hé lô|helo)(\s|$)/i.test(textToSend);
            if (!isGreeting) {
              const dbProducts = await searchDatabaseProducts(textToSend, currentCampus);
              if (dbProducts.length > 0) {
                fallbackProducts = formatSuggestedProducts(dbProducts);
              }
            }
          }

          const errorText =
            fallbackProducts.length > 0
              ? `Trợ lý Gemini đang bận phản hồi chậm một chút, nhưng mình đã tra trực tiếp kho và tìm thấy ${fallbackProducts.length} món đồ khớp từ khóa cho bạn bên dưới:`
              : err?.message ||
                'Rất tiếc, trợ lý AI đang quá tải hoặc gặp gián đoạn kết nối. Vui lòng thử lại sau giây lát hoặc tra cứu trực tiếp bằng thanh tìm kiếm!';

          const errorReply: ChatMessage = {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            time: 'Vừa xong',
            campusHeader: `GEMINI AI - ${campusScopeLabel}`,
            text: errorText,
            suggestedProducts: fallbackProducts.length > 0 ? fallbackProducts : undefined,
          };
          const finalMsgs = [...nextMsgs, errorReply];
          setMessages(finalMsgs);
          saveChatState(finalMsgs, sessionId);
          flatListRef.current?.scrollToEnd({ animated: true });
          return;
        }
      }

      // Phản hồi cho khách vãng lai (lượt dùng thử duy nhất)
      let dbProducts: any[] = [];
      const isGreeting =
        /\b(hi|hello|alo|hey)\b/i.test(textToSend) ||
        /(^|\s)(chào|ê|hé lô|helo)(\s|$)/i.test(textToSend);

      if (!isGreeting) {
        dbProducts = await searchDatabaseProducts(textToSend, currentCampus);
      }

      const { reply } = generateLocalBotReply(textToSend, campusScopeLabel);
      let finalReplyText = reply;

      if (dbProducts.length > 0) {
        finalReplyText = `Mình đã tìm thấy ${dbProducts.length} món đồ phù hợp trên hệ thống Market FU (bao gồm cơ sở của bạn và hỗ trợ Ship COD liên campus). Tất cả bài đăng đều được đối soát MSSV FPT chính quy và có hỗ trợ bảo hộ quỹ Escrow. Bạn xem qua các món đồ bên dưới nhé!`;
      }

      const guestReplyText = `${finalReplyText}\n\n🔒 Bạn vừa dùng hết 1 lượt hỏi thử miễn phí. Hãy đăng nhập tài khoản FPT để tiếp tục trò chuyện không giới hạn và lưu lịch sử nhé!`;
      const formattedSampleProducts = dbProducts.length > 0
        ? formatSuggestedProducts(dbProducts)
        : [];

      const aiReply: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        time: 'Vừa xong',
        campusHeader: `TRỢ LÝ AI - ${campusScopeLabel}`,
        text: guestReplyText,
        suggestedProducts: formattedSampleProducts.length > 0 ? formattedSampleProducts : undefined,
        actionChips: [
          { id: 'login_now', label: '👉 Đăng nhập để tiếp tục', icon: 'log-in-outline', color: '#EA580C' },
        ],
      };

      const finalMsgs = [...nextMsgs, aiReply];
      setMessages(finalMsgs);
      saveChatState(finalMsgs, sessionId);
      flatListRef.current?.scrollToEnd({ animated: true });
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  const handleProductDetail = useCallback(
    (item: SuggestedProductItem) => {
      if (navigation && navigation.navigate) {
        navigation.navigate('ProductDetail', { productId: item.id });
      }
    },
    [navigation]
  );

  const handleContactSeller = useCallback(
    async (item: SuggestedProductItem) => {
      if (!isAuthenticated) {
        Alert.alert(
          'Đăng nhập để liên hệ',
          'Vui lòng đăng nhập tài khoản sinh viên FPT để nhắn tin trao đổi với người bán.',
          [
            { text: 'Để sau', style: 'cancel' },
            { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
          ]
        );
        return;
      }

      const currentUserId = user?.id || (user as any)?._id;

      try {
        let sellerId = item.sellerId;
        let sellerName = item.sellerName || 'Sinh viên FPT';
        let sellerAvatar = item.sellerAvatar || '';
        let sellerCohort = item.sellerCohort || 'Sinh viên FPT';

        if (!sellerId && item.id) {
          const detail = await productMobileService.getProductById(item.id);
          sellerId = detail?.sellerId;
          if (detail?.sellerName) sellerName = detail.sellerName;
          if (detail?.sellerAvatar) sellerAvatar = detail.sellerAvatar;
          if (detail?.sellerCohort) sellerCohort = detail.sellerCohort;
        }

        if (sellerId && currentUserId && sellerId === currentUserId) {
          Alert.alert('Thông báo', 'Bạn không thể tự nhắn tin với chính mình!');
          return;
        }

        const convDetails = await chatMobileService.createOrGetConversationDetails(item.id);
        const convPartner = convDetails?.partner;

        navigation.navigate('ChatDetail', {
          conversationId: convDetails?.conversationId,
          partner: {
            id: sellerId || convPartner?.id || 'partner',
            name: convPartner?.profile?.fullName || convPartner?.name || sellerName,
            avatar: convPartner?.profile?.avatarUrl || convPartner?.avatarUrl || sellerAvatar,
            cohort: convPartner?.profile?.cohort || sellerCohort,
            isOnline: true,
          },
          product: {
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
          },
        });
      } catch {
        navigation.navigate('ProductDetail', { productId: item.id });
      }
    },
    [isAuthenticated, navigation, user]
  );

  const handleActionChip = useCallback(
    (chipId: string) => {
      if (chipId === 'login_now' || chipId === 'register_now') {
        navigation.navigate('Login');
      } else if (chipId === 'post_item_ai') {
        if (!isAuthenticated) {
          Alert.alert(
            'Yêu cầu đăng nhập',
            'Vui lòng đăng nhập bằng tài khoản Sinh viên FPT để đăng bán sản phẩm.',
            [
              { text: 'Để sau', style: 'cancel' },
              { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
            ]
          );
          return;
        }
        if (user?.role !== 'SELLER') {
          Alert.alert(
            'Yêu cầu tài khoản Người bán',
            'Vui lòng xác thực KYC Người bán trong mục Hồ sơ để mở quyền đăng tin pass đồ.'
          );
          return;
        }
        navigation.navigate('MainTabs', {
          screen: 'PostItem',
          params: lastVisionResultRef.current || {},
        });
      } else if (chipId === 'safe_point' || chipId === 'location') {
        Alert.alert(
          '📍 Bàn Test Sảnh Alpha',
          'Vị trí: Ngay sảnh chính tòa Alpha (cạnh phòng bảo vệ).\nTrang bị: Bàn test có 4 ổ điện 220V, cổng HDMI/Type-C, camera an ninh 360° hỗ trợ ghi nhận tình trạng bàn giao máy.'
        );
      } else if (chipId === 'escrow') {
        Alert.alert(
          '🛡️ Tạm giữ tiền Escrow',
          'Cơ chế bảo vệ 48h: Tiền người mua thanh toán được tạm khóa an toàn. Bạn có 48h để cắm sạc test đồ. Nếu lỗi hỏng, tiền được hoàn 100%!'
        );
      } else {
        Alert.alert('Trợ lý AI', 'Đã lưu yêu cầu của bạn.');
      }
    },
    [navigation, isAuthenticated, user?.role]
  );

  const handleResetChat = () => {
    Alert.alert(
      '🔄 Cuộc trò chuyện mới',
      'Bạn có muốn bắt đầu một phiên chat mới không? (Phiên hiện tại vẫn được lưu trong lịch sử)',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tạo mới',
          onPress: () => {
            handleStartNewChat();
          },
        },
      ]
    );
  };

  const handleScanVision = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Vui lòng đăng nhập tài khoản Sinh viên FPT để sử dụng AI Vision quét & định giá ảnh sản phẩm.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    if (isSendingRef.current) return;
    setCameraModalVisible(true);
  };

  const handleCameraCapture = async (photoUri: string) => {
    setCameraModalVisible(false);
    isSendingRef.current = true;
    setIsSending(true);

    const campusScopeLabel = formatCampusScope(currentCampus);

    // 1. Thêm tin nhắn ảnh của User
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      time: 'Vừa xong',
      text: '📸 [Đã chụp ảnh món đồ cần AI định giá]',
    };

    // 2. Thêm tin nhắn phản hồi tạm thời của AI
    const loadingAiId = `ai_${Date.now() + 1}`;
    const loadingAiMsg: ChatMessage = {
      id: loadingAiId,
      sender: 'ai',
      time: 'Đang phân tích...',
      campusHeader: `GEMINI AI VISION - ${campusScopeLabel}`,
      text: '🔍 Cóc AI đang phân tích ảnh qua Gemini Multimodal Vision: Kiểm tra ngoại quan, tra cứu mặt bằng giá KTX và soạn thông tin...',
    };

    setMessages((prev) => [...prev, userMsg, loadingAiMsg]);
    flatListRef.current?.scrollToEnd({ animated: true });

    try {
      const scanRes = await aiMobileService.scanProductImage(photoUri);
      const title = scanRes?.title || 'Sản phẩm đã nhận diện';
      const cond =
        scanRes?.condition === 'NEW_100'
          ? 'Mới 100% Nguyên seal'
          : scanRes?.condition === 'LIKE_NEW_99'
          ? 'Mới 99% Like new'
          : scanRes?.condition === 'USED_GOOD'
          ? 'Dùng rất tốt'
          : 'Đã qua sử dụng';
      const numericPrice = scanRes?.suggestedPrice || scanRes?.estimatedPrice || 0;
      const estPrice = numericPrice > 0 ? Number(numericPrice).toLocaleString('vi-VN') : '50.000';

      lastVisionResultRef.current = {
        initialTitle: title,
        initialPrice: numericPrice > 0 ? String(numericPrice) : '',
        initialDescription: scanRes?.description || `${title} - Tình trạng: ${cond}`,
        initialImage: photoUri,
      };

      const completedAiMsg: ChatMessage = {
        id: loadingAiId,
        sender: 'ai',
        time: 'Vừa xong',
        campusHeader: `GEMINI AI VISION - ${campusScopeLabel}`,
        text: `📷 **Phân tích hình ảnh hoàn tất!**\n\n• **Món đồ nhận diện:** ${title}\n• **Tình trạng máy:** ${cond}\n• **Giá đề xuất KTX:** ${estPrice} đ\n\nBạn có muốn mở form đăng bán để tự động điền các thông tin này không?`,
        actionChips: [
          { id: 'post_item_ai', label: 'Tạo bài đăng ngay', icon: 'create-outline', color: '#EA580C' },
          { id: 'safe_point', label: 'Hẹn Safe-Point', icon: 'location', color: '#059669' },
        ],
      };

      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === loadingAiId ? completedAiMsg : m));
        saveChatState(updated, sessionId);
        return updated;
      });
    } catch (e: any) {
      const errDetail = e?.response?.data?.error?.message || e?.message;
      const errorAiMsg: ChatMessage = {
        id: loadingAiId,
        sender: 'ai',
        time: 'Vừa xong',
        campusHeader: `GEMINI AI - ${campusScopeLabel}`,
        text: errDetail
          ? `⚠️ ${errDetail}`
          : '⚠️ Không thể phân tích được ảnh lúc này. Bạn có thể tự mở form đăng bài để điền thông tin thủ công.',
        actionChips: [
          { id: 'post_item_ai', label: 'Mở đăng tin', icon: 'create-outline', color: '#EA580C' },
        ],
      };
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === loadingAiId ? errorAiMsg : m));
        saveChatState(updated, sessionId);
        return updated;
      });
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  const handleBack = () => {
    if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const userAvatar = user?.avatarUrl || user?.avatar;
  const userName = user?.name || 'Bạn';

  const renderMessageItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <AiAssistantMessageItem
        message={item}
        userName={userName}
        userAvatar={userAvatar}
        onProductDetail={handleProductDetail}
        onContactSeller={handleContactSeller}
        onActionChip={handleActionChip}
      />
    ),
    [userName, userAvatar, handleProductDetail, handleContactSeller, handleActionChip]
  );

  const listHeader = useCallback(
    () => (
      <View style={styles.timestampContainer}>
        <View style={styles.timestampPill}>
          <Text style={styles.timestampText}>Hôm nay • FPT {formatCampusScope(currentCampus)} Hub</Text>
        </View>
      </View>
    ),
    [currentCampus]
  );

  return (
    <View style={styles.screen}>
      <AiAssistantTopBar
        insetsTop={insets.top}
        currentCampus={currentCampus}
        userAvatar={userAvatar}
        userName={userName}
        onBack={handleBack}
        onHome={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        onNotification={() => navigation.navigate('Notification')}
        onProfile={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
        onResetChat={handleResetChat}
        onOpenHistory={handleOpenHistory}
        onOpenFilters={() =>
          Alert.alert(
            '🎛️ Phạm vi tìm kiếm AI',
            `Đang ưu tiên tìm tại: FPT ${formatCampusScope(currentCampus)}.\n\nMẹo: Bạn có thể đổi cơ sở tại Trang chủ hoặc gõ thẳng mức giá & cơ sở vào câu hỏi (vd: "Tìm bàn học dưới 500k ở HCM").`
          )
        }
      />

      <AiAssistantQuickPrompts
        prompts={QUICK_PROMPTS}
        onSelectPrompt={(p) => {
          if (!isSendingRef.current) {
            handleSendMessage(p.replace(/^[^\s]+\s/, ''));
          }
        }}
      />

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (insets.top > 0 ? insets.top + 20 : 64) : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.chatScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <AiAssistantInputBar
          inputText={inputText}
          onChangeText={setInputText}
          onSend={() => handleSendMessage()}
          onScanVision={handleScanVision}
          onVoiceInput={() =>
            Alert.alert(
              '🎙️ Nhập bằng giọng nói',
              'Tính năng nhập bằng giọng nói sẽ sớm được hỗ trợ. Hiện tại bạn hãy nhập chữ hoặc chụp ảnh để Cóc AI tra cứu nhanh nhé!'
            )
          }
          insetsBottom={isKeyboardVisible ? 6 : insets.bottom}
          isKeyboardVisible={isKeyboardVisible}
          isSending={isSending}
        />
      </KeyboardAvoidingView>

      {/* Modal Lịch sử các phiên trò chuyện */}
      <AiAssistantHistoryModal
        visible={historyModalVisible}
        sessions={sessionsList}
        currentSessionId={sessionId}
        loading={loadingHistory}
        onClose={() => setHistoryModalVisible(false)}
        onSelectSession={handleSelectSession}
        onNewChat={handleStartNewChat}
      />

      {/* Camera Subsystem: Chụp ảnh quét định giá Gemini Vision */}
      <CameraSubsystemModal
        visible={cameraModalVisible}
        mode="capture"
        title="Camera AI Vision"
        subtitle="Chụp ảnh món đồ để Gemini nhận diện & định giá KTX"
        onClose={() => setCameraModalVisible(false)}
        onCapture={handleCameraCapture}
      />
    </View>
  );
};

export default AiAssistantScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatArea: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  timestampContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timestampPill: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timestampText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
});
