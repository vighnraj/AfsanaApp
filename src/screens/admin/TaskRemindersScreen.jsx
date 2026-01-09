// Task Reminders Screen

import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';

import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, borderRadius, fontSizes, shadows } from '../../context/ThemeContext';
import { showToast } from '../../components/common/Toast';
import {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask,
    getAllReminders,
    createReminder,
    deleteReminder,
} from '../../api/taskApi';
import { getAllStudents } from '../../api/applicationApi';
import { getAllCounselors } from '../../api/applicationApi';
import DatePickerModal from '../../components/common/DatePickerModal';

const TaskRemindersScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [students, setStudents] = useState([]);
    const [counselors, setCounselors] = useState([]);

    // Tab state
    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'reminders'

    // Filter states
    const [statusFilter, setStatusFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');

    // Task Form Modal
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [priority, setPriority] = useState('Medium');
    const [status, setStatus] = useState('Pending');
    const [relatedTo, setRelatedTo] = useState('Application');
    const [assignedStudent, setAssignedStudent] = useState('');
    const [assignedCounselor, setAssignedCounselor] = useState('');
    const [attachmentFile, setAttachmentFile] = useState(null);

    // Date Picker
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Update Task Modal
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateTaskId, setUpdateTaskId] = useState(null);
    const [updateNotes, setUpdateNotes] = useState('');
    const [updateImage, setUpdateImage] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tasksData, remindersData, studentsData, counselorsData] = await Promise.all([
                getAllTasks(),
                getAllReminders(),
                getAllStudents(),
                getAllCounselors(),
            ]);
            setTasks(tasksData);
            setReminders(remindersData);
            setStudents(studentsData);
            setCounselors(counselorsData);
        } catch (error) {
            console.error('Fetch data error:', error);
            showToast.error('Error', 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const clearTaskForm = () => {
        setTaskTitle('');
        setTaskDescription('');
        setDueDate(null);
        setPriority('Medium');
        setStatus('Pending');
        setRelatedTo('Application');
        setAssignedStudent('');
        setAssignedCounselor('');
        setAttachmentFile(null);
    };

    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });
            if (result.type === 'success' || !result.canceled) {
                const file = result.assets ? result.assets[0] : result;
                setAttachmentFile(file);
            }
        } catch (error) {
            console.error('File picker error:', error);
        }
    };

    const handlePickUpdateImage = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*',
                copyToCacheDirectory: true,
            });
            if (result.type === 'success' || !result.canceled) {
                const file = result.assets ? result.assets[0] : result;
                setUpdateImage(file);
            }
        } catch (error) {
            console.error('Image picker error:', error);
        }
    };

    const handleCreateTask = async () => {
        if (!taskTitle.trim()) {
            showToast.error('Validation Error', 'Task title is required');
            return;
        }
        if (!dueDate) {
            showToast.error('Validation Error', 'Due date is required');
            return;
        }

        const taskData = {
            title: taskTitle,
            description: taskDescription,
            user_id: user.id,
            due_date: dueDate,
            priority: priority,
            status: status,
            related_to: relatedTo,
            student_id: assignedStudent || null,
            counselor_id: assignedCounselor || null,
            assigned_to: assignedCounselor || assignedStudent || null,
        };

        try {
            await createTask(taskData);
            showToast.success('Success', 'Task created successfully');
            setShowTaskModal(false);
            clearTaskForm();
            fetchData();
        } catch (error) {
            console.error('Create task error:', error);
            showToast.error('Error', 'Failed to create task');
        }
    };

    const handleUpdateTaskStatus = (taskId) => {
        setUpdateTaskId(taskId);
        setUpdateNotes('');
        setUpdateImage(null);
        setShowUpdateModal(true);
    };

    const handleSubmitUpdate = async () => {
        if (!updateNotes.trim()) {
            showToast.error('Validation Error', 'Notes are required');
            return;
        }

        const formData = new FormData();
        formData.append('notes', updateNotes);
        if (updateImage) {
            formData.append('image', {
                uri: updateImage.uri,
                type: updateImage.mimeType || 'image/jpeg',
                name: updateImage.name,
            });
        }

        try {
            await updateTask(updateTaskId, formData);
            showToast.success('Success', 'Task updated successfully');
            setShowUpdateModal(false);
            fetchData();
        } catch (error) {
            console.error('Update task error:', error);
            showToast.error('Error', 'Failed to update task');
        }
    };

    const handleDeleteTask = (task) => {
        Alert.alert(
            'Delete Task',
            `Are you sure you want to delete "${task.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteTask(task.id);
                            showToast.success('Success', 'Task deleted successfully');
                            fetchData();
                        } catch (error) {
                            console.error('Delete task error:', error);
                            showToast.error('Error', 'Failed to delete task');
                        }
                    },
                },
            ]
        );
    };

    const handleAddReminder = (task) => {
        Alert.alert(
            'Add Reminder',
            `Add a reminder for task "${task.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Add',
                    onPress: async () => {
                        try {
                            await createReminder({ task_id: task.id });
                            showToast.success('Success', 'Reminder added successfully');
                            fetchData();
                        } catch (error) {
                            console.error('Add reminder error:', error);
                            showToast.error('Error', 'Failed to add reminder');
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteReminder = (reminder) => {
        Alert.alert(
            'Delete Reminder',
            `Are you sure you want to delete this reminder?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteReminder(reminder.id);
                            showToast.success('Success', 'Reminder deleted successfully');
                            fetchData();
                        } catch (error) {
                            console.error('Delete reminder error:', error);
                            showToast.error('Error', 'Failed to delete reminder');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB');
    };

    const isTaskMissed = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High':
                return colors.error;
            case 'Medium':
                return colors.warning;
            case 'Low':
                return colors.info;
            default:
                return colors.gray400;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Complete':
                return colors.success;
            case 'In Progress':
                return colors.info;
            case 'Pending Approval':
                return colors.warning;
            case 'Pending':
            default:
                return colors.gray400;
        }
    };

    const getFilteredTasks = () => {
        let filtered = [...tasks];

        if (statusFilter !== 'All') {
            filtered = filtered.filter((task) => task.status === statusFilter);
        }

        if (priorityFilter !== 'All') {
            filtered = filtered.filter((task) => task.priority === priorityFilter);
        }

        return filtered;
    };

    const getActiveReminders = () => {
        const today = new Date();
        return reminders.filter((reminder) => new Date(reminder.due_date) >= today);
    };

    const getMissedReminders = () => {
        const today = new Date();
        return reminders.filter((reminder) => new Date(reminder.due_date) < today);
    };

    const renderTaskCard = (task) => {
        const missed = isTaskMissed(task.due_date);

        return (
            <View key={task.id} style={[styles.card, shadows.sm, missed && styles.missedCard]}>
                <View style={styles.cardHeader}>
                    <View style={styles.taskTitleContainer}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        {missed && (
                            <View style={styles.missedBadge}>
                                <Text style={styles.missedBadgeText}>Missed</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.badgeContainer}>
                        <View style={[styles.badge, { backgroundColor: `${getPriorityColor(task.priority)}20` }]}>
                            <Text style={[styles.badgeText, { color: getPriorityColor(task.priority) }]}>
                                {task.priority}
                            </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: `${getStatusColor(task.status)}20` }]}>
                            <Text style={[styles.badgeText, { color: getStatusColor(task.status) }]}>
                                {task.status}
                            </Text>
                        </View>
                    </View>
                </View>

                {task.description && (
                    <Text style={styles.taskDescription} numberOfLines={2}>
                        {task.description}
                    </Text>
                )}

                <View style={styles.taskMeta}>
                    <View style={styles.metaRow}>
                        <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                        <Text style={styles.metaText}>Due: {formatDate(task.due_date)}</Text>
                    </View>
                    {task.related_to && (
                        <View style={styles.metaRow}>
                            <Ionicons name="document-text" size={14} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{task.related_to}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => handleUpdateTaskStatus(task.id)}
                    >
                        <Ionicons name="create" size={18} color={colors.primary} />
                        <Text style={styles.cardActionText}>Update</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => handleAddReminder(task)}
                    >
                        <Ionicons name="notifications" size={18} color={colors.warning} />
                        <Text style={styles.cardActionText}>Remind</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cardActionButton}
                        onPress={() => handleDeleteTask(task)}
                    >
                        <Ionicons name="trash" size={18} color={colors.error} />
                        <Text style={styles.cardActionText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderReminderCard = (reminder) => {
        const missed = isTaskMissed(reminder.due_date);

        return (
            <View key={reminder.id} style={[styles.card, shadows.sm, missed && styles.missedCard]}>
                <View style={styles.reminderHeader}>
                    <Ionicons
                        name="notifications"
                        size={24}
                        color={missed ? colors.error : colors.warning}
                    />
                    <View style={styles.reminderInfo}>
                        <Text style={styles.reminderTitle}>{reminder.title}</Text>
                        <View style={styles.metaRow}>
                            <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                            <Text style={styles.metaText}>Due: {formatDate(reminder.due_date)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteReminder(reminder)}>
                        <Ionicons name="close-circle" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, paddingTop: 100, alignItems: 'center', backgroundColor: 'white' }}>
            <Text>DEBUG MODE: Screen Loaded Successfully</Text>
            <Text>If you see this, the imports are fine.</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 20, marginTop: 20, backgroundColor: '#eee' }}>
                <Text>Go Back</Text>
            </TouchableOpacity>
        </View>
    );

    /* Original Return below */
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, shadows.sm]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Task & Reminders</Text>
                <TouchableOpacity onPress={() => setShowTaskModal(true)}>
                    <Ionicons name="add-circle" size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
                    onPress={() => setActiveTab('tasks')}
                >
                    <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
                        Tasks ({tasks.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'reminders' && styles.activeTab]}
                    onPress={() => setActiveTab('reminders')}
                >
                    <Text style={[styles.tabText, activeTab === 'reminders' && styles.activeTabText]}>
                        Reminders ({reminders.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Filters (only for tasks) */}
            {activeTab === 'tasks' && (
                <View style={styles.filterContainer}>
                    <View style={styles.filterItem}>
                        <Text style={styles.filterLabel}>Status:</Text>
                        <Picker
                            selectedValue={statusFilter}
                            onValueChange={setStatusFilter}
                            style={styles.filterPicker}
                        >
                            <Picker.Item label="All" value="All" />
                            <Picker.Item label="Pending" value="Pending" />
                            <Picker.Item label="In Progress" value="In Progress" />
                            <Picker.Item label="Complete" value="Complete" />
                            <Picker.Item label="Pending Approval" value="Pending Approval" />
                        </Picker>
                    </View>
                    <View style={styles.filterItem}>
                        <Text style={styles.filterLabel}>Priority:</Text>
                        <Picker
                            selectedValue={priorityFilter}
                            onValueChange={setPriorityFilter}
                            style={styles.filterPicker}
                        >
                            <Picker.Item label="All" value="All" />
                            <Picker.Item label="High" value="High" />
                            <Picker.Item label="Medium" value="Medium" />
                            <Picker.Item label="Low" value="Low" />
                        </Picker>
                    </View>
                </View>
            )}

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                        />
                    }
                >
                    {activeTab === 'tasks' ? (
                        getFilteredTasks().length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="checkbox-outline" size={64} color={colors.gray300} />
                                <Text style={styles.emptyText}>No tasks found</Text>
                            </View>
                        ) : (
                            <View>
                                {getFilteredTasks().map((task) => renderTaskCard(task))}
                            </View>
                        )
                    ) : (
                        <View>
                            {getActiveReminders().length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Active Reminders</Text>
                                    <View>
                                        {getActiveReminders().map((reminder) => renderReminderCard(reminder))}
                                    </View>
                                </View>
                            )}
                            {getMissedReminders().length > 0 && (
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: colors.error }]}>
                                        Missed Alerts
                                    </Text>
                                    <View>
                                        {getMissedReminders().map((reminder) => renderReminderCard(reminder))}
                                    </View>
                                </View>
                            )}
                            {reminders.length === 0 && (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="notifications-outline" size={64} color={colors.gray300} />
                                    <Text style={styles.emptyText}>No reminders found</Text>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Create Task Modal */}
            <Modal visible={showTaskModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, shadows.lg]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New Task</Text>
                            <TouchableOpacity onPress={() => setShowTaskModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Title */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Title <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter task title"
                                    placeholderTextColor={colors.textSecondary}
                                    value={taskTitle}
                                    onChangeText={setTaskTitle}
                                />
                            </View>

                            {/* Description */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Enter task description"
                                    placeholderTextColor={colors.textSecondary}
                                    value={taskDescription}
                                    onChangeText={setTaskDescription}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Due Date */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Due Date <Text style={styles.required}>*</Text>
                                </Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Ionicons name="calendar" size={16} color={colors.primary} />
                                    <Text style={styles.dateButtonText}>
                                        {dueDate ? formatDate(dueDate) : 'Select due date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Priority */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Priority</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={priority}
                                        onValueChange={setPriority}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Low" value="Low" />
                                        <Picker.Item label="Medium" value="Medium" />
                                        <Picker.Item label="High" value="High" />
                                    </Picker>
                                </View>
                            </View>

                            {/* Status */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Status</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={status}
                                        onValueChange={setStatus}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Pending" value="Pending" />
                                        <Picker.Item label="In Progress" value="In Progress" />
                                        <Picker.Item label="Complete" value="Complete" />
                                        <Picker.Item label="Pending Approval" value="Pending Approval" />
                                    </Picker>
                                </View>
                            </View>

                            {/* Related To */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Related To</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={relatedTo}
                                        onValueChange={setRelatedTo}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Application" value="Application" />
                                        <Picker.Item label="Visa" value="Visa" />
                                        <Picker.Item label="Interview" value="Interview" />
                                    </Picker>
                                </View>
                            </View>

                            {/* Assign Student */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Assign to Student</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={assignedStudent}
                                        onValueChange={setAssignedStudent}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select student" value="" />
                                        {students.map((student) => (
                                            <Picker.Item
                                                key={student.id}
                                                label={student.name || student.email}
                                                value={student.id.toString()}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            {/* Assign Counselor */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Assign to Counselor</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={assignedCounselor}
                                        onValueChange={setAssignedCounselor}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Select counselor" value="" />
                                        {counselors.map((counselor) => (
                                            <Picker.Item
                                                key={counselor.id}
                                                label={counselor.name || counselor.email}
                                                value={counselor.id.toString()}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setShowTaskModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.submitButton]}
                                onPress={handleCreateTask}
                            >
                                <Text style={styles.submitButtonText}>Create Task</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Update Task Modal */}
            <Modal visible={showUpdateModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, shadows.lg]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Task</Text>
                            <TouchableOpacity onPress={() => setShowUpdateModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    Notes <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Enter update notes"
                                    placeholderTextColor={colors.textSecondary}
                                    value={updateNotes}
                                    onChangeText={setUpdateNotes}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Attach Image (Optional)</Text>
                                <TouchableOpacity style={styles.fileButton} onPress={handlePickUpdateImage}>
                                    <Ionicons name="image" size={20} color={colors.primary} />
                                    <Text style={styles.fileButtonText}>
                                        {updateImage ? updateImage.name : 'Select image'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setShowUpdateModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.submitButton]}
                                onPress={handleSubmitUpdate}
                            >
                                <Text style={styles.submitButtonText}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Date Picker Modal */}
            {/* <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onSelectDate={(date) => {
                    setDueDate(date);
                    setShowDatePicker(false);
                }}
                selectedDate={dueDate}
            /> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.white,
    },
    headerTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: '700',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: spacing.sm,
        backgroundColor: colors.white,
        gap: spacing.sm,
    },
    filterItem: {
        flex: 1,
    },
    filterLabel: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    filterPicker: {
        height: 40,
        backgroundColor: colors.gray50,
    },
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
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    missedCard: {
        borderLeftWidth: 4,
        borderLeftColor: colors.error,
    },
    cardHeader: {
        marginBottom: spacing.sm,
    },
    taskTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    taskTitle: {
        fontSize: fontSizes.md,
        fontWeight: '700',
        color: colors.text,
        flex: 1,
    },
    missedBadge: {
        backgroundColor: colors.error,
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    missedBadgeText: {
        fontSize: fontSizes.xs,
        color: colors.white,
        fontWeight: '600',
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.md,
    },
    badgeText: {
        fontSize: fontSizes.xs,
        fontWeight: '600',
    },
    taskDescription: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    taskMeta: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
    },
    cardActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        paddingTop: spacing.sm,
        gap: spacing.sm,
    },
    cardActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    cardActionText: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    reminderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    reminderInfo: {
        flex: 1,
    },
    reminderTitle: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    modalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.text,
    },
    modalContent: {
        padding: spacing.md,
        maxHeight: 500,
    },
    formGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    required: {
        color: colors.error,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        fontSize: fontSizes.sm,
        color: colors.text,
        backgroundColor: colors.white,
    },
    textArea: {
        height: 80,
        paddingTop: spacing.sm,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        gap: spacing.xs,
    },
    dateButtonText: {
        fontSize: fontSizes.sm,
        color: colors.text,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    fileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: borderRadius.md,
        borderStyle: 'dashed',
        gap: spacing.xs,
    },
    fileButtonText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    modalFooter: {
        flexDirection: 'row',
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
        gap: spacing.sm,
    },
    button: {
        flex: 1,
        padding: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: colors.gray100,
    },
    cancelButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    submitButton: {
        backgroundColor: colors.primary,
    },
    submitButtonText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.white,
    },
});

export default TaskRemindersScreen;
