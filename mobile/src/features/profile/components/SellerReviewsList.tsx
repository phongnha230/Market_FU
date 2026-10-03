import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SellerReviewsListProps {
  reviews: any[];
}

export const SellerReviewsList: React.FC<SellerReviewsListProps> = ({ reviews }) => {
  return (
    <View style={styles.reviewsList}>
      {reviews.map((rev) => (
        <View key={rev.id} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.reviewerAvatar}>
              <Text style={styles.reviewerInitial}>{rev.reviewerName.charAt(0)}</Text>
            </View>
            <View style={styles.reviewerInfo}>
              <Text style={styles.reviewerName}>{rev.reviewerName}</Text>
              <Text style={styles.reviewTime}>{rev.createdAt || 'Gần đây'}</Text>
            </View>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons
                  key={s}
                  name="star"
                  size={13}
                  color={s <= (rev.rating || 5) ? '#F59E0B' : '#E2E8F0'}
                />
              ))}
            </View>
          </View>
          <Text style={styles.reviewComment}>{rev.comment}</Text>
          {rev.productTitle && (
            <View style={styles.reviewProductBadge}>
              <Ionicons name="pricetag-outline" size={12} color="#64748B" />
              <Text style={styles.reviewProductText}>{rev.productTitle}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  reviewsList: {
    gap: 10,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reviewTime: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  starRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  reviewProductBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },
  reviewProductText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
});
