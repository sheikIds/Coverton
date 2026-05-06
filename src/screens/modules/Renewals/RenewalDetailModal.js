import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import React from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { COLOR, FONTS } from '../../../utils/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RenewalDetailModal = ({ visible, onClose, item }) => {

  console.log({item})
  if (!item) return null;

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

  const DetailRow = ({ label, value, highlight }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          highlight && { color: COLOR.PRIMARY_COLOR, fontFamily: FONTS.FONT_BOLD },
        ]}
        numberOfLines={2}
      >
        {value || '—'}
      </Text>
    </View>
  );

  const SectionHeader = ({ icon, title }) => (
    <View style={styles.sectionHeader}>
      <MaterialDesignIcons name={icon} size={18} color={COLOR.PRIMARY_COLOR} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const ageingValue = parseInt(item?.ageing, 10);
  const isExpired = !isNaN(ageingValue) && ageingValue >= 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.policyBadge}>
                <Text style={styles.policyBadgeText}>{item?.policyId}</Text>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {item?.customer}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <MaterialDesignIcons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {/* Policy Info */}
            <SectionHeader icon="file-document-outline" title="Policy Information" />
            <View style={styles.sectionCard}>
              <DetailRow label="Policy ID" value={item?.policyId} highlight />
              <DetailRow label="Prospect ID" value={item?.prospectId} />
              <DetailRow label="Policy Number" value={item?.policyNumber} />
              <DetailRow label="Issue Date" value={formatDate(item?.issueDate)} />
              <DetailRow label="Start Date" value={formatDate(item?.startDate)} />
            </View>

            {/* Customer */}
            <SectionHeader icon="account-outline" title="Customer & Provider" />
            <View style={styles.sectionCard}>
              <DetailRow label="Customer" value={item?.customer} />
              <DetailRow label="Lead Provider" value={item?.leadProvider} />
            </View>

            {/* Insurance */}
            <SectionHeader icon="shield-check-outline" title="Insurance Details" />
            <View style={styles.sectionCard}>
              <DetailRow label="Insurance Company" value={item?.insuranceCompany} />
              <DetailRow label="Product" value={item?.product} />
              <DetailRow label="Category" value={item?.category} />
            </View>

            {/* Financials */}
            <SectionHeader icon="currency-inr" title="Financial Summary" />
            <View style={styles.sectionCard}>
              <DetailRow
                label="Premium Expected"
                value={formatCurrency(item?.premiumExpected)}
                highlight
              />
              <DetailRow label="Sum Insured" value={formatCurrency(item?.sumInsured)} />
              <DetailRow
                label="Premium (excl. GST)"
                value={formatCurrency(item?.premiumWithoutGST)}
              />
              <DetailRow label="GST" value={formatCurrency(item?.gst)} />
              <DetailRow label="Brokerage" value={formatCurrency(item?.brokerage)} />
            </View>

            {/* Status */}
            <SectionHeader icon="calendar-clock" title="Renewal Status" />
            <View style={styles.sectionCard}>
              <DetailRow label="Due Date" value={formatDate(item?.timeByWhen)} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ageing</Text>
                <View
                  style={[
                    styles.ageingBadge,
                    {
                      backgroundColor: isExpired ? '#FEF2F2' : '#F0FDF4',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.ageingBadgeText,
                      { color: isExpired ? '#E74C3C' : '#22c55e' },
                    ]}
                  >
                    {item?.ageing ? `${item.ageing} days` : '—'}
                  </Text>
                </View>
              </View>
              <DetailRow
                label="Renewal Status"
                value={item?.renewalStatus || 'Yet to Renew'}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  policyBadge: {
    backgroundColor: COLOR.BADGE_BACKGROUND,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  policyBadgeText: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 12,
    color: COLOR.BADGE_TEXT_COLOR,
  },
  headerTitle: {
    fontFamily: FONTS.FONT_BOLD,
    fontSize: 16,
    color: '#1A1A1A',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 14,
    color: '#1A1A1A',
  },
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: FONTS.FONT_REGULAR,
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 12,
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'right',
  },
  ageingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ageingBadgeText: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 11,
  },
});

export default RenewalDetailModal;
