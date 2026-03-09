import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { styles } from '../styles';

const Footer = ({ onCancel, onSave, isLoading = false }) => {
    return (
        <View style={styles.modalFooter}>
            <View style={styles.modalActions}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                    activeOpacity={0.8}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={onSave}
                    activeOpacity={0.8}
                    disabled={isLoading}
                >
                    <MaterialDesignIcons
                        name={'check'}
                        size={20}
                        color="#FFFFFF"
                    />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Footer;
