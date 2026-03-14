import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import DynamicDropdown from '../../components/DynamicDropdown';
import { COLOR } from '../../../utils/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const YEARS = [
    { id: 'ALL', label: 'All Years' },
    { id: '2023', label: '2023' },
    { id: '2024', label: '2024' },
    { id: '2025', label: '2025' },
    { id: '2026', label: '2026' },
];

const MONTHS = [
    { id: 'ALL', label: 'All Months' },
    { id: 1, label: 'January' },
    { id: 2, label: 'February' },
    { id: 3, label: 'March' },
    { id: 4, label: 'April' },
    { id: 5, label: 'May' },
    { id: 6, label: 'June' },
    { id: 7, label: 'July' },
    { id: 8, label: 'August' },
    { id: 9, label: 'September' },
    { id: 10, label: 'October' },
    { id: 11, label: 'November' },
    { id: 12, label: 'December' },
];

const STATUSES = [
    { id: 'ALL', label: 'All Status' },
    { id: 'OPEN', label: 'Open' },
    { id: 'Hot', label: 'Hot' },
    { id: 'Warm', label: 'Warm' },
    { id: 'Cold', label: 'Cold' },
    { id: 'Dismissed', label: 'Dismissed' },
];

const CUSTOMER_TYPES = [
    { id: 'ALL', label: 'All' },
    { id: 'Retail', label: 'Retail' },
    { id: 'Corporate', label: 'Corporate' },
];

const BUSINESS_TYPES = ['ALL', 'CORPORATE', 'RETAIL'];

const BusinessFilterModal = ({ visible, onClose, onApply, currentFilters, slideAnim, onClearAll }) => {
    const [filters, setFilters] = useState({
        year: 'ALL',
        month: 'ALL',
        status: 'ALL',
        leadProvider: '',
        customerID: '',
        customerType: 'ALL',
        businessType: 'ALL',
    });

    useEffect(() => {
        if (visible && currentFilters) {
            setFilters({ ...currentFilters });
        }
    }, [visible, currentFilters]);

    const handleClearAll = () => {
        setFilters({
            year: 'ALL',
            month: 'ALL',
            status: 'ALL',
            leadProvider: '',
            customerID: '',
            customerType: 'ALL',
            businessType: 'ALL',
        });
        if (onClearAll) onClearAll();
        else onClose();
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
                <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalTitleRow}>
                            <Text style={styles.modalTitle}>Filters</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <MaterialDesignIcons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false} bounces={false}>
                        {/* Row 1 */}
                        <View style={styles.row}>
                            <View style={styles.colHalf}>
                                <Text style={styles.formLabel}>YEAR</Text>
                                <DynamicDropdown
                                    placeholder={'All Years'}
                                    dropdownData={YEARS}
                                    labelField={'label'}
                                    valueField={'id'}
                                    selectedOption={filters.year}
                                    onSelect={(item) => updateFilter('year', item.id)}
                                    showLabel={false}
                                    propContainerStyle={styles.dropdownContainer}
                                />
                            </View>
                            <View style={styles.colHalf}>
                                <Text style={styles.formLabel}>MONTH</Text>
                                <DynamicDropdown
                                    placeholder={'All Months'}
                                    dropdownData={MONTHS}
                                    labelField={'label'}
                                    valueField={'id'}
                                    selectedOption={filters.month}
                                    onSelect={(item) => updateFilter('month', item.id)}
                                    showLabel={false}
                                    propContainerStyle={styles.dropdownContainer}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.colHalf}>
                                <Text style={styles.formLabel}>STATUS</Text>
                                <DynamicDropdown
                                    placeholder={'All Status'}
                                    dropdownData={STATUSES}
                                    labelField={'label'}
                                    valueField={'id'}
                                    selectedOption={filters.status}
                                    onSelect={(item) => updateFilter('status', item.id)}
                                    showLabel={false}
                                    propContainerStyle={styles.dropdownContainer}
                                />
                            </View>
                            <View style={styles.colHalf}>
                                <Text style={styles.formLabel}>LEAD PROVIDER</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={filters.leadProvider}
                                        onChangeText={text => updateFilter('leadProvider', text)}
                                        placeholder="Enter Lead Provider"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Row 2 */}
                        <View style={styles.row}>
                            <View style={styles.colHalf}>
                                <Text style={styles.formLabel}>CUSTOMER ID</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={filters.customerID}
                                        onChangeText={text => updateFilter('customerID', text)}
                                        placeholder="Enter Customer ID"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>
                            <View style={styles.colHalf}>
                                <Text style={styles.formLabel}>CUSTOMER TYPE</Text>
                                <DynamicDropdown
                                    placeholder={'All'}
                                    dropdownData={CUSTOMER_TYPES}
                                    labelField={'label'}
                                    valueField={'id'}
                                    selectedOption={filters.customerType}
                                    onSelect={(item) => updateFilter('customerType', item.id)}
                                    showLabel={false}
                                    propContainerStyle={styles.dropdownContainer}
                                />
                            </View>
                        </View>

                        {/* Row 3 - Business Type */}
                        <View style={styles.formGroup}>
                            <View style={styles.businessTypeContainer}>
                                <Text style={styles.formLabel}>BUSINESS TYPE</Text>
                                <View style={styles.radioGroup}>
                                    {BUSINESS_TYPES.map(type => (
                                        <TouchableOpacity
                                            key={type}
                                            style={styles.radioButton}
                                            onPress={() => updateFilter('businessType', type)}
                                        >
                                            <MaterialDesignIcons
                                                name={filters.businessType === type ? 'radiobox-marked' : 'radiobox-blank'}
                                                size={20}
                                                color={filters.businessType === type ? COLOR.PRIMARY_COLOR : '#9CA3AF'}
                                            />
                                            <Text style={[styles.radioLabel, filters.businessType === type && styles.radioLabelSelected]}>
                                                {type === 'ALL' ? 'All' : type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.clearButton} onPress={handleClearAll} activeOpacity={0.8}>
                                <Text style={styles.clearButtonText}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.8}>
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        height: SCREEN_HEIGHT * 0.70,
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
        fontSize: 18,
        color: '#1A1A1A',
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        top: 20,
        padding: 4,
    },
    modalBody: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    colHalf: {
        flex: 1,
        paddingHorizontal: 5,
    },
    formGroup: {
        marginBottom: 20,
        paddingHorizontal: 5,
    },
    formLabel: {
        fontFamily: 'Poppins-Medium',
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        minHeight: 46,
        justifyContent: 'center',
    },
    dropdownContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        minHeight: 46,
    },
    textInput: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#1F2937',
        padding: 0,
    },
    businessTypeContainer: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginTop: 10,
    },
    radioGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    radioLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#6B7280',
    },
    radioLabelSelected: {
        color: '#1F2937',
        fontFamily: 'Poppins-Medium',
    },
    modalFooter: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    clearButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
    },
    clearButtonText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        color: '#374151',
    },
    applyButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: COLOR.PRIMARY_COLOR || '#3b5998',
        borderRadius: 8,
    },
    applyButtonText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        color: '#FFFFFF',
    },
});

export default BusinessFilterModal;
