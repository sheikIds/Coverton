import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  ToastAndroid,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useDispatch, useSelector } from 'react-redux';
import RNDateTimePicker from '@react-native-community/datetimepicker'

import DynamicDropdown from '../../components/DynamicDropdown';
import MemberCard from '../../components/MemberCard';
import {
  COLOR,
  PRODUCT_IDS,
  RELATIONSHIPS,
  CONDITIONAL_FORM_SECTIONS,
  ADULT_RELATIONSHIPS,
  CHILD_RELATIONSHIPS,
  ADULT_COUNT_OPTIONS,
  CHILDREN_COUNT_OPTIONS,
} from '../../../utils/constants';
import { BusinessOpportunitiesActions } from '../../../Redux/BusinessOpportunitiesRedux';
import { CustomerActions } from '../../../Redux/CustomerRedux';

import * as RequestStatus from '../../../Entities/RequestStatus';
import { getCategoriesByProduct, formatDate, getTomorrowDate } from '../../../utils/utils';
import { buildLeadPayload } from '../../../utils/buildLeadPayload';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const INITIAL_LEAD_DATA = {
  consultant: '',
  consultantId: 0,
  customer: '',
  customerType: '',
  product: '',
  category: '',
  timeByWhen: '',
  premiumExpected: 0,
  saidv: 0,
  phoneno: '',
  expectedExpenditure: 0,
  directExpenditure: 0,
  vehicleNumber: '',
  preferredInsuranceCompanies: [],
};

