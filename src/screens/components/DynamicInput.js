import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import React, { useState } from 'react';
import { COLOR, INPUT_TYPE_ID } from '../../utils/constants';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import RNDateTimePicker from '@react-native-community/datetimepicker';

import DocumentUploadField from '../components/DocumentUploadField';
import DynamicDropdown from './DynamicDropdown';

const DynamicInput = ({
  item,
  documents,
  handleDocumentPick,
  onRemoveDocument,
  onViewDocument,
  onValueChange,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');

  console.log({ item })
  const formatDate = date => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
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
      // Store ISO string in value
      onValueChange(utcDate.toISOString(), item, '');
    }
  };

  const docKey = item?.id || item?.fieldName?.split(' ')?.join('').toLowerCase();
  const documentForField = documents?.[docKey] || (item?.value && typeof item?.value === 'string' && item?.value.startsWith('data:') ? {
    uri: item?.value,
    name: item?.label || 'Document',
    type: item?.value.split(';')[0]?.split(':')[1] || 'image/jpeg',
  } : null);


  return (
    <View>
      {item?.inputTypeId === INPUT_TYPE_ID.TEXT_INPUT ? (
        <View>
          <View style={[styles.inputContainer, (error || item?.error) && styles.errorBorder]}>
            <TextInput
              style={styles.textInput}
              value={item?.value ?? ''}
              onChangeText={text => {
                onValueChange(text, item);
              }}
              placeholder={`Enter ${(item?.label || '').toLowerCase()}...`}
              placeholderTextColor="#9CA3AF"
              keyboardType="default"
              maxLength={100}
            />
          </View>
          {(error || item?.error) ? <Text style={styles.errorText}>{error || item?.error}</Text> : null}
        </View>
      ) : null}

      {item?.inputTypeId === INPUT_TYPE_ID.NUMBER ? (
        <View>
          <View
            style={[styles.inputContainer, (error || item?.error) && styles.errorBorder]}
          >
            <TextInput
              style={styles.textInput}
              value={item?.value ?? ''}
              keyboardType="numeric"
              maxLength={12}
              placeholder={`Enter ${(item?.label || '').toLowerCase()}...`}
              placeholderTextColor="#9CA3AF"
              onChangeText={text => {
                // Allow only numbers
                if (!/^\d*$/.test(text)) return;

                const num = Number(text);
                const min = item?.min;
                const max = item?.max;

                if (text === '') {
                  setError('');
                  onValueChange('', item, '');
                  return;
                }

                let errorMsg = '';
                if (min !== undefined && num < min) {
                  errorMsg = `Minimum allowed is ${min}`;
                } else if (max !== undefined && num > max) {
                  errorMsg = `Maximum allowed is ${max}`;
                }

                setError(errorMsg);
                onValueChange(text, item, errorMsg);
              }}
              onBlur={() => {
                const num = Number(item?.value);
                const min = item?.min ?? item?.minValue;
                const max = item?.max ?? item?.maxValue;
                let errorMsg = '';

                if (item?.value !== '' && min !== undefined && num < min) {
                  errorMsg = `Minimum allowed is ${min}`;
                } else if (item?.value !== '' && max !== undefined && num > max) {
                  errorMsg = `Maximum allowed is ${max}`;
                }

                setError(errorMsg);
                onValueChange(item?.value, item, errorMsg);
              }}
            />
          </View>

          {(error || item?.error) ? <Text style={styles.errorText}>{error || item?.error}</Text> : null}
        </View>
      ) : null}

      {item?.inputTypeId === INPUT_TYPE_ID.DATE ? (
        <View>
          <TouchableOpacity
            style={[styles.inputContainer, (error || item?.error) && styles.errorBorder]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.datePickerContent}>
              <Text
                style={[styles.textInput, !item?.value && { color: '#9CA3AF' }]}
              >
                {item?.value
                  ? formatDate(new Date(item?.value))
                  : 'Select expected close date'}
              </Text>
              <MaterialDesignIcons
                name="calendar-month"
                size={20}
                color="#6B7280"
              />
            </View>
          </TouchableOpacity>
          {(error || item?.error) ? <Text style={styles.errorText}>{error || item?.error}</Text> : null}
        </View>
      ) : null}

      {item?.inputTypeId === INPUT_TYPE_ID.FILE_TYPE ? (
        <View>
          <View style={(error || item?.error) && styles.errorBorderDoc}>
            <DocumentUploadField
              label={item?.fieldName}
              docType={docKey}
              document={documentForField}
              onPickDocument={docTypeParam =>
                handleDocumentPick(docTypeParam || docKey, item)
              }
              onRemoveDocument={docTypeParam =>
                onRemoveDocument(docTypeParam || docKey, item)
              }
              onViewDocument={onViewDocument}
            />
          </View>
          {(error || item?.error) ? <Text style={styles.errorText}>{error || item?.error}</Text> : null}
        </View>
      ) : null}
      {item?.inputTypeId === INPUT_TYPE_ID.SINGLE_SELECT_DROPDOWN ? (
        <View>
          <DynamicDropdown
            placeholder={`Select ${item?.label || ''}`}
            dropdownData={item?.options || []}
            labelField="label"
            valueField="id"
            selectedOption={item.value}
            onSelect={option => {
              onValueChange(option?.id, item, '');
            }}
            field=""
            showLabel={false}
            propContainerStyle={[styles.inputContainer, (error || item?.error) && styles.errorBorder]}
            propPlaceholderStyle={{ color: '#9CA3AF' }}
          />
          {(error || item?.error) ? <Text style={styles.errorText}>{error || item?.error}</Text> : null}
        </View>
      ) : null}

      {item?.inputTypeId === INPUT_TYPE_ID.SWITCH ? (
        <View style={styles.switchRow}>
          <Switch
            value={item?.value === '1'}
            onValueChange={val => {
              onValueChange(val ? '1' : '0', item, '');
            }}
            thumbColor={item?.value === '1' ? COLOR.PRIMARY_COLOR : '#f4f3f4'}
            trackColor={{ false: '#767577', true: COLOR.PRIMARY_COLOR + '80' }}
          />
        </View>
      ) : null}

      {showDatePicker && (
        <RNDateTimePicker
          value={item?.value ? new Date(item?.value) : getTomorrowDate()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={handleDateChange}
          minimumDate={getTomorrowDate()}
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
    </View>
  );
};

export default DynamicInput;

const styles = StyleSheet.create({
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
  switchRow: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  errorBorder: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  errorBorderDoc: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    borderRadius: 12,
  },
});
