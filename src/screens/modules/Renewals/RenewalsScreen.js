import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

import { RenewalsActions } from '../../../Redux/RenewalsRedux';
import * as RequestStatus from '../../../Entities/RequestStatus';
import { COLOR, FONTS } from '../../../utils/constants';
import CustomInput from '../../components/CustomInput';
import RenewalCard from './RenewalCard';
import RenewalDetailModal from './RenewalDetailModal';
import RenewActionModal from './RenewActionModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const TABS = ['Renewals', 'Archive'];
const PAGE_SIZE = 10;

const RenewalsScreen = () => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  // ─── Tab state ───────────────────────────
  const [activeTab, setActiveTab] = useState(0); // 0 = Renewals, 1 = Archive
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  // ─── Renewals tab state ──────────────────
  const [renewalSearch, setRenewalSearch] = useState('');
  const [renewalPage, setRenewalPage] = useState(1);
  const [renewalList, setRenewalList] = useState([]);
  const [renewalLoadingMore, setRenewalLoadingMore] = useState(false);
  const renewalPageRef = useRef(1);

  // ─── Archive tab state ───────────────────
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archivePage, setArchivePage] = useState(1);
  const [archiveList, setArchiveList] = useState([]);
  const [archiveLoadingMore, setArchiveLoadingMore] = useState(false);
  const archivePageRef = useRef(1);

  // ─── Common state ────────────────────────
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [actionModalItem, setActionModalItem] = useState(null);
  const onMomentumRef = useRef(false);

  // ─── Selectors ───────────────────────────
  const user = useSelector((state) => state.auth?.user ?? null);

  const renewalResponse = useSelector(
    (state) => state.renewals ?? {},
  );
  const renewalRecords = renewalResponse?.renewalRecords ?? [];
  const renewalRequestStatus =
    renewalResponse?.getRenewalRequestStatus ?? RequestStatus.INITIAL;

  const archiveRecords = renewalResponse?.renewalArchiveRecords ?? [];
  const archiveRequestStatus =
    renewalResponse?.getRenewalArchiveRequestStatus ?? RequestStatus.INITIAL;

  const isRenewalLoading = renewalRequestStatus === RequestStatus.INPROGRESS;
  const isArchiveLoading = archiveRequestStatus === RequestStatus.INPROGRESS;
  const isLoading = activeTab === 0 ? isRenewalLoading : isArchiveLoading;

  // ─── Sync page refs ─────────────────────
  useEffect(() => {
    renewalPageRef.current = renewalPage;
  }, [renewalPage]);

  useEffect(() => {
    archivePageRef.current = archivePage;
  }, [archivePage]);

  // ─── Handle renewal data from redux ─────
  useEffect(() => {
    if (renewalRecords) {
      if (renewalPageRef.current === 1) {
        setRenewalList(renewalRecords);
      } else {
        setRenewalList((prev) => {
          const newItems = renewalRecords.filter(
            (item) => !prev.some((p) => p.policyId === item.policyId),
          );
          return [...prev, ...newItems];
        });
      }
      setRenewalLoadingMore(false);
    }
  }, [renewalRecords]);

  // ─── Handle archive data from redux ─────
  useEffect(() => {
    if (archiveRecords) {
      if (archivePageRef.current === 1) {
        setArchiveList(archiveRecords);
      } else {
        setArchiveList((prev) => {
          const newItems = archiveRecords.filter(
            (item) => !prev.some((p) => p.policyId === item.policyId),
          );
          return [...prev, ...newItems];
        });
      }
      setArchiveLoadingMore(false);
    }
  }, [archiveRecords]);

  // ─── Tab animation ──────────────────────
  const switchTab = (index) => {
    setActiveTab(index);
    Animated.spring(tabIndicatorAnim, {
      toValue: index,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  };

  // ─── Reset on screen focus ──────────────
  useFocusEffect(
    useCallback(() => {
      return () => {
        setRenewalSearch('');
        setArchiveSearch('');
      };
    }, []),
  );

  // ─── Renewals API trigger ───────────────
  useEffect(() => {
    if (!isFocused || activeTab !== 0) return;
    if (renewalSearch && renewalSearch.length > 0 && renewalSearch.length < 3) return;

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      const params = {
        pageNumber: renewalPage,
        pageSize: PAGE_SIZE,
        leadProvider: user?.userName,
      };
      if (renewalSearch.length >= 3) {
        params.search = renewalSearch;
      }
      dispatch(RenewalsActions.getRenewal(params));
      setIsDebouncing(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [renewalSearch, renewalPage, isFocused, activeTab, dispatch]);

  // ─── Archive API trigger ────────────────
  useEffect(() => {
    if (!isFocused || activeTab !== 1) return;
    if (archiveSearch && archiveSearch.length > 0 && archiveSearch.length < 3) return;

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      const params = {
        pageNumber: archivePage,
        pageSize: PAGE_SIZE,
        leadProvider: user?.userName,
      };
      if (archiveSearch.length >= 3) {
        params.search = archiveSearch;
      }
      dispatch(RenewalsActions.getRenewalArchive(params));
      setIsDebouncing(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [archiveSearch, archivePage, isFocused, activeTab, dispatch]);

  // ─── Search handlers ────────────────────
  const handleRenewalSearchChange = (text) => {
    setRenewalSearch(text);
    if (text.length === 0 || text.length >= 3) {
      setRenewalPage(1);
      setIsDebouncing(true);
    }
  };

  const handleArchiveSearchChange = (text) => {
    setArchiveSearch(text);
    if (text.length === 0 || text.length >= 3) {
      setArchivePage(1);
      setIsDebouncing(true);
    }
  };

  // ─── After action: refetch current tab ──
  const handleActionComplete = () => {
    if (activeTab === 0) {
      setRenewalPage(1);
      const params = {
        pageNumber: 1,
        pageSize: PAGE_SIZE,
        leadProvider: user?.userName,
      };
      if (renewalSearch.length >= 3) params.search = renewalSearch;
      dispatch(RenewalsActions.getRenewal(params));
    } else {
      setArchivePage(1);
      const params = {
        pageNumber: 1,
        pageSize: PAGE_SIZE,
        leadProvider: user?.userName,
      };
      if (archiveSearch.length >= 3) params.search = archiveSearch;
      dispatch(RenewalsActions.getRenewalArchive(params));
    }
  };

  // ─── Data for current tab ───────────────
  const currentData = activeTab === 0 ? renewalList : archiveList;
  const currentSearch = activeTab === 0 ? renewalSearch : archiveSearch;
  const currentSearchHandler =
    activeTab === 0 ? handleRenewalSearchChange : handleArchiveSearchChange;
  const currentPage = activeTab === 0 ? renewalPage : archivePage;

  // ─── Tab indicator transform ────────────
  const tabWidth = (SCREEN_WIDTH - 40) / 2;
  const indicatorTranslateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth],
  });

  // ─── Shimmer cards ──────────────────────
  const CARD_PADDING = 44;
  const cardInnerWidth = Math.round(SCREEN_WIDTH - CARD_PADDING);

  const ShimmerCard = ({ index }) => (
    <View key={`shimmer-${index}`} style={styles.cardWrapper}>
      <View style={styles.shimmerCard}>
        <View style={styles.shimmerHeaderRow}>
          <ShimmerPlaceholder
            style={{ width: cardInnerWidth * 0.3, height: 18, borderRadius: 6 }}
          />
          <ShimmerPlaceholder
            style={{ width: cardInnerWidth * 0.2, height: 18, borderRadius: 6 }}
          />
        </View>
        <ShimmerPlaceholder
          style={{
            width: cardInnerWidth * 0.7,
            height: 20,
            borderRadius: 6,
            marginBottom: 10,
          }}
        />
        {[0.5, 0.6, 0.45, 0.4].map((w, i) => (
          <View key={i} style={styles.shimmerDetailRow}>
            <ShimmerPlaceholder
              style={{
                width: cardInnerWidth * w,
                height: 14,
                borderRadius: 6,
              }}
            />
            <ShimmerPlaceholder
              style={{
                width: cardInnerWidth * 0.2,
                height: 14,
                borderRadius: 6,
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );

  // ─── Render header ──────────────────────
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Title */}
      <View style={styles.titleRow}>
        <View style={styles.iconCircle}>
          <MaterialDesignIcons
            name="autorenew"
            size={26}
            color={COLOR.PRIMARY_COLOR}
          />
        </View>
        <View style={styles.titleTextContainer}>
          <Text style={styles.titleText}>Renewals</Text>
          <Text style={styles.subtitleText}>
            Manage renewals & archived renewals
          </Text>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: tabWidth,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          />
          {TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabButton}
              onPress={() => switchTab(index)}
              activeOpacity={0.8}
            >
              <MaterialDesignIcons
                name={index === 0 ? 'file-document-outline' : 'archive-outline'}
                size={16}
                color={activeTab === index ? '#FFFFFF' : '#6B7280'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === index && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <CustomInput
          placeholder="Search by customer, policy..."
          value={currentSearch}
          setValue={currentSearchHandler}
        />
      </View>
    </View>
  );

  // ─── Render hidden swipe item ───────────
  const renderHiddenItem = ({ item }) => {
    const isRenewed = item?.renewalStatus === 'Renewal Issued';

    return (
      <View style={styles.hiddenItemContainer}>
        <TouchableOpacity
          style={[styles.renewSwipeButton, isRenewed && { opacity: 0.5 }]}
          onPress={() => setActionModalItem(item)}
          activeOpacity={0.8}
          disabled={isRenewed}
        >
          <View style={styles.swipeIconCircle}>
            <MaterialDesignIcons name="autorenew" size={20} color={COLOR.BLACK_COLOR} />
          </View>
          <Text style={styles.swipeButtonText}>Renew</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ─── Empty state ────────────────────────
  const renderEmptyState = () => {
    const isSearchActive = currentSearch && currentSearch.length >= 3;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <MaterialDesignIcons
            name={isSearchActive ? 'magnify-close' : 'clipboard-outline'}
            size={48}
            color={COLOR.PLACEHOLDER_COLOR}
          />
        </View>
        <Text style={styles.emptyTitle}>
          {isSearchActive ? 'No matching renewals' : 'No renewals available'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isSearchActive
            ? 'Try adjusting your search criteria'
            : 'Renewal records will appear here'}
        </Text>
      </View>
    );
  };

  console.log({currentData})

  // ─── Pagination handler ─────────────────
  const handleEndReached = () => {
    if (onMomentumRef.current) return;
    onMomentumRef.current = true;

    if (activeTab === 0) {
      if (renewalLoadingMore || isRenewalLoading) return;
      if (!renewalList || renewalList.length === 0) return;
      // Check if there could be more data
      if (renewalList.length < renewalPage * PAGE_SIZE) return;
      setRenewalLoadingMore(true);
      setRenewalPage((prev) => prev + 1);
    } else {
      if (archiveLoadingMore || isArchiveLoading) return;
      if (!archiveList || archiveList.length === 0) return;
      if (archiveList.length < archivePage * PAGE_SIZE) return;
      setArchiveLoadingMore(true);
      setArchivePage((prev) => prev + 1);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLOR.PRIMARY_COLOR} />
      {renderHeader()}
      {(isLoading || isDebouncing) && currentPage === 1 ? (
        <View>
          {[0, 1, 2, 3, 4].map((i) => (
            <ShimmerCard key={`s-${i}`} index={i} />
          ))}
        </View>
      ) : (
        <SwipeListView
          data={currentData}
          keyExtractor={(item, index) =>
            item?.policyId ? String(item.policyId) : String(index)
          }
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.cardWrapper,
                index === currentData?.length - 1 && styles.lastCard,
              ]}
            >
              <RenewalCard
                item={item}
                onPress={(selected) => setDetailModalItem(selected)}
              />
            </View>
          )}
          renderHiddenItem={renderHiddenItem}
          contentContainerStyle={styles.listContent}
          rightOpenValue={-105}
          disableRightSwipe
          previewDuration={500}
          previewOpenValue={-105}
          previewFirstRow={true}
          previewRowKey={
            currentData?.length > 0 && currentData[0]?.policyId
              ? String(currentData[0].policyId)
              : '0'
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          onMomentumScrollBegin={() => {
            onMomentumRef.current = false;
          }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          onRowOpen={(rowKey, rowMap) => {
            Object.keys(rowMap).forEach((key) => {
              if (key !== rowKey) {
                const row = rowMap[key];
                if (row && typeof row.closeRow === 'function') {
                  row.closeRow();
                }
              }
            });
          }}
        />
      )}

      {/* Detail Modal */}
      <RenewalDetailModal
        visible={!!detailModalItem}
        onClose={() => setDetailModalItem(null)}
        item={detailModalItem}
      />

      {/* Action Modal */}
      <RenewActionModal
        visible={!!actionModalItem}
        onClose={() => setActionModalItem(null)}
        item={actionModalItem}
        onActionComplete={handleActionComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // ─── Header ──────────────────────────
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  titleText: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 22,
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontFamily: FONTS.FONT_REGULAR,
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  // ─── Tabs ────────────────────────────
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
  // ─── Search ──────────────────────────
  searchContainer: {
    // uses CustomInput component
  },
  // ─── List ────────────────────────────
  listContent: {
    paddingBottom: 140,
  },
  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 4,
  },
  lastCard: {
    marginBottom: 0,
  },
  // ─── Swipe Hidden ────────────────────
  hiddenItemContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginHorizontal: 16,
    marginBottom: 4,
    marginTop: 12,
    paddingVertical: 8,
    paddingRight: 8,
    gap: 12,
  },
  renewSwipeButton: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLOR.WHITE_COLOR,
    shadowColor: '#6b6d70',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  swipeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  swipeButtonText: {
    color: COLOR.BLACK_COLOR,
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  // ─── Shimmer ─────────────────────────
  shimmerCard: {
    marginTop: 12,
    marginHorizontal: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  shimmerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shimmerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  // ─── Empty ───────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 18,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FONTS.FONT_REGULAR,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RenewalsScreen;
