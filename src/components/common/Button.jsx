// Reusable Button Component

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes } from '../../context/ThemeContext';

const Button = ({
    title,
    onPress,
    variant = 'primary', // 'primary', 'secondary', 'outline', 'danger', 'success', 'ghost'
    size = 'md', // 'sm', 'md', 'lg'
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
    textStyle,
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return {
                    container: { backgroundColor: colors.secondary },
                    text: { color: colors.white },
                };
            case 'outline':
                return {
                    container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
                    text: { color: colors.primary },
                };
            case 'danger':
                return {
                    container: { backgroundColor: colors.danger },
                    text: { color: colors.white },
                };
            case 'success':
                return {
                    container: { backgroundColor: colors.success },
                    text: { color: colors.white },
                };
            case 'ghost':
                return {
                    container: { backgroundColor: 'transparent' },
                    text: { color: colors.primary },
                };
            default: // primary
                return {
                    container: { backgroundColor: colors.primary },
                    text: { color: colors.white },
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return {
                    container: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
                    text: { fontSize: fontSizes.sm },
                    iconSize: 14,
                };
            case 'lg':
                return {
                    container: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
                    text: { fontSize: fontSizes.lg },
                    iconSize: 22,
                };
            default: // md
                return {
                    container: { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.md },
                    text: { fontSize: fontSizes.md },
                    iconSize: 18,
                };
        }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    const containerStyles = [
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        variantStyles.text,
        sizeStyles.text,
        disabled && styles.disabledText,
        textStyle,
    ];

    const renderIcon = () => {
        if (!icon) return null;
        const iconColor = disabled ? colors.gray400 : variantStyles.text.color;
        return (
            <Ionicons
                name={icon}
                size={sizeStyles.iconSize}
                color={iconColor}
                style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
            />
        );
    };

    return (
        <TouchableOpacity
            style={containerStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={variantStyles.text.color}
                />
            ) : (
                <View style={styles.content}>
                    {iconPosition === 'left' && renderIcon()}
                    <Text style={textStyles}>{title}</Text>
                    {iconPosition === 'right' && renderIcon()}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        backgroundColor: colors.gray300,
        borderColor: colors.gray300,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
    },
    disabledText: {
        color: colors.gray500,
    },
    iconLeft: {
        marginRight: spacing.xs,
    },
    iconRight: {
        marginLeft: spacing.xs,
    },
});

export default Button;
