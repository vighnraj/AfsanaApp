// Application Status Badge Component
import React from 'react';
import { View, Text, StyleSheet } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../../context/ThemeContext';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: colors.warning,
    icon: 'time-outline',
    bgColor: '#FFF3E0',
  },
  submitted: {
    label: 'Submitted',
    color: colors.info,
    icon: 'send-outline',
    bgColor: '#E3F2FD',
  },
  'under review': {
    label: 'Under Review',
    color: '#FF9800',
    icon: 'eye-outline',
    bgColor: '#FFF3E0',
  },
  'offer received': {
    label: 'Offer Received',
    color: colors.success,
    icon: 'mail-outline',
    bgColor: '#E8F5E9',
  },
  'conditional offer': {
    label: 'Conditional Offer',
    color: '#FF9800',
    icon: 'document-text-outline',
    bgColor: '#FFF3E0',
  },
  accepted: {
    label: 'Accepted',
    color: colors.success,
    icon: 'checkmark-circle-outline',
    bgColor: '#E8F5E9',
  },
  rejected: {
    label: 'Rejected',
    color: colors.danger,
    icon: 'close-circle-outline',
    bgColor: '#FFEBEE',
  },
  withdrawn: {
    label: 'Withdrawn',
    color: colors.textSecondary,
    icon: 'exit-outline',
    bgColor: '#F5F5F5',
  },
};

const ApplicationStatusBadge = ({ status, showIcon = true, size = 'medium' }) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;

  const sizeStyles = {
    small: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: fontSizes.xs,
      iconSize: 12,
    },
    medium: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      fontSize: fontSizes.sm,
      iconSize: 14,
    },
    large: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: fontSizes.md,
      iconSize: 16,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon}
          size={currentSize.iconSize}
          color={config.color}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontSize: currentSize.fontSize,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },
});

export default ApplicationStatusBadge;
