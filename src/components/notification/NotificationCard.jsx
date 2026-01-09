import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';
import { formatDateReadable } from '../../utils/formatting';

const NotificationCard = ({ notification, onPress, onDismiss }) => {
  const getTypeIcon = (type) => {
    const iconMap = {
      application: 'document-text-outline',
      followup: 'calendar-outline',
      message: 'mail-outline',
      payment: 'card-outline',
      document: 'document-attach-outline',
      system: 'alert-circle-outline',
    };
    return iconMap[type?.toLowerCase()] || 'notifications-outline';
  };

  const getTypeColor = (type) => {
    const colorMap = {
      application: colors.primary,
      followup: colors.warning,
      message: colors.success,
      payment: colors.danger,
      document: colors.secondary,
      system: colors.textSecondary,
    };
    return colorMap[type?.toLowerCase()] || colors.primary;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        !notification.is_read && styles.cardUnread
      ]} 
      onPress={() => onPress(notification)}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${getTypeColor(notification.type)}15` }]}>
          <Ionicons 
            name={getTypeIcon(notification.type)} 
            size={20} 
            color={getTypeColor(notification.type)} 
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.timestamp}>
            {formatDateReadable(notification.created_at)}
          </Text>
        </View>
        {!notification.is_read && <View style={styles.unreadDot} />}
      </View>

      {notification.message && (
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
      )}

      {notification.action_url && (
        <View style={styles.actionRow}>
          <Ionicons name="arrow-forward-outline" size={16} color={colors.primary} />
          <Text style={styles.actionText}>View Details</Text>
        </View>
      )}

      {onDismiss && (
        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={() => onDismiss(notification.id)}
        >
          <Ionicons name="close-outline" size={18} color={colors.textSecondary} />
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
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardUnread: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
    marginBottom: 2,
  },
  timestamp: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  message: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  dismissButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
  },
});

export default NotificationCard;
