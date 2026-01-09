// Branch Management API functions

import api from './index';

/**
 * Get all branches
 * @returns {Promise<array>}
 */
export const getAllBranches = async () => {
    const response = await api.get('branch');
    return response.data;
};

/**
 * Get branch by ID
 * @param {number} id - Branch ID
 * @returns {Promise<object>}
 */
export const getBranchById = async (id) => {
    const response = await api.get(`branch/${id}`);
    return response.data;
};

/**
 * Create new branch
 * @param {object} data - Branch data
 * @returns {Promise<object>}
 */
export const createBranch = async (data) => {
    const response = await api.post('branch', data);
    return response.data;
};

/**
 * Update branch
 * @param {number} id - Branch ID
 * @param {object} data - Branch data
 * @returns {Promise<object>}
 */
export const updateBranch = async (id, data) => {
    const response = await api.put(`branch/${id}`, data);
    return response.data;
};

/**
 * Delete branch
 * @param {number} id - Branch ID
 * @returns {Promise<object>}
 */
export const deleteBranch = async (id) => {
    const response = await api.delete(`branch/${id}`);
    return response.data;
};

export default {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
};
