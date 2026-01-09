// Admin Add Lead Screen
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { createInquiry, getBranches, updateLead, updateInquiryDetails, checkPhoneExists, convertToLead } from '../../api/leadApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/Loading';
import { COUNTRIES, EDUCATION_LEVEL_OPTIONS, TEST_TYPE_OPTIONS, INTAKE_OPTIONS, LEAD_SOURCE_OPTIONS, INQUIRY_TYPE_OPTIONS } from '../../utils/constants';
import FilterDropdown from '../../components/common/FilterDropdown';

const AddLeadScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const editLead = route.params?.lead; // Get lead to edit
    const isEditMode = !!editLead;

    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [phoneError, setPhoneError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        // Inquiry Info
        inquiry_type: 'student_visa',
        source: 'Whatsapp',
        branch: '',
        assignee: '', // counselor_id
        priority: 'Medium',

        // Personal Info
        full_name: '',
        email: '',
        phone_number: '',
        country: '',
        city: '',
        date_of_birth: new Date(),
        gender: 'male',
        address: '',
        present_address: '',

        // Education
        highest_level: '',
        education: [], // Array of { level, institute, board, year, gpa }

        // English Proficiency
        test_type: '',
        overall_score: '',
        reading_score: '',
        writing_score: '',
        speaking_score: '',
        listening_score: '',

        // Study Preferences
        course_name: '',
        study_level: '',
        study_field: '',
        intake: '',
        budget: '',
        preferred_countries: [],

        // Work & Visa History
        company_name: '',
        job_title: '',
        job_duration: '',
        study_gap: '',
        visa_refused: 'No',
        refusal_reason: '',

        // Additional
        additional_notes: '',
    });

    // Education rows state (mirrors web's local logic)
    const [educationRows, setEducationRows] = useState([]);

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        const loadDependencies = async () => {
            try {
                const branchData = await getBranches();
                setBranches(Array.isArray(branchData) ? branchData : []);

                if (isEditMode) {
                    // Extract education if available
                    let initialEdu = [];
                    try {
                        initialEdu = typeof editLead.education_background === 'string'
                            ? JSON.parse(editLead.education_background)
                            : (editLead.education_background || []);
                    } catch (e) { initialEdu = []; }

                    setFormData({
                        inquiry_type: editLead.inquiry_type || 'student_visa',
                        source: editLead.source || 'Whatsapp',
                        branch: editLead.branch || '',
                        assignee: editLead.counselor_id || '',
                        priority: editLead.priority || 'Medium',
                        full_name: editLead.name || editLead.full_name || '',
                        email: editLead.email || '',
                        phone_number: editLead.phone || editLead.phone_number || '',
                        country: editLead.country || '',
                        city: editLead.city || '',
                        date_of_birth: editLead.date_of_birth ? new Date(editLead.date_of_birth) : new Date(),
                        gender: editLead.gender || 'male',
                        address: editLead.address || '',
                        present_address: editLead.present_address || '',
                        highest_level: editLead.highest_level || '',
                        education: initialEdu,
                        test_type: editLead.test_type || '',
                        overall_score: editLead.overall_score?.toString() || '',
                        reading_score: editLead.reading_score?.toString() || '',
                        writing_score: editLead.writing_score?.toString() || '',
                        speaking_score: editLead.speaking_score?.toString() || '',
                        listening_score: editLead.listening_score?.toString() || '',
                        course_name: editLead.course_name || '',
                        study_level: editLead.study_level || '',
                        study_field: editLead.study_field || '',
                        intake: editLead.intake || '',
                        budget: editLead.budget?.toString() || '',
                        preferred_countries: editLead.preferred_countries || [],
                        company_name: editLead.company_name || '',
                        job_title: editLead.job_title || '',
                        job_duration: editLead.job_duration || '',
                        study_gap: editLead.study_gap || '',
                        visa_refused: editLead.visa_refused || 'No',
                        refusal_reason: editLead.refusal_reason || '',
                        additional_notes: editLead.additional_notes || '',
                    });
                    setEducationRows(initialEdu);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                showToast.error('Error', 'Failed to load form data');
            } finally {
                setInitLoading(false);
            }
        };

        loadDependencies();
    }, [editLead]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            handleInputChange('date_of_birth', selectedDate);
        }
    };

    const handleHighestLevelChange = (level) => {
        handleInputChange('highest_level', level);

        // Reset and pre-fill rows based on web logic
        let newRows = [];
        if (level === 'master') {
            newRows = [
                { level: 'master', institute: '', board: '', year: '', gpa: '' },
                { level: 'bachelor', institute: '', board: '', year: '', gpa: '' },
                { level: 'hsc', institute: '', board: '', year: '', gpa: '' },
                { level: 'ssc', institute: '', board: '', year: '', gpa: '' },
            ];
        } else if (level === 'bachelor') {
            newRows = [
                { level: 'bachelor', institute: '', board: '', year: '', gpa: '' },
                { level: 'hsc', institute: '', board: '', year: '', gpa: '' },
                { level: 'ssc', institute: '', board: '', year: '', gpa: '' },
            ];
        } else if (level === 'hsc') {
            newRows = [
                { level: 'hsc', institute: '', board: '', year: '', gpa: '' },
                { level: 'ssc', institute: '', board: '', year: '', gpa: '' },
            ];
        } else if (level === 'ssc') {
            newRows = [
                { level: 'ssc', institute: '', board: '', year: '', gpa: '' },
            ];
        }
        setEducationRows(newRows);
    };

    const updateEduRow = (index, field, value) => {
        const updated = [...educationRows];
        updated[index][field] = value;
        setEducationRows(updated);
        handleInputChange('education', updated);
    };

    // Phone validation handler
    const handlePhoneBlur = async () => {
        const phoneNumber = formData.phone_number;
        if (!phoneNumber || phoneNumber.length < 10) {
            setPhoneError('');
            return;
        }

        // Skip validation in edit mode if phone hasn't changed
        if (isEditMode && editLead?.phone_number === phoneNumber) {
            setPhoneError('');
            return;
        }

        try {
            const result = await checkPhoneExists(phoneNumber);
            if (result.exists) {
                setPhoneError('This phone number already exists');
                Alert.alert('Duplicate Phone', 'This phone number is already registered in the system.');
            } else {
                setPhoneError('');
            }
        } catch (error) {
            console.error('Phone validation failed:', error);
            // Don't show error to user if validation check fails
            setPhoneError('');
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.full_name || !formData.phone_number || !formData.email || !formData.branch) {
            Alert.alert('Missing Fields', 'Please fill all required fields: Name, Phone, Email, Branch');
            return;
        }

        // Education validation - if a row has a level, it must have other fields filled (matching web)
        const isEduValid = educationRows.every(row =>
            !row.level || (row.institute && row.board && row.year && row.gpa)
        );
        if (!isEduValid) {
            Alert.alert('Incomplete Education', 'Please fill all fields for the added education levels.');
            return;
        }

        setLoading(true);
        try {
            // Construct payload matching EXACT web frontend structure
            const payload = {
                ...formData,
                counselor_id: user?.id || 1,
                date_of_birth: formData.date_of_birth.toISOString().split('T')[0],
                education_background: educationRows,
                english_proficiency: [], // Optional field in web, initialized empty
                lead_status: isEditMode ? editLead.lead_status : "Converted to Lead",
                date_of_inquiry: new Date().toISOString().split('T')[0],
            };

            // Mapping for backend if needed
            payload.phone_number = formData.phone_number;
            payload.name = formData.full_name;

            console.log('Submitting enriched payload:', payload);

            if (isEditMode) {
                await updateInquiryDetails(editLead.id, payload);
                showToast.success('Success', 'Lead updated successfully');
            } else {
                const response = await createInquiry(payload);
                if (response && (response.inquiryId || response.id)) {
                    const inquiryId = response.inquiryId || response.id;
                    // Converting immediately as per web behavior - using correct endpoint
                    try {
                        await convertToLead(inquiryId);
                    } catch (e) {
                        console.warn('Lead conversion skipped', e);
                    }
                    showToast.success('Success', 'Lead created successfully');
                } else {
                    throw new Error('Failed to create lead');
                }
            }

            navigation.goBack();
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} lead. Please check details and try again.`);
        } finally {
            setLoading(false);
        }
    };

    if (initLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <LoadingSpinner />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? 'Edit Lead' : 'Add New Lead'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* 1. Inquiry Details */}
                <Text style={styles.sectionTitle}>Inquiry Context</Text>
                <View style={styles.card}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Branch *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                            {branches.map((branch) => (
                                <TouchableOpacity
                                    key={branch.id || branch.branch_name}
                                    style={[styles.chip, formData.branch === branch.branch_name && styles.chipActive]}
                                    onPress={() => handleInputChange('branch', branch.branch_name)}
                                >
                                    <Text style={[styles.chipText, formData.branch === branch.branch_name && styles.chipTextActive]}>
                                        {branch.branch_name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <FilterDropdown
                                label="Inquiry Type"
                                value={formData.inquiry_type}
                                options={INQUIRY_TYPE_OPTIONS}
                                onChange={(val) => handleInputChange('inquiry_type', val)}
                            />
                        </View>
                        <View style={styles.col}>
                            <FilterDropdown
                                label="Source"
                                value={formData.source}
                                options={LEAD_SOURCE_OPTIONS}
                                onChange={(val) => handleInputChange('source', val)}
                            />
                        </View>
                    </View>

                    <FilterDropdown
                        label="Priority"
                        value={formData.priority}
                        options={['Low', 'Medium', 'High', 'Urgent']}
                        onChange={(val) => handleInputChange('priority', val)}
                    />
                </View>

                {/* 2. Personal Information */}
                <Text style={styles.sectionTitle}>Personal Details</Text>
                <View style={styles.card}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.full_name}
                            onChangeText={(text) => handleInputChange('full_name', text)}
                            placeholder="John Doe"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Phone *</Text>
                                <TextInput
                                    style={[styles.input, phoneError && styles.inputError]}
                                    value={formData.phone_number}
                                    onChangeText={(text) => {
                                        handleInputChange('phone_number', text);
                                        if (phoneError) setPhoneError(''); // Clear error on change
                                    }}
                                    onBlur={handlePhoneBlur}
                                    placeholder="+880..."
                                    keyboardType="phone-pad"
                                />
                                {phoneError ? (
                                    <Text style={styles.errorText}>{phoneError}</Text>
                                ) : null}
                            </View>
                        </View>
                        <View style={styles.col}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Email *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.email}
                                    onChangeText={(text) => handleInputChange('email', text)}
                                    placeholder="email@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                                <Text style={styles.dateText}>{formData.date_of_birth.toISOString().split('T')[0]}</Text>
                                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Gender</Text>
                            <View style={styles.genderContainer}>
                                {['male', 'female', 'other'].map(g => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.genderChip, formData.gender === g && styles.genderChipActive]}
                                        onPress={() => handleInputChange('gender', g)}
                                    >
                                        <Text style={[styles.genderChipText, formData.gender === g && styles.genderChipTextActive]}>
                                            {g.charAt(0).toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.address}
                            onChangeText={(text) => handleInputChange('address', text)}
                            placeholder="Permanent Address"
                            multiline
                        />
                    </View>
                </View>

                {/* 3. Academic Background */}
                <Text style={styles.sectionTitle}>Academic History</Text>
                <View style={styles.card}>
                    <FilterDropdown
                        label="Highest Level Completed"
                        value={formData.highest_level}
                        options={EDUCATION_LEVEL_OPTIONS}
                        onChange={handleHighestLevelChange}
                    />

                    {educationRows.map((edu, index) => (
                        <View key={index} style={styles.eduBlock}>
                            <Text style={styles.eduLabel}>{edu.level.toUpperCase()} Details</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Institute Name"
                                value={edu.institute}
                                onChangeText={(val) => updateEduRow(index, 'institute', val)}
                            />
                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Board/Univ"
                                        value={edu.board}
                                        onChangeText={(val) => updateEduRow(index, 'board', val)}
                                    />
                                </View>
                                <View style={[styles.col, { flex: 0.5 }]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Year"
                                        value={edu.year}
                                        onChangeText={(val) => updateEduRow(index, 'year', val)}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={[styles.col, { flex: 0.5 }]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="GPA"
                                        value={edu.gpa}
                                        onChangeText={(val) => updateEduRow(index, 'gpa', val)}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* 4. English Proficiency */}
                <Text style={styles.sectionTitle}>English Proficiency</Text>
                <View style={styles.card}>
                    <FilterDropdown
                        label="Test Type"
                        value={formData.test_type}
                        options={TEST_TYPE_OPTIONS}
                        onChange={(val) => handleInputChange('test_type', val)}
                    />
                    {formData.test_type !== 'no_test' && formData.test_type !== '' && (
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Overall</Text>
                                <TextInput style={styles.input} value={formData.overall_score} onChangeText={(v) => handleInputChange('overall_score', v)} keyboardType="numeric" />
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Read</Text>
                                <TextInput style={styles.input} value={formData.reading_score} onChangeText={(v) => handleInputChange('reading_score', v)} keyboardType="numeric" />
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Write</Text>
                                <TextInput style={styles.input} value={formData.writing_score} onChangeText={(v) => handleInputChange('writing_score', v)} keyboardType="numeric" />
                            </View>
                        </View>
                    )}
                </View>

                {/* 5. Study Preferences */}
                <Text style={styles.sectionTitle}>Study Preferences</Text>
                <View style={styles.card}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Program/Course Name</Text>
                        <TextInput style={styles.input} value={formData.course_name} onChangeText={(v) => handleInputChange('course_name', v)} placeholder="e.g. BBA" />
                    </View>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <FilterDropdown label="Intake" value={formData.intake} options={INTAKE_OPTIONS} onChange={(v) => handleInputChange('intake', v)} />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Budget</Text>
                            <TextInput style={styles.input} value={formData.budget} onChangeText={(v) => handleInputChange('budget', v)} placeholder="Amount" keyboardType="numeric" />
                        </View>
                    </View>
                </View>

                {/* 6. Work & Visa History */}
                <Text style={styles.sectionTitle}>Work & Visa History</Text>
                <View style={styles.card}>
                    <TextInput style={styles.input} placeholder="Last Company" value={formData.company_name} onChangeText={(v) => handleInputChange('company_name', v)} />
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <FilterDropdown label="Visa Refused?" value={formData.visa_refused} options={['No', 'Yes']} onChange={(v) => handleInputChange('visa_refused', v)} />
                        </View>
                        {formData.visa_refused === 'Yes' && (
                            <View style={[styles.col, { flex: 1 }]}>
                                <Text style={styles.label}>Reason</Text>
                                <TextInput style={styles.input} value={formData.refusal_reason} onChangeText={(v) => handleInputChange('refusal_reason', v)} />
                            </View>
                        )}
                    </View>
                </View>

                {showDatePicker && (
                    <DateTimePicker value={formData.date_of_birth} mode="date" display="default" onChange={handleDateChange} />
                )}

                <TouchableOpacity style={[styles.submitButton, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>{isEditMode ? 'Update' : 'Create'} Lead</Text>}
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, backgroundColor: colors.primary },
    headerTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.white },
    content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
    sectionTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: 4 },
    card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.sm },
    formGroup: { marginBottom: spacing.md },
    label: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs, fontWeight: '600' },
    input: { backgroundColor: colors.gray100, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSizes.md, color: colors.text, marginBottom: spacing.sm },
    inputError: { borderWidth: 1, borderColor: colors.error || '#ef4444', backgroundColor: '#fef2f2' },
    errorText: { fontSize: fontSizes.xs, color: colors.error || '#ef4444', marginTop: -spacing.sm, marginBottom: spacing.xs },
    textArea: { height: 80, textAlignVertical: 'top' },
    row: { flexDirection: 'row', marginHorizontal: -4 },
    col: { flex: 1, paddingHorizontal: 4 },
    chipScroll: { flexDirection: 'row', marginBottom: spacing.sm },
    chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, backgroundColor: colors.gray100, borderRadius: borderRadius.full, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.gray200 },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { fontSize: fontSizes.sm, color: colors.textSecondary },
    chipTextActive: { color: colors.white, fontWeight: '700' },
    datePickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.gray100, padding: spacing.md, borderRadius: borderRadius.md },
    dateText: { fontSize: fontSizes.md, color: colors.text },
    genderContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    genderChip: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
    genderChipActive: { backgroundColor: colors.primary },
    genderChipText: { color: colors.textSecondary, fontWeight: '700' },
    genderChipTextActive: { color: colors.white },
    eduBlock: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.gray200 },
    eduLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
    submitButton: { backgroundColor: colors.primary, padding: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl, ...shadows.md },
    submitText: { color: colors.white, fontSize: fontSizes.md, fontWeight: '700' },
    disabledButton: { opacity: 0.7 },
});

export default AddLeadScreen;
