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

  const scheduleWithDetails = (location: string, timeSlot: string) => {
    const apptMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'appointment_confirmed',
      text: `Đã xác nhận hẹn gặp tại ${location} vào lúc ${timeSlot}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      appointmentData: {
        location,
        timeSlot,
      },
    };
    setMessages((prev) => [...prev, apptMsg]);
    Alert.alert(
      '🎉 Đã tạo lịch hẹn thành công',
      `Địa điểm: ${location}\nThời gian: ${timeSlot}\n\nThông tin cuộc hẹn đã được gửi tới ${partner.name}.`
    );
  };

  const handlePickTimeSlot = (location: string) => {
    Alert.alert(
      '⏰ Chọn thời gian hẹn gặp',
      `Điểm hẹn: ${location}\nChọn khung giờ hẹn phù hợp:`,
      [
        {
          text: '1. 11:30 Trưa nay (Sau ca 2)',
          onPress: () => scheduleWithDetails(location, '11:30 Trưa nay (Sau ca 2)'),
        },
        {
          text: '2. 16:30 Chiều nay (Sau ca 4)',
          onPress: () => scheduleWithDetails(location, '16:30 Chiều nay (Sau ca 4)'),
        },
        {
          text: '3. 17:30 Chiều nay (Tan học)',
          onPress: () => scheduleWithDetails(location, '17:30 Chiều nay (Tan học)'),
        },
        {
          text: '4. 19:30 Tối nay (Sau ca KTX)',
          onPress: () => scheduleWithDetails(location, '19:30 Tối nay (Sau ca KTX)'),
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleScheduleAppointment = (customLocation?: string, customTime?: string) => {
    if (customLocation && customTime) {
      scheduleWithDetails(customLocation, customTime);
      return;
    }

    Alert.alert(
      '📍 Chọn trạm hẹn Safe-Handoff',
      'Chọn điểm gặp có camera giám sát và bàn test an ninh:',
      [
        {
          text: '1. Sảnh Tòa Alpha (Bàn test camera 24/7)',
          onPress: () => handlePickTimeSlot('Sảnh Tòa Alpha (Bàn test camera 24/7)'),
        },
        {
          text: '2. Thư viện Gamma (Tầng 1 - Khu tự học)',
          onPress: () => handlePickTimeSlot('Thư viện Gamma (Tầng 1 - Khu tự học)'),
        },
        {
          text: '3. Sảnh KTX Dom A-B (Gần quầy lễ tân)',
          onPress: () => handlePickTimeSlot('Sảnh KTX Dom A-B (Gần quầy lễ tân)'),
        },
        {
          text: '4. Căn tin Dom E-F (Khu ăn uống/nghỉ trưa)',
          onPress: () => handlePickTimeSlot('Căn tin Dom E-F (Khu ăn uống/nghỉ trưa)'),
        },
        { text: 'Đóng', style: 'cancel' },
      ]
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
