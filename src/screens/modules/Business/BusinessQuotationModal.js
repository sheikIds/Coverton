import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Alert, Platform, ToastAndroid } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { useDispatch, useSelector } from 'react-redux';
import { COLOR } from '../../../utils/constants';
import { BusinessOpportunitiesActions } from '../../../Redux/BusinessOpportunitiesRedux';
import * as RequestStatus from '../../../Entities/RequestStatus';

const BusinessQuotationModal = ({ visible, onClose, leadDataOriginal }) => {
    const dispatch = useDispatch();

    const quotationRequestStatus = useSelector(
        state => state.businessOpportunities?.quotationRequestStatus
    );

    const isLoading = quotationRequestStatus === RequestStatus.INPROGRESS;

    useEffect(() => {
        if (quotationRequestStatus === RequestStatus.OK) {
            if (Platform.OS === 'android') {
                ToastAndroid.show('Quotation request sent successfully!', ToastAndroid.SHORT);
            } else {
                Alert.alert('Success', 'Quotation request sent successfully!');
            }
            onClose();
            dispatch(BusinessOpportunitiesActions.setQuotationRequestStatus(RequestStatus.INITIAL));
            dispatch(BusinessOpportunitiesActions.getLeads({ pageNumber: 1, pageSize: 10 }));
        } else if (quotationRequestStatus === RequestStatus.ERROR) {
            if (Platform.OS === 'android') {
                ToastAndroid.show('Failed to send quotation request!', ToastAndroid.SHORT);
            } else {
                Alert.alert('Error', 'Failed to send quotation request!');
            }
            dispatch(BusinessOpportunitiesActions.setQuotationRequestStatus(RequestStatus.INITIAL));
        }
    }, [quotationRequestStatus, dispatch, onClose]);

    const handleConfirm = () => {
        if (leadDataOriginal?.prospectID) {
            dispatch(BusinessOpportunitiesActions.quotationRequest(leadDataOriginal.prospectID));
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Request for Quotation</Text>
                        <TouchableOpacity onPress={onClose} disabled={isLoading}>
                            <MaterialDesignIcons name="close-circle" size={24} color={COLOR.BLACK_COLOR} />
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <View style={styles.body}>
                        <Text style={styles.messageText}>
                            Are you sure you want to request for quotation for prospectID {leadDataOriginal?.prospectID}?
                        </Text>

                        {/* Footer Buttons */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                disabled={isLoading}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.okButton, isLoading && styles.disabledButton]}
                                onPress={handleConfirm}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.okButtonText}>Yes, Request</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: COLOR.BORDER_COLOR,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        color: COLOR.BLACK_COLOR,
        fontSize: 16,
        fontWeight: 'bold',
    },
    body: {
        padding: 20,
    },
    messageText: {
        color: COLOR.BLACK_COLOR,
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        padding: 12,
        height: 80,
        textAlignVertical: 'top',
        color: '#374151',
        fontSize: 14,
        marginBottom: 8,
    },
    inputError: {
        borderColor: COLOR.RED_COLOR,
    },
    errorText: {
        color: COLOR.RED_COLOR,
        fontSize: 12,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
        gap: 12,
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: COLOR.PLACEHOLDER_COLOR,
        backgroundColor: COLOR.WHITE_COLOR,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 6,
        minWidth: 90,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: COLOR.BLACK_COLOR,
        fontWeight: '600',
        fontSize: 14,
    },
    okButton: {
        backgroundColor: COLOR.RED_COLOR,
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 6,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    okButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default BusinessQuotationModal;
