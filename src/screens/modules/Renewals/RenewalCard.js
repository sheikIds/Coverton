import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { COLOR, FONTS } from '../../../utils/constants';

const RenewalCard = ({ item, onPress }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return '—';
    }
  };

  const formatCurrency = (val) => {
    if (val == null) return '—';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const ageingValue = parseInt(item?.ageing, 10);
  const isExpired = !isNaN(ageingValue) && ageingValue >= 0;
  const ageingColor = isExpired ? '#E74C3C' : '#22c55e';
  const ageingBg = isExpired ? '#FEF2F2' : '#F0FDF4';
  const ageingLabel = isExpired
    ? `${Math.abs(ageingValue)}d overdue`
    : `${Math.abs(ageingValue)}d left`;

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.policyBadge}>
          <Text style={styles.policyBadgeText}>{item?.policyId || '—'}</Text>
        </View>
        <View style={[styles.ageingBadge, { backgroundColor: ageingBg }]}>
          <MaterialDesignIcons
            name={isExpired ? 'clock-alert-outline' : 'clock-check-outline'}
            size={12}
            color={ageingColor}
          />
          <Text style={[styles.ageingText, { color: ageingColor }]}>
            {ageingLabel}
          </Text>
        </View>
      </View>

      {/* Customer Name */}
      <Text style={styles.customerText} numberOfLines={1}>
        {item?.customer || '—'}
      </Text>

      {/* Details Grid */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <MaterialDesignIcons
            name="shield-check-outline"
            size={13}
            color={COLOR.PRIMARY_COLOR}
          />
          <Text style={styles.detailLabel} numberOfLines={1}>
            {`${item?.product || ''} — ${item?.category || ''}`}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <MaterialDesignIcons
            name="domain"
            size={13}
            color="#6B7280"
          />
          <Text style={styles.detailLabel} numberOfLines={1}>
            {item?.insuranceCompany || '—'}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Premium Expected:</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(item?.premiumExpected)}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Start Date:</Text>
          <Text style={styles.detailValue}>
            {formatDate(item?.startDate)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: 12,
    marginHorizontal: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  policyBadge: {
    backgroundColor: COLOR.BADGE_BACKGROUND,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  policyBadgeText: {
    fontFamily: FONTS.FONT_MEDIUM,
    fontSize: 11,
    color: COLOR.BADGE_TEXT_COLOR,
  },
  ageingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  ageingText: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 10,
  },
  customerText: {
    fontFamily: FONTS.FONT_BOLD,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  detailsGrid: {
    gap: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontFamily: FONTS.FONT_REGULAR,
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 11,
    color: '#1A1A1A',
  },
});

export default RenewalCard;
