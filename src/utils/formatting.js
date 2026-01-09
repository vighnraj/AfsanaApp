// Formatting Utilities

/**
 * Format date to DD-MM-YYYY
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
};

/**
 * Format date to YYYY-MM-DD (for API)
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDateForApi = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    return d.toISOString().split('T')[0];
};

/**
 * Format date to readable format (e.g., "Jan 15, 2024")
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDateReadable = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
};

/**
 * Format datetime to readable format
 * @param {string|Date} datetime 
 * @returns {string}
 */
export const formatDateTime = (datetime) => {
    if (!datetime) return '';
    const d = new Date(datetime);
    if (isNaN(d.getTime())) return '';

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return d.toLocaleDateString('en-US', options);
};

/**
 * Format number with commas
 * @param {number} num 
 * @returns {string}
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format currency
 * @param {number} amount 
 * @param {string} currency 
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return '$0.00';

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

/**
 * Format percentage
 * @param {number} value 
 * @param {number} decimals 
 * @returns {string}
 */
export const formatPercentage = (value, decimals = 2) => {
    if (value === null || value === undefined) return '0%';
    return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter
 * @param {string} text 
 * @returns {string}
 */
export const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Convert status to display text
 * @param {string} status 
 * @returns {string}
 */
export const formatStatus = (status) => {
    if (!status) return '';
    return status
        .split('_')
        .map(word => capitalize(word))
        .join(' ');
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} date 
 * @returns {string}
 */
export const getRelativeTime = (date) => {
    if (!date) return '';

    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    return formatDateReadable(date);
};

/**
 * Get initials from full name
 * @param {string} name 
 * @returns {string}
 */
export const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export default {
    formatDate,
    formatDateForApi,
    formatDateReadable,
    formatDateTime,
    formatNumber,
    formatCurrency,
    formatPercentage,
    truncateText,
    capitalize,
    formatStatus,
    getRelativeTime,
    getInitials,
};
