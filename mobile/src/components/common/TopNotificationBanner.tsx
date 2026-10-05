import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../stores/notificationStore';
import { navigate } from '../../navigation/navigationRef';

export const TopNotificationBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const activeBanner = useNotificationStore((state) => state.activeBanner);
  const pushPermissionGranted = useNotificationStore((state) => state.pushPermissionGranted);
  const hideBanner = useNotificationStore((state) => state.hideBanner);

  const translateY = useRef(new Animated.Value(-160)).current;
  const timeoutRef = useRef<any>(null);

  // PanResponder to allow user to swipe up to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy < -5;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -20) {
          dismissBanner();
        }
      },
    })
  ).current;

  const dismissBanner = () => {
    Animated.timing(translateY, {
      toValue: -160,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      hideBanner();
    });
  };

  useEffect(() => {
    if (activeBanner) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Slide down
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }).start();

      // Auto dismiss after 4.5 seconds
      timeoutRef.current = setTimeout(() => {
        dismissBanner();
      }, 4500);
    } else {
      translateY.setValue(-160);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeBanner]);

  if (!activeBanner || !pushPermissionGranted) return null;

  const handlePress = () => {
    dismissBanner();
    if (activeBanner.targetScreen) {
      navigate(activeBanner.targetScreen as any, activeBanner.targetParams);
    } else {
      navigate('Notification' as any);
    }
  };

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
            <View style={styles.orangeDot} />
            <Text style={styles.appTitle}>FU SECOND-HAND</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.timeText}>{activeBanner.time || 'Vừa xong'}</Text>
            <TouchableOpacity
              onPress={dismissBanner}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: activeBanner.iconBg || '#FFF7ED' },
            ]}
          >
            <Ionicons
              name={(activeBanner.icon as any) || 'notifications'}
              size={18}
              color={activeBanner.iconColor || '#F27024'}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {activeBanner.title}
            </Text>
            <Text style={styles.bodyText} numberOfLines={2}>
              {activeBanner.body}
            </Text>
          </View>
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
    paddingHorizontal: 14,
    elevation: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F27024',
  },
  appTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
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
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
});

export default TopNotificationBanner;
