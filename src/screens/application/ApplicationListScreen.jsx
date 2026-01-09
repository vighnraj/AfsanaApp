// Application List Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import { CustomHeader, Loading } from '../../components/common';
import ApplicationCard from '../../components/application/ApplicationCard';
import { getApplications } from '../../api/applicationApi';
import { showToast } from '../../components/common/Toast';

const ApplicationListScreen = ({ navigation, route }) => {
  const { studentId, title = 'Applications' } = route.params || {};

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const filters = studentId ? { student_id: studentId } : {};
      const response = await getApplications(filters);
      setApplications(response?.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast.error('Error', 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  }, [studentId]);

  useEffect(() => {
    fetchApplications();
  }, [studentId]);

  const handleViewApplication = (application) => {
    navigation.navigate('ApplicationDetail', { applicationId: application.id, application });
  };

  const handleViewTimeline = (application) => {
    navigation.navigate('ApplicationTimeline', { applicationId: application.id });
  };

  const handleCreateApplication = () => {
    navigation.navigate('CreateApplication', { studentId });
  };

  const renderApplicationCard = ({ item }) => (
    <ApplicationCard
      application={item}
      onPress={handleViewApplication}
      onViewTimeline={handleViewTimeline}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyText}>No applications found</Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateApplication}>
        <Ionicons name="add-circle" size={20} color={colors.white} />
        <Text style={styles.createButtonText}>Create Application</Text>
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
        showBack={!!studentId}
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'add-circle-outline',
          onPress: handleCreateApplication,
        }}
      />

      <FlatList
        data={applications}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
  createButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default ApplicationListScreen;
