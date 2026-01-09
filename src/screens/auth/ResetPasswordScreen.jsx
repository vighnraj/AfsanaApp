// Reset Password Screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { resetPassword } from '../../api/authApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { showToast } from '../../components/common/Toast';
import { validateRequired, validateMinLength } from '../../utils/validation';

const ResetPasswordScreen = ({ navigation, route }) => {
    const token = route?.params?.token || '';

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!validateRequired(formData.password)) {
            newErrors.password = 'Password is required';
        } else if (!validateMinLength(formData.password, 6)) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!validateRequired(formData.confirmPassword)) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);

        try {
            await resetPassword(token, formData.password);
            setSuccess(true);
            showToast.success('Password Reset', 'Your password has been changed successfully');
        } catch (error) {
            console.error('Reset password error:', error);
            const message = error.response?.data?.message || 'Failed to reset password. Please try again.';
            showToast.error('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={success ? "checkmark-circle" : "lock-closed"}
                                size={48}
                                color={success ? colors.success : colors.primary}
                            />
                        </View>
                        <Text style={styles.title}>
                            {success ? 'Password Changed!' : 'Reset Password'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {success
                                ? 'Your password has been successfully reset. You can now login with your new password.'
                                : 'Create a new password for your account.'
                            }
                        </Text>
                    </View>

                    {/* Form or Success */}
                    {!success ? (
                        <View style={styles.form}>
                            <Input
                                label="New Password"
                                value={formData.password}
                                onChangeText={(value) => handleChange('password', value)}
                                placeholder="Enter new password"
                                type="password"
                                icon="lock-closed-outline"
                                error={errors.password}
                                required
                            />

                            <Input
                                label="Confirm New Password"
                                value={formData.confirmPassword}
                                onChangeText={(value) => handleChange('confirmPassword', value)}
                                placeholder="Confirm new password"
                                type="password"
                                icon="lock-closed-outline"
                                error={errors.confirmPassword}
                                required
                            />

                            <Button
                                title="Reset Password"
                                onPress={handleSubmit}
                                loading={loading}
                                fullWidth
                                icon="key-outline"
                                style={styles.submitButton}
                            />
                        </View>
                    ) : (
                        <View style={styles.successContainer}>
                            <Button
                                title="Go to Login"
                                onPress={() => navigation.navigate('Login')}
                                fullWidth
                                icon="log-in-outline"
                            />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.backgroundAlt,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
        ...shadows.sm,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        ...shadows.md,
    },
    title: {
        fontSize: fontSizes.h2,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.md,
        lineHeight: 22,
    },
    form: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.lg,
    },
    submitButton: {
        marginTop: spacing.sm,
    },
    successContainer: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.lg,
    },
});

export default ResetPasswordScreen;
