import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SavedItemsEmptyStateProps {
  onExplore: () => void;
}

export const SavedItemsEmptyState: React.FC<SavedItemsEmptyStateProps> = React.memo(({ onExplore }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="heart-dislike-outline" size={36} color="#EA580C" />
      </View>
      <Text style={styles.title}>Chưa có món đồ yêu thích nào</Text>
      <Text style={styles.desc}>
        Trong phiên đăng nhập này, bạn chưa lưu món đồ nào. Hãy nhấn biểu tượng trái tim ❤️ trên các sản phẩm bạn quan tâm để lưu tại đây.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={onExplore} activeOpacity={0.85}>
        <Text style={styles.btnText}>Khám phá Chợ Campus</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  desc: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
