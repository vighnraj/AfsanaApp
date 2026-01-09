// API Configuration - Base URL and Axios Instance
// Mirrors the web frontend's interceptors/axiosInterceptor.js

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL for API calls - Same as web frontend
export const BASE_URL = 'https://afsana-backend-production-0897.up.railway.app/api/';

// Token keys
const TOKEN_KEY = 'authToken';
const LAST_ACTIVE_KEY = 'lastActiveAt';
const IDLE_LIMIT_MS = 10 * 60 * 1000; // 10 minutes idle timeout

// Create axios instance
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to get token from secure storage
const getToken = async () => {
    try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

// Helper to update last active timestamp
const updateLastActive = async () => {
    try {
        await SecureStore.setItemAsync(LAST_ACTIVE_KEY, Date.now().toString());
    } catch (error) {
        console.error('Error updating last active:', error);
    }
};

// Helper to clear auth data on logout
export const clearAuthData = async () => {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(LAST_ACTIVE_KEY);
        await SecureStore.deleteItemAsync('role');
        await SecureStore.deleteItemAsync('user_id');
        await SecureStore.deleteItemAsync('student_id');
        await SecureStore.deleteItemAsync('counselor_id');
        await SecureStore.deleteItemAsync('login_detail');
        await SecureStore.deleteItemAsync('permissions');
        await SecureStore.deleteItemAsync('userpermissions');
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
};

// Request interceptor - attach token to all requests
api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // Update last active on each request
        await updateLastActive();
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Clear auth data and let the app handle redirect
            await clearAuthData();
            // The AuthContext will detect this and redirect to login
        }
        return Promise.reject(error);
    }
);

// Check for idle timeout
export const checkIdleTimeout = async () => {
    try {
        const lastActive = await SecureStore.getItemAsync(LAST_ACTIVE_KEY);
        if (lastActive) {
            const elapsed = Date.now() - Number(lastActive);
            if (elapsed >= IDLE_LIMIT_MS) {
                await clearAuthData();
                return true; // Session expired
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking idle timeout:', error);
        return false;
    }
};

export default api;
