import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';

interface OrderStat {
  id: string;
  label: string;
  count: number;
  icon: string;
}

interface OrdersOverviewSectionProps {
  title?: string;
  stats: OrderStat[];
  onPressStatus?: (id: string) => void;
}

export const OrdersOverviewSection: React.FC<OrdersOverviewSectionProps> = ({
  title = 'Đơn mua của tôi',
  stats,
  onPressStatus,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => onPressStatus && onPressStatus('all')}>
          <Text style={styles.seeAll}>Xem lịch sử ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        {stats.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.statBox}
            activeOpacity={0.7}
            onPress={() => onPressStatus && onPressStatus(item.id)}
          >
            <View style={styles.iconBox}>
              <Ionicons name={item.icon as any} size={20} color={theme.colors.primary} />
              {item.count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.count}</Text>
                </View>
              )}
            </View>
            <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 14, marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 13.5, fontWeight: '800', color: theme.colors.text.primary },
  seeAll: { fontSize: 11.5, fontWeight: '700', color: theme.colors.primary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  statBox: { alignItems: 'center', flex: 1 },
  iconBox: { position: 'relative', padding: 4 },
  badge: { position: 'absolute', top: -2, right: -4, backgroundColor: '#EF4444', borderRadius: 7, minWidth: 14, height: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  badgeText: { color: '#FFFFFF', fontSize: 8.5, fontWeight: '900' },
  label: { fontSize: 10.5, color: '#475569', fontWeight: '600', marginTop: 4 },
});

export default OrdersOverviewSection;
