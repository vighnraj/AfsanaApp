// Document Preview Component
import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Image } from 'react-native';
import Pdf from 'react-native-pdf';
import { WebView } from 'react-native-webview';
import { colors } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const DocumentPreview = ({ uri, fileType, style }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getFileType = () => {
    if (fileType) return fileType.toLowerCase();

    const extension = uri?.split('.').pop()?.toLowerCase();
    return extension;
  };

  const type = getFileType();

  // Render PDF
  if (type === 'pdf') {
    return (
      <View style={[styles.container, style]}>
        <Pdf
          source={{ uri }}
          onLoadComplete={() => setLoading(false)}
          onError={(error) => {
            console.error('PDF Error:', error);
            setError(true);
            setLoading(false);
          }}
          style={styles.pdf}
          trustAllCerts={false}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    );
  }

  // Render Image
  if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
    return (
      <View style={[styles.container, style]}>
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    );
  }

  // Render DOC/DOCX using WebView (Google Docs Viewer)
  if (['doc', 'docx'].includes(type)) {
    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri)}`;

    return (
      <View style={[styles.container, style]}>
        <WebView
          source={{ uri: googleDocsUrl }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          style={styles.webview}
        />
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    );
  }

  // Fallback for unknown types
  return (
    <View style={[styles.container, styles.fallbackContainer, style]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pdf: {
    flex: 1,
    width,
    height,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DocumentPreview;
