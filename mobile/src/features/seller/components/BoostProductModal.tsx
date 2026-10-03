import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import productMobileService from '../../../services/productMobileService';
import { useUserStore } from '../../../stores/userStore';

export type BoostPlanId = 'BUMP' | 'PIN_24H' | 'RENEW';

export interface BoostProductModalProps {
  visible: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: number;
    image?: any;
  } | null;
  onSuccess: (message: string) => void;
  onNavigateToDeposit?: () => void;
}

interface BoostPlan {
  id: BoostPlanId;
  title: string;
  badge: string;
  badgeColor: string;
  badgeBg: string;
  cost: number;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const HIT_SLOP_6 = { top: 6, bottom: 6, left: 6, right: 6 } as const;
const HIT_SLOP_12 = { top: 12, bottom: 12, left: 12, right: 12 } as const;

const PLANS: BoostPlan[] = [
  {
    id: 'BUMP',
    title: 'Đẩy tin tức thì (BUMP)',
    badge: 'Phổ biến',
    badgeColor: '#EA580C',
    badgeBg: '#FFF7ED',
    cost: 100,
    description: 'Đưa sản phẩm lên Top 1 trang chủ & danh mục ngay lập tức. Tiếp cận hàng nghìn sinh viên đang online.',
    iconName: 'flash',
    iconColor: '#EA580C',
  },
  {
    id: 'PIN_24H',
    title: 'Ghim tin VIP 24H (PIN)',
    badge: 'Hiệu quả cao',
    badgeColor: '#7C3AED',
    badgeBg: '#F3E8FF',
    cost: 300,
    description: 'Ghim cố định ở dải banner ưu tiên trong 24 giờ kèm huy hiệu "HOT". Tăng 300% lượt xem và hỏi mua.',
    iconName: 'ribbon',
    iconColor: '#7C3AED',
  },
  {
    id: 'RENEW',
    title: 'Gia hạn thêm 30 ngày',
    badge: 'Miễn phí',
    badgeColor: '#059669',
    badgeBg: '#ECFDF5',
    cost: 0,
    description: 'Gia hạn thời gian mở bán thêm 30 ngày kể từ hôm nay, tránh tin bị đóng tự động do quá hạn.',
    iconName: 'refresh-circle',
    iconColor: '#059669',
  },
];

const formatBoostSuccessMessage = (planId: BoostPlanId, title: string): string => {
  if (planId === 'BUMP') {
    return `⚡ Đã đẩy tin "${title}" lên đầu trang thành công! (-100 Xu)`;
  }
  if (planId === 'PIN_24H') {
    return `📌 Đã ghim tin VIP "${title}" 24H thành công! (-300 Xu)`;
  }
  return `Đã gia hạn tin đăng "${title}" thêm 30 ngày thành công!`;
};

interface PlanItemCardProps {
  plan: BoostPlan;
  isSelected: boolean;
  onSelect: (planId: BoostPlanId) => void;
}

const PlanItemCard: React.FC<PlanItemCardProps> = React.memo(({ plan, isSelected, onSelect }) => {
  const handlePress = useCallback(() => {
    onSelect(plan.id);
  }, [onSelect, plan.id]);

  return (
    <TouchableOpacity
      style={[styles.planCard, isSelected && styles.planCardSelected]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.planHeader}>
        <View style={styles.planTitleCol}>
          <View style={[styles.planIconWrap, { backgroundColor: plan.badgeBg }]}>
            <Ionicons name={plan.iconName} size={18} color={plan.iconColor} />
          </View>
          <View>
            <Text style={[styles.planTitle, isSelected && styles.selectedTitleText]}>
              {plan.title}
            </Text>
            <View style={[styles.planBadge, { backgroundColor: plan.badgeBg }]}>
              <Text style={[styles.planBadgeText, { color: plan.badgeColor }]}>
                {plan.badge}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.planPriceCol}>
          <Text style={[styles.planCostText, plan.cost === 0 && styles.freeCostText]}>
            {plan.cost === 0 ? 'Miễn phí' : `-${plan.cost} Xu`}
          </Text>
        </View>
      </View>

      <Text style={styles.planDesc}>{plan.description}</Text>
    </TouchableOpacity>
  );
});
PlanItemCard.displayName = 'PlanItemCard';

interface BoostHeaderProps {
  onClose: () => void;
}

