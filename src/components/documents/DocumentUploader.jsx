// Document Uploader Component
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import documentService from '../../services/documentService';
import DocumentTypeSelector from './DocumentTypeSelector';
import { showToast } from '../common/Toast';

const DocumentUploader = ({ relatedId, relatedType = 'inquiry', onUploadComplete, documentType: initialDocType }) => {
  const [documentType, setDocumentType] = useState(initialDocType || '');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handlePickDocument = async () => {
    try {
      const file = await documentService.pickDocument();
      if (file) {
        documentService.validateFileSize(file, 10);
        documentService.validateFileType(file);
        setSelectedFile(file);
      }
    } catch (error) {
      showToast.error('Error', error.message || 'Failed to pick document');
    }
  };

  const handlePickImage = async () => {
    try {
      const file = await documentService.pickImage();
      if (file) {
        documentService.validateFileSize(file, 10);
        setSelectedFile(file);
      }
    } catch (error) {
      showToast.error('Error', error.message || 'Failed to pick image');
    }
  };

  const handleCapturePhoto = async () => {
    try {
      const file = await documentService.capturePhoto();
      if (file) {
        documentService.validateFileSize(file, 10);
        setSelectedFile(file);
      }
    } catch (error) {
      showToast.error('Error', error.message || 'Failed to capture photo');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast.error('Error', 'Please select a file first');
      return;
    }

    if (!documentType) {
      showToast.error('Error', 'Please select document type');
      return;
    }

    try {
      setUploading(true);
      const result = await documentService.uploadDocument(
        selectedFile,
        documentType,
        relatedId,
        relatedType
      );

      showToast.success('Success', 'Document uploaded successfully');
      setSelectedFile(null);
      setDocumentType(initialDocType || '');
      onUploadComplete?.(result);
    } catch (error) {
      showToast.error('Error', error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleChooseMethod = () => {
    Alert.alert(
      'Upload Document',
      'Choose upload method',
      [
        {
          text: 'Take Photo',
          onPress: handleCapturePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handlePickImage,
        },
        {
          text: 'Browse Files',
          onPress: handlePickDocument,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {!initialDocType && (
        <DocumentTypeSelector
          value={documentType}
          onChange={(item) => setDocumentType(item.value)}
          label="Document Type"
          required
        />
      )}

      {selectedFile ? (
        <View style={styles.selectedFileContainer}>
          <View style={styles.fileInfo}>
            <Ionicons name="document-attach" size={40} color={colors.primary} />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <Text style={styles.fileSize}>
                {((selectedFile.size || 0) / 1024).toFixed(2)} KB
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedFile(null)}>
              <Ionicons name="close-circle" size={24} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadArea} onPress={handleChooseMethod}>
          <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
          <Text style={styles.uploadText}>Tap to upload document</Text>
          <Text style={styles.uploadSubtext}>
            PDF, JPG, PNG, DOC, DOCX (Max 10MB)
          </Text>
        </TouchableOpacity>
      )}

      {selectedFile && (
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color={colors.white} />
              <Text style={styles.uploadButtonText}>Upload Document</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  uploadText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  uploadSubtext: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  selectedFileContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileDetails: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  fileName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  fileSize: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default DocumentUploader;
