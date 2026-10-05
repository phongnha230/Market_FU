import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCheckoutController } from '../hooks/useCheckoutController';
import { CheckoutEscrowBanner } from '../components/CheckoutEscrowBanner';
import { CheckoutProductCard } from '../components/CheckoutProductCard';
import { CheckoutSafePointCard } from '../components/CheckoutSafePointCard';
import { CheckoutPaymentMethods } from '../components/CheckoutPaymentMethods';
import { CheckoutVoucherCard } from '../components/CheckoutVoucherCard';
import { CheckoutVoucherModal } from '../components/CheckoutVoucherModal';
import { CheckoutSummaryCard } from '../components/CheckoutSummaryCard';
import { CheckoutBottomBar } from '../components/CheckoutBottomBar';

export const CheckoutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const ctrl = useCheckoutController();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={ctrl.handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán & Ký quỹ Escrow</Text>
        <TouchableOpacity
          onPress={ctrl.handleGoHome}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        <CheckoutEscrowBanner />

        <CheckoutProductCard
          product={ctrl.product}
          isDifferentCampus={ctrl.isDifferentCampus}
          basePrice={ctrl.basePrice}
          formatCurrency={ctrl.formatCurrency}
        />

        <CheckoutSafePointCard
          selectedSafePoint={ctrl.selectedSafePoint}
          onSelectSafePoint={ctrl.setSelectedSafePoint}
        />

        <CheckoutPaymentMethods
          selectedPayment={ctrl.selectedPayment}
          onSelectPayment={ctrl.setSelectedPayment}
        />

        <CheckoutVoucherCard
          appliedVoucher={ctrl.appliedVoucher}
          onOpenModal={ctrl.handleOpenVoucherModal}
          onRemoveVoucher={ctrl.handleRemoveVoucher}
          formatCurrency={ctrl.formatCurrency}
        />

        <CheckoutSummaryCard
          basePrice={ctrl.basePrice}
          shippingFee={ctrl.shippingFee}
          isDifferentCampus={ctrl.isDifferentCampus}
          loadingShipping={false}
          estimatedDelivery="Giao trong 24h"
          shippingPartner="FPT Bus Handoff"
          discountAmount={ctrl.discountAmount}
          totalAmount={ctrl.totalAmount}
          formatCurrency={ctrl.formatCurrency}
        />
      </ScrollView>

      <CheckoutBottomBar
        totalAmount={ctrl.totalAmount}
        selectedPayment={ctrl.selectedPayment}
        onConfirmPayment={ctrl.handleConfirmPayment}
        formatCurrency={ctrl.formatCurrency}
        isSubmitting={ctrl.isSubmitting}
      />

      <CheckoutVoucherModal
        visible={ctrl.isVoucherModalOpen}
        onClose={() => ctrl.setIsVoucherModalOpen(false)}
        appliedVoucher={ctrl.appliedVoucher}
        onSelectVoucher={ctrl.handleSelectVoucher}
        myVouchers={ctrl.myVouchers}
        loadingVouchers={ctrl.loadingVouchers}
        customVoucherInput={ctrl.customVoucherInput}
        onCustomVoucherInputChange={ctrl.setCustomVoucherInput}
        onApplyCustomVoucher={ctrl.handleApplyCustomVoucher}
        onNavigateVoucherList={ctrl.handleNavigateVoucherList}
        insetsBottom={insets.bottom}
        formatCurrency={ctrl.formatCurrency}
      />
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16.5, fontWeight: '800', color: '#0F172A' },
  scrollBody: { paddingHorizontal: 16, paddingBottom: 100 },
});
