// Processor Management Screen - Admin CRUD

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
import * as DocumentPicker from 'expo-document-picker';

import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { COUNTRIES, BOTTOM_TAB_SPACING, BOTTOM_TAB_HEIGHT } from '../../utils/constants';
import {
    getProcessors,
    createProcessor,
    updateProcessor,
    deleteProcessor,
} from '../../api/userApi';
import DatePickerModal from '../../components/common/DatePickerModal';

import { useAuth } from '../../context/AuthContext';

const ProcessorManagementScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processors, setProcessors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Create/Edit Modal
    const [showModal, setShowModal] = useState(false);
    const [editingProcessor, setEditingProcessor] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        phone: '',
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Fetch processors
    const fetchProcessors = useCallback(async () => {
        try {
            const data = await getProcessors();
            setProcessors(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Fetch processors error:', error);
            showToast.error('Error', 'Failed to load processors');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchProcessors();
    }, [fetchProcessors]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProcessors();
    };

    // Open Create Modal
    const openCreateModal = () => {
        setEditingProcessor(null);
        setFormData({
            full_name: '',
            email: '',
            password: '',
            phone: '',
            phone: '',
        });
        setPhotoFile(null);
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (processor) => {
        setEditingProcessor(processor);
        setFormData({
            full_name: processor.full_name || processor.name || '',
            email: processor.email || '',
            password: '', // Don't pre-fill password
            phone: processor.phone || '',
            phone: processor.phone || '',
        });
        setPhotoFile(null);
        setShowModal(true);
    };

    // Handle file picker for photo
    const handlePickPhoto = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets.length > 0) {
                setPhotoFile(result.assets[0]);
                showToast.success('Success', 'Photo selected');
            }
        } catch (error) {
            console.error('Photo picker error:', error);
            showToast.error('Error', 'Failed to pick photo');
        }
    };

    // Handle form change
    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle Submit
    const handleSubmit = async () => {
        // Validation
        if (!formData.full_name || !formData.email) {
            showToast.error('Validation', 'Name and email are required');
            return;
        }

        // Password required only for new processors
        if (!editingProcessor && !formData.password) {
            showToast.error('Validation', 'Password is required for new processor');
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
                role: 'processors', // Plural as per frontend
                user_id: user?.id || 1,
            };

            // Only include password if provided
            if (formData.password) {
                submitData.password = formData.password;
            }

            // Add photo if provided (in real implementation)
            if (photoFile) {
                submitData.photo = photoFile.uri;
            }

            if (editingProcessor) {
                // Update
                await updateProcessor(editingProcessor.id, submitData);
                showToast.success('Success', 'Processor updated successfully');
            } else {
                // Create
                await createProcessor(submitData);
                showToast.success('Success', 'Processor created successfully');
            }

            setShowModal(false);
            fetchProcessors();
        } catch (error) {
            console.error('Submit processor error:', error);
            showToast.error('Error', error.response?.data?.message || 'Failed to save processor');
        } finally {
            setModalLoading(false);
        }
    };

    // Handle Delete
    const handleDelete = (id, name) => {
        Alert.alert(
            'Delete Processor',
            `Are you sure you want to delete "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProcessor(id);
                            showToast.success('Success', 'Processor deleted successfully');
                            fetchProcessors();
                        } catch (error) {
                            console.error('Delete processor error:', error);
                            showToast.error('Error', 'Failed to delete processor');
                        }
                    }
                }
            ]
        );
    };

    // Filter processors
    const filteredProcessors = processors.filter(processor => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            processor.full_name?.toLowerCase().includes(query) ||
            processor.name?.toLowerCase().includes(query) ||
            processor.email?.toLowerCase().includes(query) ||
            processor.phone?.toLowerCase().includes(query) ||
            processor.specialization?.toLowerCase().includes(query)
        );
    });

    // Render Processor Card
    const renderProcessorCard = ({ item }) => (
        <View style={[styles.card, shadows.md]}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="briefcase" size={28} color={colors.info} />
                    </View>
                    <View style={styles.cardTitleContainer}>
                        <Text style={styles.processorName} numberOfLines={1}>
                            {item.full_name || item.name}
                        </Text>
                        {item.specialization && (
                            <Text style={styles.specialization}>{item.specialization}</Text>
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

                {/* Countries Expertise */}
                {item.countries_expertise && (
                    <View style={styles.infoRow}>
                        <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.infoText}>{item.countries_expertise}</Text>
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
                    <Text style={styles.loadingText}>Loading processors...</Text>
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
                    placeholder="Search processors..."
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

            {/* Processors List */}
            <FlatList
                data={filteredProcessors}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderProcessorCard}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="briefcase-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No processors found</Text>
                    </View>
                }
            />

            {/* Create/Edit Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, shadows.lg]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingProcessor ? 'Edit Processor' : 'Add Processor'}
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

                            {/* Password */}
                            <Text style={styles.label}>
                                {editingProcessor ? 'Password (Leave blank to keep current)' : 'Password * (Min 6 chars)'}
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder={editingProcessor ? 'Leave blank to keep current' : '••••••••'}
                                placeholderTextColor={colors.gray400}
                                secureTextEntry
                                value={formData.password}
                                onChangeText={(val) => handleFormChange('password', val)}
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



                            {/* Photo Upload */}
                            <Text style={styles.label}>Photo (Optional)</Text>
                            <TouchableOpacity style={styles.uploadButton} onPress={handlePickPhoto}>
                                <Ionicons name="camera-outline" size={20} color={colors.primary} />
                                <Text style={styles.uploadButtonText}>
                                    {photoFile ? photoFile.name : 'Upload Photo'}
                                </Text>
                            </TouchableOpacity>
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
                                    {editingProcessor ? 'Update Processor' : 'Create Processor'}
                                </Text>
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
        backgroundColor: `${colors.info}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitleContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    processorName: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    specialization: {
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

export default ProcessorManagementScreen;
