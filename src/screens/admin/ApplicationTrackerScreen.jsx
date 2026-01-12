// Application Tracker Dashboard Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    FlatList,
    Modal,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { CustomHeader } from '../../components/common';
import { showToast } from '../../components/common/Toast';
import { BOTTOM_TAB_SPACING, BOTTOM_TAB_HEIGHT } from '../../utils/constants';
import {
    getAllApplications,
    deleteApplication,
    updateApplicationStatus,
    getAllCounselors,
    getAllProcessors,
    assignCounselorToApplication,
    assignProcessorToApplication,
    getAllStudents,
    getAllUniversities,
    createApplication,
    updateApplication,
} from '../../api/applicationApi';
import DatePickerModal from '../../components/common/DatePickerModal';
import * as DocumentPicker from 'expo-document-picker';

const ApplicationTrackerScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [counselors, setCounselors] = useState([]);
    const [processors, setProcessors] = useState([]);
    const [students, setStudents] = useState([]);
    const [universities, setUniversities] = useState([]);

    // Filter states
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [travelInsuranceFilter, setTravelInsuranceFilter] = useState('');
    const [stepFilter, setStepFilter] = useState('');

    // Assign modals
    const [showCounselorModal, setShowCounselorModal] = useState(false);
    const [showProcessorModal, setShowProcessorModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [selectedCounselor, setSelectedCounselor] = useState('');
    const [selectedProcessor, setSelectedProcessor] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [notes, setNotes] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Create/Edit Application Modal
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [editingApplication, setEditingApplication] = useState(null);
    const [formData, setFormData] = useState({
        student_id: '',
        university_id: '',
        program_name: '',
        application_date: '',
        decision_status: '',
    });
    const [offerLetterFile, setOfferLetterFile] = useState(null);
    const [showAppDatePicker, setShowAppDatePicker] = useState(false);

    // Fetch applications
    const fetchApplications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllApplications();
            setApplications(data);
            setFilteredApplications(data);
        } catch (error) {
            console.error('Fetch applications error:', error);
            showToast.error('Error', 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch counselors
    const fetchCounselors = useCallback(async () => {
        try {
            const data = await getAllCounselors();
            setCounselors(data);
        } catch (error) {
            console.error('Fetch counselors error:', error);
        }
    }, []);

    // Fetch processors
    const fetchProcessors = useCallback(async () => {
        try {
            const data = await getAllProcessors();
            setProcessors(data);
        } catch (error) {
            console.error('Fetch processors error:', error);
        }
    }, []);

    // Fetch students
    const fetchStudents = useCallback(async () => {
        try {
            const data = await getAllStudents();
            setStudents(data);
        } catch (error) {
            console.error('Fetch students error:', error);
        }
    }, []);

    // Fetch universities
    const fetchUniversities = useCallback(async () => {
        try {
            const data = await getAllUniversities();
            setUniversities(data);
        } catch (error) {
            console.error('Fetch universities error:', error);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
        fetchCounselors();
        fetchProcessors();
        fetchStudents();
        fetchUniversities();
    }, [fetchApplications, fetchCounselors, fetchProcessors, fetchStudents, fetchUniversities]);

    // Apply filters
    useEffect(() => {
        let filtered = [...applications];

        if (selectedUniversity) {
            filtered = filtered.filter((app) => app.university_name === selectedUniversity);
        }

        if (selectedStudent) {
            filtered = filtered.filter((app) => app.student_name === selectedStudent);
        }

        if (travelInsuranceFilter) {
            if (travelInsuranceFilter === 'Complete') {
                filtered = filtered.filter((app) => app.travel_insurance);
            } else if (travelInsuranceFilter === 'Pending') {
                filtered = filtered.filter((app) => !app.travel_insurance);
            }
        }

        if (stepFilter) {
            if (stepFilter === 'Application') {
                filtered = filtered.filter((app) => app.Application_stage === 1);
            } else if (stepFilter === 'Interview') {
                filtered = filtered.filter((app) => app.Interview === 1);
            } else if (stepFilter === 'Visa') {
                filtered = filtered.filter((app) => app.Visa_process === 1);
            }
        }

        setFilteredApplications(filtered);
    }, [selectedUniversity, selectedStudent, travelInsuranceFilter, stepFilter, applications]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchApplications();
        setRefreshing(false);
    }, [fetchApplications]);

    // Get unique universities
    const getUniqueUniversities = () => {
        const universities = applications.map((app) => app.university_name).filter(Boolean);
        return [...new Set(universities)];
    };

    // Get unique students
    const getUniqueStudents = () => {
        const students = applications.map((app) => app.student_name).filter(Boolean);
        return [...new Set(students)];
    };

    // Clear filters
    const clearFilters = () => {
        setSelectedUniversity('');
        setSelectedStudent('');
        setTravelInsuranceFilter('');
        setStepFilter('');
    };

    // Handle delete application
    const handleDeleteApplication = async (id) => {
        try {
            await deleteApplication(id);
            showToast.success('Success', 'Application deleted successfully');
            fetchApplications();
        } catch (error) {
            console.error('Delete application error:', error);
            showToast.error('Error', 'Failed to delete application');
        }
    };

    // Open Create Application Modal
    const openCreateApplicationModal = () => {
        setEditingApplication(null);
        setFormData({
            student_id: '',
            university_id: '',
            program_name: '',
            application_date: '',
            decision_status: '',
        });
        setOfferLetterFile(null);
        setShowApplicationModal(true);
    };

    // Open Edit Application Modal
    const openEditApplicationModal = (app) => {
        setEditingApplication(app);
        setFormData({
            student_id: app.student_id?.toString() || '',
            university_id: app.university_id?.toString() || '',
            program_name: app.program_name || '',
            application_date: app.application_date || '',
            decision_status: app.decision_status || '',
        });
        setOfferLetterFile(null);
        setShowApplicationModal(true);
    };

    // Handle file picker
    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets.length > 0) {
                setOfferLetterFile(result.assets[0]);
                showToast.success('Success', 'File selected');
            }
        } catch (error) {
            console.error('Document picker error:', error);
            showToast.error('Error', 'Failed to pick file');
        }
    };

    // Handle form field change
    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle Submit Application
    const handleSubmitApplication = async () => {
        // Validation
        if (!formData.student_id || !formData.university_id || !formData.program_name) {
            showToast.error('Validation', 'Please fill all required fields');
            return;
        }

        setModalLoading(true);
        try {
            const submitData = new FormData();
            submitData.append('student_id', formData.student_id);
            submitData.append('university_id', formData.university_id);
            submitData.append('program_name', formData.program_name);
            submitData.append('application_date', formData.application_date || new Date().toISOString().split('T')[0]);
            submitData.append('decision_status', formData.decision_status || 'Pending');

            // Add file if selected
            if (offerLetterFile) {
                submitData.append('offer_letter', {
                    uri: offerLetterFile.uri,
                    type: offerLetterFile.mimeType || 'application/pdf',
                    name: offerLetterFile.name || 'offer_letter.pdf',
                });
            }

            if (editingApplication) {
                // Update existing application
                await updateApplication(editingApplication.id, submitData);
                showToast.success('Success', 'Application updated successfully');
            } else {
                // Create new application
                await createApplication(submitData);
                showToast.success('Success', 'Application created successfully');
            }

            setShowApplicationModal(false);
            fetchApplications();
        } catch (error) {
            console.error('Submit application error:', error);
            showToast.error('Error', error.response?.data?.message || 'Failed to save application');
        } finally {
            setModalLoading(false);
        }
    };

    // Toggle verification status
    const handleToggleVerification = async (app) => {
        try {
            const newStatus = app.status === 1 ? 0 : 1;
            await updateApplicationStatus(app.id, { status: newStatus });
            showToast.success('Success', `Status updated to ${newStatus === 1 ? 'Verified' : 'Pending'}`);
            fetchApplications();
        } catch (error) {
            console.error('Update status error:', error);
            showToast.error('Error', 'Failed to update status');
        }
    };

    // Open assign counselor modal
    const openAssignCounselorModal = (app) => {
        setSelectedApplication(app);
        setSelectedCounselor(app.counselor_id?.toString() || '');
        setFollowUpDate('');
        setNotes('');
        setShowCounselorModal(true);
    };

    // Handle assign counselor
    const handleAssignCounselor = async () => {
        if (!selectedCounselor) {
            showToast.error('Validation', 'Please select a counselor');
            return;
        }
        if (!followUpDate) {
            showToast.error('Validation', 'Please select a follow-up date');
            return;
        }

        setModalLoading(true);
        try {
            await assignCounselorToApplication({
                application_id: selectedApplication.id,
                counselor_id: parseInt(selectedCounselor),
                follow_up: followUpDate,
                notes: notes || '',
            });
            showToast.success('Success', 'Counselor assigned successfully');
            setShowCounselorModal(false);
            fetchApplications();
        } catch (error) {
            console.error('Assign counselor error:', error);
            showToast.error('Error', 'Failed to assign counselor');
        } finally {
            setModalLoading(false);
        }
    };

    // Open assign processor modal
    const openAssignProcessorModal = (app) => {
        setSelectedApplication(app);
        setSelectedProcessor(app.processor_id?.toString() || '');
        setShowProcessorModal(true);
    };

    // Handle assign processor
    const handleAssignProcessor = async () => {
        if (!selectedProcessor) {
            showToast.error('Validation', 'Please select a processor');
            return;
        }

        setModalLoading(true);
        try {
            await assignProcessorToApplication({
                application_id: selectedApplication.id,
                processor_id: parseInt(selectedProcessor),
            });
            showToast.success('Success', 'Processor assigned successfully');
            setShowProcessorModal(false);
            fetchApplications();
        } catch (error) {
            console.error('Assign processor error:', error);
            showToast.error('Error', 'Failed to assign processor');
        } finally {
            setModalLoading(false);
        }
    };

    // Get status badge
    const getStatusBadge = (app) => {
        if (app.Visa_process === 1) {
            return { text: 'Visa Process', color: colors.info };
        }
        if (app.Interview === 1) {
            return { text: 'Interview Stage', color: colors.warning };
        }
        if (app.Application_stage === 1) {
            return { text: 'Application Stage', color: colors.primary };
        }
        return { text: 'N/A', color: colors.gray400 };
    };

    // Render application card
    const renderApplicationCard = ({ item, index }) => {
        const statusBadge = getStatusBadge(item);

        return (
            <View style={[styles.card, shadows.sm]}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <Text style={styles.cardIndex}>#{index + 1}</Text>
                        <Text style={styles.cardTitle}>{item.student_name}</Text>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity onPress={() => openEditApplicationModal(item)} style={{ marginRight: spacing.sm }}>
                            <Ionicons name="create-outline" size={20} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteApplication(item.id)}>
                            <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* University */}
                <View style={styles.cardRow}>
                    <Ionicons name="school" size={16} color={colors.textSecondary} />
                    <Text style={styles.cardLabel}>University:</Text>
                    <Text style={styles.cardValue}>{item.university_name}</Text>
                </View>

                {/* Documents Status */}
                <View style={styles.cardRow}>
                    <Ionicons name="document-text" size={16} color={colors.textSecondary} />
                    <Text style={styles.cardLabel}>Travel Insurance:</Text>
                    <View
                        style={[
                            styles.badge,
                            { backgroundColor: item.travel_insurance ? colors.successLight : colors.warningLight },
                        ]}
                    >
                        <Text
                            style={[
                                styles.badgeText,
                                { color: item.travel_insurance ? colors.success : colors.warning },
                            ]}
                        >
                            {item.travel_insurance ? 'Complete' : 'Pending'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardRow}>
                    <Ionicons name="cash" size={16} color={colors.textSecondary} />
                    <Text style={styles.cardLabel}>Proof of Income:</Text>
                    <View
                        style={[
                            styles.badge,
                            { backgroundColor: item.proof_of_income ? colors.successLight : colors.warningLight },
                        ]}
                    >
                        <Text
                            style={[
                                styles.badgeText,
                                { color: item.proof_of_income ? colors.success : colors.warning },
                            ]}
                        >
                            {item.proof_of_income ? 'Complete' : 'Pending'}
                        </Text>
                    </View>
                </View>

                {/* Assignments */}
                <View style={styles.cardRow}>
                    <Ionicons name="person" size={16} color={colors.textSecondary} />
                    <Text style={styles.cardLabel}>Counselor:</Text>
                    {item.counselor_name ? (
                        <Text style={styles.cardValue}>{item.counselor_name}</Text>
                    ) : (
                        <TouchableOpacity onPress={() => openAssignCounselorModal(item)}>
                            <Text style={styles.linkText}>Assign</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.cardRow}>
                    <Ionicons name="people" size={16} color={colors.textSecondary} />
                    <Text style={styles.cardLabel}>Processor:</Text>
                    {item.processor_name ? (
                        <Text style={styles.cardValue}>{item.processor_name}</Text>
                    ) : (
                        <TouchableOpacity onPress={() => openAssignProcessorModal(item)}>
                            <Text style={styles.linkText}>Assign</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Verification Status */}
                <View style={styles.cardRow}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.textSecondary} />
                    <Text style={styles.cardLabel}>Document Verify:</Text>
                    <TouchableOpacity onPress={() => handleToggleVerification(item)}>
                        <View
                            style={[
                                styles.badge,
                                { backgroundColor: item.status === 1 ? colors.successLight : colors.warningLight },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.badgeText,
                                    { color: item.status === 1 ? colors.success : colors.warning },
                                ]}
                            >
                                {item.status === 1 ? 'Verified' : 'Pending'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Status Badge */}
                <View style={styles.cardRow}>
                    <Ionicons name="flag" size={16} color={colors.textSecondary} />
                    <Text style={styles.cardLabel}>Status:</Text>
                    <View style={[styles.badge, { backgroundColor: `${statusBadge.color}20` }]}>
                        <Text style={[styles.badgeText, { color: statusBadge.color }]}>
                            {statusBadge.text}
                        </Text>
                    </View>
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('StudentDetails', { studentId: item.id })}
                >
                    <Text style={styles.viewButtonText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
            </View>
        );
    };

    if (loading && applications.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <CustomHeader title="Application Tracker" showBack={false} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading applications...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <CustomHeader
                title="Application Tracker"
                showBack={false}
                rightAction={
                    <TouchableOpacity onPress={() => setShowFilterModal(true)}>
                        <Ionicons name="filter" size={24} color={colors.text} />
                    </TouchableOpacity>
                }
            />

            <FlatList
                data={filteredApplications}
                renderItem={renderApplicationCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No applications found</Text>
                    </View>
                }
            />

            {/* Filter Modal */}
            <Modal visible={showFilterModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, shadows.lg]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter Applications</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* University Filter */}
                            <Text style={styles.filterLabel}>University</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedUniversity}
                                    onValueChange={(value) => setSelectedUniversity(value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="All Universities" value="" />
                                    {getUniqueUniversities().map((uni, idx) => (
                                        <Picker.Item key={idx} label={uni} value={uni} />
                                    ))}
                                </Picker>
                            </View>

                            {/* Student Filter */}
                            <Text style={styles.filterLabel}>Student</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedStudent}
                                    onValueChange={(value) => setSelectedStudent(value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="All Students" value="" />
                                    {getUniqueStudents().map((student, idx) => (
                                        <Picker.Item key={idx} label={student} value={student} />
                                    ))}
                                </Picker>
                            </View>

                            {/* Travel Insurance Filter */}
                            <Text style={styles.filterLabel}>Travel Insurance Status</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={travelInsuranceFilter}
                                    onValueChange={(value) => setTravelInsuranceFilter(value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="All" value="" />
                                    <Picker.Item label="Complete" value="Complete" />
                                    <Picker.Item label="Pending" value="Pending" />
                                </Picker>
                            </View>

                            {/* Step Filter */}
                            <Text style={styles.filterLabel}>Application Step</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={stepFilter}
                                    onValueChange={(value) => setStepFilter(value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="All Steps" value="" />
                                    <Picker.Item label="Application Stage" value="Application" />
                                    <Picker.Item label="Interview Stage" value="Interview" />
                                    <Picker.Item label="Visa Process" value="Visa" />
                                </Picker>
                            </View>

                            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                                <Text style={styles.clearButtonText}>Clear Filters</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => setShowFilterModal(false)}
                        >
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Assign Counselor Modal */}
            <Modal visible={showCounselorModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, shadows.lg]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Assign Counselor</Text>
                            <TouchableOpacity onPress={() => setShowCounselorModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.filterLabel}>Select Counselor *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedCounselor}
                                    onValueChange={(value) => setSelectedCounselor(value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="-- Select Counselor --" value="" />
                                    {counselors.map((counselor) => (
                                        <Picker.Item
                                            key={counselor.id}
                                            label={counselor.name || counselor.email}
                                            value={counselor.id.toString()}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            <Text style={styles.filterLabel}>Follow-up Date *</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                                <Text style={styles.dateButtonText}>
                                    {followUpDate || 'Select Follow-up Date'}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.filterLabel}>Notes</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Enter notes..."
                                placeholderTextColor={colors.gray400}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.applyButton, modalLoading && styles.applyButtonDisabled]}
                            onPress={handleAssignCounselor}
                            disabled={modalLoading}
                        >
                            {modalLoading ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <Text style={styles.applyButtonText}>Assign Counselor</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Assign Processor Modal */}
            <Modal visible={showProcessorModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, shadows.lg]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Assign Processor</Text>
                            <TouchableOpacity onPress={() => setShowProcessorModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <Text style={styles.filterLabel}>Select Processor *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedProcessor}
                                    onValueChange={(value) => setSelectedProcessor(value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="-- Select Processor --" value="" />
                                    {processors.map((processor) => (
                                        <Picker.Item
                                            key={processor.id}
                                            label={processor.name || processor.email}
                                            value={processor.id.toString()}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.applyButton, modalLoading && styles.applyButtonDisabled]}
                            onPress={handleAssignProcessor}
                            disabled={modalLoading}
                        >
                            {modalLoading ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <Text style={styles.applyButtonText}>Assign Processor</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Date Picker */}
            <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onSelectDate={(date) => {
                    setFollowUpDate(date);
                    setShowDatePicker(false);
                }}
                selectedDate={followUpDate}
                title="Select Follow-up Date"
            />

            {/* Create/Edit Application Modal */}
            <Modal visible={showApplicationModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, shadows.lg]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingApplication ? 'Edit Application' : 'Create Application'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowApplicationModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Student Selection */}
                            <Text style={styles.filterLabel}>Student *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.student_id}
                                    onValueChange={(value) => handleFormChange('student_id', value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="-- Select Student --" value="" />
                                    {students.map((student) => (
                                        <Picker.Item
                                            key={student.id}
                                            label={student.full_name || student.name || student.email}
                                            value={student.id.toString()}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            {/* University Selection */}
                            <Text style={styles.filterLabel}>University *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.university_id}
                                    onValueChange={(value) => handleFormChange('university_id', value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="-- Select University --" value="" />
                                    {universities.map((uni) => (
                                        <Picker.Item
                                            key={uni.id}
                                            label={uni.name || uni.university_name}
                                            value={uni.id.toString()}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            {/* Program Name */}
                            <Text style={styles.filterLabel}>Program Name *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g., MSc Computer Science"
                                placeholderTextColor={colors.gray400}
                                value={formData.program_name}
                                onChangeText={(value) => handleFormChange('program_name', value)}
                            />

                            {/* Application Date */}
                            <Text style={styles.filterLabel}>Application Date</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowAppDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                                <Text style={styles.dateButtonText}>
                                    {formData.application_date || 'Select Application Date'}
                                </Text>
                            </TouchableOpacity>

                            {/* Decision Status */}
                            <Text style={styles.filterLabel}>Decision Status</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.decision_status}
                                    onValueChange={(value) => handleFormChange('decision_status', value)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Pending" value="Pending" />
                                    <Picker.Item label="Accepted" value="Accepted" />
                                    <Picker.Item label="Rejected" value="Rejected" />
                                    <Picker.Item label="Waitlisted" value="Waitlisted" />
                                </Picker>
                            </View>

                            {/* Offer Letter Upload */}
                            <Text style={styles.filterLabel}>Offer Letter (Optional)</Text>
                            <TouchableOpacity style={styles.uploadButton} onPress={handlePickDocument}>
                                <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
                                <Text style={styles.uploadButtonText}>
                                    {offerLetterFile ? offerLetterFile.name : 'Upload Offer Letter'}
                                </Text>
                            </TouchableOpacity>
                            {offerLetterFile && (
                                <Text style={styles.fileSelectedText}>
                                    File selected: {offerLetterFile.name}
                                </Text>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.applyButton, modalLoading && styles.applyButtonDisabled]}
                            onPress={handleSubmitApplication}
                            disabled={modalLoading}
                        >
                            {modalLoading ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <Text style={styles.applyButtonText}>
                                    {editingApplication ? 'Update Application' : 'Create Application'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Application Date Picker */}
            <DatePickerModal
                visible={showAppDatePicker}
                onClose={() => setShowAppDatePicker(false)}
                onSelectDate={(date) => {
                    handleFormChange('application_date', date);
                    setShowAppDatePicker(false);
                }}
                selectedDate={formData.application_date}
                title="Select Application Date"
            />

            {/* FAB - Create Application Button */}
            <TouchableOpacity style={styles.fab} onPress={openCreateApplicationModal}>
                <Ionicons name="add" size={28} color={colors.white} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSizes.md,
        color: colors.textSecondary,
    },
    listContainer: {
        padding: spacing.md,
        paddingBottom: BOTTOM_TAB_SPACING,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cardIndex: {
        fontSize: fontSizes.sm,
        fontWeight: '700',
        color: colors.primary,
        marginRight: spacing.xs,
    },
    cardTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        gap: spacing.xs,
    },
    cardLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    cardValue: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    badge: {
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    badgeText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
    },
    linkText: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        padding: spacing.sm,
        backgroundColor: `${colors.primary}10`,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    viewButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.primary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: fontSizes.md,
        color: colors.textSecondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    modalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    modalContent: {
        padding: spacing.md,
    },
    filterLabel: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        backgroundColor: colors.gray50,
    },
    picker: {
        height: 50,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray200,
        gap: spacing.xs,
    },
    dateButtonText: {
        fontSize: fontSizes.sm,
        color: colors.text,
    },
    textArea: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        backgroundColor: colors.gray50,
        fontSize: fontSizes.sm,
        color: colors.text,
        minHeight: 100,
    },
    clearButton: {
        marginTop: spacing.md,
        padding: spacing.sm,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    applyButton: {
        margin: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    applyButtonDisabled: {
        opacity: 0.6,
    },
    applyButtonText: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.white,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        backgroundColor: colors.gray50,
        fontSize: fontSizes.sm,
        color: colors.text,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        backgroundColor: `${colors.primary}10`,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        gap: spacing.xs,
    },
    uploadButtonText: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    fileSelectedText: {
        fontSize: fontSizes.xs,
        color: colors.success,
        marginTop: spacing.xs,
        fontStyle: 'italic',
    },
    fab: {
        position: 'absolute',
        bottom: BOTTOM_TAB_HEIGHT + 20,
        right: spacing.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.lg,
        elevation: 8,
    },
});

export default ApplicationTrackerScreen;
