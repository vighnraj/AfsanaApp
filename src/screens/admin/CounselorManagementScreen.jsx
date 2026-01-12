// Counselor Management Screen - Admin CRUD

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Modal,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';

import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { BRANCH_OPTIONS, BOTTOM_TAB_SPACING, BOTTOM_TAB_HEIGHT } from '../../utils/constants';
import {
    getCounselors,
    getUniversities,
    createCounselor,
    updateCounselor,
    deleteCounselor,
} from '../../api/userApi';
import DatePickerModal from '../../components/common/DatePickerModal';

import { useAuth } from '../../context/AuthContext';

const CounselorManagementScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [counselors, setCounselors] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Create/Edit Modal
    const [showModal, setShowModal] = useState(false);
    const [editingCounselor, setEditingCounselor] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        university_id: '',
        status: 'active',
    });

    const [showDatePicker, setShowDatePicker] = useState(false);

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            const [counselorsData, universitiesData] = await Promise.all([
                getCounselors(),
                getUniversities()
            ]);
            setCounselors(Array.isArray(counselorsData) ? counselorsData : counselorsData.data || []);
            setUniversities(Array.isArray(universitiesData) ? universitiesData : universitiesData.data || []);
        } catch (error) {
            console.error('Fetch data error:', error);
            showToast.error('Error', 'Failed to load data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Open Create Modal
    const openCreateModal = () => {
        setEditingCounselor(null);
        setFormData({
            full_name: '',
            email: '',
            password: '',
            phone: '',
            university_id: '',
            status: 'active',
        });
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (counselor) => {
        setEditingCounselor(counselor);
        setFormData({
            full_name: counselor.full_name || counselor.name || '',
            email: counselor.email || '',
            password: '', // Don't pre-fill password
            phone: counselor.phone || '',
            university_id: counselor.university_id || '',
            status: counselor.status || 'active',
        });
        setShowModal(true);
    };

    // Handle form change
    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle Submit
    const handleSubmit = async () => {
        // Validation
        if (!formData.full_name || !formData.email || !formData.university_id) {
            showToast.error('Validation', 'Name, email, and university are required');
            return;
        }

        // Password required only for new counselors
        if (!editingCounselor && !formData.password) {
            showToast.error('Validation', 'Password is required for new counselor');
            return;
        }

        if (formData.password && formData.password.length < 6) {
            showToast.error('Validation', 'Password must be at least 6 characters');
            return;
        }

        setModalLoading(true);
        try {
            const submitData = {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone || '',
                university_id: parseInt(formData.university_id),
                status: formData.status,
                role: 'counselor',
                user_id: user?.id || 1,
            };

            // Only include password if provided
            if (formData.password) {
                submitData.password = formData.password;
                submitData.password_confirmation = formData.password;
            }

            if (editingCounselor) {
                // Update
                await updateCounselor(editingCounselor.id, submitData);
                showToast.success('Success', 'Counselor updated successfully');
            } else {
                // Create
                await createCounselor(submitData);
                showToast.success('Success', 'Counselor created successfully');
            }

            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Submit counselor error:', error);
            showToast.error('Error', error.response?.data?.message || 'Failed to save counselor');
        } finally {
            setModalLoading(false);
        }
    };

    // Handle Delete
    const handleDelete = (id, name) => {
        Alert.alert(
            'Delete Counselor',
            `Are you sure you want to delete "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteCounselor(id);
                            showToast.success('Success', 'Counselor deleted successfully');
                            fetchData();
                        } catch (error) {
                            console.error('Delete counselor error:', error);
                            showToast.error('Error', 'Failed to delete counselor');
                        }
                    }
                }
            ]
        );
    };

    // Filter counselors
    const filteredCounselors = counselors.filter(counselor => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            counselor.full_name?.toLowerCase().includes(query) ||
            counselor.name?.toLowerCase().includes(query) ||
            counselor.email?.toLowerCase().includes(query) ||
            counselor.phone?.toLowerCase().includes(query)
        );
    });

    // Render Counselor Card
    const renderCounselorCard = ({ item }) => (
        <View style={[styles.card, shadows.md]}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person" size={28} color={colors.primary} />
                    </View>
                    <View style={styles.cardTitleContainer}>
                        <Text style={styles.counselorName} numberOfLines={1}>
                            {item.full_name || item.name}
                        </Text>
                        {item.employee_id && (
                            <Text style={styles.employeeId}>ID: {item.employee_id}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.full_name || item.name)} style={styles.iconButton}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cardBody}>
                {/* Email */}
                {item.email && (
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.infoText}>{item.email}</Text>
                    </View>
                )}

                {/* Phone */}
                {item.phone && (
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.infoText}>{item.phone}</Text>
                    </View>
                )}

                {/* Branch */}
                {item.branch && (
                    <View style={styles.infoRow}>
                        <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.infoText}>{item.branch}</Text>
                    </View>
                )}

                {/* Join Date */}
                {item.join_date && (
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.infoText}>
                            Joined: {new Date(item.join_date).toLocaleDateString()}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading counselors...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.gray400} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search counselors..."
                    placeholderTextColor={colors.gray400}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={colors.gray400} />
                    </TouchableOpacity>
                ) : null}
            </View>

            {/* Counselors List */}
            <FlatList
                data={filteredCounselors}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderCounselorCard}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No counselors found</Text>
                    </View>
                }
            />

            {/* Create/Edit Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, shadows.lg]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingCounselor ? 'Edit Counselor' : 'Add Counselor'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Full Name */}
                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="John Doe"
                                placeholderTextColor={colors.gray400}
                                value={formData.full_name}
                                onChangeText={(val) => handleFormChange('full_name', val)}
                            />

                            {/* Email */}
                            <Text style={styles.label}>Email Address *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="john@example.com"
                                placeholderTextColor={colors.gray400}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(val) => handleFormChange('email', val)}
                            />

                            {/* Phone */}
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="+880..."
                                placeholderTextColor={colors.gray400}
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(val) => handleFormChange('phone', val)}
                            />

                            {/* Password */}
                            {!editingCounselor && (
                                <>
                                    <Text style={styles.label}>Password * (Min 6 chars)</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="••••••••"
                                        placeholderTextColor={colors.gray400}
                                        secureTextEntry
                                        value={formData.password}
                                        onChangeText={(val) => handleFormChange('password', val)}
                                    />
                                </>
                            )}

                            {/* University */}
                            <Text style={styles.label}>University *</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.university_id}
                                    onValueChange={(val) => handleFormChange('university_id', val)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select University" value="" />
                                    {universities.map((uni) => (
                                        <Picker.Item key={uni.id} label={uni.name} value={uni.id} />
                                    ))}
                                </Picker>
                            </View>

                            {/* Status */}
                            <Text style={styles.label}>Status</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={formData.status}
                                    onValueChange={(val) => handleFormChange('status', val)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Active" value="active" />
                                    <Picker.Item label="Inactive" value="inactive" />
                                </Picker>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.submitButton, modalLoading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={modalLoading}
                        >
                            {modalLoading ? (
                                <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {editingCounselor ? 'Update Counselor' : 'Create Counselor'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Date Picker Modal - Not used now but keeping to prevent errors if referenced */}
            <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onSelectDate={(date) => {
                    handleFormChange('join_date', date);
                    setShowDatePicker(false);
                }}
                selectedDate={formData.join_date}
                title="Select Join Date"
            />

            {/* FAB - Create Button */}
            <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        margin: spacing.md,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        ...shadows.sm,
        gap: spacing.xs,
    },
    searchInput: {
        flex: 1,
        fontSize: fontSizes.sm,
        color: colors.text,
        padding: 0,
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
        flex: 1,
        gap: spacing.sm,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: `${colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitleContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    counselorName: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    employeeId: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    cardActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    iconButton: {
        padding: 4,
    },
    cardBody: {
        marginTop: spacing.xs,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
        gap: spacing.xs,
    },
    infoText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        flex: 1,
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
        maxHeight: '90%',
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
    label: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        backgroundColor: colors.gray50,
    },
    picker: {
        height: 50,
    },
    submitButton: {
        margin: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        ...shadows.md,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.white,
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

export default CounselorManagementScreen;
