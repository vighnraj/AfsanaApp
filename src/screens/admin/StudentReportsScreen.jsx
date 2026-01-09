// Student Reports Screen

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
import { getStudentReports, exportReport } from '../../api/reportingApi';
import DatePickerModal from '../../components/common/DatePickerModal';

const StudentReportsScreen = ({ navigation }) => {
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
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Fetch student reports
    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const filters = {};
            if (startDate) filters.start_date = startDate;
            if (endDate) filters.end_date = endDate;
            if (selectedBranch) filters.branch_id = selectedBranch;
            if (selectedCourse) filters.course = selectedCourse;
            if (selectedCountry) filters.country = selectedCountry;

            const data = await getStudentReports(filters);
            setReportData(data);
        } catch (error) {
            console.error('Fetch student reports error:', error);
            showToast.error('Error', 'Failed to load student reports');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, selectedBranch, selectedCourse, selectedCountry]);

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

            await exportReport('students', format, filters);
            showToast.success('Export', `Student report exported as ${format.toUpperCase()}`);
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
        setSelectedCourse('');
        setSelectedCountry('');
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

    // Render country distribution item
    const renderCountryItem = (country, count, percentage, index) => {
        const barWidth = (percentage / 100) * (Dimensions.get('window').width - spacing.lg * 4);
        return (
            <View key={index} style={styles.countryItem}>
                <View style={styles.countryHeader}>
                    <Text style={styles.countryName}>{country}</Text>
                    <Text style={styles.countryCount}>{count}</Text>
                </View>
                <View style={styles.countryBarContainer}>
                    <View style={[styles.countryBar, { width: barWidth, backgroundColor: getCountryColor(index) }]} />
                </View>
                <Text style={styles.countryPercentage}>{percentage}%</Text>
            </View>
        );
    };

    // Get country color
    const getCountryColor = (index) => {
        const colorPalette = [
            colors.primary,
            colors.success,
            colors.warning,
            colors.info,
            colors.secondary,
            colors.primaryDark,
        ];
        return colorPalette[index % colorPalette.length];
    };

    // Render course distribution item
    const renderCourseItem = (course, count, percentage, index) => (
        <View key={index} style={styles.courseItem}>
            <View style={styles.courseInfo}>
                <View style={[styles.courseDot, { backgroundColor: getCourseColor(index) }]} />
                <Text style={styles.courseName} numberOfLines={1}>{course}</Text>
            </View>
            <View style={styles.courseStats}>
                <Text style={styles.courseCount}>{count}</Text>
                <Text style={styles.coursePercentage}>{percentage}%</Text>
            </View>
        </View>
    );

    // Get course color
    const getCourseColor = (index) => {
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

    if (loading && !reportData) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['bottom']}>
                <CustomHeader title="Student Reports" showBack onBack={() => navigation.goBack()} />
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
                title="Student Reports"
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
                            'Total Students',
                            reportData?.summary?.total_students || '0',
                            'school',
                            colors.primary
                        )}
                        {renderStatCard(
                            'Active',
                            reportData?.summary?.active || '0',
                            'checkmark-circle',
                            colors.success,
                            `${reportData?.summary?.active_percentage || '0'}%`
                        )}
                        {renderStatCard(
                            'Graduated',
                            reportData?.summary?.graduated || '0',
                            'trophy',
                            colors.warning
                        )}
                        {renderStatCard(
                            'New This Month',
                            reportData?.summary?.new_this_month || '0',
                            'person-add',
                            colors.info
                        )}
                    </View>
                </View>

                {/* Country Distribution */}
                {reportData?.country_distribution && reportData.country_distribution.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Students by Country</Text>
                            <Ionicons name="globe" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.country_distribution.map((item, index) =>
                                renderCountryItem(item.country, item.count, item.percentage, index)
                            )}
                        </View>
                    </View>
                )}

                {/* Course Distribution */}
                {reportData?.course_distribution && reportData.course_distribution.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Popular Courses</Text>
                            <Ionicons name="book" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.course_distribution.map((item, index) =>
                                renderCourseItem(item.course, item.count, item.percentage, index)
                            )}
                        </View>
                    </View>
                )}

                {/* Enrollment Trend */}
                {reportData?.enrollment_trend && reportData.enrollment_trend.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Enrollment Trend</Text>
                            <Ionicons name="trending-up" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.enrollment_trend.map((item, index) => (
                                <View key={index} style={styles.trendItem}>
                                    <Text style={styles.trendMonth}>{item.month}</Text>
                                    <View style={styles.trendStats}>
                                        <Text style={styles.trendCount}>{item.count} enrolled</Text>
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

                {/* Branch Distribution */}
                {reportData?.branch_distribution && reportData.branch_distribution.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Students by Branch</Text>
                            <Ionicons name="business" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={[styles.card, shadows.sm]}>
                            {reportData.branch_distribution.map((item, index) => (
                                <View key={index} style={styles.branchItem}>
                                    <Text style={styles.branchName}>{item.branch}</Text>
                                    <Text style={styles.branchCount}>{item.count} students</Text>
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
    countryItem: {
        marginBottom: spacing.md,
    },
    countryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    countryName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    countryCount: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
    },
    countryBarContainer: {
        height: 20,
        backgroundColor: colors.gray100,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.xs,
    },
    countryBar: {
        height: '100%',
        borderRadius: borderRadius.sm,
    },
    countryPercentage: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        textAlign: 'right',
    },
    courseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    courseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.md,
    },
    courseDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    courseName: {
        fontSize: fontSizes.md,
        color: colors.text,
        fontWeight: '500',
        flex: 1,
    },
    courseStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    courseCount: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    coursePercentage: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        minWidth: 45,
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
    branchCount: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
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

export default StudentReportsScreen;
