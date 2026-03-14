import React, { useMemo, useState, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';

const MultiSelectDropdown = (props) => {
    const {
        data,
        labelField,
        valueField,
        placeholder,
        onSelect,
        selectedOptions = [],
        labelStyle,
        focusedDropdownStyle,
        containerStyle,
        propRenderItemContainerStyle,
        propContainerStyle,
        showLabel = true,
        propSelectedTextStyle,
        propPlaceholderStyle,
        propOptionTextStyle,
        disabled = false,
        maxSelect = 3,
        renderLabelTitle,
    } = props;

    const [isFocus, setIsFocus] = useState(false);

    const processedData = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }
        return data.map(item => ({
            ...item,
            [`${labelField}_Display`]: item?.[labelField],
        }));
    }, [data, labelField]);

    const renderLabel = useCallback(() => {
        if (selectedOptions.length > 0 || isFocus) {
            return <Text style={[styles.label, labelStyle]}>{renderLabelTitle}</Text>;
        }
        return null;
    }, [selectedOptions, isFocus, renderLabelTitle, labelStyle]);

    const renderItem = useCallback((item) => {
        const isSelected = selectedOptions.includes(item[valueField]);
        return (
            <View style={[styles.renderItemContainer, propRenderItemContainerStyle, isSelected && styles.selectedItem]}>
                <Text numberOfLines={1} style={[propOptionTextStyle, isSelected && styles.selectedItemText]}>
                    {item?.[`${labelField}_Display`]}
                </Text>
            </View>
        );
    }, [propRenderItemContainerStyle, propOptionTextStyle, labelField, selectedOptions, valueField]);

    const handleChange = useCallback((item) => {
        if (item.length <= maxSelect) {
            onSelect?.(item);
        }
        // We don't necessarily close on every click in multiselect, 
        // but the library handles the toggle.
    }, [onSelect, maxSelect]);

    const isDisabled = disabled || processedData?.length === 0;

    const filteredListContainerStyle = useMemo(() => {
        if (!propContainerStyle) return {};
        const { height, justifyContent, ...rest } = StyleSheet.flatten(propContainerStyle);
        return rest;
    }, [propContainerStyle]);

    return (
        <View style={containerStyle}>
            {showLabel ? renderLabel() : null}
            <MultiSelect
                disable={isDisabled}
                style={[
                    styles.dropdown,
                    propContainerStyle,
                    isFocus && focusedDropdownStyle,
                    isDisabled ? styles.disabledBackground : null,
                ]}
                placeholderStyle={[styles.placeholderStyle, propPlaceholderStyle]}
                selectedTextStyle={[styles.selectedTextStyle, propSelectedTextStyle]}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                containerStyle={[styles.dropdownListContainer, filteredListContainerStyle]}
                activeColor="transparent"
                itemContainerStyle={styles.itemContainerStyle}
                itemTextStyle={styles.itemTextStyle}
                data={processedData}
                renderItem={renderItem}
                maxHeight={300}
                labelField={`${labelField}_Display`}
                valueField={valueField}
                placeholder={!isFocus ? placeholder : '...'}
                searchPlaceholder="Search..."
                showsVerticalScrollIndicator={false}
                value={selectedOptions}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={handleChange}
                selectedStyle={styles.selectedStyle}
            />
        </View>
    );
};

export default MultiSelectDropdown;

const styles = StyleSheet.create({
    dropdown: {
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 10,
        direction: 'ltr',
    },
    dropdownListContainer: {
        borderRadius: 8,
        borderColor: 'gray',
        borderWidth: 0.5,
        overflow: 'hidden',
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 11,
    },
    placeholderStyle: {
        fontSize: 16,
        color: 'lightgrey',
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        borderRadius: 12,
    },
    renderItemContainer: {
        padding: 15,
    },
    disabledBackground: {
        backgroundColor: '#F2F2F2',
    },
    selectedStyle: {
        borderRadius: 12,
    },
    itemContainerStyle: {
        borderWidth: 0,
    },
    itemTextStyle: {
        borderWidth: 0,
    },
    selectedItem: {
        backgroundColor: '#E5E7EB',
    },
    selectedItemText: {
        color: '#1F2937',
        fontWeight: '600',
    },
});
