// Roles Management Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRoles } from '../../api/userApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { CustomHeader, LoadingSpinner } from '../../components/common';
import { showToast } from '../../components/common/Toast';

const RolesManagementScreen = ({ navigation }) => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRoles = useCallback(async () => {
        try {
            const result = await getRoles();
            setRoles(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error('Fetch roles error:', error);
            showToast.error('Error', 'Failed to load roles');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const renderRole = ({ item }) => (
        <TouchableOpacity
            style={[styles.roleCard, shadows.sm]}
            onPress={() => navigation.navigate('Permissions', { role: item.role_name, roleId: item.id })}
        >
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            </View>
            <View style={styles.roleInfo}>
                <Text style={styles.roleName}>{item.role_name.charAt(0).toUpperCase() + item.role_name.slice(1)}</Text>
                <Text style={styles.roleDesc}>Manage permissions and access levels</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
        </TouchableOpacity>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <View style={styles.safeArea}>
            {/* CustomHeader removed to avoid double header */}
            <FlatList
                data={roles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRole}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRoles(); }} />}
                ListHeaderComponent={
                    <Text style={styles.headerText}>Select a role to configure its access permissions across the system.</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    list: { padding: spacing.md },
    headerText: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.lg, paddingHorizontal: spacing.xs },
    roleCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm
    },
    iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
    roleInfo: { flex: 1 },
    roleName: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
    roleDesc: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
});

export default RolesManagementScreen;
