import React, { useEffect, useMemo, useCallback } from 'react';
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
import { COLOR, FONTS } from '../../../utils/constants';
import { QuotationActions } from '../../../Redux/QuotationRedux';
import * as RequestStatus from '../../../Entities/RequestStatus';
import ReactNativeBlobUtil from 'react-native-blob-util';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Document helpers ────────────────────────────────────────────
const detectMimeInfo = (mimeData) => {
  if (!mimeData || typeof mimeData !== 'string') return null;
  if (mimeData.startsWith('data:')) {
    if (mimeData.startsWith('data:application/pdf'))
      return { ext: 'pdf', mime: 'application/pdf' };
    if (mimeData.startsWith('data:image/jpeg') || mimeData.startsWith('data:image/jpg'))
      return { ext: 'jpg', mime: 'image/jpeg' };
    if (mimeData.startsWith('data:image/png'))
      return { ext: 'png', mime: 'image/png' };
    const match = mimeData.match(/^data:([^;]+);/);
    if (match) {
      const mime = match[1];
      const ext = mime.split('/')[1] || 'bin';
      return { ext, mime };
    }
  }
  const raw = mimeData.substring(0, 10);
  if (raw.startsWith('JVBER')) return { ext: 'pdf', mime: 'application/pdf' };
  if (raw.startsWith('/9j/')) return { ext: 'jpg', mime: 'image/jpeg' };
  if (raw.startsWith('iVBOR')) return { ext: 'png', mime: 'image/png' };
  return { ext: 'pdf', mime: 'application/pdf' };
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

const downloadToLocal = async (mimeData, filenameHint = 'document') => {
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
  const downloadDir = Platform.OS === 'android'
    ? ReactNativeBlobUtil.fs.dirs.DownloadDir
    : ReactNativeBlobUtil.fs.dirs.DocumentDir;
  const fileName = `${safeName}_${Date.now()}.${info.ext}`;
  const filePath = `${downloadDir}/${fileName}`;

  try {
    await ReactNativeBlobUtil.fs.writeFile(filePath, base64Content, 'base64');

    if (Platform.OS === 'android') {
      try {
        await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
          {
            name: fileName,
            parentFolder: '',
            mimeType: info.mime,
          },
          'Download',
          filePath,
        );
      } catch (_) {
        // Fallback — file is already saved in DownloadDir
      }
    }

    Alert.alert(
      'Download Complete',
      `File saved to ${Platform.OS === 'android' ? 'Downloads' : 'Documents'}/${fileName}`,
    );
  } catch (err) {
    console.warn('downloadToLocal error', err);
    Alert.alert('Error', 'Failed to download the document. Please try again.');
  }
};

const normalizeData = (raw) => {
  if (!raw) return null;
  if (typeof raw.toJS === 'function') {
    try { return raw.toJS(); } catch { return raw; }
  }
  if (typeof raw.asMutable === 'function') {
    try { return raw.asMutable({ deep: true }); } catch { return raw; }
  }
  return raw;
};

// ─── Shimmer for modal loading ───────────────────────────────────
const DetailModalShimmer = () => (
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
      <View style={[shimmerStyles.row, { marginTop: 12 }]}>
        <View style={{ flex: 1 }}>
          <ShimmerPlaceHolder style={shimmerStyles.tinyLine} LinearGradient={LinearGradient} />
          <ShimmerPlaceHolder style={[shimmerStyles.smallLine, { marginTop: 4 }]} LinearGradient={LinearGradient} />
        </View>
        <View style={{ flex: 1 }}>
          <ShimmerPlaceHolder style={shimmerStyles.tinyLine} LinearGradient={LinearGradient} />
          <ShimmerPlaceHolder style={[shimmerStyles.smallLine, { marginTop: 4 }]} LinearGradient={LinearGradient} />
        </View>
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
        </View>
        <View style={[shimmerStyles.row, { marginTop: 12 }]}>
          <View style={{ flex: 1 }}>
            <ShimmerPlaceHolder style={shimmerStyles.tinyLine} LinearGradient={LinearGradient} />
            <ShimmerPlaceHolder style={[shimmerStyles.smallLine, { marginTop: 4 }]} LinearGradient={LinearGradient} />
          </View>
          <View style={{ flex: 1 }}>
            <ShimmerPlaceHolder style={shimmerStyles.tinyLine} LinearGradient={LinearGradient} />
            <ShimmerPlaceHolder style={[shimmerStyles.smallLine, { marginTop: 4 }]} LinearGradient={LinearGradient} />
          </View>
        </View>
        <ShimmerPlaceHolder style={[shimmerStyles.docBtn, { marginTop: 10 }]} LinearGradient={LinearGradient} />
      </View>
    ))}
  </View>
);

