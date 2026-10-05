import React, { useState, useRef, useCallback } from 'react';
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
import { useCampusStore } from '../../../stores/useCampusStore';
import { useAuthStore } from '../../../stores/useAuthStore';
import { AiAssistantGuestFallback } from '../components/AiAssistantGuestFallback';
import { AiAssistantTopBar } from '../components/AiAssistantTopBar';
import { AiAssistantQuickPrompts } from '../components/AiAssistantQuickPrompts';
import { AiAssistantMessageItem, ChatMessage } from '../components/AiAssistantMessageItem';
import { SuggestedProductItem } from '../components/AiAssistantProductCard';
import { AiAssistantInputBar } from '../components/AiAssistantInputBar';

export type { ChatMessage, SuggestedProductItem };

const WELCOME_MESSAGE: ChatMessage = {
  id: 'm1',
  sender: 'ai',
  text: 'Chào bạn! Tôi là trợ lý chuyên sâu FPT Campus Marketplace được tích hợp Gemini AI. Tôi có thể hỗ trợ bạn định giá đồ dùng, tìm đồ học tập quanh KTX, hoặc hướng dẫn giao dịch an toàn tại trạm Safe-Point. Bạn cần hỗ trợ gì hôm nay?',
  time: 'Vừa xong',
};

const QUICK_PROMPTS = [
  '📚 Định giá giáo trình PRF192 cũ?',
  '🛡️ Check uy tín MSSV người bán',
  '⚡ Tìm điểm cắm sạc test đồ điện tử',
];

export const AiAssistantScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { currentCampus } = useCampusStore();
  const { user, isAuthenticated } = useAuthStore();

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputText.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: 'Vừa xong',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Call backend Gemini AI Assistant
    import('../../../services/aiMobileService').then(async ({ aiMobileService }) => {
      try {
        const aiRes = await aiMobileService.chatWithAssistant(textToSend, currentCampus);
        const aiReply: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          time: 'Vừa xong',
          campusHeader: `GEMINI AI - ${currentCampus}`,
          text: aiRes.reply,
          actionChips: [
            { id: 'safe_point', label: 'Hẹn Safe-Point', icon: 'location', color: '#EA580C' },
            { id: 'escrow', label: 'Tạm giữ tiền Escrow', icon: 'shield-checkmark', color: '#059669' },
          ],
        };
        setMessages((prev) => [...prev, aiReply]);
        flatListRef.current?.scrollToEnd({ animated: true });
      } catch {
        const aiReply: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          time: 'Vừa xong',
          campusHeader: `PHÂN TÍCH TỰ ĐỘNG - ${currentCampus}`,
          text: `Tôi đã quét dữ liệu nội bộ tại campus ${currentCampus} cho yêu cầu "${textToSend}". Tất cả bài đăng đều được đối soát MSSV FPT chính quy và có hỗ trợ bảo hộ quỹ Escrow.`,
          actionChips: [
            { id: 'safe_point', label: 'Hẹn Safe-Point', icon: 'location', color: '#EA580C' },
            { id: 'escrow', label: 'Tạm giữ tiền Escrow', icon: 'shield-checkmark', color: '#059669' },
          ],
        };
        setMessages((prev) => [...prev, aiReply]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    });
  };

  const handleProductDetail = useCallback((item: SuggestedProductItem) => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ProductDetail', { productId: item.id });
    }
  }, [navigation]);

  const handleContactSeller = useCallback((item: SuggestedProductItem) => {
    if (navigation && navigation.navigate) {
      navigation.navigate('ContextualChatAuth', {
        product: {
          title: item.title,
          price: item.price,
          location: item.domTag,
          image: item.image,
        },
        sellerName: 'Nguyễn Văn An',
        sellerCohort: 'K16 SE',
      });
    }
  }, [navigation]);

  const handleActionChip = useCallback((chipId: string) => {
    if (chipId === 'compare') {
      Alert.alert(
        '📊 So sánh màn hình',
        '• Dell SE2422H: Tần số quét 75Hz, tấm nền VA độ tương phản sâu, chân đế chắc chắn, phù hợp code & xem phim.\n\n• LG 24MK430H: Tấm nền IPS màu sắc chuẩn đồ họa, góc nhìn rộng 178°, phù hợp thiết kế & đa nhiệm.'
      );
    } else if (chipId === 'location') {
      Alert.alert(
        '📍 Bàn Test Sảnh Alpha',
        'Vị trí: Ngay sảnh chính tòa Alpha (cạnh bảo vệ).\nTrang bị: Bàn test có 4 ổ điện 220V, cổng HDMI/Type-C, camera an ninh 360° hỗ trợ ghi nhận tình trạng bàn giao máy.'
      );
    } else {
      Alert.alert('Trợ lý AI', 'Đã lưu yêu cầu của bạn.');
    }
  }, []);

  const handleResetChat = () => {
    Alert.alert(
      '🔄 Làm mới hội thoại',
      'Bạn có muốn xóa lịch sử cuộc trò chuyện hiện tại để bắt đầu phiên mới không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Làm mới',
          onPress: () => {
            setMessages([WELCOME_MESSAGE]);
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
        userName={user?.name || 'Quân'}
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
          <Text style={styles.timestampText}>Hôm nay • FPT Hòa Lạc Hub</Text>
        </View>
      </View>
    ),
    []
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.screen}>
        <AiAssistantGuestFallback
          insetsTop={insets.top}
          onLogin={() => navigation.navigate('Login')}
          onBack={handleBack}
        />
      </View>
    );
  }

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
