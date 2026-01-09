// Add Staff Screen

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createStaff } from '../../api/userApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { showToast } from '../../components/common/Toast';
import { validateEmail, validateRequired, validateMinLength } from '../../utils/validation';

const AddStaffScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!validateRequired(formData.full_name)) {
            newErrors.full_name = 'Full name is required';
        }

        if (!validateRequired(formData.email)) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!validateRequired(formData.password)) {
            newErrors.password = 'Password is required';
        } else if (!validateMinLength(formData.password, 6)) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);

        try {
            await createStaff({
                ...formData,
                role: 'staff',
            });
            showToast.success('Success', 'Staff member added successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Add staff error:', error);
            const message = error.response?.data?.message || 'Failed to add staff';
            showToast.error('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={[styles.formCard, shadows.lg]}>
                        <Text style={styles.formTitle}>Staff Information</Text>

                        <Input
                            label="Full Name"
                            value={formData.full_name}
                            onChangeText={(value) => handleChange('full_name', value)}
                            placeholder="Enter full name"
                            icon="person-outline"
                            error={errors.full_name}
                            required
                            autoCapitalize="words"
                        />

                        <Input
                            label="Email"
                            value={formData.email}
                            onChangeText={(value) => handleChange('email', value)}
                            placeholder="Enter email"
                            type="email"
                            icon="mail-outline"
                            error={errors.email}
                            required
                            autoCapitalize="none"
                        />

                        <Input
                            label="Phone"
                            value={formData.phone}
                            onChangeText={(value) => handleChange('phone', value)}
                            placeholder="Enter phone number"
                            type="phone"
                            icon="call-outline"
                        />

                        <Input
                            label="Password"
                            value={formData.password}
                            onChangeText={(value) => handleChange('password', value)}
                            placeholder="Create password"
                            type="password"
                            icon="lock-closed-outline"
                            error={errors.password}
                            required
                        />

                        <Text style={styles.note}>
                            Note: Staff permissions can be configured in Roles & Permissions after creation.
                        </Text>

                        <Button
                            title="Add Staff"
                            onPress={handleSubmit}
                            loading={loading}
                            fullWidth
                            icon="person-add-outline"
                            style={styles.submitButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.md,
    },
    formCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    formTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    note: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: spacing.md,
    },
    submitButton: {
        marginTop: spacing.sm,
    },
});

export default AddStaffScreen;
