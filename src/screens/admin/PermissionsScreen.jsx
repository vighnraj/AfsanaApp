// Permissions Screen
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRolePermissions, updateRolePermissions } from '../../api/userApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { CustomHeader, Button } from '../../components/common';
import { showToast } from '../../components/common/Toast';

const PermissionsScreen = ({ route, navigation }) => {
    const { role, roleId } = route.params;
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchPermissions = useCallback(async () => {
        try {
            const result = await getRolePermissions(role);
            setPermissions(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error('Fetch permissions error:', error);
            showToast.error('Error', 'Failed to load permissions');
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

    const togglePermission = (index, type) => {
        const newPermissions = [...permissions];
        newPermissions[index][type] = newPermissions[index][type] === 1 ? 0 : 1;
        setPermissions(newPermissions);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateRolePermissions(roleId, { permissions });
            showToast.success('Success', 'Permissions updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Update permissions error:', error);
            showToast.error('Error', 'Failed to update permissions');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <View style={{ flex: 1 }}><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} /></View>;

    return (
        <View style={styles.safeArea}>
            {/* CustomHeader removed - using Stack Header */}
            <ScrollView contentContainerStyle={styles.content}>
                {permissions.map((item, index) => (
                    <View key={index} style={[styles.moduleCard, shadows.sm]}>
                        <Text style={styles.moduleName}>{item.module_name}</Text>
                        <View style={styles.grid}>
                            {['view_permission', 'create_permission', 'edit_permission', 'delete_permission'].map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={styles.checkRow}
                                    onPress={() => togglePermission(index, type)}
                                >
                                    <Ionicons
                                        name={item[type] === 1 ? "checkbox" : "square-outline"}
                                        size={22}
                                        color={item[type] === 1 ? colors.primary : colors.gray400}
                                    />
                                    <Text style={styles.checkLabel}>{type.split('_')[0].charAt(0).toUpperCase() + type.split('_')[0].slice(1)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <Button
                    title="Save Permissions"
                    onPress={handleSave}
                    loading={saving}
                    style={styles.saveBtn}
                    fullWidth
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md },
    moduleCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md },
    moduleName: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    checkRow: { flexDirection: 'row', alignItems: 'center', width: '50%', paddingVertical: spacing.xs },
    checkLabel: { fontSize: fontSizes.sm, color: colors.text, marginLeft: spacing.xs },
    saveBtn: { marginTop: spacing.lg, marginBottom: spacing.xl },
});

export default PermissionsScreen;
