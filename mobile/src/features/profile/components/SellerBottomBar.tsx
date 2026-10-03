import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SellerBottomBarProps {
  onOpenChat: () => void;
  insetsBottom: number;
}

export const SellerBottomBar: React.FC<SellerBottomBarProps> = ({
  onOpenChat,
  insetsBottom,
}) => {
  return (
    <View style={[styles.bottomBar, { paddingBottom: Math.max(insetsBottom, 10) + 6 }]}>
      <TouchableOpacity style={styles.chatBtn} activeOpacity={0.88} onPress={onOpenChat}>
        <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.chatBtnText}>Nhắn tin với người bán</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    boxShadow: '0 -3px 6px rgba(0, 0, 0, 0.05)',
  },
  chatBtn: {
    flexDirection: 'row',
    backgroundColor: '#EA580C',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 3px 6px rgba(234, 88, 12, 0.3)',
  },
  chatBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
