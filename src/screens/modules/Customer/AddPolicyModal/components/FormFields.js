import React from 'react';
import { View, Text } from 'react-native';
import DynamicInput from '../../../../components/DynamicInput';
import { styles } from '../styles';

const FormFields = ({
    fields,
    documents,
    policyType,
    isPedEnabled,
    onValueChange,
    onDocumentPick,
    onRemoveDocument,
    onViewDocument,
}) => {
    return (
        <>
            {fields &&
                fields
                    .filter(item => {
                        // For individual/self policy, hide member count fields
                        if (
                            policyType === 'individual' &&
                            ['number_of_adults', 'number_of_parents', 'number_of_child'].includes(item.id)
                        ) {
                            return false;
                        }
                        // Hide PED Details field if PED switch is not enabled
                        if (item.id === 'ped_details' && !isPedEnabled) {
                            return false;
                        }
                        return true;
                    })
                    .map((item, index) => (
                        <View key={item.id || index} style={styles.formGroup}>
                            <Text style={styles.formLabel}>{item?.label || item?.question}</Text>
                            <DynamicInput
                                item={item}
                                documents={documents}
                                handleDocumentPick={docTypeParam => {
                                    // Use item.id as the document key for consistency
                                    const docKey = item?.id || item?.fieldName?.split(' ')?.join('').toLowerCase();
                                    onDocumentPick(docTypeParam || docKey, item);
                                }}
                                onRemoveDocument={docTypeParam => {
                                    // Use item.id as the document key for consistency
                                    const docKey = item?.id || item?.fieldName?.split(' ')?.join('').toLowerCase();
                                    onRemoveDocument(docTypeParam || docKey, item);
                                }}
                                onViewDocument={onViewDocument}
                                onValueChange={onValueChange}
                            />
                        </View>
                    ))}
        </>
    );
};

export default FormFields;
