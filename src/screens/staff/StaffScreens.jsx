// Staff Screens - Enhanced with Distribution Charts
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from '../../components/common/FallbackCharts';

import { useAuth } from '../../context/AuthContext';
import { getStaffDashboard } from '../../api/dashboardApi';
import { getStaffById } from '../../api/userApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { CustomHeader, NotificationBell } from '../../components/common';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/Loading';
import { BOTTOM_TAB_SPACING } from '../../utils/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const staffData = await getStaffById(user.id);
            const staff = Array.isArray(staffData) ? staffData[0] : staffData;
            const branch = staff?.branch;
            const result = await getStaffDashboard(branch);
            setDashboardData({
                ...result,
                branch: branch || 'Main'
            });
        } catch (error) {
            console.error('Staff dashboard error:', error);
            showToast.error('Error', 'Failed to load dashboard data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const pieData = useMemo(() => {
        if (!dashboardData) return [];
        const inq = dashboardData.total_inquiries || 0;
        const leads = dashboardData.total_leads || 0;
        const total = inq + leads || 1;

        return [
            { value: inq, color: colors.primary, text: 'Inq' },
            { value: leads, color: colors.success, text: 'Leads' },
        ];
    }, [dashboardData]);

    if (loading) return <LoadingSpinner />;

    return (
        // Fixed syntax
        <View style={styles.safeArea}>
            <CustomHeader title="Staff Dashboard" showBack={false} rightAction={<NotificationBell />} />
            <ScrollView
                style={styles.container}
                contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_TAB_SPACING }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.subHeader}>
                    <View>
                        <Text style={styles.greeting}>Branch Overview,</Text>
                        <Text style={styles.userNameText}>{user?.full_name || 'Staff Member'}</Text>
                        <View style={styles.branchBadge}>
                            <Ionicons name="business" size={12} color={colors.white} />
                            <Text style={styles.branchText}> {dashboardData?.branch} Branch</Text>
                        </View>
                    </View>
                </View>

                {/* KPI Section */}
                <View style={styles.statsGrid}>
                    <Card
                        title="Total Inquiries"
                        value={dashboardData?.total_inquiries || 0}
                        icon="mail"
                        iconColor={colors.primary}
                        style={styles.kpiCard}
                    />
                    <Card
                        title="Total Leads"
                        value={dashboardData?.total_leads || 0}
                        icon="people"
                        iconColor={colors.success}
                        style={styles.kpiCard}
                    />
                </View>

                {/* Distribution Chart */}
                <Text style={styles.sectionTitle}>Performance Mix</Text>
                <View style={[styles.chartCard, shadows.sm]}>
                    <PieChart
                        data={pieData}
                        donut
                        radius={60}
                        innerRadius={45}
                        centerLabelComponent={() => (
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                                    {dashboardData?.total_inquiries + dashboardData?.total_leads}
                                </Text>
                                <Text style={{ fontSize: 8, color: colors.textSecondary }}>TOTAL</Text>
                            </View>
                        )}
                    />
                    <View style={styles.legendContainer}>
                        <LegendItem color={colors.primary} label="Inquiries" value={dashboardData?.total_inquiries} />
                        <LegendItem color={colors.success} label="Leads" value={dashboardData?.total_leads} />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Main Modules</Text>
                <View style={styles.quickActions}>
                    <ActionCard
                        icon="mail"
                        color={colors.primary}
                        label="Inquiries"
                        onPress={() => navigation.navigate('Inquiry')}
                    />
                    <ActionCard
                        icon="people"
                        color={colors.success}
                        label="Leads"
                        onPress={() => navigation.navigate('Lead')}
                    />
                    <ActionCard
                        icon="airplane"
                        color={colors.info}
                        label="Visa Process"
                        onPress={() => navigation.navigate('More', { screen: 'VisaList' })}
                    />
                    <ActionCard
                        icon="person"
                        color={colors.warning}
                        label="Profile"
                        onPress={() => navigation.navigate('More', { screen: 'Profile' })}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const LegendItem = ({ color, label, value }) => (
    <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={styles.legendLabel}>{label}</Text>
        <Text style={styles.legendValue}>{value}</Text>
    </View>
);

