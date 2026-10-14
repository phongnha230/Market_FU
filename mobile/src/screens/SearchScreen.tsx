import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeSearchBar from '../features/home/components/HomeSearchBar';
import ProductCard from '../components/common/ProductCard';
import useHomeFeed from '../features/home/hooks/useHomeFeed';

const RECENT_SEARCHES_KEY = '@fu_recent_searches';

const HOT_KEYWORDS = [
  '#giaotrinh',
  'Đồng phục FPT',
  'Bàn gấp KTX',
  'Xe đạp điện',
  'Tủ lạnh mini',
  'Nồi cơm điện',
  'Tai nghe Bluetooth',
  'Sách C# K19',
];

export const SearchScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [keyword, setKeyword] = useState<string>(route.params?.initialKeyword || '');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { products } = useHomeFeed();

  // Load search history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const json = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (json) {
          setRecentSearches(JSON.parse(json));
        } else {
          setRecentSearches(['Giáo trình C#', 'Đồng phục FPT', 'Bàn gấp KTX']);
        }
      } catch {
        // Ignored
      }
    };
    loadHistory();
  }, []);

  const saveSearchKeyword = async (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    try {
      const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignored
    }
  };

  const handleClearHistory = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignored
    }
  };

  const handleSelectKeyword = (term: string) => {
    setKeyword(term);
    saveSearchKeyword(term);
  };

  const searchResults = keyword.trim()
    ? products.filter((p) => {
        const q = keyword.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.seller && p.seller.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      {/* Header with Back button & Clean Search Bar matching User UI Spec */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.searchBarWrapper}>
          <HomeSearchBar
            value={keyword}
            onChangeText={(txt) => setKeyword(txt)}
            onScanPress={() => navigation.navigate('AiAssistant')}
            onFilterPress={() => {
              navigation.navigate('ProductList', {
                mode: 'CAMPUS_ALL',
                title: keyword ? `Kết quả cho "${keyword}"` : 'Tất cả tin đăng',
              });
            }}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* If no search input, show Recent History & Hot Tags */}
        {keyword.trim().length === 0 ? (
          <>
            {/* Lịch sử tìm kiếm gần đây */}
            {recentSearches.length > 0 && (
              <View style={styles.sectionBox}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="time-outline" size={16} color="#64748B" style={{ marginRight: 6 }} />
                    <Text style={styles.sectionTitle}>Lịch sử tìm kiếm gần đây</Text>
                  </View>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearBtnText}>Xóa hết</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tagWrap}>
                  {recentSearches.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.historyTag}
                      activeOpacity={0.7}
                      onPress={() => handleSelectKeyword(item)}
                    >
                      <Text style={styles.historyTagText}>{item}</Text>
                      <Ionicons name="close" size={13} color="#94A3B8" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Từ khóa sinh viên tìm nhiều nhất */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="flame" size={16} color="#F27024" style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Từ khóa sinh viên tìm kiếm nhiều</Text>
                </View>
              </View>
              <View style={styles.tagWrap}>
                {HOT_KEYWORDS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.hotTag}
                    activeOpacity={0.7}
                    onPress={() => handleSelectKeyword(item)}
                  >
                    <Text style={styles.hotTagText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Banner gợi ý */}
            <View style={styles.suggestBanner}>
              <Ionicons name="sparkles" size={20} color="#F27024" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestBannerTitle}>Gợi ý mua bán nhanh tại KTX</Text>
                <Text style={styles.suggestBannerDesc}>
                  Tìm đồ gia dụng KTX, giáo trình pass lại theo mã môn (PRF192, MAS291, PRN211...)
                </Text>
              </View>
            </View>
          </>
        ) : (
          /* When typing, show instant real-time results */
          <View style={styles.resultsContainer}>
            <View style={styles.resultSummaryRow}>
              <Text style={styles.resultSummaryText}>
                Tìm thấy <Text style={{ fontWeight: '700', color: '#EA580C' }}>{searchResults.length}</Text> kết quả cho "{keyword}"
              </Text>
            </View>

            {searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Không có kết quả nào phù hợp</Text>
                <Text style={styles.emptySub}>Hãy thử tìm kiếm với từ khóa ngắn gọn hơn hoặc tên môn học nhé!</Text>
              </View>
            ) : (
              <View style={styles.productGrid}>
                {searchResults.map((item) => (
                  <ProductCard
                    key={item.id}
                    {...item}
                    onPress={() => {
                      saveSearchKeyword(keyword);
                      navigation.navigate('ProductDetail', { productId: item.id });
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionBox: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearBtnText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  historyTagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  hotTag: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  hotTagText: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: '600',
  },
  suggestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
  },
  suggestBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  suggestBannerDesc: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 16,
  },
  resultsContainer: {
    paddingTop: 10,
  },
  resultSummaryRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  resultSummaryText: {
    fontSize: 13,
    color: '#64748B',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

export default SearchScreen;
