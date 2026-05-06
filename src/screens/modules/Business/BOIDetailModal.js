import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import React, { useEffect } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useDispatch, useSelector } from 'react-redux';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { BusinessOpportunitiesActions } from '../../../Redux/BusinessOpportunitiesRedux';
import * as RequestStatus from '../../../Entities/RequestStatus';
import { COLOR, FONTS } from '../../../utils/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Document helpers (same as QuotationModal) ────────────────────
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

// ─── Sub-components ───────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────
const BOIDetailModal = ({ visible, onClose, prospectId }) => {
  const dispatch = useDispatch();

  const boiData = useSelector((state) => {
    const raw = state.businessOpportunities?.boiById;
    if (!raw) return null;
    if (typeof raw.toJS === 'function') {
      try { return raw.toJS(); } catch { return raw; }
    }
    if (typeof raw.asMutable === 'function') {
      try { return raw.asMutable({ deep: true }); } catch { return raw; }
    }
    return raw;
  });

  const requestStatus = useSelector(
    (state) => state.businessOpportunities?.getBOIByIdRequestStatus ?? RequestStatus.INITIAL,
  );

  const products = useSelector((state) => state.businessOpportunities?.products ?? []);
  const categories = useSelector((state) => state.businessOpportunities?.categories ?? []);
  const insuranceCompanies = useSelector(
    (state) => state.businessOpportunities?.insuranceCompanies ?? [],
  );

  const isLoading = requestStatus === RequestStatus.INPROGRESS;

  // Fetch on open
  useEffect(() => {
    if (visible && prospectId) {
      dispatch(BusinessOpportunitiesActions.getBOIById(prospectId));
    }
  }, [visible, prospectId, dispatch]);

  const handleClose = () => {
    dispatch(BusinessOpportunitiesActions.setBOIByIdRequestStatus(RequestStatus.INITIAL));
    onClose();
  };

  if (!visible) return null;

  // ─── Helpers ──────────────────────────────
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

  const lookupName = (list, id, labelField = 'name') => {
    if (!list || !id) return String(id ?? '—');
    const found = list.find(
      (item) => item?.id === id
    );
    return found?.[labelField] ?? found?.name ?? found?.value ?? String(id);
  };



  const hasDocument =
    boiData?.policyDocument &&
    typeof boiData.policyDocument === 'string' &&
    boiData.policyDocument.length > 20;

  const additionals = boiData?.boiIgt?.additionals ?? [];
  const members = boiData?.boiIgt?.members ?? [];
  console.log({categories, insuranceCompanies, categoryId: boiData?.categoryId})

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.policyBadge}>
                <Text style={styles.policyBadgeText}>
                  {prospectId ?? 'BOI Details'}
                </Text>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {boiData?.customerName ?? 'Loading...'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <MaterialDesignIcons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLOR.PRIMARY_COLOR} />
              <Text style={styles.loadingText}>Loading details...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {/* Consultant Info */}
              <SectionHeader icon="account-tie-outline" title="Consultant Info" />
              <View style={styles.sectionCard}>
                <DetailRow label="Consultant" value={boiData?.consultant} />
                {/* <DetailRow label="Consultant ID" value={String(boiData?.consultantId ?? '—')} /> */}
                <DetailRow label="Role" value={boiData?.type} />
              </View>

              {/* Customer Info */}
              <SectionHeader icon="account-outline" title="Customer Info" />
              <View style={styles.sectionCard}>
                <DetailRow label="Customer ID" value={boiData?.customerId} highlight />
                <DetailRow label="Customer Name" value={boiData?.customerName} />
                <DetailRow label="Customer Type" value={boiData?.customerType} />
                <DetailRow label="Phone" value={boiData?.phoneno} />
              </View>

              {/* Insurance Details */}
              <SectionHeader icon="shield-check-outline" title="Insurance Details" />
              <View style={styles.sectionCard}>
                {/* <DetailRow
                  label="Product"
                  value={lookupName(products, boiData?.productId)}
                />
                <DetailRow
                  label="Category"
                  value={lookupName(categories, boiData?.categoryId)}
                /> */}
                <DetailRow
                  label="Premium Expected"
                  value={formatCurrency(boiData?.premiumExpected)}
                  highlight
                />
                <DetailRow
                  label="SAIDV"
                  value={formatCurrency(boiData?.saidv)}
                />
                <DetailRow
                  label="Time By When"
                  value={formatDate(boiData?.timeByWhen)}
                />
              </View>
              {/* Expenditure */}
              <SectionHeader icon="currency-inr" title="Expenditure" />
              <View style={styles.sectionCard}>
                <DetailRow
                  label="Expected Expenditure"
                  value={formatCurrency(boiData?.expectedExpenditure)}
                />
                <DetailRow
                  label="Direct Expenditure"
                  value={formatCurrency(boiData?.directExpenditure)}
                />
              </View>
              {/* Preferred Companies */}
              <SectionHeader icon="star-outline" title="Preferred Companies" />
              <View style={styles.sectionCard}>
                {!boiData?.preferred || boiData.preferred.length === 0 ? (
                  <Text style={styles.preferredText}>—</Text>
                ) : (
                  boiData.preferred.map((p, idx) => (
                    <View key={`pref-${idx}`} style={styles.preferredRow}>
                      <MaterialDesignIcons name="check" size={12} color={COLOR.PRIMARY_COLOR} />
                      <Text style={styles.preferredText}>{p?.name ?? `ID: ${p?.id}`}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* IGT Details */}
              {boiData?.boiIgt && (
                <>
                  <SectionHeader icon="file-tree-outline" title="IGT Details" />
                  <View style={styles.sectionCard}>
                    <DetailRow
                      label="Product"
                      value={lookupName(products, boiData?.boiIgt?.productId)}
                    />
                    <DetailRow
                      label="Category"
                      value={lookupName(categories, boiData?.boiIgt?.categoryId)}
                    />
                  </View>

                  {/* Additionals */}
                  {additionals.length > 0 && (
                    <>
                      <View style={styles.subSectionHeader}>
                        <Text style={styles.subSectionTitle}>Additional Info</Text>
                      </View>
                      <View style={styles.sectionCard}>
                        {additionals.map((item, idx) => (
                          <DetailRow
                            key={`add-${idx}`}
                            label={item?.name ?? `Field ${idx + 1}`}
                            value={item?.value}
                          />
                        ))}
                      </View>
                    </>
                  )}

                  {/* Members */}
                  {members.length > 0 && (
                    <>
                      <View style={styles.subSectionHeader}>
                        <Text style={styles.subSectionTitle}>Members</Text>
                      </View>
                      <View style={styles.sectionCard}>
                        {members.map((member, idx) => (
                          <DetailRow
                            key={`mem-${idx}`}
                            label={member?.relationship ?? `Member ${idx + 1}`}
                            value={member?.age ? `Age: ${member.age}` : '—'}
                          />
                        ))}
                      </View>
                    </>
                  )}
                </>
              )}

              {/* Document */}
              {hasDocument && (
                <>
                  <SectionHeader icon="file-document-outline" title="Policy Document" />
                  <View style={styles.sectionCard}>
                    <View style={styles.docRow}>
                      <View style={styles.docInfo}>
                        <MaterialDesignIcons
                          name="file-pdf-box"
                          size={28}
                          color="#E74C3C"
                        />
                        <View style={styles.docTextContainer}>
                          <Text style={styles.docTitle}>Policy Document</Text>
                          <Text style={styles.docSubtitle}>Tap to view or download</Text>
                        </View>
                      </View>
                      <View style={styles.docActions}>
                        <TouchableOpacity
                          style={styles.docButton}
                          activeOpacity={0.7}
                          onPress={() =>
                            openMimeDocument(
                              boiData.policyDocument,
                              `BOI_${prospectId ?? 'doc'}`,
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
                              boiData.policyDocument,
                              `BOI_${prospectId ?? 'doc'}`,
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
                  </View>
                </>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────
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
  // ─── Loading ───────────────────────
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontFamily: FONTS.FONT_REGULAR,
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
  },
  // ─── Sections ──────────────────────
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
  subSectionHeader: {
    marginTop: 12,
    marginBottom: 6,
    paddingLeft: 4,
  },
  subSectionTitle: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  sectionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  // ─── Detail rows ───────────────────
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
  // ─── Preferred companies ───────────
  preferredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  preferredText: {
    fontFamily: FONTS.FONT_REGULAR,
    fontSize: 12,
    color: '#1A1A1A',
    flex: 1,
  },
  // ─── Document ──────────────────────
  docRow: {
    flexDirection: 'column',
    gap: 12,
  },
  docInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  docTextContainer: {
    flex: 1,
  },
  docTitle: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 13,
    color: '#1A1A1A',
  },
  docSubtitle: {
    fontFamily: FONTS.FONT_REGULAR,
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  docActions: {
    flexDirection: 'row',
    gap: 10,
  },
  docButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
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
});

export default BOIDetailModal;
