import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../stores/notificationStore';
import { navigate } from '../../navigation/navigationRef';

export const TopNotificationBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const activeBanner = useNotificationStore((state) => state.activeBanner);
  const hideBanner = useNotificationStore((state) => state.hideBanner);

  const [translateY] = useState(() => new Animated.Value(-180));
  const timeoutRef = useRef<any>(null);

  const dismissBanner = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -180,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      hideBanner();
    });
  }, [hideBanner, translateY]);

  // PanResponder to allow user to swipe up to dismiss
  const [panResponder] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy < -5;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -15) {
          dismissBanner();
        }
      },
    })
  );

  useEffect(() => {
    if (activeBanner) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Slide down
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }).start();

      // Auto dismiss after 4.5 seconds
      timeoutRef.current = setTimeout(() => {
        dismissBanner();
      }, 4500);
    } else {
      translateY.setValue(-180);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeBanner, dismissBanner, translateY]);

  if (!activeBanner) return null;

  const handlePress = () => {
    dismissBanner();
    if (activeBanner.targetScreen) {
      navigate(activeBanner.targetScreen as any, activeBanner.targetParams);
    } else {
      navigate('Notification' as any);
    }
  };

  const isChat = activeBanner.category === 'chat';
  const tagLabel = isChat ? 'TIN NHẮN MỚI' : activeBanner.category === 'order' ? 'ĐƠN HÀNG' : 'HỆ THỐNG';

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          paddingTop: Math.max(insets.top, 10),
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="box-none"
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={handlePress}
      >
        <View style={styles.cardHeader}>
          <View style={styles.appBadge}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>FU SECOND-HAND</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{tagLabel}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.timeText}>{activeBanner.time || 'Vừa xong'}</Text>
            <TouchableOpacity
              onPress={dismissBanner}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBody}>
          {activeBanner.avatarUrl ? (
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: activeBanner.avatarUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
              <View style={styles.avatarOnlineDot} />
            </View>
          ) : (
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: activeBanner.iconBg || '#FFF7ED' },
              ]}
            >
              <Ionicons
                name={(activeBanner.icon as any) || (isChat ? 'chatbubbles' : 'notifications')}
                size={22}
                color={activeBanner.iconColor || '#EA580C'}
              />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {activeBanner.title}
            </Text>
            <Text style={styles.bodyText} numberOfLines={2}>
              {activeBanner.body}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    paddingHorizontal: 12,
    elevation: 25,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: '#F8FAFC',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  appTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  categoryBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#FFEDD5',
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EA580C',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  closeBtn: {
    padding: 2,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
});

export default TopNotificationBanner;
