import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

export const ChatProductStrip: React.FC = () => {
  return (
    <View style={styles.strip}>
      <Image
        source={require('../../../../assets/products/keyboard-akko.jpg')}
        style={styles.thumb}
        contentFit="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>Bàn phím cơ Akko 3087 v2 Orange Switch</Text>
        <Text style={styles.price}>520.000đ</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Thỏa thuận Handoff</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  thumb: { width: 36, height: 36, borderRadius: 6 },
  content: { flex: 1, marginLeft: 10 },
  title: { fontSize: 11.5, fontWeight: '700', color: '#0F172A' },
  price: { fontSize: 11, fontWeight: '800', color: '#DC2626', marginTop: 1 },
  badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 9.5, fontWeight: '700', color: '#2563EB' },
});

export default ChatProductStrip;
