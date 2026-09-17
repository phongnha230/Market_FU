import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeHeaderProps {
  userName: string;
  campusName: string;
  avatarUrl?: string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ userName, campusName, avatarUrl }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {/* Top Bar: Logo - Campus - Actions */}
      <View style={styles.topBar}>
        <View style={styles.leftSection}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            contentFit="contain"
            transition={300}
          />
          <View style={styles.campusContainer}>
            <Text style={styles.campusTitle}>FPT 5Campus</Text>
            <TouchableOpacity style={styles.campusPicker}>
              <Text style={styles.campusName}>{campusName}</Text>
              <Ionicons name="chevron-down" size={14} color="#F27024" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton} hitSlop={10}>
            <Ionicons name="search-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} hitSlop={10}>
            <View style={styles.notificationBadge} />
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarButton}>
            <Image
              source={avatarUrl ? { uri: avatarUrl } : require('../../assets/images/default-avatar.png')}
              style={styles.avatar}
              contentFit="cover"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting Section */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingText}>
          Chào {userName} <Text style={styles.handIcon}>👋</Text>
        </Text>
        <View style={styles.statusBadge}>
          <View style={styles.dot} />
          <Text style={styles.statusText}>{campusName} sôi động</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  campusContainer: {
    justifyContent: 'center',
  },
  campusTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  campusPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campusName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F27024',
    textTransform: 'uppercase',
    marginRight: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  avatarButton: {
    marginLeft: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  handIcon: {
    fontSize: 22,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
});

export default HomeHeader;
