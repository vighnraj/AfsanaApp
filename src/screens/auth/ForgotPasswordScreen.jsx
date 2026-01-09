// Forgot Password Screen

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

import { forgotPassword } from '../../api/authApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { showToast } from '../../components/common/Toast';
import { validateEmail, validateRequired } from '../../utils/validation';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const validate = () => {
        if (!validateRequired(email)) {
            setError('Email is required');
            return false;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);

        try {
            await forgotPassword(email);
            setSent(true);
            showToast.success('Email Sent', 'Check your inbox for password reset instructions');
        } catch (error) {
            console.error('Forgot password error:', error);
            const message = error.response?.data?.message || 'Failed to send reset email. Please try again.';
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
                                name={sent ? "checkmark-circle" : "key"}
                                size={48}
                                color={sent ? colors.success : colors.primary}
                            />
                        </View>
                        <Text style={styles.title}>
                            {sent ? 'Check Your Email' : 'Forgot Password?'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {sent
                                ? `We've sent password reset instructions to ${email}`
                                : "Don't worry! Enter your email and we'll send you reset instructions."
                            }
                        </Text>
                    </View>

                    {/* Form */}
                    {!sent ? (
                        <View style={styles.form}>
                            <Input
                                label="Email Address"
                                value={email}
                                onChangeText={(value) => {
                                    setEmail(value);
                                    if (error) setError('');
                                }}
                                placeholder="Enter your email"
                                type="email"
                                icon="mail-outline"
                                error={error}
                                required
                                autoCapitalize="none"
                            />

                            <Button
                                title="Send Reset Link"
                                onPress={handleSubmit}
                                loading={loading}
                                fullWidth
                                icon="send-outline"
                                style={styles.submitButton}
                            />
                        </View>
                    ) : (
                        <View style={styles.sentContainer}>
                            <Button
                                title="Open Email App"
                                onPress={() => {/* Open email app */ }}
                                fullWidth
                                icon="mail-open-outline"
                                style={styles.emailButton}
                            />

                            <Button
                                title="Resend Email"
                                onPress={handleSubmit}
                                variant="outline"
                                fullWidth
                                icon="refresh-outline"
                                loading={loading}
                                style={styles.resendButton}
                            />
                        </View>
                    )}

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.backToLogin}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Ionicons name="arrow-back" size={16} color={colors.primary} />
                            <Text style={styles.backToLoginText}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
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
        paddingHorizontal: spacing.lg,
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
    sentContainer: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.lg,
    },
    emailButton: {
        marginBottom: spacing.sm,
    },
    resendButton: {
        marginTop: spacing.xs,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    backToLogin: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backToLoginText: {
        fontSize: fontSizes.md,
        color: colors.primary,
        fontWeight: '500',
        marginLeft: spacing.xs,
    },
});

export default ForgotPasswordScreen;
