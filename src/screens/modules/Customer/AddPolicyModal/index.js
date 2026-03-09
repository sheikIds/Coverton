import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
  Text,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFetchBlob from 'react-native-blob-util';
import { pick, types } from '@react-native-documents/picker';
import { useDispatch, useSelector } from 'react-redux';
import Immutable from 'seamless-immutable';

import { COLOR, HEALTH_CATEGORY_CODE, GENERAL_HEALTH_CATEGORY_CODE } from '../../../../utils/constants';
import { CustomerActions } from '../../../../Redux/CustomerRedux';
import * as RequestStatus from '../../../../Entities/RequestStatus';
import { getTomorrowDate } from '../../../../utils/utils';
import {
  Header,
  Footer,
  FormFields,
  MemberDetails,
  DocumentViewer,
} from './components';
import { styles } from './styles';

const ADULT_RELATIONS = [
  { label: 'Self', value: 'Self' },
  { label: 'Spouse', value: 'Spouse' },
];

const PARENT_RELATIONS = [
  { label: 'Father', value: 'Father' },
  { label: 'Mother', value: 'Mother' },
  { label: 'Father-in-law', value: 'Father-in-law' },
  { label: 'Mother-in-law', value: 'Mother-in-law' },
];

const CHILD_RELATIONS = [
  { label: 'Son', value: 'Son' },
  { label: 'Daughter', value: 'Daughter' },
];

