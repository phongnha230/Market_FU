import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatDetailInputBarProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttachPhoto: () => void;
  onPickSafePoint: () => void;
  insetsBottom: number;
}

export const ChatDetailInputBar: React.FC<ChatDetailInputBarProps> = ({
  inputText,
  onChangeText,
  onSend,
  onAttachPhoto,
  onPickSafePoint,
  insetsBottom,
}) => {
  return (
    <View style={[styles.inputBar, { paddingBottom: Math.max(insetsBottom, 12) }]}>
      <TouchableOpacity
        style={styles.attachBtn}
        onPress={onAttachPhoto}
      >
        <Ionicons name="camera-outline" size={22} color="#64748B" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.attachBtn}
        onPress={onPickSafePoint}
      >
        <Ionicons name="location-outline" size={22} color="#059669" />
      </TouchableOpacity>

      <TextInput
        style={styles.textInput}
        placeholder="Nhập tin nhắn..."
        placeholderTextColor="#94A3B8"
        value={inputText}
        onChangeText={onChangeText}
        multiline
      />

      <TouchableOpacity
        style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
        disabled={!inputText.trim()}
        onPress={onSend}
      >
        <Ionicons name="send" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  attachBtn: { padding: 6, marginRight: 4 },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 13,
    color: '#0F172A',
    maxHeight: 80,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#CBD5E1' },
});
