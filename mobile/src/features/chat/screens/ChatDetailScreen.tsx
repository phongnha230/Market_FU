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

  const routePartner = route.params?.partner;
  const partner = useMemo(
    () =>
      routePartner || {
        id: 'u-nam',
        name: 'Hoàng Anh',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        cohort: 'K16 SE - Hola',
        isOnline: true,
      },
    [routePartner]
  );

  const routeProduct = route.params?.product;
  const product = useMemo(
    () =>
      routeProduct || {
        id: 'p1',
        title: 'Bàn phím cơ Akko 3087 v2 Silent',
        price: '480.000đ',
        image: require('../../../../assets/products/keyboard-akko.jpg'),
      },
    [routeProduct]
  );

  const initialOffer = route.params?.initialOffer;

  const [inputText, setInputText] = useState('');
  const inputTextRef = useRef(inputText);
  useEffect(() => {
    inputTextRef.current = inputText;
  }, [inputText]);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm1',
      sender: 'partner',
      type: 'text',
      text: 'Chào bạn! Mình có thể hỗ trợ bạn xem món đồ này nhé.',
      time: '14:20',
    },
    {
      id: 'm2',
      sender: 'partner',
      type: 'safepoint',
      time: '14:21',
      safePointData: {
        location: 'Trạm Safe-Point Sảnh Tòa Alpha (Camera 24/7)',
        timeSlot: 'Hôm nay: 16:30 - 17:30',
      },
    },
  ]);

  // If navigated with initial offer from MakeOfferModal
  useEffect(() => {
    if (initialOffer) {
      const offerMsg: MessageItem = {
        id: 'offer-' + Date.now(),
        sender: 'me',
        type: 'offer',
        text: initialOffer.message,
        time: 'Vừa xong',
        offerData: {
          originalPrice: initialOffer.originalPrice || 480000,
          offeredPrice: initialOffer.offeredPrice || 430000,
          status: 'pending',
        },
      };
      setMessages((prev) => [...prev, offerMsg]);
    }
  }, [initialOffer]);

  const handleSendMessage = useCallback((textToSend?: string) => {
    const text = (textToSend || inputTextRef.current).trim();
    if (!text) return;

    const newMsg: MessageItem = {
      id: 'm-' + Date.now(),
      sender: 'me',
      type: 'text',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate auto reply from seller
    setTimeout(() => {
      const replyMsg: MessageItem = {
        id: 'reply-' + Date.now(),
        sender: 'partner',
        type: 'text',
        text: 'Oke bạn nha! Mình đồng ý hẹn nhau tại trạm Safe-point có camera để bạn test đồ kỹ càng nhé.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1000);
  }, []);

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
  }, []);

  const handleAcceptOffer = useCallback((msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.offerData
          ? { ...m, offerData: { ...m.offerData, status: 'accepted' } }
          : m
      )
    );
    Alert.alert('Thành công', 'Bạn đã chấp nhận đề xuất giá này!');
  }, []);

  const handleBookSafePoint = useCallback((safePointLocation?: string) => {
    navigation.navigate('Checkout', {
      product,
      safePoint: safePointLocation,
    });
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

  const renderMessageItem = useCallback(
    ({ item }: { item: MessageItem }) => (
      <ChatDetailMessageItem
        item={item}
        onAcceptOffer={handleAcceptOffer}
        onBookSafePoint={handleBookSafePoint}
      />
    ),
    [handleAcceptOffer, handleBookSafePoint]
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
        onCall={() => Alert.alert('Gọi thoại', `Kết nối cuộc gọi bảo mật với ${partner.name}`)}
      />

      <ChatDetailProductCard
        product={product}
        onViewProduct={() => navigation.navigate('ProductDetail', { productId: product.id })}
      />

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
          onChangeText={setInputText}
          onSend={() => handleSendMessage()}
          onAttachPhoto={() => Alert.alert('Gửi ảnh', 'Chọn ảnh chụp thực tế sản phẩm từ thiết bị')}
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
