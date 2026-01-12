// Admin More Screen - Menu for additional features

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { BOTTOM_TAB_SPACING } from '../../utils/constants';
import CustomHeader from '../../components/common/CustomHeader';

const MoreScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        {
            title: 'Quick Actions',
            items: [
                { icon: 'today', label: "Today's Inquiries", screen: 'TodaysInquiries', color: colors.primary },
                { icon: 'notifications', label: 'Task & Reminders', screen: 'TaskReminders', color: colors.warning },
                { icon: 'chatbubbles', label: 'Messages', screen: 'ChatList', color: colors.info },
            ],
        },
        {
            title: 'User Management',
            items: [
                { icon: 'person-add', label: 'Add Counselor', screen: 'AddCounselor', color: colors.primary },
                { icon: 'people', label: 'Add Staff', screen: 'AddStaff', color: colors.success },
                { icon: 'shield-checkmark', label: 'Add Processor', screen: 'AddProcessor', color: colors.info },
                { icon: 'settings', label: 'Roles & Permissions', screen: 'RolesManagement', color: colors.secondary },
            ],
        },
        {
            title: 'Staff & University Management',
            items: [
                { icon: 'school', label: 'University Management', screen: 'UniversityManagement', color: colors.primary },
                { icon: 'people-circle', label: 'Counselor Management', screen: 'CounselorManagement', color: colors.info },
                { icon: 'briefcase', label: 'Processor Management', screen: 'ProcessorManagement', color: colors.success },
                { icon: 'person-circle', label: 'Staff Management', screen: 'StaffManagement', color: colors.warning },
            ],
        },
        {
            title: 'Operations',
            items: [
                { icon: 'checkbox', label: 'Task Management', screen: 'Tasks', color: colors.warning },
                { icon: 'airplane', label: 'Visa Process Management', screen: 'VisaProcessManagement', color: colors.info },
                { icon: 'list', label: 'Visa Processing List', screen: 'VisaList', color: colors.secondary },
                { icon: 'card', label: 'Payments & Invoices', screen: 'Payments', color: colors.secondary },
                { icon: 'document', label: 'Application Tracker', screen: 'ApplicationTracker', color: colors.primary },
                { icon: 'school', label: 'University Submissions', screen: 'UniversitySubmissions', color: colors.success },
                { icon: 'receipt', label: 'Invoice Download', screen: 'InvoiceDownload', color: colors.info },
                { icon: 'add-circle', label: 'Create Invoice', screen: 'CreateInvoice', color: colors.success },
            ],
        },
        {
            title: 'Reports & Analytics',
            items: [
                { icon: 'stats-chart', label: 'All Reports', screen: 'Reports', color: colors.primary },
                { icon: 'people-outline', label: 'Lead Reports', screen: 'LeadReports', color: colors.info },
                { icon: 'school-outline', label: 'Student Reports', screen: 'StudentReports', color: colors.success },
                { icon: 'person-outline', label: 'Counselor Reports', screen: 'CounselorReports', color: colors.warning },
                { icon: 'cash-outline', label: 'Payment Reports', screen: 'PaymentReports', color: colors.secondary },
            ],
        },
        {
            title: 'Settings',
            items: [
                { icon: 'business', label: 'Branch Management', screen: 'BranchManagement', color: colors.primary },
                { icon: 'person', label: 'My Profile', screen: 'Profile', color: colors.info },
            ],
        },
    ];

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            showToast.success('Logged Out', 'See you soon!');
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.safeArea}>
            <CustomHeader title="More" showBack={false} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* User Card */}
                <View style={[styles.userCard, shadows.md]}>
                    <View style={styles.userAvatar}>
                        <Ionicons name="person" size={28} color={colors.white} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.full_name || 'Admin User'}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>Admin</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Sections */}
                {menuItems.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={[styles.menuCard, shadows.sm]}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={itemIndex}
                                    style={[
                                        styles.menuItem,
                                        itemIndex < section.items.length - 1 && styles.menuItemBorder,
                                    ]}
                                    onPress={() => navigation.navigate(item.screen)}
                                >
                                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                                        <Ionicons name={item.icon} size={20} color={item.color} />
                                    </View>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                    <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout Button */}
                <TouchableOpacity style={[styles.logoutButton, shadows.sm]} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.version}>Version 1.0.0</Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: spacing.md,
        backgroundColor: colors.primary,
    },
    title: {
        fontSize: fontSizes.h3,
        fontWeight: '700',
        color: colors.white,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.md,
        paddingBottom: BOTTOM_TAB_SPACING,
    },
    userCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    userAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    userName: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    userEmail: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    roleBadge: {
        backgroundColor: `${colors.primary}20`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
        marginTop: spacing.xs,
    },
    roleText: {
        fontSize: fontSizes.xs,
        color: colors.primary,
        fontWeight: '600',
    },
    section: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
        textTransform: 'uppercase',
    },
    menuCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: fontSizes.md,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    logoutButton: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
        width: '100%',
    },
    logoutText: {
        fontSize: fontSizes.md,
        color: colors.danger,
        fontWeight: '600',
        marginLeft: spacing.sm,
    },
    version: {
        fontSize: fontSizes.sm,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.lg,
    },
});

export default MoreScreen;
