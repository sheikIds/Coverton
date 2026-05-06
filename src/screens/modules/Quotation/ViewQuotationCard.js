import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { COLOR, FONTS } from '../../../utils/constants';

const STATUS_COLORS = {
  Verified: '#16A34A',
  Pending: '#F59E0B',
  Rejected: '#EF4444',
  Issued: '#3B82F6',
  Approved: '#0EA5E9',
};

const ViewQuotationCard = ({ data, onPress }) => {
  const {
    quotationId,
    customer,
    leadProvider,
    insuranceCompany,
    product,
    category,
    premiumExpected,
    quotationAmount,
    saidv,
    status,
  } = data;

  const statusColor = STATUS_COLORS[status] ?? '#6B7280';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => onPress(data)}
    >
      {/* Header: QuotationId + Status */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <MaterialDesignIcons
            name="file-document-outline"
            size={22}
            style={styles.icon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.idText}>{quotationId}</Text>
            <Text style={styles.customerText} numberOfLines={1}>
              {customer}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            {
              borderColor: statusColor,
              backgroundColor: `${statusColor}18`,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {status?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Info Rows */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Lead Provider</Text>
          <Text style={styles.value} numberOfLines={1}>{leadProvider || '—'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Insurance Company</Text>
          <Text style={styles.value} numberOfLines={1}>{insuranceCompany || '—'}</Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Product</Text>
          <Text style={styles.value}>{product || '—'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value} numberOfLines={1}>{category || '—'}</Text>
        </View>
      </View>

      {/* Footer: Amounts */}
      <View style={styles.footerRow}>
        <View style={styles.amountBlock}>
          <Text style={styles.label}>Premium</Text>
          <Text style={styles.amountSmall}>
            ₹ {Number(premiumExpected || 0).toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.amountBlock}>
          <Text style={styles.label}>Quotation Amt</Text>
          <Text style={styles.amountBig}>
            ₹ {Number(quotationAmount || 0).toLocaleString('en-IN')}
          </Text>
        </View>
        <MaterialDesignIcons
          name="chevron-right"
          size={22}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  icon: {
    marginRight: 8,
    color: '#6B7280',
  },
  idText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: FONTS.FONT_REGULAR,
  },
  customerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: FONTS.FONT_SEMIBOLD,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 70,
  },
  statusText: {
    fontSize: 9,
    fontFamily: FONTS.FONT_SEMIBOLD,
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    // backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 2,
    fontFamily: FONTS.FONT_REGULAR,
  },
  value: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '500',
    fontFamily: FONTS.FONT_MEDIUM,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  amountBlock: {
    flex: 1,
  },
  amountSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  amountBig: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F766E',
  },
  chevron: {
    color: '#9CA3AF',
    marginLeft: 8,
  },
});

export default ViewQuotationCard;
