// Lead and Inquiry API functions

import api from './index';

// ================== INQUIRY APIs ==================

/**
 * Get all inquiries with optional filters
 * @param {object} filters
 * @returns {Promise<array>}
 */
export const getInquiries = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const url = queryString ? `inquiries?${queryString}` : 'inquiries';

    const response = await api.get(url);
    return response.data;
};

// Alias for compatibility
export const getAllInquiries = getInquiries;

/**
 * Get inquiry by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export const getInquiryById = async (id) => {
    const response = await api.get(`inquiries/${id}`);
    return response.data;
};

/**
 * Create new inquiry
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createInquiry = async (data) => {
    const response = await api.post('inquiry', data);
    return response.data;
};

/**
 * Update inquiry
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateInquiry = async (id, data) => {
    const response = await api.put(`inquiries/${id}`, data);
    return response.data;
};

/**
 * Delete inquiry
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteInquiry = async (id) => {
    const response = await api.delete(`inquiries/${id}`);
    return response.data;
};

// ================== LEAD APIs ==================

/**
 * Get all leads with optional filters
 * @param {object} filters
 * @returns {Promise<array>}
 */
export const getLeads = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const url = queryString ? `AllConvertedLeadsinquiries?${queryString}` : 'AllConvertedLeadsinquiries';

    const response = await api.get(url);
    return response.data;
};

/**
 * Get lead by ID
 * @param {string} id
 * @returns {Promise<object>}
 */
export const getLeadById = async (id) => {
    const response = await api.get(`inquiries/${id}`);
    return response.data;
};

/**
 * Create new lead
 * @param {object} data
 * @returns {Promise<object>}
 */
/**
 * Create new lead (actually an inquiry with status)
 * @param {object} data 
 * @returns {Promise<object>}
 */
export const createLead = async (data) => {
    const response = await api.post('inquiries', data);
    return response.data;
};

/**
 * Update lead (status)
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateLead = async (id, data) => {
    // Frontend uses PATCH /update-lead-status-new
    // Expected payload: { inquiry_id: id, new_leads: status, lead_status: status }
    const response = await api.patch('update-lead-status-new', {
        inquiry_id: id,
        ...data
    });
    return response.data;
};

/**
 * Update lead priority
 * @param {string} inquiryId
 * @param {string} priority
 * @returns {Promise<object>}
 */
export const updatePriority = async (inquiryId, priority) => {
    const response = await api.patch('priority', {
        inquiry_id: inquiryId,
        priority: priority
    });
    return response.data;
};

/**
 * Convert inquiry to lead
 * @param {string} inquiryId
 * @returns {Promise<object>}
 */
export const convertToLead = async (inquiryId) => {
    const response = await api.patch('fee/update-lesd-status', {
        id: inquiryId,
        lead_status: 'Converted to Lead'
    });
    return response.data;
};

/**
 * Check if phone number already exists
 * @param {string} phone
 * @returns {Promise<object>}
 */
export const checkPhoneExists = async (phone) => {
    const response = await api.get(`inquiries/check-phone?phone=${encodeURIComponent(phone)}`);
    return response.data;
};

/**
 * Update full lead/inquiry details
 * @param {string} id 
 * @param {object} data 
 * @returns {Promise<object>}
 */
export const updateInquiryDetails = async (id, data) => {
    const response = await api.put(`inquiries/${id}`, data);
    return response.data;
};

/**
 * Delete lead
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteLead = async (id) => {
    const response = await api.delete(`inquiries/${id}`);
    return response.data;
};

/**
 * Get leads for counselor
 * @param {string} counselorId
 * @returns {Promise<array>}
 */
export const getCounselorLeads = async (counselorId) => {
    const response = await api.get(`lead/getLeadByCounselorIdnew/${counselorId}`);
    return response.data;
};

/**
 * Convert lead to student
 * @param {string} leadId
 * @returns {Promise<object>}
 */
export const convertLeadToStudent = async (leadId) => {
    const response = await api.post(`lead/${leadId}/convert`);
    return response.data;
};

// ================== FOLLOW-UP APIs ==================

/**
 * Get follow-ups for a lead
 * @param {string} leadId
 * @returns {Promise<array>}
 */
export const getFollowUps = async (leadId) => {
    const response = await api.get(`followup/${leadId}`);
    return response.data;
};

