import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProductBottomBarProps {
  isSameCampus: boolean;
  onChat: () => void;
  onMakeOffer: () => void;
  onBuyNow: (mode?: 'meetup' | 'shipping') => void;
  isOwnProduct?: boolean;
  onManageOwnProduct?: () => void;
  isSoldOrReserved?: boolean;
  status?: 'PENDING_APPROVAL' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN' | 'EXPIRED' | 'REJECTED' | 'LOCKED';
  price?: number | string;
  unreadCount?: number;
}

export const ProductBottomBar: React.FC<ProductBottomBarProps> = ({
  isSameCampus,
  onChat,
  onMakeOffer,
  onBuyNow,
  isOwnProduct,
  onManageOwnProduct,
  isSoldOrReserved,
  status,
  price,
  unreadCount = 0,
}) => {
  const insets = useSafeAreaInsets();
  const formattedPrice = React.useMemo(() => {
    if (!price) return '';
    const num = typeof price === 'number' ? price : parseInt(String(price).replace(/\D/g, ''), 10);
    if (isNaN(num) || num <= 0) return '';
    return `${num.toLocaleString('vi-VN')}đ`;
  }, [price]);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
      {isOwnProduct ? (
        // SELLER XEM BÀI CỦA CHÍNH MÌNH: Cảnh báo chống gian lận & Quản lý bài đăng
        <View style={styles.ownProductBox}>
          <View style={styles.ownHeaderRow}>
            <View style={styles.ownIconBox}>
              <Ionicons name="shield-checkmark" size={16} color="#2563EB" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.ownTitle} numberOfLines={1} ellipsizeMode="tail">
                Bài đăng của chính bạn
              </Text>
              <Text style={styles.ownSubtitle} numberOfLines={2} ellipsizeMode="tail">
                {status === 'REJECTED' || status === 'LOCKED'
                  ? 'Tin đăng này đã bị BQT từ chối / gỡ bỏ. Bấm để sửa hoặc kháng nghị.'
                  : status === 'PENDING_APPROVAL'
                  ? 'Tin đang chờ Ban Quản Trị duyệt an toàn.'
                  : status === 'HIDDEN'
                  ? 'Tin đăng đang tạm ẩn. Vào Kho đồ > Đã ẩn để mở bán lại.'
                  : status === 'SOLD'
                  ? 'Món đồ này đã bán thành công.'
                  : 'Theo quy chế, bạn không thể tự đặt mua bài của mình'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.manageOwnBtn}
            activeOpacity={0.88}
            onPress={onManageOwnProduct}
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.manageOwnBtnText} numberOfLines={1} ellipsizeMode="tail">
              Quản lý & Chỉnh sửa bài đăng
            </Text>
          </TouchableOpacity>
        </View>
      ) : isSoldOrReserved ? (
        // SẢN PHẨM ĐÃ BÁN / ĐÃ ĐÓNG / ĐANG HẸN CỌC: Vô hiệu hóa mua & chat
        <View style={styles.soldProductBox}>
          <View style={styles.soldHeaderRow}>
            <View style={[styles.soldIconBox, status === 'SOLD' ? styles.soldIconBoxRed : styles.soldIconBoxAmber]}>
              <Ionicons
                name={status === 'SOLD' ? 'checkmark-circle' : 'time'}
                size={18}
                color={status === 'SOLD' ? '#DC2626' : '#D97706'}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.soldNoticeTitle} numberOfLines={1} ellipsizeMode="tail">
                {status === 'SOLD' ? 'Món đồ này đã được bán thành công'
                  : status === 'RESERVED' ? 'Món đồ này đang có bạn hẹn cọc'
                  : 'Tin đăng này chưa thể giao dịch'}
              </Text>
              <Text style={styles.soldNoticeSub} numberOfLines={2} ellipsizeMode="tail">
                {status === 'SOLD'
                  ? 'Giao dịch đã hoàn tất. Bạn không cần nhắn tin cho người bán nữa.'
                  : 'Sản phẩm tạm thời khóa giao dịch để chờ bàn giao.'}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        // KHUÔN 3 NÚT GỌN GÀNG 1 HÀNG CHUẨN TIKTOK / SHOPEE
        // (Áp dụng đồng bộ cho cả Safe-Handoff Cùng Campus & CampusShip Liên Campus, giữ nguyên 100% chức năng)
        <View style={styles.buttonRow}>
          {/* Nút 1: Chat với người bán */}
          <TouchableOpacity
            style={styles.iconActionBtn}
            activeOpacity={0.75}
            onPress={onChat}
          >
            <View style={styles.iconBoxWrapper}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#0F172A" />
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.iconActionLabel}>Chat</Text>
          </TouchableOpacity>

          {/* Nút 2: Trả giá */}
          <TouchableOpacity
            style={styles.iconActionBtn}
            activeOpacity={0.75}
            onPress={onMakeOffer}
          >
            <View style={styles.iconBoxWrapper}>
              <Ionicons name="pricetag-outline" size={21} color="#0F172A" />
            </View>
            <Text style={styles.iconActionLabel}>Trả giá</Text>
          </TouchableOpacity>

          {/* Nút 3: MUA NGAY / ĐẶT HÀNG (Dạng Pill bo tròn to nổi bật) */}
          <TouchableOpacity
            style={[
              styles.mainBuyBtn,
              isSameCampus ? styles.mainBuyBtnSameCampus : styles.mainBuyBtnDiffCampus,
            ]}
            activeOpacity={0.88}
            onPress={() => onBuyNow(isSameCampus ? 'meetup' : 'shipping')}
          >
            <Text style={styles.mainBuyBtnTitle}>
              {isSameCampus ? 'Hẹn Safe-Point' : 'Mua ngay'}
            </Text>
            <Text style={styles.mainBuyBtnSubtitle} numberOfLines={1}>
              {formattedPrice
                ? `${formattedPrice} • ${isSameCampus ? 'Safe-Handoff' : 'CampusShip'}`
                : isSameCampus
                ? 'Giao dịch Safe-Point'
                : 'FPT CampusShip'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 46,
    paddingVertical: 2,
  },
  iconBoxWrapper: {
    position: 'relative',
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -7,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mainBuyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  mainBuyBtnSameCampus: {
    backgroundColor: '#EA580C',
  },
  mainBuyBtnDiffCampus: {
    backgroundColor: '#EA580C',
  },
  mainBuyBtnTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  mainBuyBtnSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFEDD5',
    marginTop: 1,
  },
  ownProductBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    gap: 10,
  },
  ownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ownIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  ownSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
  },
  manageOwnBtn: {
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageOwnBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  // Hộp thông báo sản phẩm đã bán / đang hẹn cọc
  soldProductBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  soldHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soldIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldIconBoxRed: {
    backgroundColor: '#FEE2E2',
  },
  soldIconBoxAmber: {
    backgroundColor: '#FEF3C7',
  },
  soldNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  soldNoticeSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
});

export default ProductBottomBar;
