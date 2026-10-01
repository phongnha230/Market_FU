import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductCardProps } from '../../../components/common/ProductCard';

export interface SearchSuggestionsDropdownProps {
  searchText: string;
  products: ProductCardProps[];
  onSelectKeyword: (keyword: string) => void;
  onSelectProduct: (productId: string) => void;
  onClose?: () => void;
}

const POPULAR_KEYWORDS = [
  'Vovinam',
  'Giáo trình CSD201',
  'Macbook M1',
  'Quạt KTX',
  'Màn hình 24 inch',
  'Chuột Logitech',
  'Bàn phím cơ',
  'Bình giữ nhiệt FPT',
];

export const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({
  searchText,
  products,
  onSelectKeyword,
  onSelectProduct,
  onClose,
}) => {
  const query = searchText.trim().toLowerCase();

  // Keyword suggestions
  const matchedKeywords = POPULAR_KEYWORDS.filter((k) =>
    k.toLowerCase().includes(query)
  ).slice(0, 4);

  // Matched products (up to 4 items)
  const matchedProducts = products
    .filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.seller.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
    )
    .slice(0, 4);

  if (!query && matchedKeywords.length === 0) {
    return null;
  }

  return (
    <View style={styles.dropdownContainer}>
      <View style={styles.headerRow}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagBadgeText}>Gợi ý từ Shopee Campus</Text>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={styles.scrollList}>
        {/* Keyword rows */}
        {matchedKeywords.length > 0 && (
          <View style={styles.section}>
            {matchedKeywords.map((kw, idx) => (
              <TouchableOpacity
                key={`kw-${idx}`}
                style={styles.keywordRow}
                activeOpacity={0.7}
                onPress={() => onSelectKeyword(kw)}
              >
                <View style={styles.searchIconBg}>
                  <Ionicons name="search" size={14} color="#EA580C" />
                </View>
                <Text style={styles.keywordText} numberOfLines={1}>
                  <Text style={styles.keywordHighlight}>{query}</Text>
                  {kw.toLowerCase().startsWith(query) ? kw.slice(query.length) : ` (${kw})`}
                </Text>
                <Ionicons name="arrow-forward-outline" size={14} color="#CBD5E1" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Product suggestions */}
        {matchedProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.productSectionHeader}>
              <Text style={styles.sectionLabel}>Sản phẩm phù hợp nhất</Text>
              <Text style={styles.sectionCount}>{matchedProducts.length} kết quả</Text>
            </View>

            {matchedProducts.map((prod) => (
              <TouchableOpacity
                key={`prod-${prod.id}`}
                style={styles.productRow}
                activeOpacity={0.75}
                onPress={() => onSelectProduct(prod.id)}
              >
                <Image
                  source={typeof prod.image === 'string' ? { uri: prod.image } : prod.image}
                  style={styles.productThumb}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={1}>
                    {prod.title}
                  </Text>
                  <View style={styles.productMetaRow}>
                    <Text style={styles.productPrice}>{prod.price}đ</Text>
                    <View style={styles.campusChip}>
                      <Text style={styles.campusChipText}>{prod.location}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>Xem</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {matchedProducts.length === 0 && matchedKeywords.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={24} color="#CBD5E1" />
            <Text style={styles.emptyText}>Không tìm thấy kết quả phù hợp cho "{searchText}"</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    marginHorizontal: 16,
    marginTop: -4,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    maxHeight: 330,
    overflow: 'hidden',
    zIndex: 999,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    backgroundColor: '#FFF7ED',
  },
  tagBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
  },
  scrollList: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  section: {
    marginBottom: 6,
  },
  keywordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  keywordText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
  },
  keywordHighlight: {
    color: '#EA580C',
    fontWeight: '700',
  },
  productSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 4,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 10,
    color: '#94A3B8',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginVertical: 2,
  },
  productThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
    marginRight: 6,
  },
  campusChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  campusChipText: {
    fontSize: 9.5,
    color: '#475569',
  },
  viewBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
  },
});

export default SearchSuggestionsDropdown;
