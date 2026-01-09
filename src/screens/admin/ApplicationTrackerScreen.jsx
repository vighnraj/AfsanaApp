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
import {
    getAllApplications,
    deleteApplication,
    updateApplicationStatus,
    getAllCounselors,
    getAllProcessors,
    assignCounselorToApplication,
    assignProcessorToApplication,
} from '../../api/applicationApi';
import DatePickerModal from '../../components/common/DatePickerModal';

const ApplicationTrackerScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [counselors, setCounselors] = useState([]);
    const [processors, setProcessors] = useState([]);

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

    useEffect(() => {
        fetchApplications();
        fetchCounselors();
        fetchProcessors();
    }, [fetchApplications, fetchCounselors, fetchProcessors]);

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
                    <TouchableOpacity onPress={() => handleDeleteApplication(item.id)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
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
});

export default ApplicationTrackerScreen;
