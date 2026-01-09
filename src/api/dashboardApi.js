// Dashboard API functions

import api from './index';

/**
 * Get admin dashboard data with optional filters
 * @param {object} filters - { startDate, endDate, country, counselor, status, intake, leadSource }
 * @returns {Promise<object>}
 */
export const getAdminDashboard = async (filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            queryParams.append(key, value);
        }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `dashboard?${queryString}` : 'dashboard';

    const response = await api.get(url);
    return response.data;
};

/**
 * Get dashboard growth and analytics info
 * @returns {Promise<object>}
 */
export const getDashboardInfo = async () => {
    const response = await api.get('dashboardinfo');
    return response.data;
};

/**
 * Get counselor dashboard data
 * @param {string} counselorId 
 * @param {object} filters
 * @returns {Promise<object>}
 */
export const getCounselorDashboard = async (counselorId, filters = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('counselor_id', counselorId);

    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            queryParams.append(key, value);
        }
    });

    const response = await api.get(`getCounselorDashboardData?${queryParams.toString()}`);
    return response.data;
};

/**
 * Get processor dashboard data
 * @param {string} processorId 
 * @returns {Promise<object>}
 */
export const getProcessorDashboard = async (processorId) => {
    const response = await api.get(`processordashboard/${processorId}`);
    return response.data;
};

/**
 * Get master admin dashboard data
 * @returns {Promise<object>}
 */
export const getMasterAdminDashboard = async () => {
    const response = await api.get('masteradmindashboard');
    return response.data;
};

/**
 * Get staff dashboard data
 * @param {string} branch
 * @param {string} createdAt
 * @returns {Promise<object>}
 */
export const getStaffDashboard = async (branch, createdAt) => {
    const queryParams = new URLSearchParams();
    if (branch) queryParams.append('branch', branch);
    if (createdAt) queryParams.append('created_at', createdAt);

    const response = await api.get(`sataffdashboard?${queryParams.toString()}`);
    return response.data;
};

/**
 * Get all counselors
 * @returns {Promise<array>}
 */
export const getCounselors = async () => {
    const response = await api.get('counselor');
    return response.data;
};

export default {
    getAdminDashboard,
    getDashboardInfo,
    getCounselorDashboard,
    getProcessorDashboard,
    getMasterAdminDashboard,
    getStaffDashboard,
    getCounselors,
};
