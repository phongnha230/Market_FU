import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProductBottomBarProps {
  isSameCampus: boolean;
  onChat: () => void;
  onMakeOffer: () => void;
  onBuyNow: (mode?: 'meetup' | 'shipping') => void;
  isOwnProduct?: boolean;
  onManageOwnProduct?: () => void;
  isSoldOrReserved?: boolean;
  status?: 'PENDING_APPROVAL' | 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'HIDDEN' | 'EXPIRED' | 'REJECTED';
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
}) => {
  return (
    <View style={styles.container}>
      {isSoldOrReserved ? (
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
            <View style={{ flex: 1 }}>
              <Text style={styles.soldNoticeTitle}>
                {status === 'SOLD' ? 'Món đồ này đã được bán thành công'
                  : status === 'RESERVED' ? 'Món đồ này đang có bạn hẹn cọc'
                  : 'Tin đăng này chưa thể giao dịch'}
              </Text>
              <Text style={styles.soldNoticeSub}>
                {status === 'SOLD'
                  ? 'Giao dịch đã hoàn tất. Bạn không cần nhắn tin cho người bán nữa.'
                  : 'Sản phẩm tạm thời khóa giao dịch để chờ bàn giao.'}
              </Text>
            </View>
          </View>
        </View>
      ) : isOwnProduct ? (
        // SELLER XEM BÀI CỦA CHÍNH MÌNH: Cảnh báo chống gian lận & Quản lý bài đăng
        <View style={styles.ownProductBox}>
          <View style={styles.ownHeaderRow}>
            <View style={styles.ownIconBox}>
              <Ionicons name="shield-checkmark" size={16} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ownTitle}>Bài đăng của chính bạn</Text>
              <Text style={styles.ownSubtitle}>Theo quy chế, bạn không thể tự đặt mua bài của mình</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.manageOwnBtn}
            activeOpacity={0.88}
            onPress={onManageOwnProduct}
          >
            <Ionicons name="create-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.manageOwnBtnText}>Quản lý & Chỉnh sửa bài đăng</Text>
          </TouchableOpacity>
        </View>
      ) : isSameCampus ? (
        // CÙNG CAMPUS: Safe-Handoff Nút To + Nhắn tin & Trả giá
        <View style={styles.actionColumn}>
          {/* Banner thông tin Safe-Handoff */}
          <View style={styles.sameCampusNotice}>
            <Ionicons name="shield-checkmark" size={13} color="#059669" />
            <Text style={styles.sameCampusNoticeText}>
              Giao dịch Safe-Handoff • Test tại trạm có Camera & QR Handshake
            </Text>
          </View>

          {/* Nút chính: Đặt hẹn Safe-Handoff */}
          <TouchableOpacity
            style={styles.safeHandoffMainBtn}
            activeOpacity={0.88}
            onPress={() => onBuyNow('meetup')}
          >
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.safeHandoffMainBtnText}>Đặt hẹn Safe-Handoff (Cùng Campus)</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          {/* Hàng nút phụ: Nhắn tin + Trả giá */}
          <View style={styles.secondaryButtonRow}>
            <TouchableOpacity
              style={styles.chatSecondaryBtn}
              activeOpacity={0.85}
              onPress={onChat}
            >
              <Ionicons name="chatbubbles-outline" size={16} color="#EA580C" style={{ marginRight: 6 }} />
              <Text style={styles.chatSecondaryBtnText}>Nhắn tin người bán</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.offerSecondaryBtn}
              activeOpacity={0.85}
              onPress={onMakeOffer}
            >
              <Ionicons name="pricetag-outline" size={15} color="#475569" style={{ marginRight: 5 }} />
              <Text style={styles.offerSecondaryBtnText}>Trả giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // KHÁC CAMPUS: FPT CampusShip Nút To + Nhắn tin & Trả giá
        <View style={styles.actionColumn}>
          {/* Banner thông tin Liên Campus */}
          <View style={styles.diffCampusNotice}>
            <Ionicons name="cube-outline" size={13} color="#EA580C" />
            <Text style={styles.diffCampusNoticeText}>
              FPT CampusShip • Vận chuyển liên cơ sở & Bảo chứng Escrow 48h
            </Text>
          </View>

          {/* Nút chính: Đặt hàng Liên Campus */}
          <TouchableOpacity
            style={styles.interCampusMainBtn}
            activeOpacity={0.88}
            onPress={() => onBuyNow('shipping')}
          >
            <Ionicons name="cube-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.interCampusMainBtnText}>Đặt hàng Liên Campus (FPT CampusShip)</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          {/* Hàng nút phụ: Nhắn tin + Trả giá */}
          <View style={styles.secondaryButtonRow}>
            <TouchableOpacity
              style={styles.chatSecondaryBtn}
              activeOpacity={0.85}
              onPress={onChat}
            >
              <Ionicons name="chatbubbles-outline" size={16} color="#EA580C" style={{ marginRight: 6 }} />
              <Text style={styles.chatSecondaryBtnText}>Nhắn tin người bán</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.offerSecondaryBtn}
              activeOpacity={0.85}
              onPress={onMakeOffer}
            >
              <Ionicons name="pricetag-outline" size={15} color="#475569" style={{ marginRight: 5 }} />
              <Text style={styles.offerSecondaryBtnText}>Trả giá</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    boxShadow: '0 -3px 8px rgba(15, 23, 42, 0.06)',
  },
  actionColumn: {
    width: '100%',
    gap: 8,
  },
  sameCampusNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sameCampusNoticeText: {
    fontSize: 11,
    color: '#065F46',
    fontWeight: '700',
    flex: 1,
  },
  diffCampusNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  diffCampusNoticeText: {
    fontSize: 11,
    color: '#9A3412',
    fontWeight: '700',
    flex: 1,
  },
  safeHandoffMainBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(5, 150, 105, 0.25)',
  },
  safeHandoffMainBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  interCampusMainBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(234, 88, 12, 0.25)',
  },
  interCampusMainBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatSecondaryBtn: {
    flex: 1.4,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSecondaryBtnText: {
    color: '#EA580C',
    fontSize: 12.5,
    fontWeight: '700',
  },
  offerSecondaryBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerSecondaryBtnText: {
    color: '#475569',
    fontSize: 12.5,
    fontWeight: '700',
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