/**
 * Create follow-up
 * @param {object} data
 * @returns {Promise<object>}
 */
export const createFollowUp = async (data) => {
    const response = await api.post('followup', data);
    return response.data;
};

/**
 * Get follow-up history for an inquiry
 * @param {string} id
 * @returns {Promise<array>}
 */
export const getFollowUpHistory = async (id) => {
    const response = await api.get(`getFollowUpHistoryByInquiryId/${id}`);
    return response.data;
};

/**
 * Get note history for an inquiry
 * @param {string} id
 * @returns {Promise<array>}
 */
export const getNoteHistory = async (id) => {
    const response = await api.get(`getNotesByInquiryId/${id}`);
    return response.data;
};

/**
 * Create a new note
 * @param {object} data 
 * @returns {Promise<object>}
 */
export const createNote = async (data) => {
    const response = await api.post('createNote', data);
    return response.data;
};

/**
 * Update an existing note
 * @param {string} id 
 * @param {object} data 
 * @returns {Promise<object>}
 */
export const updateNote = async (id, data) => {
    const response = await api.patch(`updateNote/${id}`, data);
    return response.data;
};

/**
 * Delete a note
 * @param {string} id 
 * @returns {Promise<object>}
 */
export const deleteNote = async (id) => {
    const response = await api.delete(`deleteNote/${id}`);
    return response.data;
};

/**
 * Create a new follow-up history entry
 * @param {object} data 
 * @returns {Promise<object>}
 */
export const createFollowUpHistory = async (data) => {
    const response = await api.post('followup-history', data);
    return response.data;
};

/**
 * Update a follow-up history entry
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>}
 */
export const updateFollowUpHistory = async (id, data) => {
    const response = await api.put(`updateFollowUp/${id}`, data);
    return response.data;
};

/**
 * Update follow-up status only
 * @param {string} followUpId
 * @param {string} counselorId
 * @param {string} status
 * @returns {Promise<object>}
 */
export const updateFollowUpStatus = async (followUpId, counselorId, status) => {
    const response = await api.put('updateFollowUpStatus', {
        id: followUpId,
        counselor_id: counselorId,
        status: status
    });
    return response.data;
};

/**
 * Delete a follow-up history entry
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteFollowUpHistory = async (id) => {
    const response = await api.delete(`delete-followup-history/${id}`);
    return response.data;
};

// ================== ASSIGNMENT & DOCUMENT APIs ==================

/**
 * Assign counselor to inquiry
 * @param {object} data - { inquiry_id, counselor_id, notes }
 * @returns {Promise<object>}
 */
export const assignInquiry = async (data) => {
    // Ensure follow_up_date and next_followup_date are forwarded when present
    const payload = {
        inquiry_id: data.inquiry_id,
        counselor_id: data.counselor_id,
        notes: data.notes || null,
        follow_up_date: data.follow_up_date || null,
        next_followup_date: data.next_followup_date || null,
    };
    const response = await api.post('assign-inquiry', payload);
    return response.data;
};

/**
 * Upload documents for an inquiry
 * @param {string} inquiryId
 * @param {FormData} formData - multipart form data with files
 * @returns {Promise<object>}
 */
export const uploadInquiryDocuments = async (inquiryId, formData) => {
    const response = await api.post('upload-inquiry-documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Get branches list
 * @returns {Promise<array>}
 */
export const getBranches = async () => {
    const response = await api.get('branch');
    return response.data;
};

/**
 * Get universities list
 * @returns {Promise<array>}
 */
export const getUniversities = async () => {
    const response = await api.get('universities');
    return response.data;
};

export default {
    // Inquiry
    getInquiries,
    getAllInquiries,
    getInquiryById,
    createInquiry,
    updateInquiry,
    deleteInquiry,
    checkPhoneExists,
    // Lead
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    updatePriority,
    convertToLead,
    updateInquiryDetails,
    deleteLead,
    getCounselorLeads,
    convertLeadToStudent,
    // Follow-up & Notes History
    getFollowUps,
    createFollowUp,
    getFollowUpHistory,
    getNoteHistory,
    createNote,
    updateNote,
    deleteNote,
    createFollowUpHistory,
    updateFollowUpHistory,
    updateFollowUpStatus,
    deleteFollowUpHistory,
    // Assignment & Documents
    assignInquiry,
    uploadInquiryDocuments,
    getBranches,
    getUniversities,
};
