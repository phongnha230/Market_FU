import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditListingNegotiateSwitchProps {
  allowNegotiate: boolean;
  onToggle: () => void;
}

export const EditListingNegotiateSwitch: React.FC<EditListingNegotiateSwitchProps> = ({
  allowNegotiate,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      style={styles.switchRow}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.switchTitle}>Cho phép người mua trả giá (Make Offer)</Text>
        <Text style={styles.switchSub}>Người mua có thể gửi đề xuất giá qua khung Chat</Text>
      </View>
      <Ionicons
        name={allowNegotiate ? 'toggle' : 'toggle-outline'}
        size={32}
        color={allowNegotiate ? '#EA580C' : '#CBD5E1'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  switchTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  switchSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
