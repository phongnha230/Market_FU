import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../types/chat.types';
import { SafeSuggestionCard, AppointmentCard } from './ChatSpecialCards';

interface ChatBubbleProps {
  message: ChatMessage;
  onScheduleAppointment: () => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onScheduleAppointment }) => {
  if (message.type === 'date_separator') {
    return (
      <View style={styles.separatorContainer}>
        <Text style={styles.separatorText}>{message.text}</Text>
      </View>
    );
  }

  if (message.type === 'safe_suggestion') {
    return <SafeSuggestionCard onSchedule={onScheduleAppointment} />;
  }

  if (message.type === 'appointment_confirmed') {
    return (
      <AppointmentCard
        location={message.appointmentData?.location}
        timeSlot={message.appointmentData?.timeSlot}
      />
    );
  }

  const isMe = message.type === 'text';

  return (
    <View style={[styles.bubbleRow, isMe ? styles.rowMe : styles.rowOther]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={[styles.msgText, isMe ? styles.textMe : styles.textOther]}>
          {message.text}
        </Text>
        {message.time && (
          <Text style={[styles.timeText, isMe ? styles.timeMe : styles.timeOther]}>
            {message.time}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  separatorContainer: { alignItems: 'center', marginVertical: 10 },
  separatorText: { fontSize: 10.5, color: '#94A3B8', fontWeight: '600' },
  bubbleRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
  rowMe: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  bubbleMe: { backgroundColor: '#F27024', borderBottomRightRadius: 2 },
  bubbleOther: { backgroundColor: '#F1F5F9', borderBottomLeftRadius: 2 },
  msgText: { fontSize: 12.5, lineHeight: 18 },
  textMe: { color: '#FFFFFF' },
  textOther: { color: '#0F172A' },
  timeText: { fontSize: 9.5, marginTop: 3, alignSelf: 'flex-end' },
  timeMe: { color: 'rgba(255, 255, 255, 0.75)' },
  timeOther: { color: '#94A3B8' },
});

export default ChatBubble;
