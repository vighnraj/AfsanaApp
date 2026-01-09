// Document Card Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import DocumentStatusBadge from './DocumentStatusBadge';

const DocumentCard = ({ document, onView, onDownload, onDelete, onReupload }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return { name: 'document-text', color: colors.danger };
      case 'jpg':
      case 'jpeg':
      case 'png':
        return { name: 'image', color: colors.info };
      case 'doc':
      case 'docx':
        return { name: 'document', color: colors.primary };
      default:
        return { name: 'document-outline', color: colors.textSecondary };
    }
  };

  const fileIcon = getFileIcon(document.file_name || document.fileName);

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(document),
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={fileIcon.name} size={32} color={fileIcon.color} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.fileName} numberOfLines={1}>
            {document.file_name || document.fileName || 'Untitled'}
          </Text>
          <Text style={styles.fileType}>
            {document.document_type || document.documentType || 'Unknown'}
          </Text>
          {document.uploaded_at && (
            <Text style={styles.date}>
              {new Date(document.uploaded_at).toLocaleDateString()}
            </Text>
          )}
        </View>
        <DocumentStatusBadge
          status={document.status || 'uploaded'}
          size="small"
        />
      </View>

      {document.rejection_reason && (
        <View style={styles.rejectionContainer}>
          <Ionicons name="information-circle" size={16} color={colors.danger} />
          <Text style={styles.rejectionText}>{document.rejection_reason}</Text>
        </View>
      )}

      <View style={styles.actions}>
        {onView && (
          <TouchableOpacity style={styles.actionButton} onPress={() => onView(document)}>
            <Ionicons name="eye-outline" size={20} color={colors.primary} />
            <Text style={styles.actionText}>View</Text>
          </TouchableOpacity>
        )}

        {onDownload && (
          <TouchableOpacity style={styles.actionButton} onPress={() => onDownload(document)}>
            <Ionicons name="download-outline" size={20} color={colors.success} />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
        )}

        {onReupload && document.status === 'rejected' && (
          <TouchableOpacity style={styles.actionButton} onPress={() => onReupload(document)}>
            <Ionicons name="cloud-upload-outline" size={20} color={colors.warning} />
            <Text style={styles.actionText}>Re-upload</Text>
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  infoContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  fileType: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rejectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  rejectionText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.danger,
    marginLeft: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  actionText: {
    fontSize: fontSizes.sm,
    marginLeft: 4,
    color: colors.text,
  },
});

export default DocumentCard;
