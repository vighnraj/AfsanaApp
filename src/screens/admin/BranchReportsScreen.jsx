// Branch Reports Screen

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import CustomHeader from '../../components/common/CustomHeader';
import { showToast } from '../../components/common/Toast';
import { getBranchReports, exportReport } from '../../api/reportingApi';
import DatePickerModal from '../../components/common/DatePickerModal';

const BranchReportsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Fetch branch reports
    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (startDate) filters.start_date = startDate;
            if (endDate) filters.end_date = endDate;

            const data = await getBranchReports(filters);
            setReportData(data);
        } catch (error) {
            console.error('Fetch branch reports error:', error);
            showToast.error('Error', 'Failed to load branch reports');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchReports();
        setRefreshing(false);
    }, [fetchReports]);

    // Handle export
    const handleExport = async (format) => {
        setExporting(true);
        try {
            const filters = {};
            if (startDate) filters.start_date = startDate;
            if (endDate) filters.end_date = endDate;

            await exportReport('branches', format, filters);
            showToast.success('Export', `Branch report exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Export error:', error);
            showToast.error('Error', 'Failed to export report');
        } finally {
            setExporting(false);
        }
    };

    // Clear filters
    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Render stat card
    const renderStatCard = (label, value, icon, color, subtitle) => (
        <View style={[styles.statCard, shadows.sm]}>
            <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
                {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
            </View>
        </View>
    );

    // Render branch performance card
    const renderBranchCard = ({ item, index }) => {
        const getRankColor = (rank) => {
            if (rank === 1) return colors.warning;
            if (rank === 2) return colors.info;
            if (rank === 3) return colors.secondary;
            return colors.gray400;
        };

        return (
            <View style={[styles.branchCard, shadows.sm]}>
                <View style={styles.branchHeader}>
                    <View style={styles.branchInfo}>
                        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
                            <Text style={styles.rankText}>#{item.rank}</Text>
                        </View>
                        <View style={styles.branchDetails}>
                            <Text style={styles.branchName}>{item.name}</Text>
                            <Text style={styles.branchLocation}>{item.location}</Text>
                        </View>
                    </View>
                    {item.rank === 1 && <Ionicons name="trophy" size={24} color={colors.warning} />}
                </View>

                <View style={styles.metricsGrid}>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Revenue</Text>
                        <Text style={[styles.metricValue, { color: colors.success }]}>
                            {formatCurrency(item.revenue)}
                        </Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Students</Text>
                        <Text style={styles.metricValue}>{item.students || 0}</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Leads</Text>
                        <Text style={styles.metricValue}>{item.leads || 0}</Text>
                    </View>
                    <View style={styles.metricItem}>
                        <Text style={styles.metricLabel}>Conversion</Text>
                        <Text style={[styles.metricValue, { color: getConversionColor(item.conversion_rate) }]}>
                            {item.conversion_rate || 0}%
                        </Text>
                    </View>
                </View>

                {/* Performance Score */}
                <View style={styles.performanceSection}>
                    <View style={styles.performanceHeader}>
                        <Text style={styles.performanceLabel}>Performance Score</Text>
                        <Text style={[styles.performanceScore, { color: getPerformanceColor(item.performance_score) }]}>
                            {item.performance_score || 0}/100
                        </Text>
                    </View>
                    <View style={styles.performanceBarContainer}>
                        <View
                            style={[
                                styles.performanceBar,
                                {
                                    width: `${item.performance_score || 0}%`,
                                    backgroundColor: getPerformanceColor(item.performance_score),
                                },
                            ]}
                        />
                    </View>
                </View>
            </View>
        );
    };

    // Get conversion rate color
    const getConversionColor = (rate) => {
        if (rate >= 30) return colors.success;
        if (rate >= 15) return colors.warning;
        return colors.error;
    };

    // Get performance score color
    const getPerformanceColor = (score) => {
        if (score >= 80) return colors.success;
        if (score >= 60) return colors.warning;
        return colors.error;
    };

    if (loading && !reportData) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <CustomHeader title="Branch Reports" showBack onBack={() => navigation.goBack()} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading reports...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <CustomHeader
                title="Branch Reports"
                showBack
                onBack={() => navigation.goBack()}
                rightAction={
                    <TouchableOpacity onPress={() => setShowFilterModal(!showFilterModal)}>
                        <Ionicons name="filter" size={24} color={colors.text} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Filter Panel */}
                {showFilterModal && (
                    <View style={[styles.filterPanel, shadows.sm]}>
                        <View style={styles.filterHeader}>
                            <Text style={styles.filterTitle}>Filters</Text>
                            <TouchableOpacity onPress={clearFilters}>
                                <Text style={styles.clearButton}>Clear All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Date Range */}
                        <View style={styles.filterRow}>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowStartDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                                <Text style={styles.dateButtonText}>{startDate || 'Start Date'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowEndDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                                <Text style={styles.dateButtonText}>{endDate || 'End Date'}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={() => {
                                setShowFilterModal(false);
                                fetchReports();
                            }}
                        >
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Summary Stats */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Overview</Text>
                    <View style={styles.statsGrid}>
                        {renderStatCard(
                            'Total Branches',
                            reportData?.summary?.total_branches || '0',
                            'business',
                            colors.primary
                        )}
                        {renderStatCard(
                            'Total Revenue',
                            formatCurrency(reportData?.summary?.total_revenue || 0),
                            'cash',
                            colors.success
                        )}
                        {renderStatCard(
                            'Total Students',
                            reportData?.summary?.total_students || '0',
                            'school',
                            colors.info
                        )}
                        {renderStatCard(
                            'Avg Conversion',
                            `${reportData?.summary?.avg_conversion_rate || '0'}%`,
                            'analytics',
                            colors.warning
                        )}
                    </View>
                </View>

                {/* Branch Performance List */}
                {reportData?.branches && reportData.branches.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Branch Performance</Text>
                            <Ionicons name="bar-chart" size={20} color={colors.textSecondary} />
                        </View>
                        <FlatList
                            data={reportData.branches}
                            renderItem={renderBranchCard}
                            keyExtractor={(item, index) => index.toString()}
                            scrollEnabled={false}
                            contentContainerStyle={styles.branchList}
                        />
                    </View>
                )}

                {/* Regional Distribution */}
                {reportData?.regional_distribution && reportData.regional_distribution.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Regional Distribution</Text>
                            <Ionicons name="map" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.regional_distribution.map((item, index) => (
                                <View key={index} style={styles.regionItem}>
                                    <Text style={styles.regionName}>{item.region}</Text>
                                    <View style={styles.regionStats}>
                                        <Text style={styles.regionBranches}>{item.branches} branches</Text>
                                        <Text style={styles.regionRevenue}>{formatCurrency(item.revenue)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Export Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Export Report</Text>
                    <View style={[styles.card, shadows.sm]}>
                        <View style={styles.exportButtons}>
                            <TouchableOpacity
                                style={[styles.exportButton, { backgroundColor: `${colors.success}15` }]}
                                onPress={() => handleExport('excel')}
                                disabled={exporting}
                            >
                                {exporting ? (
                                    <ActivityIndicator size="small" color={colors.success} />
                                ) : (
                                    <>
                                        <Ionicons name="document" size={24} color={colors.success} />
                                        <Text style={[styles.exportButtonText, { color: colors.success }]}>Excel</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.exportButton, { backgroundColor: `${colors.error}15` }]}
                                onPress={() => handleExport('pdf')}
                                disabled={exporting}
                            >
                                {exporting ? (
                                    <ActivityIndicator size="small" color={colors.error} />
                                ) : (
                                    <>
                                        <Ionicons name="document-text" size={24} color={colors.error} />
                                        <Text style={[styles.exportButtonText, { color: colors.error }]}>PDF</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.exportButton, { backgroundColor: `${colors.warning}15` }]}
                                onPress={() => handleExport('csv')}
                                disabled={exporting}
                            >
                                {exporting ? (
                                    <ActivityIndicator size="small" color={colors.warning} />
                                ) : (
                                    <>
                                        <Ionicons name="grid" size={24} color={colors.warning} />
                                        <Text style={[styles.exportButtonText, { color: colors.warning }]}>CSV</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ height: spacing.xxl }} />
            </ScrollView>

            {/* Date Pickers */}
            <DatePickerModal
                visible={showStartDatePicker}
                onClose={() => setShowStartDatePicker(false)}
                onSelectDate={(date) => {
                    setStartDate(date);
                    setShowStartDatePicker(false);
                }}
                selectedDate={startDate}
                title="Select Start Date"
            />

            <DatePickerModal
                visible={showEndDatePicker}
                onClose={() => setShowEndDatePicker(false)}
                onSelectDate={(date) => {
                    setEndDate(date);
                    setShowEndDatePicker(false);
                }}
                selectedDate={endDate}
                title="Select End Date"
            />
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
    filterPanel: {
        backgroundColor: colors.white,
        margin: spacing.md,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
    },
    filterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    filterTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    clearButton: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    filterRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    dateButtonText: {
        marginLeft: spacing.xs,
        fontSize: fontSizes.sm,
        color: colors.text,
    },
    applyButton: {
        backgroundColor: colors.primary,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    applyButtonText: {
        color: colors.white,
        fontSize: fontSizes.md,
        fontWeight: '600',
    },
    statsSection: {
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.md,
    },
    statsGrid: {
        gap: spacing.sm,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    statIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    statValue: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.text,
    },
    statSubtitle: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    section: {
        padding: spacing.md,
        paddingTop: 0,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    branchList: {
        gap: spacing.md,
    },
    branchCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    branchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    branchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rankBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    rankText: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.white,
    },
    branchDetails: {
        flex: 1,
    },
    branchName: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    branchLocation: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    metricItem: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.gray50,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    performanceSection: {
        marginTop: spacing.xs,
    },
    performanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    performanceLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    performanceScore: {
        fontSize: fontSizes.md,
        fontWeight: '700',
    },
    performanceBarContainer: {
        height: 8,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.sm,
    },
    performanceBar: {
        height: '100%',
        borderRadius: borderRadius.sm,
    },
    regionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    regionName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    regionStats: {
        alignItems: 'flex-end',
    },
    regionBranches: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    regionRevenue: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.success,
        marginTop: 2,
    },
    exportButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    exportButton: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    exportButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
    },
});

export default BranchReportsScreen;
