import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OnboardingFeature } from '../types/onboarding.types';

export const OnboardingFeatureItem: React.FC<OnboardingFeature> = ({
  iconBg,
  iconColor,
  iconName,
  iconLib = 'ionicons',
  title,
  titleBadge,
  titleBadgeColor = '#059669',
  desc,
}) => (
  <View style={styles.row}>
    <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
      {iconLib === 'mci' ? (
        <MaterialCommunityIcons name={iconName as any} size={22} color={iconColor} />
      ) : (
        <Ionicons name={iconName as any} size={22} color={iconColor} />
      )}
    </View>
    <View style={styles.textBox}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {titleBadge && (
          <View style={[styles.badge, { backgroundColor: titleBadgeColor + '22', borderColor: titleBadgeColor + '44' }]}>
            <Text style={[styles.badgeText, { color: titleBadgeColor }]}>{titleBadge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.desc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  textBox: { flex: 1, marginLeft: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  title: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  badge: { paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 6, borderWidth: 1, marginLeft: 6 },
  badgeText: { fontSize: 9.5, fontWeight: '800' },
  desc: { fontSize: 11.5, color: '#475569', lineHeight: 16 },
});

export default OnboardingFeatureItem;
