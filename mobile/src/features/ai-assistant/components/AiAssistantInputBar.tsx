import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AiAssistantInputBarProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onScanVision: () => void;
  onVoiceInput: () => void;
  insetsBottom: number;
  isKeyboardVisible?: boolean;
  isSending?: boolean;
}

export const AiAssistantInputBar: React.FC<AiAssistantInputBarProps> = ({
  inputText,
  onChangeText,
  onSend,
  onScanVision,
  onVoiceInput,
  insetsBottom,
  isKeyboardVisible = false,
  isSending = false,
}) => {
  const canSend = Boolean(inputText.trim()) && !isSending;

  return (
    <View style={[styles.inputBarWrapper, { paddingBottom: isKeyboardVisible ? 8 : Math.max(insetsBottom, 12) }]}>
      <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.75} onPress={onScanVision} disabled={isSending}>
        <Ionicons name="camera-outline" size={21} color="#64748B" />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Hỏi giá sách, tìm đồ KTX, điểm hẹn..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={onChangeText}
          onSubmitEditing={() => {
            if (canSend) onSend();
          }}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.micBtn}
          activeOpacity={0.7}
          onPress={onVoiceInput}
        >
          <Ionicons name="mic-outline" size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        activeOpacity={0.88}
        onPress={onSend}
        disabled={!canSend}
      >
        {isSending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="send" size={16} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  cameraBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  micBtn: {
    paddingLeft: 4,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#FED7AA',
  },
});
