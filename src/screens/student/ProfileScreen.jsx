// Student Profile Screen

import React, { useState, useEffect } from 'react';
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
import * as SecureStore from 'expo-secure-store';

import { getStudentById, updateStudent } from '../../api/studentApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';

const ProfileScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        country: '',
        address: '',
        passport_number: '',
        date_of_birth: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const studentId = await SecureStore.getItemAsync('student_id');
                if (studentId) {
                    const data = await getStudentById(studentId);
                    setFormData({
                        full_name: data.full_name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        country: data.country || '',
                        address: data.address || '',
                        passport_number: data.passport_number || '',
                        date_of_birth: data.date_of_birth || '',
                    });
                }
            } catch (error) {
                console.error('Fetch profile error:', error);
                showToast.error('Error', 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const studentId = await SecureStore.getItemAsync('student_id');
            if (studentId) {
                await updateStudent(studentId, formData);
                showToast.success('Success', 'Profile updated successfully');
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Update profile error:', error);
            showToast.error('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.safeArea}>
                {/* CustomHeader removed - using Stack Header */}
                <LoadingSpinner />
            </View>
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
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Profile Header */}
                    <View style={[styles.profileHeader, shadows.md]}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {formData.full_name?.charAt(0)?.toUpperCase() || 'S'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.profileName}>{formData.full_name}</Text>
                        <Text style={styles.profileEmail}>{formData.email}</Text>

                        {!isEditing && (
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => setIsEditing(true)}
                            >
                                <Ionicons name="pencil" size={16} color={colors.primary} />
                                <Text style={styles.editButtonText}>Edit Profile</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Form Card */}
                    <View style={[styles.formCard, shadows.md]}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>

                        <Input
                            label="Full Name"
                            value={formData.full_name}
                            onChangeText={(value) => handleChange('full_name', value)}
                            placeholder="Enter full name"
                            icon="person-outline"
                            editable={isEditing}
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
                            editable={isEditing}
                        />

                        <Input
                            label="Country"
                            value={formData.country}
                            onChangeText={(value) => handleChange('country', value)}
                            placeholder="Enter country"
                            icon="location-outline"
                            editable={isEditing}
                        />

                        <Input
                            label="Address"
                            value={formData.address}
                            onChangeText={(value) => handleChange('address', value)}
                            placeholder="Enter address"
                            icon="home-outline"
                            editable={isEditing}
                            multiline
                            numberOfLines={2}
                        />

                        <Input
                            label="Passport Number"
                            value={formData.passport_number}
                            onChangeText={(value) => handleChange('passport_number', value)}
                            placeholder="Enter passport number"
                            icon="card-outline"
                            editable={isEditing}
                        />

                        {isEditing && (
                            <View style={styles.buttonRow}>
                                <Button
                                    title="Cancel"
                                    variant="outline"
                                    onPress={() => setIsEditing(false)}
                                    style={styles.cancelButton}
                                />
                                <Button
                                    title="Save Changes"
                                    onPress={handleSave}
                                    loading={saving}
                                    style={styles.saveButton}
                                />
                            </View>
                        )}
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
    avatarContainer: {
        marginBottom: spacing.sm,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
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
    profileEmail: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginTop: 4,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        backgroundColor: `${colors.primary}10`,
        borderRadius: borderRadius.md,
    },
    editButtonText: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '500',
        marginLeft: spacing.xs,
    },
    formCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
    },
    cancelButton: {
        flex: 1,
        marginRight: spacing.sm,
    },
    saveButton: {
        flex: 1,
        marginLeft: spacing.sm,
    },
});

export default ProfileScreen;
