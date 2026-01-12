// Visa Processing Screen (Full CRM Workflow Parity)
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { LoadingSpinner } from '../../components/common/Loading';
import CustomHeader from '../../components/common/CustomHeader';
import { VISA_STAGES, COUNTRIES, BOTTOM_TAB_SPACING } from '../../utils/constants';
import visaApi from '../../api/visaApi';
import FilterDropdown from '../../components/common/FilterDropdown';

const VisaProcessingScreen = ({ navigation, route }) => {
    const { user } = useAuth();
    const routeStudentId = route.params?.studentId;
    const effectiveStudentId = routeStudentId || user?.id;

    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);
    const [universities, setUniversities] = useState([]);
    const [selectedUniId, setSelectedUniId] = useState('');
    const [activeStep, setActiveStep] = useState('application');
    const [completedSteps, setCompletedSteps] = useState([]);
    const [formData, setFormData] = useState({});
    const [recordId, setRecordId] = useState(null);

    // Initial Load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const unis = await visaApi.getUniversities();
                setUniversities(unis);

                // Fetch student's student info
                // Note: student_id is user.id if role is student
                if (effectiveStudentId) {
                    // Pre-select first university if available or last used
                    if (unis.length > 0) {
                        setSelectedUniId(unis[0].id.toString());
                    }
                }
            } catch (error) {
                console.error('Init loading error:', error);
                showToast.error('Error', 'Failed to load initial data');
            } finally {
                setInitLoading(false);
            }
        };
        loadInitialData();
    }, [effectiveStudentId]);

    // Load Visa process data when university changes
    useEffect(() => {
        if (selectedUniId && effectiveStudentId) {
            fetchVisaProcessData();
        }
    }, [selectedUniId, effectiveStudentId]);

    const fetchVisaProcessData = async () => {
        setLoading(true);
        try {
            const data = await visaApi.getVisaProcessByUniversityAndStudent(selectedUniId, effectiveStudentId);
            const visaData = Array.isArray(data) ? data[0] : data;

            if (visaData) {
                setRecordId(visaData.id);
                setFormData(visaData);

                // Calculate completed steps
                const completed = [];
                VISA_STAGES.forEach(step => {
                    if (visaData[step.apiField] === 1) {
                        completed.push(step.key);
                    }
                });
                setCompletedSteps(completed);

                // Set active step to first incomplete or stay at current
                const lastIncomplete = VISA_STAGES.find(s => !completed.includes(s.key));
                if (lastIncomplete) {
                    setActiveStep(lastIncomplete.key);
                }
            } else {
                // Reset for new university
                setRecordId(null);
                setFormData({});
                setCompletedSteps([]);
                setActiveStep('application');
            }
        } catch (error) {
            console.warn('No existing visa record:', error);
            setRecordId(null);
            setFormData({});
            setCompletedSteps([]);
            setActiveStep('application');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const pickDocument = async (field) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                handleInputChange(field, {
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType || 'application/octet-stream',
                });
                // Auto-set status to Pending
                handleInputChange(`${field}_status`, 'Pending');
            }
        } catch (err) {
            console.error('File pick error:', err);
        }
    };

    const handleSave = async () => {
        if (!selectedUniId) {
            Alert.alert('Selection Required', 'Please select a university first.');
            return;
        }

        setLoading(true);
        try {
            const dataToSubmit = new FormData();

            // Basic Fields
            dataToSubmit.append('student_id', effectiveStudentId);
            dataToSubmit.append('university_id', selectedUniId);

            // Mark current stage as completed
            const currentStageInfo = VISA_STAGES.find(s => s.key === activeStep);
            if (currentStageInfo) {
                dataToSubmit.append(currentStageInfo.apiField, '1');
            }

            // Append form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value === null || value === undefined) return;

                if (typeof value === 'object' && value.uri) {
                    // It's a file
                    dataToSubmit.append(key, {
                        uri: value.uri,
                        name: value.name,
                        type: value.type,
                    });
                } else if (typeof value === 'boolean') {
                    dataToSubmit.append(key, value ? '1' : '0');
                } else if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
                    dataToSubmit.append(key, String(value));
                }
            });

            let response;
            if (recordId) {
                response = await visaApi.updateVisaProcess(recordId, dataToSubmit);
                showToast.success('Success', `${currentStageInfo.label} updated`);
            } else {
                response = await visaApi.createVisaProcess(dataToSubmit);
                setRecordId(response.id);
                showToast.success('Success', 'Visa process started');
            }

            // Advance to next step
            setCompletedSteps(prev => [...new Set([...prev, activeStep])]);
            const currentIndex = VISA_STAGES.findIndex(s => s.key === activeStep);
            if (currentIndex < VISA_STAGES.length - 1) {
                setActiveStep(VISA_STAGES[currentIndex + 1].key);
            }

            // Refresh data
            fetchVisaProcessData();

        } catch (error) {
            console.error('Save error:', error);
            showToast.error('Error', 'Failed to save progress');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 'application':
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>Registration Details</Text>
                        <TextInput style={styles.input} placeholder="Full Name" value={formData.full_name || user?.full_name} onChangeText={(v) => handleInputChange('full_name', v)} />
                        <TextInput style={styles.input} placeholder="Passport No" value={formData.passport_no} onChangeText={(v) => handleInputChange('passport_no', v)} />
                        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument('passport_doc')}>
                            <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
                            <Text style={styles.uploadText}>{formData.passport_doc?.name || 'Upload Passport (PDF/Image)'}</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'interview': // Documents stage
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>Document Submission</Text>
                        {['ssc_doc', 'hsc_doc', 'bachelor_doc', 'ielts_doc', 'cv_doc', 'sop_doc', 'financial_doc', 'recommendation_letter', 'work_experience_doc', 'passport_copy'].map(docKey => (
                            <View key={docKey} style={styles.docContainer}>
                                <TouchableOpacity style={styles.docRow} onPress={() => pickDocument(docKey)}>
                                    <View style={styles.docInfo}>
                                        <Ionicons name="file-tray-full-outline" size={24} color={colors.primary} />
                                        <Text style={styles.docLabel}>{docKey.replace(/_/g, ' ').toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.docStatus}>
                                        <Text style={[styles.statusTag, { backgroundColor: formData[docKey] ? colors.success + '15' : colors.gray100 }]}>
                                            {formData[docKey] ? 'Uploaded' : 'Pending'}
                                        </Text>
                                        <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
                                    </View>
                                </TouchableOpacity>
                                {/* Document Status Dropdown */}
                                <View style={styles.statusRow}>
                                    <Text style={styles.statusLabel}>Status:</Text>
                                    <FilterDropdown
                                        value={formData[`${docKey}_status`] || 'Pending'}
                                        options={[
                                            { value: 'Pending', label: 'Pending' },
                                            { value: 'Approved', label: 'Approved' },
                                            { value: 'Rejected', label: 'Rejected' }
                                        ]}
                                        onChange={(val) => handleInputChange(`${docKey}_status`, val)}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                );

            case 'visa': // University Application
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>University Application</Text>
                        <TextInput style={styles.input} placeholder="Program Name" value={formData.program_name} onChangeText={(v) => handleInputChange('program_name', v)} />
                        <TextInput style={styles.input} placeholder="Application ID" value={formData.application_id} onChangeText={(v) => handleInputChange('application_id', v)} />
                        <TextInput style={styles.input} placeholder="Submission Date (YYYY-MM-DD)" value={formData.submission_date} onChangeText={(v) => handleInputChange('submission_date', v)} />

                        <FilterDropdown
                            label="Submission Method"
                            value={formData.submission_method || 'Online'}
                            options={[
                                { value: 'Online', label: 'Online Portal' },
                                { value: 'Email', label: 'Email' },
                                { value: 'Postal', label: 'Postal Mail' },
                                { value: 'Agent', label: 'Through Agent' }
                            ]}
                            onChange={(val) => handleInputChange('submission_method', val)}
                        />

                        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument('application_proof')}>
                            <Ionicons name="document-attach-outline" size={20} color={colors.primary} />
                            <Text style={styles.uploadText}>{formData.application_proof?.name || 'Upload Application Proof'}</Text>
                        </TouchableOpacity>

                        <FilterDropdown
                            label="Application Status"
                            value={formData.application_status || 'Submitted'}
                            options={[
                                { value: 'Submitted', label: 'Submitted' },
                                { value: 'Under Review', label: 'Under Review' },
                                { value: 'Pending Documents', label: 'Pending Documents' },
                                { value: 'Approved', label: 'Approved' },
                                { value: 'Rejected', label: 'Rejected' }
                            ]}
                            onChange={(val) => handleInputChange('application_status', val)}
                        />
                    </View>
                );

            case 'fee': // Fee Payment
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>Fee Payment</Text>
                        <View style={styles.row}>
                            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Amount" value={formData.fee_amount} onChangeText={(v) => handleInputChange('fee_amount', v)} keyboardType="numeric" />
                            <View style={{ width: 120 }}>
                                <FilterDropdown
                                    value={formData.fee_currency || 'USD'}
                                    options={[
                                        { value: 'USD', label: 'USD' },
                                        { value: 'EUR', label: 'EUR' },
                                        { value: 'GBP', label: 'GBP' },
                                        { value: 'BDT', label: 'BDT' },
                                        { value: 'CAD', label: 'CAD' },
                                        { value: 'AUD', label: 'AUD' }
                                    ]}
                                    onChange={(val) => handleInputChange('fee_currency', val)}
                                />
                            </View>
                        </View>

                        <TextInput style={styles.input} placeholder="Payment Method (e.g., Bank Transfer, Credit Card)" value={formData.fee_method} onChangeText={(v) => handleInputChange('fee_method', v)} />

                        <FilterDropdown
                            label="Payment Status"
                            value={formData.fee_status || 'Pending'}
                            options={[
                                { value: 'Pending', label: 'Pending' },
                                { value: 'Paid', label: 'Paid' },
                                { value: 'Partial', label: 'Partial Payment' },
                                { value: 'Refunded', label: 'Refunded' }
                            ]}
                            onChange={(val) => handleInputChange('fee_status', val)}
                        />

                        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument('fee_proof')}>
                            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                            <Text style={styles.uploadText}>{formData.fee_proof?.name || 'Upload Payment Receipt'}</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'zoom': // Interview
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>University Interview</Text>
                        <TextInput style={styles.input} placeholder="Interview Date & Time (YYYY-MM-DD HH:MM)" value={formData.interview_date} onChangeText={(v) => handleInputChange('interview_date', v)} />
                        <TextInput style={styles.input} placeholder="Platform (e.g. Zoom, Microsoft Teams)" value={formData.interview_platform} onChangeText={(v) => handleInputChange('interview_platform', v)} />
                        <TextInput style={styles.input} placeholder="Interviewer Name" value={formData.interviewer_name} onChangeText={(v) => handleInputChange('interviewer_name', v)} />

                        <FilterDropdown
                            label="Interview Result"
                            value={formData.interview_result || 'Pending'}
                            options={[
                                { value: 'Pending', label: 'Pending' },
                                { value: 'Accepted', label: 'Accepted' },
                                { value: 'Rejected', label: 'Rejected' },
                                { value: 'Waitlisted', label: 'Waitlisted' }
                            ]}
                            onChange={(val) => handleInputChange('interview_result', val)}
                        />

                        <TextInput style={styles.input} placeholder="Result Date (YYYY-MM-DD)" value={formData.interview_result_date} onChangeText={(v) => handleInputChange('interview_result_date', v)} />
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Interview Feedback" multiline numberOfLines={3} value={formData.interview_feedback} onChangeText={(v) => handleInputChange('interview_feedback', v)} />
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Interview Summary / Notes" multiline numberOfLines={3} value={formData.interview_summary} onChangeText={(v) => handleInputChange('interview_summary', v)} />

                        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument('interview_recording')}>
                            <Ionicons name="videocam-outline" size={20} color={colors.primary} />
                            <Text style={styles.uploadText}>{formData.interview_recording?.name || 'Upload Interview Recording (Admin Only)'}</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'conditionalOffer': // Offer Letter
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>Offer Letter</Text>
                        <TextInput style={styles.input} placeholder="Offer Date (YYYY-MM-DD)" value={formData.conditional_offer_date} onChangeText={(v) => handleInputChange('conditional_offer_date', v)} />
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Conditional Conditions (if any)" multiline numberOfLines={4} value={formData.conditional_conditions} onChangeText={(v) => handleInputChange('conditional_conditions', v)} />

                        <View style={styles.row}>
                            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Tuition Fee Amount" value={formData.tuition_fee_offer} onChangeText={(v) => handleInputChange('tuition_fee_offer', v)} keyboardType="numeric" />
                            <View style={{ width: 120 }}>
                                <FilterDropdown
                                    value={formData.tuition_currency || 'USD'}
                                    options={[
                                        { value: 'USD', label: 'USD' },
                                        { value: 'EUR', label: 'EUR' },
                                        { value: 'GBP', label: 'GBP' },
                                        { value: 'CAD', label: 'CAD' },
                                        { value: 'AUD', label: 'AUD' }
                                    ]}
                                    onChange={(val) => handleInputChange('tuition_currency', val)}
                                />
                            </View>
                        </View>

                        <TextInput style={[styles.input, styles.textArea]} placeholder="Tuition Comments / Payment Plan" multiline numberOfLines={2} value={formData.tuition_comments} onChangeText={(v) => handleInputChange('tuition_comments', v)} />

                        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument('conditional_offer_upload')}>
                            <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                            <Text style={styles.uploadText}>{formData.conditional_offer_upload?.name || 'Upload Offer Letter'}</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'tuitionFee': // Tuition Fee
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>Tuition Fee Payment</Text>
                        <View style={styles.row}>
                            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Amount" value={formData.tuition_fee_amount} onChangeText={(v) => handleInputChange('tuition_fee_amount', v)} keyboardType="numeric" />
                            <TextInput style={[styles.input, { width: 80 }]} placeholder="USD" value={formData.tuition_fee_currency} onChangeText={(v) => handleInputChange('tuition_fee_currency', v)} />
                        </View>
                        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument('tuition_fee_proof')}>
                            <Ionicons name="cash-outline" size={20} color={colors.primary} />
                            <Text style={styles.uploadText}>{formData.tuition_fee_proof?.name || 'Upload Transfer Proof'}</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'mainofferletter': // Final Offer
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>Final Offer Letter</Text>
                        <TextInput style={styles.input} placeholder="Final Offer Date" value={formData.main_offer_date} onChangeText={(v) => handleInputChange('main_offer_date', v)} />
                        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument('main_offer_upload')}>
                            <Ionicons name="ribbon-outline" size={20} color={colors.primary} />
                            <Text style={styles.uploadText}>{formData.main_offer_upload?.name || 'Upload Final Offer'}</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'embassydocument': // Embassy Docs
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>Embassy Documents</Text>
                        {['motivation_letter', 'europass_cv', 'bank_statement', 'birth_certificate', 'police_clearance'].map(docKey => (
                            <TouchableOpacity key={docKey} style={styles.docRow} onPress={() => pickDocument(docKey)}>
                                <View style={styles.docInfo}>
                                    <Ionicons name="folder-open-outline" size={24} color={colors.primary} />
                                    <Text style={styles.docLabel}>{docKey.replace('_', ' ').toUpperCase()}</Text>
                                </View>
                                <View style={styles.docStatus}>
                                    <Text style={[styles.statusTag, { backgroundColor: formData[docKey] ? colors.success + '15' : colors.gray100 }]}>
                                        {formData[docKey] ? 'Uploaded' : 'Pending'}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 'embassyappoint': // Appointment
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>Embassy Appointment</Text>
                        <TextInput style={styles.input} placeholder="Location" value={formData.appointment_location} onChangeText={(v) => handleInputChange('appointment_location', v)} />
                        <TextInput style={styles.input} placeholder="Date & Time" value={formData.appointment_datetime} onChangeText={(v) => handleInputChange('appointment_datetime', v)} />
                        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument('appointment_letter')}>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                            <Text style={styles.uploadText}>{formData.appointment_letter?.name || 'Upload Appointment Letter'}</Text>
                        </TouchableOpacity>
                    </View>
                );

            case 'embassyinterview': // Visa Approval
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>Embassy Interview</Text>
                        <TextInput style={styles.input} placeholder="Result Date" value={formData.embassy_result_date} onChangeText={(v) => handleInputChange('embassy_result_date', v)} />
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Interview Feedback" multiline value={formData.embassy_feedback} onChangeText={(v) => handleInputChange('embassy_feedback', v)} />
                        <TextInput style={styles.input} placeholder="Result (Approved/Rejected)" value={formData.embassy_result} onChangeText={(v) => handleInputChange('embassy_result', v)} />
                    </View>
                );

            case 'visaStatus': // Visa Status
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>Final Visa Status</Text>

                        <FilterDropdown
                            label="Visa Status"
                            value={formData.visa_status || 'Pending'}
                            options={[
                                { value: 'Pending', label: 'Pending' },
                                { value: 'Approved', label: 'Approved' },
                                { value: 'Issued', label: 'Issued' },
                                { value: 'Rejected', label: 'Rejected' }
                            ]}
                            onChange={(val) => handleInputChange('visa_status', val)}
                        />

                        <TextInput style={styles.input} placeholder="Decision Date (YYYY-MM-DD)" value={formData.decision_date} onChangeText={(v) => handleInputChange('decision_date', v)} />

                        <TouchableOpacity style={styles.uploadBtn} onPress={() => pickDocument('visa_sticker_upload')}>
                            <Ionicons name="image-outline" size={20} color={colors.primary} />
                            <Text style={styles.uploadText}>{formData.visa_sticker_upload?.name || 'Upload Visa Sticker / Approval Document'}</Text>
                        </TouchableOpacity>

                        {(formData.visa_status === 'Rejected') && (
                            <>
                                <TextInput style={[styles.input, styles.textArea]} placeholder="Rejection Reason (Detailed Explanation)" multiline numberOfLines={4} value={formData.rejection_reason} onChangeText={(v) => handleInputChange('rejection_reason', v)} />

                                <FilterDropdown
                                    label="Appeal Status"
                                    value={formData.appeal_status || 'Not Required'}
                                    options={[
                                        { value: 'Not Required', label: 'Not Required' },
                                        { value: 'Appealed', label: 'Appealed' },
                                        { value: 'Under Review', label: 'Under Review' },
                                        { value: 'Approved', label: 'Appeal Approved' },
                                        { value: 'Rejected', label: 'Appeal Rejected' }
                                    ]}
                                    onChange={(val) => handleInputChange('appeal_status', val)}
                                />
                            </>
                        )}
                    </View>
                );

            default:
                return (
                    <View style={styles.stageCard}>
                        <Text style={styles.stageTitle}>{VISA_STAGES.find(s => s.key === activeStep)?.label}</Text>
                        <Text style={styles.stageDesc}>Management for this stage.</Text>
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Notes" multiline value={formData.additional_comments} onChangeText={(v) => handleInputChange('additional_comments', v)} />
                    </View>
                );
        }
    };

    if (initLoading) return <LoadingSpinner />;

    return (
        <View style={styles.safeArea}>
            {/* CustomHeader removed to avoid double header */}
            <View style={styles.headerSelection}>
                <FilterDropdown
                    label="Active Application"
                    placeholder="Select University"
                    value={selectedUniId}
                    options={universities.map(u => ({ value: u.id.toString(), label: u.name }))}
                />
            </View>

            <View style={styles.stepperContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepperContent}>
                    {VISA_STAGES.map((step, index) => {
                        const isActive = activeStep === step.key;
                        const isCompleted = completedSteps.includes(step.key);
                        return (
                            <TouchableOpacity
                                key={step.key}
                                style={[styles.stepItem, isActive && styles.stepItemActive]}
                                onPress={() => setActiveStep(step.key)}
                            >
                                <View style={[
                                    styles.stepBadge,
                                    isCompleted ? styles.stepBadgeDone : (isActive ? styles.stepBadgeActive : styles.stepBadgePending)
                                ]}>
                                    {isCompleted ? (
                                        <Ionicons name="checkmark" size={16} color={colors.white} />
                                    ) : (
                                        <Ionicons name={step.icon} size={16} color={isActive ? colors.white : colors.gray500} />
                                    )}
                                </View>
                                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{step.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 10 }} />}

                {selectedUniId ? (
                    <>
                        <View style={styles.progressSection}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressTitle}>Overall Progress</Text>
                                <Text style={styles.progressPercent}>{Math.round((completedSteps.length / VISA_STAGES.length) * 100)}%</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBar, { width: `${(completedSteps.length / VISA_STAGES.length) * 100}%` }]} />
                            </View>
                        </View>

                        {renderStepContent()}

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>Save & Next Step</Text>
                            <Ionicons name="arrow-forward" size={20} color={colors.white} />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="business-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>Select a university to view your visa journey</Text>
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    headerSelection: { padding: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
    stepperContainer: { backgroundColor: colors.white, paddingVertical: spacing.sm, ...shadows.sm },
    stepperContent: { paddingHorizontal: spacing.md },
    stepItem: { alignItems: 'center', marginRight: spacing.lg, opacity: 0.6, width: 80 },
    stepItemActive: { opacity: 1 },
    stepBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    stepBadgePending: { backgroundColor: colors.gray100 },
    stepBadgeActive: { backgroundColor: colors.primary },
    stepBadgeDone: { backgroundColor: colors.success },
    stepLabel: { fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
    stepLabelActive: { color: colors.primary, fontWeight: '700' },
    content: {
        flex: 1,
        padding: spacing.md,
        paddingBottom: BOTTOM_TAB_SPACING,
    },
    progressSection: { backgroundColor: colors.white, padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.md, ...shadows.sm },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressTitle: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },
    progressPercent: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary },
    progressBarBg: { height: 8, backgroundColor: colors.gray100, borderRadius: 4, overflow: 'hidden' },
    progressBar: { height: '100%', backgroundColor: colors.primary },
    stageCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadows.md },
    stageTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    stageDesc: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.md },
    input: { backgroundColor: colors.gray100, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSizes.md, color: colors.text, marginBottom: spacing.md },
    textArea: { height: 100, textAlignVertical: 'top' },
    uploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', borderWidth: 1, borderColor: colors.primary + '50', borderStyle: 'dashed', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md },
    uploadText: { marginLeft: 10, color: colors.primary, fontSize: fontSizes.sm, fontWeight: '600', flex: 1 },
    docContainer: { marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100, paddingBottom: spacing.sm },
    docRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
    docInfo: { flexDirection: 'row', alignItems: 'center' },
    docLabel: { marginLeft: 12, fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },
    docStatus: { flexDirection: 'row', alignItems: 'center' },
    statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 10, color: colors.textSecondary, marginRight: 8, overflow: 'hidden' },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, paddingLeft: 36 },
    statusLabel: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.textSecondary, marginRight: spacing.sm, minWidth: 50 },
    saveBtn: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, borderRadius: borderRadius.md, marginTop: spacing.lg, ...shadows.md },
    saveBtnText: { color: colors.white, fontSize: fontSizes.md, fontWeight: '700', marginRight: 10 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: spacing.md, color: colors.textSecondary, textAlign: 'center' },
    row: { flexDirection: 'row' },
});

export default VisaProcessingScreen;
