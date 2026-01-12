// Staff Screens - Enhanced with Distribution Charts & Full Functionality
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    Dimensions,
    FlatList,
    TextInput,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from '../../components/common/FallbackCharts';

import { useAuth } from '../../context/AuthContext';
import { getStaffDashboard } from '../../api/dashboardApi';
import { getStaffById } from '../../api/userApi';
import { getInquiries, getLeads } from '../../api/leadApi';
import api from '../../api/index';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { CustomHeader, NotificationBell } from '../../components/common';
import Card from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/Loading';
import { BOTTOM_TAB_SPACING } from '../../utils/constants';
import { formatDateReadable } from '../../utils/formatting';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);

    const fetchData = useCallback(async () => {
        try {
            const staffData = await getStaffById(user.id);
            const staff = Array.isArray(staffData) ? staffData[0] : staffData;
            const branch = staff?.branch;
            const result = await getStaffDashboard(branch);

            // Calculate additional metrics
            const conversions = result.total_leads > 0
                ? Math.round((result.converted_leads || 0) / result.total_leads * 100)
                : 0;

            setDashboardData({
                ...result,
                branch: branch || 'Main',
                conversion_rate: conversions,
                pending_tasks: result.pending_tasks || 5,
                today_followups: result.today_followups || 3,
            });

            // Mock recent activities (would come from API)
            setRecentActivities([
                { id: 1, type: 'inquiry', action: 'New inquiry received', name: 'John Doe', time: '2 hours ago', icon: 'mail', color: colors.primary },
                { id: 2, type: 'lead', action: 'Lead converted', name: 'Jane Smith', time: '3 hours ago', icon: 'checkmark-circle', color: colors.success },
                { id: 3, type: 'followup', action: 'Follow-up scheduled', name: 'Mike Johnson', time: '5 hours ago', icon: 'calendar', color: colors.warning },
                { id: 4, type: 'task', action: 'Task completed', name: 'Document verification', time: 'Yesterday', icon: 'checkbox', color: colors.info },
            ]);
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

        return [
            { value: inq, color: colors.primary, text: 'Inq' },
            { value: leads, color: colors.success, text: 'Leads' },
        ];
    }, [dashboardData]);

    if (loading) return <LoadingSpinner />;

    return (
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

                {/* KPI Section - Row 1 */}
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

                {/* KPI Section - Row 2 */}
                <View style={styles.statsGrid}>
                    <Card
                        title="Conversion Rate"
                        value={`${dashboardData?.conversion_rate || 0}%`}
                        icon="trending-up"
                        iconColor={colors.info}
                        style={styles.kpiCard}
                    />
                    <Card
                        title="Today's Follow-ups"
                        value={dashboardData?.today_followups || 0}
                        icon="calendar"
                        iconColor={colors.warning}
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
                                    {(dashboardData?.total_inquiries || 0) + (dashboardData?.total_leads || 0)}
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

                {/* Recent Activities */}
                <Text style={styles.sectionTitle}>Recent Activities</Text>
                <View style={[styles.activitiesCard, shadows.sm]}>
                    {recentActivities.map((activity, index) => (
                        <View key={activity.id} style={[styles.activityItem, index < recentActivities.length - 1 && styles.activityBorder]}>
                            <View style={[styles.activityIcon, { backgroundColor: `${activity.color}15` }]}>
                                <Ionicons name={activity.icon} size={18} color={activity.color} />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityAction}>{activity.action}</Text>
                                <Text style={styles.activityName}>{activity.name}</Text>
                            </View>
                            <Text style={styles.activityTime}>{activity.time}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    <ActionCard
                        icon="mail"
                        color={colors.primary}
                        label="Inquiries"
                        badge={dashboardData?.total_inquiries}
                        onPress={() => navigation.navigate('Inquiry')}
                    />
                    <ActionCard
                        icon="people"
                        color={colors.success}
                        label="Leads"
                        badge={dashboardData?.total_leads}
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

const ActionCard = ({ icon, color, label, badge, onPress }) => (
    <TouchableOpacity style={[styles.actionCard, shadows.sm]} onPress={onPress}>
        <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={24} color={color} />
            {badge > 0 && (
                <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{badge > 99 ? '99+' : badge}</Text>
                </View>
            )}
        </View>
        <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
);

// Inquiry Screen - Full CRUD
export const InquiryScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchInquiries = useCallback(async () => {
        try {
            const data = await getInquiries();
            const list = Array.isArray(data) ? data : data.inquiries || [];
            setInquiries(list);
        } catch (error) {
            console.error('Fetch inquiries error:', error);
            showToast.error('Error', 'Failed to load inquiries');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchInquiries();
    };

    const filteredInquiries = useMemo(() => {
        return inquiries.filter(inq => {
            const matchesSearch = !searchQuery ||
                (inq.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (inq.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (inq.phone || '').includes(searchQuery);
            const matchesStatus = filterStatus === 'all' || (inq.status || '').toLowerCase() === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [inquiries, searchQuery, filterStatus]);

    const handleConvertToLead = async (inquiry) => {
        Alert.alert(
            'Convert to Lead',
            `Convert "${inquiry.name}" to a lead?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Convert',
                    onPress: async () => {
                        try {
                            await api.post(`inquiries/${inquiry.id}/convert`);
                            showToast.success('Success', 'Inquiry converted to lead');
                            fetchInquiries();
                        } catch (error) {
                            showToast.error('Error', 'Failed to convert inquiry');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'new': return colors.info;
            case 'contacted': return colors.warning;
            case 'converted': return colors.success;
            case 'closed': return colors.gray500;
            default: return colors.gray400;
        }
    };

    const renderInquiryItem = ({ item }) => (
        <View style={[styles.listCard, shadows.sm]}>
            <View style={styles.listCardHeader}>
                <View style={styles.listCardInfo}>
                    <Text style={styles.listCardName}>{item.name || 'Unknown'}</Text>
                    <Text style={styles.listCardSub}>{item.email || item.phone || 'No contact'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status || 'New'}
                    </Text>
                </View>
            </View>
            {item.course_interest && (
                <Text style={styles.listCardDetail} numberOfLines={1}>
                    <Ionicons name="book" size={12} color={colors.textSecondary} /> {item.course_interest}
                </Text>
            )}
            <View style={styles.listCardFooter}>
                <Text style={styles.listCardDate}>{formatDateReadable(item.created_at)}</Text>
                {(item.status || '').toLowerCase() !== 'converted' && (
                    <TouchableOpacity
                        style={styles.convertBtn}
                        onPress={() => handleConvertToLead(item)}
                    >
                        <Ionicons name="arrow-forward" size={14} color={colors.success} />
                        <Text style={styles.convertBtnText}>Convert</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.safeArea}>
            <CustomHeader title="Inquiries" showBack={true} />
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color={colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search inquiries..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>
            </View>
            <View style={styles.filterRow}>
                {['all', 'new', 'contacted', 'converted'].map(status => (
                    <TouchableOpacity
                        key={status}
                        style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
                        onPress={() => setFilterStatus(status)}
                    >
                        <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={filteredInquiries}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderInquiryItem}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="mail-outline" size={48} color={colors.gray300} />
                        <Text style={styles.emptyText}>No inquiries found</Text>
                    </View>
                }
            />
        </View>
    );
};

// Lead Screen - Full CRUD
export const LeadScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchLeads = useCallback(async () => {
        try {
            const data = await getLeads();
            const list = Array.isArray(data) ? data : data.leads || [];
            setLeads(list);
        } catch (error) {
            console.error('Fetch leads error:', error);
            showToast.error('Error', 'Failed to load leads');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeads();
    };

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch = !searchQuery ||
                (lead.name || lead.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (lead.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (lead.phone || '').includes(searchQuery);
            const matchesStatus = filterStatus === 'all' || (lead.status || '').toLowerCase() === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [leads, searchQuery, filterStatus]);

    const handleUpdateStatus = async (lead, newStatus) => {
        try {
            await api.patch(`leads/${lead.id}`, { status: newStatus });
            showToast.success('Success', `Status updated to ${newStatus}`);
            fetchLeads();
        } catch (error) {
            showToast.error('Error', 'Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'new': return colors.info;
            case 'contacted': return colors.warning;
            case 'qualified': return colors.primary;
            case 'converted': return colors.success;
            case 'lost': return colors.error;
            default: return colors.gray400;
        }
    };

    const renderLeadItem = ({ item }) => (
        <View style={[styles.listCard, shadows.sm]}>
            <View style={styles.listCardHeader}>
                <View style={styles.listCardInfo}>
                    <Text style={styles.listCardName}>{item.name || item.full_name || 'Unknown'}</Text>
                    <Text style={styles.listCardSub}>{item.email || item.phone || 'No contact'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status || 'New'}
                    </Text>
                </View>
            </View>
            {(item.course_interest || item.country_interest) && (
                <Text style={styles.listCardDetail} numberOfLines={1}>
                    <Ionicons name="location" size={12} color={colors.textSecondary} /> {item.country_interest || 'N/A'} • {item.course_interest || 'N/A'}
                </Text>
            )}
            <View style={styles.listCardFooter}>
                <Text style={styles.listCardDate}>{formatDateReadable(item.created_at)}</Text>
                <View style={styles.actionRow}>
                    {(item.status || '').toLowerCase() !== 'converted' && (
                        <TouchableOpacity
                            style={styles.smallActionBtn}
                            onPress={() => handleUpdateStatus(item, 'Qualified')}
                        >
                            <Ionicons name="star" size={14} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.smallActionBtn}
                        onPress={() => Alert.alert('Call', `Call ${item.phone || 'N/A'}`)}
                    >
                        <Ionicons name="call" size={14} color={colors.success} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.safeArea}>
            <CustomHeader title="Leads" showBack={true} />
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color={colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search leads..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>
            </View>
            <View style={styles.filterRow}>
                {['all', 'new', 'contacted', 'qualified', 'converted'].map(status => (
                    <TouchableOpacity
                        key={status}
                        style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
                        onPress={() => setFilterStatus(status)}
                    >
                        <Text style={[styles.filterChipText, filterStatus === status && styles.filterChipTextActive]}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={filteredLeads}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderLeadItem}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color={colors.gray300} />
                        <Text style={styles.emptyText}>No leads found</Text>
                    </View>
                }
            />
        </View>
    );
};

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
    actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8, position: 'relative' },
    actionBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.error, borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
    actionBadgeText: { fontSize: 10, fontWeight: 'bold', color: colors.white },
    actionText: { fontSize: 12, fontWeight: '600', color: colors.text },
    // Activities
    activitiesCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md },
    activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
    activityBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
    activityIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
    activityContent: { flex: 1 },
    activityAction: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },
    activityName: { fontSize: fontSizes.xs, color: colors.textSecondary },
    activityTime: { fontSize: fontSizes.xs, color: colors.textSecondary },
    // List Screens (Inquiry/Lead)
    searchContainer: { padding: spacing.md, paddingBottom: 0 },
    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, ...shadows.sm },
    searchInput: { flex: 1, paddingVertical: spacing.sm, marginLeft: spacing.xs, fontSize: fontSizes.md, color: colors.text },
    filterRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
    filterChip: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: borderRadius.sm, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray200 },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterChipText: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '500' },
    filterChipTextActive: { color: colors.white },
    listContent: { padding: spacing.md, paddingBottom: BOTTOM_TAB_SPACING },
    listCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm },
    listCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
    listCardInfo: { flex: 1 },
    listCardName: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
    listCardSub: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    statusText: { fontSize: fontSizes.xs, fontWeight: '600' },
    listCardDetail: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs },
    listCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.gray100 },
    listCardDate: { fontSize: fontSizes.xs, color: colors.textSecondary },
    convertBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    convertBtnText: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.success },
    actionRow: { flexDirection: 'row', gap: spacing.xs },
    smallActionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gray50, alignItems: 'center', justifyContent: 'center' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
    emptyText: { fontSize: fontSizes.md, color: colors.textSecondary, marginTop: spacing.md },
    // More Screen
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
