// KPI Card Component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { formatNumber } from '../../utils/formatting';

const Card = ({
    title,
    value,
    icon,
    iconColor,
    backgroundColor = colors.white,
    subtitle,
    trend, // { value: number, direction: 'up' | 'down' }
    style,
    variant = 'default', // 'default', 'gradient', 'outline'
}) => {
    const renderTrend = () => {
        if (!trend) return null;

        const isPositive = trend.direction === 'up';
        const trendColor = isPositive ? colors.success : colors.danger;
        const trendIcon = isPositive ? 'trending-up' : 'trending-down';

        return (
            <View style={styles.trendContainer}>
                <Ionicons name={trendIcon} size={14} color={trendColor} />
                <Text style={[styles.trendText, { color: trendColor }]}>
                    {trend.value}%
                </Text>
            </View>
        );
    };

    const cardStyles = [
        styles.container,
        { backgroundColor },
        variant === 'outline' && styles.outline,
        shadows.md,
        style,
    ];

    return (
        <View style={cardStyles}>
            {icon && (
                <View style={[styles.iconContainer, { backgroundColor: `${iconColor || colors.primary}20` }]}>
                    <Ionicons
                        name={icon}
                        size={24}
                        color={iconColor || colors.primary}
                    />
                </View>
            )}

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.value}>{typeof value === 'number' ? formatNumber(value) : value}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {renderTrend()}
        </View>
    );
};

// Simple Card Wrapper for general use
export const CardWrapper = ({ children, style, ...props }) => (
    <View style={[styles.wrapper, shadows.md, style]} {...props}>
        {children}
    </View>
);

// Header Card for sections
export const CardHeader = ({ title, subtitle, rightElement, style }) => (
    <View style={[styles.header, style]}>
        <View>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement}
    </View>
);

const styles = StyleSheet.create({
    container: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 80,
    },
    outline: {
        borderWidth: 1,
        borderColor: colors.gray200,
        backgroundColor: 'transparent',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    value: {
        fontSize: fontSizes.h3,
        fontWeight: '700',
        color: colors.text,
    },
    subtitle: {
        fontSize: fontSizes.xs,
        color: colors.textMuted,
        marginTop: 2,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray50,
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    trendText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
        marginLeft: 2,
    },
    wrapper: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        marginBottom: spacing.sm,
    },
    headerTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
});

export default Card;
