// Admin Visa Process Management Screen - Complete admin dashboard for managing all visa processes

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getVisaProcessingList, getVisaProcessByCounselorId, getVisaProcessByProcessorId } from '../../api/visaApi';
import { getCounselors, getProcessors } from '../../api/userApi';
import { getUniversities } from '../../api/visaApi';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { VISA_STAGES, COUNTRIES, BOTTOM_TAB_SPACING } from '../../utils/constants';

const VisaProcessManagementScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [visaProcesses, setVisaProcesses] = useState([]);
    const [filteredProcesses, setFilteredProcesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedUniversity, setSelectedUniversity] = useState('');
    const [selectedCounselor, setSelectedCounselor] = useState('');
    const [selectedProcessor, setSelectedProcessor] = useState('');
    const [selectedVisaStatus, setSelectedVisaStatus] = useState('');

    // Filter options data
    const [universities, setUniversities] = useState([]);
    const [counselors, setCounselors] = useState([]);
    const [processors, setProcessors] = useState([]);

    // UI states
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [visaProcesses, searchQuery, selectedStage, selectedCountry, selectedUniversity, selectedCounselor, selectedProcessor, selectedVisaStatus]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchVisaProcesses(),
                fetchUniversities(),
                fetchCounselors(),
                fetchProcessors(),
            ]);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVisaProcesses = async () => {
        try {
            const data = await getVisaProcessingList();
            const processArray = Array.isArray(data) ? data : [data];
            setVisaProcesses(processArray);
            setFilteredProcesses(processArray);
        } catch (error) {
            console.error('Error fetching visa processes:', error);
            showToast.error('Error', 'Failed to fetch visa processes');
        }
    };

    const fetchUniversities = async () => {
        try {
            const data = await getUniversities();
            setUniversities(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching universities:', error);
        }
    };

    const fetchCounselors = async () => {
        try {
            const data = await getCounselors();
            setCounselors(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching counselors:', error);
        }
    };

    const fetchProcessors = async () => {
        try {
            const data = await getProcessors();
            setProcessors(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching processors:', error);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchVisaProcesses();
        setRefreshing(false);
    }, []);

    const applyFilters = () => {
        let filtered = [...visaProcesses];

        // Search filter (name, email, phone)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(process =>
                (process.full_name && process.full_name.toLowerCase().includes(query)) ||
                (process.email && process.email.toLowerCase().includes(query)) ||
                (process.phone && process.phone.toLowerCase().includes(query))
            );
        }

        // Stage filter
        if (selectedStage) {
            filtered = filtered.filter(process => {
                const stage = VISA_STAGES.find(s => s.key === selectedStage);
                return stage && process[stage.apiField] === '1';
            });
        }

        // Country filter (from university or country field if exists)
        if (selectedCountry) {
            filtered = filtered.filter(process =>
                process.country && process.country === selectedCountry
            );
        }

        // University filter
        if (selectedUniversity) {
            filtered = filtered.filter(process =>
                process.university_id && process.university_id.toString() === selectedUniversity
            );
        }

        // Counselor filter
        if (selectedCounselor) {
            filtered = filtered.filter(process =>
                process.assigned_counselor && process.assigned_counselor.toString() === selectedCounselor
            );
        }

        // Processor filter
        if (selectedProcessor) {
            filtered = filtered.filter(process =>
                process.processor_id && process.processor_id.toString() === selectedProcessor
            );
        }

        // Visa Status filter
        if (selectedVisaStatus) {
            filtered = filtered.filter(process =>
                process.visa_status && process.visa_status.toLowerCase() === selectedVisaStatus.toLowerCase()
            );
        }

        setFilteredProcesses(filtered);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedStage('');
        setSelectedCountry('');
        setSelectedUniversity('');
        setSelectedCounselor('');
        setSelectedProcessor('');
        setSelectedVisaStatus('');
    };

    const getCurrentStage = (process) => {
        // Find the current/latest active stage
        for (let i = VISA_STAGES.length - 1; i >= 0; i--) {
            const stage = VISA_STAGES[i];
            if (process[stage.apiField] === '1') {
                return stage;
            }
        }
        return VISA_STAGES[0]; // Default to first stage
    };

    const getProgressPercentage = (process) => {
        const completedStages = VISA_STAGES.filter(stage => process[stage.apiField] === '1').length;
        return Math.round((completedStages / VISA_STAGES.length) * 100);
    };

    const getStatusColor = (visaStatus) => {
        if (!visaStatus) return colors.gray400;
        const status = visaStatus.toLowerCase();
        if (status === 'approved') return colors.success;
        if (status === 'rejected') return colors.danger;
        return colors.warning;
    };

    const handleViewProcess = (process) => {
        navigation.navigate('VisaProcessing', {
            studentId: process.student_id,
            universityId: process.university_id,
            processId: process.id,
        });
    };

    const renderFilterBar = () => (
        <View style={styles.filterContainer}>
            <TouchableOpacity
                style={styles.filterToggle}
                onPress={() => setShowFilters(!showFilters)}
            >
                <Ionicons name="filter" size={20} color={colors.primary} />
                <Text style={styles.filterToggleText}>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Text>
                {(selectedStage || selectedCountry || selectedUniversity || selectedCounselor || selectedProcessor || selectedVisaStatus) && (
                    <View style={styles.filterBadge}>
                        <Text style={styles.filterBadgeText}>●</Text>
                    </View>
                )}
            </TouchableOpacity>

            {showFilters && (
                <View style={styles.filtersPanel}>
                    {/* Stage Filter */}
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Processing Stage</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity
                                style={[styles.filterChip, !selectedStage && styles.filterChipActive]}
                                onPress={() => setSelectedStage('')}
                            >
                                <Text style={[styles.filterChipText, !selectedStage && styles.filterChipTextActive]}>All</Text>
                            </TouchableOpacity>
                            {VISA_STAGES.map(stage => (
                                <TouchableOpacity
                                    key={stage.key}
                                    style={[styles.filterChip, selectedStage === stage.key && styles.filterChipActive]}
                                    onPress={() => setSelectedStage(stage.key)}
                                >
                                    <Text style={[styles.filterChipText, selectedStage === stage.key && styles.filterChipTextActive]}>
                                        {stage.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Visa Status Filter */}
                    <View style={styles.filterGroup}>
                        <Text style={styles.filterLabel}>Visa Status</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {['All', 'Approved', 'Pending', 'Rejected'].map(status => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.filterChip,
                                        (status === 'All' ? !selectedVisaStatus : selectedVisaStatus === status) && styles.filterChipActive
                                    ]}
                                    onPress={() => setSelectedVisaStatus(status === 'All' ? '' : status)}
                                >
                                    <Text style={[
                                        styles.filterChipText,
                                        (status === 'All' ? !selectedVisaStatus : selectedVisaStatus === status) && styles.filterChipTextActive
                                    ]}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* University Filter */}
                    {universities.length > 0 && (
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>University</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <TouchableOpacity
                                    style={[styles.filterChip, !selectedUniversity && styles.filterChipActive]}
                                    onPress={() => setSelectedUniversity('')}
                                >
                                    <Text style={[styles.filterChipText, !selectedUniversity && styles.filterChipTextActive]}>All</Text>
                                </TouchableOpacity>
                                {universities.map(uni => (
                                    <TouchableOpacity
                                        key={uni.id}
                                        style={[styles.filterChip, selectedUniversity === uni.id.toString() && styles.filterChipActive]}
                                        onPress={() => setSelectedUniversity(uni.id.toString())}
                                    >
                                        <Text style={[styles.filterChipText, selectedUniversity === uni.id.toString() && styles.filterChipTextActive]}>
                                            {uni.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters}>
                        <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const renderProcessCard = (process) => {
        const currentStage = getCurrentStage(process);
        const progress = getProgressPercentage(process);
        const statusColor = getStatusColor(process.visa_status);

        return (
            <TouchableOpacity
                key={process.id}
                style={[styles.card, shadows.md]}
                onPress={() => handleViewProcess(process)}
            >
                {/* Header with name and status */}
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <Ionicons name="person-circle" size={40} color={colors.primary} />
                        <View style={styles.cardHeaderText}>
                            <Text style={styles.cardName}>{process.full_name || 'N/A'}</Text>
                            <Text style={styles.cardEmail}>{process.email || 'No email'}</Text>
                        </View>
                    </View>
                    {process.visa_status && (
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                                {process.visa_status}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Current Stage */}
                <View style={styles.cardRow}>
                    <Ionicons name={currentStage.icon} size={16} color={colors.primary} />
                    <Text style={styles.cardRowLabel}>Current Stage:</Text>
                    <Text style={styles.cardRowValue}>{currentStage.label}</Text>
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Overall Progress</Text>
                        <Text style={styles.progressPercent}>{progress}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                </View>

                {/* Additional Info */}
                <View style={styles.cardFooter}>
                    {process.university_name && (
                        <View style={styles.infoChip}>
                            <Ionicons name="school" size={14} color={colors.info} />
                            <Text style={styles.infoChipText}>{process.university_name}</Text>
                        </View>
                    )}
                    {process.applied_program && (
                        <View style={styles.infoChip}>
                            <Ionicons name="book" size={14} color={colors.success} />
                            <Text style={styles.infoChipText}>{process.applied_program}</Text>
                        </View>
                    )}
                </View>

                {/* View Arrow */}
                <View style={styles.cardArrow}>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.safeArea}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading visa processes...</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>

            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.gray400} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.gray400}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.gray400} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Bar */}
                {renderFilterBar()}

                {/* Results Count */}
                <View style={styles.resultsHeader}>
                    <Text style={styles.resultsText}>
                        {filteredProcesses.length} {filteredProcesses.length === 1 ? 'Process' : 'Processes'} Found
                    </Text>
                </View>

                {/* Visa Process List */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {filteredProcesses.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="airplane-outline" size={64} color={colors.gray300} />
                            <Text style={styles.emptyText}>No visa processes found</Text>
                            <Text style={styles.emptySubtext}>
                                {searchQuery || selectedStage || selectedUniversity || selectedVisaStatus
                                    ? 'Try adjusting your filters'
                                    : 'Create your first visa process to get started'}
                            </Text>
                        </View>
                    ) : (
                        filteredProcesses.map(renderProcessCard)
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
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
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.lg,
        ...shadows.sm,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        paddingVertical: spacing.sm,
        fontSize: fontSizes.md,
        color: colors.text,
    },
    filterContainer: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },
    filterToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        ...shadows.sm,
    },
    filterToggleText: {
        marginLeft: spacing.sm,
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    filterBadge: {
        marginLeft: spacing.xs,
    },
    filterBadgeText: {
        color: colors.danger,
        fontSize: fontSizes.lg,
    },
    filtersPanel: {
        backgroundColor: colors.white,
        marginTop: spacing.sm,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        ...shadows.sm,
    },
    filterGroup: {
        marginBottom: spacing.md,
    },
    filterLabel: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    filterChip: {
        backgroundColor: colors.gray100,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginRight: spacing.xs,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
    },
    filterChipText: {
        fontSize: fontSizes.sm,
        color: colors.text,
    },
    filterChipTextActive: {
        color: colors.white,
        fontWeight: '600',
    },
    clearFiltersBtn: {
        alignSelf: 'flex-start',
        paddingVertical: spacing.xs,
    },
    clearFiltersText: {
        fontSize: fontSizes.sm,
        color: colors.danger,
        fontWeight: '600',
    },
    resultsHeader: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    resultsText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingTop: spacing.xs,
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
        alignItems: 'center',
        flex: 1,
    },
    cardHeaderText: {
        marginLeft: spacing.sm,
        flex: 1,
    },
    cardName: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    cardEmail: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    statusBadgeText: {
        fontSize: fontSizes.xs,
        fontWeight: '700',
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    cardRowLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    cardRowValue: {
        fontSize: fontSizes.sm,
        color: colors.text,
        fontWeight: '600',
        marginLeft: spacing.xs,
    },
    progressSection: {
        marginVertical: spacing.sm,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    progressLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    progressPercent: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: borderRadius.full,
    },
    cardFooter: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.xs,
    },
    infoChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray100,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        marginRight: spacing.xs,
        marginTop: spacing.xs,
    },
    infoChipText: {
        fontSize: fontSizes.xs,
        color: colors.text,
        marginLeft: 4,
    },
    cardArrow: {
        position: 'absolute',
        right: spacing.md,
        top: '50%',
        marginTop: -10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyText: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
});

export default VisaProcessManagementScreen;
