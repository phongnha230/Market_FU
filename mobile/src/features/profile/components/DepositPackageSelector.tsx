import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DEPOSIT_PACKAGES, DepositPackage } from '../constants/depositPackages.constants';

interface DepositPackageSelectorProps {
  selectedAmount: number;
  onSelectPackage: (pkg: DepositPackage) => void;
}

export const DepositPackageSelector: React.FC<DepositPackageSelectorProps> = memo(({
  selectedAmount,
  onSelectPackage,
}) => {
  return (
    <View style={styles.grid}>
      {DEPOSIT_PACKAGES.map((pkg) => {
        const isSelected = selectedAmount === pkg.amount;
        return (
          <TouchableOpacity
            key={pkg.amount}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => onSelectPackage(pkg)}
            activeOpacity={0.7}
          >
            {pkg.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pkg.badge}</Text>
              </View>
            )}
            <Text style={[styles.coinsText, isSelected && styles.coinsTextSelected]}>
              +{pkg.coins} Xu
            </Text>
            <Text style={styles.amountText}>
              {pkg.amount.toLocaleString('vi-VN')}đ
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  card: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
    minHeight: 70,
    justifyContent: 'center',
  },
  cardSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: 8,
    backgroundColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  coinsText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  coinsTextSelected: {
    color: '#EA580C',
  },
  amountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});

export default DepositPackageSelector;
