import { useState } from 'react';
import { Alert } from 'react-native';
import { INITIAL_MESSAGES, DEFAULT_PARTNER, QUICK_REPLIES } from '../constants/chat.constants';
import { ChatMessage } from '../types/chat.types';

export const useChat = (partnerId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const partner = DEFAULT_PARTNER;

  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'text',
      text: content.trim(),
      time: 'Vừa xong',
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');
  };

  const handleScheduleAppointment = () => {
    Alert.alert(
      '📅 Tạo lịch hẹn Safe-Handoff',
      'Đã gửi lời mời hẹn lúc 16:30 tại Bàn test điện số 04 - Sảnh Tòa Alpha.'
    );
  };

  return {
    messages,
    inputText,
    setInputText,
    partner,
    quickReplies: QUICK_REPLIES,
    handleSendMessage,
    handleScheduleAppointment,
  };
};

export default useChat;
