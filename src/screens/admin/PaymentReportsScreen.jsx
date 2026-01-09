// Payment Reports Screen

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
import { getPaymentReports, exportReport } from '../../api/reportingApi';
import DatePickerModal from '../../components/common/DatePickerModal';

const PaymentReportsScreen = ({ navigation }) => {
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
    const [paymentStatus, setPaymentStatus] = useState('');
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Fetch payment reports
    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (startDate) filters.start_date = startDate;
            if (endDate) filters.end_date = endDate;
            if (selectedBranch) filters.branch_id = selectedBranch;
            if (paymentStatus) filters.status = paymentStatus;

            const data = await getPaymentReports(filters);
            setReportData(data);
        } catch (error) {
            console.error('Fetch payment reports error:', error);
            showToast.error('Error', 'Failed to load payment reports');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, selectedBranch, paymentStatus]);

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

            await exportReport('payments', format, filters);
            showToast.success('Export', `Payment report exported as ${format.toUpperCase()}`);
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
        setPaymentStatus('');
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

    // Render monthly revenue item
    const renderMonthlyItem = (month, amount, change, index) => (
        <View key={index} style={styles.monthlyItem}>
            <Text style={styles.monthlyMonth}>{month}</Text>
            <View style={styles.monthlyStats}>
                <Text style={styles.monthlyAmount}>{formatCurrency(amount)}</Text>
                {change !== undefined && (
                    <View style={styles.monthlyChange}>
                        <Ionicons
                            name={change >= 0 ? 'arrow-up' : 'arrow-down'}
                            size={14}
                            color={change >= 0 ? colors.success : colors.error}
                        />
                        <Text
                            style={[
                                styles.monthlyChangeText,
                                { color: change >= 0 ? colors.success : colors.error },
                            ]}
                        >
                            {Math.abs(change)}%
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );

    // Render payment method item
    const renderPaymentMethodItem = (method, count, amount, percentage, index) => (
        <View key={index} style={styles.methodItem}>
            <View style={styles.methodInfo}>
                <View style={[styles.methodDot, { backgroundColor: getMethodColor(index) }]} />
                <Text style={styles.methodName}>{method}</Text>
            </View>
            <View style={styles.methodStats}>
                <Text style={styles.methodCount}>{count} txns</Text>
                <Text style={styles.methodAmount}>{formatCurrency(amount)}</Text>
                <Text style={styles.methodPercentage}>{percentage}%</Text>
            </View>
        </View>
    );

    // Get payment method color
    const getMethodColor = (index) => {
        const colorPalette = [colors.primary, colors.success, colors.warning, colors.info, colors.secondary];
        return colorPalette[index % colorPalette.length];
    };

    if (loading && !reportData) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <CustomHeader title="Payment Reports" showBack onBack={() => navigation.goBack()} />
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
                title="Payment Reports"
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
                            'Total Revenue',
                            formatCurrency(reportData?.summary?.total_revenue || 0),
                            'cash',
                            colors.success
                        )}
                        {renderStatCard(
                            'Collected',
                            formatCurrency(reportData?.summary?.collected || 0),
                            'checkmark-circle',
                            colors.primary,
                            `${reportData?.summary?.collection_rate || '0'}% rate`
                        )}
                        {renderStatCard(
                            'Outstanding',
                            formatCurrency(reportData?.summary?.outstanding || 0),
                            'time',
                            colors.warning
                        )}
                        {renderStatCard(
                            'Transactions',
                            reportData?.summary?.total_transactions || '0',
                            'receipt',
                            colors.info
                        )}
                    </View>
                </View>

                {/* Monthly Revenue Trend */}
                {reportData?.monthly_revenue && reportData.monthly_revenue.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Monthly Revenue</Text>
                            <Ionicons name="trending-up" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.monthly_revenue.map((item, index) =>
                                renderMonthlyItem(item.month, item.amount, item.change, index)
                            )}
                        </View>
                    </View>
                )}

                {/* Payment Methods */}
                {reportData?.payment_methods && reportData.payment_methods.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Payment Methods</Text>
                            <Ionicons name="card" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.payment_methods.map((item, index) =>
                                renderPaymentMethodItem(
                                    item.method,
                                    item.count,
                                    item.amount,
                                    item.percentage,
                                    index
                                )
                            )}
                        </View>
                    </View>
                )}

                {/* Outstanding Payments */}
                {reportData?.outstanding_payments && reportData.outstanding_payments.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Top Outstanding</Text>
                            <Ionicons name="alert-circle" size={20} color={colors.warning} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.outstanding_payments.map((item, index) => (
                                <View key={index} style={styles.outstandingItem}>
                                    <View style={styles.outstandingInfo}>
                                        <Text style={styles.outstandingName}>{item.student_name}</Text>
                                        <Text style={styles.outstandingDays}>{item.days_overdue} days overdue</Text>
                                    </View>
                                    <Text style={[styles.outstandingAmount, { color: colors.error }]}>
                                        {formatCurrency(item.amount)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Branch Revenue */}
                {reportData?.branch_revenue && reportData.branch_revenue.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Branch Revenue</Text>
                            <Ionicons name="business" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.branch_revenue.map((item, index) => (
                                <View key={index} style={styles.branchItem}>
                                    <Text style={styles.branchName}>{item.branch}</Text>
                                    <Text style={styles.branchRevenue}>{formatCurrency(item.revenue)}</Text>
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
    monthlyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    monthlyMonth: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    monthlyStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    monthlyAmount: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.success,
    },
    monthlyChange: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    monthlyChangeText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        marginLeft: 2,
    },
    methodItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    methodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    methodDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    methodName: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontWeight: '500',
    },
    methodStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    methodCount: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
    },
    methodAmount: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    methodPercentage: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    outstandingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    outstandingInfo: {
        flex: 1,
    },
    outstandingName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    outstandingDays: {
        fontSize: fontSizes.sm,
        color: colors.warning,
        marginTop: 2,
    },
    outstandingAmount: {
        fontSize: fontSizes.md,
        fontWeight: '700',
    },
    branchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    branchName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    branchRevenue: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.success,
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

export default PaymentReportsScreen;
