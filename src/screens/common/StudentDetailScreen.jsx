import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Linking,
    FlatList,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Modal, TextInput, ActivityIndicator } from 'react-native';

import { getStudentById, getStudentApplications, updateStudent, deleteStudent } from '../../api/studentApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { CustomHeader, FilterDropdown } from '../../components/common';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable, getInitials } from '../../utils/formatting';
import { STATUS_OPTIONS, GENDER_OPTIONS } from '../../utils/constants';
import DateRangePicker from '../../components/common/DateRangePicker';
import { BOTTOM_TAB_SPACING } from '../../utils/constants';

const StudentDetailScreen = ({ navigation, route }) => {
    const { studentId } = route.params;
    const insets = useSafeAreaInsets();

    const [student, setStudent] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'applications'

    // Edit Modal State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editData, setEditData] = useState({
        full_name: '',
        phone: '',
        city: '',
        gender: '',
        date_of_birth: '',
        highest_education_level: '',
        grade_average: '',
    });

    const fetchStudentDetails = useCallback(async () => {
        try {
            const [studentData, appsData] = await Promise.all([
                getStudentById(studentId),
                getStudentApplications(studentId).catch(err => {
                    console.warn('Failed to fetch applications', err);
                    return [];
                })
            ]);

            setStudent(studentData.data || studentData);
            setApplications(Array.isArray(appsData) ? appsData : []);
        } catch (error) {
            console.error('Fetch student details error:', error);
            showToast.error('Error', 'Failed to load student details');
            navigation.goBack();
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [studentId, navigation]);

    useEffect(() => {
        fetchStudentDetails();
    }, [fetchStudentDetails]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStudentDetails();
    };

    const handleEditPress = () => {
        setEditData({
            full_name: student.full_name || student.name || '',
            phone: student.phone || '',
            city: student.city || '',
            gender: student.gender || '',
            date_of_birth: student.date_of_birth || '',
            highest_education_level: student.highest_education_level || '',
            grade_average: student.grade_average || '',
        });
        setEditModalVisible(true);
    };

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            await updateStudent(studentId, editData);
            showToast.success('Success', 'Profile updated successfully');
            setEditModalVisible(false);
            fetchStudentDetails();
        } catch (error) {
            console.error('Update student error:', error);
            showToast.error('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCall = () => {
        if (student?.phone) {
            Linking.openURL(`tel:${student.phone}`);
        } else {
            showToast.info('Info', 'No phone number available');
        }
    };

    const handleEmail = () => {
        if (student?.email) {
            Linking.openURL(`mailto:${student.email}`);
        } else {
            showToast.info('Info', 'No email address available');
        }
    };

    const handleDeleteStudent = async () => {
        Alert.alert(
            'Delete Student',
            `Are you sure you want to delete ${student.full_name || student.name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteStudent(studentId);
                            showToast.success('Success', 'Student deleted successfully');
                            navigation.goBack();
                        } catch (error) {
                            console.error('Delete student error:', error);
                            showToast.error('Error', 'Failed to delete student');
                        }
                    }
                }
            ]
        );
    };

    // Application Item Render
    const renderApplicationItem = ({ item }) => (
        <View style={[styles.appCard, shadows.sm]}>
            <View style={styles.appHeader}>
                <View style={styles.uniIcon}>
                    <Ionicons name="school" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.uniName}>{item.university_name || 'University'}</Text>
                    <Text style={styles.courseName}>{item.course_name || 'Course'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.primaryLight + '20' }]}>
                    <Text style={[styles.statusText, { color: colors.primary }]}>
                        {item.status || 'Pending'}
                    </Text>
                </View>
            </View>
            <View style={styles.appFooter}>
                <Text style={styles.dateText}>Applied: {formatDateReadable(item.created_at)}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <CustomHeader title="Student Profile" showBack={true} />
                <LoadingSpinner />
            </View>
        );
    }

    if (!student) return null;

    return (
        <View style={styles.container}>
            <CustomHeader
                title="Student Profile"
                showBack={true}
                rightAction={
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        <TouchableOpacity onPress={handleEditPress}>
                            <Ionicons name="create-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteStudent}>
                            <Ionicons name="trash-outline" size={24} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_TAB_SPACING }]}
            >
                {/* Profile Header Card */}
                <View style={[styles.card, shadows.md, styles.profileCard]}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatar, { backgroundColor: colors.accent + '30' }]}>
                            <Text style={styles.avatarText}>{getInitials(student.full_name || student.name || 'NA')}</Text>
                        </View>
                    </View>
                    <Text style={styles.name}>{student.full_name || student.name || 'Unknown'}</Text>
                    <Text style={styles.sourceText}>{student.email}</Text>

                    {/* Action Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.actionButton, styles.callButton]} onPress={handleCall}>
                            <Ionicons name="call" size={20} color={colors.white} />
                            <Text style={styles.actionButtonText}>Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.emailButton]} onPress={handleEmail}>
                            <Ionicons name="mail" size={20} color={colors.primary} />
                            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Email</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.whatsappButton]}>
                            <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
                            <Text style={styles.actionButtonText}>Chat</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
                        onPress={() => setActiveTab('profile')}
                    >
                        <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
                        onPress={() => setActiveTab('applications')}
                    >
                        <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>Apps ({applications.length})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'visa' && styles.activeTab]}
                        onPress={() => setActiveTab('visa')}
                    >
                        <Text style={[styles.tabText, activeTab === 'visa' && styles.activeTabText]}>Visa</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'profile' ? (
                    <View style={styles.infoSection}>
                        <View style={[styles.card, shadows.sm]}>
                            <Text style={styles.sectionHeader}>Personal Details</Text>
                            <InfoRow icon="call-outline" label="Phone" value={student.phone} />
                            <InfoRow icon="mail-outline" label="Email" value={student.email} />
                            <InfoRow icon="location-outline" label="Location" value={`${student.city || ''}, ${student.country || ''}`} />
                            <InfoRow icon="calendar-outline" label="Date of Birth" value={formatDateReadable(student.date_of_birth)} />
                            <InfoRow icon="person-outline" label="Gender" value={student.gender} />
                        </View>

                        <View style={[styles.card, shadows.sm]}>
                            <Text style={styles.sectionHeader}>Academic Interest</Text>
                            <InfoRow icon="school-outline" label="Level" value={student.highest_education_level} />
                            <InfoRow icon="book-outline" label="GPA/Grade" value={student.grade_average} />
                        </View>
                    </View>
                ) : activeTab === 'applications' ? (
                    <View style={styles.infoSection}>
                        {applications.length > 0 ? (
                            applications.map((app, index) => (
                                <View key={index}>{renderApplicationItem({ item: app })}</View>
                            ))
                        ) : (
                            <View style={[styles.card, shadows.sm, { minHeight: 150, alignItems: 'center', justifyContent: 'center' }]}>
                                <Ionicons name="school-outline" size={48} color={colors.gray300} />
                                <Text style={{ color: colors.gray400, marginTop: 10 }}>No applications found</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.infoSection}>
                        <View style={[styles.card, shadows.md, { alignItems: 'center', padding: spacing.xl }]}>
                            <Ionicons name="airplane-outline" size={64} color={colors.primary} />
                            <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.text, marginTop: spacing.md }}>Visa Journey</Text>
                            <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.lg }}>
                                Track and manage the 12-stage visa processing journey for this student.
                            </Text>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.callButton, { width: '80%' }]}
                                onPress={() => navigation.navigate('VisaProcessing', { studentId: studentId })}
                            >
                                <Text style={styles.actionButtonText}>View Visa Progress</Text>
                                <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 8 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.full_name}
                                    onChangeText={(text) => setEditData({ ...editData, full_name: text })}
                                    placeholder="Enter full name"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.phone}
                                    onChangeText={(text) => setEditData({ ...editData, phone: text })}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>City</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.city}
                                    onChangeText={(text) => setEditData({ ...editData, city: text })}
                                    placeholder="Enter city"
                                />
                            </View>

                            <FilterDropdown
                                label="Gender"
                                value={editData.gender}
                                options={GENDER_OPTIONS}
                                onChange={(val) => setEditData({ ...editData, gender: val })}
                            />

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Date of Birth</Text>
                                <DateRangePicker
                                    value={editData.date_of_birth}
                                    onChange={(val) => setEditData({ ...editData, date_of_birth: val })}
                                    mode="date"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Highest Education</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.highest_education_level}
                                    onChangeText={(text) => setEditData({ ...editData, highest_education_level: text })}
                                    placeholder="e.g. Bachelor's"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Grade Average / GPA</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editData.grade_average}
                                    onChangeText={(text) => setEditData({ ...editData, grade_average: text })}
                                    placeholder="e.g. 3.5 or A"
                                />
                            </View>

                            <View style={{ height: 40 }} />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, shadows.sm]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveBtn, shadows.md, saving && styles.disabledBtn]}
                                onPress={handleUpdateProfile}
                                disabled={saving}
                            >
                                {saving ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
        <View style={styles.iconBox}>
            <Ionicons name={icon} size={18} color={colors.textSecondary} />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || 'N/A'}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    profileCard: {
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: spacing.sm,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: fontSizes.h2,
        fontWeight: '700',
        color: colors.accent,
    },
    name: {
        fontSize: fontSizes.h3,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    sourceText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: spacing.md,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: borderRadius.md,
        minWidth: 100,
    },
    callButton: {
        backgroundColor: colors.primary,
    },
    emailButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    whatsappButton: {
        backgroundColor: '#25D366',
    },
    actionButtonText: {
        fontWeight: '600',
        marginLeft: 6,
        color: colors.white,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: borderRadius.md,
    },
    activeTab: {
        backgroundColor: colors.background,
    },
    tabText: {
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.text,
    },
    sectionHeader: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.circle,
        backgroundColor: colors.gray50,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontWeight: '500',
    },
    // Application Card Styles
    appCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    appHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    uniIcon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary + '10',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uniName: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    courseName: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
    },
    appFooter: {
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        paddingTop: spacing.sm,
    },
    dateText: {
        fontSize: fontSizes.xs,
        color: colors.gray400,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    modalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    modalForm: {
        padding: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    inputLabel: {
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
    modalFooter: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    cancelBtn: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray200,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontWeight: '600',
        color: colors.textSecondary,
    },
    saveBtn: {
        flex: 2,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    saveBtnText: {
        fontWeight: '700',
        color: colors.white,
    },
    disabledBtn: {
        opacity: 0.7,
    },
});

export default StudentDetailScreen;
