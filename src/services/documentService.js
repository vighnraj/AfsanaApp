// Document Service - Upload, Download, Preview
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import apiClient from '../api/index';

class DocumentService {
  // Pick document from device
  async pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0];
    } catch (error) {
      console.error('Error picking document:', error);
      throw error;
    }
  }

  // Pick image from gallery
  async pickImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library denied');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0];
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  }

  // Capture photo using camera
  async capturePhoto() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera denied');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0];
    } catch (error) {
      console.error('Error capturing photo:', error);
      throw error;
    }
  }

  // Upload document to server
  async uploadDocument(file, documentType, relatedId, relatedType = 'inquiry') {
    try {
      const formData = new FormData();

      // Prepare file for upload
      const fileToUpload = {
        uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
        type: file.mimeType || 'application/octet-stream',
        name: file.name || `document_${Date.now()}.${this.getFileExtension(file.uri)}`,
      };

      formData.append('file', fileToUpload);
      formData.append('documentType', documentType);
      formData.append('relatedId', relatedId);
      formData.append('relatedType', relatedType);

      const response = await apiClient.post('/upload-inquiry-documents/' + relatedId, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Download document
  async downloadDocument(documentUrl, fileName) {
    try {
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResult = await FileSystem.downloadAsync(
        documentUrl,
        fileUri
      );

      if (downloadResult.status === 200) {
        return downloadResult.uri;
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  // Share document
  async shareDocument(documentUri, fileName) {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(documentUri, {
        mimeType: this.getMimeType(fileName),
        dialogTitle: `Share ${fileName}`,
        UTI: this.getUTI(fileName),
      });
    } catch (error) {
      console.error('Error sharing document:', error);
      throw error;
    }
  }

  // Get file extension
  getFileExtension(uri) {
    const parts = uri.split('.');
    return parts[parts.length - 1];
  }

  // Get MIME type
  getMimeType(fileName) {
    const extension = this.getFileExtension(fileName).toLowerCase();
    const mimeTypes = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  // Get UTI (for iOS)
  getUTI(fileName) {
    const extension = this.getFileExtension(fileName).toLowerCase();
    const utiMap = {
      pdf: 'com.adobe.pdf',
      jpg: 'public.jpeg',
      jpeg: 'public.jpeg',
      png: 'public.png',
      doc: 'com.microsoft.word.doc',
      docx: 'org.openxmlformats.wordprocessingml.document',
    };
    return utiMap[extension];
  }

  // Validate file size (max 10MB)
  validateFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }
    return true;
  }

  // Validate file type
  validateFileType(file, allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']) {
    const extension = this.getFileExtension(file.uri || file.name).toLowerCase();
    if (!allowedTypes.includes(extension)) {
      throw new Error(`File type .${extension} is not allowed`);
    }
    return true;
  }
}

export default new DocumentService();
