import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import Pdf from 'react-native-pdf';
import { isImageFile, isPdfFile } from '../../../../../utils/utils';
import { styles } from '../styles';

const DocumentViewer = ({ visible, document, onClose }) => {
    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.viewerOverlay}>
                <View style={styles.viewerHeader}>
                    <Text style={styles.viewerTitle} numberOfLines={1}>
                        {document?.name || 'Document'}
                    </Text>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.viewerCloseButton}
                    >
                        <MaterialDesignIcons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.viewerContent}>
                    {document && isImageFile(document) && (
                        <ScrollView
                            contentContainerStyle={styles.imageScrollContent}
                            maximumZoomScale={3}
                            minimumZoomScale={1}
                            showsVerticalScrollIndicator={false}
                        >
                            {console.log('Rendering Image with URI:', document.uri?.substring(0, 100) + '...')}
                            <Image
                                source={{ uri: document.uri }}
                                style={styles.documentImage}
                                resizeMode="contain"
                                onError={(e) => console.log('Image render error:', e.nativeEvent.error)}
                            />
                        </ScrollView>
                    )}
                    {document && isPdfFile(document) && (
                        <View style={{ flex: 1 }}>
                            {console.log('Rendering PDF with URI:', document.uri?.substring(0, 100) + '...')}
                            <Pdf
                                source={{ uri: document.uri }}
                                style={styles.pdf}
                                onLoadComplete={(numberOfPages, filePath) => {
                                    console.log(`PDF loaded successfully with ${numberOfPages} pages`);
                                }}
                                onPageChanged={(page, numberOfPages) => {
                                    console.log(`Current page: ${page}`);
                                }}
                                onError={(error) => {
                                    console.log('PDF load error:', error);
                                    Alert.alert('Error', 'Failed to load PDF. Please try again.');
                                }}
                                onPressLink={(uri) => {
                                    console.log(`Link pressed: ${uri}`);
                                }}
                            />
                        </View>
                    )}
                    {!isImageFile(document) && !isPdfFile(document) && (
                        <View style={styles.loader}>
                            <Text style={{ color: 'white' }}>Unsupported document format</Text>
                            {console.log('Unsupported document format:', document)}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default DocumentViewer;
