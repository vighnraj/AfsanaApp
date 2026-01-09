// Lead Reports Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import CustomHeader from '../../components/common/CustomHeader';
import { showToast } from '../../components/common/Toast';
import { getLeadReports, exportReport } from '../../api/reportingApi';
import DatePickerModal from '../../components/common/DatePickerModal';

const { width } = Dimensions.get('window');

const LeadReportsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedCounselor, setSelectedCounselor] = useState('');
    const [selectedSource, setSelectedSource] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Fetch lead reports
    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (startDate) filters.start_date = startDate;
            if (endDate) filters.end_date = endDate;
            if (selectedBranch) filters.branch_id = selectedBranch;
            if (selectedCounselor) filters.counselor_id = selectedCounselor;
            if (selectedSource) filters.source = selectedSource;
            if (selectedStatus) filters.status = selectedStatus;

            const data = await getLeadReports(filters);
            setReportData(data);
        } catch (error) {
            console.error('Fetch lead reports error:', error);
            showToast.error('Error', 'Failed to load lead reports');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, selectedBranch, selectedCounselor, selectedSource, selectedStatus]);

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
            if (selectedBranch) filters.branch_id = selectedBranch;
            if (selectedCounselor) filters.counselor_id = selectedCounselor;

            await exportReport('leads', format, filters);
            showToast.success('Export', `Lead report exported as ${format.toUpperCase()}`);
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
        setSelectedBranch('');
        setSelectedCounselor('');
        setSelectedSource('');
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

    // Render source distribution item
    const renderSourceItem = (source, count, percentage, index) => (
        <View key={index} style={styles.sourceItem}>
            <View style={styles.sourceInfo}>
                <View style={[styles.sourceDot, { backgroundColor: getSourceColor(index) }]} />
                <Text style={styles.sourceName}>{source}</Text>
            </View>
            <View style={styles.sourceStats}>
                <Text style={styles.sourceCount}>{count}</Text>
                <Text style={styles.sourcePercentage}>{percentage}%</Text>
            </View>
        </View>
    );

    // Get source color
    const getSourceColor = (index) => {
        const colorPalette = [
            colors.primary,
            colors.success,
            colors.warning,
            colors.info,
            colors.secondary,
            colors.primaryDark,
            colors.successLight,
        ];
        return colorPalette[index % colorPalette.length];
    };

    // Render conversion funnel item
    const renderFunnelItem = (stage, count, percentage, index, total) => {
        const width = (percentage / 100) * (Dimensions.get('window').width - spacing.lg * 4);
        return (
            <View key={index} style={styles.funnelItem}>
                <View style={styles.funnelHeader}>
                    <Text style={styles.funnelStage}>{stage}</Text>
                    <Text style={styles.funnelCount}>{count}</Text>
                </View>
                <View style={styles.funnelBarContainer}>
                    <View style={[styles.funnelBar, { width, backgroundColor: getFunnelColor(index, total) }]} />
                </View>
                <Text style={styles.funnelPercentage}>{percentage}%</Text>
            </View>
        );
    };

    // Get funnel color
    const getFunnelColor = (index, total) => {
        const progress = index / (total - 1);
        if (progress < 0.33) return colors.error;
        if (progress < 0.66) return colors.warning;
        return colors.success;
    };

    if (loading && !reportData) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <CustomHeader title="Lead Reports" showBack onBack={() => navigation.goBack()} />
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
                title="Lead Reports"
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
                                <Text style={styles.dateButtonText}>
                                    {startDate || 'Start Date'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowEndDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                                <Text style={styles.dateButtonText}>
                                    {endDate || 'End Date'}
                                </Text>
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
                            'Total Leads',
                            reportData?.summary?.total_leads || '0',
                            'people',
                            colors.primary
                        )}
                        {renderStatCard(
                            'Converted',
                            reportData?.summary?.converted || '0',
                            'checkmark-circle',
                            colors.success,
                            `${reportData?.summary?.conversion_rate || '0'}% rate`
                        )}
                        {renderStatCard(
                            'In Progress',
                            reportData?.summary?.in_progress || '0',
                            'time',
                            colors.warning
                        )}
                        {renderStatCard(
                            'Not Interested',
                            reportData?.summary?.not_interested || '0',
                            'close-circle',
                            colors.error
                        )}
                    </View>
                </View>

                {/* Conversion Funnel */}
                {reportData?.conversion_funnel && reportData.conversion_funnel.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Conversion Funnel</Text>
                            <Ionicons name="funnel" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.conversion_funnel.map((item, index) =>
                                renderFunnelItem(
                                    item.stage,
                                    item.count,
                                    item.percentage,
                                    index,
                                    reportData.conversion_funnel.length
                                )
                            )}
                        </View>
                    </View>
                )}

                {/* Source Distribution */}
                {reportData?.source_distribution && reportData.source_distribution.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Lead Sources</Text>
                            <Ionicons name="analytics" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.source_distribution.map((item, index) =>
                                renderSourceItem(item.source, item.count, item.percentage, index)
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
                                        <Text style={styles.trendCount}>{item.count} leads</Text>
                                        {item.change && (
                                            <View style={styles.trendChange}>
                                                <Ionicons
                                                    name={item.change > 0 ? 'arrow-up' : 'arrow-down'}
                                                    size={14}
                                                    color={item.change > 0 ? colors.success : colors.error}
                                                />
                                                <Text
                                                    style={[
                                                        styles.trendChangeText,
                                                        { color: item.change > 0 ? colors.success : colors.error },
                                                    ]}
                                                >
                                                    {Math.abs(item.change)}%
                                                </Text>
                                            </View>
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
                                        <Text style={[styles.exportButtonText, { color: colors.success }]}>
                                            Excel
                                        </Text>
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
    sourceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    sourceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sourceDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    sourceName: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontWeight: '500',
    },
    sourceStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    sourceCount: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    sourcePercentage: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    funnelItem: {
        marginBottom: spacing.md,
    },
    funnelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    funnelStage: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    funnelCount: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    funnelBarContainer: {
        height: 24,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.xs,
    },
    funnelBar: {
        height: '100%',
        borderRadius: borderRadius.sm,
    },
    funnelPercentage: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        textAlign: 'right',
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    trendCount: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    trendChange: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendChangeText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        marginLeft: 2,
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

export default LeadReportsScreen;
