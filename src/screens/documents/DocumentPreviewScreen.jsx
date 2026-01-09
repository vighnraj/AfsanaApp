// Document Preview Screen
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import CustomHeader from '../../components/common/CustomHeader';
import DocumentPreview from '../../components/documents/DocumentPreview';
import documentService from '../../services/documentService';
import { showToast } from '../../components/common/Toast';

const DocumentPreviewScreen = ({ route, navigation }) => {
  const { document, uri, fileName } = route.params || {};

  const handleDownload = async () => {
    try {
      showToast.info('Downloading', 'Download started...');
      const fileUri = await documentService.downloadDocument(uri, fileName);
      await documentService.shareDocument(fileUri, fileName);
      showToast.success('Success', 'Document downloaded successfully');
    } catch (error) {
      showToast.error('Error', 'Failed to download document');
    }
  };

  const handleShare = async () => {
    try {
      const fileUri = await documentService.downloadDocument(uri, fileName);
      await documentService.shareDocument(fileUri, fileName);
    } catch (error) {
      showToast.error('Error', 'Failed to share document');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader
        title={fileName || 'Document Preview'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <DocumentPreview
        uri={uri}
        fileType={fileName?.split('.').pop()}
        style={styles.preview}
      />

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={24} color={colors.white} />
          <Text style={styles.actionText}>Download</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={colors.white} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  preview: {
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: spacing.md,
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  actionText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default DocumentPreviewScreen;
