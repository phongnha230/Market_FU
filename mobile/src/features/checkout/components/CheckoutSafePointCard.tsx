import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface SafePointHub {
  id: string;
  name: string;
  desc: string;
  badge: string;
}

const DEFAULT_SAFEPOINT_HUBS: SafePointHub[] = [
  {
    id: 'hub-1',
    name: 'Sảnh Tòa Alpha (Khu vực có bàn test & Camera 24/7)',
    desc: 'Điểm hẹn an toàn chính tại sảnh ĐH FPT, có bảo vệ và camera',
    badge: 'Bàn test điện',
  },
  {
    id: 'hub-2',
    name: 'Thư viện Gamma (Tầng 1 - Khu tự học test máy)',
    desc: 'Ánh sáng tốt, không gian yên tĩnh, thích hợp test laptop & tablet',
    badge: 'Yên tĩnh',
  },
  {
    id: 'hub-3',
    name: 'Sảnh KTX Dom A-B (Gần quầy lễ tân)',
    desc: 'Thuận tiện giao nhận trưa và tối cho sinh viên nội trú KTX',
    badge: 'Bảo vệ KTX',
  },
  {
    id: 'hub-4',
    name: 'Căn tin Dom E-F (Khu ăn uống & cà phê)',
    desc: 'Gần trạm VinBus, thoáng mát, thích hợp hẹn gặp giờ nghỉ',
    badge: 'Căn tin',
  },
];

const TIME_SLOTS = [
  { label: '11:30 - 12:30 (Trưa ca 2)', icon: 'sunny-outline', short: 'Trưa ca 2' },
  { label: '16:30 - 17:15 (Chiều ca 4)', icon: 'partly-sunny-outline', short: 'Chiều ca 4' },
  { label: '17:30 - 18:30 (Tan học chiều)', icon: 'time-outline', short: 'Tan học' },
  { label: '19:30 - 20:30 (Tối KTX)', icon: 'moon-outline', short: 'Tối KTX' },
];

interface CheckoutSafePointCardProps {
  isMeetup: boolean;
  selectedSafePoint: string;
  onSelectSafePoint: (point: string) => void;
  appointmentDate: 'today' | 'tomorrow';
  onSelectAppointmentDate: (date: 'today' | 'tomorrow') => void;
  appointmentSlot: string;
  onSelectAppointmentSlot: (slot: string) => void;
  sellerCampus?: string;
  buyerCampus?: string;
  deliveryNote: string;
  onChangeDeliveryNote: (note: string) => void;
}

