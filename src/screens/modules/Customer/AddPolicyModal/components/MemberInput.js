import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { COLOR } from '../../../../../utils/constants';
import DynamicDropdown from '../../../../components/DynamicDropdown';
import DocumentUploadField from '../../../../components/DocumentUploadField';

const MemberInput = ({
  index,
  member,
  onUpdate,
  relationOptions,
  aadhaarDocument,
  onPickAadhaarDocument,
  onRemoveAadhaarDocument,
  onViewAadhaarDocument,
  errors = {},
}) => {
  const [showDobPicker, setShowDobPicker] = useState(false);

  const formatDate = date => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDobChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDobPicker(false);
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
      onUpdate(index, 'dob', utcDate.toISOString());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.memberTitle}>
        {member.type}: {index + 1}
      </Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Relationship</Text>
          <DynamicDropdown
            dropdownData={relationOptions}
            labelField="label"
            valueField="value"
            selectedOption={member.relationship}
            onSelect={item => onUpdate(index, 'relationship', item.value)}
            placeholder="Select Relationship"
            propContainerStyle={[
              styles.dropdown,
              errors.relationship && styles.errorBorder,
            ]}
            showLabel={false}
            propPlaceholderStyle={{ color: '#9CA3AF' }}
          />
          {errors.relationship && (
            <Text style={styles.errorText}>{errors.relationship}</Text>
          )}
        </View>
        <View style={[styles.field, { flex: 0.4 }]}>
          <Text style={styles.label}>Age</Text>
          <View
            style={[styles.inputContainer, errors.age && styles.errorBorder]}
          >
            <TextInput
              style={styles.input}
              value={member.age?.toString() || ''}
              onChangeText={text => onUpdate(index, 'age', text)}
              placeholder="Age"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={[styles.inputContainer, errors.dob && styles.errorBorder]}
            onPress={() => setShowDobPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.datePickerContent}>
              <Text
                style={[
                  styles.input,
                  !member.dob && { color: '#9CA3AF' },
                ]}
              >
                {member.dob ? formatDate(member.dob) : 'Select date of birth'}
              </Text>
              <MaterialDesignIcons
                name="calendar-month"
                size={20}
                color="#6B7280"
              />
            </View>
          </TouchableOpacity>
          {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.field, { flex: 0.5 }]}>
          <Text style={styles.label}>Height</Text>
          <View
            style={[
              styles.inputContainer,
              errors.height && styles.errorBorder,
            ]}
          >
            <TextInput
              style={styles.input}
              value={member.height?.toString() || ''}
              onChangeText={text => onUpdate(index, 'height', text)}
              placeholder="Height"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
          {errors.height && (
            <Text style={styles.errorText}>{errors.height}</Text>
          )}
        </View>
        <View style={[styles.field, { flex: 0.5 }]}>
          <Text style={styles.label}>Weight</Text>
          <View
            style={[
              styles.inputContainer,
              errors.weight && styles.errorBorder,
            ]}
          >
            <TextInput
              style={styles.input}
              value={member.weight?.toString() || ''}
              onChangeText={text => onUpdate(index, 'weight', text)}
              placeholder="Weight"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={3}
            />
          </View>
          {errors.weight && (
            <Text style={styles.errorText}>{errors.weight}</Text>
          )}
        </View>
      </View>
      <View style={[styles.field, { marginTop: 10, flexDirection: 'column', alignItems: 'flex-start' }]}>
        <Text style={styles.label}>PED    </Text>
        <Switch
          value={member?.ped === '1'}
          onValueChange={val => {
            const newPedValue = val ? '1' : '0';
            onUpdate(index, 'ped', newPedValue);
            // Clear PED Details when PED is disabled
            if (!val) {
              onUpdate(index, 'pedDetails', '');
            }
          }}
          thumbColor={member?.ped === '1' ? COLOR.PRIMARY_COLOR : '#f4f3f4'}
          trackColor={{ false: '#767577', true: COLOR.PRIMARY_COLOR + '80' }}
        />
        {errors.ped && <Text style={styles.errorText}>{errors.ped}</Text>}
      </View>
      {member?.ped === '1' && (
        <View style={[styles.field, { flex: 1, marginTop: 10 }]}>
          <Text style={styles.label}>PED Details</Text>
          <View
            style={[styles.inputContainer, errors.pedDetails && styles.errorBorder]}
          >
            <TextInput
              style={styles.input}
              value={member.pedDetails?.toString() || ''}
              onChangeText={text => onUpdate(index, 'pedDetails', text)}
              placeholder="PED Details"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          {errors.pedDetails && (
            <Text style={styles.errorText}>{errors.pedDetails}</Text>
          )}
        </View>
      )}
      <View style={styles.documentSection}>
        <Text style={styles.label}>Aadhaar Document</Text>
        <View style={errors.aadhaarDocument && styles.errorBorderDoc}>
          <DocumentUploadField
            label="Aadhaar"
            docType={`member_${index}_aadhaar`}
            document={aadhaarDocument}
            onPickDocument={() => onPickAadhaarDocument?.(index)}
            onRemoveDocument={() => onRemoveAadhaarDocument?.(index)}
            onViewDocument={() => onViewAadhaarDocument?.(aadhaarDocument)}
          />
        </View>
        {errors.aadhaarDocument && (
          <Text style={styles.errorText}>{errors.aadhaarDocument}</Text>
        )}
      </View>

      {showDobPicker && (
        <DateTimePicker
          value={member.dob ? new Date(member.dob) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
          onChange={handleDobChange}
          maximumDate={new Date()}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  memberTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: COLOR.PRIMARY_COLOR,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10
  },
  field: {
    flex: 1,
  },
  documentSection: {
    marginTop: 10
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 45,
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#1F2937',
    padding: 0,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    height: 45,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  errorBorder: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  errorBorderDoc: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 11,
    color: '#EF4444',
    marginTop: 2,
  },
  datePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});

export default MemberInput;

