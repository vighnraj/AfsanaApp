// Loading Component

import React from 'react';
import {
    View,
    ActivityIndicator,
    Text,
    StyleSheet,
    Modal,
} from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '../../context/ThemeContext';

// Inline Loading Spinner
export const LoadingSpinner = ({ size = 'large', color = colors.primary, style }) => (
    <View style={[styles.spinnerContainer, style]}>
        <ActivityIndicator size={size} color={color} />
    </View>
);

// Full Screen Loading Overlay
export const LoadingOverlay = ({ visible = true, message = 'Loading...' }) => {
    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    {message && <Text style={styles.message}>{message}</Text>}
                </View>
            </View>
        </Modal>
    );
};

// Loading State for Lists (Skeleton)
export const LoadingList = ({ count = 3 }) => (
    <View style={styles.listContainer}>
        {Array.from({ length: count }).map((_, index) => (
            <View key={index} style={styles.skeletonItem}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.skeletonContent}>
                    <View style={[styles.skeletonLine, { width: '60%' }]} />
                    <View style={[styles.skeletonLine, { width: '80%', marginTop: 8 }]} />
                </View>
            </View>
        ))}
    </View>
);

// Loading Card Skeleton
export const LoadingCard = () => (
    <View style={styles.cardSkeleton}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonContent}>
            <View style={[styles.skeletonLine, { width: '40%' }]} />
            <View style={[styles.skeletonLine, { width: '60%', height: 24, marginTop: 8 }]} />
        </View>
    </View>
);

// Default Loading Component
const Loading = ({
    type = 'spinner', // 'spinner', 'overlay', 'list', 'card'
    visible = true,
    message,
    count,
    size,
    color,
    style,
}) => {
    switch (type) {
        case 'overlay':
            return <LoadingOverlay visible={visible} message={message} />;
        case 'list':
            return <LoadingList count={count} />;
        case 'card':
            return <LoadingCard />;
        default:
            return <LoadingSpinner size={size} color={color} style={style} />;
    }
};

const styles = StyleSheet.create({
    spinnerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.white,
        padding: spacing.xl,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        minWidth: 150,
    },
    message: {
        marginTop: spacing.md,
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    listContainer: {
        padding: spacing.md,
    },
    skeletonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
    },
    skeletonAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.gray200,
    },
    skeletonContent: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    skeletonLine: {
        height: 12,
        backgroundColor: colors.gray200,
        borderRadius: borderRadius.sm,
    },
    cardSkeleton: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    skeletonIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.gray200,
        marginRight: spacing.sm,
    },
});

export default Loading;
