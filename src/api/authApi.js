// Authentication API functions

import api, { BASE_URL, clearAuthData } from './index';
import * as SecureStore from 'expo-secure-store';

/**
 * Login user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} - { token, user }
 */
export const login = async (email, password) => {
    const response = await api.post('auth/login', { email, password });
    return response.data;
};

/**
 * Signup new student
 * @param {string} fullName 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>}
 */
export const signup = async (fullName, email, password) => {
    const payload = {
        email,
        password,
        full_name: fullName,
        role: 'student',
    };
    const response = await api.post('auth/createStudent', payload);
    return response.data;
};

/**
 * Request password reset
 * @param {string} email 
 * @returns {Promise<object>}
 */
export const forgotPassword = async (email) => {
    const response = await api.post('auth/forgot-password', { email });
    return response.data;
};

/**
 * Reset password with token
 * @param {string} token 
 * @param {string} newPassword 
 * @returns {Promise<object>}
 */
export const resetPassword = async (token, newPassword) => {
    const response = await api.post('auth/reset-password', { token, password: newPassword });
    return response.data;
};

/**
 * Get permissions for a role
 * @param {string} roleName 
 * @returns {Promise<object>}
 */
export const getPermissions = async (roleName) => {
    const response = await api.get(`permission?role_name=${roleName}`);
    return response.data;
};

/**
 * Get user-specific permissions
 * @param {string} userId 
 * @returns {Promise<object>}
 */
export const getUserPermissions = async (userId) => {
    const response = await api.get(`permissions?user_id=${userId}`);
    return response.data;
};

/**
 * Save a value to secure storage, automatically chunking if it's too large (2048 byte limit on Android)
 * @param {string} key 
 * @param {string} value 
 */
const setItemLarge = async (key, value) => {
    try {
        if (value.length <= 2000) {
            await SecureStore.setItemAsync(key, value);
            await SecureStore.deleteItemAsync(`${key}_chunks`); // Clean up old chunks if any
            return;
        }

        const chunks = [];
        for (let i = 0; i < value.length; i += 2000) {
            chunks.push(value.slice(i, i + 2000));
        }

        for (let i = 0; i < chunks.length; i++) {
            await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
        }
        await SecureStore.setItemAsync(`${key}_chunks`, String(chunks.length));
        await SecureStore.deleteItemAsync(key); // Clean up old single item
    } catch (err) {
        console.error(`Error saving large item ${key}:`, err);
    }
};

/**
 * Get a value from secure storage, reconstructing it from chunks if necessary
 * @param {string} key 
 * @returns {Promise<string|null>}
 */
const getItemLarge = async (key) => {
    try {
        const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
        if (!chunkCountStr) {
            return await SecureStore.getItemAsync(key);
        }

        const count = parseInt(chunkCountStr, 10);
        let result = '';
        for (let i = 0; i < count; i++) {
            const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
            if (chunk) result += chunk;
        }
        return result;
    } catch (err) {
        console.error(`Error getting large item ${key}:`, err);
        return null;
    }
};

/**
 * Delete a large item from secure storage
 * @param {string} key 
 */
const deleteItemLarge = async (key) => {
    const chunkCountStr = await SecureStore.getItemAsync(`${key}_chunks`);
    if (chunkCountStr) {
        const count = parseInt(chunkCountStr, 10);
        for (let i = 0; i < count; i++) {
            await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
        await SecureStore.deleteItemAsync(`${key}_chunks`);
    }
    await SecureStore.deleteItemAsync(key);
};

/**
 * Save authentication data to secure storage
 * @param {object} user 
 * @param {string} token 
 */
export const saveAuthData = async (user, token) => {
    try {
        await SecureStore.setItemAsync('authToken', token);
        await SecureStore.setItemAsync('role', user.role);
        await SecureStore.setItemAsync('user_id', String(user.id));

        // Use chunked storage for potentially large JSON strings
        await setItemLarge('login_detail', JSON.stringify(user));

        if (user.student_id) {
            await SecureStore.setItemAsync('student_id', String(user.student_id));
        }
        if (user.counselor_id) {
            await SecureStore.setItemAsync('counselor_id', String(user.counselor_id));
        }

        // Fetch and save permissions
        const permissions = await getPermissions(user.role);
        const userPermissions = await getUserPermissions(user.id);

        await setItemLarge('permissions', JSON.stringify(permissions));
        await setItemLarge('userpermissions', JSON.stringify(userPermissions));

        // Set last active timestamp
        await SecureStore.setItemAsync('lastActiveAt', Date.now().toString());
    } catch (error) {
        console.error('Error saving auth data:', error);
        throw error;
    }
};

/**
 * Get stored authentication data
 * @returns {Promise<object|null>}
 */
export const getStoredAuthData = async () => {
    try {
        const token = await SecureStore.getItemAsync('authToken');
        const role = await SecureStore.getItemAsync('role');
        const userId = await SecureStore.getItemAsync('user_id');
        const loginDetail = await getItemLarge('login_detail');
        const studentId = await SecureStore.getItemAsync('student_id');
        const counselorId = await SecureStore.getItemAsync('counselor_id');
        const permissions = await getItemLarge('permissions');
        const userPermissions = await getItemLarge('userpermissions');

        if (!token || !role) {
            return null;
        }

        return {
            token,
            role,
            userId,
            studentId,
            counselorId,
            user: loginDetail ? JSON.parse(loginDetail) : null,
            permissions: permissions ? JSON.parse(permissions) : [],
            userPermissions: userPermissions ? JSON.parse(userPermissions) : [],
        };
    } catch (error) {
        console.error('Error getting stored auth data:', error);
        return null;
    }
};

/**
 * Logout user - clear all stored data
 */
export const logout = async () => {
    await clearAuthData();
    // Also clean up chunked data
    await deleteItemLarge('login_detail');
    await deleteItemLarge('permissions');
    await deleteItemLarge('userpermissions');
};

export default {
    login,
    signup,
    forgotPassword,
    resetPassword,
    getPermissions,
    getUserPermissions,
    saveAuthData,
    getStoredAuthData,
    logout,
};
