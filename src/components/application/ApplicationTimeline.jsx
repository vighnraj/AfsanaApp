// Application Timeline Component
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';

const TIMELINE_ICONS = {
  'Application Created': 'create-outline',
  'Documents Uploaded': 'document-attach-outline',
  'Application Submitted': 'send-outline',
  'Acknowledgment Received': 'mail-outline',
  'Under Review': 'eye-outline',
  'Interview Scheduled': 'calendar-outline',
  'Interview Completed': 'checkmark-outline',
  'Decision Received': 'ribbon-outline',
  'Offer Letter Issued': 'document-text-outline',
  'Student Acceptance': 'thumbs-up-outline',
  'Fee Payment': 'card-outline',
  'Enrollment Confirmed': 'school-outline',
};

const TimelineItem = ({ item, isLast }) => {
  const isCompleted = item.status === 'completed';
  const isInProgress = item.status === 'in_progress';

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.iconContainer,
            isCompleted && styles.iconContainerCompleted,
            isInProgress && styles.iconContainerInProgress,
          ]}
        >
          <Ionicons
            name={TIMELINE_ICONS[item.stage] || 'ellipse-outline'}
            size={20}
            color={
              isCompleted
                ? colors.success
                : isInProgress
                ? colors.primary
                : colors.textSecondary
            }
          />
        </View>
        {!isLast && <View style={styles.connector} />}
      </View>

      <View style={styles.timelineRight}>
        <Text
          style={[
            styles.stageName,
            isCompleted && styles.stageNameCompleted,
            isInProgress && styles.stageNameInProgress,
          ]}
        >
          {item.stage}
        </Text>

        {item.date && (
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        )}

        {item.notes && <Text style={styles.notes}>{item.notes}</Text>}

        {item.updated_by && (
          <Text style={styles.updatedBy}>Updated by: {item.updated_by}</Text>
        )}
      </View>
    </View>
  );
};

const ApplicationTimeline = ({ timeline = [] }) => {
  if (timeline.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="git-network-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No timeline data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {timeline.map((item, index) => (
        <TimelineItem key={index} item={item} isLast={index === timeline.length - 1} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingBottom: spacing.lg,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerCompleted: {
    backgroundColor: '#E8F5E9',
    borderColor: colors.success,
  },
  iconContainerInProgress: {
    backgroundColor: '#E3F2FD',
    borderColor: colors.primary,
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  timelineRight: {
    flex: 1,
  },
  stageName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  stageNameCompleted: {
    color: colors.success,
  },
  stageNameInProgress: {
    color: colors.primary,
  },
  date: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  notes: {
    fontSize: fontSizes.sm,
    color: colors.text,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  updatedBy: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default ApplicationTimeline;
