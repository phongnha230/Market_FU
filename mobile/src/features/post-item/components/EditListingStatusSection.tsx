import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProductItem } from '../../../stores/productStore';
import { STATUS_OPTIONS } from '../constants/listingStatus.constants';


interface EditListingStatusSectionProps {
  status: ProductItem['status'];
  onChangeStatus: (status: ProductItem['status']) => void;
}

export const EditListingStatusSection: React.FC<EditListingStatusSectionProps> = React.memo(({
  status,
  onChangeStatus,
}) => {
  return (
    <View>
      <Text style={styles.inputLabel}>Trạng thái tin đăng</Text>
      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[
              styles.statusChip,
              status === opt.id && {
                backgroundColor: opt.bg,
                borderColor: opt.color,
              },
            ]}
            onPress={() => onChangeStatus(opt.id)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: status === opt.id ? opt.color : '#94A3B8' },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                status === opt.id && { color: opt.color, fontWeight: '800' },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  statusChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
});
