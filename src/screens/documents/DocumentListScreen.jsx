// Document List Screen
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import CustomHeader from '../../components/common/CustomHeader';
import Loading from '../../components/common/Loading';
import DocumentCard from '../../components/documents/DocumentCard';
import documentService from '../../services/documentService';
import { showToast } from '../../components/common/Toast';
import { getInquiryDocuments } from '../../api/leadApi';
import { getDocuments } from '../../api/studentApi';

const DocumentListScreen = ({ route, navigation }) => {
  const { relatedId, relatedType = 'inquiry', title = 'Documents' } = route.params || {};

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      let response;

      if (relatedType === 'inquiry' || relatedType === 'lead') {
        response = await getInquiryDocuments(relatedId);
      } else if (relatedType === 'student') {
        response = await getDocuments(relatedId);
      }

      setDocuments(response?.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      showToast.error('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  }, [relatedId]);

  useEffect(() => {
    fetchDocuments();
  }, [relatedId]);

  const handleViewDocument = (document) => {
    navigation.navigate('DocumentPreview', {
      document,
      uri: document.file_url || document.fileUrl,
      fileName: document.file_name || document.fileName,
    });
  };

  const handleDownloadDocument = async (document) => {
    try {
      showToast.info('Downloading', 'Download started...');
      const fileUri = await documentService.downloadDocument(
        document.file_url || document.fileUrl,
        document.file_name || document.fileName
      );
      await documentService.shareDocument(fileUri, document.file_name || document.fileName);
      showToast.success('Success', 'Document downloaded successfully');
    } catch (error) {
      showToast.error('Error', 'Failed to download document');
    }
  };

  const handleDeleteDocument = async (document) => {
    // Implement delete API call
    showToast.info('Info', 'Delete functionality coming soon');
  };

  const handleReuploadDocument = (document) => {
    navigation.navigate('DocumentUpload', {
      relatedId,
      relatedType,
      documentType: document.document_type,
      replacing: document,
    });
  };

  const handleAddDocument = () => {
    navigation.navigate('DocumentUpload', {
      relatedId,
      relatedType,
    });
  };

  const renderDocumentCard = ({ item }) => (
    <DocumentCard
      document={item}
      onView={handleViewDocument}
      onDownload={handleDownloadDocument}
      onDelete={handleDeleteDocument}
      onReupload={handleReuploadDocument}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No documents uploaded yet</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={handleAddDocument}>
        <Ionicons name="add-circle" size={20} color={colors.white} />
        <Text style={styles.uploadButtonText}>Upload Document</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <Loading type="overlay" visible={loading} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader
        title={title}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'add-circle-outline',
          onPress: handleAddDocument,
        }}
      />

      <FlatList
        data={documents}
        renderItem={renderDocumentCard}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default DocumentListScreen;
