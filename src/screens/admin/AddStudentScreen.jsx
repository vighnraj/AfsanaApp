import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../../components/common/CustomHeader';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { createStudent, updateStudent } from '../../api/studentApi';
import { getInquiries } from '../../api/leadApi'; // Using this for getting counselors/staff if needed
import { getCounselors } from '../../api/userApi';
import { showToast } from '../../components/common/Toast';
import FilterDropdown from '../../components/common/FilterDropdown';
import { COUNTRIES, LEAD_SOURCE_OPTIONS, BRANCH_OPTIONS } from '../../utils/constants';

const AddStudentScreen = ({ navigation, route }) => {
    const student = route?.params?.student;
    const isEditMode = !!student;

    const [loading, setLoading] = useState(false);
    const [counselors, setCounselors] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        country: 'UK',
        source: 'Whatsapp',
        branch: 'Dhaka',
        counselor_id: '',
    });

    useEffect(() => {
        fetchCounselors();
        // Pre-fill form in edit mode
        if (isEditMode && student) {
            setFormData({
                full_name: student.full_name || student.name || '',
                email: student.email || '',
                password: '', // Don't pre-fill password for security
                phone: student.phone || '',
                country: student.country || 'UK',
                source: student.source || 'Whatsapp',
                branch: student.branch || 'Dhaka',
                counselor_id: student.counselor_id || '',
            });
        }
    }, []);

    const fetchCounselors = async () => {
        try {
            const data = await getCounselors();
            const formatted = (data.data || data || []).map(c => ({
                value: c.id,
                label: c.full_name
            }));
            setCounselors(formatted);
        } catch (err) {
            console.error('Fetch counselors error:', err);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validate = () => {
        if (!formData.full_name || !formData.email) {
            showToast.error('Error', 'Full name and email are required');
            return false;
        }
        // Password required only for new students, optional in edit mode
        if (!isEditMode && !formData.password) {
            showToast.error('Error', 'Password is required');
            return false;
        }
        if (formData.password && formData.password.length < 6) {
            showToast.error('Error', 'Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            if (isEditMode) {
                // Edit Mode: Update existing student
                const updateData = {
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                    source: formData.source,
                    branch: formData.branch,
                    counselor_id: formData.counselor_id,
                };

                // Only include password if it's provided
                if (formData.password) {
                    updateData.password = formData.password;
                }

                await updateStudent(student.id, updateData);
                showToast.success('Success', 'Student updated successfully');
            } else {
                // Create Mode: Create new student
                const signupRes = await createStudent({
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password,
                    role: 'student'
                });

                const studentId = signupRes.data?.id || signupRes.user?.id || signupRes.student_id;

                if (studentId) {
                    // Step 2: Update Profile with more details
                    await updateStudent(studentId, {
                        phone: formData.phone,
                        country: formData.country,
                        source: formData.source,
                        branch: formData.branch,
                        counselor_id: formData.counselor_id,
                    });
                }

                showToast.success('Success', 'Student added successfully');
            }

            navigation.goBack();
        } catch (error) {
            console.error('Submit student error:', error);
            showToast.error('Error', error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} student`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeader title={isEditMode ? "Edit Student" : "Add New Student"} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChangeText={(val) => handleInputChange('full_name', val)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email Address *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="john@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.email}
                            onChangeText={(val) => handleInputChange('email', val)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{isEditMode ? 'Password (Leave blank to keep current)' : 'Password * (Min 6 chars)'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={isEditMode ? "Leave blank to keep current" : "••••••••"}
                            secureTextEntry
                            value={formData.password}
                            onChangeText={(val) => handleInputChange('password', val)}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile Details</Text>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+880..."
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={(val) => handleInputChange('phone', val)}
                        />
                    </View>

                    <FilterDropdown
                        label="Country of Interest"
                        value={formData.country}
                        options={COUNTRIES.map(c => ({ value: c, label: c }))}
                        onChange={(val) => handleInputChange('country', val)}
                    />

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <FilterDropdown
                                label="Source"
                                value={formData.source}
                                options={LEAD_SOURCE_OPTIONS.map(s => ({ value: s, label: s }))}
                                onChange={(val) => handleInputChange('source', val)}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FilterDropdown
                                label="Branch"
                                value={formData.branch}
                                options={BRANCH_OPTIONS.map(b => ({ value: b, label: b }))}
                                onChange={(val) => handleInputChange('branch', val)}
                            />
                        </View>
                    </View>

                    <FilterDropdown
                        label="Assign Counselor"
                        value={formData.counselor_id}
                        options={counselors}
                        onChange={(val) => handleInputChange('counselor_id', val)}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color={colors.white} /> : (
                        <>
                            <Ionicons name={isEditMode ? "checkmark" : "person-add"} size={20} color={colors.white} style={{ marginRight: 8 }} />
                            <Text style={styles.submitButtonText}>{isEditMode ? "Update Student Profile" : "Create Student Profile"}</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: spacing.md,
    },
    section: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
        ...shadows.sm,
    },
    sectionTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        paddingBottom: spacing.xs,
    },
    inputContainer: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: 15,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    submitButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});

export default AddStudentScreen;
