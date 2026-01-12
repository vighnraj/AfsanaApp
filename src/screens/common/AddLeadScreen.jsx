// Common Add/Edit Lead Screen - Comprehensive Version matching Web
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { createInquiry, getBranches, updateLead, updateInquiryDetails, getInquiryById } from '../../api/leadApi';
import { getCounselors } from '../../api/userApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/Loading';
import { CustomHeader } from '../../components/common';
import FilterDropdown from '../../components/common/FilterDropdown';
import CountryMultiSelect from '../../components/common/CountryMultiSelect';
import {
    COUNTRIES,
    INTAKE_OPTIONS,
    LEAD_SOURCE_OPTIONS,
    INQUIRY_TYPE_OPTIONS,
    EDUCATION_LEVEL_OPTIONS,
    TEST_TYPE_OPTIONS,
    PRIORITY_OPTIONS,
    BOTTOM_TAB_SPACING
} from '../../utils/constants';

const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
];

const STUDY_LEVEL_OPTIONS = [
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelor', label: 'Bachelor' },
    { value: 'master', label: 'Master' },
    { value: 'phd', label: 'PhD' },
];

const AddLeadScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const editLeadId = route.params?.leadId || route.params?.lead?.id;
    const isEditMode = !!editLeadId;
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [counselors, setCounselors] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        inquiry_type: 'student_visa',
        source: 'Whatsapp',
        branch: '',
        counselor_id: '',
        priority: 'Medium',
        full_name: '',
        email: '',
        phone_number: '',
        country: '',
        city: '',
        date_of_birth: new Date(),
        gender: 'male',
        address: '',
        present_address: '',
        // Preferences
        course_name: '',
        study_level: '',
        study_field: '',
        intake: '',
        budget: '',
        preferred_countries: [],
        // Academic
        highest_level: '',
        education_background: [],
        // English
        test_type: '',
        overall_score: '',
        reading_score: '',
        writing_score: '',
        speaking_score: '',
        listening_score: '',
        // Experience
        company_name: '',
        job_title: '',
        job_duration: '',
        study_gap: '',
        visa_refused: 'no',
        refusal_reason: '',
        additional_notes: '',
        consent: true,
    });

    const [educationLevels, setEducationLevels] = useState([
        { level: '', institute: '', board: '', year: '', gpa: '' },
    ]);

    const [showDobPicker, setShowDobPicker] = useState(false);

    useEffect(() => {
        const loadDependencies = async () => {
            try {
                const [branchData, counselorData] = await Promise.all([
                    getBranches(),
                    getCounselors()
                ]);
                setBranches(Array.isArray(branchData) ? branchData : []);
                setCounselors(Array.isArray(counselorData) ? counselorData : []);

                if (isEditMode) {
                    const leadRes = await getInquiryById(editLeadId);
                    const lead = leadRes.data || leadRes;

                    setFormData({
                        ...formData,
                        inquiry_type: lead.inquiry_type || 'student_visa',
                        source: lead.source || 'Whatsapp',
                        branch: lead.branch || '',
                        counselor_id: lead.counselor_id ? String(lead.counselor_id) : '',
                        priority: lead.priority || 'Medium',
                        full_name: lead.full_name || lead.name || '',
                        email: lead.email || '',
                        phone_number: lead.phone_number || lead.phone || '',
                        country: lead.country || '',
                        city: lead.city || '',
                        date_of_birth: lead.date_of_birth ? new Date(lead.date_of_birth) : new Date(),
                        gender: lead.gender || 'male',
                        address: lead.address || '',
                        present_address: lead.present_address || '',
                        course_name: lead.course_name || '',
                        study_level: lead.study_level || '',
                        study_field: lead.study_field || '',
                        intake: lead.intake || '',
                        budget: lead.budget || '',
                        preferred_countries: lead.preferred_countries || [],
                        highest_level: lead.highest_level || '',
                        education_background: Array.isArray(lead.education_background) ? lead.education_background : [],
                        test_type: lead.test_type || '',
                        overall_score: String(lead.overall_score || ''),
                        reading_score: String(lead.reading_score || ''),
                        writing_score: String(lead.writing_score || ''),
                        speaking_score: String(lead.speaking_score || ''),
                        listening_score: String(lead.listening_score || ''),
                        company_name: lead.company_name || '',
                        job_title: lead.job_title || '',
                        job_duration: lead.job_duration || '',
                        study_gap: lead.study_gap || '',
                        visa_refused: lead.visa_refused || 'no',
                        refusal_reason: lead.refusal_reason || '',
                        additional_notes: lead.additional_notes || '',
                        consent: true,
                    });

                    if (Array.isArray(lead.education_background) && lead.education_background.length > 0) {
                        setEducationLevels(lead.education_background);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                showToast.error('Error', 'Failed to load form data');
            } finally {
                setInitLoading(false);
            }
        };

        loadDependencies();
    }, [editLeadId, isEditMode]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleEduChange = (index, field, value) => {
        const newEdu = [...educationLevels];
        newEdu[index][field] = value;
        setEducationLevels(newEdu);
        handleInputChange('education_background', newEdu.filter(e => e.level));
    };

    const addEduRow = () => {
        setEducationLevels([...educationLevels, { level: '', institute: '', board: '', year: '', gpa: '' }]);
    };

    const removeEduRow = (index) => {
        if (educationLevels.length > 1) {
            const newEdu = educationLevels.filter((_, i) => i !== index);
            setEducationLevels(newEdu);
            handleInputChange('education_background', newEdu.filter(e => e.level));
        }
    };

    const handleSubmit = async () => {
        if (!formData.full_name || !formData.phone_number || !formData.email || !formData.branch) {
            Alert.alert('Missing Fields', 'Please fill all required fields: Name, Phone, Email, Branch');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                date_of_birth: formData.date_of_birth.toISOString().split('T')[0],
                counselor_id: formData.counselor_id || user?.id || 1,
                education_background: educationLevels.filter(e => e.level),
                date_of_inquiry: isEditMode ? formData.date_of_inquiry : new Date().toISOString().split('T')[0],
                lead_status: isEditMode ? formData.lead_status : "Converted to Lead",
            };

            if (isEditMode) {
                await updateInquiryDetails(editLeadId, payload);
                showToast.success('Success', 'Lead updated successfully');
            } else {
                const response = await createInquiry(payload);
                const inquiryId = response.inquiryId || response.id;

                if (inquiryId) {
                    try {
                        await updateLead(inquiryId, {
                            lead_status: "Converted to Lead",
                            new_leads: "Converted to Lead"
                        });
                    } catch (updateErr) {
                        console.warn('Status update warning:', updateErr);
                    }
                }
                showToast.success('Success', 'Lead created successfully');
            }
            navigation.goBack();
        } catch (error) {
            console.error('Submit error:', error);
            Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} lead. Please check connection.`);
        } finally {
            setLoading(false);
        }
    };

    if (initLoading) {
        return (
            <View style={styles.container}>
                <CustomHeader title={isEditMode ? 'Edit Lead' : 'Add Lead'} showBack={true} />
                <LoadingSpinner />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomHeader
                title={isEditMode ? 'Edit Lead Detail' : 'Create New Lead'}
                showBack={true}
                onBack={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_TAB_SPACING }]}>

                {/* Section 1: Inquiry Basics */}
                <View style={[styles.sectionCard, shadows.sm]}>
                    <View style={styles.sectionHeaderLine}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Inquiry Basics</Text>
                    </View>

                    <FilterDropdown
                        label="Inquiry Type *"
                        value={formData.inquiry_type}
                        options={INQUIRY_TYPE_OPTIONS}
                        onChange={(v) => handleInputChange('inquiry_type', v)}
                    />

                    <FilterDropdown
                        label="Source *"
                        value={formData.source}
                        options={LEAD_SOURCE_OPTIONS}
                        onChange={(v) => handleInputChange('source', v)}
                    />

                    <FilterDropdown
                        label="Branch *"
                        value={formData.branch}
                        options={branches.map(b => b.branch_name)}
                        onChange={(v) => handleInputChange('branch', v)}
                    />

                    <FilterDropdown
                        label="Priority"
                        value={formData.priority}
                        options={PRIORITY_OPTIONS}
                        onChange={(v) => handleInputChange('priority', v)}
                    />

                    <FilterDropdown
                        label="Assign Counselor"
                        value={formData.counselor_id}
                        options={counselors.map(c => ({ value: String(c.id), label: c.full_name }))}
                        onChange={(v) => handleInputChange('counselor_id', v)}
                        placeholder="Select Counselor"
                    />
                </View>

                {/* Section 2: Personal Information */}
                <View style={[styles.sectionCard, shadows.sm]}>
                    <View style={styles.sectionHeaderLine}>
                        <Ionicons name="person-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput style={styles.input} value={formData.full_name} onChangeText={(v) => handleInputChange('full_name', v)} placeholder="John Doe" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <TextInput style={styles.input} value={formData.phone_number} onChangeText={(v) => handleInputChange('phone_number', v)} placeholder="+88017..." keyboardType="phone-pad" />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address *</Text>
                        <TextInput style={styles.input} value={formData.email} onChangeText={(v) => handleInputChange('email', v)} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" />
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <FilterDropdown label="Gender" value={formData.gender} options={GENDER_OPTIONS} onChange={(v) => handleInputChange('gender', v)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDobPicker(true)}>
                                <Text style={styles.datePickerText}>{formData.date_of_birth.toDateString()}</Text>
                                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showDobPicker && (
                        <DateTimePicker
                            value={formData.date_of_birth}
                            mode="date"
                            display="default"
                            onChange={(event, date) => {
                                setShowDobPicker(false);
                                if (date) handleInputChange('date_of_birth', date);
                            }}
                        />
                    )}

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <FilterDropdown label="Interested Country" value={formData.country} options={COUNTRIES} onChange={(v) => handleInputChange('country', v)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>City</Text>
                            <TextInput style={styles.input} value={formData.city} onChangeText={(v) => handleInputChange('city', v)} placeholder="Dhaka" />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Present Address</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={formData.present_address} onChangeText={(v) => handleInputChange('present_address', v)} placeholder="Present Address" multiline numberOfLines={2} />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Permanent Address</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={formData.address} onChangeText={(v) => handleInputChange('address', v)} placeholder="Permanent Address" multiline numberOfLines={2} />
                    </View>
                </View>

                {/* Section 3: Study Preferences */}
                <View style={[styles.sectionCard, shadows.sm]}>
                    <View style={styles.sectionHeaderLine}>
                        <Ionicons name="school-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Study Preferences</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Interested Course Name</Text>
                        <TextInput style={styles.input} value={formData.course_name} onChangeText={(v) => handleInputChange('course_name', v)} placeholder="e.g. MBA" />
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <FilterDropdown label="Preferred Level" value={formData.study_level} options={STUDY_LEVEL_OPTIONS} onChange={(v) => handleInputChange('study_level', v)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Preferred Field</Text>
                            <TextInput style={styles.input} value={formData.study_field} onChangeText={(v) => handleInputChange('study_field', v)} placeholder="e.g. Business" />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <FilterDropdown label="Preferred Intake" value={formData.intake} options={INTAKE_OPTIONS} onChange={(v) => handleInputChange('intake', v)} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Estimated Budget</Text>
                            <TextInput style={styles.input} value={formData.budget} onChangeText={(v) => handleInputChange('budget', v)} placeholder="e.g. $15,000" keyboardType="numeric" />
                        </View>
                    </View>

                    {/* Preferred Countries Multi-Select */}
                    <CountryMultiSelect
                        selectedCountries={formData.preferred_countries}
                        onSelectionChange={(countries) => handleInputChange('preferred_countries', countries)}
                    />
                </View>

                {/* Section 4: Academic Background */}
                <View style={[styles.sectionCard, shadows.sm]}>
                    <View style={styles.sectionHeaderLine}>
                        <Ionicons name="book-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Academic Background</Text>
                    </View>

                    <FilterDropdown
                        label="Highest Completed Level"
                        value={formData.highest_level}
                        options={EDUCATION_LEVEL_OPTIONS}
                        onChange={(v) => handleInputChange('highest_level', v)}
                    />

                    {educationLevels.map((edu, index) => (
                        <View key={index} style={styles.eduCard}>
                            <View style={styles.eduHeader}>
                                <Text style={styles.eduTitle}>Education #{index + 1}</Text>
                                {educationLevels.length > 1 && (
                                    <TouchableOpacity onPress={() => removeEduRow(index)}>
                                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <FilterDropdown
                                label="Level"
                                value={edu.level}
                                options={EDUCATION_LEVEL_OPTIONS}
                                onChange={(v) => handleEduChange(index, 'level', v)}
                            />

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Institute Name</Text>
                                <TextInput style={styles.input} value={edu.institute} onChangeText={(v) => handleEduChange(index, 'institute', v)} placeholder="College/Uni Name" />
                            </View>

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Board/Uni</Text>
                                    <TextInput style={styles.input} value={edu.board} onChangeText={(v) => handleEduChange(index, 'board', v)} placeholder="e.g. Dhaka" />
                                </View>
                                <View style={{ flex: 0.6 }}>
                                    <Text style={styles.label}>Passing Year</Text>
                                    <TextInput style={styles.input} value={edu.year} onChangeText={(v) => handleEduChange(index, 'year', v)} placeholder="2020" keyboardType="numeric" />
                                </View>
                                <View style={{ flex: 0.6 }}>
                                    <Text style={styles.label}>GPA/CGPA</Text>
                                    <TextInput style={styles.input} value={edu.gpa} onChangeText={(v) => handleEduChange(index, 'gpa', v)} placeholder="5.00" keyboardType="numeric" />
                                </View>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addEduBtn} onPress={addEduRow}>
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                        <Text style={styles.addEduText}>Add More Education</Text>
                    </TouchableOpacity>
                </View>

                {/* Section 5: English Proficiency */}
                <View style={[styles.sectionCard, shadows.sm]}>
                    <View style={styles.sectionHeaderLine}>
                        <Ionicons name="chatbox-ellipses-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionTitle}>English Proficiency</Text>
                    </View>

                    <FilterDropdown
                        label="Test Type"
                        value={formData.test_type}
                        options={TEST_TYPE_OPTIONS}
                        onChange={(v) => handleInputChange('test_type', v)}
                    />

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Overall Score</Text>
                            <TextInput style={styles.input} value={formData.overall_score} onChangeText={(v) => handleInputChange('overall_score', v)} placeholder="6.5" keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Reading</Text>
                            <TextInput style={styles.input} value={formData.reading_score} onChangeText={(v) => handleInputChange('reading_score', v)} placeholder="6.0" keyboardType="numeric" />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Writing</Text>
                            <TextInput style={styles.input} value={formData.writing_score} onChangeText={(v) => handleInputChange('writing_score', v)} placeholder="6.0" keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Speaking</Text>
                            <TextInput style={styles.input} value={formData.speaking_score} onChangeText={(v) => handleInputChange('speaking_score', v)} placeholder="6.5" keyboardType="numeric" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.label}>Listening</Text>
                            <TextInput style={styles.input} value={formData.listening_score} onChangeText={(v) => handleInputChange('listening_score', v)} placeholder="6.5" keyboardType="numeric" />
                        </View>
                    </View>
                </View>

                {/* Section 6: History & Career */}
                <View style={[styles.sectionCard, shadows.sm]}>
                    <View style={styles.sectionHeaderLine}>
                        <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Work & Visa History</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Company/Job Experience</Text>
                        <TextInput style={styles.input} value={formData.company_name} onChangeText={(v) => handleInputChange('company_name', v)} placeholder="Previous Company Name" />
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Job Title</Text>
                            <TextInput style={styles.input} value={formData.job_title} onChangeText={(v) => handleInputChange('job_title', v)} placeholder="Manager" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Duration</Text>
                            <TextInput style={styles.input} value={formData.job_duration} onChangeText={(v) => handleInputChange('job_duration', v)} placeholder="2 Years" />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Study Gap (if any)</Text>
                        <TextInput style={styles.input} value={formData.study_gap} onChangeText={(v) => handleInputChange('study_gap', v)} placeholder="Brief reason" />
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Previous Visa Refusal?</Text>
                        <Switch
                            value={formData.visa_refused === 'yes'}
                            onValueChange={(v) => handleInputChange('visa_refused', v ? 'yes' : 'no')}
                            trackColor={{ false: colors.gray200, true: colors.primary }}
                        />
                    </View>

                    {formData.visa_refused === 'yes' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Refusal Reason</Text>
                            <TextInput style={styles.input} value={formData.refusal_reason} onChangeText={(v) => handleInputChange('refusal_reason', v)} placeholder="Country and Reason" />
                        </View>
                    )}
                </View>

                {/* Section 7: Final */}
                <View style={[styles.sectionCard, shadows.sm]}>
                    <View style={styles.sectionHeaderLine}>
                        <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                    </View>
                    <TextInput
                        style={[styles.input, styles.textAreaExtra]}
                        value={formData.additional_notes}
                        onChangeText={(v) => handleInputChange('additional_notes', v)}
                        placeholder="Any additional comments or notes..."
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color={colors.white} /> : (
                        <Text style={styles.submitText}>{isEditMode ? 'Update Lead Information' : 'Convert to Lead & Save'}</Text>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
    },
    sectionCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    sectionHeaderLine: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        paddingBottom: spacing.xs,
        gap: 8,
    },
    sectionTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    row: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        alignItems: 'flex-end',
    },
    label: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        fontWeight: '600',
    },
    input: {
        backgroundColor: colors.gray50,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSizes.md,
        color: colors.text,
    },
    textArea: {
        height: 60,
        textAlignVertical: 'top',
    },
    textAreaExtra: {
        height: 100,
        textAlignVertical: 'top',
    },
    datePickerBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.gray50,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    datePickerText: {
        fontSize: fontSizes.md,
        color: colors.text,
    },
    eduCard: {
        backgroundColor: colors.gray50,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    eduHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    eduTitle: {
        fontSize: fontSizes.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    addEduBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        borderRadius: borderRadius.md,
    },
    addEduText: {
        color: colors.primary,
        fontWeight: '700',
        marginLeft: 8,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        marginTop: spacing.md,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitText: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.white,
    },
});

export default AddLeadScreen;

