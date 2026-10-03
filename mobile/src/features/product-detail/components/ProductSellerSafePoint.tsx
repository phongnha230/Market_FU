import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ProductDetailData } from '../types/product-detail.types';

interface ProductSellerSafePointProps {
  seller: ProductDetailData['seller'];
  safePointInfo: ProductDetailData['safePointInfo'];
}

export const ProductSellerSafePoint: React.FC<ProductSellerSafePointProps> = ({
  seller,
  safePointInfo,
}) => {
  const navigation = useNavigation<any>();

  const handleViewShop = () => {
    navigation.navigate('PublicSellerProfile', {
      userId: (seller as any).id || (seller as any).userId || 'acc_seller',
      sellerName: seller.name,
    });
  };

  const handleOpenSafePoints = () => {
    navigation.navigate('SafePointHubs');
  };

  return (
    <View style={styles.container}>
      {/* 1. Seller Profile */}
      <TouchableOpacity
        style={styles.sellerCard}
        activeOpacity={0.8}
        onPress={handleViewShop}
      >
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.sellerInfo}>
          <View style={styles.sellerNameRow}>
            <Text style={styles.sellerName}>{seller.name}</Text>
            {seller.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.sellerMajor}>{seller.major}</Text>
          <View style={styles.sellerMetaRow}>
            <Text style={styles.sellerRating}>{seller.rating}</Text>
            <Text style={styles.sellerSold}> • Đã bán {seller.soldCount} món</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewShopBtn} onPress={handleViewShop} activeOpacity={0.7}>
          <Text style={styles.viewShopText}>Xem shop</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* 2. Safe Point Trust Box */}
      <TouchableOpacity
        style={styles.safePointBox}
        activeOpacity={0.8}
        onPress={handleOpenSafePoints}
      >
        <View style={styles.safeIconCircle}>
          <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
        </View>
        <View style={styles.safeContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.safeTitle}>{safePointInfo.name}</Text>
            <Ionicons name="chevron-forward" size={15} color="#059669" />
          </View>
          <Text style={styles.safeDesc}>{safePointInfo.desc}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sellerCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F27024', alignItems: 'center', justifyContent: 'center' },
  sellerInfo: { flex: 1, marginLeft: 12 },
  sellerNameRow: { flexDirection: 'row', alignItems: 'center' },
  sellerName: { fontSize: 13.5, fontWeight: '800', color: '#0F172A' },
  sellerMajor: { fontSize: 11, color: '#64748B', marginTop: 1 },
  sellerMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  sellerRating: { fontSize: 11, fontWeight: '800', color: '#D97706' },
  sellerSold: { fontSize: 11, color: '#64748B' },
  viewShopBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE' },
  viewShopText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  safePointBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  safeIconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' },
  safeContent: { flex: 1, marginLeft: 10 },
  safeTitle: { fontSize: 12, fontWeight: '800', color: '#065F46' },
  safeDesc: { fontSize: 10.5, color: '#047857', marginTop: 2, lineHeight: 14 },
});

export default ProductSellerSafePoint;
