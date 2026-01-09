import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import { formatDateReadable } from '../../utils/formatting';

const FollowUpTimeline = ({ followups = [] }) => {
  if (followups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No follow-ups scheduled</Text>
      </View>
    );
  }

  const sortedFollowups = [...followups].sort((a, b) => 
    new Date(b.scheduled_date) - new Date(a.scheduled_date)
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {sortedFollowups.map((item, index) => {
        const isOverdue = new Date(item.scheduled_date) < new Date() && item.status !== 'completed';
        const isUpcoming = new Date(item.scheduled_date) > new Date();
        
        return (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View
                style={[
                  styles.iconContainer,
                  item.status === 'completed' && styles.iconContainerCompleted,
                  isOverdue && styles.iconContainerOverdue,
                  isUpcoming && styles.iconContainerUpcoming,
                ]}
              >
                <Ionicons
                  name={item.status === 'completed' ? 'checkmark-circle' : 'alarm-outline'}
                  size={20}
                  color={
                    item.status === 'completed'
                      ? colors.success
                      : isOverdue
                      ? colors.danger
                      : colors.primary
                  }
                />
              </View>
              {index !== sortedFollowups.length - 1 && <View style={styles.connector} />}
            </View>

            <View style={styles.timelineRight}>
              <View style={styles.headerRow}>
                <Text style={styles.followupType}>{item.type?.toUpperCase()}</Text>
                {isOverdue && (
                  <View style={styles.overdueBadge}>
                    <Text style={styles.overdueBadgeText}>OVERDUE</Text>
                  </View>
                )}
              </View>

              <Text style={styles.date}>
                {formatDateReadable(item.scheduled_date)}
              </Text>

              {item.student_name && (
                <Text style={styles.studentName}>{item.student_name}</Text>
              )}

              {item.notes && <Text style={styles.notes}>{item.notes}</Text>}

              {item.completed_date && item.status === 'completed' && (
                <Text style={styles.completedDate}>
                  Completed: {formatDateReadable(item.completed_date)}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  iconContainerOverdue: {
    backgroundColor: '#FFEBEE',
    borderColor: colors.danger,
  },
  iconContainerUpcoming: {
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  followupType: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  overdueBadge: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overdueBadgeText: {
    color: colors.white,
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  date: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  studentName: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  notes: {
    fontSize: fontSizes.sm,
    color: colors.text,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  completedDate: {
    fontSize: fontSizes.xs,
    color: colors.success,
    marginTop: spacing.xs,
  },
});

export default FollowUpTimeline;
