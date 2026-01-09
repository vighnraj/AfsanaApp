// Processor Screens - Enhanced with Pipeline Charts
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { getProcessorDashboard } from '../../api/dashboardApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { CustomHeader } from '../../components/common';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/Loading';

// Import target screens directly for named exports
import VisaListScreen from '../admin/VisaListScreen';
import StudentListScreen from '../admin/StudentListScreen';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const result = await getProcessorDashboard(user.id);
            setDashboardData(result);
        } catch (error) {
            console.error('Processor dashboard error:', error);
            showToast.error('Error', 'Failed to load dashboard');
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

    const visaPieData = useMemo(() => {
        if (!dashboardData) return [];
        const pending = dashboardData.pendingVisa || 0;
        const completed = dashboardData.completedVisa || 0;

        return [
            { value: pending, color: colors.warning, text: 'Pend' },
            { value: completed, color: colors.success, text: 'Comp' },
        ];
    }, [dashboardData]);

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <CustomHeader title="Workplace" showBack={false} />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.pad}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.userBanner}>
                    <View>
                        <Text style={styles.greeting}>Work Overview,</Text>
                        <Text style={styles.userName}>{user?.full_name}</Text>
                        <View style={styles.roleTag}>
                            <Text style={styles.roleTagText}>PROCESSOR</Text>
                        </View>
                    </View>
                </View>

                {/* KPI Cards */}
                <View style={styles.statsGrid}>
                    <Card
                        title="Assigned Students"
                        value={dashboardData?.totalStudents || 0}
                        icon="people"
                        iconColor={colors.primary}
                        style={styles.card}
                    />
                    <Card
                        title="Completed Visas"
                        value={dashboardData?.completedVisa || 0}
                        icon="checkmark-circle"
                        iconColor={colors.success}
                        style={styles.card}
                    />
                </View>

                {/* Pipeline Chart */}
                <Text style={styles.sectionTitle}>Visa Pipeline</Text>
                <View style={[styles.chartCard, shadows.sm]}>
                    <PieChart
                        data={visaPieData}
                        donut
                        radius={60}
                        innerRadius={45}
                        centerLabelComponent={() => (
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                                    {(dashboardData?.pendingVisa || 0) + (dashboardData?.completedVisa || 0)}
                                </Text>
                                <Text style={{ fontSize: 8, color: colors.textSecondary }}>VISAS</Text>
                            </View>
                        )}
                    />
                    <View style={styles.legendContainer}>
                        <View style={styles.legendEntry}>
                            <View style={[styles.dot, { backgroundColor: colors.warning }]} />
                            <Text style={styles.legendLabel}>Pending: {dashboardData?.pendingVisa || 0}</Text>
                        </View>
                        <View style={styles.legendEntry}>
                            <View style={[styles.dot, { backgroundColor: colors.success }]} />
                            <Text style={styles.legendLabel}>Completed: {dashboardData?.completedVisa || 0}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Pipeline Actions</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity style={[styles.actionCard, shadows.sm]} onPress={() => navigation.navigate('Students')}>
                        <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}20` }]}>
                            <Ionicons name="people" size={24} color={colors.primary} />
                        </View>
                        <Text style={styles.actionText}>Assigned Students</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionCard, shadows.sm]} onPress={() => navigation.navigate('VisaProcessing')}>
                        <View style={[styles.actionIcon, { backgroundColor: `${colors.info}20` }]}>
                            <Ionicons name="airplane" size={24} color={colors.info} />
                        </View>
                        <Text style={styles.actionText}>Visa Processing</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export const StudentDetailsScreen = (props) => <StudentListScreen {...props} />;
export const VisaProcessingScreen = (props) => <VisaListScreen {...props} />;

export const MoreScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const handleLogout = () => Alert.alert('Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel' },
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
        <View style={styles.container}>
            <CustomHeader title="Settings" showBack={false} />
            <ScrollView contentContainerStyle={styles.pad}>
                <View style={[styles.userCard, shadows.md]}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.full_name?.charAt(0)}</Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userNameAlt}>{user?.full_name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>Processor</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={[styles.menuItem, shadows.sm]} onPress={() => navigation.navigate('Profile')}>
                    <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight + '20' }]}>
                        <Ionicons name="person-outline" size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.menuLabel}>My Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray300} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem, shadows.sm]} onPress={() => navigation.navigate('ChatList')}>
                    <View style={[styles.menuIcon, { backgroundColor: colors.infoLight + '20' }]}>
                        <Ionicons name="chatbubbles-outline" size={20} color={colors.info} />
                    </View>
                    <Text style={styles.menuLabel}>Support Chat</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray300} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.logoutBtn, shadows.sm]} onPress={handleLogout}>
                    <View style={[styles.menuIcon, { backgroundColor: colors.dangerLight + '20' }]}>
                        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                    </View>
                    <Text style={styles.logoutTextAlt}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    pad: { padding: spacing.md },
    userBanner: { marginBottom: spacing.lg },
    greeting: { fontSize: fontSizes.md, color: colors.textSecondary },
    userName: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.text },
    roleTag: { backgroundColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    roleTagText: { color: colors.white, fontSize: 10, fontWeight: 'bold' },
    sectionTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
    card: { width: '48%', marginBottom: spacing.sm },
    chartCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    legendContainer: { marginLeft: spacing.md },
    legendEntry: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    legendLabel: { fontSize: 12, color: colors.textSecondary },
    quickActions: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.xs },
    actionCard: { width: '48%', backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center', margin: '1%' },
    actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionText: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center' },
    userCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
    avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 24, fontWeight: 'bold', color: colors.white },
    userInfo: { flex: 1, marginLeft: spacing.md },
    userNameAlt: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
    userEmail: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: 4 },
    roleBadge: { backgroundColor: colors.primaryLight + '20', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    roleText: { color: colors.primary, fontSize: 10, fontWeight: 'bold' },
    menuItem: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
    menuLabel: { flex: 1, fontSize: fontSizes.md, color: colors.text },
    logoutBtn: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
    logoutTextAlt: { fontSize: fontSizes.md, color: colors.danger, fontWeight: '600' },
});

export default { DashboardScreen, StudentDetailsScreen, VisaProcessingScreen, MoreScreen };
