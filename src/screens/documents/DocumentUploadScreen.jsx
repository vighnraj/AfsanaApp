// Document Upload Screen
import React from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import CustomHeader from '../../components/common/CustomHeader';
import DocumentUploader from '../../components/documents/DocumentUploader';

const DocumentUploadScreen = ({ route, navigation }) => {
  const { relatedId, relatedType = 'inquiry', documentType, replacing } = route.params || {};

  const handleUploadComplete = (result) => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader
        title={replacing ? 'Re-upload Document' : 'Upload Document'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {replacing && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              You are re-uploading: {replacing.document_type}
            </Text>
            {replacing.rejection_reason && (
              <Text style={styles.rejectionText}>
                Rejection reason: {replacing.rejection_reason}
              </Text>
            )}
          </View>
        )}

        <DocumentUploader
          relatedId={relatedId}
          relatedType={relatedType}
          documentType={documentType}
          onUploadComplete={handleUploadComplete}
        />

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Upload Instructions:</Text>
          <Text style={styles.instructionItem}>• Maximum file size: 10MB</Text>
          <Text style={styles.instructionItem}>
            • Supported formats: PDF, JPG, PNG, DOC, DOCX
          </Text>
          <Text style={styles.instructionItem}>
            • Ensure documents are clear and readable
          </Text>
          <Text style={styles.instructionItem}>
            • All pages of multi-page documents must be included
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '600',
  },
  rejectionText: {
    fontSize: fontSizes.sm,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  instructionsContainer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  instructionItem: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
});

export default DocumentUploadScreen;
