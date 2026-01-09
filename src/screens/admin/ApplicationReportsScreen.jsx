// Application Reports Screen

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
import { getApplicationReports, exportReport } from '../../api/reportingApi';
import DatePickerModal from '../../components/common/DatePickerModal';

const ApplicationReportsScreen = ({ navigation }) => {
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

    // Fetch application reports
    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (startDate) filters.start_date = startDate;
            if (endDate) filters.end_date = endDate;
            if (selectedCountry) filters.country = selectedCountry;
            if (selectedStatus) filters.status = selectedStatus;

            const data = await getApplicationReports(filters);
            setReportData(data);
        } catch (error) {
            console.error('Fetch application reports error:', error);
            showToast.error('Error', 'Failed to load application reports');
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

            await exportReport('applications', format, filters);
            showToast.success('Export', `Application report exported as ${format.toUpperCase()}`);
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

    // Render university item
    const renderUniversityItem = (name, applications, accepted, success_rate, index) => (
        <View key={index} style={styles.universityItem}>
            <View style={styles.universityHeader}>
                <Text style={styles.universityName} numberOfLines={2}>{name}</Text>
                <Text style={[styles.universityRate, { color: getSuccessColor(success_rate) }]}>
                    {success_rate}%
                </Text>
            </View>
            <View style={styles.universityStats}>
                <View style={styles.universityStat}>
                    <Ionicons name="document-text" size={16} color={colors.textSecondary} />
                    <Text style={styles.universityStatText}>{applications} applied</Text>
                </View>
                <View style={styles.universityStat}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.universityStatText}>{accepted} accepted</Text>
                </View>
            </View>
        </View>
    );

    // Get success rate color
    const getSuccessColor = (rate) => {
        if (rate >= 70) return colors.success;
        if (rate >= 40) return colors.warning;
        return colors.error;
    };

    // Render status distribution item
    const renderStatusItem = (status, count, percentage, index) => {
        const getStatusColor = (status) => {
            const statusLower = status.toLowerCase();
            if (statusLower.includes('accept') || statusLower.includes('approved')) return colors.success;
            if (statusLower.includes('reject') || statusLower.includes('declined')) return colors.error;
            if (statusLower.includes('pending') || statusLower.includes('review')) return colors.warning;
            return colors.info;
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

    if (loading && !reportData) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <CustomHeader title="Application Reports" showBack onBack={() => navigation.goBack()} />
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
                title="Application Reports"
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
                            'document-text',
                            colors.primary
                        )}
                        {renderStatCard(
                            'Accepted',
                            reportData?.summary?.accepted || '0',
                            'checkmark-circle',
                            colors.success,
                            `${reportData?.summary?.success_rate || '0'}% rate`
                        )}
                        {renderStatCard(
                            'Pending',
                            reportData?.summary?.pending || '0',
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

                {/* Status Distribution */}
                {reportData?.status_distribution && reportData.status_distribution.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Application Status</Text>
                            <Ionicons name="pie-chart" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.status_distribution.map((item, index) =>
                                renderStatusItem(item.status, item.count, item.percentage, index)
                            )}
                        </View>
                    </View>
                )}

                {/* Top Universities */}
                {reportData?.top_universities && reportData.top_universities.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Top Universities</Text>
                            <Ionicons name="school" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.top_universities.map((item, index) =>
                                renderUniversityItem(
                                    item.university,
                                    item.applications,
                                    item.accepted,
                                    item.success_rate,
                                    index
                                )
                            )}
                        </View>
                    </View>
                )}

                {/* Country Distribution */}
                {reportData?.country_distribution && reportData.country_distribution.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Applications by Country</Text>
                            <Ionicons name="globe" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.country_distribution.map((item, index) => (
                                <View key={index} style={styles.countryItem}>
                                    <Text style={styles.countryName}>{item.country}</Text>
                                    <View style={styles.countryStats}>
                                        <Text style={styles.countryCount}>{item.count} applications</Text>
                                        <Text style={[styles.countryRate, { color: getSuccessColor(item.success_rate) }]}>
                                            {item.success_rate}%
                                        </Text>
                                    </View>
                                </View>
                            ))}
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
                                        {item.change !== undefined && (
                                            <View style={styles.trendChange}>
                                                <Ionicons
                                                    name={item.change >= 0 ? 'arrow-up' : 'arrow-down'}
                                                    size={14}
                                                    color={item.change >= 0 ? colors.success : colors.error}
                                                />
                                                <Text
                                                    style={[
                                                        styles.trendChangeText,
                                                        { color: item.change >= 0 ? colors.success : colors.error },
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
    universityItem: {
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    universityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    universityName: {
        flex: 1,
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
        marginRight: spacing.sm,
    },
    universityRate: {
        fontSize: fontSizes.md,
        fontWeight: '700',
    },
    universityStats: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    universityStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    universityStatText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    countryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    countryName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    countryStats: {
        alignItems: 'flex-end',
    },
    countryCount: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    countryRate: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        marginTop: 2,
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

export default ApplicationReportsScreen;
