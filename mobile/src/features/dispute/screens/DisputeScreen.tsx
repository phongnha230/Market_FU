import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  } = useDispute(onGoBack);

  return (
    <View style={[styles.screen, { paddingTop: Math.max(insets.top, 0) }]}>
      <DisputeHeader onGoBack={onGoBack} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
});

export default DisputeScreen;
