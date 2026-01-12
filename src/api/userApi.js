// User Management API functions (Counselors, Staff, Processors, Tasks)

import api from './index';

// ================== COUNSELOR APIs ==================

/**
 * Get all counselors
 * @returns {Promise<array>}
 */
export const getCounselors = async () => {
    const response = await api.get('counselor');
    return response.data;
};

/**
 * Create new counselor
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createCounselor = async (data) => {
    const response = await api.post('counselor', data);
    return response.data;
};

/**
 * Update counselor
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateCounselor = async (id, data) => {
    const response = await api.put(`counselor/${id}`, data);
    return response.data;
};

/**
 * Delete counselor
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteCounselor = async (id) => {
    const response = await api.delete(`counselor/${id}`);
    return response.data;
};

// ================== STAFF APIs ==================

/**
 * Get all staff
 * @returns {Promise<array>}
 */
export const getStaff = async () => {
    const response = await api.get('staff');
    return response.data;
};

/**
 * Get staff by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export const getStaffById = async (id) => {
    const response = await api.get(`getStaffById/${id}`);
    return response.data;
};

/**
 * Create new staff
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createStaff = async (data) => {
    const response = await api.post('staff', data);
    return response.data;
};

/**
 * Update staff
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateStaff = async (id, data) => {
    const response = await api.put(`staff/${id}`, data);
    return response.data;
};

/**
 * Delete staff
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteStaff = async (id) => {
    const response = await api.delete(`staff/${id}`);
    return response.data;
};

// ================== PROCESSOR APIs ==================

/**
 * Get all processors
 * @returns {Promise<array>}
 */
export const getProcessors = async () => {
    const response = await api.get('getAllProcessors');
    return response.data;
};

/**
 * Create new processor
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createProcessor = async (data) => {
    const response = await api.post('createprocessor', data);
    return response.data;
};

/**
 * Update processor
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateProcessor = async (id, data) => {
    const response = await api.put(`updateProcessor/${id}`, data);
    return response.data;
};

/**
 * Delete processor
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteProcessor = async (id) => {
    const response = await api.delete(`deleteProcessor/${id}`);
    return response.data;
};

/**
 * Get processor students
 * @param {string} processorId
 * @returns {Promise<array>}
 */
export const getProcessorStudents = async (processorId) => {
    const response = await api.get(`processor/students/${processorId}`);
    return response.data;
};

// ================== TASK APIs ==================

/**
 * Get all tasks
 * @returns {Promise<array>}
 */
export const getTasks = async () => {
    const response = await api.get('task');
    return response.data;
};

/**
 * Create new task
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createTask = async (data) => {
    const response = await api.post('task', data);
    return response.data;
};

/**
 * Update task
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateTask = async (id, data) => {
    const response = await api.put(`task/${id}`, data);
    return response.data;
};

/**
 * Get counselor tasks
 * @param {string} counselorId
 * @returns {Promise<array>}
 */
export const getCounselorTasks = async (counselorId) => {
    const response = await api.get(`task/${counselorId}`);
    return response.data;
};

// ================== ROLES & PERMISSIONS APIs ==================

/**
 * Get all roles
 * @returns {Promise<array>}
 */
export const getRoles = async () => {
    // Backend may not have roles endpoint - return hardcoded roles used by the system
    try {
        const response = await api.get('getAllRoles');
        return response.data;
    } catch (error) {
        // Fallback to hardcoded roles matching web frontend
        console.warn('Roles API not available, using default roles');
        return [
            { id: 1, role_name: 'admin' },
            { id: 2, role_name: 'counselor' },
            { id: 3, role_name: 'student' },
            { id: 4, role_name: 'staff' },
            { id: 5, role_name: 'processor' },
        ];
    }
};

/**
 * Get permissions for a role
 * @param {string} roleName
 * @returns {Promise<array>}
 */
export const getRolePermissions = async (roleName) => {
    const response = await api.get(`permission?role_name=${roleName}`);
    return response.data;
};

/**
 * Update role permissions
 * @param {string} roleId
 * @param {object} permissions
 * @returns {Promise<object>}
 */
export const updateRolePermissions = async (roleId, permissions) => {
    const response = await api.put(`permission/${roleId}`, permissions);
    return response.data;
};

// ================== PAYMENT APIs ==================

/**
 * Get all payments
 * @returns {Promise<array>}
 */
export const getPayments = async () => {
    const response = await api.get('payments');
    return response.data;
};

/**
 * Create invoice
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createInvoice = async (data) => {
    const response = await api.post('invoice', data);
    return response.data;
};

// ================== ADMIN APIs (Master Admin) ==================

/**
 * Get all admins
 * @returns {Promise<array>}
 */
export const getAdmins = async () => {
    const response = await api.get('admin');
    return response.data;
};

/**
 * Create new admin
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createAdmin = async (data) => {
    const response = await api.post('admin', data);
    return response.data;
};

/**
 * Update admin
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateAdmin = async (id, data) => {
    const response = await api.put(`admin/${id}`, data);
    return response.data;
};

/**
 * Delete admin
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteAdmin = async (id) => {
    const response = await api.delete(`admin/${id}`);
    return response.data;
};

// ================== UNIVERSITY APIs ==================

/**
 * Get all universities
 * @returns {Promise<array>}
 */
export const getUniversities = async () => {
    const response = await api.get('universities');
    return response.data;
};

export default {
    // Counselor
    getCounselors,
    createCounselor,
    updateCounselor,
    deleteCounselor,
    getUniversities, // Added
    // Staff
    getStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    // Processor
    getProcessors,
    createProcessor,
    updateProcessor,
    deleteProcessor,
    getProcessorStudents,
    // Tasks
    getTasks,
    createTask,
    updateTask,
    getCounselorTasks,
    // Roles
    getRoles,
    getRolePermissions,
    updateRolePermissions,
    // Payments
    getPayments,
    createInvoice,
    // Admin
    getAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
};
