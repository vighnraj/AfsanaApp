// Counselor Dashboard Screen - Enhanced with Charts & Parity
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
import { BarChart, PieChart } from '../../components/common/FallbackCharts';

import { useAuth } from '../../context/AuthContext';
import { getCounselorDashboard } from '../../api/dashboardApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { CustomHeader, NotificationBell } from '../../components/common';

const SCREEN_WIDTH = Dimensions.get('window').width;

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            const counselorId = user?.counselor_id || user?.id;
            const data = await getCounselorDashboard(counselorId);
            setDashboardData(data);
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            showToast.error('Error', 'Failed to load dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    // Chart Data Mappings
    const funnelChartData = useMemo(() => {
        const kpi = dashboardData?.kpi || {};
        return [
            { value: kpi.inquiries || 0, label: 'Inq', frontColor: colors.primary },
            { value: kpi.totalLeads || 0, label: 'Lead', frontColor: colors.secondary },
            { value: kpi.totalStudents || 0, label: 'Std', frontColor: colors.success },
            { value: kpi.applications || 0, label: 'App', frontColor: colors.info },
        ];
    }, [dashboardData]);

    const efficiencyData = useMemo(() => {
        const kpi = dashboardData?.kpi || {};
        const followups = kpi.totalFollowups || 0;
        const due = kpi.totalFollowupsDue || 1; // avoid div by zero
        const efficiency = Math.min(((followups / due) * 100), 100);

        return [
            { value: efficiency, color: colors.success, text: 'Done' },
            { value: 100 - efficiency, color: colors.gray200, text: 'Pending' },
        ];
    }, [dashboardData]);

    const kpiData = [
        { title: 'My Leads', value: dashboardData?.kpi?.totalLeads || 0, icon: 'people', iconColor: colors.primary },
        { title: 'My Students', value: dashboardData?.kpi?.totalStudents || 0, icon: 'school', iconColor: colors.success },
        { title: 'Tasks', value: dashboardData?.kpi?.totalTasks || 0, icon: 'checkbox', iconColor: colors.warning },
        { title: 'Follow-ups', value: dashboardData?.kpi?.totalFollowups || 0, icon: 'repeat', iconColor: colors.info },
    ];

    if (loading) {
        return (
            <View style={styles.safeArea}>
                <CustomHeader title="Counselor Dashboard" showBack={false} rightAction={<NotificationBell />} />
                <LoadingSpinner />
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <CustomHeader title="Dashboard" showBack={false} rightAction={<NotificationBell />} />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Greeting */}
                <View style={styles.subHeader}>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.full_name || 'Counselor'}</Text>
                </View>

                {/* Efficiency Badge */}
                <View style={[styles.efficiencyCard, shadows.md]}>
                    <PieChart
                        data={efficiencyData}
                        donut
                        radius={45}
                        innerRadius={35}
                        centerLabelComponent={() => (
                            <Text style={styles.efficiencyValue}>
                                {Math.round(efficiencyData[0].value)}%
                            </Text>
                        )}
                    />
                    <View style={styles.efficiencyInfo}>
                        <Text style={styles.efficiencyLabel}>Follow-up Efficiency</Text>
                        <Text style={styles.efficiencySub}>Keep up the good work!</Text>
                    </View>
                </View>

                {/* KPI Grid */}
                <View style={styles.kpiGrid}>
                    {kpiData.map((item, index) => (
                        <View key={index} style={styles.kpiItem}>
                            <Card {...item} />
                        </View>
                    ))}
                </View>

                {/* Performance Chart */}
                <Text style={styles.sectionTitle}>Conversion Funnel</Text>
                <View style={[styles.chartCard, shadows.sm]}>
                    <BarChart
                        data={funnelChartData}
                        barWidth={35}
                        spacing={25}
                        hideRules
                        yAxisThickness={0}
                        xAxisThickness={0}
                        yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
                        roundedTop
                    />
                </View>

                {/* Recent Leads */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Recent Leads</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Leads')}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>
                {dashboardData?.recentLeads?.slice(0, 3).map((lead, idx) => (
                    <TouchableOpacity
                        key={idx}
                        style={[styles.leadCard, shadows.sm]}
                        onPress={() => navigation.navigate('Leads', { screen: 'LeadDetail', params: { leadId: lead.id } })}
                    >
                        <View style={styles.leadAvatar}>
                            <Text style={styles.avatarText}>{lead.name?.charAt(0)}</Text>
                        </View>
                        <View style={styles.leadContent}>
                            <Text style={styles.leadName}>{lead.name}</Text>
                            <Text style={styles.leadDetails}>{lead.country} • {lead.status}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.gray300} />
                    </TouchableOpacity>
                ))}

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Access</Text>
                <View style={styles.quickActions}>
                    <ActionItem icon="people" color={colors.primary} label="Leads" onPress={() => navigation.navigate('Leads')} />
                    <ActionItem icon="school" color={colors.success} label="Students" onPress={() => navigation.navigate('Students')} />
                    <ActionItem icon="checkbox" color={colors.warning} label="Tasks" onPress={() => navigation.navigate('Tasks')} />
                    <ActionItem icon="chatbubbles" color={colors.info} label="Chat" onPress={() => navigation.navigate('More', { screen: 'Chat' })} />
                </View>
            </ScrollView>
        </View>
    );
};

const ActionItem = ({ icon, color, label, onPress }) => (
    <TouchableOpacity style={[styles.actionBtn, shadows.sm]} onPress={onPress}>
        <View style={[styles.actionIconBox, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1 },
    content: { padding: spacing.md, paddingBottom: 80 },
    subHeader: { marginBottom: spacing.lg },
    greeting: { fontSize: fontSizes.md, color: colors.textSecondary },
    userName: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.text },
    efficiencyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    efficiencyInfo: { marginLeft: spacing.md },
    efficiencyLabel: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
    efficiencySub: { fontSize: fontSizes.xs, color: colors.textSecondary },
    efficiencyValue: { fontSize: 16, fontWeight: '800', color: colors.success },
    sectionTitle: { fontSize: fontSizes.lg, fontWeight: '600', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    seeAllText: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: '600' },
    kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
    kpiItem: { width: '50%', padding: spacing.xs },
    chartCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
        marginBottom: spacing.sm
    },
    leadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        marginBottom: spacing.xs,
    },
    leadAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.secondary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    avatarText: { color: colors.secondary, fontWeight: 'bold' },
    leadContent: { flex: 1 },
    leadName: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },
    leadDetails: { fontSize: 11, color: colors.textSecondary },
    quickActions: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs, marginTop: spacing.xs },
    actionBtn: { width: '23%', backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.sm, margin: '1%', alignItems: 'center' },
    actionIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    actionLabel: { fontSize: 10, fontWeight: '600', color: colors.text },
});

export default DashboardScreen;

