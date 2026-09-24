import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SafePointWidgetProps {
  onMapPress?: () => void;
}

export const SafePointWidget: React.FC<SafePointWidgetProps> = ({ onMapPress }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <Ionicons name="power" size={18} color="#FFFFFF" />
        <View style={styles.statusDot} />
      </View>

      <View style={styles.details}>
        <View style={styles.header}>
          <Text style={styles.title}>SAFE-HANDOFF POINT</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ĐANG MỞ</Text>
          </View>
        </View>
        <Text style={styles.desc}>
          Bàn test sạc & đo điện Sảnh Alpha có bảo vệ trực
        </Text>
      </View>

      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={onMapPress}
      >
        <Ionicons name="map-outline" size={18} color="#0F172A" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.2,
  },
  badge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#047857',
  },
  desc: {
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 14,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});

export default SafePointWidget;
