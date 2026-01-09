// Reusable Input Component

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes } from '../../context/ThemeContext';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    type = 'text', // 'text', 'email', 'password', 'phone', 'number'
    icon,
    secureTextEntry,
    multiline = false,
    numberOfLines = 1,
    editable = true,
    required = false,
    style,
    inputStyle,
    containerStyle,
    maxLength,
    autoCapitalize = 'none',
    onBlur,
    onFocus,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password' || secureTextEntry;
    const isSecure = isPassword && !showPassword;

    const getKeyboardType = () => {
        switch (type) {
            case 'email':
                return 'email-address';
            case 'phone':
                return 'phone-pad';
            case 'number':
                return 'numeric';
            default:
                return 'default';
        }
    };

    const handleFocus = (e) => {
        setIsFocused(true);
        onFocus && onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        onBlur && onBlur(e);
    };

    const containerStyles = [
        styles.container,
        isFocused && styles.focused,
        error && styles.error,
        !editable && styles.disabled,
        containerStyle,
    ];

    return (
        <View style={[styles.wrapper, style]}>
            {label && (
                <Text style={styles.label}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                </Text>
            )}

            <View style={containerStyles}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={18}
                        color={isFocused ? colors.primary : colors.gray400}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={[
                        styles.input,
                        icon && styles.inputWithIcon,
                        isPassword && styles.inputWithPassword,
                        multiline && { height: numberOfLines * 24, textAlignVertical: 'top' },
                        inputStyle,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.gray400}
                    secureTextEntry={isSecure}
                    keyboardType={getKeyboardType()}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    maxLength={maxLength}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.gray500}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSizes.md,
        fontWeight: '500',
        color: colors.gray700,
        marginBottom: spacing.xs,
    },
    required: {
        color: colors.danger,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.sm,
    },
    focused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    error: {
        borderColor: colors.danger,
    },
    disabled: {
        backgroundColor: colors.gray100,
    },
    icon: {
        marginRight: spacing.xs,
    },
    input: {
        flex: 1,
        height: 44,
        fontSize: fontSizes.md,
        color: colors.text,
    },
    inputWithIcon: {
        paddingLeft: 0,
    },
    inputWithPassword: {
        paddingRight: 40,
    },
    eyeButton: {
        padding: spacing.xs,
        position: 'absolute',
        right: spacing.sm,
    },
    errorText: {
        fontSize: fontSizes.sm,
        color: colors.danger,
        marginTop: spacing.xs,
    },
});

export default Input;
