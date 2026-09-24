import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExploreSearchBarProps {
  searchText: string;
  onChangeText: (text: string) => void;
  onGoBack?: () => void;
  onClearText?: () => void;
}

export const ExploreSearchBar: React.FC<ExploreSearchBarProps> = ({
  searchText,
  onChangeText,
  onGoBack,
  onClearText,
}) => {
  return (
    <View style={styles.container}>
      {onGoBack && (
        <TouchableOpacity
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onGoBack}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
      )}

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 6 }} />
        <TextInput
          value={searchText}
          onChangeText={onChangeText}
          placeholder="Tìm kiếm giáo trình, thiết bị..."
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onClearText || (() => onChangeText(''))}
          >
            <Ionicons name="close-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={onClearText || (() => onChangeText(''))}
      >
        <Text style={styles.cancelText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    marginRight: 10,
    padding: 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  cancelBtn: {
    marginLeft: 10,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});

export default ExploreSearchBar;
