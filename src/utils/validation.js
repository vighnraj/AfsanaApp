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
 * Validate date is in future
 * @param {string} dateString
 * @returns {boolean}
 */
export const validateFutureDate = (dateString) => {
    if (!dateString) return true;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
};

/**
 * Validate number is positive
 * @param {any} value
 * @returns {boolean}
 */
export const validatePositiveNumber = (value) => {
    if (!value && value !== 0) return false;
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
};

/**
 * Validate number is valid
 * @param {any} value
 * @returns {boolean}
 */
export const validateNumber = (value) => {
    if (!value && value !== 0) return false;
    return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Validate passport number format
 * @param {string} passport
 * @returns {boolean}
 */
export const validatePassport = (passport) => {
    if (!passport) return false;
    const cleaned = passport.replace(/[\s\-]/g, '').toUpperCase();
    return /^[A-Z0-9]{6,12}$/.test(cleaned);
};

/**
 * Validate URL format
 * @param {string} url
 * @returns {boolean}
 */
export const validateUrl = (url) => {
    if (!url) return false;
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate age from birth date
 * @param {string} birthDate
 * @param {number} minAge
 * @param {number} maxAge
 * @returns {boolean}
 */
export const validateAge = (birthDate, minAge = 0, maxAge = 120) => {
    if (!validateDate(birthDate)) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= minAge && age <= maxAge;
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

// Pre-built validation schemas for common forms
export const validationSchemas = {
    // Student form validation rules
    student: {
        full_name: {
            required: true,
            requiredMessage: 'Full name is required',
            minLength: 2,
        },
        email: {
            required: true,
            requiredMessage: 'Email is required',
            email: true,
        },
        phone: {
            phone: true,
        },
        dob: {
            custom: (value) => !value || validateNotFutureDate(value),
            customMessage: 'Date of birth cannot be in the future',
        },
    },

    // Lead/Inquiry form validation rules
    lead: {
        name: {
            required: true,
            requiredMessage: 'Name is required',
            minLength: 2,
        },
        email: {
            email: true,
        },
        phone: {
            phone: true,
        },
    },

    // Payment form validation rules
    payment: {
        student_name: {
            required: true,
            requiredMessage: 'Student name is required',
        },
        amount: {
            required: true,
            requiredMessage: 'Amount is required',
            custom: (value) => validatePositiveNumber(value),
            customMessage: 'Amount must be a positive number',
        },
        due_date: {
            custom: (value) => !value || validateDate(value),
            customMessage: 'Please enter a valid date',
        },
    },

    // Visa application validation rules
    visa: {
        student_id: {
            required: true,
            requiredMessage: 'Please select a student',
        },
        country: {
            required: true,
            requiredMessage: 'Country is required',
        },
        visa_type: {
            required: true,
            requiredMessage: 'Visa type is required',
        },
        passport_number: {
            custom: (value) => !value || validatePassport(value),
            customMessage: 'Invalid passport number format',
        },
    },

    // Invoice validation rules
    invoice: {
        student_id: {
            required: true,
            requiredMessage: 'Please select a student',
        },
        amount: {
            required: true,
            requiredMessage: 'Amount is required',
            custom: (value) => validatePositiveNumber(value),
            customMessage: 'Amount must be a positive number',
        },
        due_date: {
            required: true,
            requiredMessage: 'Due date is required',
            custom: (value) => validateFutureDate(value),
            customMessage: 'Due date must be in the future',
        },
    },

    // Profile update validation rules
    profile: {
        full_name: {
            required: true,
            requiredMessage: 'Full name is required',
            minLength: 2,
        },
        email: {
            required: true,
            requiredMessage: 'Email is required',
            email: true,
        },
        phone: {
            phone: true,
        },
    },

    // Admission form validation rules
    admission: {
        full_name: {
            required: true,
            requiredMessage: 'Full name is required',
            minLength: 2,
        },
        email: {
            required: true,
            requiredMessage: 'Email is required',
            email: true,
        },
        phone: {
            required: true,
            requiredMessage: 'Phone number is required',
            phone: true,
        },
        dob: {
            required: true,
            requiredMessage: 'Date of birth is required',
            custom: (value) => validateNotFutureDate(value),
            customMessage: 'Date of birth cannot be in the future',
        },
        country: {
            required: true,
            requiredMessage: 'Country is required',
        },
    },
};

/**
 * Validate form using pre-built schema
 * @param {string} schemaName - Name of the schema
 * @param {object} values - Form values
 * @returns {object} - { isValid, errors }
 */
export const validateWithSchema = (schemaName, values) => {
    const schema = validationSchemas[schemaName];
    if (!schema) {
        console.warn(`Unknown validation schema: ${schemaName}`);
        return { isValid: true, errors: {} };
    }
    return validateForm(values, schema);
};

/**
 * Validate and show toast on error
 * @param {string} schemaName - Name of the schema
 * @param {object} values - Form values
 * @param {object} showToast - Toast function
 * @returns {boolean} - Whether validation passed
 */
export const validateWithToast = (schemaName, values, showToast) => {
    const { isValid, errors } = validateWithSchema(schemaName, values);
    if (!isValid) {
        const firstError = Object.values(errors)[0];
        showToast?.error?.('Validation Error', firstError);
    }
    return isValid;
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
    validateFutureDate,
    validateDate,
    validatePositiveNumber,
    validateNumber,
    validatePassport,
    validateUrl,
    validateAge,
    validateForm,
    validationSchemas,
    validateWithSchema,
    validateWithToast,
};
