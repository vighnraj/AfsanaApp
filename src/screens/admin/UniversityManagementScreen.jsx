// University Management Screen - Admin CRUD

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

import { useAuth } from '../../context/AuthContext';
import { BOTTOM_TAB_SPACING, BOTTOM_TAB_HEIGHT } from '../../utils/constants';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import {
    getUniversities,
    createUniversity,
    updateUniversity,
    deleteUniversity,
} from '../../api/visaApi';

const UniversityManagementScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [universities, setUniversities] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Create/Edit Modal
    const [showModal, setShowModal] = useState(false);
    const [editingUniversity, setEditingUniversity] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        contact_phone: '',
        contact_email: '',
        programs: [],
        highlights: [],
    });
    const [logoFile, setLogoFile] = useState(null);

    // Programs and Highlights (for dynamic fields)
    const [programInput, setProgramInput] = useState('');
    const [highlightInput, setHighlightInput] = useState('');

    // Fetch universities
    const fetchUniversities = useCallback(async () => {
        try {
            const data = await getUniversities();
            setUniversities(Array.isArray(data) ? data : data.universities || []);
        } catch (error) {
            console.error('Fetch universities error:', error);
            showToast.error('Error', 'Failed to load universities');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchUniversities();
    }, [fetchUniversities]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUniversities();
    };

    // Open Create Modal
    const openCreateModal = () => {
        setEditingUniversity(null);
        setFormData({
            name: '',
            location: '',
            contact_phone: '',
            contact_email: '',
            programs: [],
            highlights: [],
        });
        setLogoFile(null);
        setProgramInput('');
        setHighlightInput('');
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (university) => {
        setEditingUniversity(university);
        setFormData({
            name: university.name || university.university_name || '',
            location: university.location || university.country || '',
            contact_phone: university.contact_phone || university.phone || '',
            contact_email: university.contact_email || university.email || '',
            programs: university.programs || university.popular_programs || [],
            highlights: university.highlights || university.key_highlights || [],
        });
        setLogoFile(null);
        setProgramInput('');
        setHighlightInput('');
        setShowModal(true);
    };

    // Handle file picker for logo
    const handlePickLogo = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled === false && result.assets && result.assets.length > 0) {
                setLogoFile(result.assets[0]);
                showToast.success('Success', 'Logo selected');
            }
        } catch (error) {
            console.error('Logo picker error:', error);
            showToast.error('Error', 'Failed to pick logo');
        }
    };

    // Add program
    const addProgram = () => {
        if (programInput.trim()) {
            setFormData(prev => ({
                ...prev,
                programs: [...prev.programs, programInput.trim()]
            }));
            setProgramInput('');
        }
    };

    // Remove program
    const removeProgram = (index) => {
        setFormData(prev => ({
            ...prev,
            programs: prev.programs.filter((_, i) => i !== index)
        }));
    };

    // Add highlight
    const addHighlight = () => {
        if (highlightInput.trim()) {
            setFormData(prev => ({
                ...prev,
                highlights: [...prev.highlights, highlightInput.trim()]
            }));
            setHighlightInput('');
        }
    };

    // Remove highlight
    const removeHighlight = (index) => {
        setFormData(prev => ({
            ...prev,
            highlights: prev.highlights.filter((_, i) => i !== index)
        }));
    };

    // Handle form change
    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle Submit
    const handleSubmit = async () => {
        // Validation
        if (!formData.name || !formData.location) {
            showToast.error('Validation', 'University name and location are required');
            return;
        }

        setModalLoading(true);
        try {
            const submitData = {
                user_id: user?.id || 1,
                name: formData.name,
                logo_url: logoFile ? logoFile.uri : (editingUniversity?.logo_url || ''),
                location: formData.location,
                programs: formData.programs,
                highlights: formData.highlights,
                contact_phone: formData.contact_phone || '',
                contact_email: formData.contact_email || '',
            };

            if (editingUniversity) {
                // Update
                await updateUniversity(editingUniversity.id, submitData);
                showToast.success('Success', 'University updated successfully');
            } else {
                // Create
                await createUniversity(submitData);
                showToast.success('Success', 'University created successfully');
            }

            setShowModal(false);
            fetchUniversities();
        } catch (error) {
            console.error('Submit university error:', error);
            showToast.error('Error', error.response?.data?.message || 'Failed to save university');
        } finally {
            setModalLoading(false);
        }
    };

    // Handle Delete
    const handleDelete = (id, name) => {
        Alert.alert(
            'Delete University',
            `Are you sure you want to delete "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteUniversity(id);
                            showToast.success('Success', 'University deleted successfully');
                            fetchUniversities();
                        } catch (error) {
                            console.error('Delete university error:', error);
                            showToast.error('Error', 'Failed to delete university');
                        }
                    }
                }
            ]
        );
    };

    // Filter universities
    const filteredUniversities = universities.filter(uni => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            uni.name?.toLowerCase().includes(query) ||
            uni.university_name?.toLowerCase().includes(query) ||
            uni.location?.toLowerCase().includes(query) ||
            uni.country?.toLowerCase().includes(query)
        );
    });

    // Render University Card
    const renderUniversityCard = ({ item }) => (
        <View style={[styles.card, shadows.md]}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="school" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.cardTitleContainer}>
                        <Text style={styles.universityName} numberOfLines={2}>
                            {item.name || item.university_name}
                        </Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.locationText}>{item.location || item.country}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.name || item.university_name)} style={styles.iconButton}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Contact Info */}
            {(item.contact_email || item.email || item.contact_phone || item.phone) && (
                <View style={styles.contactInfo}>
                    {(item.contact_email || item.email) && (
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.infoText}>{item.contact_email || item.email}</Text>
                        </View>
                    )}
                    {(item.contact_phone || item.phone) && (
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                            <Text style={styles.infoText}>{item.contact_phone || item.phone}</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Programs Count */}
            {(item.programs?.length > 0 || item.popular_programs?.length > 0) && (
                <View style={styles.programsRow}>
                    <Ionicons name="book-outline" size={14} color={colors.primary} />
                    <Text style={styles.programsText}>
                        {item.programs?.length || item.popular_programs?.length} Programs Available
                    </Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading universities...</Text>
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
                    placeholder="Search universities..."
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

            {/* Universities List */}
            <FlatList
                data={filteredUniversities}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderUniversityCard}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="school-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No universities found</Text>
                    </View>
                }
            />

            {/* Create/Edit Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, shadows.lg]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingUniversity ? 'Edit University' : 'Create University'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* University Name */}
                            <Text style={styles.label}>University Name *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g., Harvard University"
                                placeholderTextColor={colors.gray400}
                                value={formData.name}
                                onChangeText={(val) => handleFormChange('name', val)}
                            />

                            {/* Location */}
                            <Text style={styles.label}>Location/Country *</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g., United States"
                                placeholderTextColor={colors.gray400}
                                value={formData.location}
                                onChangeText={(val) => handleFormChange('location', val)}
                            />

                            {/* Contact Phone */}
                            <Text style={styles.label}>Contact Phone</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="+1 234 567 8900"
                                placeholderTextColor={colors.gray400}
                                keyboardType="phone-pad"
                                value={formData.contact_phone}
                                onChangeText={(val) => handleFormChange('contact_phone', val)}
                            />

                            {/* Contact Email */}
                            <Text style={styles.label}>Contact Email</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="admissions@university.edu"
                                placeholderTextColor={colors.gray400}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.contact_email}
                                onChangeText={(val) => handleFormChange('contact_email', val)}
                            />

                            {/* Logo Upload */}
                            <Text style={styles.label}>University Logo</Text>
                            <TouchableOpacity style={styles.uploadButton} onPress={handlePickLogo}>
                                <Ionicons name="image-outline" size={20} color={colors.primary} />
                                <Text style={styles.uploadButtonText}>
                                    {logoFile ? logoFile.name : 'Upload Logo'}
                                </Text>
                            </TouchableOpacity>

                            {/* Popular Programs */}
                            <Text style={styles.label}>Popular Programs</Text>
                            <View style={styles.arrayInputContainer}>
                                <TextInput
                                    style={[styles.textInput, styles.arrayInput]}
                                    placeholder="e.g., MSc Computer Science"
                                    placeholderTextColor={colors.gray400}
                                    value={programInput}
                                    onChangeText={setProgramInput}
                                />
                                <TouchableOpacity style={styles.addButton} onPress={addProgram}>
                                    <Ionicons name="add" size={20} color={colors.white} />
                                </TouchableOpacity>
                            </View>
                            {formData.programs.map((program, index) => (
                                <View key={index} style={styles.chipItem}>
                                    <Text style={styles.chipText}>{program}</Text>
                                    <TouchableOpacity onPress={() => removeProgram(index)}>
                                        <Ionicons name="close-circle" size={18} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Key Highlights */}
                            <Text style={styles.label}>Key Highlights</Text>
                            <View style={styles.arrayInputContainer}>
                                <TextInput
                                    style={[styles.textInput, styles.arrayInput]}
                                    placeholder="e.g., Top ranked university"
                                    placeholderTextColor={colors.gray400}
                                    value={highlightInput}
                                    onChangeText={setHighlightInput}
                                />
                                <TouchableOpacity style={styles.addButton} onPress={addHighlight}>
                                    <Ionicons name="add" size={20} color={colors.white} />
                                </TouchableOpacity>
                            </View>
                            {formData.highlights.map((highlight, index) => (
                                <View key={index} style={styles.chipItem}>
                                    <Text style={styles.chipText}>{highlight}</Text>
                                    <TouchableOpacity onPress={() => removeHighlight(index)}>
                                        <Ionicons name="close-circle" size={18} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}
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
                                    {editingUniversity ? 'Update University' : 'Create University'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        flex: 1,
        gap: spacing.sm,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: `${colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitleContainer: {
        flex: 1,
    },
    universityName: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    locationText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    cardActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    iconButton: {
        padding: 4,
    },
    contactInfo: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
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
    },
    programsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        gap: spacing.xs,
    },
    programsText: {
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
    arrayInputContainer: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    arrayInput: {
        flex: 1,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: `${colors.primary}10`,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        marginTop: spacing.xs,
    },
    chipText: {
        fontSize: fontSizes.sm,
        color: colors.text,
        flex: 1,
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

export default UniversityManagementScreen;
