// Tasks Screen - Admin with Full CRUD

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Modal,
    TextInput,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { getAllTasks, createTask, updateTask, deleteTask } from '../../api/taskApi';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import { formatDateReadable } from '../../utils/formatting';
import FilterDropdown from '../../components/common/FilterDropdown';
import { BOTTOM_TAB_SPACING, BOTTOM_TAB_HEIGHT } from '../../utils/constants';

const TASK_STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed', 'Overdue'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

const TasksScreen = ({ navigation }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        task_name: '',
        description: '',
        due_date: '',
        status: 'Pending',
        priority: 'Medium',
        assigned_to: '',
    });

    const fetchTasks = useCallback(async () => {
        try {
            const data = await getAllTasks();
            setTasks(Array.isArray(data) ? data : data.tasks || []);
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

    const handleCreateTask = () => {
        setEditingTask(null);
        setFormData({
            task_name: '',
            description: '',
            due_date: '',
            status: 'Pending',
            priority: 'Medium',
            assigned_to: '',
        });
        setModalVisible(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setFormData({
            task_name: task.task_name || task.title || '',
            description: task.description || '',
            due_date: task.due_date || '',
            status: task.status || 'Pending',
            priority: task.priority || 'Medium',
            assigned_to: task.assigned_to || '',
        });
        setModalVisible(true);
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

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            const formData = new FormData();
            formData.append('status', newStatus);
            await updateTask(taskId, formData);
            showToast.success('Success', 'Status updated');
            fetchTasks();
        } catch (error) {
            console.error('Update status error:', error);
            showToast.error('Error', 'Failed to update status');
        }
    };

    const handleSubmit = async () => {
        if (!formData.task_name) {
            showToast.error('Error', 'Task name is required');
            return;
        }

        setSaving(true);
        try {
            if (editingTask) {
                const updateFormData = new FormData();
                Object.keys(formData).forEach(key => {
                    if (formData[key]) {
                        updateFormData.append(key, formData[key]);
                    }
                });
                await updateTask(editingTask.id, updateFormData);
                showToast.success('Success', 'Task updated successfully');
            } else {
                await createTask(formData);
                showToast.success('Success', 'Task created successfully');
            }
            setModalVisible(false);
            fetchTasks();
        } catch (error) {
            console.error('Submit task error:', error);
            showToast.error('Error', `Failed to ${editingTask ? 'update' : 'create'} task`);
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status) => {
        const safeStatus = String(status || '').toLowerCase();
        switch (safeStatus) {
            case 'completed':
                return colors.success;
            case 'in progress':
                return colors.info;
            case 'pending':
                return colors.warning;
            case 'overdue':
                return colors.error;
            default:
                return colors.gray400;
        }
    };

    const renderTaskItem = ({ item }) => (
        <View style={[styles.taskCard, shadows.sm]}>
            <TouchableOpacity onPress={() => handleEditTask(item)}>
                <View style={styles.taskHeader}>
                    <View style={[styles.priorityDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={styles.taskTitle} numberOfLines={2}>
                        {item.title || item.task_name}
                    </Text>
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

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: `${colors.info}15` }]}
                    onPress={() => handleUpdateStatus(item.id, item.status === 'Completed' ? 'Pending' : 'Completed')}
                >
                    <Ionicons
                        name={item.status === 'Completed' ? 'refresh' : 'checkmark-done'}
                        size={16}
                        color={colors.info}
                    />
                    <Text style={[styles.actionBtnText, { color: colors.info }]}>
                        {item.status === 'Completed' ? 'Reopen' : 'Complete'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: `${colors.primary}15` }]}
                    onPress={() => handleEditTask(item)}
                >
                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                    <Text style={[styles.actionBtnText, { color: colors.primary }]}>Edit</Text>
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
                        <Text style={styles.emptyText}>No tasks found</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, shadows.lg]}
                onPress={handleCreateTask}
            >
                <Ionicons name="add" size={28} color={colors.white} />
            </TouchableOpacity>

            {/* Create/Edit Task Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingTask ? 'Edit Task' : 'Create New Task'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Task Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.task_name}
                                    onChangeText={(text) => setFormData({ ...formData, task_name: text })}
                                    placeholder="Enter task name"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    placeholder="Enter task description"
                                    multiline
                                    numberOfLines={4}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Due Date</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.due_date}
                                    onChangeText={(text) => setFormData({ ...formData, due_date: text })}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>

                            <FilterDropdown
                                label="Status"
                                value={formData.status}
                                options={TASK_STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                            />

                            <FilterDropdown
                                label="Priority"
                                value={formData.priority}
                                options={PRIORITY_OPTIONS.map(p => ({ value: p, label: p }))}
                                onChange={(val) => setFormData({ ...formData, priority: val })}
                            />

                            <View style={{ height: 40 }} />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, shadows.sm]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveBtn, shadows.md, saving && styles.disabledBtn]}
                                onPress={handleSubmit}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color={colors.white} size="small" />
                                ) : (
                                    <Text style={styles.saveBtnText}>
                                        {editingTask ? 'Update Task' : 'Create Task'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingBottom: BOTTOM_TAB_SPACING,
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
    actionButtons: {
        flexDirection: 'row',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        gap: spacing.xs,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: 6,
        borderRadius: borderRadius.md,
        gap: 4,
    },
    actionBtnText: {
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
    fab: {
        position: 'absolute',
        right: spacing.md,
        bottom: BOTTOM_TAB_HEIGHT + 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    modalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    modalForm: {
        padding: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: colors.gray50,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: 15,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    cancelBtn: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray200,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontWeight: '600',
        color: colors.textSecondary,
    },
    saveBtn: {
        flex: 2,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    saveBtnText: {
        fontWeight: '700',
        color: colors.white,
    },
    disabledBtn: {
        opacity: 0.7,
    },
});

export default TasksScreen;
