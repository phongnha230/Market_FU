import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import { VOUCHERS, MISSIONS } from '../constants/voucher.constants';
import { VoucherTabKey, VoucherItem } from '../types/voucher.types';

export const useVoucher = () => {
  const [activeTab, setActiveTab] = useState<VoucherTabKey>('all');
  const [vouchers, setVouchers] = useState<VoucherItem[]>(VOUCHERS);
  const [coins, setCoins] = useState(320);

  const filteredVouchers = useMemo(() => {
    if (activeTab === 'ship') {
      return vouchers.filter((v) => v.categoryTag === 'CampusShip');
    }
    if (activeTab === 'exchange') {
      return vouchers.filter((v) => v.actionType === 'exchange');
    }
    return vouchers;
  }, [activeTab, vouchers]);

  const handleAction = (item: VoucherItem) => {
    if (item.actionType === 'save') {
      setVouchers((prev) =>
        prev.map((v) => (v.id === item.id ? { ...v, actionType: 'saved' as const } : v))
      );
      Alert.alert('🎉 Đã lưu voucher', `Mã ${item.title} đã được thêm vào ví voucher của bạn.`);
    } else if (item.actionType === 'exchange') {
      if (coins < (item.coinCost || 0)) {
        Alert.alert('Không đủ Coins', 'Bạn cần thêm xu để đổi voucher này.');
        return;
      }
      setCoins((c) => c - (item.coinCost || 0));
      setVouchers((prev) =>
        prev.map((v) => (v.id === item.id ? { ...v, actionType: 'saved' as const } : v))
      );
      Alert.alert('🎉 Đổi thành công!', `Đã dùng ${item.coinCost} xu để đổi voucher.`);
    }
  };

  return {
    activeTab,
    setActiveTab,
    vouchers: filteredVouchers,
    missions: MISSIONS,
    coins,
    handleAction,
  };
};

export default useVoucher;
