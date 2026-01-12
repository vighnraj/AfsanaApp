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
import {
    COUNTRIES,
    EDUCATION_LEVEL_OPTIONS,
    TEST_TYPE_OPTIONS,
    INTAKE_OPTIONS,
    LEAD_SOURCE_OPTIONS,
    INQUIRY_TYPE_OPTIONS,
    STUDY_LEVEL_OPTIONS,
    STUDY_FIELD_OPTIONS,
    MEDIUM_OF_INSTRUCTION_OPTIONS,
    COUNTRY_CODES,
} from '../../utils/constants';
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
        date_of_inquiry: new Date(),

        // Personal Info
        full_name: '',
        email: '',
        country_code: '+880',
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
        medium_of_instruction: 'english',

        // English Proficiency
        test_type: '',
        other_test_type: '', // For when test_type is 'other'
        overall_score: '',
        reading_score: '',
        writing_score: '',
        speaking_score: '',
        listening_score: '',

        // Study Preferences
        course_name: '',
        university_name: '',
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
        consent: false,
    });

    // Education rows state (mirrors web's local logic)
    const [educationRows, setEducationRows] = useState([]);

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showInquiryDatePicker, setShowInquiryDatePicker] = useState(false);
    const [showCountryCodePicker, setShowCountryCodePicker] = useState(false);

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

                    // Extract country code from phone if stored together
                    let countryCode = '+880';
                    let phoneNum = editLead.phone || editLead.phone_number || '';
                    const matchedCode = COUNTRY_CODES.find(c => phoneNum.startsWith(c.code));
                    if (matchedCode) {
                        countryCode = matchedCode.code;
                        phoneNum = phoneNum.slice(matchedCode.code.length);
                    }

                    setFormData({
                        inquiry_type: editLead.inquiry_type || 'student_visa',
                        source: editLead.source || 'Whatsapp',
                        branch: editLead.branch || '',
                        assignee: editLead.counselor_id || '',
                        priority: editLead.priority || 'Medium',
                        date_of_inquiry: editLead.date_of_inquiry ? new Date(editLead.date_of_inquiry) : new Date(),
                        full_name: editLead.name || editLead.full_name || '',
                        email: editLead.email || '',
                        country_code: countryCode,
                        phone_number: phoneNum,
                        country: editLead.country || '',
                        city: editLead.city || '',
                        date_of_birth: editLead.date_of_birth ? new Date(editLead.date_of_birth) : new Date(),
                        gender: editLead.gender || 'male',
                        address: editLead.address || '',
                        present_address: editLead.present_address || '',
                        highest_level: editLead.highest_level || '',
                        education: initialEdu,
                        medium_of_instruction: editLead.medium_of_instruction || 'english',
                        test_type: editLead.test_type || '',
                        other_test_type: editLead.other_test_type || '',
                        overall_score: editLead.overall_score?.toString() || '',
                        reading_score: editLead.reading_score?.toString() || '',
                        writing_score: editLead.writing_score?.toString() || '',
                        speaking_score: editLead.speaking_score?.toString() || '',
                        listening_score: editLead.listening_score?.toString() || '',
                        course_name: editLead.course_name || '',
                        university_name: editLead.university_name || '',
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
                        consent: editLead.consent || false,
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

    const handleInquiryDateChange = (event, selectedDate) => {
        setShowInquiryDatePicker(false);
        if (selectedDate) {
            handleInputChange('date_of_inquiry', selectedDate);
        }
    };

    const toggleCountry = (country) => {
        const current = formData.preferred_countries || [];
        if (current.includes(country)) {
            handleInputChange('preferred_countries', current.filter(c => c !== country));
        } else {
            handleInputChange('preferred_countries', [...current, country]);
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

        // Consent validation
        if (!formData.consent) {
            Alert.alert('Consent Required', 'Please confirm that the provided information is accurate.');
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
            // Combine country code with phone number
            const fullPhoneNumber = formData.country_code + formData.phone_number;

            // Construct payload matching EXACT web frontend structure
            const payload = {
                ...formData,
                counselor_id: user?.id || 1,
                date_of_birth: formData.date_of_birth.toISOString().split('T')[0],
                date_of_inquiry: formData.date_of_inquiry.toISOString().split('T')[0],
                education_background: educationRows,
                english_proficiency: [], // Optional field in web, initialized empty
                lead_status: isEditMode ? editLead.lead_status : "Converted to Lead",
                phone_number: fullPhoneNumber,
                test_type: formData.test_type === 'other' ? formData.other_test_type : formData.test_type,
            };

            // Mapping for backend if needed
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

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <FilterDropdown
                                label="Priority"
                                value={formData.priority}
                                options={['Low', 'Medium', 'High', 'Urgent']}
                                onChange={(val) => handleInputChange('priority', val)}
                            />
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.label}>Date of Inquiry</Text>
                            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowInquiryDatePicker(true)}>
                                <Text style={styles.dateText}>{formData.date_of_inquiry.toISOString().split('T')[0]}</Text>
                                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
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

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Phone *</Text>
                        <View style={styles.phoneRow}>
                            <TouchableOpacity
                                style={styles.countryCodeButton}
                                onPress={() => setShowCountryCodePicker(!showCountryCodePicker)}
                            >
                                <Text style={styles.countryCodeText}>
                                    {COUNTRY_CODES.find(c => c.code === formData.country_code)?.flag || ''} {formData.country_code}
                                </Text>
                                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <TextInput
                                style={[styles.phoneInput, phoneError && styles.inputError]}
                                value={formData.phone_number}
                                onChangeText={(text) => {
                                    handleInputChange('phone_number', text);
                                    if (phoneError) setPhoneError('');
                                }}
                                onBlur={handlePhoneBlur}
                                placeholder="Phone number"
                                keyboardType="phone-pad"
                            />
                        </View>
                        {showCountryCodePicker && (
                            <View style={styles.countryCodeDropdown}>
                                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                    {COUNTRY_CODES.map((item) => (
                                        <TouchableOpacity
                                            key={item.code}
                                            style={[
                                                styles.countryCodeItem,
                                                formData.country_code === item.code && styles.countryCodeItemActive
                                            ]}
                                            onPress={() => {
                                                handleInputChange('country_code', item.code);
                                                setShowCountryCodePicker(false);
                                            }}
                                        >
                                            <Text style={styles.countryCodeItemText}>
                                                {item.flag} {item.code} - {item.country}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                        {phoneError ? (
                            <Text style={styles.errorText}>{phoneError}</Text>
                        ) : null}
                    </View>

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
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <FilterDropdown
                                label="Highest Level Completed"
                                value={formData.highest_level}
                                options={EDUCATION_LEVEL_OPTIONS}
                                onChange={handleHighestLevelChange}
                            />
                        </View>
                        <View style={styles.col}>
                            <FilterDropdown
                                label="Medium of Instruction"
                                value={formData.medium_of_instruction}
                                options={MEDIUM_OF_INSTRUCTION_OPTIONS}
                                onChange={(val) => handleInputChange('medium_of_instruction', val)}
                            />
                        </View>
                    </View>

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
                    {formData.test_type === 'other' && (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Specify Test Name</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.other_test_type}
                                onChangeText={(v) => handleInputChange('other_test_type', v)}
                                placeholder="Enter test name"
                            />
                        </View>
                    )}
                    {formData.test_type !== 'no_test' && formData.test_type !== '' && (
                        <>
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
                            <View style={styles.row}>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Listen</Text>
                                    <TextInput style={styles.input} value={formData.listening_score} onChangeText={(v) => handleInputChange('listening_score', v)} keyboardType="numeric" />
                                </View>
                                <View style={styles.col}>
                                    <Text style={styles.label}>Speak</Text>
                                    <TextInput style={styles.input} value={formData.speaking_score} onChangeText={(v) => handleInputChange('speaking_score', v)} keyboardType="numeric" />
                                </View>
                                <View style={styles.col} />
                            </View>
                        </>
                    )}
                </View>

                {/* 5. Study Preferences */}
                <Text style={styles.sectionTitle}>Study Preferences</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Program/Course Name</Text>
                                <TextInput style={styles.input} value={formData.course_name} onChangeText={(v) => handleInputChange('course_name', v)} placeholder="e.g. BBA" />
                            </View>
                        </View>
                        <View style={styles.col}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>University Name</Text>
                                <TextInput style={styles.input} value={formData.university_name} onChangeText={(v) => handleInputChange('university_name', v)} placeholder="Preferred university" />
                            </View>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <FilterDropdown
                                label="Study Level"
                                value={formData.study_level}
                                options={STUDY_LEVEL_OPTIONS}
                                onChange={(v) => handleInputChange('study_level', v)}
                            />
                        </View>
                        <View style={styles.col}>
                            <FilterDropdown
                                label="Study Field"
                                value={formData.study_field}
                                options={STUDY_FIELD_OPTIONS}
                                onChange={(v) => handleInputChange('study_field', v)}
                            />
                        </View>
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

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Preferred Countries</Text>
                        <View style={styles.countryChipsContainer}>
                            {COUNTRIES.map((country) => (
                                <TouchableOpacity
                                    key={country}
                                    style={[
                                        styles.countryChip,
                                        formData.preferred_countries.includes(country) && styles.countryChipActive
                                    ]}
                                    onPress={() => toggleCountry(country)}
                                >
                                    <Text style={[
                                        styles.countryChipText,
                                        formData.preferred_countries.includes(country) && styles.countryChipTextActive
                                    ]}>
                                        {country}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {formData.preferred_countries.length > 0 && (
                            <Text style={styles.selectedCountriesText}>
                                Selected: {formData.preferred_countries.join(', ')}
                            </Text>
                        )}
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

                {/* 7. Additional Information */}
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <View style={styles.card}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Additional Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.additional_notes}
                            onChangeText={(v) => handleInputChange('additional_notes', v)}
                            placeholder="Any additional information or special requirements..."
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.consentRow}
                        onPress={() => handleInputChange('consent', !formData.consent)}
                    >
                        <View style={[styles.checkbox, formData.consent && styles.checkboxChecked]}>
                            {formData.consent && <Ionicons name="checkmark" size={16} color={colors.white} />}
                        </View>
                        <Text style={styles.consentText}>
                            I confirm that the information provided is accurate and complete to the best of my knowledge.
                        </Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker value={formData.date_of_birth} mode="date" display="default" onChange={handleDateChange} />
                )}

                {showInquiryDatePicker && (
                    <DateTimePicker value={formData.date_of_inquiry} mode="date" display="default" onChange={handleInquiryDateChange} />
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
    // Phone with country code styles
    phoneRow: { flexDirection: 'row', alignItems: 'center' },
    countryCodeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginRight: spacing.sm,
        minWidth: 100,
    },
    countryCodeText: { fontSize: fontSizes.md, color: colors.text, marginRight: spacing.xs },
    phoneInput: { flex: 1, backgroundColor: colors.gray100, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSizes.md, color: colors.text },
    countryCodeDropdown: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginTop: spacing.xs,
        ...shadows.md,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    countryCodeItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
    countryCodeItemActive: { backgroundColor: `${colors.primary}15` },
    countryCodeItemText: { fontSize: fontSizes.sm, color: colors.text },
    // Country chips for preferred countries
    countryChipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xs },
    countryChip: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.full,
        marginRight: spacing.xs,
        marginBottom: spacing.xs,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    countryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    countryChipText: { fontSize: fontSizes.xs, color: colors.textSecondary },
    countryChipTextActive: { color: colors.white, fontWeight: '600' },
    selectedCountriesText: { fontSize: fontSizes.xs, color: colors.primary, marginTop: spacing.xs, fontStyle: 'italic' },
    // Consent checkbox styles
    consentRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: spacing.sm },
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
    checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
    consentText: { flex: 1, fontSize: fontSizes.sm, color: colors.textSecondary, lineHeight: 20 },
});

export default AddLeadScreen;
