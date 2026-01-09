// Student More Screen

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
import { CustomHeader } from '../../components/common';

const MoreScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    const menuItems = [
        {
            title: 'Application',
            items: [
                { icon: 'airplane', label: 'Visa Processing', screen: 'VisaProcessing', color: colors.primary },
                { icon: 'card', label: 'Payments', screen: 'Payments', color: colors.success },
                { icon: 'checkbox', label: 'My Tasks', screen: 'Tasks', color: colors.warning },
            ],
        },
        {
            title: 'Support',
            items: [
                { icon: 'chatbubbles', label: 'Chat with Counselor', screen: 'Chat', color: colors.info },
            ],
        },
        {
            title: 'Account',
            items: [
                { icon: 'person', label: 'Edit Profile', screen: 'CommonProfile', color: colors.primary },
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
                        <Text style={styles.userName}>{user?.full_name || 'Student'}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>Student</Text>
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
        paddingBottom: spacing.xxl,
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
        backgroundColor: `${colors.success}20`,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
        marginTop: spacing.xs,
    },
    roleText: {
        fontSize: fontSizes.xs,
        color: colors.success,
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
