import React, { memo, useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '../../../components/common/ProductCard';
import { useProductStore, ProductItem } from '../../../stores/productStore';
import { isProductInCategory } from '../../../lib/backendMappers';
import { productMobileService } from '../../../services/productMobileService';

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
  const { products, fetchProducts } = useProductStore();
  const [extraProducts, setExtraProducts] = useState<ProductItem[]>([]);

  // Tự động kéo sản phẩm từ backend nếu danh sách trong store đang rỗng hoặc quá ít
  useEffect(() => {
    if (products.length <= 1) {
      productMobileService
        .getProducts({ limit: 20 })
        .then((items) => {
          if (items && items.length > 0) {
            setExtraProducts(items);
          }
        })
        .catch(() => {});
      if (typeof fetchProducts === 'function') {
        fetchProducts().catch(() => {});
      }
    }
  }, [products.length, fetchProducts]);

  const allAvailableProducts = useMemo(() => {
    if (products.length > 1) return products;
    return extraProducts.length > 0 ? extraProducts : products;
  }, [products, extraProducts]);

  // 1. Sản phẩm cùng người bán
  const sellerProducts = useMemo(() => {
    return allAvailableProducts.filter(
      (p) =>
        p.id !== currentProductId &&
        ((sellerId && p.sellerId === sellerId) ||
          (sellerName && p.sellerName && p.sellerName.toLowerCase() === sellerName.toLowerCase()))
    );
  }, [allAvailableProducts, currentProductId, sellerId, sellerName]);

  // 2. Sản phẩm tương tự (ưu tiên cùng category, sau đó bổ sung các món khác)
  const similarProducts = useMemo(() => {
    const pool = allAvailableProducts.filter(
      (p) => p.id !== currentProductId && (!sellerId || p.sellerId !== sellerId)
    );

    if (!category) return pool.slice(0, 8);

    const sameCategory = pool.filter((p) => isProductInCategory(p, category));
    const differentCategory = pool.filter((p) => !isProductInCategory(p, category));

    return [...sameCategory, ...differentCategory].slice(0, 8);
  }, [allAvailableProducts, currentProductId, sellerId, category]);

  const handleProductPress = useCallback(
    (productId: string) => {
      navigation.push('ProductDetail', { productId });
    },
    [navigation]
  );

  if (sellerProducts.length === 0 && similarProducts.length === 0) {
    return null;
  }

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
            {sellerProducts.map((item) => {
              const hasDiscount = Boolean(item.originalPrice && item.originalPrice > item.price);
              const discountPercent = hasDiscount
                ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)
                : undefined;

              return (
                <View key={`seller-p-${item.id}`} style={styles.cardItem}>
                  <ProductCard
                    id={item.id}
                    title={item.title}
                    price={item.price.toLocaleString('vi-VN')}
                    originalPrice={hasDiscount ? item.originalPrice!.toLocaleString('vi-VN') : undefined}
                    discountBadge={hasDiscount ? `-${discountPercent}%` : undefined}
                    location={item.campus || 'Hòa Lạc'}
                    seller={item.sellerName}
                    sellerAvatar={item.sellerAvatar}
                    image={item.images?.[0]}
                    cardStyle={{ width: '100%', marginBottom: 0 }}
                    onPress={handleProductPress}
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Khối 2: Gợi ý sản phẩm tương tự cùng danh mục */}
      {similarProducts.length > 0 && (
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
          <View style={styles.gridContainer}>
            {similarProducts.slice(0, 8).map((item) => {
              const hasDiscount = Boolean(item.originalPrice && item.originalPrice > item.price);
              const discountPercent = hasDiscount
                ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)
                : undefined;

              return (
                <View key={`similar-p-${item.id}`} style={styles.gridItem}>
                  <ProductCard
                    id={item.id}
                    title={item.title}
                    price={item.price.toLocaleString('vi-VN')}
                    originalPrice={hasDiscount ? item.originalPrice!.toLocaleString('vi-VN') : undefined}
                    discountBadge={hasDiscount ? `-${discountPercent}%` : undefined}
                    location={item.campus || 'Hòa Lạc'}
                    seller={item.sellerName}
                    sellerAvatar={item.sellerAvatar}
                    image={item.images?.[0]}
                    cardStyle={{ width: '100%', marginBottom: 0 }}
                    onPress={handleProductPress}
                  />
                </View>
              );
            })}
          </View>
        </View>
      )}
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    rowGap: 12,
  },
  gridItem: {
    width: '48.5%',
  },
});

export default ProductRelatedSection;
