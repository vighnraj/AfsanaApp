import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomHeader from '../../components/common/CustomHeader';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { createStudent, updateStudent } from '../../api/studentApi';
import { getCounselors } from '../../api/userApi';
import { showToast } from '../../components/common/Toast';
import FilterDropdown from '../../components/common/FilterDropdown';
import { COUNTRIES, LEAD_SOURCE_OPTIONS, BRANCH_OPTIONS, BOTTOM_TAB_SPACING } from '../../utils/constants';

const AddStudentScreen = ({ navigation, route }) => {
    const student = route?.params?.student;
    const isEditMode = !!student;

    const [loading, setLoading] = useState(false);
    const [counselors, setCounselors] = useState([]);
    const [activeTab, setActiveTab] = useState(0);

    // Date picker states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPassport1Expiry, setShowPassport1Expiry] = useState(false);
    const [showPassport2Expiry, setShowPassport2Expiry] = useState(false);
    const [showPassport3Expiry, setShowPassport3Expiry] = useState(false);

    // Tab definitions
    const tabs = [
        { id: 0, label: 'Basic', icon: 'person' },
        { id: 1, label: 'Personal', icon: 'home' },
        { id: 2, label: 'Professional', icon: 'briefcase' },
        { id: 3, label: 'Travel', icon: 'airplane' },
        { id: 4, label: 'Sponsor', icon: 'people' },
        { id: 5, label: 'Education', icon: 'school' },
        { id: 6, label: 'EPT Scores', icon: 'language' },
        { id: 7, label: 'Cover Letter', icon: 'document-text' },
    ];

    // Education History (dynamic array)
    const [educationHistory, setEducationHistory] = useState([
        { institute_name: '', degree: '', group_department: '', result: '', start_date: '', end_date: '', status: 'Pass' }
    ]);

    // EPT Scores (dynamic array)
    const [eptScores, setEptScores] = useState([
        { ept_name: '', expiry_date: new Date(), overall_score: '', listening: '', reading: '', speaking: '', writing: '' }
    ]);

    // Form State - All 60+ fields
    const [formData, setFormData] = useState({
        // Basic Account Info (Tab 0)
        full_name: '',
        email: '',
        password: '',
        phone: '',
        mobile_number: '',
        country: 'UK',
        source: 'Whatsapp',
        branch: 'Dhaka',
        counselor_id: '',
        date_of_birth: new Date(),
        gender: 'male',

        // Extended Personal Info (Tab 1)
        father_name: '',
        mother_name: '',
        category: '',
        identifying_name: '',
        tin_no: '',
        address: '',
        present_address: '',
        marital_status: 'Single',
        spouse_occupation: '',
        spouse_monthly_income: '',
        number_of_children: '',
        sponsor_name: '',

        // Job/Professional Details (Tab 2)
        company_designation: '',
        monthly_income: '',
        payment_method: '',
        bank_account_type: '',
        employment_duration: '',

        // Business Details (Tab 2)
        business_name_license: '',
        business_monthly_income: '',
        personal_savings: '',
        business_income_details: '',
        tax_returns_tin: '',

        // Travel & Passport (Tab 3)
        refused_countries: '',
        travel_history: '',
        passport_1_no: '',
        passport_1_expiry: new Date(),
        passport_2_no: '',
        passport_2_expiry: new Date(),
        passport_3_no: '',
        passport_3_expiry: new Date(),

        // Sponsor Information (Tab 4)
        sponsor_email: '',
        sponsor_relationship: '',
        sponsor_occupation: '',
        sponsor_job_position_company: '',
        sponsor_employment_duration: '',
        sponsor_status: '',
        sponsor_bin: '',
        sponsor_tax_docs: false,
        sponsor_address: '',
        sponsor_phone: '',

        // Sponsor Business Details (Tab 4)
        sponsor_business_name_type: '',
        sponsor_income_monthly: '',
        sponsor_income_yearly: '',
        sponsor_license_no: '',
        sponsor_income_mode: '',
        sponsor_bank_details: '',

        // Cover Letter Info (Tab 5)
        visa_refusal_explanation: '',
        name_age_mismatch: '',
        study_gap_explanation: '',
        deportation_details: '',
    });

    useEffect(() => {
        fetchCounselors();
        // Pre-fill form in edit mode
        if (isEditMode && student) {
            setFormData({
                // Basic fields
                full_name: student.full_name || student.name || '',
                email: student.email || '',
                password: '',
                phone: student.phone || '',
                mobile_number: student.mobile_number || student.phone || '',
                country: student.country || 'UK',
                source: student.source || 'Whatsapp',
                branch: student.branch || 'Dhaka',
                counselor_id: student.counselor_id || '',
                date_of_birth: student.date_of_birth ? new Date(student.date_of_birth) : new Date(),
                gender: student.gender || 'male',

                // Extended Personal
                father_name: student.father_name || '',
                mother_name: student.mother_name || '',
                category: student.category || '',
                identifying_name: student.identifying_name || '',
                tin_no: student.tin_no || '',
                address: student.address || '',
                present_address: student.present_address || '',
                marital_status: student.marital_status || 'Single',
                spouse_occupation: student.spouse_occupation || '',
                spouse_monthly_income: student.spouse_monthly_income || '',
                number_of_children: student.number_of_children || '',
                sponsor_name: student.sponsor_name || '',

                // Professional
                company_designation: student.company_designation || '',
                monthly_income: student.monthly_income || '',
                payment_method: student.payment_method || '',
                bank_account_type: student.bank_account_type || '',
                employment_duration: student.employment_duration || '',
                business_name_license: student.business_name_license || '',
                business_monthly_income: student.business_monthly_income || '',
                personal_savings: student.personal_savings || '',
                business_income_details: student.business_income_details || '',
                tax_returns_tin: student.tax_returns_tin || '',

                // Travel
                refused_countries: student.refused_countries || '',
                travel_history: student.travel_history || '',
                passport_1_no: student.passport_1_no || '',
                passport_1_expiry: student.passport_1_expiry ? new Date(student.passport_1_expiry) : new Date(),
                passport_2_no: student.passport_2_no || '',
                passport_2_expiry: student.passport_2_expiry ? new Date(student.passport_2_expiry) : new Date(),
                passport_3_no: student.passport_3_no || '',
                passport_3_expiry: student.passport_3_expiry ? new Date(student.passport_3_expiry) : new Date(),

                // Sponsor
                sponsor_email: student.sponsor_email || '',
                sponsor_relationship: student.sponsor_relationship || '',
                sponsor_occupation: student.sponsor_occupation || '',
                sponsor_job_position_company: student.sponsor_job_position_company || '',
                sponsor_employment_duration: student.sponsor_employment_duration || '',
                sponsor_status: student.sponsor_status || '',
                sponsor_bin: student.sponsor_bin || '',
                sponsor_tax_docs: student.sponsor_tax_docs || false,
                sponsor_address: student.sponsor_address || '',
                sponsor_phone: student.sponsor_phone || '',
                sponsor_business_name_type: student.sponsor_business_name_type || '',
                sponsor_income_monthly: student.sponsor_income_monthly || '',
                sponsor_income_yearly: student.sponsor_income_yearly || '',
                sponsor_license_no: student.sponsor_license_no || '',
                sponsor_income_mode: student.sponsor_income_mode || '',
                sponsor_bank_details: student.sponsor_bank_details || '',

                // Cover Letter
                visa_refusal_explanation: student.visa_refusal_explanation || '',
                name_age_mismatch: student.name_age_mismatch || '',
                study_gap_explanation: student.study_gap_explanation || '',
                deportation_details: student.deportation_details || '',
            });

            // Load education history if available
            if (Array.isArray(student.education_history) && student.education_history.length > 0) {
                setEducationHistory(student.education_history);
            }

            // Load EPT scores if available
            if (Array.isArray(student.ept_scores) && student.ept_scores.length > 0) {
                setEptScores(student.ept_scores.map(ept => ({
                    ...ept,
                    expiry_date: ept.expiry_date ? new Date(ept.expiry_date) : new Date()
                })));
            }
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

    // Education History handlers
    const handleEducationChange = (index, field, value) => {
        const updated = [...educationHistory];
        updated[index][field] = value;
        setEducationHistory(updated);
    };

    const addEducationRow = () => {
        setEducationHistory([
            ...educationHistory,
            { institute_name: '', degree: '', group_department: '', result: '', start_date: '', end_date: '', status: 'Pass' }
        ]);
    };

    const removeEducationRow = (index) => {
        if (educationHistory.length > 1) {
            setEducationHistory(educationHistory.filter((_, i) => i !== index));
        }
    };

    // EPT Scores handlers
    const handleEptChange = (index, field, value) => {
        const updated = [...eptScores];
        updated[index][field] = value;
        setEptScores(updated);
    };

    const addEptRow = () => {
        setEptScores([
            ...eptScores,
            { ept_name: '', expiry_date: new Date(), overall_score: '', listening: '', reading: '', speaking: '', writing: '' }
        ]);
    };

    const removeEptRow = (index) => {
        if (eptScores.length > 1) {
            setEptScores(eptScores.filter((_, i) => i !== index));
        }
    };

    const formatDateForAPI = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const validate = () => {
        if (!formData.full_name || !formData.email) {
            showToast.error('Error', 'Full name and email are required');
            return false;
        }
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
            const payload = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone || formData.mobile_number,
                mobile_number: formData.mobile_number || formData.phone,
                country: formData.country,
                source: formData.source,
                branch: formData.branch,
                counselor_id: formData.counselor_id,
                date_of_birth: formatDateForAPI(formData.date_of_birth),
                gender: formData.gender,

                // Extended Personal
                father_name: formData.father_name,
                mother_name: formData.mother_name,
                category: formData.category,
                identifying_name: formData.identifying_name,
                tin_no: formData.tin_no,
                address: formData.address,
                present_address: formData.present_address,
                marital_status: formData.marital_status,
                spouse_occupation: formData.spouse_occupation,
                spouse_monthly_income: formData.spouse_monthly_income,
                number_of_children: formData.number_of_children,
                sponsor_name: formData.sponsor_name,

                // Professional
                company_designation: formData.company_designation,
                monthly_income: formData.monthly_income,
                payment_method: formData.payment_method,
                bank_account_type: formData.bank_account_type,
                employment_duration: formData.employment_duration,
                business_name_license: formData.business_name_license,
                business_monthly_income: formData.business_monthly_income,
                personal_savings: formData.personal_savings,
                business_income_details: formData.business_income_details,
                tax_returns_tin: formData.tax_returns_tin,

                // Travel
                refused_countries: formData.refused_countries,
                travel_history: formData.travel_history,
                passport_1_no: formData.passport_1_no,
                passport_1_expiry: formatDateForAPI(formData.passport_1_expiry),
                passport_2_no: formData.passport_2_no,
                passport_2_expiry: formatDateForAPI(formData.passport_2_expiry),
                passport_3_no: formData.passport_3_no,
                passport_3_expiry: formatDateForAPI(formData.passport_3_expiry),

                // Sponsor
                sponsor_email: formData.sponsor_email,
                sponsor_relationship: formData.sponsor_relationship,
                sponsor_occupation: formData.sponsor_occupation,
                sponsor_job_position_company: formData.sponsor_job_position_company,
                sponsor_employment_duration: formData.sponsor_employment_duration,
                sponsor_status: formData.sponsor_status,
                sponsor_bin: formData.sponsor_bin,
                sponsor_tax_docs: formData.sponsor_tax_docs,
                sponsor_address: formData.sponsor_address,
                sponsor_phone: formData.sponsor_phone,
                sponsor_business_name_type: formData.sponsor_business_name_type,
                sponsor_income_monthly: formData.sponsor_income_monthly,
                sponsor_income_yearly: formData.sponsor_income_yearly,
                sponsor_license_no: formData.sponsor_license_no,
                sponsor_income_mode: formData.sponsor_income_mode,
                sponsor_bank_details: formData.sponsor_bank_details,

                // Cover Letter
                visa_refusal_explanation: formData.visa_refusal_explanation,
                name_age_mismatch: formData.name_age_mismatch,
                study_gap_explanation: formData.study_gap_explanation,
                deportation_details: formData.deportation_details,

                // Education History
                education_history: educationHistory.filter(edu => edu.institute_name || edu.degree),

                // EPT Scores
                ept_scores: eptScores.filter(ept => ept.ept_name).map(ept => ({
                    ...ept,
                    expiry_date: formatDateForAPI(ept.expiry_date)
                })),
            };

            if (isEditMode) {
                if (formData.password) {
                    payload.password = formData.password;
                }
                await updateStudent(student.id, payload);
                showToast.success('Success', 'Student updated successfully');
            } else {
                payload.password = formData.password;
                payload.role = 'student';

                const signupRes = await createStudent(payload);
                const studentId = signupRes.data?.id || signupRes.user?.id || signupRes.student_id;

                if (studentId) {
                    await updateStudent(studentId, payload);
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

    const renderDatePicker = (value, onChangeFunc, showState, setShowState) => (
        <TouchableOpacity onPress={() => setShowState(true)} style={styles.dateButton}>
            <Text style={styles.dateButtonText}>
                {value ? formatDateForAPI(value) : 'Select Date'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            {showState && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                        setShowState(false);
                        if (selectedDate) {
                            onChangeFunc(selectedDate);
                        }
                    }}
                />
            )}
        </TouchableOpacity>
    );

    const renderInput = (label, field, placeholder, keyboardType = 'default', multiline = false, required = false) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
            <TextInput
                style={[styles.input, multiline && styles.textArea]}
                placeholder={placeholder}
                keyboardType={keyboardType}
                value={formData[field]}
                onChangeText={(val) => handleInputChange(field, val)}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
            />
        </View>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 0: // Basic Info
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Account Information</Text>
                        {renderInput('Full Name', 'full_name', 'John Doe', 'default', false, true)}
                        {renderInput('Email Address', 'email', 'john@example.com', 'email-address', false, true)}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                {isEditMode ? 'Password (Leave blank to keep current)' : 'Password (Min 6 chars)'}{' '}
                                {!isEditMode && <Text style={styles.required}>*</Text>}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={isEditMode ? "Leave blank to keep current" : "••••••••"}
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(val) => handleInputChange('password', val)}
                            />
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Basic Details</Text>
                        {renderInput('Phone / Mobile Number', 'mobile_number', '+880...', 'phone-pad')}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Date of Birth</Text>
                            {renderDatePicker(formData.date_of_birth, (date) => handleInputChange('date_of_birth', date), showDatePicker, setShowDatePicker)}
                        </View>

                        <FilterDropdown
                            label="Gender"
                            value={formData.gender}
                            options={[
                                { value: 'male', label: 'Male' },
                                { value: 'female', label: 'Female' },
                                { value: 'other', label: 'Other' }
                            ]}
                            onChange={(val) => handleInputChange('gender', val)}
                        />

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
                );

            case 1: // Personal Info
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Extended Personal Information</Text>
                        {renderInput('Father Name', 'father_name', "Father's full name")}
                        {renderInput('Mother Name', 'mother_name', "Mother's full name")}
                        {renderInput('Category', 'category', 'e.g., General, OBC, SC, ST')}
                        {renderInput('Identifying Name', 'identifying_name', 'Any other identifying name')}
                        {renderInput('TIN Number', 'tin_no', 'Tax Identification Number')}
                        {renderInput('Address', 'address', 'Permanent address', 'default', true)}
                        {renderInput('Present Address', 'present_address', 'Current residential address', 'default', true)}

                        <FilterDropdown
                            label="Marital Status"
                            value={formData.marital_status}
                            options={[
                                { value: 'Single', label: 'Single' },
                                { value: 'Married', label: 'Married' },
                                { value: 'Divorced', label: 'Divorced' },
                                { value: 'Widowed', label: 'Widowed' }
                            ]}
                            onChange={(val) => handleInputChange('marital_status', val)}
                        />

                        {formData.marital_status === 'Married' && (
                            <>
                                {renderInput('Spouse\'s Occupation', 'spouse_occupation', 'Job title/profession')}
                                {renderInput('Spouse\'s Monthly Income', 'spouse_monthly_income', 'Amount in local currency', 'numeric')}
                                {renderInput('Number of Children', 'number_of_children', '0', 'numeric')}
                            </>
                        )}

                        {renderInput('Current Sponsor Name', 'sponsor_name', 'Name of financial sponsor')}
                    </View>
                );

            case 2: // Professional
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Job/Professional Details</Text>
                        {renderInput('Company & Designation', 'company_designation', 'Company Name - Job Title')}
                        {renderInput('Monthly Income', 'monthly_income', 'Amount', 'numeric')}

                        <FilterDropdown
                            label="Payment Method"
                            value={formData.payment_method}
                            options={[
                                { value: 'Bank Transfer', label: 'Bank Transfer' },
                                { value: 'Cash', label: 'Cash' },
                                { value: 'Cheque', label: 'Cheque' },
                                { value: 'Mobile Banking', label: 'Mobile Banking' }
                            ]}
                            onChange={(val) => handleInputChange('payment_method', val)}
                        />

                        {renderInput('Bank Name & Account Type', 'bank_account_type', 'e.g., City Bank - Savings')}
                        {renderInput('Employment Duration', 'employment_duration', 'e.g., 3 years')}

                        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Business Details (If Any)</Text>
                        {renderInput('Business Name & License Numbers', 'business_name_license', 'Business details')}
                        {renderInput('Business Monthly Income', 'business_monthly_income', 'Amount', 'numeric')}
                        {renderInput('Personal Savings', 'personal_savings', 'Amount', 'numeric')}
                        {renderInput('Business Income Bank Name & Type', 'business_income_details', 'Bank details')}
                        {renderInput('Tax Returns (3 years) & TIN Certificate', 'tax_returns_tin', 'Details', 'default', true)}
                    </View>
                );

            case 3: // Travel & Passport
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Travel History</Text>
                        {renderInput('Previously Refused Countries', 'refused_countries', 'List countries if any')}
                        {renderInput('Travel History', 'travel_history', 'Countries visited with dates', 'default', true)}

                        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Passport Information</Text>
                        {renderInput('Current Passport Number', 'passport_1_no', 'Passport 1 number')}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Passport 1 Expiry Date</Text>
                            {renderDatePicker(formData.passport_1_expiry, (date) => handleInputChange('passport_1_expiry', date), showPassport1Expiry, setShowPassport1Expiry)}
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Additional Passports (If Any)</Text>
                        {renderInput('Passport 2 Number', 'passport_2_no', 'Second passport number (optional)')}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Passport 2 Expiry Date</Text>
                            {renderDatePicker(formData.passport_2_expiry, (date) => handleInputChange('passport_2_expiry', date), showPassport2Expiry, setShowPassport2Expiry)}
                        </View>

                        {renderInput('Passport 3 Number', 'passport_3_no', 'Third passport number (optional)')}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Passport 3 Expiry Date</Text>
                            {renderDatePicker(formData.passport_3_expiry, (date) => handleInputChange('passport_3_expiry', date), showPassport3Expiry, setShowPassport3Expiry)}
                        </View>
                    </View>
                );

            case 4: // Sponsor Info
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Sponsor's Personal Information</Text>
                        {renderInput('Sponsor Email', 'sponsor_email', 'sponsor@example.com', 'email-address')}
                        {renderInput('Sponsor Relationship', 'sponsor_relationship', 'e.g., Father, Uncle, Self')}
                        {renderInput('Sponsor Occupation', 'sponsor_occupation', 'Job/Profession')}
                        {renderInput('Sponsor Job Position, Company', 'sponsor_job_position_company', 'Position - Company Name')}
                        {renderInput('Sponsor Employment Duration', 'sponsor_employment_duration', 'e.g., 5 years')}
                        {renderInput('Sponsor Status', 'sponsor_status', 'e.g., Employed, Self-Employed')}
                        {renderInput('Sponsor Business TIN/BIN', 'sponsor_bin', 'Tax/Business ID Number')}

                        <View style={styles.inputContainer}>
                            <View style={styles.checkboxRow}>
                                <TouchableOpacity
                                    style={styles.checkbox}
                                    onPress={() => handleInputChange('sponsor_tax_docs', !formData.sponsor_tax_docs)}
                                >
                                    {formData.sponsor_tax_docs && (
                                        <Ionicons name="checkmark" size={18} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                                <Text style={styles.checkboxLabel}>Sponsor Tax Documents Available</Text>
                            </View>
                        </View>

                        {renderInput('Sponsor Present Address', 'sponsor_address', 'Address', 'default', true)}
                        {renderInput('Sponsor Phone', 'sponsor_phone', '+880...', 'phone-pad')}

                        <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Sponsor's Business Details</Text>
                        {renderInput('Business Name & Type', 'sponsor_business_name_type', 'Business details')}
                        {renderInput('Income (Monthly)', 'sponsor_income_monthly', 'Amount', 'numeric')}
                        {renderInput('Income (Yearly)', 'sponsor_income_yearly', 'Amount', 'numeric')}
                        {renderInput('License Number', 'sponsor_license_no', 'Business license number')}
                        {renderInput('Income Received Via', 'sponsor_income_mode', 'e.g., Bank, Cash, Cheque')}
                        {renderInput('Bank Details', 'sponsor_bank_details', 'Bank name and account details')}
                    </View>
                );

            case 5: // Education History
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Applicant Education History</Text>
                        <Text style={styles.helperText}>
                            Add all educational qualifications from highest to lowest level.
                        </Text>

                        {educationHistory.map((edu, index) => (
                            <View key={index} style={styles.dynamicCard}>
                                <View style={styles.dynamicCardHeader}>
                                    <Text style={styles.dynamicCardTitle}>Education #{index + 1}</Text>
                                    {educationHistory.length > 1 && (
                                        <TouchableOpacity onPress={() => removeEducationRow(index)}>
                                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Institute Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="University/College Name"
                                        value={edu.institute_name}
                                        onChangeText={(val) => handleEducationChange(index, 'institute_name', val)}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Degree/Certificate</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., BSc, HSC, SSC"
                                        value={edu.degree}
                                        onChangeText={(val) => handleEducationChange(index, 'degree', val)}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Group/Department</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., Science, Commerce, CSE"
                                        value={edu.group_department}
                                        onChangeText={(val) => handleEducationChange(index, 'group_department', val)}
                                    />
                                </View>

                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.label}>Result/GPA</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="e.g., 3.85"
                                                value={edu.result}
                                                onChangeText={(val) => handleEducationChange(index, 'result', val)}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <FilterDropdown
                                            label="Status"
                                            value={edu.status}
                                            options={[
                                                { value: 'Pass', label: 'Pass' },
                                                { value: 'Fail', label: 'Fail' },
                                                { value: 'Retake', label: 'Retake' },
                                                { value: 'Withdraw', label: 'Withdraw' },
                                                { value: 'Ongoing', label: 'Ongoing' }
                                            ]}
                                            onChange={(val) => handleEducationChange(index, 'status', val)}
                                        />
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.label}>Start Date</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="e.g., 2018"
                                                value={edu.start_date}
                                                onChangeText={(val) => handleEducationChange(index, 'start_date', val)}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.label}>End Date</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="e.g., 2022"
                                                value={edu.end_date}
                                                onChangeText={(val) => handleEducationChange(index, 'end_date', val)}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addButton} onPress={addEducationRow}>
                            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                            <Text style={styles.addButtonText}>Add More Education</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 6: // EPT Scores
                return (
                    <View>
                        <Text style={styles.sectionTitle}>English Proficiency Test Scores</Text>
                        <Text style={styles.helperText}>
                            Add IELTS, TOEFL, PTE, Duolingo or other English test scores.
                        </Text>

                        {eptScores.map((ept, index) => (
                            <View key={index} style={styles.dynamicCard}>
                                <View style={styles.dynamicCardHeader}>
                                    <Text style={styles.dynamicCardTitle}>Test #{index + 1}</Text>
                                    {eptScores.length > 1 && (
                                        <TouchableOpacity onPress={() => removeEptRow(index)}>
                                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <FilterDropdown
                                    label="Test Type"
                                    value={ept.ept_name}
                                    options={[
                                        { value: 'IELTS', label: 'IELTS' },
                                        { value: 'TOEFL', label: 'TOEFL' },
                                        { value: 'PTE', label: 'PTE' },
                                        { value: 'PTE Core', label: 'PTE Core' },
                                        { value: 'PTE Academic', label: 'PTE Academic' },
                                        { value: 'Duolingo', label: 'Duolingo' },
                                        { value: 'Other', label: 'Other' }
                                    ]}
                                    onChange={(val) => handleEptChange(index, 'ept_name', val)}
                                />

                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.label}>Overall Score</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="e.g., 7.0"
                                                keyboardType="numeric"
                                                value={ept.overall_score}
                                                onChangeText={(val) => handleEptChange(index, 'overall_score', val)}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.label}>Expiry Date</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="YYYY-MM-DD"
                                                value={formatDateForAPI(ept.expiry_date)}
                                                onChangeText={(val) => handleEptChange(index, 'expiry_date', val)}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <Text style={[styles.label, { marginTop: spacing.sm, marginBottom: spacing.xs }]}>Individual Scores</Text>
                                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                    <View style={{ flex: 1, minWidth: '45%' }}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.smallLabel}>Listening</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                placeholder="L"
                                                keyboardType="numeric"
                                                value={ept.listening}
                                                onChangeText={(val) => handleEptChange(index, 'listening', val)}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, minWidth: '45%' }}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.smallLabel}>Reading</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                placeholder="R"
                                                keyboardType="numeric"
                                                value={ept.reading}
                                                onChangeText={(val) => handleEptChange(index, 'reading', val)}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, minWidth: '45%' }}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.smallLabel}>Speaking</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                placeholder="S"
                                                keyboardType="numeric"
                                                value={ept.speaking}
                                                onChangeText={(val) => handleEptChange(index, 'speaking', val)}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, minWidth: '45%' }}>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.smallLabel}>Writing</Text>
                                            <TextInput
                                                style={styles.smallInput}
                                                placeholder="W"
                                                keyboardType="numeric"
                                                value={ept.writing}
                                                onChangeText={(val) => handleEptChange(index, 'writing', val)}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addButton} onPress={addEptRow}>
                            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                            <Text style={styles.addButtonText}>Add More Test Scores</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 7: // Cover Letter Info
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Information for Cover Letter</Text>
                        <Text style={styles.helperText}>
                            This information will be used to prepare visa application cover letters and supporting documents.
                        </Text>

                        {renderInput('Visa Refusal Explanation', 'visa_refusal_explanation', 'Explain any previous visa refusals', 'default', true)}
                        {renderInput('Any Name/Age Mismatches', 'name_age_mismatch', 'Explain discrepancies in documents', 'default', true)}
                        {renderInput('Study Gap Explanation', 'study_gap_explanation', 'Explain any gaps in education', 'default', true)}
                        {renderInput('Deportation Details', 'deportation_details', 'Provide details if applicable', 'default', true)}
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeader title={isEditMode ? "Edit Student" : "Add New Student"} />

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                            onPress={() => setActiveTab(tab.id)}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={18}
                                color={activeTab === tab.id ? colors.white : colors.textSecondary}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Tab Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    {renderTabContent()}
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
    tabContainer: {
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
        ...shadows.sm,
    },
    tabScroll: {
        padding: spacing.sm,
        gap: spacing.xs,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.gray100,
        marginRight: spacing.xs,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.white,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: BOTTOM_TAB_SPACING,
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
    helperText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        fontStyle: 'italic',
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
    required: {
        color: colors.danger,
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
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    dateButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    dateButtonText: {
        fontSize: 15,
        color: colors.text,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: borderRadius.sm,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    checkboxLabel: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
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
    // Dynamic card styles for Education & EPT
    dynamicCard: {
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    dynamicCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    dynamicCardTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.primary,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.primary,
        borderRadius: borderRadius.md,
        marginTop: spacing.sm,
    },
    addButtonText: {
        color: colors.primary,
        fontSize: fontSizes.md,
        fontWeight: '600',
        marginLeft: spacing.xs,
    },
    smallLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 4,
    },
    smallInput: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        padding: spacing.sm,
        fontSize: 14,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.gray200,
        textAlign: 'center',
    },
});

export default AddStudentScreen;
