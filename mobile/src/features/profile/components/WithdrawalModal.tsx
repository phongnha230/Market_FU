import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useWalletStore } from '../../../stores/walletStore';
import { useUserStore } from '../../../stores/userStore';

interface WithdrawalModalProps {
  visible: boolean;
  onClose: () => void;
}

const SUPPORTED_BANKS = [
  'TPBank (Tiên Phong)',
  'Vietcombank',
  'MBBank (Quân Đội)',
  'Techcombank',
  'VPBank',
  'ACB',
  'BIDV',
];

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  visible,
  onClose,
}) => {
  const navigation = useNavigation<any>();
  const { user } = useUserStore();
  const { getWallet, withdraw, fetchWalletBalances } = useWalletStore();
  const wallet = getWallet();

  const [bankName, setBankName] = useState(user?.bankAccount?.bankName || 'TPBank (Tiên Phong)');
  const [accountNo, setAccountNo] = useState(user?.bankAccount?.accountNo || '');
  const [accountName, setAccountName] = useState(user?.bankAccount?.accountName || user?.name || '');
  const [amountStr, setAmountStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchWalletBalances().catch(() => {});
      if (user?.bankAccount?.accountNo) {
        setAccountNo(user.bankAccount.accountNo);
        if (user.bankAccount.bankName) setBankName(user.bankAccount.bankName);
        if (user.bankAccount.accountName) setAccountName(user.bankAccount.accountName);
      }
    }
  }, [visible, user]);

  const availableBalance = wallet.availableBalance;

  const handleQuickAmount = (val: number) => {
    const target = Math.min(val, availableBalance);
    setAmountStr(String(target));
  };

  const handleWithdrawAll = () => {
    setAmountStr(String(availableBalance));
  };

  const handleConfirmWithdraw = async () => {
    const amount = parseInt(amountStr, 10);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Số tiền không hợp lệ', 'Vui lòng nhập số tiền hợp lệ cần rút.');
      return;
    }

    if (amount < 50000) {
      Alert.alert('Hạn mức tối thiểu', 'Số tiền rút tối thiểu là 50.000đ theo quy định tài vụ.');
      return;
    }

    if (amount > availableBalance) {
      Alert.alert(
        'Số dư không đủ',
        `Số dư khả dụng của bạn là ${availableBalance.toLocaleString('vi-VN')}đ, không đủ để rút ${amount.toLocaleString('vi-VN')}đ.`
      );
      return;
    }

    if (!accountNo.trim() || !accountName.trim()) {
      Alert.alert('Thiếu thông tin ngân hàng', 'Vui lòng nhập đầy đủ Số tài khoản và Tên chủ tài khoản nhận tiền.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await withdraw(amount, {
        bankName,
        accountNo: accountNo.trim(),
        accountName: accountName.trim().toUpperCase(),
      });

      if (res.success) {
        Alert.alert(
          '🎉 Lệnh rút tiền thành công!',
          res.message || 'Yêu cầu rút tiền đã được gửi tới Ban Quản trị. Tiền sẽ về tài khoản ngân hàng trong 24h.',
          [
            { text: 'Đóng', onPress: onClose },
            {
              text: 'Xem lịch sử rút',
              onPress: () => {
                onClose();
                navigation.navigate('WithdrawalHistory');
              },
            },
          ]
        );
        setAmountStr('');
      } else {
        Alert.alert('Lỗi rút tiền', res.message);
      }
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể thực hiện rút tiền.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalSheet}>
          {/* Header Bar */}
          <View style={styles.sheetHeader}>
            <View style={styles.indicator} />
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="card" size={20} color="#059669" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sheetTitle}>Rút Tiền Ví Bán Hàng Về ATM</Text>
                <Text style={styles.sheetSubtitle}>Miễn phí rút tiền cho sinh viên FPT (0% phí)</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollBody}
          >
            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Số dư ví khả dụng có thể rút</Text>
              <Text style={styles.balanceValue}>
                {availableBalance.toLocaleString('vi-VN')}
                <Text style={{ fontSize: 18 }}>đ</Text>
              </Text>
              <Text style={styles.escrowNote}>
                🔒 {wallet.escrowBalance.toLocaleString('vi-VN')}đ đang được bảo hộ trong các đơn hàng chờ nhận
              </Text>
            </View>

            {/* Amount input */}
            <Text style={styles.inputLabel}>Số tiền muốn rút (VNĐ) *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="cash-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={amountStr}
                onChangeText={setAmountStr}
                placeholder="VD: 500000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.allBtn} onPress={handleWithdrawAll}>
                <Text style={styles.allBtnText}>Tất cả</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Amount Pills */}
            <View style={styles.quickPillsRow}>
              {[50000, 100000, 200000, 500000].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={styles.quickPill}
                  onPress={() => handleQuickAmount(val)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickPillText}>{(val / 1000).toFixed(0)}k</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bank Select */}
            <Text style={styles.inputLabel}>Ngân hàng thụ hưởng *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={styles.bankPillsRow}>
                {SUPPORTED_BANKS.map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.bankPill, bankName === b && styles.bankPillActive]}
                    onPress={() => setBankName(b)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.bankPillText,
                        bankName === b && styles.bankPillTextActive,
                      ]}
                    >
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Account Number */}
            <Text style={styles.inputLabel}>Số tài khoản ngân hàng (STK) *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="keypad-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={accountNo}
                onChangeText={setAccountNo}
                placeholder="VD: 039882910..."
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>

            {/* Account Name */}
            <Text style={styles.inputLabel}>Họ và tên chủ tài khoản (In hoa không dấu) *</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-circle-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={accountName}
                onChangeText={setAccountName}
                placeholder="VD: NGUYEN VAN A"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />
            </View>

            {/* Safety policy disclaimer */}
            <View style={styles.policyNotice}>
              <Ionicons name="information-circle" size={18} color="#0284C7" />
              <Text style={styles.policyText}>
                Lệnh rút tiền sẽ được bộ phận tài vụ Campus đối soát và chuyển khoản nhanh 24/7 Napas trong 5 - 15 phút.
              </Text>
            </View>
          </ScrollView>

          {/* Action Button */}
          <View style={styles.sheetFooter}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (availableBalance <= 0 || isSubmitting) && styles.submitBtnDisabled,
              ]}
              onPress={handleConfirmWithdraw}
              disabled={availableBalance <= 0 || isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Xác Nhận Rút Tiền Về ATM</Text>
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
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  balanceCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#34D399',
    marginVertical: 4,
  },
  escrowNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '600',
  },
  allBtn: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  allBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  quickPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  quickPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  bankPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bankPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bankPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  bankPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  bankPillTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  policyText: {
    flex: 1,
    fontSize: 11.5,
    color: '#0284C7',
    lineHeight: 16,
  },
  sheetFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    height: 50,
    borderRadius: 14,
    boxShadow: '0 4px 6px rgba(5, 150, 105, 0.3)',
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    boxShadow: 'none',
  },
  submitBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default WithdrawalModal;
