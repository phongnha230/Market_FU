import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FeedHeaderProps {
  title?: string;
  subtitle?: string;
  onSeeAllPress?: () => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  title = 'Tin mới tại Hola',
  subtitle = 'Trao đổi tận tay trong campus 5 phút',
  onSeeAllPress,
}) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllPress}>
        <Text style={styles.seeAll}>Xem hết ›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  seeAll: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F27024',
  },
});

export default FeedHeader;
