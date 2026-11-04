import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MakeOfferModalProps {
  visible: boolean;
  onClose: () => void;
  originalPrice: number;
  productTitle: string;
  sellerName: string;
  onSubmitOffer: (offeredPrice: number, message: string) => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  visible,
  onClose,
  originalPrice,
  productTitle,
  sellerName,
  onSubmitOffer,
}) => {
  const minAllowedPrice = Math.round(originalPrice * 0.5);

  const [discountPercent, setDiscountPercent] = useState<string>('10');
  const [offerPrice, setOfferPrice] = useState<number>(
    Math.round((originalPrice * 0.9) / 1000) * 1000
  );
  const [note, setNote] = useState('Em qua sảnh Alpha lấy luôn chiều nay, fix em chút nhé anh!');

  const quickDiscounts = [
    { label: '-10%', pct: 10 },
    { label: '-20%', pct: 20 },
    { label: '-30%', pct: 30 },
    { label: '-50% (Tối đa)', pct: 50 },
  ];

  const quickMessages = [
    'Em qua sảnh Alpha lấy luôn chiều nay, fix em chút nhé anh!',
    'Em là tân sinh viên K20, anh bớt em tí được không ạ?',
    'Lấy nhanh gọn trong 15 phút tại KTX.',
  ];

  const formatPrice = (val: number) => val.toLocaleString('vi-VN') + 'đ';

  const numPct = parseFloat(discountPercent) || 0;
  const isOverLimit = numPct > 50 || offerPrice < minAllowedPrice;
  const isInvalidPrice = offerPrice <= 0 || isNaN(offerPrice);
  const hasError = isOverLimit || isInvalidPrice;

  const handlePercentChange = (text: string) => {
    // Chỉ cho phép nhập số
    const cleanText = text.replace(/[^0-9.]/g, '');
    setDiscountPercent(cleanText);

    const parsedPct = parseFloat(cleanText);
    if (!isNaN(parsedPct) && parsedPct >= 0) {
      const clampedPct = Math.min(100, parsedPct);
      const calculatedPrice = Math.max(0, Math.round((originalPrice * (1 - clampedPct / 100)) / 1000) * 1000);
      setOfferPrice(calculatedPrice);
    } else if (cleanText === '') {
      setOfferPrice(originalPrice);
    }
  };

  const handlePriceChange = (text: string) => {
    const rawNumber = parseInt(text.replace(/\D/g, ''), 10);
    if (!isNaN(rawNumber)) {
      setOfferPrice(rawNumber);
      if (originalPrice > 0) {
        const calculatedPct = Math.max(0, Math.round(((originalPrice - rawNumber) / originalPrice) * 100));
        setDiscountPercent(String(calculatedPct));
      }
    } else {
      setOfferPrice(0);
      setDiscountPercent('');
    }
  };

  const handleSelectQuickDiscount = (pct: number) => {
    setDiscountPercent(String(pct));
    const calculatedPrice = Math.round((originalPrice * (1 - pct / 100)) / 1000) * 1000;
    setOfferPrice(calculatedPrice);
  };

  const handleSend = () => {
    if (hasError) {
      return;
    }
    onSubmitOffer(offerPrice, note);
  };

  const savedAmount = Math.max(0, originalPrice - offerPrice);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.badge}>
                  <Ionicons name="pricetag" size={14} color="#EA580C" />
                  <Text style={styles.badgeText}>Thương lượng cùng Campus</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                <Text style={styles.title}>Đề xuất giá với người bán</Text>
              <Text style={styles.subTitle} numberOfLines={1}>
                {productTitle} • Người bán: {sellerName}
              </Text>

              {/* Price comparison */}
              <View style={styles.priceRow}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.priceLabel}>Giá niêm yết</Text>
                  <Text style={styles.oldPrice}>{formatPrice(originalPrice)}</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#94A3B8" />
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.priceLabel}>Giá bạn đề xuất</Text>
                  <Text style={[styles.newPrice, hasError && { color: '#DC2626' }]}>
                    {formatPrice(offerPrice)}
                  </Text>
                  {savedAmount > 0 && !hasError && (
                    <Text style={styles.savedBadgeText}>
                      Tiết kiệm {formatPrice(savedAmount)} (-{numPct}%)
                    </Text>
                  )}
                </View>
              </View>

              {/* Input: Nhập phần trăm muốn giảm & Giá đề xuất */}
              <View style={styles.inputsSection}>
                <View style={styles.labelsRow}>
                  <View style={styles.labelCol}>
                    <Text style={styles.colInputLabel}>
                      % muốn giảm <Text style={styles.labelHint}>(Tối đa 50%)</Text>:
                    </Text>
                  </View>
                  <View style={styles.labelCol}>
                    <Text style={styles.colInputLabel}>Số tiền đề xuất:</Text>
                  </View>
                </View>

                <View style={styles.inputsRow}>
                  <View style={styles.inputCol}>
                    <View style={[styles.inputWrapper, numPct > 50 && styles.inputWrapperError]}>
                      <TextInput
                        style={styles.fieldInput}
                        value={discountPercent}
                        onChangeText={handlePercentChange}
                        placeholder="VD: 15"
                        keyboardType="numeric"
                        maxLength={3}
                      />
                      <Text style={styles.inputSuffix}>%</Text>
                    </View>
                  </View>

                  <View style={styles.inputCol}>
                    <View style={[styles.inputWrapper, (isOverLimit || isInvalidPrice) && styles.inputWrapperError]}>
                      <TextInput
                        style={styles.fieldInput}
                        value={offerPrice > 0 ? offerPrice.toLocaleString('vi-VN') : ''}
                        onChangeText={handlePriceChange}
                        placeholder="Nhập số tiền..."
                        keyboardType="numeric"
                      />
                      <Text style={styles.inputSuffix}>đ</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Cảnh báo không được vượt quá 50% */}
              {isOverLimit ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                  <Text style={styles.errorBannerText}>
                    Không được trả giá giảm quá 50% giá trị sản phẩm. Mức giá thấp nhất có thể đề xuất là{' '}
                    <Text style={{ fontWeight: '800' }}>{formatPrice(minAllowedPrice)}</Text>.
                  </Text>
                </View>
              ) : (
                <View style={styles.ruleBanner}>
                  <Ionicons name="information-circle" size={15} color="#0284C7" style={{ marginRight: 5 }} />
                  <Text style={styles.ruleBannerText}>
                    Quy tắc Chợ FU: Giảm tối đa 50% ({formatPrice(minAllowedPrice)}) để tôn trọng người bán.
                  </Text>
                </View>
              )}

              {/* Quick discount chips */}
              <View style={styles.discountRow}>
                {quickDiscounts.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.chip, numPct === item.pct && styles.activeChip]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectQuickDiscount(item.pct)}
                  >
                    <Text style={[styles.chipText, numPct === item.pct && styles.activeChipText]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Quick message templates */}
              <Text style={styles.inputLabel}>Lời nhắn kèm theo</Text>
              <View style={styles.msgTemplateRow}>
                {quickMessages.map((msg) => (
                  <TouchableOpacity
                    key={msg}
                    style={[styles.msgChip, note === msg && styles.activeMsgChip]}
                    onPress={() => setNote(msg)}
                  >
                    <Text
                      numberOfLines={1}
                      style={[styles.msgChipText, note === msg && styles.activeMsgChipText]}
                    >
                      {msg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.textInput}
                value={note}
                onChangeText={setNote}
                placeholder="Nhập lời nhắn gửi cho người bán..."
                multiline
                numberOfLines={2}
              />

              {/* Action button */}
              <TouchableOpacity
                style={[styles.submitBtn, hasError && styles.submitBtnDisabled]}
                activeOpacity={0.85}
                onPress={handleSend}
                disabled={hasError}
              >
                <Ionicons name="paper-plane" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitText}>
                  {hasError ? 'Mức giá không hợp lệ (Quá 50%)' : `Gửi đề xuất ${formatPrice(offerPrice)} qua Chat`}
                </Text>
              </TouchableOpacity>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#EA580C' },
  title: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 4 },
  subTitle: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 14 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  priceLabel: { fontSize: 11, color: '#64748B', marginBottom: 2 },
  oldPrice: { fontSize: 14, fontWeight: '600', color: '#94A3B8', textDecorationLine: 'line-through' },
  newPrice: { fontSize: 18, fontWeight: '900', color: '#EA580C' },
  savedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
  inputsSection: {
    marginBottom: 10,
  },
  labelsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  labelCol: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  colInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    lineHeight: 16,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  inputCol: {
    flex: 1,
  },
  labelHint: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#EA580C',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    height: 44,
  },
  inputWrapperError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  fieldInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  inputSuffix: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginLeft: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 11.5,
    color: '#DC2626',
    lineHeight: 16,
  },
  ruleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  ruleBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 15,
  },
  discountRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeChip: { backgroundColor: '#EA580C' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  activeChipText: { color: '#FFFFFF' },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  msgTemplateRow: { gap: 6, marginBottom: 10 },
  msgChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activeMsgChip: { borderColor: '#EA580C', backgroundColor: '#FFF7ED' },
  msgChipText: { fontSize: 11.5, color: '#475569' },
  activeMsgChipText: { color: '#EA580C', fontWeight: '700' },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 65,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px rgba(234, 88, 12, 0.3)',
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.6,
  },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default MakeOfferModal;
