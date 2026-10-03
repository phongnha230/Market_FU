import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BankItem {
  code: string;
  name: string;
}

interface EditProfileBankSectionProps {
  bankName: string;
  onBankNameChange: (val: string) => void;
  accountNo: string;
  onAccountNoChange: (val: string) => void;
  accountName: string;
  onAccountNameChange: (val: string) => void;
  banks: BankItem[];
}

export const EditProfileBankSection: React.FC<EditProfileBankSectionProps> = ({
  bankName,
  onBankNameChange,
  accountNo,
  onAccountNoChange,
  accountName,
  onAccountNameChange,
  banks,
}) => {
  const [showBankPicker, setShowBankPicker] = useState(false);

  return (
    <>
      <Text style={[styles.groupHeading, { marginTop: 14 }]}>
        TÀI KHOẢN NGÂN HÀNG (RÚT TIỀN VÍ AN TOÀN)
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ngân hàng thụ hưởng</Text>
        <TouchableOpacity
          style={[styles.inputBox, { justifyContent: 'space-between' }]}
          onPress={() => setShowBankPicker(!showBankPicker)}
          activeOpacity={0.8}
        >
          <View style={styles.bankSelectedRow}>
            <Ionicons name="business-outline" size={18} color="#64748B" style={styles.inputIcon} />
            <Text style={styles.bankSelectedText}>
              {banks.find((b) => b.code === bankName)?.name || bankName}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={18} color="#64748B" />
        </TouchableOpacity>

        {showBankPicker && (
          <View style={styles.bankPickerDropdown}>
            {banks.map((b) => (
              <TouchableOpacity
                key={b.code}
                style={[
                  styles.bankPickerItem,
                  bankName === b.code && styles.bankPickerItemActive,
                ]}
                onPress={() => {
                  onBankNameChange(b.code);
                  setShowBankPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.bankPickerText,
                    bankName === b.code && styles.bankPickerTextActive,
                  ]}
                >
                  {b.name}
                </Text>
                {bankName === b.code && (
                  <Ionicons name="checkmark" size={16} color="#EA580C" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Số tài khoản ngân hàng</Text>
        <View style={styles.inputBox}>
          <Ionicons name="card-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={accountNo}
            onChangeText={onAccountNoChange}
            keyboardType="numeric"
            placeholder="Ví dụ: 0987654321"
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tên chủ tài khoản (Viết hoa không dấu)</Text>
        <View style={styles.inputBox}>
          <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            value={accountName}
            onChangeText={(val) => onAccountNameChange(val.toUpperCase())}
            placeholder="VD: NGUYEN VAN A"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  groupHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  bankSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankSelectedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  bankPickerDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginTop: 6,
    maxHeight: 220,
    overflow: 'hidden',
  },
  bankPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bankPickerItemActive: {
    backgroundColor: '#FFF7ED',
  },
  bankPickerText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '600',
  },
  bankPickerTextActive: {
    color: '#EA580C',
    fontWeight: '700',
  },
});
