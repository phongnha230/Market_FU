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
  const [offerPrice, setOfferPrice] = useState(
    Math.round((originalPrice * 0.9) / 10000) * 10000
  );
  const [note, setNote] = useState('Em qua sảnh Alpha lấy luôn chiều nay, fix em chút nhé anh!');

  const quickDiscounts = [
    { label: '-5%', price: Math.round((originalPrice * 0.95) / 10000) * 10000 },
    { label: '-10%', price: Math.round((originalPrice * 0.9) / 10000) * 10000 },
    { label: '-15%', price: Math.round((originalPrice * 0.85) / 10000) * 10000 },
  ];

  const quickMessages = [
    'Em qua sảnh Alpha lấy luôn chiều nay, fix em chút nhé anh!',
    'Em là tân sinh viên K20, anh bớt em tí được không ạ?',
    'Lấy nhanh gọn trong 15 phút tại KTX.',
  ];

  const formatPrice = (val: number) => val.toLocaleString('vi-VN') + 'đ';

  const handleSend = () => {
    onSubmitOffer(offerPrice, note);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

              <Text style={styles.title}>Đề xuất giá với người bán</Text>
              <Text style={styles.subTitle} numberOfLines={1}>
                {productTitle} • Người bán: {sellerName}
              </Text>

              {/* Price comparison */}
              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceLabel}>Giá niêm yết</Text>
                  <Text style={styles.oldPrice}>{formatPrice(originalPrice)}</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#94A3B8" />
                <View>
                  <Text style={styles.priceLabel}>Giá bạn đề xuất</Text>
                  <Text style={styles.newPrice}>{formatPrice(offerPrice)}</Text>
                </View>
              </View>

              {/* Quick discount chips */}
              <View style={styles.discountRow}>
                {quickDiscounts.map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.chip, offerPrice === item.price && styles.activeChip]}
                    activeOpacity={0.7}
                    onPress={() => setOfferPrice(item.price)}
                  >
                    <Text style={[styles.chipText, offerPrice === item.price && styles.activeChipText]}>
                      {item.label} ({formatPrice(item.price)})
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
                numberOfLines={3}
              />

              {/* Action button */}
              <TouchableOpacity style={styles.submitBtn} activeOpacity={0.85} onPress={handleSend}>
                <Ionicons name="paper-plane" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitText}>Gửi đề xuất giá qua Chat</Text>
              </TouchableOpacity>
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
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

export default MakeOfferModal;
