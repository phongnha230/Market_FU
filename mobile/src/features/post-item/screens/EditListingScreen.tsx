import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditListingHeader } from '../components/EditListingHeader';
import { EditListingStatusSection } from '../components/EditListingStatusSection';
import { EditListingCampusCard } from '../components/EditListingCampusCard';
import { EditListingHashtagsSection } from '../components/EditListingHashtagsSection';
import { EditListingTitleSection } from '../components/EditListingTitleSection';
import { EditListingPriceSection } from '../components/EditListingPriceSection';
import { EditListingCategorySection } from '../components/EditListingCategorySection';
import { EditListingConditionSection } from '../components/EditListingConditionSection';
import { EditListingSafePointSection } from '../components/EditListingSafePointSection';
import { EditListingNegotiateSwitch } from '../components/EditListingNegotiateSwitch';
import { EditListingBottomBar } from '../components/EditListingBottomBar';
import { useEditListingController } from '../hooks/useEditListingController';
import { ProductItem } from '../../../stores/productStore';

export const EditListingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    formData,
    updateField,
    isApproved,
    isRejected,
    rejectionReason,
    sellerCampus,
    handleSave,
    handleDelete,
    goBack,
  } = useEditListingController();

  const handleTitleChange = useCallback(
    (text: string) => updateField('title', text),
    [updateField]
  );
  const handlePriceChange = useCallback(
    (text: string) => updateField('priceStr', text),
    [updateField]
  );
  const handleCategoryChange = useCallback(
    (cat: string) => updateField('category', cat),
    [updateField]
  );
  const handleConditionChange = useCallback(
    (cond: string) => updateField('condition', cond),
    [updateField]
  );
  const handleSafePointChange = useCallback(
    (sp: string) => updateField('safePoint', sp),
    [updateField]
  );
  const handleStatusChange = useCallback(
    (st: ProductItem['status']) => updateField('status', st),
    [updateField]
  );
  const handleHashtagsChange = useCallback(
    (tags: string[]) => updateField('hashtags', tags),
    [updateField]
  );
  const handleToggleNegotiate = useCallback(
    () => updateField('allowNegotiate', !formData.allowNegotiate),
    [updateField, formData.allowNegotiate]
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      <EditListingHeader onBack={goBack} onDelete={handleDelete} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollBody, { paddingBottom: insets.bottom + 80 }]}
        >
          {isRejected && (
            <View style={styles.rejectedBanner}>
              <View style={styles.rejectedHeader}>
                <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.rejectedTitle}>Tin đăng bị từ chối duyệt</Text>
              </View>
              <Text style={styles.rejectedReason}>
                Lý do: {rejectionReason || 'Nội dung hoặc hình ảnh vi phạm quy chế kiểm duyệt sàn.'}
              </Text>
              <Text style={styles.rejectedHint}>
                💡 Vui lòng chỉnh sửa lại thông tin bên dưới và bấm "Lưu thay đổi" để gửi lại cho Ban Quản Trị phê duyệt.
              </Text>
            </View>
          )}

          <EditListingStatusSection
            status={formData.status}
            onChangeStatus={handleStatusChange}
          />

          <EditListingTitleSection
            title={formData.title}
            onChangeTitle={handleTitleChange}
            isApproved={isApproved}
          />

          <EditListingPriceSection
            priceStr={formData.priceStr}
            onChangePriceStr={handlePriceChange}
          />

          <EditListingCategorySection
            category={formData.category}
            onChangeCategory={handleCategoryChange}
            isApproved={isApproved}
          />

          <EditListingConditionSection
            condition={formData.condition}
            onChangeCondition={handleConditionChange}
          />

          <EditListingCampusCard campus={sellerCampus} />

          <EditListingSafePointSection
            safePoint={formData.safePoint}
            onChangeSafePoint={handleSafePointChange}
          />

          <EditListingHashtagsSection
            hashtags={formData.hashtags}
            onChangeHashtags={handleHashtagsChange}
          />

          <EditListingNegotiateSwitch
            allowNegotiate={formData.allowNegotiate}
            onToggle={handleToggleNegotiate}
          />
        </ScrollView>

        <EditListingBottomBar
          paddingBottom={Math.max(insets.bottom, 12)}
          onCancel={goBack}
          onSave={handleSave}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollBody: { paddingHorizontal: 16, paddingTop: 14 },
  rejectedBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  rejectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rejectedTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  rejectedReason: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 17,
    marginBottom: 6,
  },
  rejectedHint: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 16,
    fontStyle: 'italic',
  },
});

export default EditListingScreen;
