// Authentication Context - Manages user authentication state globally

import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, saveAuthData, getStoredAuthData, logout as apiLogout } from '../api/authApi';
import { checkIdleTimeout } from '../api';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for existing session on app start
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check for idle timeout first
                const isExpired = await checkIdleTimeout();
                if (isExpired) {
                    setLoading(false);
                    return;
                }

                // Get stored auth data
                const authData = await getStoredAuthData();

                if (authData && authData.token && authData.role) {
                    setToken(authData.token);
                    setRole(authData.role);
                    setUser(authData.user);
                    setPermissions(authData.permissions || []);
                    setUserPermissions(authData.userPermissions || []);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await apiLogin(email, password);
            const { token: authToken, user: userData } = response;

            if (authToken && userData) {
                // Save to secure storage
                await saveAuthData(userData, authToken);

                // Update state
                setToken(authToken);
                setRole(userData.role);
                setUser(userData);
                setIsAuthenticated(true);

                // Fetch and set permissions
                const authData = await getStoredAuthData();
                if (authData) {
                    setPermissions(authData.permissions || []);
                    setUserPermissions(authData.userPermissions || []);
                }

                return { success: true, role: userData.role };
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Signup function
    const signup = async (fullName, email, password) => {
        try {
            const response = await apiSignup(fullName, email, password);
            return { success: true, data: response };
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await apiLogout();
            setUser(null);
            setToken(null);
            setRole(null);
            setPermissions([]);
            setUserPermissions([]);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear state even if API call fails
            setUser(null);
            setToken(null);
            setRole(null);
            setPermissions([]);
            setUserPermissions([]);
            setIsAuthenticated(false);
        }
    };

    // Check if user has a specific permission
    const hasPermission = (permissionName, action = 'view') => {
        const permission = userPermissions.find(p => p.permission_name === permissionName);
        if (!permission) return false;

        switch (action) {
            case 'view':
                return permission.view_permission === 1;
            case 'add':
                return permission.add_permission === 1;
            case 'edit':
                return permission.edit_permission === 1;
            case 'delete':
                return permission.delete_permission === 1;
            default:
                return false;
        }
    };

    // Get dashboard route based on role
    const getDashboardRoute = () => {
        switch (role) {
            case 'admin':
                return 'AdminDashboard';
            case 'student':
                return 'StudentDashboard';
            case 'counselor':
                return 'CounselorDashboard';
            case 'staff':
                return 'StaffDashboard';
            case 'processors':
                return 'ProcessorDashboard';
            case 'masteradmin':
                return 'MasterAdminDashboard';
            default:
                return 'Login';
        }
    };

    const value = {
        user,
        token,
        role,
        permissions,
        userPermissions,
        loading,
        isAuthenticated,
        login,
        signup,
        logout,
        hasPermission,
        getDashboardRoute,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
