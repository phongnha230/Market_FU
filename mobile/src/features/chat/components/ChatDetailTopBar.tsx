import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSafeAvatar } from '../../../lib/imageResolver';

interface ChatDetailTopBarProps {
  partner: {
    name: string;
    avatar?: string;
    cohort?: string;
    isOnline?: boolean;
  };
  onBack: () => void;
  onHome: () => void;
}

export const ChatDetailTopBar: React.FC<ChatDetailTopBarProps> = ({
  partner,
  onBack,
  onHome,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="#0F172A" />
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <View style={styles.headerAvatarWrapper}>
          <Image
            source={{
              uri: getSafeAvatar(partner.avatar, partner.name),
            }}
            style={styles.headerAvatar}
          />
          {partner.isOnline && <View style={styles.headerOnlineDot} />}
        </View>
        <View>
          <Text style={styles.headerName}>{partner.name}</Text>
          <Text style={styles.headerSub}>{partner.cohort || 'K16 - FPT Hola'}</Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={onHome}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="home-outline" size={19} color="#0F172A" />
        </TouchableOpacity>
      </View>
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
  backBtn: { padding: 4, marginRight: 8 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerAvatarWrapper: { position: 'relative', marginRight: 10 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E2E8F0' },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerName: { fontSize: 14.5, fontWeight: '800', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#059669', fontWeight: '600' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
