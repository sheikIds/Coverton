import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useDispatch, useSelector } from 'react-redux';
import { COLOR } from '../../../utils/constants';
import { QuotationActions } from '../../../Redux/QuotationRedux';
import * as RequestStatus from '../../../Entities/RequestStatus';
import ReactNativeBlobUtil from 'react-native-blob-util';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const safeToNumber = v => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalizeCompanies = rawCompanies => {
  if (!rawCompanies) return [];
  if (typeof rawCompanies.toJS === 'function') {
    try {
      const converted = rawCompanies.toJS();
      return Array.isArray(converted)
        ? converted
        : Object.values(converted || {});
    } catch (e) {
      // fall through
    }
  }
  if (typeof rawCompanies.asMutable === 'function') {
    try {
      const converted = rawCompanies.asMutable({ deep: true });
      return Array.isArray(converted)
        ? converted
        : Object.values(converted || {});
    } catch (e) {
      // fall through
    }
  }
  if (Array.isArray(rawCompanies)) return rawCompanies;
  if (typeof rawCompanies === 'object') return Object.values(rawCompanies);
  return [];
};
const detectMimeInfo = (mimeData) => {
  if (!mimeData || typeof mimeData !== 'string') return null;
  if (mimeData.startsWith('data:')) {
    if (mimeData.startsWith('data:application/pdf'))
      return { ext: 'pdf', mime: 'application/pdf' };
    if (mimeData.startsWith('data:image/jpeg') || mimeData.startsWith('data:image/jpg'))
      return { ext: 'jpg', mime: 'image/jpeg' };
    if (mimeData.startsWith('data:image/png'))
      return { ext: 'png', mime: 'image/png' };
    // generic fallback – try to extract from prefix
    const match = mimeData.match(/^data:([^;]+);/);
    if (match) {
      const mime = match[1];
      const ext = mime.split('/')[1] || 'bin';
      return { ext, mime };
    }
  }

  const raw = mimeData.substring(0, 10);
  if (raw.startsWith('JVBER'))
    return { ext: 'pdf', mime: 'application/pdf' }; // %PDF header
  if (raw.startsWith('/9j/'))
    return { ext: 'jpg', mime: 'image/jpeg' };       // JPEG header
  if (raw.startsWith('iVBOR'))
    return { ext: 'png', mime: 'image/png' };         // PNG header

  return { ext: 'pdf', mime: 'application/pdf' }; // default
};

const stripDataPrefix = (mimeData) => {
  if (!mimeData) return '';
  const commaIdx = mimeData.indexOf(',');
  if (mimeData.startsWith('data:') && commaIdx > -1) {
    return mimeData.substring(commaIdx + 1);
  }
  return mimeData;
};

const openMimeDocument = async (mimeData, filenameHint = 'document') => {
  if (!mimeData || typeof mimeData !== 'string' || mimeData.length < 20) {
    Alert.alert('No Document', 'The document is not available.');
    return;
  }

  const info = detectMimeInfo(mimeData);
  if (!info) {
    Alert.alert('Unsupported Format', 'Cannot determine the file type.');
    return;
  }

  const base64Content = stripDataPrefix(mimeData);
  const safeName = filenameHint.replace(/[^a-zA-Z0-9]/g, '_');
  const filePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${safeName}_${Date.now()}.${info.ext}`;

  try {
    await ReactNativeBlobUtil.fs.writeFile(filePath, base64Content, 'base64');

    if (Platform.OS === 'android') {
      await ReactNativeBlobUtil.android.actionViewIntent(filePath, info.mime);
    } else {
      const fileUrl = `file://${filePath}`;
      const canOpen = await Linking.canOpenURL(fileUrl);
      if (canOpen) {
        await Linking.openURL(fileUrl);
      } else {
        await ReactNativeBlobUtil.ios.openDocument(filePath);
      }
    }
  } catch (err) {
    console.warn('openMimeDocument error', err);
    Alert.alert('Error', 'Failed to open the document. Please try again.');
  }
};

