import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatPartner } from '../types/chat.types';

interface ChatHeaderProps {
  partner: ChatPartner;
  onGoBack?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ partner, onGoBack }) => {
  return (
    <View style={styles.header}>
      {onGoBack && (
        <TouchableOpacity
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onGoBack}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
      )}

      <View style={styles.avatar}>
        <Ionicons name="person" size={18} color="#FFFFFF" />
        {partner.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{partner.name}</Text>
        <Text style={styles.status}>{partner.major}</Text>
      </View>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => Alert.alert('Gọi điện thoại sinh viên')}
      >
        <Ionicons name="call-outline" size={20} color="#0F172A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: { marginRight: 8, padding: 2 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F27024', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },
  info: { flex: 1, marginLeft: 10 },
  name: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  status: { fontSize: 10.5, color: '#64748B', marginTop: 1 },
  actionBtn: { padding: 6 },
});

export default ChatHeader;
