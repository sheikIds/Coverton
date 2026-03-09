import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLOR } from '../../../../utils/constants';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
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
        paddingTop: 10,
        paddingHorizontal: 20,
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
    viewerOverlay: {
        flex: 1,
        backgroundColor: '#000000',
    },
    viewerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: Platform.OS === 'ios' ? 50 : 12,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    viewerTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#FFFFFF',
        flex: 1,
        marginRight: 16,
    },
    viewerCloseButton: {
        padding: 4,
    },
    viewerContent: {
        flex: 1,
        backgroundColor: '#000000',
    },
    imageScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT - 100,
    },
    pdf: {
        flex: 1,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    membersSection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 20,
    },
    sectionTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        color: '#1A1A1A',
        marginBottom: 16,
    },
});

export const SCREEN_DIMENSIONS = {
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
};
