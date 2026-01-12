// Master Admin Screens
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getAllAdmins } from '../../api/userApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/Loading';
import { getInitials } from '../../utils/formatting';

import { getMasterAdminDashboard } from '../../api/dashboardApi';
import { BOTTOM_TAB_SPACING, BOTTOM_TAB_HEIGHT } from '../../utils/constants';

export const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const result = await getMasterAdminDashboard();
            setData(result);
        } catch (error) {
            console.error('Master dashboard error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_TAB_SPACING }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Global Overview,</Text>
                        <Text style={styles.userName}>{user?.full_name}</Text>
                    </View>
                </View>

                <View style={[styles.kpiRow, { flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'space-between' }]}>
                    <View style={{ width: '48%', marginBottom: spacing.sm }}>
                        <Card title="Total Admins" value={data?.totalAdmins || 0} icon="people" iconColor={colors.primary} />
                    </View>
                    <View style={{ width: '48%', marginBottom: spacing.sm }}>
                        <Card title="Total Staff" value={data?.totalStaff || 0} icon="person" iconColor={colors.success} />
                    </View>
                    <View style={{ width: '48%', marginBottom: spacing.sm }}>
                        <Card title="Total Students" value={data?.totalStudents || 0} icon="school" iconColor={colors.info} />
                    </View>
                    <View style={{ width: '48%', marginBottom: spacing.sm }}>
                        <Card title="Total Leads" value={data?.totalLeads || 0} icon="flash" iconColor={colors.warning} />
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: spacing.lg, marginBottom: spacing.md, fontSize: fontSizes.lg, fontWeight: '600' }]}>Management</Text>

                <TouchableOpacity style={[styles.actionCard, shadows.md, { marginBottom: spacing.sm }]} onPress={() => navigation.navigate('Admins')}>
                    <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="people" size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.actionText}>Manage Staff Admins</Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.gray400} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionCard, shadows.md, { marginBottom: spacing.sm }]} onPress={() => navigation.navigate('Admins')}>
                    <View style={[styles.iconBox, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="business" size={24} color={colors.success} />
                    </View>
                    <Text style={styles.actionText}>Branch Reports</Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.gray400} />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export const AdminTableScreen = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAdmins = useCallback(async () => {
        try {
            const data = await getAllAdmins();
            setAdmins(Array.isArray(data) ? data : data.admins || []);
        } catch (error) { showToast.error('Error', 'Failed to load admins'); }
        finally { setLoading(false); setRefreshing(false); }
    }, []);

    useEffect(() => { fetchAdmins(); }, [fetchAdmins]);
    const onRefresh = () => { setRefreshing(true); fetchAdmins(); };

    const renderAdmin = ({ item }) => (
        <View style={[styles.adminCard, shadows.sm]}>
            <View style={styles.adminAvatar}><Text style={styles.avatarText}>{getInitials(item.full_name)}</Text></View>
            <View style={styles.adminInfo}><Text style={styles.adminName}>{item.full_name}</Text><Text style={styles.adminEmail}>{item.email}</Text></View>
        </View>
    );

    if (loading) return <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}><LoadingSpinner /></SafeAreaView>;

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <FlatList data={admins} keyExtractor={(item) => item.id?.toString()} renderItem={renderAdmin} contentContainerStyle={[styles.listContent, { paddingBottom: BOTTOM_TAB_SPACING }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<View style={styles.empty}><Ionicons name="people-outline" size={64} color={colors.gray300} /><Text style={styles.emptyText}>No admins found</Text></View>}
            />
            <TouchableOpacity style={[styles.fab, shadows.lg, { bottom: BOTTOM_TAB_HEIGHT + 20 }]}><Ionicons name="add" size={28} color={colors.white} /></TouchableOpacity>
        </SafeAreaView>
    );
};

export const MoreScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const handleLogout = () => Alert.alert('Logout', 'Are you sure you want to log out?', [{ text: 'Cancel' }, { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); showToast.success('Logged Out'); } }]);
    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: BOTTOM_TAB_SPACING }]}>
                <View style={[styles.userCard, shadows.md]}>
                    <View style={styles.userAvatar}>
                        <Ionicons name="person" size={28} color={colors.white} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.full_name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>Master Admin</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={[styles.menuItem, shadows.sm]} onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person-outline" size={20} color={colors.primary} />
                    <Text style={styles.menuLabel}>Admin Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem, shadows.sm]} onPress={() => navigation.navigate('ChatList')}>
                    <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
                    <Text style={styles.menuLabel}>Help & Support Chat</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.logoutBtn, shadows.sm]} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background }, content: { padding: spacing.md },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    greeting: { fontSize: fontSizes.md, color: colors.textSecondary }, userName: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.text },
    logoutButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.dangerBg, alignItems: 'center', justifyContent: 'center' },
    kpiRow: { marginBottom: spacing.md },
    iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
    actionCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center' },
    actionText: { flex: 1, fontSize: fontSizes.lg, fontWeight: '600', color: colors.text, marginLeft: spacing.sm },
    listContent: { padding: spacing.md },
    adminCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    adminAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${colors.primary}20`, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: fontSizes.lg, fontWeight: '600', color: colors.primary },
    adminInfo: { flex: 1, marginLeft: spacing.sm }, adminName: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text }, adminEmail: { fontSize: fontSizes.sm, color: colors.textSecondary },
    empty: { alignItems: 'center', paddingVertical: spacing.xxl }, emptyText: { fontSize: fontSizes.md, color: colors.textSecondary, marginTop: spacing.md },
    fab: { position: 'absolute', right: spacing.md, bottom: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    pad: { padding: spacing.md },
    userCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
    userAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    userInfo: { flex: 1, marginLeft: spacing.md },
    userName: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
    userEmail: { fontSize: fontSizes.sm, color: colors.textSecondary },
    roleBadge: { backgroundColor: colors.primaryLight + '20', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    roleText: { color: colors.primary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    menuItem: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    menuLabel: { flex: 1, fontSize: fontSizes.md, color: colors.text, marginLeft: spacing.sm },
    logoutBtn: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md, width: '100%' },
    logoutText: { fontSize: fontSizes.md, color: colors.danger, fontWeight: '600', marginLeft: spacing.sm },
});

export default { DashboardScreen, AdminTableScreen, MoreScreen };
