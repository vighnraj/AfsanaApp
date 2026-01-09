// Application Detail Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import { CustomHeader, Loading, Card } from '../../components/common';
import ApplicationStatusBadge from '../../components/application/ApplicationStatusBadge';
import { getApplicationById, updateApplicationStatus, deleteApplication } from '../../api/applicationApi';
import { showToast } from '../../components/common/Toast';

const ApplicationDetailScreen = ({ route, navigation }) => {
  const { applicationId, application: initialData } = route.params || {};

  const [application, setApplication] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (!initialData) {
      fetchApplicationDetails();
    }
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await getApplicationById(applicationId);
      setApplication(response?.data);
    } catch (error) {
      console.error('Error fetching application:', error);
      showToast.error('Error', 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    Alert.alert(
      'Update Status',
      `Change application status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              await updateApplicationStatus(applicationId, newStatus);
              setApplication((prev) => ({ ...prev, status: newStatus }));
              showToast.success('Success', 'Status updated successfully');
            } catch (error) {
              showToast.error('Error', 'Failed to update status');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Application',
      'Are you sure you want to delete this application? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteApplication(applicationId);
              showToast.success('Success', 'Application deleted');
              navigation.goBack();
            } catch (error) {
              showToast.error('Error', 'Failed to delete application');
            }
          },
        },
      ]
    );
  };

  const handleViewTimeline = () => {
    navigation.navigate('ApplicationTimeline', { applicationId });
  };

  if (loading) {
    return <Loading type="overlay" visible={loading} />;
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.container}>
        <CustomHeader title="Application" showBack onBack={() => navigation.goBack()} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Application not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const STATUS_OPTIONS = [
    { label: 'Pending', value: 'pending' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Under Review', value: 'under review' },
    { label: 'Offer Received', value: 'offer received' },
    { label: 'Conditional Offer', value: 'conditional offer' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Withdrawn', value: 'withdrawn' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader
        title="Application Details"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'trash-outline',
          onPress: handleDelete,
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* University Info Card */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="school" size={32} color={colors.primary} />
            <View style={styles.headerText}>
              <Text style={styles.universityName}>{application.university_name}</Text>
              <Text style={styles.programName}>{application.program_name}</Text>
            </View>
          </View>
          <ApplicationStatusBadge status={application.status} size="large" />
        </Card>

        {/* Student Info */}
        {application.student_name && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Student Information</Text>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{application.student_name}</Text>
            </View>
            {application.student_email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.infoText}>{application.student_email}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Application Details */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Application Details</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Submission Date:</Text>
            <Text style={styles.infoValue}>
              {new Date(application.submission_date).toLocaleDateString()}
            </Text>
          </View>

          {application.expected_decision_date && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Expected Decision:</Text>
              <Text style={styles.infoValue}>
                {new Date(application.expected_decision_date).toLocaleDateString()}
              </Text>
            </View>
          )}

          {application.application_id && (
            <View style={styles.infoRow}>
              <Ionicons name="key-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Application ID:</Text>
              <Text style={styles.infoValue}>{application.application_id}</Text>
            </View>
          )}
        </Card>

        {/* Status Update */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          {STATUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.statusOption,
                application.status === option.value && styles.statusOptionActive,
              ]}
              onPress={() => handleStatusChange(option.value)}
            >
              <Text
                style={[
                  styles.statusOptionText,
                  application.status === option.value && styles.statusOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
              {application.status === option.value && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewTimeline}>
            <Ionicons name="git-network-outline" size={24} color={colors.white} />
            <Text style={styles.actionButtonText}>View Timeline</Text>
          </TouchableOpacity>
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
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  universityName: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  programName: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  infoValue: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
    textAlign: 'right',
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  statusOptionActive: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.primary,
  },
  statusOptionText: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  statusOptionTextActive: {
    fontWeight: '600',
    color: colors.primary,
  },
  actions: {
    marginTop: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 8,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
  },
});

export default ApplicationDetailScreen;
