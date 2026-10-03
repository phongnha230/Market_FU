import React from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChatHeader from '../components/ChatHeader';
import ChatProductStrip from '../components/ChatProductStrip';
import ChatBubble from '../components/ChatBubble';
import ChatInputBar from '../components/ChatInputBar';
import useChat from '../hooks/useChat';
import { ChatScreenProps, ChatMessage } from '../types/chat.types';

export const ChatScreen: React.FC<ChatScreenProps> = ({ onGoBack, partnerId }) => {
  const insets = useSafeAreaInsets();
  const {
    messages,
    inputText,
    setInputText,
    partner,
    quickReplies,
    handleSendMessage,
    handleScheduleAppointment,
  } = useChat(partnerId);

  const renderItem = React.useCallback(
    ({ item }: { item: ChatMessage }) => (
      <ChatBubble
        message={item}
        onScheduleAppointment={handleScheduleAppointment}
      />
    ),
    [handleScheduleAppointment]
  );

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      <ChatHeader partner={partner} onGoBack={onGoBack} />
      <ChatProductStrip />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList<ChatMessage>
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <ChatInputBar
          text={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          quickReplies={quickReplies}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardContainer: { flex: 1 },
  listContent: { paddingVertical: 12 },
});

export default ChatScreen;
