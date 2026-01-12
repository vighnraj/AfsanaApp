// Application & Payment API functions

import api from './index';

/**
 * Get all applications
 * @returns {Promise<array>}
 */
export const getAllApplications = async () => {
    const response = await api.get('application');
    return response.data;
};

/**
 * Get application by ID
 * @param {number} id - Application ID
 * @returns {Promise<object>}
 */
export const getApplicationById = async (id) => {
    const response = await api.get(`application/${id}`);
    return response.data;
};

/**
 * Delete application
 * @param {number} id - Application ID
 * @returns {Promise<object>}
 */
export const deleteApplication = async (id) => {
    const response = await api.delete(`application/${id}`);
    return response.data;
};

/**
 * Update application status
 * @param {number} appId - Application ID
 * @param {object} data - Update data
 * @returns {Promise<object>}
 */
export const updateApplicationStatus = async (appId, data) => {
    const response = await api.patch(`application/${appId}`, data);
    return response.data;
};

/**
 * Get all counselors
 * @returns {Promise<array>}
 */
export const getAllCounselors = async () => {
    const response = await api.get('counselor');
    return response.data;
};

/**
 * Get all processors
 * @returns {Promise<array>}
 */
export const getAllProcessors = async () => {
    const response = await api.get('getAllProcessors');
    return response.data;
};

/**
 * Assign counselor to application
 * @param {object} data - { application_id, counselor_id, follow_up, notes }
 * @returns {Promise<object>}
 * @note BACKEND VERIFICATION NEEDED - Endpoint may have typo: 'assignCounselorapllication'
 *       Should likely be: 'assignCounselorToApplication'
 */
export const assignCounselorToApplication = async (data) => {
    // FIXME: Verify backend endpoint spelling
    // Current: assignCounselorapllication (missing 'To', double 'l')
    // Expected: assignCounselorToApplication
    const response = await api.patch('assignCounselorapllication', data);
    return response.data;
};

/**
 * Assign processor to application
 * @param {object} data - { application_id, processor_id }
 * @returns {Promise<object>}
 * @note BACKEND VERIFICATION NEEDED - Endpoint may have typo: 'assignassignProcessorapllication'
 *       Should likely be: 'assignProcessorToApplication'
 */
export const assignProcessorToApplication = async (data) => {
    // FIXME: Verify backend endpoint spelling
    // Current: assignassignProcessorapllication (double 'assign', missing 'To', double 'l')
    // Expected: assignProcessorToApplication
    const response = await api.patch('assignassignProcessorapllication', data);
    return response.data;
};

/**
 * Get student invoices by counselor
 * @param {number} counselorId - Counselor ID
 * @returns {Promise<array>}
 */
export const getStudentInvoices = async (counselorId) => {
    const response = await api.get(`students/invoices/${counselorId}`);
    return response.data;
};

/**
 * Get payments by student ID
 * @param {number} studentId - Student ID
 * @returns {Promise<array>}
 */
export const getPaymentsByStudentId = async (studentId) => {
    const response = await api.get(`paymentsbyid/${studentId}`);
    return response.data;
};

/**
 * Create new payment with file upload
 * @param {FormData} formData - Payment data with file
 * @returns {Promise<object>}
 */
export const createPayment = async (formData) => {
    const response = await api.post('payments', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Upload inquiry documents
 * @param {FormData} formData - Documents with inquiry_id
 * @returns {Promise<object>}
 */
export const uploadInquiryDocuments = async (formData) => {
    const response = await api.post('upload-inquiry-documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Upload student documents
 * @param {number} studentId - Student ID
 * @param {FormData} formData - Student documents
 * @returns {Promise<object>}
 */
export const uploadStudentDocuments = async (studentId, formData) => {
    const response = await api.post(`postDocuments/${studentId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Get all branches
 * @returns {Promise<array>}
 */
export const getAllBranches = async () => {
    const response = await api.get('branch');
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
 * Get all universities
 * @returns {Promise<array>}
 */
export const getAllUniversities = async () => {
    const response = await api.get('universities');
    return response.data;
};

/**
 * Create new application
 * @param {FormData} formData - Application data with optional file upload
 * @returns {Promise<object>}
 */
export const createApplication = async (formData) => {
    const response = await api.post('application', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Update existing application
 * @param {number} id - Application ID
 * @param {FormData} formData - Updated application data with optional file upload
 * @returns {Promise<object>}
 */
export const updateApplication = async (id, formData) => {
    const response = await api.patch(`application/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export default {
    getAllApplications,
    getApplicationById,
    deleteApplication,
    updateApplicationStatus,
    getAllCounselors,
    getAllProcessors,
    assignCounselorToApplication,
    assignProcessorToApplication,
    getStudentInvoices,
    getPaymentsByStudentId,
    createPayment,
    uploadInquiryDocuments,
    uploadStudentDocuments,
    getAllBranches,
    getAllStudents,
    getAllUniversities,
    createApplication,
    updateApplication,
};
