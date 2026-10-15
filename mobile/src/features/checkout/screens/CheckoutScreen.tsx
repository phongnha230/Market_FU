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
import { CheckoutKycBanner } from '../components/CheckoutKycBanner';
import { CheckoutProductCard } from '../components/CheckoutProductCard';
import { CheckoutSafePointCard } from '../components/CheckoutSafePointCard';
import { CheckoutPaymentMethods } from '../components/CheckoutPaymentMethods';
import { CheckoutCoinDiscountCard } from '../components/CheckoutCoinDiscountCard';
import { CheckoutVoucherCard } from '../components/CheckoutVoucherCard';
import { CheckoutVoucherModal } from '../components/CheckoutVoucherModal';
import { CheckoutSummaryCard } from '../components/CheckoutSummaryCard';
import { CheckoutBottomBar } from '../components/CheckoutBottomBar';
import { KycRegistrationModal } from '../../profile/components/KycRegistrationModal';

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
        <Text style={styles.headerTitle}>
          {ctrl.isMeetup ? 'Hẹn gặp Safe-Handoff' : 'Thanh toán & Ký quỹ Escrow'}
        </Text>
        <TouchableOpacity
          onPress={ctrl.handleGoHome}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Top Escrow Banner */}
        <CheckoutEscrowBanner />

        {/* Unverified KYC Warning Banner */}
        <CheckoutKycBanner
          isKycVerified={ctrl.isKycVerified}
          onOpenKycModal={() => ctrl.setIsKycModalOpen(true)}
        />

        {/* Product Card with agreed price support */}
        <CheckoutProductCard
          product={ctrl.product}
          isDifferentCampus={ctrl.isDifferentCampus}
          basePrice={ctrl.basePrice}
          agreedPrice={ctrl.agreedPrice}
          isAgreedPriceApplied={ctrl.isAgreedPriceApplied}
          effectiveProductPrice={ctrl.effectiveProductPrice}
          formatCurrency={ctrl.formatCurrency}
        />

        {/* Safe-Point / Inter-Campus Shipping & Appointment Hubs */}
        <CheckoutSafePointCard
          isMeetup={ctrl.isMeetup}
          selectedSafePoint={ctrl.selectedSafePoint}
          onSelectSafePoint={ctrl.setSelectedSafePoint}
          appointmentDate={ctrl.appointmentDate}
          onSelectAppointmentDate={ctrl.setAppointmentDate}
          appointmentSlot={ctrl.appointmentSlot}
          onSelectAppointmentSlot={ctrl.setAppointmentSlot}
          sellerCampus={ctrl.product.sellerCampus}
          buyerCampus={ctrl.buyerCampus}
          deliveryNote={ctrl.deliveryNote}
          onChangeDeliveryNote={ctrl.setDeliveryNote}
        />

        {/* Payment Methods */}
        <CheckoutPaymentMethods
          selectedPayment={ctrl.selectedPayment}
          onSelectPayment={ctrl.setSelectedPayment}
        />

        {/* Voucher Card */}
        <CheckoutVoucherCard
          appliedVoucher={ctrl.appliedVoucher}
          onOpenModal={ctrl.handleOpenVoucherModal}
          onRemoveVoucher={ctrl.handleRemoveVoucher}
          formatCurrency={ctrl.formatCurrency}
        />

        {/* FPT Campus Coin Discount Card */}
        <CheckoutCoinDiscountCard
          userCoins={ctrl.userCoins}
          maxCoinsAllowed={ctrl.maxCoinsAllowed}
          useCoinDiscount={ctrl.useCoinDiscount}
          onToggleCoinDiscount={ctrl.setUseCoinDiscount}
          formatCurrency={ctrl.formatCurrency}
        />

        {/* Itemized Summary Card */}
        <CheckoutSummaryCard
          basePrice={ctrl.basePrice}
          effectiveProductPrice={ctrl.effectiveProductPrice}
          isAgreedPriceApplied={ctrl.isAgreedPriceApplied}
          agreedPrice={ctrl.agreedPrice}
          shippingFee={ctrl.shippingFee}
          isDifferentCampus={ctrl.isDifferentCampus}
          isMeetup={ctrl.isMeetup}
          loadingShipping={false}
          estimatedDelivery={ctrl.isMeetup ? 'Hẹn gặp trực tiếp' : 'Giao trong 24h'}
          shippingPartner={ctrl.isMeetup ? 'Safe-Point Hub' : 'FPT Bus Handoff'}
          discountAmount={ctrl.discountAmount}
          appliedVoucher={ctrl.appliedVoucher}
          coinDiscountAmount={ctrl.coinDiscountAmount}
          coinsUsed={ctrl.maxCoinsAllowed}
          totalAmount={ctrl.totalAmount}
          formatCurrency={ctrl.formatCurrency}
        />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <CheckoutBottomBar
        totalAmount={ctrl.totalAmount}
        selectedPayment={ctrl.selectedPayment}
        onConfirmPayment={ctrl.handleConfirmPayment}
        formatCurrency={ctrl.formatCurrency}
        isSubmitting={ctrl.isSubmitting}
      />

      {/* Voucher Modal */}
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

      {/* Student Identity KYC Registration Modal */}
      <KycRegistrationModal
        visible={ctrl.isKycModalOpen}
        onClose={() => ctrl.setIsKycModalOpen(false)}
        initialRole="STUDENT"
        onSuccess={() => {
          ctrl.setIsKycModalOpen(false);
        }}
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
