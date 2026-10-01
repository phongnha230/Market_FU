import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductDetailHeaderProps {
  onGoBack?: () => void;
  onGoHome?: () => void;
  isSaved: boolean;
  onToggleSaved: () => void;
}

export const ProductDetailHeader: React.FC<ProductDetailHeaderProps> = ({
  onGoBack,
  onGoHome,
  isSaved,
  onToggleSaved,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.btn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={onGoBack}
      >
        <Ionicons name="arrow-back" size={22} color="#0F172A" />
      </TouchableOpacity>

      <View style={styles.center}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>FPT</Text>
        </View>
        <Text style={styles.title}>Chi Tiết Sản Phẩm</Text>
      </View>

      <View style={styles.actions}>
        {onGoHome && (
          <TouchableOpacity
            style={styles.btn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onGoHome}
          >
            <Ionicons name="home-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.btn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => Alert.alert('Chia sẻ', 'Chia sẻ sản phẩm này')}
        >
          <Ionicons name="share-social-outline" size={20} color="#0F172A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onToggleSaved}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? '#F27024' : '#0F172A'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  btn: { padding: 4 },
  center: { flexDirection: 'row', alignItems: 'center' },
  logoBadge: {
    backgroundColor: '#F27024',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 6,
  },
  logoText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  title: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  actions: { flexDirection: 'row', alignItems: 'center' },
});

export default ProductDetailHeader;
