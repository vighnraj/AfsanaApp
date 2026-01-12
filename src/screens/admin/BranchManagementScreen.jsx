// Branch Management Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import CustomHeader from '../../components/common/CustomHeader';
import {
    getAllBranches,
    deleteBranch,
} from '../../api/branchApi';
import { BOTTOM_TAB_SPACING, BOTTOM_TAB_HEIGHT } from '../../utils/constants';

const BranchManagementScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [branches, setBranches] = useState([]);

    const fetchBranches = async () => {
        // Only set loading on initial fetch or full refresh
        if (branches.length === 0) setLoading(true);
        try {
            const data = await getAllBranches();
            setBranches(data);
        } catch (error) {
            console.error('Fetch branches error:', error);
            showToast.error('Error', 'Failed to fetch branches');
        } finally {
            setLoading(false);
        }
    };

    // Refetch data when screen comes into focus (e.g., returning from Add/Edit screen)
    useFocusEffect(
        useCallback(() => {
            fetchBranches();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBranches();
        setRefreshing(false);
    };

    const handleAddBranch = () => {
        navigation.navigate('AddBranch');
    };

    const handleEditBranch = (branch) => {
        navigation.navigate('AddBranch', { branch, isEdit: true });
    };

    const handleDelete = (branch) => {
        Alert.alert(
            'Delete Branch',
            `Are you sure you want to delete "${branch.branch_name}"? This action cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteBranch(branch.id);
                            showToast.success('Success', 'Branch deleted successfully');
                            fetchBranches();
                        } catch (error) {
                            console.error('Delete branch error:', error);
                            showToast.error('Error', 'Failed to delete branch');
                        }
                    },
                },
            ]
        );
    };

    const renderBranchCard = (branch, index) => (
        <View key={branch.id} style={[styles.card, shadows.sm]}>
            <View style={styles.cardHeader}>
                <View style={styles.serialContainer}>
                    <Text style={styles.serialNumber}>{index + 1}</Text>
                </View>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditBranch(branch)}
                    >
                        <Ionicons name="pencil" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(branch)}
                    >
                        <Ionicons name="trash" size={18} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="business" size={20} color={colors.primary} />
                    <Text style={styles.branchName}>{branch.branch_name}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="mail" size={16} color={colors.textSecondary} />
                    <Text style={styles.infoText}>{branch.branch_email}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="call" size={16} color={colors.textSecondary} />
                    <Text style={styles.infoText}>{branch.branch_phone}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color={colors.textSecondary} />
                    <Text style={styles.infoText} numberOfLines={2}>
                        {branch.branch_address}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <CustomHeader title="Branch Management" showBack={true} />

            {/* Content */}
            {loading && branches.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading branches...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingBottom: BOTTOM_TAB_SPACING }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                        />
                    }
                >
                    {branches.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="business-outline" size={64} color={colors.gray300} />
                            <Text style={styles.emptyText}>No branches found</Text>
                            <Text style={styles.emptySubText}>Tap the + button to add a branch</Text>
                        </View>
                    ) : (
                        branches.map((branch, index) => renderBranchCard(branch, index))
                    )}
                </ScrollView>
            )}

            {/* Add Branch FAB */}
            <TouchableOpacity
                style={[styles.fab, shadows.lg, { bottom: BOTTOM_TAB_HEIGHT + 20 }]}
                onPress={handleAddBranch}
            >
                <Ionicons name="add" size={30} color={colors.white} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    // ... existing styles ...
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.sm,
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    content: {
        flex: 1,
        padding: spacing.md,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    emptySubText: {
        marginTop: spacing.xs,
        fontSize: fontSizes.sm,
        color: colors.gray400,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    serialContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    serialNumber: {
        fontSize: fontSizes.sm,
        fontWeight: '700',
        color: colors.white,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: `${colors.primary}10`,
    },
    deleteButton: {
        backgroundColor: `${colors.error}10`,
    },
    cardBody: {
        gap: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    branchName: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    infoText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        flex: 1,
    },
    fab: {
        position: 'absolute',
        right: spacing.lg,
        bottom: 80, // Lifted for floating tabs
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
});

export default BranchManagementScreen;
