import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable, ActivityIndicator, TouchableOpacity } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { COLOR, FONTS } from '../../utils/constants';

const CommonModalConfirmation = ({
  visible,
  onClose,
  title,
  message,
  confirmText = 'Yes',
  cancelText = 'No',
  onConfirm,
  onCancel,
  isLoading = false,
  showCloseIcon = false,
  confirmButtonColor = COLOR.PRIMARY_COLOR
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {showCloseIcon ? (
            <View style={styles.headerWithIcon}>
              <Text style={[styles.modalTitle, { marginBottom: 0 }]}>{title}</Text>
              <TouchableOpacity onPress={onClose} disabled={isLoading}>
                <MaterialDesignIcons name="close-circle" size={24} color={COLOR.BLACK_COLOR} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.modalTitle}>{title}</Text>
          )}

          <Text style={styles.modalMessage}>{message}</Text>

          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </Pressable>

            <Pressable
              style={[
                styles.modalButton,
                styles.confirmButton,
                { backgroundColor: confirmButtonColor },
                isLoading && styles.disabledButton
              ]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLOR.WHITE_COLOR} />
              ) : (
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLOR.BLACK_COLOR + '66',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLOR.WHITE_COLOR,
    borderRadius: 12,
    padding: 20,
    elevation: 6,
  },
  headerWithIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONTS.FONT_BOLD,
    color: COLOR.PRIMARY_COLOR,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: FONTS.FONT_REGULAR,
    color: COLOR.PRIMARY_COLOR,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    minWidth: 80,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: COLOR.PRIMARY_COLOR,
    backgroundColor: COLOR.WHITE_COLOR,
  },
  confirmButton: {
    backgroundColor: COLOR.PRIMARY_COLOR,
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: COLOR.PRIMARY_COLOR,
    fontFamily: FONTS.FONT_MEDIUM,
    fontSize: 14,
  },
  confirmButtonText: {
    color: COLOR.WHITE_COLOR,
    fontFamily: FONTS.FONT_MEDIUM,
    fontSize: 14,
  },
});

export default CommonModalConfirmation;
