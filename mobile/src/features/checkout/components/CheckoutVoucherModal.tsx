import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ListRenderItemInfo,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserVoucher } from '../../../stores/voucherStore';

interface CheckoutVoucherModalProps {
  visible: boolean;
  onClose: () => void;
  appliedVoucher: {
    code: string;
    discount: number;
    title?: string;
  } | null;
  onSelectVoucher: (voucher: { code: string; discount: number; title?: string; minOrderValue?: number } | null) => void;
  myVouchers: UserVoucher[];
  loadingVouchers: boolean;
  customVoucherInput: string;
  onCustomVoucherInputChange: (val: string) => void;
  onApplyCustomVoucher: () => void;
  onNavigateVoucherList: () => void;
  insetsBottom: number;
  formatCurrency: (val: number) => string;
  productPrice: number;
}

export const CheckoutVoucherModal: React.FC<CheckoutVoucherModalProps> = ({
  visible,
  onClose,
  appliedVoucher,
  onSelectVoucher,
  myVouchers,
  loadingVouchers,
  customVoucherInput,
  onCustomVoucherInputChange,
  onApplyCustomVoucher,
  onNavigateVoucherList,
  insetsBottom,
  formatCurrency,
  productPrice,
}) => {
  const renderVoucherItem = useCallback(
    ({ item }: ListRenderItemInfo<UserVoucher>) => {
      const isSelected = appliedVoucher?.code === item.voucherCode;
      const isShipVoucher = item.voucher.partner === 'CAMPUS_SHIP' ||
        item.voucher.partner === 'OTHER' ||
        item.voucher.title.toLowerCase().includes('ship') ||
        item.voucher.title.toLowerCase().includes('vận chuyển');

      const minOrder = item.voucher.minOrderValue || 0;
      const isEligible = productPrice >= minOrder;

      return (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.modalVoucherCard,
            isSelected && styles.selectedModalVoucher,
            !isEligible && { opacity: 0.65, backgroundColor: '#F8FAFC' }
          ]}
          activeOpacity={isEligible ? 0.7 : 0.9}
          onPress={() => {
            if (!isEligible) {
              const { Alert } = require('react-native');
              Alert.alert(
                'Chưa đủ điều kiện',
                `Voucher này yêu cầu đơn hàng từ ${formatCurrency(minOrder)} trở lên (Đơn hiện tại: ${formatCurrency(productPrice)}).`
              );
              return;
            }
            onSelectVoucher({
              code: item.voucherCode,
              discount: item.voucher.discountValue,
              title: item.voucher.title,
              minOrderValue: minOrder,
            });
            onClose();
          }}
        >
          <View style={styles.modalVoucherLeft}>
            <View style={[styles.ticketIconBg, isShipVoucher && { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name={isShipVoucher ? "car-outline" : "ticket"} size={20} color={isShipVoucher ? "#7C3AED" : "#EA580C"} />
            </View>
            <View style={styles.voucherInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Text style={styles.modalVoucherTitle} numberOfLines={1}>
                  {item.voucher.title}
                </Text>
                {isShipVoucher && (
                  <View style={{ backgroundColor: '#F3E8FF', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontSize: 9, fontWeight: '800', color: '#7E22CE' }}>FREESHIP</Text>
                  </View>
                )}
                {minOrder > 0 ? (
                  <View style={{ backgroundColor: isEligible ? '#F3E8FF' : '#FFE4E6', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontSize: 8.5, fontWeight: '800', color: isEligible ? '#7E22CE' : '#E11D48' }}>
                      {isEligible ? `ĐƠN TỪ ${formatCurrency(minOrder)}` : `CẦN ${formatCurrency(minOrder)}`}
                    </Text>
                  </View>
                ) : (
                  <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ fontSize: 8.5, fontWeight: '800', color: '#15803D' }}>MỌI ĐƠN</Text>
                  </View>
                )}
              </View>
              <Text style={styles.modalVoucherDesc} numberOfLines={1}>
                {item.voucher.description}
              </Text>
              <Text style={styles.modalVoucherExpire}>HSD: {item.expiredAt}</Text>
            </View>
          </View>
          <View style={styles.modalVoucherRight}>
            <Text style={styles.modalVoucherValue}>
              -{formatCurrency(item.voucher.discountValue)}
            </Text>
            {isEligible ? (
              <View style={[styles.useBtn, isSelected && styles.useBtnSelected]}>
                <Text
                  style={[
                    styles.useBtnText,
                    isSelected && styles.useBtnTextSelected,
                  ]}
                >
                  {isSelected ? 'Đang dùng' : 'Dùng mã'}
                </Text>
              </View>
            ) : (
              <View style={[styles.useBtn, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
                <Text style={[styles.useBtnText, { color: '#94A3B8', fontSize: 10 }]}>
                  Chưa đủ đ/k
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [appliedVoucher, onSelectVoucher, onClose, formatCurrency, productPrice]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalSheet, { paddingBottom: Math.max(insetsBottom, 16) }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Voucher & Mã giảm giá</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Custom Input */}
          <View style={styles.customCodeBox}>
            <TextInput
              style={styles.customCodeInput}
              placeholder="Nhập mã voucher (VD: FPTK20WELCOME)"
              placeholderTextColor="#94A3B8"
              value={customVoucherInput}
              onChangeText={onCustomVoucherInputChange}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.applyCodeBtn}
              onPress={onApplyCustomVoucher}
            >
              <Text style={styles.applyCodeText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sheetSectionTitle}>VOUCHER CỦA BẠN</Text>

          {loadingVouchers ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#EA580C" />
              <Text style={styles.loadingText}>Đang tải danh sách voucher...</Text>
            </View>
          ) : myVouchers.length === 0 ? (
            <View style={styles.emptyVoucherBox}>
              <Ionicons name="ticket-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyVoucherText}>Bạn chưa có voucher nào trong ví</Text>
              <TouchableOpacity
                style={styles.exchangeMoreBtn}
                onPress={onNavigateVoucherList}
              >
                <Text style={styles.exchangeMoreText}>Đổi voucher bằng Xu FPT ›</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              style={styles.voucherList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              data={myVouchers
                .filter((v) => v.status === 'UNUSED')
                .sort((a, b) => {
                  const aIsShip = a.voucher.partner === 'CAMPUS_SHIP' || a.voucher.partner === 'OTHER' ? 1 : 0;
                  const bIsShip = b.voucher.partner === 'CAMPUS_SHIP' || b.voucher.partner === 'OTHER' ? 1 : 0;
                  return bIsShip - aIsShip;
                })}
              keyExtractor={(item) => item.id}
              renderItem={renderVoucherItem}
            />
          )}

          {appliedVoucher && (
            <TouchableOpacity
              style={styles.clearVoucherBtn}
              onPress={() => {
                onSelectVoucher(null);
                onClose();
              }}
            >
              <Text style={styles.clearVoucherText}>Không sử dụng voucher nào</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  customCodeBox: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  customCodeInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    fontWeight: '600',
  },
  applyCodeBtn: {
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyCodeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sheetSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
  },
  emptyVoucherBox: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyVoucherText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
  },
  exchangeMoreBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  exchangeMoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  voucherList: {
    maxHeight: 320,
  },
  modalVoucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  selectedModalVoucher: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  modalVoucherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  ticketIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voucherInfo: {
    flex: 1,
    marginLeft: 10,
  },
  modalVoucherTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalVoucherDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalVoucherExpire: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  modalVoucherRight: {
    alignItems: 'flex-end',
  },
  modalVoucherValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#EA580C',
    marginBottom: 4,
  },
  useBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#EA580C',
  },
  useBtnSelected: {
    backgroundColor: '#059669',
  },
  useBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  useBtnTextSelected: {
    color: '#FFFFFF',
  },
  clearVoucherBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  clearVoucherText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
});
