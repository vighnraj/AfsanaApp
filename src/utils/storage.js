// Secure Storage Helper Functions

import * as SecureStore from 'expo-secure-store';

// Keys for stored data
const KEYS = {
    AUTH_TOKEN: 'authToken',
    ROLE: 'role',
    USER_ID: 'user_id',
    STUDENT_ID: 'student_id',
    COUNSELOR_ID: 'counselor_id',
    LOGIN_DETAIL: 'login_detail',
    PERMISSIONS: 'permissions',
    USER_PERMISSIONS: 'userpermissions',
    LAST_ACTIVE: 'lastActiveAt',
    FCM_TOKEN: 'fcm_token',
};

/**
 * Save a string value to secure storage
 * @param {string} key 
 * @param {string} value 
 */
export const saveItem = async (key, value) => {
    try {
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
        throw error;
    }
};

/**
 * Get a string value from secure storage
 * @param {string} key 
 * @returns {Promise<string|null>}
 */
export const getItem = async (key) => {
    try {
        return await SecureStore.getItemAsync(key);
    } catch (error) {
        console.error(`Error getting ${key}:`, error);
        return null;
    }
};

/**
 * Remove an item from secure storage
 * @param {string} key 
 */
export const removeItem = async (key) => {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        console.error(`Error removing ${key}:`, error);
        throw error;
    }
};

/**
 * Save an object as JSON string
 * @param {string} key 
 * @param {object} value 
 */
export const saveObject = async (key, value) => {
    try {
        await SecureStore.setItemAsync(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving object ${key}:`, error);
        throw error;
    }
};

/**
 * Get an object from JSON string
 * @param {string} key 
 * @returns {Promise<object|null>}
 */
export const getObject = async (key) => {
    try {
        const value = await SecureStore.getItemAsync(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`Error getting object ${key}:`, error);
        return null;
    }
};

/**
 * Clear all auth-related data
 */
export const clearAll = async () => {
    try {
        await Promise.all([
            SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN),
            SecureStore.deleteItemAsync(KEYS.ROLE),
            SecureStore.deleteItemAsync(KEYS.USER_ID),
            SecureStore.deleteItemAsync(KEYS.STUDENT_ID),
            SecureStore.deleteItemAsync(KEYS.COUNSELOR_ID),
            SecureStore.deleteItemAsync(KEYS.LOGIN_DETAIL),
            SecureStore.deleteItemAsync(KEYS.PERMISSIONS),
            SecureStore.deleteItemAsync(KEYS.USER_PERMISSIONS),
            SecureStore.deleteItemAsync(KEYS.LAST_ACTIVE),
        ]);
    } catch (error) {
        console.error('Error clearing storage:', error);
        throw error;
    }
};

// Specific token functions
export const saveToken = (token) => saveItem(KEYS.AUTH_TOKEN, token);
export const getToken = () => getItem(KEYS.AUTH_TOKEN);
export const removeToken = () => removeItem(KEYS.AUTH_TOKEN);

// User data functions
export const saveUserData = (user) => saveObject(KEYS.LOGIN_DETAIL, user);
export const getUserData = () => getObject(KEYS.LOGIN_DETAIL);

// Role functions
export const saveRole = (role) => saveItem(KEYS.ROLE, role);
export const getRole = () => getItem(KEYS.ROLE);

// ID functions
export const saveUserId = (id) => saveItem(KEYS.USER_ID, String(id));
export const getUserId = () => getItem(KEYS.USER_ID);

export const saveStudentId = (id) => saveItem(KEYS.STUDENT_ID, String(id));
export const getStudentId = () => getItem(KEYS.STUDENT_ID);

export const saveCounselorId = (id) => saveItem(KEYS.COUNSELOR_ID, String(id));
export const getCounselorId = () => getItem(KEYS.COUNSELOR_ID);

// Permission functions
export const savePermissions = (permissions) => saveObject(KEYS.PERMISSIONS, permissions);
export const getPermissions = () => getObject(KEYS.PERMISSIONS);

export const saveUserPermissions = (permissions) => saveObject(KEYS.USER_PERMISSIONS, permissions);
export const getUserPermissions = () => getObject(KEYS.USER_PERMISSIONS);

// Last active (for session management)
export const updateLastActive = () => saveItem(KEYS.LAST_ACTIVE, Date.now().toString());
export const getLastActive = () => getItem(KEYS.LAST_ACTIVE);

export { KEYS };

export default {
    saveItem,
    getItem,
    removeItem,
    saveObject,
    getObject,
    clearAll,
    KEYS,
};
