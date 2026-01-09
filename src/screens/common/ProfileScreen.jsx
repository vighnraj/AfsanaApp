// Common Profile Screen (shared across roles)

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
import * as SecureStore from 'expo-secure-store';

import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';

const ProfileScreen = ({ navigation }) => {
    const { user, role } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // API call to update profile here
            showToast.success('Success', 'Profile updated successfully');
        } catch (error) {
            showToast.error('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                {/* CustomHeader removed - using Stack Header */}
                <LoadingSpinner />
            </SafeAreaView>
        );
    }

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
                >
                    {/* Profile Header */}
                    <View style={[styles.profileHeader, shadows.md]}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {formData.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <Text style={styles.profileName}>{formData.full_name}</Text>
                        <Text style={styles.profileRole}>
                            {role?.charAt(0).toUpperCase() + role?.slice(1) || 'User'}
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={[styles.formCard, shadows.md]}>
                        <Input
                            label="Full Name"
                            value={formData.full_name}
                            onChangeText={(value) => handleChange('full_name', value)}
                            placeholder="Enter full name"
                            icon="person-outline"
                        />

                        <Input
                            label="Email"
                            value={formData.email}
                            onChangeText={(value) => handleChange('email', value)}
                            placeholder="Enter email"
                            type="email"
                            icon="mail-outline"
                            editable={false}
                        />

                        <Input
                            label="Phone"
                            value={formData.phone}
                            onChangeText={(value) => handleChange('phone', value)}
                            placeholder="Enter phone number"
                            type="phone"
                            icon="call-outline"
                        />

                        <Button
                            title="Save Changes"
                            onPress={handleSave}
                            loading={saving}
                            fullWidth
                            icon="checkmark-outline"
                            style={styles.saveButton}
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
        paddingBottom: spacing.xxl,
    },
    profileHeader: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    avatarText: {
        fontSize: fontSizes.h1,
        fontWeight: '700',
        color: colors.white,
    },
    profileName: {
        fontSize: fontSizes.h3,
        fontWeight: '700',
        color: colors.text,
    },
    profileRole: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginTop: 4,
    },
    formCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    saveButton: {
        marginTop: spacing.sm,
    },
});

export default ProfileScreen;
