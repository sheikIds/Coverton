import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import DynamicDropdown from './DynamicDropdown';
import { COLOR } from '../../utils/constants';

const MemberCard = ({
    type,
    index,
    member,
    relationships,
    onRelationshipChange,
    onAgeChange,
    onDelete,
    error,
}) => {
    const title =
        type === 'adult' ? `Adult Member ${index}` : `Children Member ${index}`;

    // Map relationships to the shape DynamicDropdown expects
    const dropdownData = relationships.map(r => ({ ...r, label_Display: r.label }));

    const selectedValue = member.relationship?.id ?? null;

    return (
        <View style={styles.card}>
            {/* ── Card header ── */}
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                    <MaterialDesignIcons
                        name={type === 'adult' ? 'account' : 'baby-face-outline'}
                        size={18}
                        color={COLOR.PRIMARY_COLOR}
                    />
                    <Text style={styles.cardTitle}>{title}</Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(member.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialDesignIcons name="trash-can-outline" size={22} color="#EF4444" />
                </TouchableOpacity>
            </View>

            {/* ── Relationship dropdown ── */}
            <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Relationship</Text>
                <DynamicDropdown
                    placeholder="Select relationship"
                    dropdownData={dropdownData}
                    labelField="label"
                    valueField="id"
                    selectedOption={selectedValue}
                    onSelect={item => onRelationshipChange(member.id, item)}
                    field=""
                    showLabel={false}
                    propContainerStyle={styles.dropdownContainer}
                    propPlaceholderStyle={styles.placeholderText}
                    propSelectedTextStyle={styles.selectedText}
                />
            </View>

            {/* ── Age input ── */}
            <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                    Age *{' '}
                    <Text style={styles.ageHint}>
                        {type === 'adult' ? '(Min. 25)' : '(1 – 25)'}
                    </Text>
                </Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        value={member.age}
                        onChangeText={text =>
                            onAgeChange(member.id, text.replace(/[^0-9]/g, ''))
                        }
                        placeholder="Enter age"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        maxLength={3}
                    />
                </View>
                {!!error && <Text style={styles.errorText}>{error}</Text>}
            </View>
        </View>
    );
};

export default MemberCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        color: COLOR.PRIMARY_COLOR,
        marginLeft: 6,
    },
    deleteButton: {
        padding: 2,
    },
    fieldGroup: {
        marginBottom: 10,
    },
    fieldLabel: {
        fontFamily: 'Poppins-Medium',
        fontSize: 13,
        color: '#374151',
        marginBottom: 6,
    },
    ageHint: {
        fontFamily: 'Poppins-Regular',
        fontSize: 11,
        color: '#9CA3AF',
    },
    dropdownContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    placeholderText: {
        color: '#9CA3AF',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    selectedText: {
        color: '#1F2937',
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    textInput: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#1F2937',
        padding: 0,
    },
    errorText: {
        marginTop: 6,
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#DC2626',
    },
});
