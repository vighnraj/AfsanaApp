// Form Validation Utilities

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export const validateEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone 
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
    if (!phone) return false;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Check if a value is not empty
 * @param {any} value 
 * @returns {boolean}
 */
export const validateRequired = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

/**
 * Validate minimum length
 * @param {string} value 
 * @param {number} minLength 
 * @returns {boolean}
 */
export const validateMinLength = (value, minLength) => {
    if (!value) return false;
    return value.length >= minLength;
};

/**
 * Validate maximum length
 * @param {string} value 
 * @param {number} maxLength 
 * @returns {boolean}
 */
export const validateMaxLength = (value, maxLength) => {
    if (!value) return true;
    return value.length <= maxLength;
};

/**
 * Validate password strength
 * @param {string} password 
 * @returns {object} - { valid, message }
 */
export const validatePassword = (password) => {
    if (!password) {
        return { valid: false, message: 'Password is required' };
    }
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true, message: '' };
};

/**
 * Validate passwords match
 * @param {string} password 
 * @param {string} confirmPassword 
 * @returns {boolean}
 */
export const validatePasswordMatch = (password, confirmPassword) => {
    return password === confirmPassword;
};

/**
 * Validate date is not in future
 * @param {string} dateString 
 * @returns {boolean}
 */
export const validateNotFutureDate = (dateString) => {
    if (!dateString) return true;
    const date = new Date(dateString);
    const today = new Date();
    return date <= today;
};

/**
 * Validate date is valid format
 * @param {string} dateString 
 * @returns {boolean}
 */
export const validateDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

/**
 * Validate form with rules
 * @param {object} values - Form values
 * @param {object} rules - Validation rules
 * @returns {object} - { isValid, errors }
 */
export const validateForm = (values, rules) => {
    const errors = {};
    let isValid = true;

    Object.keys(rules).forEach((field) => {
        const fieldRules = rules[field];
        const value = values[field];

        // Required check
        if (fieldRules.required && !validateRequired(value)) {
            errors[field] = fieldRules.requiredMessage || `${field} is required`;
            isValid = false;
            return;
        }

        // Email check
        if (fieldRules.email && value && !validateEmail(value)) {
            errors[field] = 'Please enter a valid email';
            isValid = false;
            return;
        }

        // Phone check
        if (fieldRules.phone && value && !validatePhone(value)) {
            errors[field] = 'Please enter a valid phone number';
            isValid = false;
            return;
        }

        // Min length check
        if (fieldRules.minLength && value && !validateMinLength(value, fieldRules.minLength)) {
            errors[field] = `Minimum ${fieldRules.minLength} characters required`;
            isValid = false;
            return;
        }

        // Max length check
        if (fieldRules.maxLength && value && !validateMaxLength(value, fieldRules.maxLength)) {
            errors[field] = `Maximum ${fieldRules.maxLength} characters allowed`;
            isValid = false;
            return;
        }

        // Custom validation
        if (fieldRules.custom && !fieldRules.custom(value, values)) {
            errors[field] = fieldRules.customMessage || `${field} is invalid`;
            isValid = false;
            return;
        }
    });

    return { isValid, errors };
};

export default {
    validateEmail,
    validatePhone,
    validateRequired,
    validateMinLength,
    validateMaxLength,
    validatePassword,
    validatePasswordMatch,
    validateNotFutureDate,
    validateDate,
    validateForm,
};
