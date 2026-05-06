import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

import { COLOR, FONTS } from '../../../utils/constants';
import CustomInput from '../../components/CustomInput';
import QuotationCard from './QuotationCard';
import QuotationModal from './QuotationModal';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { QuotationActions } from '../../../Redux/QuotationRedux';
import * as RequestStatus from '../../../Entities/RequestStatus';
import QuotationCardShimmer from './QuotationShimmer';
import ViewQuotationScreen from './ViewQuotationScreen'

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─────────────────────────────────────────────
// Tab 1 — existing quotations list
// ─────────────────────────────────────────────
const QuotationsTab = ({ searchText, isActive, isFocused }) => {
  const dispatch = useDispatch();

  const confirmQuotationRequestStatus = useSelector(
    state => state.quotation?.confirmQuotationRequestStatus ?? 'INITIAL',
  );
  const quotationConfirm = useSelector(state => state.quotation?.quotationConfirm ?? []);

  const isLoading = confirmQuotationRequestStatus === RequestStatus.INPROGRESS;

  // Fire API every time this tab becomes active or the screen gains focus
  useEffect(() => {
    if (isActive && isFocused) {
      dispatch(QuotationActions.getQuotationConfirm());
    }
  }, [isActive, isFocused, dispatch]);

  const filterStatusMap = {
    pending: ['Quotation Waiting Approval', 'pending'],
    approved: ['approved'],
    issued: ['issued'],
  };

  const filteredQuotations = useMemo(() => {
    const q = quotationConfirm ?? [];
    const search = (searchText ?? '').trim().toLowerCase();

    return q.filter(item => {
      if (!search) return true;
      const fields = [
        item.id, item.quotationId, item.customerName, item.customer,
        item.insurerName, item.businessProvider, item.phoneNo,
        item.productName, item.productCategory, item.categoryName,
      ];
      return fields.filter(Boolean).some(f => String(f).toLowerCase().includes(search));
    });
  }, [quotationConfirm, searchText]);

  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const openModal = quotation => {
    setSelectedQuotation(quotation);
    setShowQuotationModal(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowQuotationModal(false);
      setSelectedQuotation(null);
    });
  };

  const NoDataView = () => (
    <View style={styles.noDataContainer}>
      <MaterialDesignIcons name="file-document-outline" size={48} color="#bdbdbd" />
      <Text style={styles.noDataText}>No quotations found</Text>
      {/* <Text style={styles.noDataSubText}>Try a different search</Text> */}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={item => item.toString()}
          renderItem={() => <QuotationCardShimmer />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 250 }}
        />
      ) : filteredQuotations.length === 0 ? (
        <View style={{ flex: 1 }}>
          <NoDataView />
        </View>
      ) : (
        <FlatList
          data={filteredQuotations}
          renderItem={({ item }) => <QuotationCard data={item} onPress={openModal} />}
          keyExtractor={item => item.id ?? JSON.stringify(item)}
          contentContainerStyle={{ paddingBottom: 250 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {showQuotationModal && (
        <QuotationModal
          slideAnim={slideAnim}
          modalVisible={showQuotationModal}
          closeModal={closeModal}
          selectedQuotation={selectedQuotation}
        />
      )}
    </View>
  );
};

const TABS = [
  { key: 'quotations', label: 'Manage' },
  { key: 'new',        label: 'View'    },
];

const QuotationScreen = () => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const isFocused = useIsFocused();

  const [activeTab, setActiveTab] = useState(0);

  // Independent search state per tab
  const [tab1Search, setTab1Search] = useState('');
  const [tab2Search, setTab2Search] = useState('');

  const quotationConfirm = useSelector(state => state.quotation?.quotationConfirm ?? []);

  // Animated slide value — 0 = tab 1, -SCREEN_WIDTH = tab 2
  const slideX = useRef(new Animated.Value(0)).current;

  // Tab indicator underline position
  const indicatorX = useRef(new Animated.Value(0)).current;

  const tabWidth = (SCREEN_WIDTH - 40) / 2;

  const switchTab = (index) => {
    setActiveTab(index);

    // Slide content
    Animated.spring(slideX, {
      toValue: -index * SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();

    // Slide indicator
    Animated.spring(indicatorX, {
      toValue: index * tabWidth,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();
  };

  // Reset searches when the parent screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        setTab1Search('');
        setTab2Search('');
        setActiveTab(0);
        slideX.setValue(0);
        indicatorX.setValue(0);
      };
    }, []),
  );

  const currentSearch = activeTab === 0 ? tab1Search : tab2Search;
  const setCurrentSearch = activeTab === 0 ? setTab1Search : setTab2Search;

  return (
    <View style={{ flex: 1 }}>
      {/* ── Shared header ── */}
      <View style={styles.headerContainer}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <MaterialDesignIcons
              name="format-quote-open-outline"
              size={22}
              color={COLOR.PRIMARY_COLOR}
            />
          </View>
          <View style={styles.titleTextContainer}>
            <Text style={styles.titleHeaderText}>Quotation Management</Text>
            <Text style={[styles.subtitleText, activeTab === 1 ? { color: COLOR.WHITE_COLOR } : null]}>
              {activeTab === 0 ? quotationConfirm?.length : null}{' '}
              {activeTab === 0 ? quotationConfirm?.length === 1 ? 'quotation' : 'quotations' : null} available
            </Text>
          </View>
        </View>

        {/* Tab bar */}
        <View style={styles.tabContainer}>
                <View style={styles.tabBar}>
                  <Animated.View
                    style={[
                      styles.tabIndicator,
                      {
                        width: tabWidth,
                        transform: [{ translateX: indicatorX }],
                      },
                    ]}
                  />
                  {TABS.map((tab, index) => (
                    <TouchableOpacity
                      key={tab.key}
                      style={styles.tabButton}
                      onPress={() => switchTab(index)}
                      activeOpacity={0.8}
                    >
                      <MaterialDesignIcons
                        name={index === 0 ? 'cog-sync' : 'file-document-outline'}
                        size={16}
                        color={activeTab === index ? '#FFFFFF' : '#6B7280'}
                      />
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === index && styles.tabTextActive,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

        {/* Shared search — bound to the active tab's state */}
        <CustomInput
          placeholder={
            activeTab === 0
              ? 'Search by Id, Name, Phone, Product...'
              : 'Search by Id, Customer, Product...'
          }
          value={currentSearch}
          setValue={setCurrentSearch}
        />
      </View>

      {/* ── Sliding content area ── */}
      <Animated.View
        style={[
          styles.slidingContainer,
          { width: SCREEN_WIDTH * TABS.length, transform: [{ translateX: slideX }] },
        ]}
      >
        {/* Tab 1 */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <QuotationsTab searchText={tab1Search} isActive={activeTab === 0} isFocused={isFocused} />
        </View>

        {/* Tab 2 */}
        <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
          <ViewQuotationScreen searchText={tab2Search} isActive={activeTab === 1} />
        </View>
      </Animated.View>
    </View>
  );
};

// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
    zIndex: 5000,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 26,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleTextContainer: { marginLeft: 14, flex: 1 },
  titleHeaderText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subtitleText: {
    color: '#6b6b6b',
    marginTop: 2,
    fontSize: 13,
    fontFamily: FONTS.FONT_MEDIUM,
  },

  // ── Tab bar ──
  tabContainer: {
      marginBottom: 14,
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: '#F3F4F6',
      borderRadius: 12,
      padding: 3,
      position: 'relative',
    },
    tabIndicator: {
      position: 'absolute',
      top: 3,
      left: 3,
      bottom: 3,
      borderRadius: 10,
      backgroundColor: COLOR.PRIMARY_COLOR,
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      gap: 6,
      zIndex: 1,
    },
    tabText: {
      fontFamily: FONTS.FONT_MEDIUM,
      fontSize: 13,
      color: '#6B7280',
    },
    tabTextActive: {
      color: '#FFFFFF',
      fontFamily: FONTS.FONT_SEMIBOLD,
    },

  // ── Sliding pane ──
  slidingContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  // ── Shared ──
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  noDataText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9e9e9e',
    fontWeight: '600',
  },
  noDataSubText: {
    marginTop: 6,
    fontSize: 13,
    color: '#bdbdbd',
  },
});

export default QuotationScreen;