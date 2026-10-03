import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import productMobileService from '../../../services/productMobileService';

const DEFAULT_TRENDING = [
  'Giáo trình C/C++',
  'Màn hình 24 inch',
  'Xe máy điện',
  'Tai nghe chống ồn',
  'Bàn phím cơ',
  'Pass đồ K18',
  'iPad Air',
  'Sách Kinh tế',
];

const HIT_SLOP_6 = { top: 6, bottom: 6, left: 6, right: 6 } as const;

interface KeywordItemProps {
  keyword: string;
  isTop: boolean;
  onSelect: (kw: string) => void;
}

const KeywordItem: React.FC<KeywordItemProps> = React.memo(({ keyword, isTop, onSelect }) => {
  const handlePress = useCallback(() => {
    onSelect(keyword);
  }, [keyword, onSelect]);

  return (
    <TouchableOpacity
      style={styles.keywordPill}
      activeOpacity={0.75}
      onPress={handlePress}
      hitSlop={HIT_SLOP_6}
    >
      {isTop && (
        <Ionicons
          name="trending-up"
          size={11}
          color="#EA580C"
          style={styles.topRankIcon}
        />
      )}
      <Text style={[styles.keywordText, isTop && styles.keywordTextTop]}>
        {keyword}
      </Text>
    </TouchableOpacity>
  );
});
KeywordItem.displayName = 'KeywordItem';

interface TrendingSearchesBannerProps {
  onSelectKeyword: (keyword: string) => void;
}

export const TrendingSearchesBanner: React.FC<TrendingSearchesBannerProps> = ({
  onSelectKeyword,
}) => {
  const [keywords, setKeywords] = useState<string[]>(DEFAULT_TRENDING);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await productMobileService.getTrendingSearches(8);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const list = data.map((d) => d.keyword).filter(Boolean);
          if (list.length > 0) {
            setKeywords(list);
          }
        }
      } catch {
        // Fallback silently to default campus trending
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const keyExtractor = useCallback((item: string) => item, []);

  const renderItem: ListRenderItem<string> = useCallback(
    ({ item, index }) => (
      <KeywordItem
        keyword={item}
        isTop={index < 3}
        onSelect={onSelectKeyword}
      />
    ),
    [onSelectKeyword]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Ionicons name="flame" size={15} color="#EA580C" />
          <Text style={styles.titleText}>Xu hướng tìm kiếm:</Text>
        </View>
        <Text style={styles.subText}>Redis ZSET Realtime</Text>
      </View>

      <FlatList
        data={keywords}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  titleText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  subText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 6,
    paddingVertical: 2,
  },
  keywordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
  },
  topRankIcon: {
    marginRight: 3,
  },
  keywordText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  keywordTextTop: {
    color: '#EA580C',
    fontWeight: '700',
  },
});
