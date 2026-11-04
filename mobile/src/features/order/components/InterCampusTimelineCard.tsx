import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface InterCampusStep {
  step: number;
  title: string;
  desc: string;
  time: string;
  completed: boolean;
  active: boolean;
  badge: string;
  badgeColor: string;
  badgeBg: string;
}

export interface GhnTrackingLogItem {
  status: string;
  statusText: string;
  time: string;
}

interface InterCampusTimelineCardProps {
  steps: InterCampusStep[];
  ghnLogs?: GhnTrackingLogItem[];
  shippingPartner?: string;
  trackingCode?: string;
}

export const InterCampusTimelineCard: React.FC<InterCampusTimelineCardProps> = ({
  steps,
  ghnLogs = [],
  shippingPartner,
  trackingCode,
}) => {
  return (
    <View style={styles.timelineCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.timelineHeading}>Hành trình vận chuyển & Ký quỹ Escrow</Text>
        {trackingCode && (
          <View style={styles.partnerBadge}>
            <Ionicons name="cube" size={11} color="#2563EB" />
            <Text style={styles.partnerBadgeText}>{shippingPartner || 'GHN Express'}</Text>
          </View>
        )}
      </View>

      <View style={styles.timelineList}>
        {steps.map((st, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <View key={st.step} style={styles.stepRow}>
              <View style={styles.stepLeftCol}>
                <View
                  style={[
                    styles.stepDot,
                    st.completed
                      ? styles.stepDotCompleted
                      : st.active
                      ? styles.stepDotActive
                      : styles.stepDotInactive,
                  ]}
                >
                  {st.completed ? (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  ) : st.active ? (
                    <View style={styles.innerPulse} />
                  ) : (
                    <Text style={styles.inactiveStepNum}>{st.step}</Text>
                  )}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.stepLine,
                      st.completed ? styles.stepLineCompleted : styles.stepLineInactive,
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepRightCol}>
                <View style={styles.stepHeaderRow}>
                  <Text style={[styles.stepTitle, st.active && { color: '#7C3AED' }]}>{st.title}</Text>
                  <View style={[styles.stepBadge, { backgroundColor: st.badgeBg }]}>
                    <Text style={[styles.stepBadgeText, { color: st.badgeColor }]}>{st.badge}</Text>
                  </View>
                </View>
                <Text style={styles.stepDesc}>{st.desc}</Text>
                <Text style={styles.stepTime}>{st.time}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Realtime GHN Logs Section if available */}
      {ghnLogs.length > 0 && (
        <View style={styles.ghnLogsContainer}>
          <View style={styles.ghnHeaderRow}>
            <Ionicons name="radio" size={14} color="#16A34A" />
            <Text style={styles.ghnHeaderTitle}>Nhật ký bưu tá Realtime ({shippingPartner || 'GHN'})</Text>
          </View>
          <View style={styles.ghnList}>
            {ghnLogs.map((log, lIdx) => (
              <View key={`${log.status}-${lIdx}`} style={styles.ghnLogRow}>
                <View style={[styles.ghnDot, lIdx === 0 && styles.ghnDotLatest]} />
                <View style={styles.ghnLogContent}>
                  <Text style={[styles.ghnLogText, lIdx === 0 && styles.ghnLogTextLatest]}>
                    {log.statusText || log.status}
                  </Text>
                  {log.time ? <Text style={styles.ghnLogTime}>{log.time}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  timelineCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineHeading: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  timelineList: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepLeftCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepDotCompleted: {
    backgroundColor: '#16A34A',
  },
  stepDotActive: {
    backgroundColor: '#7C3AED',
  },
  stepDotInactive: {
    backgroundColor: '#E2E8F0',
  },
  innerPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  inactiveStepNum: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  stepLineCompleted: {
    backgroundColor: '#16A34A',
  },
  stepLineInactive: {
    backgroundColor: '#E2E8F0',
  },
  stepRightCol: {
    flex: 1,
    paddingTop: 1,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  stepTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  stepBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    flexShrink: 0,
  },
  stepBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  stepDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginTop: 3,
  },
  stepTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexShrink: 0,
  },
  partnerBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  ghnLogsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  ghnHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  ghnHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16A34A',
  },
  ghnList: {
    paddingLeft: 6,
  },
  ghnLogRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ghnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginRight: 10,
    marginTop: 4,
  },
  ghnDotLatest: {
    backgroundColor: '#16A34A',
  },
  ghnLogContent: {
    flex: 1,
  },
  ghnLogText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  ghnLogTextLatest: {
    color: '#0F172A',
    fontWeight: '700',
  },
  ghnLogTime: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 2,
  },
});
