import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { COLOR } from '../../../../../utils/constants';
import { styles } from '../styles';

const Header = ({ onClose, title = 'Add IGT' }) => {
    return (
        <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <View style={styles.modalTitleRow}>
                <MaterialDesignIcons
                    name={'pencil-box'}
                    size={24}
                    color={COLOR.PRIMARY_COLOR}
                />
                <Text style={styles.modalTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialDesignIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
        </View>
    );
};

export default Header;
