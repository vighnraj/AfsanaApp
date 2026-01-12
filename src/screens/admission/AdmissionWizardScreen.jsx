// AdmissionWizardScreen - 5-step admission application form

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import CustomHeader from '../../components/common/CustomHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import FilterDropdown from '../../components/common/FilterDropdown';
import DatePickerModal from '../../components/common/DatePickerModal';
import { showToast } from '../../components/common/Toast';
import api from '../../api';
import { validateEmail, validatePhone, validateNotFutureDate } from '../../utils/validation';

const STEPS = [
    { id: 1, title: 'Personal Info', icon: 'person' },
    { id: 2, title: 'Education', icon: 'school' },
    { id: 3, title: 'Program', icon: 'book' },
    { id: 4, title: 'Documents', icon: 'document-attach' },
    { id: 5, title: 'Declaration', icon: 'checkmark-circle' },
];

const GENDER_OPTIONS = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

const AdmissionWizardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        // Step 1: Personal Information
        fullName: user?.full_name || '',
        dob: '',
        gender: '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: '',
        fatherName: '',
        category: '',
        // Step 2: Educational Background
        highSchool: '',
        highSchoolYear: '',
        highSchoolGrade: '',
        undergraduate: '',
        certifications: '',
        // Step 3: Program Selection
        desiredProgram: '',
        preferredUniversity: '',
        startDate: '',
        // Step 5: Declaration
        terms: false,
    });

    // Documents
    const [documents, setDocuments] = useState({
        passport: [],
        academicRecords: [],
        visaDocuments: [],
    });

    // Errors
    const [errors, setErrors] = useState({});

    // Update form field
    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Pick document
    const pickDocument = async (category) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (!result.canceled && result.assets) {
                setDocuments(prev => ({
                    ...prev,
                    [category]: [...prev[category], ...result.assets],
                }));
            }
        } catch (error) {
            console.error('Error picking document:', error);
            showToast.error('Error', 'Failed to pick document');
        }
    };

    // Remove document
    const removeDocument = (category, index) => {
        setDocuments(prev => ({
            ...prev,
            [category]: prev[category].filter((_, i) => i !== index),
        }));
    };

    // Validate current step
    const validateStep = useCallback(() => {
        const newErrors = {};

        switch (currentStep) {
            case 1:
                if (!formData.fullName) newErrors.fullName = 'Full name is required';
                else if (formData.fullName.trim().length < 2) newErrors.fullName = 'Full name must be at least 2 characters';
                if (!formData.dob) newErrors.dob = 'Date of birth is required';
                else if (!validateNotFutureDate(formData.dob)) newErrors.dob = 'Date of birth cannot be in the future';
                if (!formData.gender) newErrors.gender = 'Gender is required';
                if (!formData.phone) newErrors.phone = 'Phone is required';
                else if (!validatePhone(formData.phone)) newErrors.phone = 'Please enter a valid phone number';
                if (!formData.email) newErrors.email = 'Email is required';
                else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
                if (!formData.address) newErrors.address = 'Address is required';
                if (!formData.fatherName) newErrors.fatherName = "Father's name is required";
                if (!formData.category) newErrors.category = 'Category is required';
                break;
            case 2:
                if (!formData.highSchool) newErrors.highSchool = 'High school is required';
                if (!formData.highSchoolYear) newErrors.highSchoolYear = 'Year is required';
                else if (!/^\d{4}$/.test(formData.highSchoolYear)) newErrors.highSchoolYear = 'Please enter a valid year (e.g., 2020)';
                else if (parseInt(formData.highSchoolYear) > new Date().getFullYear()) newErrors.highSchoolYear = 'Year cannot be in the future';
                if (!formData.highSchoolGrade) newErrors.highSchoolGrade = 'Grade is required';
                break;
            case 3:
                if (!formData.desiredProgram) newErrors.desiredProgram = 'Program is required';
                if (!formData.preferredUniversity) newErrors.preferredUniversity = 'University is required';
                if (!formData.startDate) newErrors.startDate = 'Start date is required';
                break;
            case 4:
                if (documents.passport.length === 0) newErrors.passport = 'Passport document is required';
                if (documents.academicRecords.length === 0) newErrors.academicRecords = 'Academic records are required';
                if (documents.visaDocuments.length === 0) newErrors.visaDocuments = 'Visa documents are required';
                break;
            case 5:
                if (!formData.terms) newErrors.terms = 'You must agree to the terms and conditions';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [currentStep, formData, documents]);

    // Go to next step
    const nextStep = () => {
        if (validateStep()) {
            if (currentStep < 5) {
                setCurrentStep(currentStep + 1);
            }
        } else {
            showToast.error('Validation Error', 'Please fill all required fields');
        }
    };

    // Go to previous step
    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateStep()) {
            showToast.error('Validation Error', 'Please agree to the terms and conditions');
            return;
        }

        setLoading(true);
        try {
            const formDataObj = new FormData();

            // Add form fields
            Object.keys(formData).forEach(key => {
                if (key !== 'terms') {
                    formDataObj.append(key, formData[key]);
                }
            });

            // Add documents
            Object.keys(documents).forEach(category => {
                documents[category].forEach((doc, index) => {
                    formDataObj.append(`${category}[${index}]`, {
                        uri: doc.uri,
                        name: doc.name,
                        type: doc.mimeType || 'application/octet-stream',
                    });
                });
            });

            // Add user ID
            formDataObj.append('student_id', user?.student_id || user?.id);

            await api.post('application', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            showToast.success('Success', 'Application submitted successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Error submitting application:', error);
            showToast.error('Error', error.response?.data?.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Render step indicator
    const renderStepIndicator = () => (
        <View style={styles.stepIndicator}>
            {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                    <TouchableOpacity
                        style={[
                            styles.stepCircle,
                            currentStep === step.id && styles.stepCircleActive,
                            currentStep > step.id && styles.stepCircleCompleted,
                        ]}
                        onPress={() => {
                            if (step.id < currentStep) setCurrentStep(step.id);
                        }}
                    >
                        <Ionicons
                            name={currentStep > step.id ? 'checkmark' : step.icon}
                            size={16}
                            color={currentStep >= step.id ? colors.white : colors.gray400}
                        />
                    </TouchableOpacity>
                    {index < STEPS.length - 1 && (
                        <View style={[
                            styles.stepLine,
                            currentStep > step.id && styles.stepLineCompleted,
                        ]} />
                    )}
                </React.Fragment>
            ))}
        </View>
    );

    // Render Step 1: Personal Information
    const renderStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Personal Information</Text>
            <Text style={styles.stepSubtitle}>Please provide your personal details</Text>

            <Input
                label="Full Name"
                value={formData.fullName}
                onChangeText={(value) => handleChange('fullName', value)}
                placeholder="Enter your full name"
                error={errors.fullName}
                required
                icon="person-outline"
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Input
                    label="Date of Birth"
                    value={formatDate(formData.dob)}
                    placeholder="Select date of birth"
                    error={errors.dob}
                    required
                    editable={false}
                    icon="calendar-outline"
                />
            </TouchableOpacity>

            <FilterDropdown
                label="Gender"
                options={GENDER_OPTIONS}
                selectedValue={formData.gender}
                onValueChange={(value) => handleChange('gender', value)}
                error={errors.gender}
                required
            />

            <Input
                label="Phone Number"
                value={formData.phone}
                onChangeText={(value) => handleChange('phone', value)}
                placeholder="Enter your phone number"
                error={errors.phone}
                required
                type="phone"
                icon="call-outline"
            />

            <Input
                label="Email"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                placeholder="Enter your email"
                error={errors.email}
                required
                type="email"
                icon="mail-outline"
            />

            <Input
                label="Residential Address"
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                placeholder="Enter your address"
                error={errors.address}
                required
                multiline
                numberOfLines={2}
                icon="location-outline"
            />

            <Input
                label="Father's Name"
                value={formData.fatherName}
                onChangeText={(value) => handleChange('fatherName', value)}
                placeholder="Enter father's name"
                error={errors.fatherName}
                required
                icon="people-outline"
            />

            <Input
                label="Category"
                value={formData.category}
                onChangeText={(value) => handleChange('category', value)}
                placeholder="e.g., General, OBC, SC, ST"
                error={errors.category}
                required
            />
        </View>
    );

    // Render Step 2: Educational Background
    const renderStep2 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Educational Background</Text>
            <Text style={styles.stepSubtitle}>Tell us about your education</Text>

            <Input
                label="High School Name"
                value={formData.highSchool}
                onChangeText={(value) => handleChange('highSchool', value)}
                placeholder="Enter high school name"
                error={errors.highSchool}
                required
                icon="school-outline"
            />

            <Input
                label="Year of Completion"
                value={formData.highSchoolYear}
                onChangeText={(value) => handleChange('highSchoolYear', value)}
                placeholder="e.g., 2020"
                error={errors.highSchoolYear}
                required
                type="number"
                icon="calendar-outline"
            />

            <Input
                label="Grade/GPA"
                value={formData.highSchoolGrade}
                onChangeText={(value) => handleChange('highSchoolGrade', value)}
                placeholder="e.g., A+, 4.0"
                error={errors.highSchoolGrade}
                required
                icon="ribbon-outline"
            />

            <Input
                label="Undergraduate (Optional)"
                value={formData.undergraduate}
                onChangeText={(value) => handleChange('undergraduate', value)}
                placeholder="Enter undergraduate details"
                icon="school-outline"
            />

            <Input
                label="Additional Certifications (Optional)"
                value={formData.certifications}
                onChangeText={(value) => handleChange('certifications', value)}
                placeholder="Enter any certifications"
                multiline
                numberOfLines={2}
                icon="document-text-outline"
            />
        </View>
    );

    // Render Step 3: Program Selection
    const renderStep3 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Program Selection</Text>
            <Text style={styles.stepSubtitle}>Choose your desired program</Text>

            <Input
                label="Desired Program"
                value={formData.desiredProgram}
                onChangeText={(value) => handleChange('desiredProgram', value)}
                placeholder="e.g., Computer Science, Medicine"
                error={errors.desiredProgram}
                required
                icon="book-outline"
            />

            <Input
                label="Preferred University"
                value={formData.preferredUniversity}
                onChangeText={(value) => handleChange('preferredUniversity', value)}
                placeholder="Enter preferred university"
                error={errors.preferredUniversity}
                required
                icon="business-outline"
            />

            <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                <Input
                    label="Preferred Start Date"
                    value={formatDate(formData.startDate)}
                    placeholder="Select start date"
                    error={errors.startDate}
                    required
                    editable={false}
                    icon="calendar-outline"
                />
            </TouchableOpacity>
        </View>
    );

    // Render document upload section
    const renderDocumentSection = (category, title, required = true) => (
        <View style={styles.documentSection}>
            <View style={styles.documentHeader}>
                <Text style={styles.documentTitle}>
                    {title} {required && <Text style={styles.required}>*</Text>}
                </Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => pickDocument(category)}
                >
                    <Ionicons name="add" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>

            {errors[category] && (
                <Text style={styles.errorText}>{errors[category]}</Text>
            )}

            {documents[category].length > 0 ? (
                <View style={styles.documentList}>
                    {documents[category].map((doc, index) => (
                        <View key={index} style={styles.documentItem}>
                            <Ionicons name="document" size={20} color={colors.primary} />
                            <Text style={styles.documentName} numberOfLines={1}>
                                {doc.name}
                            </Text>
                            <TouchableOpacity onPress={() => removeDocument(category, index)}>
                                <Ionicons name="close-circle" size={20} color={colors.danger} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={styles.noDocuments}>No documents uploaded</Text>
            )}
        </View>
    );

    // Render Step 4: Document Upload
    const renderStep4 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Document Upload</Text>
            <Text style={styles.stepSubtitle}>Upload required documents</Text>

            {renderDocumentSection('passport', 'Passport')}
            {renderDocumentSection('academicRecords', 'Academic Records')}
            {renderDocumentSection('visaDocuments', 'Visa Documents')}
        </View>
    );

    // Render Step 5: Declaration
    const renderStep5 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Declaration</Text>
            <Text style={styles.stepSubtitle}>Review and confirm your application</Text>

            <View style={[styles.summaryCard, shadows.sm]}>
                <Text style={styles.summaryTitle}>Application Summary</Text>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Full Name:</Text>
                    <Text style={styles.summaryValue}>{formData.fullName}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Email:</Text>
                    <Text style={styles.summaryValue}>{formData.email}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Phone:</Text>
                    <Text style={styles.summaryValue}>{formData.phone}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Program:</Text>
                    <Text style={styles.summaryValue}>{formData.desiredProgram}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>University:</Text>
                    <Text style={styles.summaryValue}>{formData.preferredUniversity}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Documents:</Text>
                    <Text style={styles.summaryValue}>
                        {documents.passport.length + documents.academicRecords.length + documents.visaDocuments.length} files
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => handleChange('terms', !formData.terms)}
            >
                <View style={[styles.checkbox, formData.terms && styles.checkboxChecked]}>
                    {formData.terms && (
                        <Ionicons name="checkmark" size={16} color={colors.white} />
                    )}
                </View>
                <Text style={styles.termsText}>
                    I agree to the terms and conditions and confirm that all the information provided is accurate.
                </Text>
            </TouchableOpacity>

            {errors.terms && (
                <Text style={styles.errorText}>{errors.terms}</Text>
            )}
        </View>
    );

    // Render current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            case 5: return renderStep5();
            default: return null;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <CustomHeader
                title="Admission Application"
                showBack={true}
                onBack={() => navigation.goBack()}
            />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {renderStepIndicator()}

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {renderStepContent()}
                </ScrollView>

                <View style={styles.footer}>
                    {currentStep > 1 && (
                        <Button
                            title="Previous"
                            onPress={prevStep}
                            variant="outline"
                            style={styles.footerButton}
                        />
                    )}

                    {currentStep < 5 ? (
                        <Button
                            title="Next"
                            onPress={nextStep}
                            style={[styles.footerButton, currentStep === 1 && styles.fullWidthButton]}
                            icon="arrow-forward"
                        />
                    ) : (
                        <Button
                            title="Submit Application"
                            onPress={handleSubmit}
                            loading={loading}
                            style={styles.footerButton}
                            icon="checkmark-circle"
                        />
                    )}
                </View>
            </KeyboardAvoidingView>

            {/* Date Picker for DOB */}
            <DatePickerModal
                visible={showDatePicker}
                date={formData.dob ? new Date(formData.dob) : new Date()}
                onConfirm={(date) => {
                    handleChange('dob', date.toISOString());
                    setShowDatePicker(false);
                }}
                onCancel={() => setShowDatePicker(false)}
                maximumDate={new Date()}
            />

            {/* Date Picker for Start Date */}
            <DatePickerModal
                visible={showStartDatePicker}
                date={formData.startDate ? new Date(formData.startDate) : new Date()}
                onConfirm={(date) => {
                    handleChange('startDate', date.toISOString());
                    setShowStartDatePicker(false);
                }}
                onCancel={() => setShowStartDatePicker(false)}
                minimumDate={new Date()}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCircleActive: {
        backgroundColor: colors.primary,
    },
    stepCircleCompleted: {
        backgroundColor: colors.success,
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: colors.gray200,
        marginHorizontal: spacing.xs,
    },
    stepLineCompleted: {
        backgroundColor: colors.success,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    stepContent: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    stepTitle: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    stepSubtitle: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    required: {
        color: colors.danger,
    },
    // Document section styles
    documentSection: {
        marginBottom: spacing.md,
    },
    documentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    documentTitle: {
        fontSize: fontSizes.md,
        fontWeight: '500',
        color: colors.gray700,
    },
    addButton: {
        backgroundColor: colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    documentList: {
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.sm,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.xs,
    },
    documentName: {
        flex: 1,
        fontSize: fontSizes.sm,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    noDocuments: {
        fontSize: fontSizes.sm,
        color: colors.gray500,
        textAlign: 'center',
        padding: spacing.md,
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
    },
    errorText: {
        fontSize: fontSizes.sm,
        color: colors.danger,
        marginTop: spacing.xs,
    },
    // Summary styles
    summaryCard: {
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    summaryTitle: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
    },
    summaryLabel: {
        fontSize: fontSizes.sm,
        color: colors.gray600,
        width: 100,
    },
    summaryValue: {
        flex: 1,
        fontSize: fontSizes.sm,
        color: colors.text,
        fontWeight: '500',
    },
    // Terms checkbox
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.gray300,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    termsText: {
        flex: 1,
        fontSize: fontSizes.sm,
        color: colors.gray700,
        lineHeight: 20,
    },
    // Footer
    footer: {
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
        gap: spacing.sm,
    },
    footerButton: {
        flex: 1,
    },
    fullWidthButton: {
        flex: 1,
    },
});

export default AdmissionWizardScreen;
