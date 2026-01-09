// Add Branch Screen (Standardized Full Screen Layout)
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createBranch, updateBranch } from '../../api/branchApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { showToast } from '../../components/common/Toast';
import CustomHeader from '../../components/common/CustomHeader';
import { validateRequired, validateEmail } from '../../utils/validation';

const AddBranchScreen = ({ navigation, route }) => {
    // Check if we are in Edit mode (passed via params)
    const { branch, isEdit } = route.params || {};

    const [formData, setFormData] = useState({
        branch_name: '',
        branch_email: '',
        branch_phone: '',
        branch_address: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Populate form if editing
    useEffect(() => {
        if (isEdit && branch) {
            setFormData({
                branch_name: branch.branch_name || '',
                branch_email: branch.branch_email || '',
                branch_phone: branch.branch_phone || '',
                branch_address: branch.branch_address || '',
            });
        }
    }, [isEdit, branch]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!validateRequired(formData.branch_name)) {
            newErrors.branch_name = 'Branch name is required';
        }
        if (!validateRequired(formData.branch_email)) {
            newErrors.branch_email = 'Branch email is required';
        } else if (!validateEmail(formData.branch_email)) {
            newErrors.branch_email = 'Invalid email address';
        }
        if (!validateRequired(formData.branch_phone)) {
            newErrors.branch_phone = 'Phone number is required';
        }
        if (!validateRequired(formData.branch_address)) {
            newErrors.branch_address = 'Address is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);

        try {
            if (isEdit) {
                await updateBranch(branch.id, formData);
                showToast.success('Success', 'Branch updated successfully');
            } else {
                await createBranch(formData);
                showToast.success('Success', 'Branch created successfully');
            }
            navigation.goBack();
        } catch (error) {
            console.error('Submit branch error:', error);
            const message = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} branch`;
            showToast.error('Error', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Using standard navigation header if available via stack default, but here we custom render for consistency */}
            {/* Actually, screen options usually handle header. But for consistency with AddCounselor: */}
            {/* AddCounselor uses SafeAreaView and no custom header INSIDE the body typically if stack provides it. */}
            {/* But let's check AdminNavigator options. usually it has stack header. */}

            {/* We will let the Stack provide the header (title defined in navigator), or render it if stack header is hidden. */}
            {/* Let's assume we need to provide content. */}

            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={[styles.formCard, shadows.sm]}>
                            <Text style={styles.formTitle}>
                                {isEdit ? 'Edit Branch Details' : 'New Branch Details'}
                            </Text>

                            <Input
                                label="Branch Name"
                                value={formData.branch_name}
                                onChangeText={(value) => handleChange('branch_name', value)}
                                placeholder="Enter branch name"
                                icon="business-outline"
                                error={errors.branch_name}
                                required
                            />

                            <Input
                                label="Email"
                                value={formData.branch_email}
                                onChangeText={(value) => handleChange('branch_email', value)}
                                placeholder="Enter branch email"
                                type="email"
                                icon="mail-outline"
                                error={errors.branch_email}
                                required
                                autoCapitalize="none"
                            />

                            <Input
                                label="Phone"
                                value={formData.branch_phone}
                                onChangeText={(value) => handleChange('branch_phone', value)}
                                placeholder="Enter phone number"
                                type="phone"
                                icon="call-outline"
                                error={errors.branch_phone}
                                required
                            />

                            <Input
                                label="Address"
                                value={formData.branch_address}
                                onChangeText={(value) => handleChange('branch_address', value)}
                                placeholder="Enter branch address"
                                icon="location-outline"
                                error={errors.branch_address}
                                required
                                multiline
                                numberOfLines={3}
                                style={styles.textArea}
                            />

                            <Button
                                title={isEdit ? 'Update Branch' : 'Add Branch'}
                                onPress={handleSubmit}
                                loading={loading}
                                fullWidth
                                icon={isEdit ? "save-outline" : "add-circle-outline"}
                                style={styles.submitButton}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
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
    textArea: {
        minHeight: 80,
    },
    submitButton: {
        marginTop: spacing.md,
    },
});

export default AddBranchScreen;
