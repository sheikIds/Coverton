import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import DashboardTargetCard from './DashboardTargetCard';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { formatDecimals } from '../../../utils/utils';
import { PolicyActions } from '../../../Redux/PolicyRedux';
import * as RequestStatus from '../../../Entities/RequestStatus';
import { COLOR } from '../../../utils/constants';

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const DashboardScreen = () => {
  const dispatch = useDispatch();
  const policy = useSelector(state => state.policy?.policy ?? {});

  const status = useSelector(
    state => state.policy?.getPolicyRequestStatus ?? 'INITIAL',
  );
  console.log({ policy, status })

  useFocusEffect(
    useCallback(() => {
      dispatch(PolicyActions.getPolicy());
    }, [dispatch]),
  );

  const getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0 = Jan, 3 = April

    if (month >= 3) {
      // April or later
      return `Apr ${year} - Mar ${year + 1}`;
    } else {
      // Jan to March
      return `Apr ${year - 1} - Mar ${year}`;
    }
  };

  const getCurrentMonth = () => {
    const date = new Date();
    return date.toLocaleString('en-IN', { month: 'long' });
  };

  const isLoading = status === RequestStatus.INPROGRESS;

  const totalPremium = `₹ ${formatDecimals(policy?.totalPremium) || 0}`;
  const totalCommission = `₹ ${formatDecimals(policy?.totalCommission) || 0}`;
  const totalPolicies = `${policy?.totalPolicies ?? 0}`;

  const monthlyPolicies = `${policy?.monthlyPolicies ?? 0}`;
  const monthlyPremium = `₹ ${formatDecimals(policy?.monthlyPremium) || 0}`;
  const monthlyCommission = `₹ ${
    formatDecimals(policy?.monthlyCommission) || 0
  }`;
  const financialYear = getFinancialYear();
  const currentMonth = getCurrentMonth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {isLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLOR.PRIMARY_COLOR} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <MaterialDesignIcons name="wallet" size={18} color="#fff" />
              <Text style={styles.heroTitle}>Total Premium</Text>
            </View>

            <Text style={styles.heroAmount}>{totalPremium}</Text>
            <Text style={styles.heroSub}>{financialYear}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance</Text>

            <DashboardTargetCard
              title="Total Policies"
              month={financialYear}
              achievedAmount={totalPolicies}
              isCustomer
            />

            <DashboardTargetCard
              title="Total Brokerage"
              month={financialYear}
              achievedAmount={totalCommission}
            />
          </View>
          {/* 🔷 MONTHLY */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{currentMonth} Month</Text>

            <Row label="Policies" value={monthlyPolicies} />
            <Row label="Premium" value={monthlyPremium} />
            <Row label="Brokerage" value={monthlyCommission} />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* 🔷 HERO */
  heroCard: {
    margin: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#6366f1',
  },

  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  heroTitle: {
    color: '#e0e7ff',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '600',
  },

  heroAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
  },

  heroSub: {
    fontSize: 11,
    color: '#c7d2fe',
    marginTop: 4,
  },

  /* 🔷 SECTIONS */
  section: {
    marginTop: 10,
    paddingHorizontal: 16,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },

  /* 🔷 ROW */
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
  },

  rowLabel: {
    fontSize: 14,
    color: '#475569',
  },

  rowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
});
