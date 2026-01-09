// Toast Notification Component

import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { colors, spacing, borderRadius, fontSizes } from '../../context/ThemeContext';

// Custom toast config
export const toastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: colors.success,
                backgroundColor: colors.white,
                borderRadius: borderRadius.md,
                height: 60,
                paddingHorizontal: spacing.md,
            }}
            contentContainerStyle={{ paddingHorizontal: spacing.sm }}
            text1Style={{
                fontSize: fontSizes.md,
                fontWeight: '600',
                color: colors.text,
            }}
            text2Style={{
                fontSize: fontSizes.sm,
                color: colors.textSecondary,
            }}
        />
    ),
    error: (props) => (
        <ErrorToast
            {...props}
            style={{
                borderLeftColor: colors.danger,
                backgroundColor: colors.white,
                borderRadius: borderRadius.md,
                height: 60,
                paddingHorizontal: spacing.md,
            }}
            contentContainerStyle={{ paddingHorizontal: spacing.sm }}
            text1Style={{
                fontSize: fontSizes.md,
                fontWeight: '600',
                color: colors.text,
            }}
            text2Style={{
                fontSize: fontSizes.sm,
                color: colors.textSecondary,
            }}
        />
    ),
    info: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: colors.info,
                backgroundColor: colors.white,
                borderRadius: borderRadius.md,
                height: 60,
                paddingHorizontal: spacing.md,
            }}
            contentContainerStyle={{ paddingHorizontal: spacing.sm }}
            text1Style={{
                fontSize: fontSizes.md,
                fontWeight: '600',
                color: colors.text,
            }}
            text2Style={{
                fontSize: fontSizes.sm,
                color: colors.textSecondary,
            }}
        />
    ),
    warning: (props) => (
        <BaseToast
            {...props}
            style={{
                borderLeftColor: colors.warning,
                backgroundColor: colors.white,
                borderRadius: borderRadius.md,
                height: 60,
                paddingHorizontal: spacing.md,
            }}
            contentContainerStyle={{ paddingHorizontal: spacing.sm }}
            text1Style={{
                fontSize: fontSizes.md,
                fontWeight: '600',
                color: colors.text,
            }}
            text2Style={{
                fontSize: fontSizes.sm,
                color: colors.textSecondary,
            }}
        />
    ),
};

// Helper functions to show toast
export const showToast = {
    success: (message, description = '') => {
        Toast.show({
            type: 'success',
            text1: message,
            text2: description,
            position: 'top',
            visibilityTime: 3000,
        });
    },
    error: (message, description = '') => {
        Toast.show({
            type: 'error',
            text1: message,
            text2: description,
            position: 'top',
            visibilityTime: 4000,
        });
    },
    info: (message, description = '') => {
        Toast.show({
            type: 'info',
            text1: message,
            text2: description,
            position: 'top',
            visibilityTime: 3000,
        });
    },
    warning: (message, description = '') => {
        Toast.show({
            type: 'warning',
            text1: message,
            text2: description,
            position: 'top',
            visibilityTime: 3500,
        });
    },
};

export default Toast;
