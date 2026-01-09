// Permission Checking Utilities

import { getUserPermissions } from './storage';

/**
 * Check if user has permission for a specific action
 * @param {string} permissionName - Name of the permission
 * @param {string} action - 'view', 'add', 'edit', 'delete'
 * @param {array} userPermissions - User's permissions array
 * @returns {boolean}
 */
export const hasPermission = (permissionName, action = 'view', userPermissions = []) => {
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

/**
 * Check view permission
 * @param {string} permissionName
 * @param {array} userPermissions
 * @returns {boolean}
 */
export const canView = (permissionName, userPermissions) => {
    return hasPermission(permissionName, 'view', userPermissions);
};

/**
 * Check add permission
 * @param {string} permissionName
 * @param {array} userPermissions
 * @returns {boolean}
 */
export const canAdd = (permissionName, userPermissions) => {
    return hasPermission(permissionName, 'add', userPermissions);
};

/**
 * Check edit permission
 * @param {string} permissionName
 * @param {array} userPermissions
 * @returns {boolean}
 */
export const canEdit = (permissionName, userPermissions) => {
    return hasPermission(permissionName, 'edit', userPermissions);
};

/**
 * Check delete permission
 * @param {string} permissionName
 * @param {array} userPermissions
 * @returns {boolean}
 */
export const canDelete = (permissionName, userPermissions) => {
    return hasPermission(permissionName, 'delete', userPermissions);
};

/**
 * Get all permissions for a specific module
 * @param {string} permissionName
 * @param {array} userPermissions
 * @returns {object} - { canView, canAdd, canEdit, canDelete }
 */
export const getModulePermissions = (permissionName, userPermissions = []) => {
    const permission = userPermissions.find(p => p.permission_name === permissionName);

    if (!permission) {
        return {
            canView: false,
            canAdd: false,
            canEdit: false,
            canDelete: false,
        };
    }

    return {
        canView: permission.view_permission === 1,
        canAdd: permission.add_permission === 1,
        canEdit: permission.edit_permission === 1,
        canDelete: permission.delete_permission === 1,
    };
};

/**
 * Filter menu items based on permissions
 * @param {array} menuItems - Array of menu items
 * @param {array} userPermissions - User's permissions
 * @returns {array} - Filtered menu items
 */
export const filterMenuByPermissions = (menuItems, userPermissions = []) => {
    return menuItems.filter((item) => {
        // If no permission required, show the item
        if (!item.permission) return true;

        // Check if user has view permission for this item
        return hasPermission(item.permission, 'view', userPermissions);
    });
};

/**
 * Permission names used in the system
 */
export const PERMISSION_NAMES = {
    INQUIRY: 'Inquiry',
    LEAD: 'Lead',
    STUDENT: 'Student',
    COUNSELOR: 'Counselor',
    STAFF: 'Staff',
    PROCESSOR: 'Processor',
    TASK: 'Task',
    PAYMENT: 'Payments & Invoices',
    UNIVERSITY: 'University',
    APPLICATION: 'Application',
    ROLES: 'Roles & Permissions',
    VISA: 'Visa Processing',
};

export default {
    hasPermission,
    canView,
    canAdd,
    canEdit,
    canDelete,
    getModulePermissions,
    filterMenuByPermissions,
    PERMISSION_NAMES,
};
