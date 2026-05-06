import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RenewalsActions } from '../../../Redux/RenewalsRedux';
import * as RequestStatus from '../../../Entities/RequestStatus';
import { COLOR, FONTS } from '../../../utils/constants';
import DynamicDropdown from '../../components/DynamicDropdown';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RenewActionModal = ({ visible, onClose, item, onActionComplete }) => {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1); // 1 = choose action, 2 = lost/dropped form
  const [selectedOption, setSelectedOption] = useState(null); // 'Renew', 'Lost', 'Dropped'
  const [selectedReason, setSelectedReason] = useState(null);
  const [remarks, setRemarks] = useState('');

  const renewalReasonsState = useSelector(
    (state) => state.renewals?.renewalReasons ?? [],
  );

  const renewalReasonsStatus = useSelector(
    (state) => state.renewals?.renewalReasonsRequestStatus ?? RequestStatus.INITIAL,
  );
  const createRenewStatus = useSelector(
    (state) => state.renewals?.createRenewRequestStatus ?? RequestStatus.INITIAL,
  );
  const lostDroppedStatus = useSelector(
    (state) => state.renewals?.renewalLostDroppedRequestStatus ?? RequestStatus.INITIAL,
  );

  const isSubmitting =
    createRenewStatus === RequestStatus.INPROGRESS ||
    lostDroppedStatus === RequestStatus.INPROGRESS;

  // Fetch reasons when modal opens
  useEffect(() => {
    if (visible) {
      dispatch(RenewalsActions.getRenewalReasons());
    }
  }, [visible, dispatch]);

  // Watch for successful create/lostDropped
  useEffect(() => {
    if (
      createRenewStatus === RequestStatus.OK ||
      lostDroppedStatus === RequestStatus.OK
    ) {
      resetAndClose();
      onActionComplete?.();
    }
  }, [createRenewStatus, lostDroppedStatus]);

  const resetAndClose = () => {
    setStep(1);
    setSelectedOption(null);
    setSelectedReason(null);
    setRemarks('');
    onClose();
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);

    if (option === 'Renew') {
      const renewPayload = {
                    policyId: item.policyId || '',
                    prospectId: item.prospectId || '',
                    customer: item.customer || '',
                    insuranceCompany: item.insuranceCompanyId || 0,
                    product: item.productId || 0,
                    category: item.categoryId || 0,
                    policyNo: item.policyNumber || '',
                    issueDate: item.issueDate || '',
                    startDate: item.startDate || '',
                    endDate: item.timeByWhen || '',
                    expectedPremium: 0,
                    saidv: item.sumInsured || 0,
                    premium: item.premiumExpected || 0,
                    lostReason: '',
                    remarks: '',
                };
      // Immediate create
      console.log({renewPayload})
      dispatch(RenewalsActions.createRenew(renewPayload));
    } else {
      // Move to step 2 for Lost / Dropped
      setStep(2);
    }
  };

  const handleSubmitLostDropped = () => {
    if (!selectedReason) return;

    const payload = {
      prospectId: item?.prospectId,
      option: selectedOption,
      reason: selectedReason?.value || '',
      remarks: remarks,
    };

    console.log({payload})
    dispatch(RenewalsActions.createRenewalLostDropped(payload));
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Action</Text>
      <Text style={styles.stepSubtitle}>
        What would you like to do with this renewal?
      </Text>

      <View style={styles.optionsContainer}>
        {/* Renew */}
        <TouchableOpacity
          style={[styles.optionButton, styles.renewOption]}
          onPress={() => handleOptionSelect('Renew')}
          activeOpacity={0.7}
          disabled={isSubmitting}
        >
          <View style={[styles.optionIconCircle, { backgroundColor: '#F0FDF4' }]}>
            <MaterialDesignIcons name="autorenew" size={24} color="#22c55e" />
          </View>
          <Text style={[styles.optionLabel, { color: '#22c55e' }]}>Renew</Text>
          <Text style={styles.optionDesc}>Create renewal for this policy</Text>
        </TouchableOpacity>

        {/* Lost */}
        <TouchableOpacity
          style={[styles.optionButton, styles.lostOption]}
          onPress={() => handleOptionSelect('Lost')}
          activeOpacity={0.7}
          disabled={isSubmitting}
        >
          <View style={[styles.optionIconCircle, { backgroundColor: '#FEF2F2' }]}>
            <MaterialDesignIcons name="close-circle-outline" size={24} color="#E74C3C" />
          </View>
          <Text style={[styles.optionLabel, { color: '#E74C3C' }]}>Lost</Text>
          <Text style={styles.optionDesc}>Mark as lost with reason</Text>
        </TouchableOpacity>

        {/* Dropped */}
        <TouchableOpacity
          style={[styles.optionButton, styles.droppedOption]}
          onPress={() => handleOptionSelect('Dropped')}
          activeOpacity={0.7}
          disabled={isSubmitting}
        >
          <View style={[styles.optionIconCircle, { backgroundColor: '#FFF7ED' }]}>
            <MaterialDesignIcons name="archive-arrow-down-outline" size={24} color="#F39C12" />
          </View>
          <Text style={[styles.optionLabel, { color: '#F39C12' }]}>Dropped</Text>
          <Text style={styles.optionDesc}>Drop this renewal</Text>
        </TouchableOpacity>
      </View>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLOR.PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <ScrollView
      style={styles.stepContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setStep(1);
          setSelectedOption(null);
          setSelectedReason(null);
          setRemarks('');
        }}
        activeOpacity={0.7}
      >
        <MaterialDesignIcons name="arrow-left" size={20} color="#374151" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.formHeader}>
        <View
          style={[
            styles.formHeaderBadge,
            {
              backgroundColor:
                selectedOption === 'Lost' ? '#FEF2F2' : '#FFF7ED',
            },
          ]}
        >
          <MaterialDesignIcons
            name={
              selectedOption === 'Lost'
                ? 'close-circle-outline'
                : 'archive-arrow-down-outline'
            }
            size={20}
            color={selectedOption === 'Lost' ? '#E74C3C' : '#F39C12'}
          />
          <Text
            style={[
              styles.formHeaderText,
              {
                color: selectedOption === 'Lost' ? '#E74C3C' : '#F39C12',
              },
            ]}
          >
            {selectedOption} — {item?.policyId}
          </Text>
        </View>
      </View>

      {/* Reason Dropdown */}
      <Text style={styles.fieldLabel}>Reason *</Text>
      <DynamicDropdown
        placeholder="Select a reason"
        dropdownData={renewalReasonsState}
        labelField="value"
        valueField="id"
        selectedOption={selectedReason?.id}
        onSelect={(option) => setSelectedReason(option)}
        field=""
        showLabel={false}
        propContainerStyle={styles.dropdownContainer}
        propPlaceholderStyle={{ color: '#9CA3AF', fontFamily: FONTS.FONT_REGULAR, fontSize: 13 }}
        propSelectedTextStyle={{ color: '#1A1A1A', fontFamily: FONTS.FONT_REGULAR, fontSize: 13 }}
        propOptionTextStyle={{ color: '#1A1A1A', fontFamily: FONTS.FONT_REGULAR, fontSize: 13 }}
      />

      {/* Remarks */}
      <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Remarks</Text>
      <TextInput
        style={styles.remarksInput}
        placeholder="Enter remarks..."
        placeholderTextColor={COLOR.PLACEHOLDER_COLOR}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!selectedReason || isSubmitting) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmitLostDropped}
        activeOpacity={0.7}
        disabled={!selectedReason || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <MaterialDesignIcons name="check-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Submit</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={resetAndClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Handle bar */}
          <View style={styles.handleBarContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Renewal Action</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={resetAndClose}
              activeOpacity={0.7}
            >
              <MaterialDesignIcons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          {step === 1 ? renderStep1() : renderStep2()}
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
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: 30,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontFamily: FONTS.FONT_BOLD,
    fontSize: 18,
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
  stepContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepTitle: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontFamily: FONTS.FONT_REGULAR,
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  renewOption: {},
  lostOption: {},
  droppedOption: {},
  optionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionLabel: {
    fontFamily: FONTS.FONT_BOLD,
    fontSize: 14,
    marginBottom: 4,
  },
  optionDesc: {
    fontFamily: FONTS.FONT_REGULAR,
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  loadingOverlay: {
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  loadingText: {
    fontFamily: FONTS.FONT_MEDIUM,
    fontSize: 13,
    color: '#6B7280',
  },
  // Step 2 styles
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: FONTS.FONT_MEDIUM,
    fontSize: 14,
    color: '#374151',
  },
  formHeader: {
    marginBottom: 20,
  },
  formHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  formHeaderText: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 14,
  },
  fieldLabel: {
    fontFamily: FONTS.FONT_MEDIUM,
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
  },
  dropdownContainer: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    height: 48,
  },
  remarksInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FONTS.FONT_REGULAR,
    fontSize: 13,
    color: '#1A1A1A',
    backgroundColor: '#F9FAFB',
    minHeight: 100,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLOR.PRIMARY_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: FONTS.FONT_SEMIBOLD,
    fontSize: 15,
    color: '#FFFFFF',
  },
});

export default RenewActionModal;
