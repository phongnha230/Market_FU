import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VerificationFiltersProps {
  filterVerified: boolean;
  onToggleVerified: () => void;
  filterSafeHandoff: boolean;
  onToggleSafeHandoff: () => void;
  filterTestable: boolean;
  onToggleTestable: () => void;
}

export const VerificationFilters: React.FC<VerificationFiltersProps> = ({
  filterVerified,
  onToggleVerified,
  filterSafeHandoff,
  onToggleSafeHandoff,
  filterTestable,
  onToggleTestable,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onToggleVerified}>
        <View style={[styles.checkbox, filterVerified && styles.checkboxActive]}>
          {filterVerified && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
        </View>
        <Text style={styles.label}>Chỉ xem người bán có thẻ SV Verified</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onToggleSafeHandoff}>
        <View style={[styles.checkbox, filterSafeHandoff && styles.checkboxActive]}>
          {filterSafeHandoff && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
        </View>
        <Text style={styles.label}>Có sẵn tại điểm Safe-Handoff hôm nay</Text>
        <View style={styles.hotBadge}>
          <Text style={styles.hotBadgeText}>HOT</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onToggleTestable}>
        <View style={[styles.checkbox, filterTestable && styles.checkboxActive]}>
          {filterTestable && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
        </View>
        <Text style={styles.label}>Được kiểm tra & dùng thử tại sảnh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  checkboxActive: {
    backgroundColor: '#F27024',
    borderColor: '#F27024',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  hotBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  hotBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
});

export default VerificationFilters;
