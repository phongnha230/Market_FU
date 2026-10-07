import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VoucherSearchBarProps {
  onApplyCode: (code: string) => void;
  isApplying?: boolean;
}

export const VoucherSearchBar: React.FC<VoucherSearchBarProps> = ({
  onApplyCode,
  isApplying = false,
}) => {
  const [code, setCode] = useState('');

  const handleApply = () => {
    if (!code.trim()) return;
    onApplyCode(code.trim().toUpperCase());
    setCode('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons name="pricetag-outline" size={16} color="#94A3B8" style={{ marginLeft: 12 }} />
        <TextInput
          style={styles.input}
          placeholder="Nhập mã ưu đãi (VD: FUV-PASSIO...)"
          placeholderTextColor="#94A3B8"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          returnKeyType="done"
          onSubmitEditing={handleApply}
        />
        {code.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => setCode('')}>
            <Ionicons name="close-circle" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.applyBtn, (!code.trim() || isApplying) && styles.applyBtnDisabled]}
        disabled={!code.trim() || isApplying}
        activeOpacity={0.8}
        onPress={handleApply}
      >
        <Text style={styles.applyBtnText}>{isApplying ? '...' : 'Áp dụng'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 42,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  clearBtn: {
    padding: 6,
    marginRight: 6,
  },
  applyBtn: {
    backgroundColor: '#EA580C',
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  applyBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
});

export default VoucherSearchBar;
