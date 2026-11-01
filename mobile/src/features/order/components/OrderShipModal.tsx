import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderMobileService } from '../../../services/orderMobileService';

interface OrderShipModalProps {
  visible: boolean;
  orderId: string;
  orderCode: string;
  productTitle: string;
  sellerName: string;
  campus?: string;
  initialPartner?: string;
  initialTrackingCode?: string;
  isAlreadyShipping?: boolean;
  onClose: () => void;
  onSuccess: (orderId: string, trackingCode: string, partner: string) => void;
}

const PARTNERS = [
  { key: 'GHN', label: 'Giao Hàng Nhanh (GHN)' },
  { key: 'GHTK', label: 'Giao Hàng Tiết Kiệm (GHTK)' },
  { key: 'VIETTEL_POST', label: 'Viettel Post' },
  { key: 'SPX', label: 'Shopee Xpress (SPX)' },
  { key: 'CAMPUS_BUS', label: 'Xe Buýt Liên Campus FPT' },
];

export const OrderShipModal: React.FC<OrderShipModalProps> = ({
  visible,
  orderId,
  orderCode,
  productTitle,
  sellerName,
  campus,
  initialPartner = 'GHN',
  initialTrackingCode = '',
  isAlreadyShipping = false,
  onClose,
  onSuccess,
}) => {
  const [partner, setPartner] = useState<string>(initialPartner || 'GHN');
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateSampleCode = (selectedPartner: string) => {
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    const prefix =
      selectedPartner === 'GHN'
        ? 'GHN'
        : selectedPartner === 'GHTK'
        ? 'GHTK'
        : selectedPartner === 'VIETTEL_POST'
        ? 'VTP'
        : selectedPartner === 'SPX'
        ? 'SPX'
        : 'CAMPUS';
    return `${prefix}${randomDigits}`;
  };

  useEffect(() => {
    if (visible) {
      if (initialTrackingCode && initialTrackingCode.trim()) {
        setTrackingCode(initialTrackingCode.trim().toUpperCase());
      } else {
        setTrackingCode(generateSampleCode(partner));
      }
      setErrorMsg(null);
    }
  }, [visible, initialTrackingCode, partner]);

  const handlePartnerSelect = (newPartner: string) => {
    setPartner(newPartner);
    setTrackingCode(generateSampleCode(newPartner));
  };

  const handleGenerateCode = () => {
    setTrackingCode(generateSampleCode(partner));
  };

  const handleSubmit = async () => {
    const cleanTracking = trackingCode.trim().toUpperCase();
    if (!cleanTracking || cleanTracking.length < 3) {
      setErrorMsg('Vui lòng nhập mã vận đơn thực tế hoặc bấm [Tạo mã ngẫu nhiên].');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      await orderMobileService.updateShippingStatus(orderId, {
        status: 'SHIPPING',
        trackingCode: cleanTracking,
        shippingPartner: partner,
      });

      onSuccess(orderId, cleanTracking, partner);
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        'Cập nhật vận đơn thất bại.';
      setErrorMsg(msg);
      Alert.alert('Lỗi vận chuyển', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="bus-outline" size={20} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title} numberOfLines={1}>
                  {isAlreadyShipping
                    ? 'Cập nhật mã vận đơn'
                    : 'Bàn giao bưu cục & Gửi hàng'}
                </Text>
                <Text style={styles.orderCodeText}>Mã đơn: {orderCode}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.body}
          >
            {/* Error banner */}
            {!!errorMsg && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Product info banner */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle} numberOfLines={2}>
                📦 {productTitle}
              </Text>
              <Text style={styles.infoSub}>Người gửi: {sellerName}</Text>
              <Text style={styles.infoSub}>Cơ sở / Tuyến: {campus || 'FPT Campus'}</Text>
              {isAlreadyShipping && (
                <View style={styles.shippingActiveRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#059669" />
                  <Text style={styles.shippingActiveText}>Đơn đã được bàn giao (Đang vận chuyển)</Text>
                </View>
              )}
            </View>

            {/* Notice */}
            <View style={styles.noticeBox}>
              <View style={styles.noticeHeader}>
                <Ionicons name="cube" size={16} color="#B45309" />
                <Text style={styles.noticeTitle}>Vận chuyển Liên Campus ({partner})</Text>
              </View>
              <Text style={styles.noticeDesc}>
                Người bán bàn giao hàng cho bưu cục GHN hoặc trạm xe buýt FPT. Tiến trình giao nhận và thu COD sẽ tự động đồng bộ theo mã vận đơn.
              </Text>
            </View>

            {/* Carrier selection */}
            <Text style={styles.sectionTitle}>ĐƠN VỊ VẬN CHUYỂN</Text>
            <View style={styles.partnerList}>
              {PARTNERS.map((p) => {
                const isSelected = partner === p.key;
                return (
                  <TouchableOpacity
                    key={p.key}
                    style={[styles.partnerItem, isSelected && styles.partnerItemSelected]}
                    onPress={() => handlePartnerSelect(p.key)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? '#EA580C' : '#94A3B8'}
                    />
                    <Text style={[styles.partnerLabel, isSelected && styles.partnerLabelSelected]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tracking code input */}
            <View style={styles.trackingHeaderRow}>
              <Text style={styles.sectionTitle}>MÃ VẬN ĐƠN (TRACKING CODE) *</Text>
              <TouchableOpacity
                style={styles.genCodeBtn}
                onPress={handleGenerateCode}
                activeOpacity={0.7}
              >
                <Ionicons name="sparkles" size={14} color="#EA580C" />
                <Text style={styles.genCodeText}>Tạo mã ngẫu nhiên</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                value={trackingCode}
                onChangeText={(text) => setTrackingCode(text.toUpperCase())}
                placeholder="VD: GHN102938475"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={handleGenerateCode}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="reload" size={18} color="#EA580C" />
              </TouchableOpacity>
            </View>
            <Text style={styles.hintText}>
              Mã vận đơn đã được tự động sinh mẫu. Bạn có thể bấm [Tạo mã ngẫu nhiên] hoặc tự sửa mã thực tế từ bưu cục.
            </Text>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="cube-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>
                    {isAlreadyShipping ? 'Cập nhật mã vận đơn' : 'Xác nhận gửi hàng'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
    marginRight: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },
  body: {
    padding: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    gap: 3,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  infoSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  shippingActiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  shippingActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  noticeBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    marginBottom: 16,
    gap: 4,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  noticeDesc: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  partnerList: {
    gap: 6,
    marginBottom: 16,
  },
  partnerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  partnerItemSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  partnerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  partnerLabelSelected: {
    color: '#EA580C',
    fontWeight: '800',
  },
  trackingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  genCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
  },
  genCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#0F172A',
    letterSpacing: 1,
  },
  refreshBtn: {
    padding: 6,
  },
  hintText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
