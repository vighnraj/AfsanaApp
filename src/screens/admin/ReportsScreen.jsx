// Reports and Analytics Screen

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import CustomHeader from '../../components/common/CustomHeader';
import Card from '../../components/common/Card';
import { showToast } from '../../components/common/Toast';

const ReportsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Refresh logic here
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    // Report categories
    const reportCategories = [
        {
            id: 'lead',
            title: 'Lead Reports',
            description: 'Lead generation, conversion rates, and source analysis',
            icon: 'people',
            color: colors.primary,
            screen: 'LeadReports',
        },
        {
            id: 'student',
            title: 'Student Reports',
            description: 'Student enrollment trends and distribution',
            icon: 'school',
            color: colors.success,
            screen: 'StudentReports',
        },
        {
            id: 'counselor',
            title: 'Counselor Performance',
            description: 'Counselor metrics, conversion rates, and targets',
            icon: 'analytics',
            color: colors.warning,
            screen: 'CounselorReports',
        },
        {
            id: 'payment',
            title: 'Payment Reports',
            description: 'Revenue analysis, payment collection, and outstanding',
            icon: 'cash',
            color: colors.info,
            screen: 'PaymentReports',
        },
        {
            id: 'branch',
            title: 'Branch Reports',
            description: 'Branch-wise performance and revenue',
            icon: 'business',
            color: colors.secondary,
            screen: 'BranchReports',
        },
        {
            id: 'application',
            title: 'Application Reports',
            description: 'Application success rates and university-wise data',
            icon: 'document-text',
            color: colors.primaryDark,
            screen: 'ApplicationReports',
        },
        {
            id: 'visa',
            title: 'Visa Reports',
            description: 'Visa application status and processing times',
            icon: 'airplane',
            color: colors.successLight,
            screen: 'VisaReports',
        },
    ];

    // Quick stats (sample data - replace with actual API data)
    const quickStats = [
        { label: 'Total Leads', value: '1,234', change: '+12%', trend: 'up', icon: 'trending-up' },
        { label: 'Conversions', value: '456', change: '+8%', trend: 'up', icon: 'checkmark-circle' },
        { label: 'Revenue', value: '$45.6K', change: '+15%', trend: 'up', icon: 'cash' },
        { label: 'Applications', value: '789', change: '+5%', trend: 'up', icon: 'document' },
    ];

    const renderStatCard = (stat, index) => (
        <View key={index} style={[styles.statCard, shadows.sm]}>
            <View style={styles.statIconContainer}>
                <Ionicons name={stat.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <View style={styles.statChange}>
                    <Ionicons
                        name={stat.trend === 'up' ? 'arrow-up' : 'arrow-down'}
                        size={14}
                        color={stat.trend === 'up' ? colors.success : colors.error}
                    />
                    <Text style={[
                        styles.statChangeText,
                        { color: stat.trend === 'up' ? colors.success : colors.error }
                    ]}>
                        {stat.change}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderReportCard = (report) => (
        <TouchableOpacity
            key={report.id}
            style={[styles.reportCard, shadows.sm]}
            onPress={() => navigation.navigate(report.screen)}
            activeOpacity={0.7}
        >
            <View style={[styles.reportIconContainer, { backgroundColor: `${report.color}15` }]}>
                <Ionicons name={report.icon} size={32} color={report.color} />
            </View>
            <View style={styles.reportContent}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDescription}>{report.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.gray400} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <CustomHeader
                title="Reports & Analytics"
                showBack={false}
                rightAction={
                    <TouchableOpacity onPress={() => showToast.info('Info', 'Pull down to refresh data')}>
                        <Ionicons name="information-circle-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Dashboard Overview</Text>
                    <Text style={styles.headerSubtitle}>Quick insights at a glance</Text>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    {quickStats.map((stat, index) => renderStatCard(stat, index))}
                </View>

                {/* Reports Section */}
                <View style={styles.reportsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Available Reports</Text>
                        <Text style={styles.sectionSubtitle}>
                            Tap any report to view detailed analytics
                        </Text>
                    </View>

                    <View style={styles.reportsList}>
                        {reportCategories.map(renderReportCard)}
                    </View>
                </View>

                {/* Export All Section */}
                <View style={styles.exportSection}>
                    <View style={[styles.exportCard, shadows.sm]}>
                        <View style={styles.exportHeader}>
                            <Ionicons name="download" size={28} color={colors.primary} />
                            <Text style={styles.exportTitle}>Export All Data</Text>
                        </View>
                        <Text style={styles.exportDescription}>
                            Download comprehensive reports in your preferred format
                        </Text>
                        <View style={styles.exportButtons}>
                            <TouchableOpacity
                                style={[styles.exportButton, { backgroundColor: `${colors.success}15` }]}
                                onPress={() => showToast.info('Export', 'Excel export coming soon')}
                            >
                                <Ionicons name="document" size={20} color={colors.success} />
                                <Text style={[styles.exportButtonText, { color: colors.success }]}>Excel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.exportButton, { backgroundColor: `${colors.error}15` }]}
                                onPress={() => showToast.info('Export', 'PDF export coming soon')}
                            >
                                <Ionicons name="document-text" size={20} color={colors.error} />
                                <Text style={[styles.exportButtonText, { color: colors.error }]}>PDF</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.exportButton, { backgroundColor: `${colors.warning}15` }]}
                                onPress={() => showToast.info('Export', 'CSV export coming soon')}
                            >
                                <Ionicons name="grid" size={20} color={colors.warning} />
                                <Text style={[styles.exportButtonText, { color: colors.warning }]}>CSV</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: spacing.xxl }} />
            </ScrollView>
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
    header: {
        padding: spacing.lg,
        backgroundColor: colors.white,
    },
    headerTitle: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    headerSubtitle: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.md,
        paddingTop: spacing.sm,
        gap: spacing.sm,
    },
    statCard: {
        flex: 1,
        minWidth: '47%',
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${colors.primary}10`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    statValue: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    statChange: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statChangeText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
        marginLeft: 2,
    },
    reportsSection: {
        padding: spacing.md,
        paddingTop: spacing.lg,
    },
    sectionHeader: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    sectionSubtitle: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    reportsList: {
        gap: spacing.sm,
    },
    reportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    reportIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    reportDescription: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    exportSection: {
        padding: spacing.md,
    },
    exportCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
    },
    exportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    exportTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
        marginLeft: spacing.sm,
    },
    exportDescription: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    exportButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    exportButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
    },
    exportButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        marginLeft: spacing.xs,
    },
});

export default ReportsScreen;
