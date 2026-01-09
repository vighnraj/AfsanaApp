// Application Card Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import ApplicationStatusBadge from './ApplicationStatusBadge';

const ApplicationCard = ({ application, onPress, onViewTimeline }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(application)}>
      <View style={styles.header}>
        <View style={styles.universityInfo}>
          <Ionicons name="school-outline" size={24} color={colors.primary} />
          <View style={styles.textContainer}>
            <Text style={styles.universityName} numberOfLines={1}>
              {application.university_name}
            </Text>
            <Text style={styles.program} numberOfLines={1}>
              {application.program_name}
            </Text>
          </View>
        </View>
        <ApplicationStatusBadge status={application.status} size="small" />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>
            Applied: {new Date(application.submission_date).toLocaleDateString()}
          </Text>
        </View>

        {application.expected_decision_date && (
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>
              Decision: {new Date(application.expected_decision_date).toLocaleDateString()}
            </Text>
          </View>
        )}

        {application.student_name && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText}>{application.student_name}</Text>
          </View>
        )}
      </View>

      {onViewTimeline && (
        <TouchableOpacity
          style={styles.timelineButton}
          onPress={() => onViewTimeline(application)}
        >
          <Ionicons name="git-network-outline" size={16} color={colors.primary} />
          <Text style={styles.timelineText}>View Timeline</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  universityInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  universityName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  program: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  details: {
    marginTop: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  timelineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timelineText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default ApplicationCard;