const shimmerStyles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
  },
  companyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  smallLine: { width: 90, height: 10, borderRadius: 4 },
  tinyLine: { width: 60, height: 8, borderRadius: 4 },
  mediumLine: { width: 140, height: 14, borderRadius: 4 },
  longLine: { width: 180, height: 14, borderRadius: 4 },
  pill: { width: 70, height: 24, borderRadius: 12 },
  chipShimmer: { width: 100, height: 26, borderRadius: 13 },
  icon: { width: 20, height: 20, borderRadius: 10 },
  docBtn: { width: 130, height: 30, borderRadius: 8 },
});

// ─── Main Modal Component ────────────────────────────────────────
const ViewQuotationDetailModal = ({
  visible,
  onClose,
  slideAnim,
  selectedQuotation,
}) => {
  const dispatch = useDispatch();

  const rawDocDetails = useSelector(state => state.quotation?.quotationDocumentDetails);
  const docDetails = useMemo(() => normalizeData(rawDocDetails), [rawDocDetails]);

  console.log({rawDocDetails})

  const docRequestStatus = useSelector(
    state => state.quotation?.getQuotationDocumentDetailsRequestStatus ?? 'INITIAL',
  );

  const isLoading = docRequestStatus === RequestStatus.INPROGRESS;

  useEffect(() => {
    if (visible && selectedQuotation?.quotationId) {
      dispatch(QuotationActions.getQuotationDocumentDetails(selectedQuotation.quotationId));
    }
  }, [dispatch, visible, selectedQuotation?.quotationId]);

  const handleClose = useCallback(() => {
    dispatch(QuotationActions.clearQuotationDocumentDetails());
    if (typeof onClose === 'function') onClose();
  }, [dispatch, onClose]);

  const preferredQuotes = useMemo(() => {
    if (!docDetails?.preferredQuote) return [];
    const raw = docDetails.preferredQuote;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') return Object.values(raw);
    return [];
  }, [docDetails?.preferredQuote]);

  const formatCurrency = (val) => {
    if (val == null) return '—';
    return `₹ ${Number(val).toLocaleString('en-IN')}`;
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(visible)}
      onDismiss={handleClose}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <MaterialDesignIcons
                name="file-search-outline"
                size={24}
                color={COLOR.PRIMARY_COLOR}
              />
              <Text style={styles.modalTitle}>Quotation Details</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
            >
              <MaterialDesignIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <DetailModalShimmer />
            </ScrollView>
          ) : (
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
                      {docDetails?.quotationId ?? selectedQuotation?.quotationId ?? '—'}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <MaterialDesignIcons
                      name="file-document-outline"
                      size={16}
                      color={COLOR.PRIMARY_COLOR}
                    />
                    <Text style={styles.statusPillText}>
                      {selectedQuotation?.status ?? 'Quote'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Product / Category chips */}
                <View style={[styles.rowSpaceBetween, { marginTop: 4 }]}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      {docDetails?.productName ?? '—'}
                    </Text>
                  </View>
                  <View style={styles.chipSecondary}>
                    <Text style={styles.chipSecondaryText}>
                      {docDetails?.categoryName ?? '—'}
                    </Text>
                  </View>
                </View>

                {/* Amounts */}
                <View style={[styles.rowSpaceBetween, { marginTop: 14 }]}>
                  <View style={styles.infoBlock}>
                    <Text style={styles.label}>Premium Estimation</Text>
                    <Text style={styles.value}>
                      {formatCurrency(docDetails?.premiumEstimation)}
                    </Text>
                  </View>
                  <View style={styles.infoBlock}>
                    <Text style={styles.label}>SAIDV</Text>
                    <Text style={styles.value}>
                      {formatCurrency(docDetails?.saidv)}
                    </Text>
                  </View>
                </View>

                {/* Prospect ID */}
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.label}>Prospect ID</Text>
                  <Text style={styles.value}>
                    {docDetails?.prospectId ?? '—'}
                  </Text>
                </View>
              </View>

              {/* ── Preferred Quotes ── */}
              {preferredQuotes.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Preferred Quotes</Text>
                  {preferredQuotes.map((company, index) => {
                    const hasDocument =
                      company?.quotationDocument &&
                      typeof company.quotationDocument === 'string' &&
                      company.quotationDocument.length > 20;
                    const isActive = company?.isActive === 1 || company?.isActive === true;
                    const companyValue = Number(company?.value ?? 0);

                    return (
                      <View
                        key={company?.id ?? index}
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
                              style={[styles.companyName, { maxWidth: '65%' }]}
                              numberOfLines={2}
                            >
                              {company?.name ?? '—'}
                            </Text>
                          </View>
                          {isActive && (
                            <View style={styles.activeBadge}>
                              <Text style={styles.activeBadgeText}>Active</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.companyValueRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.smallLabel}>Quoted Amount</Text>
                            <Text style={styles.moneyText}>
                              {formatCurrency(companyValue)}
                            </Text>
                          </View>
                        </View>

                        {/* Document buttons */}
                        {hasDocument && (
                          <View style={styles.docActions}>
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
                                name="eye-outline"
                                size={16}
                                color={COLOR.PRIMARY_COLOR}
                              />
                              <Text style={styles.docButtonText}>View</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.docButton}
                              activeOpacity={0.7}
                              onPress={() =>
                                downloadToLocal(
                                  company.quotationDocument,
                                  `${company?.name ?? 'QuotationDoc'}`,
                                )
                              }
                            >
                              <MaterialDesignIcons
                                name="download-outline"
                                size={16}
                                color={COLOR.PRIMARY_COLOR}
                              />
                              <Text style={styles.docButtonText}>Download</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </>
              )}

              {/* ── Comparison Quote ── */}
              {docDetails?.comparisonQuote &&
                typeof docDetails.comparisonQuote === 'string' &&
                docDetails.comparisonQuote.length > 20 && (
                  <View style={styles.comparisonCard}>
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
                    <View style={styles.docActions}>
                      <TouchableOpacity
                        style={styles.docButton}
                        activeOpacity={0.7}
                        onPress={() =>
                          openMimeDocument(
                            docDetails.comparisonQuote,
                            'ComparisonQuote_View',
                          )
                        }
                      >
                        <MaterialDesignIcons
                          name="eye-outline"
                          size={16}
                          color={COLOR.PRIMARY_COLOR}
                        />
                        <Text style={styles.docButtonText}>View</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.docButton}
                        activeOpacity={0.7}
                        onPress={() =>
                          downloadToLocal(
                            docDetails.comparisonQuote,
                            'ComparisonQuote',
                          )
                        }
                      >
                        <MaterialDesignIcons
                          name="download-outline"
                          size={16}
                          color={COLOR.PRIMARY_COLOR}
                        />
                        <Text style={styles.docButtonText}>Download</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

              <View style={{ height: 24 }} />
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Styles ──────────────────────────────────────────────────────
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
    height: SCREEN_HEIGHT * 0.78,
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
    fontFamily: FONTS.FONT_SEMIBOLD,
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

  // ── Info Card ──
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
    fontFamily: FONTS.FONT_REGULAR,
  },
  smallLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 2,
    fontFamily: FONTS.FONT_REGULAR,
  },
  valuePrimary: {
    fontSize: 15,
    color: '#111827',
    fontFamily: FONTS.FONT_SEMIBOLD,
  },
  value: { fontSize: 13, color: '#111827', fontFamily: FONTS.FONT_MEDIUM },
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
    fontFamily: FONTS.FONT_MEDIUM,
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
    fontSize: 12,
    fontFamily: FONTS.FONT_MEDIUM,
    color: '#0E7490',
  },
  chipSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  chipSecondaryText: {
    fontSize: 12,
    fontFamily: FONTS.FONT_MEDIUM,
    color: '#4B5563',
  },

  // ── Companies Section ──
  sectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.FONT_SEMIBOLD,
    color: '#111827',
    marginBottom: 10,
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
    backgroundColor: '#FAFBFF',
  },
  companyName: {
    fontSize: 13,
    fontFamily: FONTS.FONT_MEDIUM,
    color: '#111827',
    marginLeft: 8,
  },
  activeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  activeBadgeText: {
    fontSize: 10,
    color: COLOR.PRIMARY_COLOR,
    fontFamily: FONTS.FONT_SEMIBOLD,
  },
  companyValueRow: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  moneyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F766E',
    fontFamily: FONTS.FONT_SEMIBOLD,
  },

  // ── Document Actions ──
  docActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  docButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  docButtonText: {
    fontSize: 12,
    color: COLOR.PRIMARY_COLOR,
    fontFamily: FONTS.FONT_MEDIUM,
  },

  // ── Comparison Card ──
  comparisonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  comparisonTitle: {
    fontSize: 14,
    fontFamily: FONTS.FONT_MEDIUM,
    color: '#4B5563',
    marginLeft: 8,
  },
});

export default ViewQuotationDetailModal;
