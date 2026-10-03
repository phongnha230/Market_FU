import React, { useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet, ListRenderItemInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatInputBarProps {
  text: string;
  onChangeText: (text: string) => void;
  onSend: (text?: string) => void;
  quickReplies: string[];
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  text,
  onChangeText,
  onSend,
  quickReplies,
}) => {
  const renderChip = useCallback(
    ({ item: reply }: ListRenderItemInfo<string>) => (
      <TouchableOpacity
        style={styles.chip}
        activeOpacity={0.7}
        onPress={() => onSend(reply)}
      >
        <Text style={styles.chipText}>{reply}</Text>
      </TouchableOpacity>
    ),
    [onSend]
  );

  return (
    <View style={styles.container}>
      {/* Quick reply chips */}
      <FlatList
        horizontal
        data={quickReplies}
        keyExtractor={(item) => item}
        renderItem={renderChip}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      />

      {/* Input area */}
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.mediaBtn}>
          <Ionicons name="camera-outline" size={22} color="#64748B" />
        </TouchableOpacity>

        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.sendBtn, text.trim() ? styles.sendBtnActive : null]}
          disabled={!text.trim()}
          onPress={() => onSend()}
        >
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingBottom: 24, paddingTop: 6 },
  chipRow: { paddingHorizontal: 16, marginBottom: 6 },
  chip: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6 },
  chipText: { fontSize: 11, color: '#2563EB', fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  mediaBtn: { padding: 6, marginRight: 6 },
  input: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 20, paddingHorizontal: 14, height: 38, fontSize: 13, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' },
  sendBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendBtnActive: { backgroundColor: '#F27024' },
});

export default ChatInputBar;
