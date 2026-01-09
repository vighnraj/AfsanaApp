// Student API functions

import api from './index';

/**
 * Create a new student (Signup)
 * @param {object} data - { full_name, email, password, role: 'student' }
 * @returns {Promise<object>}
 */
export const createStudent = async (data) => {
    const response = await api.post('auth/createStudent', data);
    return response.data;
};

/**
 * Get all students
 * @returns {Promise<array>}
 */
export const getAllStudents = async () => {
    const response = await api.get('auth/getAllStudents');
    return response.data;
};

/**
 * Get student by ID
 * @param {string} studentId
 * @returns {Promise<object>}
 */
export const getStudentById = async (studentId) => {
    const response = await api.get(`auth/getStudentById/${studentId}`);
    return response.data;
};

/**
 * Update student profile
 * @param {string} studentId
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateStudent = async (studentId, data) => {
    const response = await api.put(`auth/updateStudent/${studentId}`, data);
    return response.data;
};

/**
 * Get students for a counselor
 * @param {string} counselorId
 * @returns {Promise<array>}
 */
export const getCounselorStudents = async (counselorId) => {
    const response = await api.get(`auth/students/by-counselor/${counselorId}`);
    return response.data;
};

/**
 * Get student applications
 * @param {string} studentId
 * @returns {Promise<array>}
 */
/**
 * Get student applications
 * @param {string} studentId
 * @returns {Promise<array>}
 */
export const getStudentApplications = async (studentId) => {
    const response = await api.get(`application?student_id=${studentId}`);
    return response.data;
};

/**
 * Get student tasks
 * @param {string} studentId
 * @returns {Promise<array>}
 */
export const getStudentTasks = async (studentId) => {
    const response = await api.get(`task?assigned_to=${studentId}`);
    return response.data;
};

/**
 * Get student payments
 * @param {string} studentId
 * @returns {Promise<array>}
 */
export const getStudentPayments = async (studentId) => {
    const response = await api.get(`payments?student_id=${studentId}`);
    return response.data;
};

/**
 * Get student decisions
 * @param {string} studentId
 * @returns {Promise<array>}
 */
export const getStudentDecisions = async (studentId) => {
    const response = await api.get(`admissiondecision?student_id=${studentId}`);
    return response.data;
};

/**
 * Get documents for a student/inquiry
 * @param {string} id - student or inquiry ID
 * @returns {Promise<array>}
 */
export const getDocuments = async (id) => {
    const response = await api.get(`getDocuments/${id}`);
    return response.data;
};

/**
 * Delete student
 * @param {string} studentId
 * @returns {Promise<object>}
 */
export const deleteStudent = async (studentId) => {
    const response = await api.delete(`auth/deleteStudent/${studentId}`);
    return response.data;
};

export default {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getCounselorStudents,
    getStudentApplications,
    getStudentTasks,
    getStudentPayments,
    getStudentDecisions,
    getDocuments,
};
