// Follow-Up Card Component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';

const FOLLOWUP_TYPE_ICONS = {
  call: { icon: 'call-outline', color: colors.success },
  email: { icon: 'mail-outline', color: colors.info },
  whatsapp: { icon: 'logo-whatsapp', color: '#25D366' },
  meeting: { icon: 'people-outline', color: colors.primary },
  visit: { icon: 'location-outline', color: colors.warning },
};

const FollowUpCard = ({ followUp, onPress, onMarkComplete }) => {
  const typeConfig = FOLLOWUP_TYPE_ICONS[followUp.type?.toLowerCase()] || FOLLOWUP_TYPE_ICONS.call;
  const isCompleted = followUp.status === 'completed';
  const isOverdue =
    !isCompleted &&
    followUp.scheduled_date &&
    new Date(followUp.scheduled_date) < new Date();

  return (
    <TouchableOpacity
      style={[styles.card, isCompleted && styles.cardCompleted]}
      onPress={() => onPress(followUp)}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${typeConfig.color}20` }]}>
          <Ionicons name={typeConfig.icon} size={24} color={typeConfig.color} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={1}>
            {followUp.type?.toUpperCase()} Follow-up
          </Text>

          {followUp.student_name && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {followUp.student_name}
            </Text>
          )}

          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isOverdue ? colors.danger : colors.textSecondary}
            />
            <Text style={[styles.date, isOverdue && styles.dateOverdue]}>
              {new Date(followUp.scheduled_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            {isOverdue && (
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueText}>Overdue</Text>
              </View>
            )}
          </View>

          {followUp.notes && (
            <Text style={styles.notes} numberOfLines={2}>
              {followUp.notes}
            </Text>
          )}
        </View>

        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onMarkComplete(followUp)}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
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
  cardCompleted: {
    opacity: 0.7,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  dateOverdue: {
    color: colors.danger,
    fontWeight: '600',
  },
  overdueBadge: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  overdueText: {
    fontSize: fontSizes.xs,
    color: colors.white,
    fontWeight: '600',
  },
  notes: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontStyle: 'italic',
  },
  completeButton: {
    padding: spacing.xs,
  },
  completedBadge: {
    padding: spacing.xs,
  },
});

export default FollowUpCard;
