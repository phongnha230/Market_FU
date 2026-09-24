import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductBottomBarProps {
  onChat: () => void;
  onBuyNow: () => void;
}

export const ProductBottomBar: React.FC<ProductBottomBarProps> = ({ onChat, onBuyNow }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.chatBtn}
        activeOpacity={0.8}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        onPress={onChat}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#0F172A" />
        <Text style={styles.chatText}>Nhắn tin hẹn</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buyBtn}
        activeOpacity={0.88}
        onPress={onBuyNow}
      >
        <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.buyText}>Mua ngay (Giữ tiền Escrow)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  chatBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginRight: 10,
  },
  chatText: { fontSize: 10.5, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  buyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F27024',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F27024',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buyText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' },
});

export default ProductBottomBar;
