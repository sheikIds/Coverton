import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

import { QuotationActions } from '../../../Redux/QuotationRedux';
import * as RequestStatus from '../../../Entities/RequestStatus';
import ViewQuotationCard from './ViewQuotationCard';
import ViewQuotationCardShimmer from './ViewQuotationShimmer';
import ViewQuotationDetailModal from './ViewQuotationDetailModal';
import {FONTS} from '../../../utils/constants'

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ViewQuotationScreen = ({ searchText, isActive }) => {
  const dispatch = useDispatch();

  // ─── User ────────────────────────────────────
  const user = useSelector(state => state.auth?.user ?? null);

  // ─── Redux selectors ─────────────────────────
  const viewQuotation = useSelector(state => state.quotation?.viewQuotation ?? []);
  const viewQuotationPagination = useSelector(
    state => state.quotation?.viewQuotationPagination ?? null,
  );
  const viewQuotationRequestStatus = useSelector(
    state => state.quotation?.viewQuotationRequestStatus ?? RequestStatus.INITIAL,
  );

  const isLoading = viewQuotationRequestStatus === RequestStatus.INPROGRESS;

  // ─── Pagination state ────────────────────────
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [quotationsData, setQuotationsData] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageNumberRef = useRef(1);
  const onMomentumScrollBeginCalledDuringMomentum = useRef(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const hasInitiallyLoaded = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    pageNumberRef.current = pageNumber;
  }, [pageNumber]);

  // ─── Sync Redux data → local state ──────────
  useEffect(() => {
    if (!isActive) return; // Don't sync data when tab is not active
    const records = viewQuotation;
    if (records && Array.isArray(records) && records.length >= 0) {
      hasInitiallyLoaded.current = true;
      if (pageNumberRef.current === 1) {
        setQuotationsData([...records]);
      } else {
        setQuotationsData(prev => {
          const newItems = records.filter(
            newItem => !prev.some(p => p.quotationId === newItem.quotationId),
          );
          // Only append truly new items beyond what's already stored
          if (newItems.length === 0 && records.length <= prev.length) return prev;
          // For page > 1, the redux store already has all accumulated records from storeViewQuotation
          // So just use the full list from redux
          return [...records];
        });
      }
      setIsLoadingMore(false);
    }
  }, [viewQuotation, isActive]);

  // ─── Fetch API (debounced) ───────────────────
  useEffect(() => {
    if (!isActive) return;
    if (!user?.userName) return;

    // If search text is between 1-2 chars, don't fire API
    if (searchText && searchText.length > 0 && searchText.length < 3) return;

    setIsDebouncing(true);

    const timer = setTimeout(() => {
      const params = {
        pageNumber,
        pageSize,
        leadProvider: user.userName,
      };

      if (searchText && searchText.length >= 3) {
        params.search = searchText;
      }

      dispatch(QuotationActions.getViewQuotation(params));
      setIsDebouncing(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [searchText, pageNumber, isActive, dispatch, user?.userName]);

  // ─── Reset pagination when search changes ────
  useEffect(() => {
    if (searchText !== undefined) {
      if (searchText.length === 0 || searchText.length >= 3) {
        setPageNumber(1);
        setIsDebouncing(true);
      }
    }
  }, [searchText]);

  // ─── Reset on tab become active ──────────────
  useEffect(() => {
    if (isActive && user?.userName) {
      setPageNumber(1);
      setQuotationsData([]);
      hasInitiallyLoaded.current = false;
    }
  }, [isActive]);

  // ─── Modal state ─────────────────────────────
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const openModal = useCallback((quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailModal(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [slideAnim]);

  const closeModal = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowDetailModal(false);
      setSelectedQuotation(null);
    });
  }, [slideAnim]);

  // ─── Infinite scroll handler ─────────────────
  const handleEndReached = useCallback(() => {
    if (onMomentumScrollBeginCalledDuringMomentum.current) return;
    onMomentumScrollBeginCalledDuringMomentum.current = true;
    if (isLoadingMore) return;
    if (!quotationsData || quotationsData.length === 0) return;
    const hasNextPage = viewQuotationPagination
      ? viewQuotationPagination.hasNext === true || viewQuotationPagination.hasNext === 1
      : false;
    if (!hasNextPage) return;
    if (isLoading) return;
    setIsLoadingMore(true);
    setPageNumber(prev => prev + 1);
  }, [isLoadingMore, quotationsData, viewQuotationPagination, isLoading]);

  // ─── Empty state ─────────────────────────────
  const NoDataView = () => (
    <View style={styles.noDataContainer}>
      <MaterialDesignIcons name="file-document-outline" size={48} color="#bdbdbd" />
      <Text style={styles.noDataText}>No quotations found</Text>
      <Text style={styles.noDataSubText}>
        {searchText
          ? 'Try a different search term.'
          : 'Quotations will appear here.'}
      </Text>
    </View>
  );

  // ─── Footer loader for infinite scroll ───────
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6B7280" />
        <Text style={styles.footerText}>Loading more…</Text>
      </View>
    );
  };

  // ─── Render ──────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {(isLoading || isDebouncing || !hasInitiallyLoaded.current) && pageNumber === 1 ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          keyExtractor={item => item.toString()}
          renderItem={() => <ViewQuotationCardShimmer />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 250 }}
        />
      ) : quotationsData.length === 0 ? (
        <NoDataView />
      ) : (
        <FlatList
          data={quotationsData}
          renderItem={({ item }) => (
            <ViewQuotationCard data={item} onPress={openModal} />
          )}
          keyExtractor={item =>
            item.quotationId ?? JSON.stringify(item)
          }
          contentContainerStyle={{ paddingBottom: 250 }}
          showsVerticalScrollIndicator={false}
          onMomentumScrollBegin={() => {
            onMomentumScrollBeginCalledDuringMomentum.current = false;
          }}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
        />
      )}

      {showDetailModal && (
        <ViewQuotationDetailModal
          visible={showDetailModal}
          onClose={closeModal}
          slideAnim={slideAnim}
          selectedQuotation={selectedQuotation}
        />
      )}
    </View>
  );
};

export default ViewQuotationScreen;

const styles = StyleSheet.create({
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
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: FONTS.FONT_REGULAR,
  },
});