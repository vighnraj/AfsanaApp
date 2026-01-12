// My Applications Screen

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import { getStudentApplications } from '../../api/studentApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable } from '../../utils/formatting';
import { BOTTOM_TAB_SPACING } from '../../utils/constants';
import { CustomHeader } from '../../components/common';
import { useScrollToHideTabs } from '../../hooks/useScrollToHideTabs';

const MyApplicationsScreen = ({ navigation }) => {
    const { onScroll } = useScrollToHideTabs(navigation);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchApplications = useCallback(async () => {
        try {
            const studentId = await SecureStore.getItemAsync('student_id');
            if (studentId) {
                const data = await getStudentApplications(studentId);
                setApplications(Array.isArray(data) ? data : data.applications || []);
            }
        } catch (error) {
            console.error('Fetch applications error:', error);
            showToast.error('Error', 'Failed to load applications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchApplications();
    };

    const getStatusColor = (status) => {
        const safeStatus = String(status || '').toLowerCase();
        switch (safeStatus) {
            case 'accepted':
            case 'approved':
                return colors.success;
            case 'pending':
            case 'in review':
                return colors.warning;
            case 'rejected':
                return colors.danger;
            default:
                return colors.info;
        }
    };

    const renderApplicationItem = ({ item }) => (
        <TouchableOpacity style={[styles.applicationCard, shadows.sm]}>
            <View style={styles.cardHeader}>
                <View style={styles.universityInfo}>
                    <View style={[styles.universityIcon, { backgroundColor: `${colors.primary}20` }]}>
                        <Ionicons name="school" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.universityText}>
                        <Text style={styles.universityName} numberOfLines={1}>
                            {item.university_name || 'University'}
                        </Text>
                        <Text style={styles.programName} numberOfLines={1}>
                            {item.program_name || 'Program'}
                        </Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status || 'Pending'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.detailText}>Applied: {formatDateReadable(item.created_at)}</Text>
                </View>
                {item.intake && (
                    <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.detailText}>Intake: {item.intake}</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.viewDetailsButton}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <LoadingSpinner />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <CustomHeader title="Applications" showBack={false} useSafeArea={false} />
            <FlatList
                data={applications}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderApplicationItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No applications yet</Text>
                        <Text style={styles.emptySubtext}>Start by applying to universities</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.primary,
    },
    title: {
        fontSize: fontSizes.h3,
        fontWeight: '700',
        color: colors.white,
    },
    subtitle: {
        fontSize: fontSizes.md,
        color: colors.white,
        opacity: 0.8,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: BOTTOM_TAB_SPACING,
    },
    applicationCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    universityInfo: {
        flexDirection: 'row',
        flex: 1,
    },
    universityIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    universityText: {
        flex: 1,
        marginLeft: spacing.sm,
    },
    universityName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    programName: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
    },
    cardDetails: {
        marginBottom: spacing.sm,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    detailText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        paddingTop: spacing.sm,
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewDetailsText: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: fontSizes.md,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
});

export default MyApplicationsScreen;
