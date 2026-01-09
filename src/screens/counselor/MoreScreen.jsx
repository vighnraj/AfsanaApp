import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { CustomHeader } from '../../components/common';

const MoreScreen = ({ navigation }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); showToast.success('Logged Out'); } },
        ]);
    };

    return (
        <View style={styles.safeArea}>
            <CustomHeader title="More" showBack={false} />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={[styles.userCard, shadows.md]}>
                    <View style={styles.avatar}><Ionicons name="person" size={28} color={colors.white} /></View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.full_name || 'Counselor'}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>
                </View>

                <TouchableOpacity style={[styles.menuItem, shadows.sm]} onPress={() => navigation.navigate('Payments')}>
                    <Ionicons name="card" size={20} color={colors.success} />
                    <Text style={styles.menuLabel}>Student Invoices</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem, shadows.sm]} onPress={() => navigation.navigate('Profile')}>
                    <Ionicons name="person" size={20} color={colors.primary} />
                    <Text style={styles.menuLabel}>My Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.logoutButton, shadows.sm]} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { padding: spacing.md, backgroundColor: colors.primary },
    headerTitle: { fontSize: fontSizes.h3, fontWeight: '700', color: colors.white },
    container: { flex: 1 },
    content: { padding: spacing.md },
    userCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    userInfo: { flex: 1, marginLeft: spacing.sm },
    userName: { fontSize: fontSizes.lg, fontWeight: '600', color: colors.text },
    userEmail: { fontSize: fontSizes.sm, color: colors.textSecondary },
    menuItem: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    menuLabel: { flex: 1, fontSize: fontSizes.md, color: colors.text, marginLeft: spacing.sm },
    logoutButton: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md, width: '100%' },
    logoutText: { fontSize: fontSizes.md, color: colors.danger, fontWeight: '600', marginLeft: spacing.sm },
});

export default MoreScreen;