const AddPolicyModal = props => {
  const { modalVisible, closeModal, slideAnim, selectedLead, customerId } =
    props;

  const dispatch = useDispatch();

  console.log({ selectedLead });

  const [customerFields, setCustomerFields] = useState([]);
  const [documents, setDocuments] = useState({});
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [dob, setDob] = useState(null);
  const [expectedCloseDate, setExpectedCloseDate] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showCloseDatePicker, setShowCloseDatePicker] = useState(false);
  const [members, setMembers] = useState([]);
  const [memberDocuments, setMemberDocuments] = useState({});
  const [memberErrors, setMemberErrors] = useState({});
  const [policyType, setPolicyType] = useState('');
  const [isPedEnabled, setIsPedEnabled] = useState(false);

  const customerFieldsData = useSelector(
    state => state.customer?.customerFields ?? [],
  );

  console.log({ customerFieldsData });

  const createIGTRequestStatus = useSelector(
    state => state.customer?.createIGTRequestStatus ?? null,
  );

  const createHealthIGTRequestStatus = useSelector(
    state => state.customer?.createHealthIGTRequestStatus ?? null,
  );

  const getCustomerFieldsRequestStatus = useSelector(
    state => state.customer?.getCustomerFieldsRequestStatus ?? null,
  );

  const isLoading =
    createIGTRequestStatus === RequestStatus.INPROGRESS ||
    createHealthIGTRequestStatus === RequestStatus.INPROGRESS ||
    getCustomerFieldsRequestStatus === RequestStatus.INPROGRESS;

  const selectedCategoryId = selectedLead?.categoryId;

  const resetState = useCallback(() => {
    setCustomerFields([]);
    setDocuments({});
    setViewerVisible(false);
    setCurrentDocument(null);
    setDob(null);
    setExpectedCloseDate(null);
    setShowDobPicker(false);
    setShowCloseDatePicker(false);
    setMembers([]);
    setMemberDocuments({});
    setPolicyType('');
    setIsPedEnabled(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    resetState();
    closeModal();
  }, [resetState, closeModal]);

  useEffect(() => {
    if (modalVisible && selectedCategoryId) {
      // Call getCustomerFields API for all categories including Health
      dispatch(CustomerActions.getCustomerFields(selectedCategoryId));
      if (HEALTH_CATEGORY_CODE?.includes(selectedLead?.categoryId)) {
        setMembers([]);
      }
    }
  }, [dispatch, modalVisible, selectedCategoryId, selectedLead?.categoryId]);

  useEffect(() => {
    console.log({ customerFieldsData });
    if (
      customerFieldsData &&
      (customerFieldsData.length > 0 || customerFieldsData.basicInfo)
    ) {
      // Handle response with basicInfo (from Health API) or direct array
      const fieldsArray = customerFieldsData.basicInfo || customerFieldsData;
      const mutableData = Immutable.asMutable(fieldsArray, { deep: true });
      const withValue = mutableData.map(field => ({
        ...field,
        value: field.value ?? null,
      }));
      setCustomerFields(withValue);
    } else if (
      !customerFieldsData ||
      (Array.isArray(customerFieldsData) && customerFieldsData.length === 0)
    ) {
      setCustomerFields([]);
    }
  }, [customerFieldsData]);

  useEffect(() => {
    if (
      (createIGTRequestStatus === RequestStatus.OK ||
        createHealthIGTRequestStatus === RequestStatus.OK) &&
      modalVisible
    ) {
      dispatch(CustomerActions.getCustomerSecondLevel(customerId));
      handleCloseModal();
    }
  }, [createIGTRequestStatus, createHealthIGTRequestStatus, dispatch]);

  const handleDobChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDobPicker(false);
    }
    if (event.type === 'set' && date) {
      setDob(date);
    }
  };

  const handleCloseDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowCloseDatePicker(false);
    }
    if (event.type === 'set' && date) {
      setExpectedCloseDate(date);
    }
  };

  const saveContentUriToFile = async (uri, ext = 'pdf') => {
    try {
      if (!(Platform.OS === 'android' && uri && uri.startsWith('content://'))) {
        return uri;
      }

      const cacheDir = RNFetchBlob.fs.dirs.CacheDir;
      const filename = `picked_${Date.now()}.${ext}`;
      const destPath = `${cacheDir}/${filename}`;

      const base64Data = await RNFetchBlob.fs.readFile(uri, 'base64');
      await RNFetchBlob.fs.writeFile(destPath, base64Data, 'base64');

      return `file://${destPath}`;
    } catch {
      return uri;
    }
  };

  const viewDocument = async document => {
    if (!document) return;

    console.log('Viewing document:', {
      document,
      isPdf: document.type?.includes('pdf'),
    });

    if (document.type?.includes('pdf')) {
      const preparedUri = await saveContentUriToFile(document.uri, 'pdf');
      console.log('Prepared PDF URI:', preparedUri);
      setCurrentDocument({ ...document, uri: preparedUri });
    } else {
      setCurrentDocument(document);
    }

    setViewerVisible(true);
  };

  const closeViewer = async () => {
    try {
      if (currentDocument?.uri && currentDocument.uri.startsWith('file://')) {
        const path = currentDocument.uri.replace('file://', '');
        const exists = await RNFetchBlob.fs.exists(path);
        if (exists) {
          await RNFetchBlob.fs.unlink(path).catch(() => { });
        }
      }
    } catch {
    } finally {
      setViewerVisible(false);
      setCurrentDocument(null);
    }
  };

  const updateMembersList = (fields, currentPolicyType) => {
    console.log({ currentPolicyType });
    console.log({ fields });

    const adults = parseInt(
      fields.find(f => f.id === 'number_of_adults')?.value || 0,
    );
    const parents = parseInt(
      fields.find(f => f.id === 'number_of_parents')?.value || 0,
    );
    const children = parseInt(
      fields.find(f => f.id === 'number_of_child')?.value || 0,
    );

    console.log({ adults, parents, children });

    setMembers(prev => {
      // Build new members array in fixed order: Adults -> Parents -> Children
      const newMembers = [];

      // Add adults
      for (let i = 0; i < adults; i++) {
        const existing = prev.find(
          (m, idx) =>
            m.type === 'Adult' &&
            prev.filter(p => p.type === 'Adult').indexOf(m) === i,
        );
        newMembers.push(
          existing || {
            type: 'Adult',
            relationship: '',
            age: '',
            dob: '',
            height: '',
            weight: '',
            typeIndex: i,
            ped: '',
            pedDetails: '',
          },
        );
      }

      // Add parents
      for (let i = 0; i < parents; i++) {
        const existing = prev.find(
          (m, idx) =>
            m.type === 'Parent' &&
            prev.filter(p => p.type === 'Parent').indexOf(m) === i,
        );
        newMembers.push(
          existing || {
            type: 'Parent',
            relationship: '',
            age: '',
            dob: '',
            height: '',
            weight: '',
            typeIndex: i,
          },
        );
      }

      // Add children
      for (let i = 0; i < children; i++) {
        const existing = prev.find(
          (m, idx) =>
            m.type === 'Child' &&
            prev.filter(p => p.type === 'Child').indexOf(m) === i,
        );
        newMembers.push(
          existing || {
            type: 'Child',
            relationship: '',
            age: '',
            dob: '',
            height: '',
            weight: '',
            typeIndex: i,
          },
        );
      }

      return newMembers;
    });

    console.log(members);
  };

  const onValueChange = (value, item, error = '') => {
    console.log('here------------>', value, { item }, error);
    setCustomerFields(prev => {
      let updatedFields = prev?.map(field => {
        if (field?.id === item?.id) {
          // Clear error if value is provided and no new error passed
          const newError = error || '';
          return { ...field, value, error: newError };
        }
        return field;
      });

      console.log({
        updatedFields,
        customerFields,
        item: item.id,
        value: value,
      });

      // Handle PED switch changes
      if (item.id === 'ped') {
        const pedValue = value == 1 ? true : false;
        setIsPedEnabled(pedValue);
        // Update PED field value to 1 or 0
        updatedFields = updatedFields.map(field =>
          field?.id === 'ped' ? { ...field, value: value } : field,
        );
        // Clear PED details if PED is disabled
        if (!pedValue) {
          updatedFields = updatedFields.map(field =>
            field?.id === 'ped_details' ? { ...field, value: '' } : field,
          );
        }
      }

      if (HEALTH_CATEGORY_CODE?.includes(selectedLead?.categoryId)) {


        // Update members list based on current policy type
        if (
          [
            'policy_type',
            'number_of_adults',
            'number_of_parents',
            'number_of_child',
          ].includes(item.id)
        ) {
          let currentPolicyTypeStr = policyType;
          console.log({ currentPolicyTypeStr });
          if (item.id === 'policy_type') {
            currentPolicyTypeStr = item?.options?.find(
              data => data?.id === value,
            )?.value;
          } else {
            const policyField = updatedFields.find(f => f.id === 'policy_type');
            if (policyField && policyField.value) {
              currentPolicyTypeStr =
                policyField.options?.find(opt => opt.id === policyField.value)
                  ?.value || policyType;
            }
          }

          console.log({ updatedFields, currentPolicyTypeStr });

          updateMembersList(updatedFields, currentPolicyTypeStr);
        }
      }
      return updatedFields;
    });
  };

  const handleMemberUpdate = (index, field, value) => {
    setMembers(prev =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );

    // Clear the error for this field when user updates it
    setMemberErrors(prev => {
      if (prev[index] && prev[index][field]) {
        const updatedErrors = { ...prev };
        const fieldErrors = { ...updatedErrors[index] };
        delete fieldErrors[field];
        if (Object.keys(fieldErrors).length === 0) {
          delete updatedErrors[index];
        } else {
          updatedErrors[index] = fieldErrors;
        }
        return updatedErrors;
      }
      return prev;
    });
  };

  const handleDocumentPick = async (docType, fieldItem) => {
    try {
      const result = await pick({
        mode: 'open',
        type: [types.pdf, types.images],
        allowMultiSelection: false,
      });

      if (result && Array.isArray(result) && result.length > 0) {
        const file = result[0];
        const mimeType = file.type || file.mimeType || '';
        const isPdf = mimeType.includes('pdf');

        const document = {
          uri: file.uri,
          name: file.name,
          type: mimeType,
          size: file.size,
        };

        setDocuments(prev => ({
          ...prev,
          [docType]: document,
        }));

        const ext = isPdf ? 'pdf' : 'jpg';
        const fileUriForRead = await saveContentUriToFile(file.uri, ext);

        let base64Data = null;
        try {
          const path = fileUriForRead.replace('file://', '');
          base64Data = await RNFetchBlob.fs.readFile(path, 'base64');
        } catch (e) {
          base64Data = await RNFetchBlob.fs.readFile(file.uri, 'base64');
        }

        const finalMime =
          mimeType || (isPdf ? 'application/pdf' : 'image/jpeg');

        const dataUrl = `data:${finalMime};base64,${base64Data}`;

        setCustomerFields(prev =>
          prev.map(field =>
            field.id === fieldItem.id ? { ...field, value: dataUrl, error: '' } : field,
          ),
        );

        Alert.alert('Success', `${file.name} uploaded successfully`);
      }
    } catch (err) {
      if (
        err?.message?.includes('User canceled') ||
        err?.message?.includes('canceled')
      ) {
        return;
      }
      Alert.alert(
        'Error',
        'Failed to pick document: ' + (err?.message || 'Unknown error'),
      );
    }
  };

  const removeDocument = (docType, fieldItem) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: null,
    }));

    setCustomerFields(prev =>
      prev.map(field =>
        field.id === fieldItem.id ? { ...field, value: null } : field,
      ),
    );
  };

  const handleMemberAadhaarPick = async memberIndex => {
    try {
      const result = await pick({
        mode: 'open',
        type: [types.pdf, types.images],
        allowMultiSelection: false,
      });

      if (result && Array.isArray(result) && result.length > 0) {
        const file = result[0];
        const mimeType = file.type || file.mimeType || '';
        const isPdf = mimeType.includes('pdf');

        const document = {
          uri: file.uri,
          name: file.name,
          type: mimeType,
          size: file.size,
        };

        setMemberDocuments(prev => ({
          ...prev,
          [`member_${memberIndex}_aadhaar`]: document,
        }));

        const ext = isPdf ? 'pdf' : 'jpg';
        const fileUriForRead = await saveContentUriToFile(file.uri, ext);

        let base64Data = null;
        try {
          const path = fileUriForRead.replace('file://', '');
          base64Data = await RNFetchBlob.fs.readFile(path, 'base64');
        } catch (e) {
          base64Data = await RNFetchBlob.fs.readFile(file.uri, 'base64');
        }

        const finalMime =
          mimeType || (isPdf ? 'application/pdf' : 'image/jpeg');
        const dataUrl = `data:${finalMime};base64,${base64Data}`;

        setMembers(prev =>
          prev.map((m, i) =>
            i === memberIndex ? { ...m, aadhaarDocument: dataUrl } : m,
          ),
        );

        // Clear Aadhaar document error
        setMemberErrors(prev => {
          if (prev[memberIndex] && prev[memberIndex].aadhaarDocument) {
            const updatedErrors = { ...prev };
            const fieldErrors = { ...updatedErrors[memberIndex] };
            delete fieldErrors.aadhaarDocument;
            if (Object.keys(fieldErrors).length === 0) {
              delete updatedErrors[memberIndex];
            } else {
              updatedErrors[memberIndex] = fieldErrors;
            }
            return updatedErrors;
          }
          return prev;
        });

        Alert.alert(
          'Success',
          `Aadhaar document for ${members[memberIndex]?.type} ${(members[memberIndex]?.typeIndex || 0) + 1
          } uploaded successfully`,
        );
      }
    } catch (err) {
      if (
        err?.message?.includes('User canceled') ||
        err?.message?.includes('canceled')
      ) {
        return;
      }
      Alert.alert(
        'Error',
        'Failed to pick document: ' + (err?.message || 'Unknown error'),
      );
    }
  };

  const removeMemberAadhaar = memberIndex => {
    setMemberDocuments(prev => {
      const newDocs = { ...prev };
      delete newDocs[`member_${memberIndex}_aadhaar`];
      return newDocs;
    });

    setMembers(prev =>
      prev.map((m, i) =>
        i === memberIndex ? { ...m, aadhaarDocument: null } : m,
      ),
    );
  };

  const handleFormSave = () => {
    // Validate mandatory fields in basicInfo
    let hasBasicErrors = false;
    const validatedFields = customerFields.map(field => {
      if (
        field.isMandatory &&
        (field.value === null ||
          field.value === '' ||
          field.value === undefined)
      ) {
        hasBasicErrors = true;
        return {
          ...field,
          error: `${field.label || field.question} is required`,
        };
      }
      return { ...field, error: '' };
    });

    if (hasBasicErrors) {
      setCustomerFields(validatedFields);
      const errorMessages = validatedFields
        .filter(f => f.error)
        .map(f => f.label || f.question);
      Alert.alert(
        'Validation Error',
        `Please fill required fields: ${errorMessages.join(', ')}`,
      );
      return;
    }

    // Update local state with potentially cleared errors
    setCustomerFields(validatedFields);

    // Validate members if health category
    if (
      HEALTH_CATEGORY_CODE?.includes(selectedLead?.categoryId) &&
      members.length > 0
    ) {
      const newMemberErrors = {};
      let hasErrors = false;

      members.forEach((member, index) => {
        const errors = {};

        if (!member.relationship) {
          errors.relationship = 'Relationship is required';
          hasErrors = true;
        }
        if (!member.age || member.age.toString().trim() === '') {
          errors.age = 'Age is required';
          hasErrors = true;
        }
        if (!member.height || member.height.toString().trim() === '') {
          errors.height = 'Height is required';
          hasErrors = true;
        }
        if (!member.weight || member.weight.toString().trim() === '') {
          errors.weight = 'Weight is required';
          hasErrors = true;
        }
        if (!member.dob) {
          errors.dob = 'Date of birth is required';
          hasErrors = true;
        }
        // if (!member.ped || member.ped === '') {
        //   errors.ped = 'PED status is required';
        //   hasErrors = true;
        // }
        if (!member.aadhaarDocument) {
          errors.aadhaarDocument = 'Aadhaar document is required';
          hasErrors = true;
        }

        if (Object.keys(errors).length > 0) {
          newMemberErrors[index] = errors;
        }
      });

      setMemberErrors(newMemberErrors);

      if (hasErrors) {
        Alert.alert(
          'Validation Error',
          'Please fill all required member details',
        );
        return;
      }
    }

    // Clear member errors if validation passed
    setMemberErrors({});

    const basicPayload = validatedFields?.map(field => ({
      ...field,
      profileId: selectedLead?.profileId,
      categoryId: selectedLead?.categoryId,
      boiProspectID: selectedLead?.prospectId,
    }));

    let payload = basicPayload;

    console.log({ selectedLead });

    if (GENERAL_HEALTH_CATEGORY_CODE?.includes(selectedLead?.categoryId)) {
      // Build members with unique indices and Aadhaar documents
      const membersPayload = members.map((member, globalIndex) => {
        const membersOfSameType = members.filter(m => m.type === member.type);
        const typeIndex = membersOfSameType.indexOf(member);

        return {
          type: member.type,
          index: typeIndex + 1, // 1-based index for API
          relationship: member.relationship,
          age: member.age,
          height: member.height || null,
          weight: member.weight || null,
          aadhaarDocument: member.aadhaarDocument || null,
          dob: member.dob || null,
          ped: member.ped || null,
          pedDetails: member.pedDetails || null,
        };

      });

      payload = {
        basicInfo: basicPayload,
        members: membersPayload,
        productId: selectedLead.productId,
        categoryId: selectedLead.categoryId,
        prospectId: selectedLead?.prospectId,
      };
    }

    console.log({ payload });

    // Dispatch appropriate action based on category
    if (GENERAL_HEALTH_CATEGORY_CODE?.includes(selectedLead?.categoryId)) {
      dispatch(CustomerActions.createHealthIGT(payload));
    } else {
      dispatch(CustomerActions.createIGT(payload));
    }
  };

  console.log({ customerFields, members });

  const showMemberDetails =
    members.length > 0 &&
    !customerFields.some(
      f =>
        ['number_of_adults', 'number_of_parents', 'number_of_child'].includes(
          f.id,
        ) && f.error,
    );

  console.log({ showMemberDetails })

  return (
    <>
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onDismiss={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Header onClose={handleCloseModal} />

            {isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={COLOR.PRIMARY_COLOR} />
              </View>
            ) : (
              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={styles.modalBodyContent}
                showsVerticalScrollIndicator={false}
              >
                <FormFields
                  fields={customerFields}
                  documents={documents}
                  policyType={policyType}
                  isPedEnabled={isPedEnabled}
                  onValueChange={onValueChange}
                  onDocumentPick={handleDocumentPick}
                  onRemoveDocument={removeDocument}
                  onViewDocument={viewDocument}
                />

                {showMemberDetails && (
                  <MemberDetails
                    members={members}
                    memberDocuments={memberDocuments}
                    memberErrors={memberErrors}
                    relationOptions={{
                      ADULT_RELATIONS,
                      PARENT_RELATIONS,
                      CHILD_RELATIONS,
                    }}
                    onMemberUpdate={handleMemberUpdate}
                    onPickAadhaarDocument={handleMemberAadhaarPick}
                    onRemoveAadhaarDocument={removeMemberAadhaar}
                    onViewDocument={viewDocument}
                  />
                )}
              </ScrollView>
            )}

            <Footer
              onCancel={handleCloseModal}
              onSave={handleFormSave}
              isLoading={isLoading}
            />
          </Animated.View>
        </View>
      </Modal>

      {showDobPicker && (
        <DateTimePicker
          value={dob || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={handleDobChange}
          maximumDate={new Date()}
          textColor="#1F2937"
        />
      )}

      {showCloseDatePicker && (
        <DateTimePicker
          value={expectedCloseDate || getTomorrowDate()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={handleCloseDateChange}
          minimumDate={getTomorrowDate()}
          textColor="#1F2937"
        />
      )}

      {showDobPicker && Platform.OS === 'ios' && (
        <View style={styles.iosDatePickerActions}>
          <TouchableOpacity
            style={styles.iosDatePickerButton}
            onPress={() => setShowDobPicker(false)}
          >
            <Text style={styles.iosDatePickerButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {showCloseDatePicker && Platform.OS === 'ios' && (
        <View style={styles.iosDatePickerActions}>
          <TouchableOpacity
            style={styles.iosDatePickerButton}
            onPress={() => setShowCloseDatePicker(false)}
          >
            <Text style={styles.iosDatePickerButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      <DocumentViewer
        visible={viewerVisible}
        document={currentDocument}
        onClose={closeViewer}
      />
    </>
  );
};

export default AddPolicyModal;
