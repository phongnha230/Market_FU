import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';

interface HomeSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onScanPress?: () => void;
  onFilterPress?: () => void;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  value,
  onChangeText,
  onScanPress,
  onFilterPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#EA580C" style={styles.searchIcon} />
        <TextInput
          placeholder="Tìm kiếm Meilisearch, #hashtag..."
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onChangeText('')}
            style={{ marginRight: 8 }}
          >
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={onScanPress}
        >
          <MaterialCommunityIcons name="scan-helper" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.filterButton}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={onFilterPress}
      >
        <Ionicons name="options-outline" size={20} color={theme.colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.neutral.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});

export default HomeSearchBar;
