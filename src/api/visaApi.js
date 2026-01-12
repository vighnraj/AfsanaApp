// Visa Processing API functions

import api from './index';

/**
 * Get all universities
 * @returns {Promise<array>}
 */
export const getUniversities = async () => {
    const response = await api.get('universities');
    return response.data;
};

/**
 * Get university by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export const getUniversityById = async (id) => {
    const response = await api.get(`universities/${id}`);
    return response.data;
};

/**
 * Create new university
 * @param {object} universityData - { user_id, name, logo_url, location, programs, highlights, contact_phone, contact_email }
 * @returns {Promise<object>}
 */
export const createUniversity = async (universityData) => {
    const formData = new FormData();
    formData.append('user_id', universityData.user_id);
    formData.append('name', universityData.name);
    formData.append('logo_url', universityData.logo_url);
    formData.append('location', universityData.location);
    formData.append('programs', JSON.stringify(universityData.programs));
    formData.append('highlights', JSON.stringify(universityData.highlights));
    formData.append('contact_phone', universityData.contact_phone);
    formData.append('contact_email', universityData.contact_email);

    const response = await api.post('universities', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

/**
 * Update existing university
 * @param {string} id - University ID
 * @param {object} universityData - { user_id, name, logo_url, location, programs, highlights, contact_phone, contact_email }
 * @returns {Promise<object>}
 */
export const updateUniversity = async (id, universityData) => {
    const formData = new FormData();
    formData.append('user_id', universityData.user_id);
    formData.append('name', universityData.name);
    formData.append('logo_url', universityData.logo_url);
    formData.append('location', universityData.location);
    formData.append('programs', JSON.stringify(universityData.programs));
    formData.append('highlights', JSON.stringify(universityData.highlights));
    formData.append('contact_phone', universityData.contact_phone);
    formData.append('contact_email', universityData.contact_email);

    const response = await api.patch(`universities/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

/**
 * Delete university
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteUniversity = async (id) => {
    const response = await api.delete(`universities/${id}`);
    return response.data;
};

/**
 * Get visa process by university and student
 * @param {string} universityId
 * @param {string} studentId
 * @returns {Promise<object>}
 */
export const getVisaProcessByUniversityAndStudent = async (universityId, studentId) => {
    const response = await api.get(`auth/getVisaProcessByuniversityidsss/${universityId}/${studentId}`);
    return response.data;
};

/**
 * Create new visa process record
 * @param {FormData} formData
 * @returns {Promise<object>}
 */
export const createVisaProcess = async (formData) => {
    const response = await api.post('createVisaProcess', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Update visa process record
 * @param {string} id
 * @param {FormData} formData
 * @returns {Promise<object>}
 */
export const updateVisaProcess = async (id, formData) => {
    const response = await api.put(`createVisaProcess/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Get all visa processing list (Admin)
 * @returns {Promise<array>}
 */
export const getVisaProcessingList = async () => {
    const response = await api.get('VisaProcess');
    return response.data;
};

/**
 * Get student visa processing list
 * @param {string} studentId
 * @returns {Promise<array>}
 */
export const getStudentVisaProcessingList = async (studentId) => {
    const response = await api.get(`getVisaProcessByStudentId/VisaProcess/${studentId}`);
    return response.data;
};

/**
 * Get visa process list for a counselor
 * @param {string} counselorId
 * @returns {Promise<array>}
 */
export const getVisaProcessByCounselorId = async (counselorId) => {
    const response = await api.get(`getvisaprocessbycounselorid/VisaProcess/${counselorId}`);
    return response.data;
};

/**
 * Get visa process list for a processor
 * @param {string} processorId
 * @returns {Promise<array>}
 */
export const getVisaProcessByProcessorId = async (processorId) => {
    const response = await api.get(`getvisaprocessbyprocessorid/VisaProcess/${processorId}`);
    return response.data;
};

/**
 * Get admission decisions
 * @returns {Promise<array>}
 */
export const getAdmissionDecisions = async () => {
    const response = await api.get('applications');
    return response.data;
};

/**
 * Update application status
 * @param {string} applicationId
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateApplicationStatus = async (applicationId, data) => {
    const response = await api.put(`applications/${applicationId}`, data);
    return response.data;
};

/**
 * Get application timeline
 * @param {string} applicationId
 * @returns {Promise<array>}
 */
export const getApplicationTimeline = async (applicationId) => {
    const response = await api.get(`timeline/${applicationId}`);
    return response.data;
};

export default {
    getUniversities,
    getUniversityById,
    createUniversity,
    updateUniversity,
    deleteUniversity,
    getVisaProcessByUniversityAndStudent,
    createVisaProcess,
    updateVisaProcess,
    getVisaProcessingList,
    getStudentVisaProcessingList,
    getVisaProcessByCounselorId,
    getVisaProcessByProcessorId,
    getAdmissionDecisions,
    updateApplicationStatus,
    getApplicationTimeline,
};
