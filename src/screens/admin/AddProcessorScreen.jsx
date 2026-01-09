// Add Processor Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createProcessor } from '../../api/userApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { Button, Input, CustomHeader } from '../../components/common';
import { showToast } from '../../components/common/Toast';
import { validateEmail, validateRequired, validateMinLength } from '../../utils/validation';

const AddProcessorScreen = ({ navigation }) => {
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
        if (!validateRequired(formData.full_name)) newErrors.full_name = 'Full name is required';
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
            await createProcessor({ ...formData, role: 'processor' });
            showToast.success('Success', 'Processor added successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Add processor error:', error);
            const message = error.response?.data?.message || 'Failed to add processor';
            showToast.error('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.safeArea}>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={[styles.formCard, shadows.lg]}>
                        <Text style={styles.formTitle}>Processor Information</Text>
                        <Input
                            label="Full Name"
                            value={formData.full_name}
                            onChangeText={(v) => handleChange('full_name', v)}
                            placeholder="Enter full name"
                            icon="person-outline"
                            error={errors.full_name}
                            required
                        />
                        <Input
                            label="Email"
                            value={formData.email}
                            onChangeText={(v) => handleChange('email', v)}
                            placeholder="Enter email"
                            type="email"
                            icon="mail-outline"
                            error={errors.email}
                            required
                        />
                        <Input
                            label="Phone"
                            value={formData.phone}
                            onChangeText={(v) => handleChange('phone', v)}
                            placeholder="Enter phone number"
                            type="phone"
                            icon="call-outline"
                        />
                        <Input
                            label="Password"
                            value={formData.password}
                            onChangeText={(v) => handleChange('password', v)}
                            placeholder="Create password"
                            type="password"
                            icon="lock-closed-outline"
                            error={errors.password}
                            required
                        />
                        <Button
                            title="Add Processor"
                            onPress={handleSubmit}
                            loading={loading}
                            fullWidth
                            icon="person-add-outline"
                            style={styles.submitButton}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md },
    formCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg },
    formTitle: { fontSize: fontSizes.lg, fontWeight: '600', color: colors.text, marginBottom: spacing.md },
    submitButton: { marginTop: spacing.sm },
});

export default AddProcessorScreen;
