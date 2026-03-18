import React, { useEffect } from 'react';
import { Alert, Platform, ToastAndroid, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { COLOR } from '../../../utils/constants';
import { BusinessOpportunitiesActions } from '../../../Redux/BusinessOpportunitiesRedux';
import * as RequestStatus from '../../../Entities/RequestStatus';
import CommonModalConfirmation from '../../components/CommonModalConfirmation';

const BusinessQuotationModal = ({ visible, onClose, leadDataOriginal }) => {
    const dispatch = useDispatch();

    const quotationRequestStatus = useSelector(
        state => state.businessOpportunities?.quotationRequestStatus
    );

    const isLoading = quotationRequestStatus === RequestStatus.INPROGRESS;
    const user = useSelector(state => state.auth?.user ?? null);

    useEffect(() => {
        if (quotationRequestStatus === RequestStatus.OK) {
            if (Platform.OS === 'android') {
                ToastAndroid.show('Quotation request sent successfully!', ToastAndroid.SHORT);
            } else {
                Alert.alert('Success', 'Quotation request sent successfully!');
            }
            onClose();
            dispatch(BusinessOpportunitiesActions.setQuotationRequestStatus(RequestStatus.INITIAL));
            dispatch(BusinessOpportunitiesActions.getLeads({ pageNumber: 1, pageSize: 10, userId: user?.userId }));
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
        console.log({ leadDataOriginal })
        if (leadDataOriginal?.prospectID) {
            dispatch(BusinessOpportunitiesActions.quotationRequest(leadDataOriginal.prospectID));
        }
    };

    return (
        <CommonModalConfirmation
            visible={visible}
            onClose={onClose}
            title="Request for Quotation"
            message={`Are you sure you want to request for quotation for ${leadDataOriginal?.prospectID}?`}
            confirmText="Yes"
            cancelText="Cancel"
            onConfirm={handleConfirm}
            onCancel={onClose}
            isLoading={isLoading}
            showCloseIcon={true}
            confirmButtonColor={COLOR.GREEN_COLOR}
        />
    );
};

const styles = StyleSheet.create({});

export default BusinessQuotationModal;
