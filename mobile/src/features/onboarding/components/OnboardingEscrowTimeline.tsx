import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ONBOARDING_ESCROW_STEPS } from '../constants/onboarding.constants';

export const OnboardingEscrowTimeline: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="sync" size={15} color="#F37021" style={{ marginRight: 6 }} />
          <Text style={styles.headerTitle}>QUY TRÌNH 4 BƯỚC ESCROW</Text>
        </View>
        <View style={styles.autoBadge}>
          <Text style={styles.autoBadgeText}>Tự động</Text>
        </View>
      </View>

      <View style={styles.timelineRow}>
        {/* Connecting Line behind nodes */}
        <View style={styles.trackLine} />

        {ONBOARDING_ESCROW_STEPS.map((step, idx) => {
          return (
            <React.Fragment key={step.id}>
              <View style={styles.nodeItem}>
                <View
                  style={[
                    styles.nodeCircle,
                    step.isActive ? styles.nodeCircleActive : styles.nodeCircleGlass,
                  ]}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={step.isActive ? '#FFFFFF' : step.color}
                  />
                </View>
                <Text
                  style={[
                    styles.nodeLabel,
                    step.isActive && styles.nodeLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>

              {idx < ONBOARDING_ESCROW_STEPS.length - 1 && (
                <Ionicons
                  name="chevron-forward"
                  size={12}
                  color="#94A3B8"
                  style={styles.arrowIcon}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 14,
    marginVertical: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  autoBadge: {
    backgroundColor: 'rgba(209, 250, 229, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  autoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    paddingHorizontal: 4,
  },
  trackLine: {
    position: 'absolute',
    top: 17,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 0,
  },
  nodeItem: {
    alignItems: 'center',
    zIndex: 1,
  },
  nodeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  nodeCircleGlass: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  nodeCircleActive: {
    backgroundColor: '#F37021',
    borderWidth: 2,
    borderColor: '#FED7AA',
    shadowColor: '#F37021',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  arrowIcon: {
    marginTop: -16,
    zIndex: 1,
  },
  nodeLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
    marginTop: 6,
  },
  nodeLabelActive: {
    color: '#F37021',
    fontWeight: '800',
  },
});

export default OnboardingEscrowTimeline;
