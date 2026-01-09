// Visa Reports Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import CustomHeader from '../../components/common/CustomHeader';
import { showToast } from '../../components/common/Toast';
import { getVisaReports, exportReport } from '../../api/reportingApi';
import DatePickerModal from '../../components/common/DatePickerModal';

const VisaReportsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Fetch visa reports
    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (startDate) filters.start_date = startDate;
            if (endDate) filters.end_date = endDate;
            if (selectedCountry) filters.country = selectedCountry;
            if (selectedStatus) filters.status = selectedStatus;

            const data = await getVisaReports(filters);
            setReportData(data);
        } catch (error) {
            console.error('Fetch visa reports error:', error);
            showToast.error('Error', 'Failed to load visa reports');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, selectedCountry, selectedStatus]);

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

            await exportReport('visa', format, filters);
            showToast.success('Export', `Visa report exported as ${format.toUpperCase()}`);
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
        setSelectedCountry('');
        setSelectedStatus('');
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

    // Render status distribution item
    const renderStatusItem = (status, count, percentage, index) => {
        const getStatusColor = (status) => {
            const statusLower = status.toLowerCase();
            if (statusLower.includes('approve') || statusLower.includes('granted')) return colors.success;
            if (statusLower.includes('reject') || statusLower.includes('denied')) return colors.error;
            if (statusLower.includes('pending') || statusLower.includes('process')) return colors.warning;
            if (statusLower.includes('interview')) return colors.info;
            return colors.secondary;
        };

        return (
            <View key={index} style={styles.statusItem}>
                <View style={styles.statusInfo}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                    <Text style={styles.statusName}>{status}</Text>
                </View>
                <View style={styles.statusStats}>
                    <Text style={styles.statusCount}>{count}</Text>
                    <Text style={styles.statusPercentage}>{percentage}%</Text>
                </View>
            </View>
        );
    };

    // Render country item
    const renderCountryItem = (country, total, approved, approval_rate, avg_processing_time, index) => (
        <View key={index} style={styles.countryItem}>
            <View style={styles.countryHeader}>
                <Text style={styles.countryName}>{country}</Text>
                <Text style={[styles.countryRate, { color: getApprovalColor(approval_rate) }]}>
                    {approval_rate}%
                </Text>
            </View>
            <View style={styles.countryStats}>
                <View style={styles.countryStat}>
                    <Ionicons name="document-text" size={16} color={colors.textSecondary} />
                    <Text style={styles.countryStatText}>{total} applications</Text>
                </View>
                <View style={styles.countryStat}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.countryStatText}>{approved} approved</Text>
                </View>
                <View style={styles.countryStat}>
                    <Ionicons name="time" size={16} color={colors.info} />
                    <Text style={styles.countryStatText}>{avg_processing_time} days avg</Text>
                </View>
            </View>
        </View>
    );

    // Get approval rate color
    const getApprovalColor = (rate) => {
        if (rate >= 80) return colors.success;
        if (rate >= 50) return colors.warning;
        return colors.error;
    };

    if (loading && !reportData) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <CustomHeader title="Visa Reports" showBack onBack={() => navigation.goBack()} />
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
                title="Visa Reports"
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
                            'Total Applications',
                            reportData?.summary?.total_applications || '0',
                            'airplane',
                            colors.primary
                        )}
                        {renderStatCard(
                            'Approved',
                            reportData?.summary?.approved || '0',
                            'checkmark-circle',
                            colors.success,
                            `${reportData?.summary?.approval_rate || '0'}% rate`
                        )}
                        {renderStatCard(
                            'In Process',
                            reportData?.summary?.in_process || '0',
                            'time',
                            colors.warning
                        )}
                        {renderStatCard(
                            'Rejected',
                            reportData?.summary?.rejected || '0',
                            'close-circle',
                            colors.error
                        )}
                    </View>
                </View>

                {/* Processing Time Stats */}
                {reportData?.processing_time && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Processing Time</Text>
                            <Ionicons name="time" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            <View style={styles.processingItem}>
                                <Text style={styles.processingLabel}>Average Processing Time</Text>
                                <Text style={styles.processingValue}>
                                    {reportData.processing_time.average || 'N/A'} days
                                </Text>
                            </View>
                            <View style={styles.processingItem}>
                                <Text style={styles.processingLabel}>Fastest Processing</Text>
                                <Text style={[styles.processingValue, { color: colors.success }]}>
                                    {reportData.processing_time.fastest || 'N/A'} days
                                </Text>
                            </View>
                            <View style={styles.processingItem}>
                                <Text style={styles.processingLabel}>Slowest Processing</Text>
                                <Text style={[styles.processingValue, { color: colors.error }]}>
                                    {reportData.processing_time.slowest || 'N/A'} days
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Status Distribution */}
                {reportData?.status_distribution && reportData.status_distribution.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Visa Status</Text>
                            <Ionicons name="pie-chart" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.status_distribution.map((item, index) =>
                                renderStatusItem(item.status, item.count, item.percentage, index)
                            )}
                        </View>
                    </View>
                )}

                {/* Country-wise Visa Stats */}
                {reportData?.country_stats && reportData.country_stats.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Country-wise Statistics</Text>
                            <Ionicons name="globe" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.country_stats.map((item, index) =>
                                renderCountryItem(
                                    item.country,
                                    item.total,
                                    item.approved,
                                    item.approval_rate,
                                    item.avg_processing_time,
                                    index
                                )
                            )}
                        </View>
                    </View>
                )}

                {/* Monthly Trend */}
                {reportData?.monthly_trend && reportData.monthly_trend.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Monthly Trend</Text>
                            <Ionicons name="trending-up" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.monthly_trend.map((item, index) => (
                                <View key={index} style={styles.trendItem}>
                                    <Text style={styles.trendMonth}>{item.month}</Text>
                                    <View style={styles.trendStats}>
                                        <Text style={styles.trendCount}>{item.count} applications</Text>
                                        {item.approval_rate !== undefined && (
                                            <Text style={[styles.trendRate, { color: getApprovalColor(item.approval_rate) }]}>
                                                {item.approval_rate}% approved
                                            </Text>
                                        )}
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
        fontSize: fontSizes.xxl,
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
    processingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    processingLabel: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
    },
    processingValue: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    statusItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    statusInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    statusName: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontWeight: '500',
    },
    statusStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    statusCount: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    statusPercentage: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    countryItem: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    countryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    countryName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    countryRate: {
        fontSize: fontSizes.md,
        fontWeight: '700',
    },
    countryStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    countryStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    countryStatText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    trendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    trendMonth: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    trendStats: {
        alignItems: 'flex-end',
    },
    trendCount: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    trendRate: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
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

export default VisaReportsScreen;