const ActionCard = ({ icon, color, label, onPress }) => (
    <TouchableOpacity style={[styles.actionCard, shadows.sm]} onPress={onPress}>
        <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
);

// Reuse same component structure for Inquiry/Lead screens if needed, 
// for now keeping them as descriptive placeholders as requested for parity expansion.
export const InquiryScreen = ({ navigation }) => (
    <View style={styles.safeArea}>
        <CustomHeader title="Inquiries" showBack={true} />
        <View style={styles.contentCenter}>
            <Ionicons name="mail" size={64} color={colors.primaryLight} />
            <Text style={styles.title}>Inquiry Management</Text>
            <Text style={styles.subtitle}>View and manage branch inquiries</Text>
            <TouchableOpacity style={styles.comingSoonBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.comingSoonText}>Back to Dashboard</Text>
            </TouchableOpacity>
        </View>
    </View>
);

export const LeadScreen = ({ navigation }) => (
    <View style={styles.safeArea}>
        <CustomHeader title="Leads" showBack={true} />
        <View style={styles.contentCenter}>
            <Ionicons name="people" size={64} color={colors.successLight} />
            <Text style={styles.title}>Lead Management</Text>
            <Text style={styles.subtitle}>Branch lead tracking and assignment</Text>
            <TouchableOpacity style={styles.comingSoonBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.comingSoonText}>Back to Dashboard</Text>
            </TouchableOpacity>
        </View>
    </View>
);

export const MoreScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const handleLogout = () => Alert.alert('Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
                await logout();
                showToast.success('Logged Out');
            }
        }
    ]);

    return (
        <View style={styles.safeArea}>
            <CustomHeader title="Settings" showBack={false} />
            <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: BOTTOM_TAB_SPACING }]}>
                <View style={[styles.userCard, shadows.md]}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.full_name?.charAt(0) || 'S'}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userNameTextAlt}>{user?.full_name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={[styles.menuItem, shadows.xs]} onPress={() => navigation.navigate('Profile')}>
                    <View style={[styles.menuIcon, { backgroundColor: `${colors.primary}20` }]}>
                        <Ionicons name="person" size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.menuLabel}>My Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray300} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.logoutBtn, shadows.xs]} onPress={handleLogout}>
                    <View style={[styles.menuIcon, { backgroundColor: `${colors.danger}20` }]}>
                        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                    </View>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// Polyfill for useMemo since it works better with charts
const useMemo = (factory, deps) => {
    return React.useMemo(factory, deps);
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    content: { padding: spacing.md },
    subHeader: { marginBottom: spacing.lg },
    greeting: { fontSize: fontSizes.md, color: colors.textSecondary },
    userNameText: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.text },
    branchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4
    },
    branchText: { fontSize: 10, fontWeight: 'bold', color: colors.white },
    sectionTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
    kpiCard: { width: '48%', marginBottom: spacing.sm },
    chartCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    legendContainer: { marginLeft: spacing.md },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    legendLabel: { fontSize: 12, color: colors.textSecondary, width: 70 },
    legendValue: { fontSize: 12, fontWeight: 'bold', color: colors.text },
    quickActions: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
    actionCard: { width: '48%', backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', margin: '1%' },
    actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionText: { fontSize: 12, fontWeight: '600', color: colors.text },
    contentCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    title: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.text, marginTop: spacing.md },
    subtitle: { fontSize: fontSizes.md, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
    comingSoonBtn: { marginTop: spacing.xl, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.primary, borderRadius: borderRadius.md },
    comingSoonText: { color: colors.white, fontWeight: 'bold' },
    pad: { padding: spacing.md },
    userCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
    avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 24, fontWeight: 'bold', color: colors.white },
    userInfo: { flex: 1, marginLeft: spacing.md },
    userNameTextAlt: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
    userEmail: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: 4 },
    roleBadge: { alignSelf: 'flex-start', backgroundColor: colors.primaryLight + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    roleText: { fontSize: 10, fontWeight: 'bold', color: colors.primary },
    menuItem: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
    menuLabel: { flex: 1, fontSize: fontSizes.md, color: colors.text },
    logoutBtn: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
    logoutText: { fontSize: fontSizes.md, color: colors.danger, fontWeight: '600' },
});

export default { DashboardScreen, InquiryScreen, LeadScreen, MoreScreen };
