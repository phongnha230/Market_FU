import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DisputeHeader from '../components/DisputeHeader';
import DisputeStatusBanner from '../components/DisputeStatusBanner';
import DisputeTypeSelector from '../components/DisputeTypeSelector';
import DisputeReasonSection from '../components/DisputeReasonSection';
import DisputeEvidenceSection from '../components/DisputeEvidenceSection';
import DisputeSubmitBar from '../components/DisputeSubmitBar';
import useDispute from '../hooks/useDispute';
import { DisputeScreenProps } from '../types/dispute.types';

export const DisputeScreen: React.FC<DisputeScreenProps> = ({ onGoBack }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const orderId = route.params?.orderId;
  const productTitle = route.params?.productTitle;
  const sellerName = route.params?.sellerName;
  const price = route.params?.price;

  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation) {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const {
    disputeType,
    setDisputeType,
    reasons,
    selectedReasons,
    toggleReason,
    evidenceList,
    removeEvidence,
    description,
    setDescription,
    handleSubmit,
  } = useDispute(handleBack, orderId);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      <DisputeHeader onGoBack={handleBack} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {orderId && (
            <View style={styles.orderContextCard}>
              <View style={styles.orderCodeRow}>
                <Ionicons name="receipt" size={14} color="#DC2626" />
                <Text style={styles.orderCodeText}>Đang khiếu nại đơn: #{orderId}</Text>
              </View>
              {productTitle && <Text style={styles.orderProductTitle} numberOfLines={1}>{productTitle}</Text>}
              <View style={styles.orderMetaRow}>
                {sellerName && <Text style={styles.orderMetaText}>Người bán: {sellerName}</Text>}
                {price && <Text style={styles.orderPriceText}>{price}</Text>}
              </View>
            </View>
          )}

          <DisputeStatusBanner />
          <DisputeTypeSelector selectedType={disputeType} onSelect={setDisputeType} />
          <DisputeReasonSection
            reasons={reasons}
            selectedReasons={selectedReasons}
            onToggleReason={toggleReason}
            description={description}
            onChangeDescription={setDescription}
          />
          <DisputeEvidenceSection
            evidenceList={evidenceList}
            onRemoveEvidence={removeEvidence}
          />
        </ScrollView>

        <DisputeSubmitBar onSubmit={handleSubmit} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardContainer: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  orderContextCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
  },
  orderCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderCodeText: { fontSize: 12, fontWeight: '800', color: '#DC2626' },
  orderProductTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  orderMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  orderMetaText: { fontSize: 11, color: '#64748B' },
  orderPriceText: { fontSize: 12.5, fontWeight: '900', color: '#DC2626' },
});

export default DisputeScreen;
