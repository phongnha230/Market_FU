import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { aiMobileService, AiSessionItem } from '../../../services/aiMobileService';
import { productMobileService } from '../../../services/productMobileService';

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

/**
 * Format sản phẩm từ backend hoặc gợi ý sang SuggestedProductItem
 */
const formatSuggestedProducts = (rawProducts: any[]): SuggestedProductItem[] => {
  if (!Array.isArray(rawProducts)) return [];
  return rawProducts.map((p, idx) => {
    let conditionText = p.conditionBadge || 'Đã qua sử dụng';
    if (p.condition === 'NEW') conditionText = 'Mới 100%';
    else if (p.condition === 'LIKE_NEW') conditionText = 'Like New 99%';
    else if (p.condition === 'GOOD') conditionText = 'Tốt 90%';
    else if (p.condition === 'FAIR') conditionText = 'Khá 80%';
    else if (typeof p.condition === 'string' && p.condition.length > 0) {
      conditionText = p.condition;
    }

    let imageSource: any;
    const firstImg = Array.isArray(p.images) && p.images.length > 0
      ? p.images[0]
      : (p.imageUrl || p.coverImage);

    if (firstImg && typeof firstImg === 'object' && firstImg.uri) {
      imageSource = firstImg;
    } else if (firstImg && typeof firstImg === 'string' && (firstImg.startsWith('http') || firstImg.startsWith('data:'))) {
      imageSource = { uri: firstImg };
    } else if (typeof firstImg === 'number') {
      imageSource = firstImg;
    } else {
      imageSource = require('../../../../assets/products/book-prf192.jpg');
    }

    return {
      id: p.id || `prod_${Date.now()}_${idx}`,
      domTag: p.safePoint || p.meetupLocation || p.campus || 'Campus FPT',
      conditionBadge: conditionText,
      trustScore: '98% MSSV',
      title: p.title || 'Món đồ sinh viên FPT',
      sellerInfo: p.categoryType
        ? `Danh mục: ${p.categoryType}`
        : (p.category ? `Danh mục: ${p.category}` : `Sinh viên FPT ${p.campus || ''}`),
      price:
        typeof p.price === 'number'
          ? `${p.price.toLocaleString('vi-VN')} đ`
          : `${p.price || 0} đ`,
      image: imageSource,
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
    const campusMap: Record<string, string> = {
      'HÒA LẠC': 'HOL',
      'Hòa Lạc': 'HOL',
      'HOL': 'HOL',
      'TP.HCM': 'HCM',
      'TP. HỒ CHÍ MINH': 'HCM',
      'HỒ CHÍ MINH': 'HCM',
      'HCM': 'HCM',
      'ĐÀ NẴNG': 'DAD',
      'Đà Nẵng': 'DAD',
      'DAD': 'DAD',
      'QUY NHƠN': 'QN',
      'Quy Nhơn': 'QN',
      'QN': 'QN',
      'CẦN THƠ': 'CT',
      'Cần Thơ': 'CT',
      'CT': 'CT',
    };
    const cleanCampus = campus ? (campusMap[campus.trim()] || campusMap[campus.toUpperCase()] || 'HOL') : undefined;

    // 1. Tìm theo campus hiện tại
    const productsInCampus = await productMobileService.getProducts({
      search: queryText,
      campus: cleanCampus,
      limit: 6,
    });
    if (productsInCampus && productsInCampus.length > 0) {
      return productsInCampus;
    }
    // 2. Nếu campus hiện tại không có, tìm toàn quốc (hỗ trợ Ship COD liên campus)
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
  const [guestQuestionCount, setGuestQuestionCount] = useState<number>(0);

  // Modal lịch sử phiên chat
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [sessionsList, setSessionsList] = useState<AiSessionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // 1. Đọc số câu hỏi guest từ AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(GUEST_COUNT_KEY)
      .then((val) => {
        if (val) {
          const num = parseInt(val, 10);
          setGuestQuestionCount(isNaN(num) ? 0 : num);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Load tin nhắn & session đã lưu cho user hiện tại
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const [savedMsgsStr, savedSessId] = await Promise.all([
          AsyncStorage.getItem(storageMessagesKey),
          AsyncStorage.getItem(storageSessionKey),
        ]);

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
          campusHeader: m.senderRole === 'MODEL' ? `GEMINI AI - ${currentCampus}` : undefined,
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
    if (!textToSend) return;

    // --- CHECK QUOTA KHÁCH VÃNG LAI ---
    if (!isAuthenticated) {
      // Nếu khách đã dùng hết 1 câu -> Chặn từ câu thứ 2
      if (guestQuestionCount >= 1) {
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
      const nextCount = guestQuestionCount + 1;
      setGuestQuestionCount(nextCount);
      AsyncStorage.setItem(GUEST_COUNT_KEY, String(nextCount)).catch(() => {});
    }

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: 'Vừa xong',
    };

    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setInputText('');
    saveChatState(nextMsgs, sessionId);

    // Xử lý gửi tin nhắn AI
    try {
      if (isAuthenticated) {
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
          campusHeader: `GEMINI AI - ${currentCampus}`,
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
      }
    } catch {
      // Backend offline hoặc lỗi mạng -> Rơi vào fallback thông minh cục bộ
    }

    // Phản hồi cho khách (lượt dùng thử duy nhất) hoặc offline fallback
    // Tự động tìm kiếm sản phẩm thực tế từ Database / Meilisearch
    let dbProducts: any[] = [];
    const isGreeting =
      /\b(hi|hello|alo|hey)\b/i.test(textToSend) ||
      /(^|\s)(chào|ê|hé lô|helo)(\s|$)/i.test(textToSend);

    if (!isGreeting) {
      dbProducts = await searchDatabaseProducts(textToSend, currentCampus);
    }

    const { reply } = generateLocalBotReply(textToSend, currentCampus);
    let finalReplyText = reply;

    if (dbProducts.length > 0) {
      finalReplyText = `Mình đã tìm thấy ${dbProducts.length} món đồ phù hợp trên hệ thống Market FU (bao gồm cơ sở của bạn và hỗ trợ Ship COD liên campus). Tất cả bài đăng đều được đối soát MSSV FPT chính quy và có hỗ trợ bảo hộ quỹ Escrow. Bạn xem qua các món đồ bên dưới nhé!`;
    }

    const guestReplyText = !isAuthenticated
      ? `${finalReplyText}\n\n🔒 Bạn vừa dùng hết 1 lượt hỏi thử miễn phí. Hãy đăng nhập tài khoản FPT để tiếp tục trò chuyện không giới hạn và lưu lịch sử nhé!`
      : finalReplyText;

    const formattedSampleProducts = dbProducts.length > 0
      ? formatSuggestedProducts(dbProducts)
      : [];

    const aiReply: ChatMessage = {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      time: 'Vừa xong',
      campusHeader: `TRỢ LÝ AI - ${currentCampus}`,
      text: guestReplyText,
      suggestedProducts: formattedSampleProducts.length > 0 ? formattedSampleProducts : undefined,
      actionChips: !isAuthenticated
        ? [
            { id: 'login_now', label: '👉 Đăng nhập để tiếp tục', icon: 'log-in-outline', color: '#EA580C' },
          ]
        : [
            { id: 'safe_point', label: 'Hẹn Safe-Point', icon: 'location', color: '#EA580C' },
            { id: 'escrow', label: 'Tạm giữ tiền Escrow', icon: 'shield-checkmark', color: '#059669' },
          ],
    };

    const finalMsgs = [...nextMsgs, aiReply];
    setMessages(finalMsgs);
    saveChatState(finalMsgs, sessionId);
    flatListRef.current?.scrollToEnd({ animated: true });
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
    (item: SuggestedProductItem) => {
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

      if (navigation && navigation.navigate) {
        navigation.navigate('ContextualChatAuth', {
          product: {
            id: item.id,
            title: item.title,
            price: item.price,
            location: item.domTag,
            image: item.image,
          },
          sellerName: 'Sinh viên FPT',
          sellerCohort: 'FPT University',
        });
      }
    },
    [isAuthenticated, navigation]
  );

  const handleActionChip = useCallback(
    (chipId: string) => {
      if (chipId === 'login_now' || chipId === 'register_now') {
        navigation.navigate('Login');
      } else if (chipId === 'compare') {
        Alert.alert(
          '📊 So sánh thiết bị',
          '• Màn hình Dell: Độ tương phản sâu, chân đế chắc chắn, phù hợp code bài tập PE.\n\n• Màn hình LG IPS: Màu sắc chuẩn đồ họa, góc nhìn rộng 178°, phù hợp thiết kế & đa nhiệm.'
        );
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
    [navigation]
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
    Alert.alert(
      '📷 Quét định giá bằng AI Vision',
      'Tính năng quét ảnh món đồ bằng Gemini Vision: Tự động nhận diện tình trạng máy, tra cứu giá đồ cũ quanh KTX và soạn sẵn bài đăng trong 3 giây!'
    );
  };

  const handleBack = () => {
    if (navigation && navigation.canGoBack && navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('MainTabs', { screen: 'Home' });
  };

  const renderMessageItem = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <AiAssistantMessageItem
        message={item}
        userName={user?.name || 'Bạn'}
        onProductDetail={handleProductDetail}
        onContactSeller={handleContactSeller}
        onActionChip={handleActionChip}
      />
    ),
    [user?.name, handleProductDetail, handleContactSeller, handleActionChip]
  );

  const listHeader = useCallback(
    () => (
      <View style={styles.timestampContainer}>
        <View style={styles.timestampPill}>
          <Text style={styles.timestampText}>Hôm nay • FPT {currentCampus || 'Hòa Lạc'} Hub</Text>
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
        onBack={handleBack}
        onHome={() => navigation.navigate('MainTabs', { screen: 'Home' })}
        onNotification={() => navigation.navigate('Notification')}
        onProfile={() => navigation.navigate('MainTabs', { screen: 'Profile' })}
        onResetChat={handleResetChat}
        onOpenHistory={handleOpenHistory}
        onOpenFilters={() =>
          Alert.alert(
            '🎛️ Bộ lọc thông minh',
            'Tùy chỉnh phạm vi tìm kiếm theo tòa KTX, mức giá tối đa và xếp hạng uy tín sinh viên.'
          )
        }
      />

      <AiAssistantQuickPrompts
        prompts={QUICK_PROMPTS}
        onSelectPrompt={(p) => handleSendMessage(p.replace(/^[^\s]+\s/, ''))}
      />

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.chatScrollContent}
          showsVerticalScrollIndicator={false}
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
              'Đang lắng nghe... Hãy nói tên món đồ bạn muốn tìm.'
            )
          }
          insetsBottom={insets.bottom}
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
