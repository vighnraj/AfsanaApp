// Task & Reminder API functions

import api from './index';

/**
 * Get all tasks
 * @returns {Promise<array>}
 */
export const getAllTasks = async () => {
    const response = await api.get('task');
    return response.data;
};

/**
 * Get task by ID
 * @param {number} id - Task ID
 * @returns {Promise<object>}
 */
export const getTaskById = async (id) => {
    const response = await api.get(`task/${id}`);
    return response.data;
};

/**
 * Get tasks for a specific student
 * @param {number} studentId - Student ID
 * @returns {Promise<array>}
 */
export const getStudentTasks = async (studentId) => {
    const response = await api.get(`student_task/${studentId}`);
    return response.data;
};

/**
 * Create new task
 * @param {object} data - Task data
 * @returns {Promise<object>}
 */
export const createTask = async (data) => {
    const response = await api.post('task', data);
    return response.data;
};

/**
 * Update task
 * @param {number} id - Task ID
 * @param {FormData} formData - Task data with notes and image
 * @returns {Promise<object>}
 */
export const updateTask = async (id, formData) => {
    const response = await api.patch(`update_task/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Delete task
 * @param {number} id - Task ID
 * @returns {Promise<object>}
 */
export const deleteTask = async (id) => {
    const response = await api.delete(`task/${id}`);
    return response.data;
};

/**
 * Get all reminders
 * @returns {Promise<array>}
 */
export const getAllReminders = async () => {
    const response = await api.get('remainder');
    return response.data;
};

/**
 * Get reminders (new format)
 * @returns {Promise<array>}
 */
export const getTaskReminders = async () => {
    const response = await api.get('tasks/reminder');
    return response.data;
};

/**
 * Create reminder for a task
 * @param {object} data - { task_id: number }
 * @returns {Promise<object>}
 */
export const createReminder = async (data) => {
    const response = await api.post('remainder', data);
    return response.data;
};

/**
 * Delete reminder
 * @param {number} id - Reminder ID
 * @returns {Promise<object>}
 */
export const deleteReminder = async (id) => {
    const response = await api.delete(`remainder/${id}`);
    return response.data;
};

export default {
    getAllTasks,
    getTaskById,
    getStudentTasks,
    createTask,
    updateTask,
    deleteTask,
    getAllReminders,
    getTaskReminders,
    createReminder,
    deleteReminder,
};
