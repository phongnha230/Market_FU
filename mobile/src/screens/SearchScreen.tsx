import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeSearchBar from '../features/home/components/HomeSearchBar';
import ProductCard from '../components/common/ProductCard';
import useHomeFeed from '../features/home/hooks/useHomeFeed';
import { productMobileService } from '../services/productMobileService';
import { theme } from '../config/theme';

const RECENT_SEARCHES_KEY = '@fu_recent_searches';

const DEFAULT_HOT_KEYWORDS = [
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
  const [hotKeywords, setHotKeywords] = useState<string[]>(DEFAULT_HOT_KEYWORDS);
  const { products } = useHomeFeed();

  // Load search history & dynamic trending keywords from Redis backend
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const json = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        const parsed = json ? JSON.parse(json) : null;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed);
        } else {
          setRecentSearches(['Giáo trình C#', 'Đồng phục FPT', 'Bàn gấp KTX']);
        }
      } catch {
        setRecentSearches(['Giáo trình C#', 'Đồng phục FPT', 'Bàn gấp KTX']);
      }
    };
    loadHistory();

    productMobileService
      .getTrendingSearches(8)
      .then((items) => {
        const keywords = (items || [])
          .map((i: any) => (typeof i === 'string' ? i : i?.keyword))
          .filter((k): k is string => Boolean(k && k.trim()));
        if (keywords.length > 0) {
          setHotKeywords(keywords);
        }
      })
      .catch(() => {});
  }, []);

  const saveSearchKeyword = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const updatedList = [clean, ...prev.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedList)).catch(() => {});
      return updatedList;
    });
  }, []);

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

  const handleProductPress = useCallback(
    (productId: string) => {
      saveSearchKeyword(keyword);
      navigation.navigate('ProductDetail', { productId });
    },
    [keyword, navigation, saveSearchKeyword]
  );

  const searchResults = keyword.trim()
    ? products.filter((p: any) => {
        const q = keyword.trim().toLowerCase();
        const cleanQ = q.replace(/^#+/, '');
        if (!cleanQ) return true;
        return (
          p.title.toLowerCase().includes(cleanQ) ||
          (p.location && p.location.toLowerCase().includes(cleanQ)) ||
          (p.seller && p.seller.toLowerCase().includes(cleanQ)) ||
          (Array.isArray(p.hashtags) &&
            p.hashtags.some((t: string) => t.toLowerCase().replace(/^#+/, '').includes(cleanQ)))
        );
      })
    : [];

  return (
    <View style={styles.container}>
      {/* Header với nút Back & Thanh tìm kiếm tích hợp nút Hỏi AI */}
      <View style={[styles.headerRow, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.searchBarWrapper}>
          <HomeSearchBar
            value={keyword}
            onChangeText={setKeyword}
            onAiPress={() => navigation.navigate('AiAssistant')}
            onFilterPress={() => {
              const trimmed = keyword.trim();
              navigation.navigate('ProductList', {
                mode: 'CAMPUS_ALL',
                initialKeyword: trimmed || undefined,
                title: trimmed ? `Kết quả cho "${trimmed}"` : 'Tất cả tin đăng',
              });
            }}
            onSubmitEditing={() => saveSearchKeyword(keyword)}
            autoFocus
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {keyword.trim().length === 0 ? (
          <>
            {/* Lịch sử tìm kiếm gần đây */}
            {recentSearches.length > 0 && (
              <View style={styles.sectionBox}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="time-outline" size={16} color={theme.colors.neutral.iconMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.sectionTitle}>Lịch sử tìm kiếm gần đây</Text>
                  </View>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={styles.clearBtnText}>Xóa hết</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tagWrap}>
                  {recentSearches.map((item) => (
                    <TouchableOpacity
                      key={`recent-${item}`}
                      style={styles.historyTag}
                      activeOpacity={0.7}
                      onPress={() => handleSelectKeyword(item)}
                    >
                      <Text style={styles.historyTagText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Từ khóa sinh viên tìm nhiều nhất */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="flame" size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>Từ khóa sinh viên tìm kiếm nhiều</Text>
                </View>
              </View>
              <View style={styles.tagWrap}>
                {hotKeywords.map((item) => (
                  <TouchableOpacity
                    key={`hot-${item}`}
                    style={styles.hotTag}
                    activeOpacity={0.7}
                    onPress={() => handleSelectKeyword(item)}
                  >
                    <Text style={styles.hotTagText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Thẻ mở Chatbot Cóc AI hỗ trợ tìm đồ */}
            <TouchableOpacity
              style={styles.aiCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('AiAssistant')}
            >
              <View style={styles.aiCardIcon}>
                <Ionicons name="sparkles" size={20} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiCardTitle}>Không nhớ tên món? Hỏi Cóc AI tìm giúp</Text>
                <Text style={styles.aiCardDesc}>
                  Mô tả nhu cầu (VD: giáo trình PRF192, đồ KTX dưới 150k), AI sẽ tra kho giúp bạn
                </Text>
              </View>
              <View style={styles.aiCardBadge}>
                <Text style={styles.aiCardBadgeText}>Chat ngay</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          /* Kết quả tìm kiếm thời gian thực */
          <View style={styles.resultsContainer}>
            <View style={styles.resultSummaryRow}>
              <Text style={styles.resultSummaryText}>
                Tìm thấy <Text style={{ fontWeight: '700', color: theme.colors.primary }}>{searchResults.length}</Text> kết quả cho "{keyword}"
              </Text>
            </View>

            {searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={theme.colors.border} />
                <Text style={styles.emptyTitle}>Không có kết quả nào phù hợp</Text>
                <Text style={styles.emptySub}>Hãy thử từ khóa ngắn hơn hoặc nhờ Cóc AI tìm món tương tự trong kho nhé!</Text>
                <TouchableOpacity
                  style={styles.emptyAiBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('AiAssistant')}
                >
                  <Ionicons name="sparkles" size={16} color={theme.colors.text.inverse} />
                  <Text style={styles.emptyAiBtnText} numberOfLines={1}>
                    Nhờ Cóc AI tìm giúp
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.productGrid}>
                {searchResults.map((item) => (
                  <ProductCard
                    key={item.id}
                    {...item}
                    onPress={handleProductPress}
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
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingBottom: 2,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
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
    color: theme.colors.text.primary,
  },
  clearBtnText: {
    fontSize: 12,
    color: theme.colors.text.muted,
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
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  historyTagText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  hotTag: {
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  hotTagText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
  },
  aiCardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  aiCardDesc: {
    fontSize: 11.5,
    color: theme.colors.text.secondary,
    marginTop: 2,
    lineHeight: 16,
  },
  aiCardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    flexShrink: 0,
  },
  aiCardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.inverse,
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
    color: theme.colors.text.muted,
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
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  emptyAiBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },
});

export default SearchScreen;
