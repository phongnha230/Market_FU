import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '../../../components/common/ProductCard';
import { useProductStore } from '../../../stores/productStore';

interface ProductRelatedSectionProps {
  currentProductId: string;
  category?: string;
  sellerId?: string;
  sellerName?: string;
}

export const ProductRelatedSection: React.FC<ProductRelatedSectionProps> = memo(({
  currentProductId,
  category,
  sellerId,
  sellerName,
}) => {
  const navigation = useNavigation<any>();
  const { products } = useProductStore();

  // 1. Sản phẩm cùng người bán
  const sellerProducts = products.filter(
    (p) =>
      p.id !== currentProductId &&
      ((sellerId && p.sellerId === sellerId) ||
        (sellerName && p.sellerName && p.sellerName.toLowerCase() === sellerName.toLowerCase()))
  );

  // 2. Sản phẩm tương tự (cùng category hoặc ngẫu nhiên các món khác)
  const similarProducts = products.filter(
    (p) => p.id !== currentProductId && (!sellerId || p.sellerId !== sellerId)
  );

  return (
    <View style={styles.container}>
      {/* Khối 1: Các món đồ khác từ Người bán này */}
      {sellerProducts.length > 0 && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="storefront-outline" size={17} color="#EA580C" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Món khác từ {sellerName || 'Người bán này'}</Text>
            </View>
            <Text style={styles.badgeCount}>{sellerProducts.length} món</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {sellerProducts.map((item) => (
              <View key={`seller-p-${item.id}`} style={styles.cardItem}>
                <ProductCard
                  id={item.id}
                  title={item.title}
                  price={item.price.toLocaleString('vi-VN')}
                  location={item.campus || 'Hòa Lạc'}
                  seller={item.sellerName}
                  image={item.images?.[0]}
                  cardStyle={{ width: '100%', marginBottom: 0 }}
                  onPress={() => navigation.push('ProductDetail', { productId: item.id })}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Khối 2: Gợi ý sản phẩm tương tự cùng danh mục */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <Ionicons name="sparkles-outline" size={17} color="#EA580C" style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Sản phẩm tương tự bạn có thể thích</Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ProductList', {
                mode: 'CAMPUS_ALL',
                title: 'Khám phá sản phẩm tương tự',
              })
            }
          >
            <Text style={styles.seeAllText}>Xem thêm &gt;</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          {similarProducts.slice(0, 6).map((item) => (
            <View key={`similar-p-${item.id}`} style={styles.cardItem}>
              <ProductCard
                id={item.id}
                title={item.title}
                price={item.price.toLocaleString('vi-VN')}
                location={item.campus || 'Hòa Lạc'}
                seller={item.sellerName}
                image={item.images?.[0]}
                cardStyle={{ width: '100%', marginBottom: 0 }}
                onPress={() => navigation.push('ProductDetail', { productId: item.id })}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    paddingTop: 14,
    paddingBottom: 24,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  cardItem: {
    width: 175,
    marginRight: 12,
  },
});

export default ProductRelatedSection;