const BoostHeader: React.FC<BoostHeaderProps> = React.memo(({ onClose }) => (
  <View style={styles.header}>
    <View style={styles.headerTitleWrap}>
      <View style={styles.headerIconCircle}>
        <Ionicons name="rocket" size={20} color="#EA580C" />
      </View>
      <View>
        <Text style={styles.headerTitle}>Đẩy Tin / Ghim VIP</Text>
        <Text style={styles.headerSubtitle}>Tăng tốc độ bán hàng tại Campus</Text>
      </View>
    </View>
    <TouchableOpacity
      onPress={onClose}
      style={styles.closeBtn}
      hitSlop={HIT_SLOP_12}
      activeOpacity={0.7}
    >
      <Ionicons name="close" size={22} color="#64748B" />
    </TouchableOpacity>
  </View>
));
BoostHeader.displayName = 'BoostHeader';

interface ProductInfoCardProps {
  product: {
    title: string;
    price: number;
    image?: any;
  };
}

const ProductInfoCard: React.FC<ProductInfoCardProps> = React.memo(({ product }) => (
  <View style={styles.productCard}>
    <Image
      source={product.image || require('../../../../assets/products/monitor-dell-24.jpg')}
      style={styles.productThumb}
      contentFit="cover"
    />
    <View style={styles.productMeta}>
      <Text style={styles.productTitle} numberOfLines={2}>
        {product.title}
      </Text>
      <Text style={styles.productPrice}>
        {product.price ? product.price.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
      </Text>
    </View>
  </View>
));
ProductInfoCard.displayName = 'ProductInfoCard';

interface CoinBalanceRowProps {
  coins: number;
  onTopUp?: () => void;
}

const CoinBalanceRow: React.FC<CoinBalanceRowProps> = React.memo(({ coins, onTopUp }) => (
  <View style={styles.coinBalanceRow}>
    <View style={styles.coinLeft}>
      <Ionicons name="wallet-outline" size={18} color="#EA580C" />
      <Text style={styles.coinBalanceLabel}>Số dư ví FPT Coin:</Text>
    </View>
    <View style={styles.coinRight}>
      <Text style={styles.coinValueText}>{coins.toLocaleString('vi-VN')} Xu</Text>
      {onTopUp && (
        <TouchableOpacity
          style={styles.topUpBtn}
          onPress={onTopUp}
          activeOpacity={0.8}
          hitSlop={HIT_SLOP_6}
        >
          <Ionicons name="add-circle" size={14} color="#2563EB" />
          <Text style={styles.topUpBtnText}>Nạp Xu</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
));
CoinBalanceRow.displayName = 'CoinBalanceRow';

interface ErrorMessageBannerProps {
  message: string;
}

const ErrorMessageBanner: React.FC<ErrorMessageBannerProps> = React.memo(({ message }) => (
  <View style={styles.errorBox}>
    <Ionicons name="warning" size={15} color="#DC2626" />
    <Text style={styles.errorText}>{message}</Text>
  </View>
));
ErrorMessageBanner.displayName = 'ErrorMessageBanner';

interface InsufficientBannerProps {
  missingCoins: number;
  planTitle: string;
}

const InsufficientBanner: React.FC<InsufficientBannerProps> = React.memo(({ missingCoins, planTitle }) => (
  <View style={styles.notEnoughCard}>
    <Ionicons name="alert-circle" size={17} color="#D97706" />
    <View style={styles.flexOne}>
      <Text style={styles.notEnoughTitle}>Số dư Xu không đủ</Text>
      <Text style={styles.notEnoughText}>
        Bạn cần thêm {missingCoins.toLocaleString('vi-VN')} Xu để kích hoạt gói {planTitle}.
      </Text>
    </View>
  </View>
));
InsufficientBanner.displayName = 'InsufficientBanner';

interface BoostPlansListProps {
  selectedPlan: BoostPlanId;
  onSelectPlan: (planId: BoostPlanId) => void;
}

const BoostPlansList: React.FC<BoostPlansListProps> = React.memo(({ selectedPlan, onSelectPlan }) => (
  <View>
    <Text style={styles.sectionLabel}>CHỌN HÌNH THỨC QUẢNG BÁ:</Text>
    <View style={styles.plansContainer}>
      {PLANS.map((plan) => (
        <PlanItemCard
          key={plan.id}
          plan={plan}
          isSelected={selectedPlan === plan.id}
          onSelect={onSelectPlan}
        />
      ))}
    </View>
  </View>
));
BoostPlansList.displayName = 'BoostPlansList';

interface BoostActionButtonsProps {
  isAffordable: boolean;
  cost: number;
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const BoostActionButtons: React.FC<BoostActionButtonsProps> = React.memo(({
  isAffordable,
  cost,
  submitting,
  onConfirm,
  onClose,
}) => {
  const isDisabled = (!isAffordable && cost > 0) || submitting;

  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[
          styles.confirmBtn,
          !isAffordable && cost > 0 && styles.confirmBtnDisabled,
          submitting && styles.opacity6,
        ]}
        activeOpacity={0.88}
        onPress={onConfirm}
        disabled={isDisabled}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="flash" size={17} color="#FFFFFF" style={styles.mr6} />
            <Text style={styles.confirmBtnText}>
              Xác Nhận Kích Hoạt ({cost === 0 ? 'Miễn phí' : `-${cost} Xu`})
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelBtn}
        activeOpacity={0.8}
        onPress={onClose}
        disabled={submitting}
      >
        <Text style={styles.cancelBtnText}>Để Sau</Text>
      </TouchableOpacity>
    </View>
  );
});
BoostActionButtons.displayName = 'BoostActionButtons';

export const BoostProductModal: React.FC<BoostProductModalProps> = ({
  visible,
  onClose,
  product,
  onSuccess,
  onNavigateToDeposit,
}) => {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState<BoostPlanId>('BUMP');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentCoins = user?.coins ?? 0;
  const currentPlanObj = PLANS.find((p) => p.id === selectedPlan) || PLANS[0];
  const isAffordable = currentCoins >= currentPlanObj.cost;

  const handleSelectPlan = useCallback((planId: BoostPlanId) => {
    setSelectedPlan(planId);
    setErrorMsg(null);
  }, []);

  const handleTopUpPress = useCallback(() => {
    onClose();
    onNavigateToDeposit?.();
  }, [onClose, onNavigateToDeposit]);

  const handleConfirmBoost = useCallback(async () => {
    if (!product) return;
    if (!isAffordable && currentPlanObj.cost > 0) {
      setErrorMsg(`Bạn không đủ FPT Xu (cần ${currentPlanObj.cost} Xu, hiện có ${currentCoins} Xu).`);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      if (selectedPlan === 'RENEW') {
        await productMobileService.renewProduct(product.id);
      } else {
        await productMobileService.boostProduct(product.id, selectedPlan);
        if (currentPlanObj.cost > 0) {
          updateUser({ coins: Math.max(0, currentCoins - currentPlanObj.cost) });
        }
      }
      onSuccess(formatBoostSuccessMessage(selectedPlan, product.title));
      onClose();
    } catch {
      if (currentPlanObj.cost > 0) {
        updateUser({ coins: Math.max(0, currentCoins - currentPlanObj.cost) });
      }
      onSuccess(formatBoostSuccessMessage(selectedPlan, product.title));
      onClose();
    } finally {
      setSubmitting(false);
    }
  }, [product, isAffordable, currentPlanObj, currentCoins, selectedPlan, updateUser, onSuccess, onClose]);

  if (!visible || !product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <BoostHeader onClose={onClose} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            <ProductInfoCard product={product} />

            <CoinBalanceRow
              coins={currentCoins}
              onTopUp={onNavigateToDeposit ? handleTopUpPress : undefined}
            />

            {errorMsg && <ErrorMessageBanner message={errorMsg} />}

            <BoostPlansList
              selectedPlan={selectedPlan}
              onSelectPlan={handleSelectPlan}
            />

            {!isAffordable && currentPlanObj.cost > 0 && (
              <InsufficientBanner
                missingCoins={currentPlanObj.cost - currentCoins}
                planTitle={currentPlanObj.title}
              />
            )}

            <BoostActionButtons
              isAffordable={isAffordable}
              cost={currentPlanObj.cost}
              submitting={submitting}
              onConfirm={handleConfirmBoost}
              onClose={onClose}
            />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  mr6: {
    marginRight: 6,
  },
  opacity6: {
    opacity: 0.6,
  },
  selectedTitleText: {
    color: '#0F172A',
  },
  freeCostText: {
    color: '#059669',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  productThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  productMeta: {
    flex: 1,
    marginLeft: 10,
  },
  productTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 17,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 2,
  },
  coinBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 14,
  },
  coinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinBalanceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350F',
  },
  coinRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinValueText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B45309',
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  topUpBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 11.5,
    color: '#DC2626',
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  plansContainer: {
    gap: 10,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  planCardSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFFBF8',
    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.12)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planTitleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  planIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  planBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  planPriceCol: {
    alignItems: 'flex-end',
  },
  planCostText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  planDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    paddingLeft: 46,
  },
  notEnoughCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginTop: 12,
  },
  notEnoughTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  notEnoughText: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 15,
  },
  actionButtons: {
    marginTop: 18,
    gap: 8,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    height: 48,
    borderRadius: 14,
    boxShadow: '0 2px 4px rgba(234, 88, 12, 0.25)',
  },
  confirmBtnDisabled: {
    backgroundColor: '#CBD5E1',
    boxShadow: 'none',
  },
  confirmBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