const QuotationModalShimmer = () => (
  <View style={shimmerStyles.wrapper}>
    <View style={shimmerStyles.card}>
      <View style={shimmerStyles.row}>
        <View>
          <ShimmerPlaceHolder style={shimmerStyles.smallLine} LinearGradient={LinearGradient} />
          <ShimmerPlaceHolder style={[shimmerStyles.mediumLine, { marginTop: 6 }]} LinearGradient={LinearGradient} />
        </View>
        <ShimmerPlaceHolder style={shimmerStyles.pill} LinearGradient={LinearGradient} />
      </View>
      <View style={shimmerStyles.divider} />
      <View style={shimmerStyles.row}>
        <ShimmerPlaceHolder style={shimmerStyles.chipShimmer} LinearGradient={LinearGradient} />
        <ShimmerPlaceHolder style={[shimmerStyles.chipShimmer, { marginLeft: 10 }]} LinearGradient={LinearGradient} />
      </View>
    </View>
    <ShimmerPlaceHolder
      style={[shimmerStyles.mediumLine, { width: 150, marginBottom: 10, marginTop: 4 }]}
      LinearGradient={LinearGradient}
    />
    {[1, 2, 3].map(i => (
      <View key={i} style={shimmerStyles.companyCard}>
        <View style={shimmerStyles.row}>
          <ShimmerPlaceHolder style={shimmerStyles.icon} LinearGradient={LinearGradient} />
          <ShimmerPlaceHolder style={[shimmerStyles.longLine, { marginLeft: 8 }]} LinearGradient={LinearGradient} />
          <ShimmerPlaceHolder style={[shimmerStyles.checkboxShimmer, { marginLeft: 'auto' }]} LinearGradient={LinearGradient} />
        </View>
        <View style={[shimmerStyles.valuesRow, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <ShimmerPlaceHolder style={shimmerStyles.tinyLine} LinearGradient={LinearGradient} />
            <ShimmerPlaceHolder style={[shimmerStyles.smallLine, { marginTop: 4 }]} LinearGradient={LinearGradient} />
          </View>
          <View style={{ flex: 1 }}>
            <ShimmerPlaceHolder style={shimmerStyles.tinyLine} LinearGradient={LinearGradient} />
            <ShimmerPlaceHolder style={[shimmerStyles.smallLine, { marginTop: 4 }]} LinearGradient={LinearGradient} />
          </View>
          <View style={{ flex: 1 }}>
            <ShimmerPlaceHolder style={shimmerStyles.tinyLine} LinearGradient={LinearGradient} />
            <ShimmerPlaceHolder style={[shimmerStyles.smallLine, { marginTop: 4 }]} LinearGradient={LinearGradient} />
          </View>
        </View>
        {/* Document button shimmer */}
        <ShimmerPlaceHolder style={[shimmerStyles.docBtn, { marginTop: 10 }]} LinearGradient={LinearGradient} />
      </View>
    ))}

    {/* Comparison quote card skeleton */}
    <View style={shimmerStyles.companyCard}>
      <View style={shimmerStyles.row}>
        <ShimmerPlaceHolder style={shimmerStyles.icon} LinearGradient={LinearGradient} />
        <ShimmerPlaceHolder style={[shimmerStyles.longLine, { marginLeft: 8 }]} LinearGradient={LinearGradient} />
      </View>
      <ShimmerPlaceHolder style={[shimmerStyles.docBtn, { marginTop: 12 }]} LinearGradient={LinearGradient} />
    </View>
  </View>
);

const shimmerStyles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valuesRow: { flexDirection: 'row', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  smallLine: { width: 90, height: 10, borderRadius: 4 },
  tinyLine: { width: 60, height: 8, borderRadius: 4 },
  mediumLine: { width: 140, height: 14, borderRadius: 4 },
  longLine: { width: 180, height: 14, borderRadius: 4 },
  pill: { width: 70, height: 24, borderRadius: 12 },
  chipShimmer: { width: 100, height: 26, borderRadius: 13 },
  icon: { width: 20, height: 20, borderRadius: 10 },
  checkboxShimmer: { width: 22, height: 22, borderRadius: 4 },
  docBtn: { width: 130, height: 30, borderRadius: 8 },
});

const QuotationModal = ({
  modalVisible,
  closeModal,
  slideAnim,
  selectedQuotation,
}) => {
  const dispatch = useDispatch();

  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const preferredQuotations = useSelector(state => state.quotation?.preferredQuotations);
  const userData = useSelector(state => state.auth?.user);

  const quotation = useSelector(state => {
    const q = state.quotation?.preferredQuotations;
    if (!q) return null;
    if (typeof q.toJS === 'function') {
      try {
        return q.toJS();
      } catch (e) {
        return q;
      }
    }
    return q;
  });

  const preferredQuotationRequestStatus = useSelector(
    state => state.quotation?.preferredQuotationRequestStatus ?? 'INITIAL',
  );

  const confirmQuotationRequestStatus = useSelector(
    state => state.quotation?.confirmQuotationRequestStatus ?? 'INITIAL',
  );

  const isLoading = preferredQuotationRequestStatus === RequestStatus.INPROGRESS;
  const isConfirming = confirmQuotationRequestStatus === RequestStatus.INPROGRESS;

  useEffect(() => {
    const id = selectedQuotation?.prospectId;
    if (!modalVisible || !id) return;
    dispatch(QuotationActions.getPreferredQuotation(id));
  }, [dispatch, selectedQuotation?.prospectId, modalVisible]);

  const companies = useMemo(
    () => normalizeCompanies(quotation?.preferredQuote),
    [quotation?.preferredQuote],
  );

  // Initialise activeCompanyId from data when companies load
  useEffect(() => {
    if (companies.length > 0) {
      const active = companies.find(
        c => c?.isActive === 1 || c?.isActive === true,
      );
      setActiveCompanyId(active?.id ?? active?.companyId ?? null);
    }
  }, [companies]);

  // Close both modals on confirm success
  useEffect(() => {
    if (confirmQuotationRequestStatus === RequestStatus.OK && confirmModalVisible) {
      setConfirmModalVisible(false);
      // Reset status so it doesn't re-trigger on next open
      dispatch(QuotationActions.setConfirmQuotationRequestStatus(RequestStatus.INITIAL));
      // Close the parent QuotationModal (animates out and returns to list screen)
      if (typeof closeModal === 'function') closeModal();
    }
  }, [confirmQuotationRequestStatus]);

  const handleModalClose = useCallback(() => {
    setActiveCompanyId(null);
    setConfirmModalVisible(false);
    if (typeof closeModal === 'function') closeModal();
  }, [closeModal]);

  const handleToggleActive = useCallback((companyId) => {
    setActiveCompanyId(prev => (prev === companyId ? null : companyId));
  }, []);

  const buildRequestBody = useCallback(() => {
    const updatedPreferredQuote = companies.map(company => {
      const id = company?.id ?? company?.companyId;
      return {
        id: company?.id,
        companyId: company?.companyId,
        name: company?.name,
        value: company?.value,
        isActive: id === activeCompanyId ? 1 : 0,
        quotationDocument: company?.quotationDocument ?? '',
      };
    });

    return {
      prospectId: quotation?.prospectId ?? selectedQuotation?.prospectId ?? '',
      quotationId: quotation?.quotationId ?? selectedQuotation?.id ?? '',
      productId: quotation?.productId ?? quotation?.productType ?? '',
      productName: quotation?.productName ?? quotation?.productType ?? '',
      categoryId: quotation?.categoryId ?? '',
      categoryName: quotation?.categoryName ?? quotation?.categoryType ?? '',
      premiumEstimation: safeToNumber(quotation?.premiumEstimation ?? quotation?.premiumEst ?? 0),
      saidv: safeToNumber(quotation?.saidv ?? 0),
      comparisonQuote: quotation?.comparisonQuote ?? '',
      preferredQuote: updatedPreferredQuote,
    };
  }, [companies, activeCompanyId, quotation, selectedQuotation]);

  const handleConfirmYes = useCallback(() => {
    const body = buildRequestBody();
    dispatch(QuotationActions.confirmQuotation(body));
  }, [dispatch, buildRequestBody]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(modalVisible)}
      onDismiss={handleModalClose}
      onRequestClose={handleModalClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleModalClose}
        />
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <MaterialDesignIcons
                name="license"
                size={24}
                color={COLOR.PRIMARY_COLOR}
              />
              <Text style={styles.modalTitle}>Quotation Details</Text>
            </View>
            <TouchableOpacity
              onPress={handleModalClose}
              style={styles.closeButton}
            >
              <MaterialDesignIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <QuotationModalShimmer />
            </ScrollView>
          ) : (
            <>
              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={styles.modalBodyContent}
                showsVerticalScrollIndicator={false}
              >
                {/* ── Quotation Info Card ── */}
                <View style={styles.card}>
                  <View style={styles.rowSpaceBetween}>
                    <View>
                      <Text style={styles.label}>Quotation ID</Text>
                      <Text style={styles.valuePrimary}>
                        {quotation?.quotationId ?? selectedQuotation?.id ?? '—'}
                      </Text>
                    </View>
                    <View style={styles.statusPill}>
                      <MaterialDesignIcons
                        name="file-document-outline"
                        size={16}
                        color={COLOR.PRIMARY_COLOR}
                      />
                      <Text style={styles.statusPillText}>Quote</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={[styles.rowSpaceBetween, { marginTop: 12 }]}>
                    <View style={styles.chip}>
                      {/* <MaterialDesignIcons
                        name="car-info"
                        size={14}
                        color={COLOR.PRIMARY_COLOR}
                      /> */}
                      <Text style={styles.chipText}>
                        {quotation?.productType ?? quotation?.productName ?? '—'}
                      </Text>
                    </View>
                    <View style={styles.chipSecondary}>
                      {/* <MaterialDesignIcons
                        name="bike"
                        size={14}
                        color="#4B5563"
                      /> */}
                      <Text style={styles.chipSecondaryText}>
                        {quotation?.categoryType ??
                          quotation?.categoryName ??
                          '—'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* ── Insurance Companies ── */}
                <Text style={styles.sectionTitle}>Insurance Companies</Text>

                {companies.map(company => {
                  const id =
                    company?.id ??
                    company?.companyId ??
                    `${company?.name ?? 'company'}-${Math.random()}`;
                  const isActive = id === activeCompanyId;
                  const companyValue = safeToNumber(
                    company?.value ??
                    company?.quotedAmount ??
                    company?.quotedAmountAmount ??
                    0,
                  );
                  const hasDocument =
                    company?.quotationDocument &&
                    typeof company.quotationDocument === 'string' &&
                    company.quotationDocument.length > 20;

                  return (
                    <View
                      key={String(id)}
                      style={[
                        styles.companyCard,
                        isActive && styles.companyCardActive,
                      ]}
                    >
                      <View style={styles.rowSpaceBetween}>
                        <View style={styles.rowCenter}>
                          <MaterialDesignIcons
                            name={isActive ? 'star-circle' : 'shield-check'}
                            size={20}
                            color={isActive ? COLOR.PRIMARY_COLOR : '#9CA3AF'}
                          />
                          <Text
                            style={[
                              styles.companyName,
                              { maxWidth: '60%' },
                            ]}
                            numberOfLines={2}
                          >
                            {company?.name ?? '—'}
                          </Text>
                        </View>

                        {/* Active checkbox */}
                        <TouchableOpacity
                          onPress={() => handleToggleActive(id)}
                          style={styles.checkboxRow}
                          activeOpacity={0.7}
                        >
                          {isActive && (
                            <View style={styles.selectedBadge}>
                              <Text style={styles.selectedBadgeText}>Active</Text>
                            </View>
                          )}
                          <MaterialDesignIcons
                            name={
                              isActive
                                ? 'checkbox-marked'
                                : 'checkbox-blank-outline'
                            }
                            size={24}
                            color={isActive ? COLOR.PRIMARY_COLOR : '#9CA3AF'}
                            style={{ marginLeft: 8 }}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.companyValuesRow}>
                        <View style={styles.valueColumn}>
                          <Text style={styles.smallLabel}>Premium Est.</Text>
                          <Text style={styles.moneyText}>
                            ₹{' '}
                            {Number(
                              quotation?.premiumEstimation ??
                              quotation?.premiumEst ??
                              0,
                            ).toLocaleString('en-IN')}
                          </Text>
                        </View>

                        <View style={styles.valueColumn}>
                          <Text style={styles.smallLabel}>Quoted Amount</Text>
                          <Text style={styles.moneyTextHighlight}>
                            ₹{' '}
                            {Number(
                              quotation?.quotedAmount ?? quotation?.quoted ?? 0,
                            ).toLocaleString('en-IN')}
                          </Text>
                        </View>

                        <View style={styles.valueColumn}>
                          <Text style={styles.smallLabel}>Actual Quotation</Text>
                          <Text style={styles.moneyText}>
                            ₹ {Number(companyValue).toLocaleString('en-IN')}
                          </Text>
                        </View>
                      </View>

                      {/* Document view/download button */}
                      {hasDocument && (
                        <TouchableOpacity
                          style={styles.docButton}
                          activeOpacity={0.7}
                          onPress={() =>
                            openMimeDocument(
                              company.quotationDocument,
                              company?.name ?? 'QuotationDoc',
                            )
                          }
                        >
                          <MaterialDesignIcons
                            name="file-download-outline"
                            size={16}
                            color={COLOR.PRIMARY_COLOR}
                          />
                          <Text style={styles.docButtonText}>View Document</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}

                {/* ── Comparison Quote ── */}
                {quotation?.comparisonQuote &&
                  typeof quotation.comparisonQuote === 'string' &&
                  quotation.comparisonQuote.length > 20 && (
                    <View style={styles.comparisonCard}>
                      <View style={styles.rowSpaceBetween}>
                        <View style={styles.rowCenter}>
                          <MaterialDesignIcons
                            name="file-compare"
                            size={20}
                            color="#4B5563"
                          />
                          <Text style={styles.comparisonTitle}>
                            Comparison Quote
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.docButton}
                        activeOpacity={0.7}
                        onPress={() =>
                          openMimeDocument(
                            quotation.comparisonQuote,
                            'ComparisonQuote',
                          )
                        }
                      >
                        <MaterialDesignIcons
                          name="file-download-outline"
                          size={16}
                          color={COLOR.PRIMARY_COLOR}
                        />
                        <Text style={styles.docButtonText}>
                          Download & View
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                <View style={{ height: 16 }} />
              </ScrollView>

              {/* ── Bottom Action Bar ── */}
              <View style={styles.bottomBar}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                  onPress={handleModalClose}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.activeBtn,
                    !activeCompanyId && styles.activeBtnDisabled,
                  ]}
                  activeOpacity={0.7}
                  disabled={!activeCompanyId}
                  onPress={() => setConfirmModalVisible(true)}
                >
                  <MaterialDesignIcons
                    name="check-circle-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.activeBtnText}>Mark as Active</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </View>

      {/* ── Confirmation Modal ── */}
      <Modal
        animationType="fade"
        transparent
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <MaterialDesignIcons
              name="help-circle-outline"
              size={40}
              color={COLOR.PRIMARY_COLOR}
              style={{ alignSelf: 'center', marginBottom: 12 }}
            />
            <Text style={styles.confirmTitle}>Confirm Quotation</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to mark this company as active?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmNoBtn}
                activeOpacity={0.7}
                onPress={() => setConfirmModalVisible(false)}
                disabled={isConfirming}
              >
                <Text style={styles.confirmNoBtnText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmYesBtn,
                  isConfirming && { opacity: 0.6 },
                ]}
                activeOpacity={0.7}
                onPress={handleConfirmYes}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <Text style={styles.confirmYesBtnText}>Confirming…</Text>
                ) : (
                  <Text style={styles.confirmYesBtnText}>Yes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: { flex: 1 },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#111827',
    marginLeft: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 20 : 16,
    padding: 4,
  },

  modalBody: { flex: 1, backgroundColor: '#F9FAFB' },
  modalBodyContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  smallLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  valuePrimary: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Poppins-SemiBold',
  },
  value: { fontSize: 13, color: '#111827', fontFamily: 'Poppins-Medium' },
  infoBlock: { flex: 1, marginRight: 12 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  statusPillText: {
    marginLeft: 6,
    fontSize: 11,
    color: COLOR.PRIMARY_COLOR,
    fontFamily: 'Poppins-Medium',
  },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#ECFEFF',
  },
  chipText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLOR.PRIMARY_COLOR,
    fontFamily: 'Poppins-Medium',
  },
  chipSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  chipSecondaryText: { marginLeft: 6, fontSize: 12, color: '#374151' },

  sectionTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    marginTop: 4,
  },

  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  companyCardActive: {
    borderColor: COLOR.PRIMARY_COLOR,
    backgroundColor: '#EEF2FF',
  },
  companyName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins-SemiBold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLOR.PRIMARY_COLOR,
  },
  selectedBadgeText: { fontSize: 10, color: '#FFFFFF', fontFamily: 'Poppins-Medium' },

  companyValuesRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  valueColumn: {
    flex: 1,
    marginRight: 8,
  },
  moneyText: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#111827' },
  moneyTextHighlight: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: COLOR.PRIMARY_COLOR,
  },

  // Document button
  docButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 10,
  },
  docButtonText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLOR.PRIMARY_COLOR,
    fontFamily: 'Poppins-Medium',
  },

  // Comparison quote card
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  comparisonTitle: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Poppins-SemiBold',
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-SemiBold',
  },
  activeBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLOR.PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeBtnDisabled: {
    opacity: 0.4,
  },
  activeBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },

  // Confirmation modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBox: {
    width: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 18,
    color: '#111827',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmNoBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  confirmNoBtnText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-SemiBold',
  },
  confirmYesBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLOR.PRIMARY_COLOR,
    alignItems: 'center',
  },
  confirmYesBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },

  emptyState: { padding: 16, alignItems: 'center' },
  emptyText: { color: '#6B7280' },
});

export default QuotationModal;
