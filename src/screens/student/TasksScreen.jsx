// Student Tasks Screen

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

import { getStudentTasks } from '../../api/studentApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable } from '../../utils/formatting';

const TasksScreen = ({ navigation }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTasks = useCallback(async () => {
        try {
            const studentId = await SecureStore.getItemAsync('student_id');
            if (studentId) {
                const data = await getStudentTasks(studentId);
                setTasks(Array.isArray(data) ? data : data.tasks || []);
            }
        } catch (error) {
            console.error('Fetch tasks error:', error);
            showToast.error('Error', 'Failed to load tasks');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const getStatusColor = (status) => {
        const safeStatus = String(status || '').toLowerCase();
        switch (safeStatus) {
            case 'completed':
                return colors.success;
            case 'pending':
                return colors.warning;
            case 'overdue':
                return colors.danger;
            default:
                return colors.gray400;
        }
    };

    const renderTaskItem = ({ item }) => (
        <TouchableOpacity style={[styles.taskCard, shadows.sm]}>
            <View style={styles.taskHeader}>
                <View style={[styles.priorityDot, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={styles.taskTitle} numberOfLines={2}>{item.title || item.task_name}</Text>
            </View>

            {item.description && (
                <Text style={styles.taskDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            )}

            <View style={styles.taskFooter}>
                <View style={styles.taskMeta}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>
                        {item.due_date ? formatDateReadable(item.due_date) : 'No due date'}
                    </Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status || 'Pending'}
                    </Text>
                </View>
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
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderTaskItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkbox-outline" size={64} color={colors.gray300} />
                        <Text style={styles.emptyText}>No tasks assigned</Text>
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
    listContent: {
        padding: spacing.md,
    },
    taskCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        marginRight: spacing.sm,
    },
    taskTitle: {
        flex: 1,
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
    },
    taskDescription: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginLeft: spacing.md + 8,
        marginBottom: spacing.sm,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
});

export default TasksScreen;
