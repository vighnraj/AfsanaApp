// Counselor Tasks Screen - Full API Integration

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { getCounselorTasks, updateTask } from '../../api/userApi';
import { deleteTask } from '../../api/taskApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { LoadingSpinner, LoadingList } from '../../components/common/Loading';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable } from '../../utils/formatting';
import { CustomHeader } from '../../components/common';
import { BOTTOM_TAB_SPACING } from '../../utils/constants';

const { width: screenWidth } = Dimensions.get('window');
const isSmallDevice = screenWidth < 375;

const TasksScreen = ({ navigation }) => {
    const { user } = useAuth();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchTasks = useCallback(async () => {
        try {
            const counselorId = user?.counselor_id || user?.id;
            if (!counselorId) {
                setLoading(false);
                return;
            }
            const data = await getCounselorTasks(counselorId);
            const tasksArray = Array.isArray(data) ? data : data.tasks || [];
            setTasks(tasksArray);
        } catch (error) {
            console.error('Fetch tasks error:', error);
            showToast.error('Error', 'Failed to load tasks');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.counselor_id, user?.id]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            const formData = new FormData();
            formData.append('status', newStatus);
            await updateTask(taskId, formData);
            showToast.success('Success', `Task marked as ${newStatus}`);
            fetchTasks();
        } catch (error) {
            console.error('Update status error:', error);
            showToast.error('Error', 'Failed to update task status');
        }
    };

    const handleDeleteTask = (taskId, taskName) => {
        Alert.alert(
            'Delete Task',
            `Are you sure you want to delete "${taskName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTask(taskId);
                            showToast.success('Success', 'Task deleted successfully');
                            fetchTasks();
                        } catch (error) {
                            console.error('Delete task error:', error);
                            showToast.error('Error', 'Failed to delete task');
                        }
                    }
                }
            ]
        );
    };

    const getFilteredTasks = () => {
        if (activeFilter === 'all') return tasks;
        return tasks.filter(task => String(task.status || '').toLowerCase() === activeFilter);
    };

    const getStatusColor = (status) => {
        const safeStatus = String(status || '').toLowerCase();
        switch (safeStatus) {
            case 'completed':
                return colors.success;
            case 'pending':
                return colors.warning;
            case 'in progress':
                return colors.info;
            case 'overdue':
                return colors.danger;
            default:
                return colors.gray400;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
            case 'urgent':
                return colors.danger;
            case 'medium':
                return colors.warning;
            case 'low':
                return colors.success;
            default:
                return colors.gray400;
        }
    };

    const renderFilterChips = () => (
        <View style={styles.filterContainer}>
            {['all', 'pending', 'in progress', 'completed'].map((filter) => (
                <TouchableOpacity
                    key={filter}
                    style={[
                        styles.filterChip,
                        activeFilter === filter && styles.filterChipActive,
                    ]}
                    onPress={() => setActiveFilter(filter)}
                >
                    <Text style={[
                        styles.filterText,
                        activeFilter === filter && styles.filterTextActive,
                    ]}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderTaskItem = ({ item }) => (
        <View style={[styles.taskCard, shadows.sm]}>
            <TouchableOpacity activeOpacity={0.7}>
                <View style={styles.taskHeader}>
                    <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
                    <View style={styles.taskInfo}>
                        <Text style={styles.taskTitle} numberOfLines={2}>
                            {item.title || item.task_name || 'Untitled Task'}
                        </Text>
                        {item.assigned_to_name && (
                            <Text style={styles.assignedTo}>
                                <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                                {' '}{item.assigned_to_name}
                            </Text>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                            {item.status || 'Pending'}
                        </Text>
                    </View>
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
                            Due: {item.due_date ? formatDateReadable(item.due_date) : 'No date'}
                        </Text>
                    </View>
                    {item.priority && (
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                                {item.priority}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: `${item.status === 'Completed' ? colors.warning : colors.success}15` }]}
                    onPress={() => handleUpdateStatus(item.id, item.status === 'Completed' ? 'Pending' : 'Completed')}
                >
                    <Ionicons
                        name={item.status === 'Completed' ? 'refresh' : 'checkmark-done'}
                        size={16}
                        color={item.status === 'Completed' ? colors.warning : colors.success}
                    />
                    <Text style={[styles.actionBtnText, { color: item.status === 'Completed' ? colors.warning : colors.success }]}>
                        {item.status === 'Completed' ? 'Reopen' : 'Complete'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: `${colors.info}15` }]}
                    onPress={() => handleUpdateStatus(item.id, 'In Progress')}
                >
                    <Ionicons name="time-outline" size={16} color={colors.info} />
                    <Text style={[styles.actionBtnText, { color: colors.info }]}>In Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: `${colors.error}15` }]}
                    onPress={() => handleDeleteTask(item.id, item.task_name || item.title)}
                >
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                    <Text style={[styles.actionBtnText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="checkbox-outline" size={80} color={colors.gray300} />
            <Text style={styles.emptyTitle}>No Tasks Found</Text>
            <Text style={styles.emptySubtext}>
                {activeFilter !== 'all'
                    ? `No ${activeFilter} tasks`
                    : 'You have no assigned tasks'
                }
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.safeArea}>
                {/* CustomHeader removed - using Stack Header */}
                <LoadingList count={5} />
            </View>
        );
    }

    const filteredTasks = getFilteredTasks();

    return (
        <View style={styles.safeArea}>
            <CustomHeader
                title="Tasks"
                subtitle={`${filteredTasks.length} tasks`}
                showBack={false}
            />

            {/* Filter Chips */}
            {renderFilterChips()}

            {/* Tasks List */}
            <FlatList
                data={filteredTasks}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderTaskItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={renderEmptyState}
                ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            />
        </View>
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
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.primary,
    },
    headerTitle: {
        fontSize: isSmallDevice ? fontSizes.xl : fontSizes.h3,
        fontWeight: '700',
        color: colors.white,
    },
    headerSubtitle: {
        fontSize: fontSizes.sm,
        color: colors.white,
        opacity: 0.8,
        marginTop: 2,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: colors.gray100,
        marginRight: spacing.sm,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
    },
    filterText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    filterTextActive: {
        color: colors.white,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: BOTTOM_TAB_SPACING,
    },
    taskCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    priorityIndicator: {
        width: 4,
        height: '100%',
        minHeight: 40,
        borderRadius: 2,
        marginRight: spacing.sm,
    },
    taskInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    taskTitle: {
        fontSize: isSmallDevice ? fontSizes.md : fontSizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    assignedTo: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: 4,
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
    taskDescription: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.sm,
        marginLeft: spacing.sm + 4,
        lineHeight: 20,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
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
    priorityBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    priorityText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyTitle: {
        fontSize: fontSizes.xl,
        fontWeight: '600',
        color: colors.text,
        marginTop: spacing.md,
    },
    emptySubtext: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        gap: spacing.sm,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        borderRadius: borderRadius.md,
        gap: 4,
    },
    actionBtnText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
    },
});

export default TasksScreen;