export const CheckoutSafePointCard: React.FC<CheckoutSafePointCardProps> = ({
  isMeetup,
  selectedSafePoint,
  onSelectSafePoint,
  appointmentDate,
  onSelectAppointmentDate,
  appointmentSlot,
  onSelectAppointmentSlot,
  sellerCampus = 'Hòa Lạc',
  buyerCampus = 'Hòa Lạc',
  deliveryNote,
  onChangeDeliveryNote,
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);

  const todayLabel = 'Hôm nay';
  const tomorrowLabel = 'Ngày mai';

  if (!isMeetup) {
    // INTER-CAMPUS SHIPPING VIEW
    return (
      <>
        <Text style={styles.sectionHeader}>VẬN CHUYỂN LIÊN CAMPUS (FPT CAMPUSSHIP)</Text>
        <View style={styles.card}>
          <View style={styles.routeHeader}>
            <View style={styles.transitBadge}>
              <Ionicons name="bus-outline" size={16} color="#EA580C" />
              <Text style={styles.transitBadgeText}>Tuyến xe FPT Bus 24h</Text>
            </View>
            <Text style={styles.estimatedText}>Dự kiến 2 - 3 ngày</Text>
          </View>

          {/* Route path */}
          <View style={styles.routePathContainer}>
            <View style={styles.routeStop}>
              <View style={styles.originDot} />
              <Text style={styles.routeCityLabel}>GỬI TỪ</Text>
              <Text style={styles.routeCityVal} numberOfLines={1} ellipsizeMode="tail">{sellerCampus}</Text>
            </View>
            <View style={styles.routeLine}>
              <Ionicons name="arrow-forward" size={14} color="#EA580C" />
            </View>
            <View style={[styles.routeStop, { alignItems: 'flex-end' }]}>
              <View style={styles.destDot} />
              <Text style={styles.routeCityLabel}>NHẬN TẠI</Text>
              <Text style={styles.routeCityVal} numberOfLines={1} ellipsizeMode="tail">{buyerCampus}</Text>
            </View>
          </View>

          {/* Destination safe-point & Dom note */}
          <View style={styles.destinationBox}>
            <View style={styles.destHeaderRow}>
              <View style={styles.rowAlign}>
                <Ionicons name="location" size={16} color="#EA580C" />
                <Text style={styles.destTitle}>Điểm nhận hàng KTX</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditingNote(!isEditingNote)}>
                <Text style={styles.editActionText}>{isEditingNote ? 'Xong' : 'Sửa phòng'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.destSub}>
              Sảnh KTX Dom B (Cơ sở {buyerCampus}) • Trạm bưu cục FPT
            </Text>

            {isEditingNote ? (
              <TextInput
                style={styles.noteInput}
                value={deliveryNote}
                onChangeText={onChangeDeliveryNote}
                placeholder="Nhập số phòng KTX (vd: P402 Dom B)..."
                placeholderTextColor="#94A3B8"
              />
            ) : (
              <Text style={styles.noteDisplay}>
                💬 <Text style={styles.boldText}>Ghi chú:</Text> {deliveryNote}
              </Text>
            )}
          </View>

          <View style={styles.escrowNotice}>
            <Ionicons name="shield-checkmark" size={15} color="#059669" />
            <Text style={styles.escrowNoticeText}>
              Bảo hộ Escrow 48h: Bạn nhận kiện hàng, kiểm tra đồng kiểm bóc hộp trước khi giải ngân cho người bán.
            </Text>
          </View>
        </View>
      </>
    );
  }

  // SAME-CAMPUS MEETUP (SAFE-HANDOFF) VIEW
  return (
    <>
      <Text style={styles.sectionHeader}>ĐIỂM HẸN SAFE-POINT & LỊCH GẶP MẶT</Text>
      <View style={styles.card}>
        {/* Banner Safe-Point camera */}
        <View style={styles.cameraBanner}>
          <Ionicons name="videocam-outline" size={16} color="#047857" />
          <Text style={styles.cameraBannerText}>
            Trạm Safe-Point có camera 24/7 & bàn test thiết bị trực tiếp
          </Text>
        </View>

        {/* 1. Safe-Point Hubs Selection */}
        <Text style={styles.stepTitle}>1. Chọn trạm Safe-Point tại {sellerCampus}:</Text>
        <View style={styles.hubsContainer}>
          {DEFAULT_SAFEPOINT_HUBS.map((hub) => {
            const isSelected = selectedSafePoint.includes(hub.name.split(' (')[0]);
            return (
              <TouchableOpacity
                key={hub.id}
                style={[styles.hubItem, isSelected && styles.hubItemSelected]}
                onPress={() => onSelectSafePoint(hub.name)}
                activeOpacity={0.7}
              >
                <View style={styles.hubHeader}>
                  <Text style={[styles.hubName, isSelected && styles.hubNameSelected]}>
                    {hub.name}
                  </Text>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={18} color="#EA580C" />
                  ) : (
                    <View style={styles.hubBadge}>
                      <Text style={styles.hubBadgeText}>{hub.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.hubDesc}>{hub.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Date Selection */}
        <Text style={styles.stepTitle}>2. Chọn ngày hẹn gặp:</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={[styles.dateBtn, appointmentDate === 'today' && styles.dateBtnSelected]}
            onPress={() => onSelectAppointmentDate('today')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color={appointmentDate === 'today' ? '#EA580C' : '#64748B'}
            />
            <Text style={[styles.dateBtnText, appointmentDate === 'today' && styles.dateBtnTextSelected]}>
              {todayLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateBtn, appointmentDate === 'tomorrow' && styles.dateBtnSelected]}
            onPress={() => onSelectAppointmentDate('tomorrow')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color={appointmentDate === 'tomorrow' ? '#EA580C' : '#64748B'}
            />
            <Text style={[styles.dateBtnText, appointmentDate === 'tomorrow' && styles.dateBtnTextSelected]}>
              {tomorrowLabel}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Slot Selection */}
        <Text style={styles.stepTitle}>3. Chọn khung giờ gặp mặt:</Text>
        <View style={styles.slotsGrid}>
          {TIME_SLOTS.map((slot) => {
            const isSelected = appointmentSlot === slot.label;
            return (
              <TouchableOpacity
                key={slot.label}
                style={[styles.slotItem, isSelected && styles.slotItemSelected]}
                onPress={() => onSelectAppointmentSlot(slot.label)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={slot.icon as any}
                  size={14}
                  color={isSelected ? '#065F46' : '#64748B'}
                />
                <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>
                  {slot.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Appointment Summary */}
        <View style={styles.appointmentSummary}>
          <Ionicons name="time" size={18} color="#D97706" />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryTitle}>
              Hẹn: {appointmentSlot} • {appointmentDate === 'today' ? 'Hôm nay' : 'Ngày mai'}
            </Text>
            <Text style={styles.summaryLocation} numberOfLines={2}>
              📍 {selectedSafePoint}
            </Text>
            <Text style={styles.summaryHint}>
              Hệ thống phát hành mã OTP 4 số + QR Handshake. Sau khi kiểm tra hàng ưng ý mới trao mã để hoàn tất.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  cameraBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 14,
    gap: 6,
  },
  cameraBannerText: {
    fontSize: 11.5,
    color: '#065F46',
    fontWeight: '600',
    flex: 1,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  hubsContainer: {
    gap: 8,
  },
  hubItem: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 11,
    backgroundColor: '#F8FAFC',
  },
  hubItemSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  hubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  hubName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    lineHeight: 17,
  },
  hubNameSelected: {
    color: '#C2410C',
  },
  hubBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hubBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  hubDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 15,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  dateBtnSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  dateBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  dateBtnTextSelected: {
    fontWeight: '800',
    color: '#EA580C',
  },
  slotsGrid: {
    gap: 6,
    marginTop: 2,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  slotItemSelected: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  slotTextSelected: {
    fontWeight: '800',
    color: '#065F46',
  },
  appointmentSummary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    gap: 10,
  },
  summaryCol: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#92400E',
  },
  summaryLocation: {
    fontSize: 11.5,
    color: '#B45309',
    marginTop: 2,
    fontWeight: '600',
  },
  summaryHint: {
    fontSize: 10.5,
    color: '#B45309',
    marginTop: 4,
    lineHeight: 14,
  },
  // Shipping styles
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  transitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  estimatedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  routePathContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  routeStop: {
    flex: 1,
    minWidth: 0,
  },
  originDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
    marginBottom: 4,
  },
  destDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
    marginBottom: 4,
  },
  routeCityLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
  },
  routeCityVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  routeLine: {
    paddingHorizontal: 12,
  },
  destinationBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  destHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  destTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  editActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  destSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 4,
  },
  noteInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0F172A',
  },
  noteDisplay: {
    fontSize: 11.5,
    color: '#475569',
    marginTop: 6,
  },
  boldText: {
    fontWeight: '700',
  },
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    gap: 6,
  },
  escrowNoticeText: {
    fontSize: 11,
    color: '#059669',
    flex: 1,
    lineHeight: 15,
  },
});