const AddBusinessModal = props => {
  const {
    modalVisible,
    closeModal,
    isEditMode,
    formData,
    slideAnim,
    prospectId,
  } = props;

  const dispatch = useDispatch();

  const [leadData, setLeadData] = useState(INITIAL_LEAD_DATA);
  const [customerType] = useState([
    { label: 'Corporate', value: 'Corporate' },
    { label: 'Retail', value: 'Retail' },
  ]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(true);

  // Health‑Individual conditional section state
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);
  const [age, setAge] = useState('');

  // Health‑Floater conditional section state
  const [adultCount, setAdultCount] = useState(null);
  const [childCount, setChildCount] = useState(null);
  const [adultMembers, setAdultMembers] = useState([]);
  const [childMembers, setChildMembers] = useState([]);
  const [memberAgeErrors, setMemberAgeErrors] = useState({ adult: {}, child: {} });

  const productsState = useSelector(
    state => state.businessOpportunities?.products ?? [],
  );
  const productsCategories = useSelector(
    state => state.businessOpportunities?.categories ?? [],
  );
  const insuranceCompanies = useSelector(
    state => state.businessOpportunities?.insuranceCompanies ?? [],
  );
  const createLeadsRequestStatus = useSelector(
    state => state.businessOpportunities?.createLeadRequestStatus,
  );
  const updateLeadRequestStatus = useSelector(
    state => state.businessOpportunities?.updateLeadRequestStatus,
  );
  const customers = useSelector(
    state => state?.customer?.customersName ?? [],
  );
  const user = useSelector(state => state.auth?.user ?? null);
  const customerById = useSelector(state => state?.customer?.customerById ?? null);
  const customerByIdRequestStatus = useSelector(
    state => state?.customer?.getCustomerByIdRequestStatus,
  );

  // Fetch customer data by prospectId when opening in edit mode
  useEffect(() => {
    if (modalVisible && isEditMode && prospectId) {
      dispatch(CustomerActions.getCustomerById(prospectId));
    }
  }, [modalVisible, isEditMode, prospectId, dispatch]);

  useEffect(() => {
    if (modalVisible && leadData.category) {
      dispatch(BusinessOpportunitiesActions.getInsuranceCompanies(leadData.category));
    }
  }, [modalVisible, dispatch, leadData.category]);

  // For NEW leads: auto-pick top 3 preferred insurers by rank
  // For EDIT leads: resolve preferred IDs from API response
  useEffect(() => {
    const rawCompanies = insuranceCompanies?.responseData || insuranceCompanies;
    if (!rawCompanies) return;

    const companies = JSON.parse(JSON.stringify(rawCompanies));

    if (isEditMode && customerByIdRequestStatus === RequestStatus.OK && customerById) {
      // Edit mode: resolve preferred IDs from getCustomerById response
      const customerData = JSON.parse(JSON.stringify(customerById));
      const companiesArr = Array.isArray(companies) ? companies : [];
      const resolvedPreferred = (customerData.preferred || []).map(p => {
        const match = companiesArr.find(c => c.companyId === p.id);
        return { id: p.id, value: match?.companyName || `Company #${p.id}` };
      });
      setLeadData(prev => ({
        ...prev,
        preferredInsuranceCompanies: resolvedPreferred,
      }));
    } else if (!isEditMode) {
      // New lead mode: pick top 3 by rank
      if (Array.isArray(companies) && companies.length > 0) {
        const insurers = [...rawCompanies];
        const sortedByRank = insurers.sort((a, b) => a.rank - b.rank);
        const topThree = sortedByRank.slice(0, 3);

        const preferredCompanies = topThree.map((company) => ({
          id: company.companyId,
          value: company.companyName,
        }));

        setLeadData(prev => ({
          ...prev,
          preferredInsuranceCompanies: preferredCompanies,
        }));
      } else if (Array.isArray(companies) && companies.length === 0) {
        setLeadData(prev => ({
          ...prev,
          preferredInsuranceCompanies: [],
        }));
      }
    }
  }, [insuranceCompanies, isEditMode, customerByIdRequestStatus, customerById]);
  console.log({ user, id: user?.userId })
  useEffect(() => {
    if (modalVisible && user?.userName && (!leadData.consultant || leadData.consultantId === 0)) {
      setLeadData(prev => ({
        ...prev,
        consultant: user.userName,
        consultantId: user.userId,
      }));
    }
  }, [modalVisible, user?.userName, leadData.consultant, leadData.consultantId]);

  // When modal opens: reset state for new mode, or wait for API in edit mode
  useEffect(() => {
    if (modalVisible) {
      setShowCreateCustomer(!isEditMode);

      if (!isEditMode) {
        // New lead: reset to defaults
        setLeadData({
          ...INITIAL_LEAD_DATA,
          consultant: user?.userName || '',
          consultantId: user?.userId || 0,
        });
      }
      // Edit mode: data comes from getCustomerById response (handled below)
    }
  }, [modalVisible, isEditMode, user?.userName, user?.userId]);

  // Prepopulate form when getCustomerById response arrives (edit mode)
  useEffect(() => {
    if (
      modalVisible &&
      isEditMode &&
      customerByIdRequestStatus === RequestStatus.OK &&
      customerById
    ) {
      const data = JSON.parse(JSON.stringify(customerById));
      const vehicleNumber =
        data.boiigt?.additionals?.find(a => a.name === 'Vehicle Number')?.value || '';

      setLeadData(prev => ({
        ...prev,
        consultant: data.consultant || prev.consultant,
        consultantId: prev.consultantId,
        customer: data.customerId || '',
        customerType: data.customerType || '',
        product: data.productId || 0,
        category: data.categoryId || 0,
        timeByWhen: data.timeByWhen || '',
        premiumExpected: data.premiumExpected || 0,
        saidv: data.saidv || 0,
        phoneno: data.phoneno || '',
        expectedExpenditure: data.expectedExpenditure || 0,
        directExpenditure: data.directExpenditure || 0,
        vehicleNumber,
      }));

      setShowCreateCustomer(false);
    }
  }, [modalVisible, isEditMode, customerByIdRequestStatus, customerById]);

  useEffect(() => {
    if (createLeadsRequestStatus === RequestStatus.OK) {
      setLeadData(INITIAL_LEAD_DATA);
      closeModal();
      dispatch(
        BusinessOpportunitiesActions.getLeads({ pageNumber: 1, pageSize: 10, userId: user?.userId }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createLeadsRequestStatus, dispatch]);

  useEffect(() => {
    if (updateLeadRequestStatus === RequestStatus.OK) {
      setLeadData(INITIAL_LEAD_DATA);
      closeModal();
      dispatch(
        BusinessOpportunitiesActions.getLeads({ pageNumber: 1, pageSize: 10, userId: user?.userId }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateLeadRequestStatus, dispatch]);

  useEffect(() => {
    dispatch(BusinessOpportunitiesActions.getProducts());
    dispatch(BusinessOpportunitiesActions.getCategories());
  }, [dispatch]);

  useEffect(() => {
    console.log({ user })
    if (modalVisible && user?.userId) {
      dispatch(CustomerActions.getCustomersName(user?.userId));
    }
  }, [modalVisible, dispatch, user?.userId]);

  useEffect(() => {
    if (productsState && productsState.length > 0) {
      // Convert immutable data to plain JavaScript array
      const productsArray = Array.isArray(productsState)
        ? productsState
        : JSON.parse(JSON.stringify(productsState));

      const data = productsArray.map(product => {
        return { ...product, label: product.value };
      });
      setProducts(data);
    }
  }, [productsState]);

  useEffect(() => {
    if (productsCategories && productsCategories.length > 0) {
      // Convert immutable data to plain JavaScript array
      const categoriesArray = Array.isArray(productsCategories)
        ? productsCategories
        : JSON.parse(JSON.stringify(productsCategories));

      const data = categoriesArray.map(category => {
        return { ...category, label: category.value };
      });
      setCategories(data);
    }
  }, [productsCategories]);

  // Sync adult dropdown count when members are deleted
  useEffect(() => {
    if (adultMembers.length === 0) {
      setAdultCount(null);
    } else if (adultMembers.length !== adultCount) {
      setAdultCount(adultMembers.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adultMembers]);

  // Sync child dropdown count when members are deleted
  useEffect(() => {
    if (childMembers.length === 0) {
      setChildCount(null);
    } else if (childMembers.length !== childCount) {
      setChildCount(childMembers.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childMembers]);

  const getMaxDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 180);
    return date;
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (event.type === 'set' && date) {
      const utcDate = new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0,
          0,
          0,
          0,
        ),
      );

      setLeadData(prevData => ({
        ...prevData,
        timeByWhen: utcDate.toISOString(),
      }));
    }
  };

  const handleModalClose = () => {
    setLeadData(INITIAL_LEAD_DATA);
    setShowDatePicker(false);
    setRelationship(RELATIONSHIPS[0]);
    setAge('');
    setAdultCount(null);
    setChildCount(null);
    setAdultMembers([]);
    setChildMembers([]);
    setMemberAgeErrors({ adult: {}, child: {} });
    closeModal();
  };

  const getRelationshipLabel = rel =>
    (rel?.label ?? rel?.label_Display ?? rel?.value ?? '').toString().trim();

  const validateMemberAge = (selectedRelationship, ageString) => {
    const label = getRelationshipLabel(selectedRelationship).toLowerCase();
    const isChildRelation = label === 'son' || label === 'daughter';

    if (!ageString) return 'Age is required';

    const n = Number(ageString);
    if (!Number.isFinite(n)) return 'Age is required';

    if (isChildRelation) {
      if (n < 1 || n > 25) return 'Child age must be 1–25';
      return '';
    }

    if (n <= 25) return 'Adult age must be greater than 25';
    return '';
  };

  const setMemberError = (type, memberId, message) => {
    setMemberAgeErrors(prev => ({
      ...prev,
      [type]: {
        ...(prev?.[type] ?? {}),
        [memberId]: message,
      },
    }));
  };

  const clearMemberError = (type, memberId) => {
    setMemberAgeErrors(prev => {
      const next = { ...(prev ?? {}) };
      const bucket = { ...(next?.[type] ?? {}) };
      delete bucket[memberId];
      next[type] = bucket;
      return next;
    });
  };

  const handleSaveWrapper = async () => {
    try {
      const nextErrors = { adult: {}, child: {} };
      let hasMemberErrors = false;

      adultMembers.forEach(m => {
        const msg = validateMemberAge(m.relationship, m.age);
        if (msg) {
          nextErrors.adult[m.id] = msg;
          hasMemberErrors = true;
        }
      });

      childMembers.forEach(m => {
        const msg = validateMemberAge(m.relationship, m.age);
        if (msg) {
          nextErrors.child[m.id] = msg;
          hasMemberErrors = true;
        }
      });

      if (hasMemberErrors) {
        setMemberAgeErrors(nextErrors);
        if (Platform.OS === 'android') {
          ToastAndroid.show('Please fix validation errors', ToastAndroid.SHORT);
        } else {
          Alert.alert('Validation', 'Please fix validation errors');
        }
        return;
      }

      const payload = buildLeadPayload({
        leadData,
        adultMembers,
        childMembers,
        adultCount,
        childCount,
        relationship,
        age,
      });

      console.log({ payload, leadData })

      if (isEditMode) {
        dispatch(BusinessOpportunitiesActions.updateLead(payload, prospectId));
      } else {
        dispatch(BusinessOpportunitiesActions.createLead(payload));
      }
    } catch (error) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to save lead!', ToastAndroid.SHORT);
      } else {
        Alert.alert('Error', 'Failed to save lead!');
      }
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={modalVisible}
      onDismiss={handleModalClose}
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
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
              <MaterialDesignIcons
                name={isEditMode ? 'pencil-box' : 'plus-box'}
                size={24}
                color={COLOR.PRIMARY_COLOR}
              />
              <Text style={styles.modalTitle}>
                {isEditMode ? 'Edit Lead' : 'Add Lead'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleModalClose}
              style={styles.closeButton}
            >
              <MaterialDesignIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {createLeadsRequestStatus === RequestStatus.INPROGRESS ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLOR.PRIMARY_COLOR} />
            </View>
          ) : (
            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.formGroup}>
                <View style={styles.rowSpaceBetween}>
                  <Text style={styles.formLabel}>Customer Name</Text>
                  {!isEditMode ? (
                    <TouchableOpacity
                      onPress={() => {
                        setLeadData({
                          ...leadData,
                          customer: '',
                          phoneno: '',
                        });
                        setShowCreateCustomer(!showCreateCustomer)
                      }}
                      style={[
                        styles.rowCenter,
                        {
                          marginBottom: 10,
                          backgroundColor: COLOR.SECONDARY_COLOR + 20,
                          borderRadius: 12,
                          paddingHorizontal: 10,
                        },
                      ]}
                    >
                      <MaterialDesignIcons
                        name="plus"
                        size={20}
                        color={COLOR.SECONDARY_COLOR}
                      />
                      <Text
                        style={[
                          styles.formLabel,
                          {
                            marginTop: 8,
                            marginLeft: 5,
                            color: COLOR.SECONDARY_COLOR,
                          },
                        ]}
                      >
                        {showCreateCustomer
                          ? 'New Customer'
                          : 'Add Existing Customer'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {showCreateCustomer ? (
                  <DynamicDropdown
                    placeholder={' Select a Customer'}
                    dropdownData={customers}
                    labelField={'name'}
                    valueField={'id'}
                    selectedOption={leadData.product}
                    onSelect={(item, field) => {
                      setLeadData(prev => ({
                        ...prev,
                        customer: item.id,
                        phoneno: item?.phoneNo,
                      }));
                    }}
                    field={''}
                    showLabel={false}
                    propContainerStyle={styles.inputContainer}
                    propPlaceholderStyle={{ color: '#9CA3AF' }}
                    isSearch
                  />
                ) : (
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={leadData.customer}
                      onChangeText={text =>
                        setLeadData({ ...leadData, customer: text })
                      }
                      placeholder="Enter name"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    editable={!showCreateCustomer}
                    style={styles.textInput}
                    value={leadData.phoneno}
                    onChangeText={text =>
                      setLeadData({ ...leadData, phoneno: `${text}` })
                    }
                    placeholder="Enter phone number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={[styles.formGroup, { zIndex: 4000 }]}>
                <Text style={styles.formLabel}>Type</Text>
                <DynamicDropdown
                  placeholder={' Select a Type'}
                  dropdownData={customerType}
                  labelField={'label'}
                  valueField={'value'}
                  selectedOption={leadData.customerType}
                  onSelect={(item, field) => {
                    setLeadData(prev => ({ ...prev, customerType: item.value }));
                  }}
                  field={''}
                  showLabel={false}
                  propContainerStyle={styles.inputContainer}
                  propPlaceholderStyle={{ color: '#9CA3AF' }}
                />
              </View>

              <View style={[styles.formGroup, { zIndex: 3000 }]}>
                <Text style={styles.formLabel}>Product</Text>
                <DynamicDropdown
                  placeholder={' Select a Product'}
                  dropdownData={products}
                  labelField={'label'}
                  valueField={'value'}
                  selectedOption={products?.find(product => product?.id === leadData.product)?.value}
                  onSelect={(item, field) => {
                    setLeadData(prev => ({
                      ...prev,
                      product: item.id,
                      vehicleNumber: item.id === 2 ? prev.vehicleNumber : ''
                    }));
                  }}
                  field={''}
                  showLabel={false}
                  propContainerStyle={styles.inputContainer}
                  propPlaceholderStyle={{ color: '#9CA3AF' }}
                />
              </View>

              <View style={[styles.formGroup, { zIndex: 2000 }]}>
                <Text style={styles.formLabel}>Category</Text>
                <DynamicDropdown
                  placeholder={' Select a Category'}
                  dropdownData={getCategoriesByProduct(categories, leadData)}
                  labelField={'label'}
                  valueField={'value'}
                  selectedOption={categories?.find(catogory => catogory?.id === leadData?.category)?.value}
                  onSelect={(item, field) => {
                    setLeadData(prev => ({
                      ...prev,
                      category: item.id,
                      preferredInsuranceCompanies: []
                    }));
                  }}
                  field={''}
                  showLabel={false}
                  propContainerStyle={styles.inputContainer}
                  propPlaceholderStyle={{ color: '#9CA3AF' }}
                />
              </View>

              <View style={[styles.formGroup, { zIndex: 1000 }]}>
                <Text style={styles.formLabel}>Preferred Insurance Companies</Text>

                <View style={styles.chipContainer}>
                  {leadData.preferredInsuranceCompanies?.length > 0 ? (
                    leadData.preferredInsuranceCompanies.map((company) => (
                      <View key={company.id} style={styles.chip}>
                        <Text style={styles.chipText}>{company.value}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyStateText}>
                      No preferred insurance companies
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>SA/IDV Amount</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={leadData.saidv ? String(leadData.saidv) : ''}
                    keyboardType="numeric"
                    onChangeText={text =>
                      setLeadData(prev => ({ ...prev, saidv: Number(text) || 0 }))
                    }
                    placeholder="Eg: 5,00,000"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Expected Premium Amount</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={
                      leadData.premiumExpected
                        ? String(leadData.premiumExpected)
                        : ''
                    }
                    keyboardType="numeric"
                    onChangeText={(text) => {
                      const premium = Number(text);
                      setLeadData(prev => ({
                        ...prev,
                        premiumExpected: isNaN(premium) ? 0 : premium,
                        expectedExpenditure: isNaN(premium) ? 0 : premium / 10,
                      }));
                    }}
                    placeholder="Enter expected premium amount"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Expected Expenditure</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    editable={false}
                    value={
                      leadData.expectedExpenditure
                        ? String(leadData.expectedExpenditure)
                        : ''
                    }
                    keyboardType="numeric"
                    placeholder="Enter expected premium amount"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Direct Expenditure</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={
                      leadData.directExpenditure
                        ? String(leadData.directExpenditure)
                        : ''
                    }
                    keyboardType="numeric"
                    onChangeText={text =>
                      setLeadData(prev => ({
                        ...prev,
                        directExpenditure: Number(text) || 0,
                      }))
                    }
                    placeholder="Enter expected premium amount"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Expected Close Date</Text>
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.datePickerContent}>
                    <Text
                      style={[
                        styles.textInput,
                        !leadData.timeByWhen && { color: '#9CA3AF' },
                      ]}
                    >
                      {leadData.timeByWhen
                        ? formatDate(new Date(leadData.timeByWhen))
                        : 'Select expected close date'}
                    </Text>
                    <MaterialDesignIcons
                      name="calendar-month"
                      size={20}
                      color="#6B7280"
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {leadData.product === PRODUCT_IDS.MOTOR && (
                <View style={styles.motorSection}>
                  <Text style={styles.sectionTitle}>Motor Information</Text>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Vehicle Number *</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.textInput}
                        value={leadData.vehicleNumber}
                        onChangeText={text =>
                          setLeadData(prev => ({ ...prev, vehicleNumber: text }))
                        }
                        placeholder="Enter vehicle number"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* ── Dynamic conditional sections (config-driven) ── */}
              {(() => {
                const currentProduct = products?.find(p => p.id === leadData.product);
                const currentCategory = categories?.find(c => c.id === leadData.category);

                const isHealth = currentProduct?.value?.toLowerCase() === 'health';
                const isIndividual = currentCategory?.value?.toLowerCase() === 'individual';

                // Find section for Individual Health or any other config-driven sections
                const activeSection = CONDITIONAL_FORM_SECTIONS.find(
                  section =>
                    (section.productId === leadData.product || (isHealth && section.sectionTitle.includes('Health'))) &&
                    (section.categoryId === leadData.category || (isIndividual && section.sectionTitle.includes('Individual'))),
                );

                if (!activeSection) return null;

                return (
                  <View style={styles.healthIndividualSection}>
                    <Text style={styles.sectionTitle}>
                      {activeSection.sectionTitle}
                    </Text>

                    {activeSection.fields.map(field => {
                      if (field.type === 'dropdown') {
                        // Non-editable display — default value is fixed (Self)
                        return (
                          <View key={field.name} style={styles.formGroup}>
                            <Text style={styles.formLabel}>{field.label}</Text>
                            <View
                              style={[
                                styles.inputContainer,
                                styles.disabledInput,
                              ]}
                            >
                              <TextInput
                                style={[
                                  styles.textInput,
                                  { color: '#6B7280' },
                                ]}
                                value={relationship.label}
                                editable={false}
                                pointerEvents="none"
                              />
                            </View>
                          </View>
                        );
                      }

                      if (field.type === 'input') {
                        return (
                          <View key={field.name} style={styles.formGroup}>
                            <Text style={styles.formLabel}>{field.label}</Text>
                            <View style={styles.inputContainer}>
                              <TextInput
                                style={styles.textInput}
                                value={age}
                                onChangeText={text =>
                                  setAge(text.replace(/[^0-9]/g, ''))
                                }
                                placeholder={field.placeholder}
                                placeholderTextColor="#9CA3AF"
                                keyboardType={field.keyboardType}
                              />
                            </View>
                          </View>
                        );
                      }

                      return null;
                    })}
                  </View>
                );
              })()}

              {/* ── Health Floater section ── */}
              {(() => {
                const currentProduct = products?.find(p => p.id === leadData.product);
                const currentCategory = categories?.find(c => c.id === leadData.category);

                const isHealth = currentProduct?.value?.toLowerCase() === 'health';
                const isFloater = currentCategory?.value?.toLowerCase() === 'floater';

                if (!(isHealth && isFloater)) return null;

                return (
                  <View style={styles.floaterSection}>
                    <Text style={styles.sectionTitle}>
                      Health Floater Information
                    </Text>

                    {/* Number of Adults */}
                    <View style={[styles.formGroup, { zIndex: 200 }]}>
                      <Text style={styles.formLabel}>Number of Adults</Text>
                      <DynamicDropdown
                        placeholder="Select adults"
                        dropdownData={ADULT_COUNT_OPTIONS}
                        labelField="label"
                        valueField="value"
                        selectedOption={adultCount != null ? String(adultCount) : null}
                        onSelect={item => {
                          const count = item.id;
                          setAdultCount(count);
                          setAdultMembers(
                            Array.from({ length: count }, (_, i) => ({
                              id: i + 1,
                              relationship: null,
                              age: '',
                            })),
                          );
                        }}
                        field=""
                        showLabel={false}
                        propContainerStyle={styles.inputContainer}
                        propPlaceholderStyle={{ color: '#9CA3AF' }}
                      />
                    </View>

                    {/* Number of Children */}
                    <View style={[styles.formGroup, { zIndex: 100 }]}>
                      <Text style={styles.formLabel}>Number of Children</Text>
                      <DynamicDropdown
                        placeholder="Select children"
                        dropdownData={CHILDREN_COUNT_OPTIONS}
                        labelField="label"
                        valueField="value"
                        selectedOption={childCount != null ? String(childCount) : null}
                        onSelect={item => {
                          const count = item.id;
                          setChildCount(count);
                          setChildMembers(
                            Array.from({ length: count }, (_, i) => ({
                              id: i + 1,
                              relationship: null,
                              age: '',
                            })),
                          );
                        }}
                        field=""
                        showLabel={false}
                        propContainerStyle={styles.inputContainer}
                        propPlaceholderStyle={{ color: '#9CA3AF' }}
                      />
                    </View>

                    {/* Adult member cards */}
                    {adultMembers.map((member, index) => (
                      <MemberCard
                        key={`adult-${member.id}`}
                        type="adult"
                        index={index + 1}
                        member={member}
                        relationships={ADULT_RELATIONSHIPS}
                        error={memberAgeErrors?.adult?.[member.id] ?? ''}
                        onRelationshipChange={(memberId, selectedItem) => {
                          setAdultMembers(prev => {
                            const next = prev.map(m =>
                              m.id === memberId ? { ...m, relationship: selectedItem } : m,
                            );
                            const updated = next.find(m => m.id === memberId);
                            const msg = validateMemberAge(updated?.relationship, updated?.age);
                            if (msg) setMemberError('adult', memberId, msg);
                            else clearMemberError('adult', memberId);
                            return next;
                          });
                        }}
                        onAgeChange={(memberId, value) => {
                          setAdultMembers(prev => {
                            const next = prev.map(m =>
                              m.id === memberId ? { ...m, age: value } : m,
                            );
                            const updated = next.find(m => m.id === memberId);
                            const msg = validateMemberAge(updated?.relationship, updated?.age);
                            if (msg) setMemberError('adult', memberId, msg);
                            else clearMemberError('adult', memberId);
                            return next;
                          });
                        }}
                        onDelete={memberId => {
                          setAdultMembers(prev =>
                            prev
                              .filter(m => m.id !== memberId)
                              .map((m, i) => ({ ...m, id: i + 1 })),
                          );
                          clearMemberError('adult', memberId);
                        }}
                      />
                    ))}

                    {/* Child member cards */}
                    {childMembers.map((member, index) => (
                      <MemberCard
                        key={`child-${member.id}`}
                        type="child"
                        index={index + 1}
                        member={member}
                        relationships={CHILD_RELATIONSHIPS}
                        error={memberAgeErrors?.child?.[member.id] ?? ''}
                        onRelationshipChange={(memberId, selectedItem) => {
                          setChildMembers(prev => {
                            const next = prev.map(m =>
                              m.id === memberId ? { ...m, relationship: selectedItem } : m,
                            );
                            const updated = next.find(m => m.id === memberId);
                            const msg = validateMemberAge(updated?.relationship, updated?.age);
                            if (msg) setMemberError('child', memberId, msg);
                            else clearMemberError('child', memberId);
                            return next;
                          });
                        }}
                        onAgeChange={(memberId, value) => {
                          setChildMembers(prev => {
                            const next = prev.map(m =>
                              m.id === memberId ? { ...m, age: value } : m,
                            );
                            const updated = next.find(m => m.id === memberId);
                            const msg = validateMemberAge(updated?.relationship, updated?.age);
                            if (msg) setMemberError('child', memberId, msg);
                            else clearMemberError('child', memberId);
                            return next;
                          });
                        }}
                        onDelete={memberId => {
                          setChildMembers(prev =>
                            prev
                              .filter(m => m.id !== memberId)
                              .map((m, i) => ({ ...m, id: i + 1 })),
                          );
                          clearMemberError('child', memberId);
                        }}
                      />
                    ))}
                  </View>
                );
              })()}

              {showDatePicker && (
                <RNDateTimePicker
                  value={
                    leadData.timeByWhen
                      ? new Date(leadData.timeByWhen)
                      : getTomorrowDate()
                  }
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                  onChange={handleDateChange}
                  minimumDate={getTomorrowDate()}
                  maximumDate={getMaxDate()}
                  textColor="#1F2937"
                  positiveButton={{
                    label: 'OK',
                    textColor: COLOR.PRIMARY_COLOR,
                  }}
                  negativeButton={{
                    label: 'Cancel',
                    textColor: COLOR.PRIMARY_COLOR,
                  }}
                />
              )}
              {showDatePicker && Platform.OS === 'ios' && (
                <View style={styles.iosDatePickerActions}>
                  <TouchableOpacity
                    style={styles.iosDatePickerButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.iosDatePickerButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
          <View style={styles.modalFooter}>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleModalClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => { handleSaveWrapper() }}
                activeOpacity={0.8}
              >
                <MaterialDesignIcons
                  name={isEditMode ? 'check' : 'plus'}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.saveButtonText}>
                  {isEditMode ? 'Save Changes' : 'Add Lead'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal >
  );
};

const styles = StyleSheet.create({
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#1A1A1A',
    marginLeft: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#1F2937',
    padding: 0,
  },
  datePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iosDatePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 20,
  },
  iosDatePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: COLOR.PRIMARY_COLOR,
    borderRadius: 8,
  },
  iosDatePickerButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLOR.PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  motorSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 20,
  },
  healthIndividualSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: COLOR.PRIMARY_COLOR,
    marginBottom: 15,
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  floaterSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 20,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#FFFFFF',
  },
  selectedDropdownItem: {
    backgroundColor: '#F0F7FF',
  },
  dropdownItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  selectedDropdownItemText: {
    fontFamily: 'Poppins-Medium',
    color: COLOR.PRIMARY_COLOR,
  },
  selectedPlaceholderText: {
    color: '#1F2937',
  },
  defaultPlaceholderText: {
    color: '#9CA3AF',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 8,
    minHeight: 50,
    backgroundColor: '#F9FAFB',
  },
  chip: {
    backgroundColor: '#EEF3FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D1E0FF',
  },
  chipText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#374151',
  },
  emptyStateText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#9CA3AF',
    paddingLeft: 8,
    paddingTop: 4,
  },
});

export default AddBusinessModal;
