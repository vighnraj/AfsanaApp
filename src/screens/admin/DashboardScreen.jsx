// Admin Dashboard Screen - Enhanced with Charts
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
const SimpleBarChart = ({ data }) => {
    const max = Math.max(1, ...data.map(d => d.value || 0));
    return (
        <View style={{ width: '100%', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 140, width: '100%', paddingHorizontal: 8 }}>
                {data.map((d, i) => (
                    <View key={i} style={{ flex: 1, alignItems: 'center', marginHorizontal: 6 }}>
                        <View style={{ height: (d.value / max) * 120, width: 24, backgroundColor: d.frontColor || '#888', borderRadius: 6 }} />
                        <Text style={{ marginTop: 6, fontSize: 10 }}>{d.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const SimpleLineChart = ({ data }) => {
    return (
        <View style={{ width: '100%', paddingHorizontal: 8, height: 160, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {data.map((d, i) => (
                    <View key={i} style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 10 }}>{d.label}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700' }}>{d.value}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const SimplePieChart = ({ data }) => {
    return (
        <View style={{ width: '100%', alignItems: 'center', paddingVertical: 12 }}>
            <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Lead</Text>
            </View>
        </View>
    );
};

import { useAuth } from '../../context/AuthContext';
import { getAdminDashboard, getDashboardInfo } from '../../api/dashboardApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import CustomHeader from '../../components/common/CustomHeader';
import NotificationBell from '../../components/common/NotificationBell';
import FilterDropdown from '../../components/common/FilterDropdown';
import { BOTTOM_TAB_SPACING, DATE_RANGE_OPTIONS, BRANCH_OPTIONS } from '../../utils/constants';
import { getCounselors } from '../../api/userApi';

const SCREEN_WIDTH = Dimensions.get('window').width;

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [counselors, setCounselors] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        dateRange: 'all',
        counselor_id: '',
        branch: '',
    });

    useEffect(() => {
        // Fetch counselors for filter
        const loadCounselors = async () => {
            try {
                const data = await getCounselors();
                const formatted = (data.data || data || []).map(c => ({
                    value: c.id.toString(),
                    label: c.full_name
                }));
                setCounselors(formatted);
            } catch (err) {
                console.error('Load counselors error:', err);
            }
        };
        loadCounselors();
    }, []);

    const fetchDashboardData = useCallback(async () => {
        try {
            const [dashData, infoData] = await Promise.all([
                getAdminDashboard(filters),
                getDashboardInfo(),
            ]);

            setDashboardData({
                ...dashData,
                info: infoData,
            });
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            showToast.error('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    // Chart Data Mappings
    const funnelChartData = useMemo(() => {
        if (!dashboardData?.info?.conversion_funnel) return [];
        const f = dashboardData.info.conversion_funnel;
        return [
            { value: f.inquiries || 0, label: 'Inq', frontColor: colors.primary },
            { value: f.leadCount || 0, label: 'Lead', frontColor: colors.secondary },
            { value: f.studentCount || 0, label: 'Std', frontColor: colors.success },
            { value: f.application || 0, label: 'App', frontColor: colors.info },
        ];
    }, [dashboardData]);

    const timelineChartData = useMemo(() => {
        if (!dashboardData?.info?.weekly_inquiries_by_day) return [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dayMap = {
            'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
        };

        return dashboardData.info.weekly_inquiries_by_day.map(item => ({
            value: item.total_inquiries || 0,
            label: dayMap[item.day] || item.day.substring(0, 3),
        }));
    }, [dashboardData]);

    const countryPieData = useMemo(() => {
        if (!dashboardData?.info?.country_wise_converted_leads) return [];
        const chartColors = [colors.primary, colors.secondary, colors.success, colors.warning, colors.info, colors.danger, '#8e44ad', '#ff4081'];

        return dashboardData.info.country_wise_converted_leads.slice(0, 6).map((item, index) => ({
            value: item.inquiries || 0,
            color: chartColors[index % chartColors.length],
            text: item.country,
        }));
    }, [dashboardData]);

    // KPI data
    const kpiData = [
        { title: 'Total Leads', value: dashboardData?.totalleads || 0, icon: 'people', iconColor: colors.primary },
        { title: 'Total Students', value: dashboardData?.totalstudents || 0, icon: 'school', iconColor: colors.success },
        { title: 'Total Counselors', value: dashboardData?.totalcounselors || 0, icon: 'person', iconColor: colors.warning },
        { title: 'Universities', value: dashboardData?.totalUniversities || 0, icon: 'business', iconColor: colors.secondary },
        { title: 'Tasks', value: dashboardData?.totalTasks || 0, icon: 'checkbox', iconColor: colors.info },
        { title: 'Inquiries', value: dashboardData?.totalInquiries || 0, icon: 'mail', iconColor: colors.danger },
    ];

    if (loading) {
        return (
            <View style={styles.safeArea}>
                <CustomHeader title="Admin Dashboard" showBack={false} rightAction={<NotificationBell />} />
                <LoadingSpinner />
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <CustomHeader title="Admin Dashboard" showBack={false} rightAction={<NotificationBell />} />
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_TAB_SPACING }]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* User Greeting */}
                <View style={styles.subHeader}>
                    <View style={styles.greetingRow}>
                        <View>
                            <Text style={styles.greeting}>Hello, {user?.full_name || 'Administrator'}</Text>
                            <Text style={styles.subGreeting}>Here's what's happening today.</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.filterToggleBtn, showFilters && styles.filterToggleBtnActive]}
                            onPress={() => setShowFilters(!showFilters)}
                        >
                            <Ionicons name="filter" size={18} color={showFilters ? colors.white : colors.primary} />
                            <Text style={[styles.filterToggleText, showFilters && styles.filterToggleTextActive]}>Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Filters Section */}
                {showFilters && (
                    <View style={[styles.filterCard, shadows.sm]}>
                        <View style={styles.filterRow}>
                            <View style={styles.filterItem}>
                                <FilterDropdown
                                    label="Date Range"
                                    value={filters.dateRange}
                                    options={[
                                        { value: 'all', label: 'All Time' },
                                        { value: 'today', label: 'Today' },
                                        { value: 'week', label: 'This Week' },
                                        { value: 'month', label: 'This Month' },
                                        { value: 'quarter', label: 'This Quarter' },
                                        { value: 'year', label: 'This Year' },
                                    ]}
                                    onChange={(val) => setFilters(prev => ({ ...prev, dateRange: val }))}
                                />
                            </View>
                            <View style={styles.filterItem}>
                                <FilterDropdown
                                    label="Counselor"
                                    value={filters.counselor_id}
                                    options={[{ value: '', label: 'All Counselors' }, ...counselors]}
                                    onChange={(val) => setFilters(prev => ({ ...prev, counselor_id: val }))}
                                />
                            </View>
                        </View>
                        <View style={styles.filterRow}>
                            <View style={styles.filterItem}>
                                <FilterDropdown
                                    label="Branch"
                                    value={filters.branch}
                                    options={[{ value: '', label: 'All Branches' }, ...BRANCH_OPTIONS.map(b => ({ value: b, label: b }))]}
                                    onChange={(val) => setFilters(prev => ({ ...prev, branch: val }))}
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.clearFiltersBtn}
                                onPress={() => setFilters({ dateRange: 'all', counselor_id: '', branch: '' })}
                            >
                                <Ionicons name="refresh" size={16} color={colors.textSecondary} />
                                <Text style={styles.clearFiltersText}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Growth Banner */}
                <View style={[styles.growthBanner, shadows.lg]}>
                    <View style={styles.growthInfo}>
                        <Text style={styles.growthLabel}>This Month Conversion</Text>
                        <Text style={styles.growthValue}>{dashboardData?.info?.this_month_conversion_rate || '0.00%'}</Text>
                        <View style={styles.growthBadge}>
                            <Ionicons
                                name={parseFloat(dashboardData?.info?.growth_rate) >= 0 ? "trending-up" : "trending-down"}
                                size={14}
                                color={colors.white}
                            />
                            <Text style={styles.growthBadgeText}> {dashboardData?.info?.growth_rate || '0%'} vs last month</Text>
                        </View>
                    </View>
                    <View style={styles.growthIconContainer}>
                        <Ionicons name="rocket" size={40} color="rgba(255,255,255,0.4)" />
                    </View>
                </View>

                {/* KPI Grid */}
                <View style={styles.kpiGrid}>
                    {kpiData.map((item, index) => (
                        <View key={index} style={styles.kpiItem}>
                            <Card title={item.title} value={item.value} icon={item.icon} iconColor={item.iconColor} />
                        </View>
                    ))}
                </View>

                {/* Charts Section */}
                <Text style={styles.sectionTitle}>Conversion Funnel</Text>
                <View style={[styles.chartCard, shadows.md]}>
                    <SimpleBarChart data={funnelChartData} />
                </View>

                <Text style={styles.sectionTitle}>Inquiry Heatmap</Text>
                <View style={[styles.chartCard, shadows.md]}>
                    <SimpleLineChart data={timelineChartData} />
                </View>

                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>Country Map</Text>
                        <View style={[styles.chartCard, shadows.md]}>
                            <SimplePieChart data={countryPieData} />
                            <View style={styles.pieLegend}>
                                {countryPieData.map((item, i) => (
                                    <View key={i} style={styles.legendItem}>
                                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                        <Text style={styles.legendText} numberOfLines={1}>{item.text}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Performing Counselors */}
                <Text style={styles.sectionTitle}>Top Performers</Text>
                <View style={[styles.tableCard, shadows.md]}>
                    {dashboardData?.info?.top_counselors?.slice(0, 5).map((counselor, idx) => (
                        <View key={idx} style={[styles.tableRow, idx === 0 && { borderTopWidth: 0 }]}>
                            <View style={styles.counselorAvatar}>
                                <Text style={styles.avatarText}>{counselor.full_name?.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.counselorName}>{counselor.full_name}</Text>
                                <Text style={styles.counselorRole}>Counselor</Text>
                            </View>
                            <View style={styles.counselorStats}>
                                <Text style={styles.counselorCount}>{counselor.converted_leads}</Text>
                                <Text style={styles.counselorLabel}>Leads</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Shortcuts</Text>
                <View style={styles.quickActions}>
                    <ActionBtn icon="today" color={colors.primary} label="Today" onPress={() => navigation.navigate('More', { screen: 'TodaysInquiries' })} />
                    <ActionBtn icon="notifications" color={colors.warning} label="Tasks" onPress={() => navigation.navigate('More', { screen: 'TaskReminders' })} />
                    <ActionBtn icon="stats-chart" color={colors.info} label="Reports" onPress={() => navigation.navigate('More', { screen: 'Reports' })} />
                    <ActionBtn icon="document" color={colors.success} label="Apps" onPress={() => navigation.navigate('More', { screen: 'ApplicationTracker' })} />
                </View>

                <View style={styles.quickActions}>
                    <ActionBtn icon="mail" color={colors.primary} label="Inquiries" onPress={() => navigation.navigate('Leads', { screen: 'InquiryList' })} />
                    <ActionBtn icon="people" color={colors.success} label="Leads" onPress={() => navigation.navigate('Leads', { screen: 'LeadList' })} />
                    <ActionBtn icon="school" color={colors.warning} label="Students" onPress={() => navigation.navigate('Students')} />
                    <ActionBtn icon="receipt" color={colors.secondary} label="Invoices" onPress={() => navigation.navigate('More', { screen: 'InvoiceDownload' })} />
                </View>

            </ScrollView>
        </View>
    );
};

const ActionBtn = ({ icon, color, label, onPress }) => (
    <TouchableOpacity style={[styles.actionCard, shadows.md]} onPress={onPress}>
        <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    content: { padding: spacing.md, paddingBottom: 80 },
    subHeader: { marginBottom: spacing.md },
    greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.text },
    subGreeting: { fontSize: fontSizes.sm, color: colors.textSecondary },
    filterToggleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    filterToggleBtnActive: { backgroundColor: colors.primary },
    filterToggleText: { marginLeft: 6, fontSize: fontSizes.sm, fontWeight: '600', color: colors.primary },
    filterToggleTextActive: { color: colors.white },
    filterCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    filterRow: { flexDirection: 'row', marginBottom: spacing.sm },
    filterItem: { flex: 1, marginRight: spacing.sm },
    clearFiltersBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: spacing.md,
    },
    clearFiltersText: { marginLeft: 6, fontSize: fontSizes.sm, color: colors.textSecondary },
    growthBanner: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        overflow: 'hidden',
    },
    growthInfo: { flex: 1 },
    growthLabel: { color: colors.white, opacity: 0.8, fontSize: fontSizes.sm, marginBottom: 4 },
    growthValue: { color: colors.white, fontSize: fontSizes.h1, fontWeight: '800' },
    growthBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 8
    },
    growthBadgeText: { color: colors.white, fontSize: 10, fontWeight: '600' },
    growthIconContainer: { position: 'absolute', right: -10, top: -10 },
    sectionTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
    kpiItem: { width: '50%', padding: spacing.xs },
    chartCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    row: { flexDirection: 'row', gap: spacing.md },
    pieLegend: { marginLeft: 20, flex: 1, justifyContent: 'center' },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    legendText: { fontSize: 10, color: colors.textSecondary },
    tableCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.sm },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray100
    },
    counselorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: colors.primary, fontWeight: 'bold' },
    counselorName: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },
    counselorRole: { fontSize: 10, color: colors.textSecondary },
    counselorStats: { alignItems: 'flex-end' },
    counselorCount: { fontSize: fontSizes.md, fontWeight: '700', color: colors.success },
    counselorLabel: { fontSize: 8, color: colors.textSecondary, textTransform: 'uppercase' },
    quickActions: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
    actionCard: { width: '23%', backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.sm, margin: '1%', alignItems: 'center' },
    actionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    actionText: { fontSize: 10, fontWeight: '600', color: colors.text, textAlign: 'center' },
});

export default DashboardScreen;

