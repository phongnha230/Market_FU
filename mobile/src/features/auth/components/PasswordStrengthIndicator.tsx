import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  if (!password) return null;

  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [hasMinLen, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthColor = () => {
    if (strengthScore <= 1) return '#EF4444';
    if (strengthScore === 2) return '#F59E0B';
    if (strengthScore === 3) return '#3B82F6';
    return '#10B981';
  };

  const getStrengthLabel = () => {
    if (strengthScore <= 1) return 'Yếu';
    if (strengthScore === 2) return 'Trung bình';
    if (strengthScore === 3) return 'Khá an toàn';
    return 'Rất an toàn ✓';
  };

  const strengthColor = getStrengthColor();

  return (
    <View style={styles.strengthCard}>
      <View style={styles.strengthBarRow}>
        {[1, 2, 3, 4].map((step) => {
          const isFilled = strengthScore >= step;
          return (
            <View
              key={step}
              style={[
                styles.strengthBar,
                { backgroundColor: isFilled ? strengthColor : '#E2E8F0' },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.strengthStatusRow}>
        <Text style={styles.strengthHintText}>Độ bảo mật mật khẩu:</Text>
        <Text style={[styles.strengthLevelText, { color: strengthColor }]}>
          {getStrengthLabel()}
        </Text>
      </View>

      <View style={styles.criteriaGrid}>
        <View style={styles.criteriaItem}>
          <Ionicons
            name={hasMinLen ? 'checkmark-circle' : 'ellipse-outline'}
            size={13}
            color={hasMinLen ? '#10B981' : '#94A3B8'}
          />
          <Text style={[styles.criteriaText, hasMinLen && styles.criteriaTextActive]}>
            ≥ 8 ký tự
          </Text>
        </View>
        <View style={styles.criteriaItem}>
          <Ionicons
            name={hasUpper ? 'checkmark-circle' : 'ellipse-outline'}
            size={13}
            color={hasUpper ? '#10B981' : '#94A3B8'}
          />
          <Text style={[styles.criteriaText, hasUpper && styles.criteriaTextActive]}>
            Chữ hoa [A-Z]
          </Text>
        </View>
        <View style={styles.criteriaItem}>
          <Ionicons
            name={hasNumber ? 'checkmark-circle' : 'ellipse-outline'}
            size={13}
            color={hasNumber ? '#10B981' : '#94A3B8'}
          />
          <Text style={[styles.criteriaText, hasNumber && styles.criteriaTextActive]}>
            Chữ số [0-9]
          </Text>
        </View>
        <View style={styles.criteriaItem}>
          <Ionicons
            name={hasSpecial ? 'checkmark-circle' : 'ellipse-outline'}
            size={13}
            color={hasSpecial ? '#10B981' : '#94A3B8'}
          />
          <Text style={[styles.criteriaText, hasSpecial && styles.criteriaTextActive]}>
            Ký tự đặc biệt (!@#$)
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  strengthCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  strengthBarRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  strengthHintText: {
    fontSize: 11,
    color: '#64748B',
  },
  strengthLevelText: {
    fontSize: 11,
    fontWeight: '700',
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    gap: 4,
  },
  criteriaText: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  criteriaTextActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
});
