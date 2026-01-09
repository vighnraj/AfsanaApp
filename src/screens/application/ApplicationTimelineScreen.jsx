// Application Timeline Screen
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../context/ThemeContext';
import { CustomHeader, Loading } from '../../components/common';
import ApplicationTimeline from '../../components/application/ApplicationTimeline';
import { getApplicationTimeline } from '../../api/applicationApi';
import { showToast } from '../../components/common/Toast';

const ApplicationTimelineScreen = ({ route, navigation }) => {
  const { applicationId } = route.params || {};

  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [applicationId]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await getApplicationTimeline(applicationId);
      setTimeline(response?.data || []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      showToast.error('Error', 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading type="overlay" visible={loading} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader
        title="Application Timeline"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        <ApplicationTimeline timeline={timeline} />
      </View>
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
    padding: spacing.md,
  },
});

export default ApplicationTimelineScreen;
