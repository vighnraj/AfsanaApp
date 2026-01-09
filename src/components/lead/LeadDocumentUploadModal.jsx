// Lead Document Upload Modal

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../common/Toast';
import { uploadInquiryDocuments } from '../../api/applicationApi';

const LeadDocumentUploadModal = ({ visible, onClose, inquiry, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState({
        passport: null,
        certificates: null,
        ielts: null,
        sop: null,
    });

    // Handle file selection
    const handlePickFile = async (docType) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.type === 'success' || !result.canceled) {
                const file = result.assets ? result.assets[0] : result;
                setSelectedFiles((prev) => ({
                    ...prev,
                    [docType]: file,
                }));
                showToast.success('File Selected', file.name);
            }
        } catch (error) {
            console.error('File picker error:', error);
            showToast.error('Error', 'Failed to select file');
        }
    };

    // Remove selected file
    const handleRemoveFile = (docType) => {
        setSelectedFiles((prev) => ({
            ...prev,
            [docType]: null,
        }));
    };

    // Handle upload
    const handleUpload = async () => {
        // Check if at least one file is selected
        const hasFiles = Object.values(selectedFiles).some((file) => file !== null);
        if (!hasFiles) {
            showToast.error('Validation', 'Please select at least one document');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('inquiry_id', inquiry.id);

            // Append each selected file
            Object.entries(selectedFiles).forEach(([key, file]) => {
                if (file) {
                    formData.append(key, {
                        uri: file.uri,
                        type: file.mimeType || 'application/octet-stream',
                        name: file.name,
                    });
                }
            });

            await uploadInquiryDocuments(formData);
            showToast.success('Success', 'Documents uploaded successfully');
            handleClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Upload documents error:', error);
            showToast.error('Error', 'Failed to upload documents');
        } finally {
            setLoading(false);
        }
    };

    // Reset and close
    const handleClose = () => {
        setSelectedFiles({
            passport: null,
            certificates: null,
            ielts: null,
            sop: null,
        });
        onClose();
    };

    // Render file picker item
    const renderFilePickerItem = (label, docType, icon) => (
        <View key={docType} style={styles.fileItem}>
            <View style={styles.fileItemHeader}>
                <Ionicons name={icon} size={20} color={colors.primary} />
                <Text style={styles.fileItemLabel}>{label}</Text>
            </View>

            {selectedFiles[docType] ? (
                <View style={styles.selectedFileContainer}>
                    <View style={styles.selectedFileInfo}>
                        <Ionicons name="document" size={16} color={colors.success} />
                        <Text style={styles.selectedFileName} numberOfLines={1}>
                            {selectedFiles[docType].name}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveFile(docType)}>
                        <Ionicons name="close-circle" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.selectFileButton}
                    onPress={() => handlePickFile(docType)}
                >
                    <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
                    <Text style={styles.selectFileButtonText}>Select File</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, shadows.lg]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Upload Documents</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Inquiry Info */}
                    {inquiry && (
                        <View style={styles.inquiryInfo}>
                            <Text style={styles.inquiryName}>{inquiry.name}</Text>
                            <Text style={styles.inquiryEmail}>{inquiry.email}</Text>
                        </View>
                    )}

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {renderFilePickerItem('Passport Copy', 'passport', 'card')}
                        {renderFilePickerItem('Academic Certificates', 'certificates', 'school')}
                        {renderFilePickerItem('IELTS / Language Test', 'ielts', 'language')}
                        {renderFilePickerItem('Statement of Purpose (SOP)', 'sop', 'document-text')}

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color={colors.info} />
                            <Text style={styles.infoText}>
                                You can upload one or more documents. Accepted formats: PDF, JPG, PNG, DOC, DOCX
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
                            onPress={handleUpload}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <>
                                    <Ionicons name="cloud-upload" size={20} color={colors.white} />
                                    <Text style={styles.uploadButtonText}>Upload</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        width: '90%',
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    headerTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    inquiryInfo: {
        padding: spacing.md,
        backgroundColor: `${colors.primary}10`,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    inquiryName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    inquiryEmail: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    content: {
        padding: spacing.md,
    },
    fileItem: {
        marginBottom: spacing.md,
    },
    fileItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
        gap: spacing.xs,
    },
    fileItemLabel: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
    },
    selectFileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.sm,
        backgroundColor: `${colors.primary}10`,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        gap: spacing.xs,
    },
    selectFileButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    selectedFileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.sm,
        backgroundColor: colors.successLight,
        borderRadius: borderRadius.md,
    },
    selectedFileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: spacing.xs,
    },
    selectedFileName: {
        fontSize: fontSizes.sm,
        color: colors.success,
        fontWeight: '500',
        flex: 1,
    },
    infoBox: {
        flexDirection: 'row',
        padding: spacing.sm,
        backgroundColor: `${colors.info}10`,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
        gap: spacing.xs,
    },
    infoText: {
        fontSize: fontSizes.xs,
        color: colors.info,
        flex: 1,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        gap: spacing.sm,
    },
    cancelButton: {
        flex: 1,
        padding: spacing.sm,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    uploadButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    uploadButtonDisabled: {
        opacity: 0.6,
    },
    uploadButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.white,
    },
});

export default LeadDocumentUploadModal;
