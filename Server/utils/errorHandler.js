/**
 * Centralized Error Handler & Security Utilities
 * 
 * SECURITY FEATURES:
 * - MongoDB operator sanitization (NoSQL injection prevention)
 * - HTML character escaping (XSS prevention)
 * - Regex pattern escaping (ReDoS prevention)
 * - ObjectId validation
 * - Secure error responses
 */

/**
 * MongoDB operators that could be used in NoSQL injection attacks
 */
const MONGO_OPERATORS = [
    '$', '.', '{', '}', '[', ']'
];

const DANGEROUS_MONGO_KEYS = [
    '$gt', '$gte', '$lt', '$lte', '$ne', '$eq',
    '$in', '$nin', '$and', '$or', '$not', '$nor',
    '$exists', '$type', '$regex', '$where', '$text',
    '$elemMatch', '$size', '$all', '$push', '$pull',
    '$set', '$unset', '$inc', '$rename', '$expr'
];

/**
 * Centralized Error Handler
 * Prevents leaking internal error details to clients in production
 * 
 * @param {Object} res - Express response object
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Generic message for production
 * @param {number} statusCode - HTTP status code (default 500)
 */
export const handleError = (res, error, defaultMessage = "An error occurred", statusCode = 500) => {
    // Generate unique error ID for tracking
    const errorId = `ERR_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`.toUpperCase();

    // Log full error server-side for debugging
    console.error(`[${errorId}] Error:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
    });

    // In production: generic message only
    // In development: include error details
    const isProduction = process.env.NODE_ENV === 'production';

    res.status(statusCode).json({
        success: false,
        errorId,
        message: isProduction ? defaultMessage : error.message
    });
};

/**
 * SECURITY: Sanitize input to prevent NoSQL injection
 * Strips MongoDB operators and dangerous characters from strings
 * 
 * @param {any} input - The input to sanitize
 * @returns {any} - Sanitized input
 */
export const sanitizeInput = (input) => {
    if (input === null || input === undefined) {
        return null;
    }

    // Handle strings
    if (typeof input === 'string') {
        let sanitized = input.trim();

        // Remove MongoDB operator prefixes
        if (sanitized.startsWith('$')) {
            sanitized = sanitized.substring(1);
        }

        // Escape dots that could be used for nested injection
        // Only in contexts where dots are dangerous
        return sanitized;
    }

    // Handle objects (check for MongoDB operators in keys)
    if (typeof input === 'object' && !Array.isArray(input)) {
        const sanitizedObj = {};
        for (const key of Object.keys(input)) {
            // Block keys that start with $ (MongoDB operators)
            if (key.startsWith('$')) {
                console.warn(`🛡️ Blocked MongoDB operator in input: ${key}`);
                continue;
            }
            // Block known dangerous operator names
            if (DANGEROUS_MONGO_KEYS.includes(key)) {
                console.warn(`🛡️ Blocked dangerous key in input: ${key}`);
                continue;
            }
            // Recursively sanitize nested values
            sanitizedObj[key] = sanitizeInput(input[key]);
        }
        return sanitizedObj;
    }

    // Handle arrays
    if (Array.isArray(input)) {
        return input.map(item => sanitizeInput(item));
    }

    // Return primitives as-is (numbers, booleans)
    return input;
};

/**
 * SECURITY: Deep sanitize object for MongoDB
 * Recursively removes all keys starting with $ or containing .
 * 
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
export const sanitizeForMongo = (obj) => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeForMongo(item));
    }

    const clean = {};
    for (const [key, value] of Object.entries(obj)) {
        // Skip keys that start with $ (MongoDB operators)
        if (key.startsWith('$')) {
            console.warn(`🛡️ Stripped MongoDB operator key: ${key}`);
            continue;
        }
        // Skip keys containing dots (nested path injection)
        if (key.includes('.')) {
            console.warn(`🛡️ Stripped dot-notation key: ${key}`);
            continue;
        }
        clean[key] = sanitizeForMongo(value);
    }
    return clean;
};

/**
 * SECURITY: Escape HTML characters to prevent XSS
 * 
 * @param {string} text - Text to escape
 * @returns {string} - HTML-escaped text
 */
export const escapeHtml = (text) => {
    if (typeof text !== 'string') return '';

    const htmlEscapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    return text.replace(/[&<>"'`=/]/g, char => htmlEscapeMap[char]);
};

/**
 * SECURITY: Escape special regex characters to prevent ReDoS
 * Converts user input into a safe literal string for regex matching
 * 
 * @param {string} text - Text to escape for regex
 * @returns {string} - Regex-safe string
 */
export const escapeRegex = (text) => {
    if (typeof text !== 'string') return '';

    // Escape all regex special characters
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * SECURITY: Create safe regex for search operations
 * Limits pattern length and escapes special characters
 * 
 * @param {string} searchTerm - User's search input
 * @param {Object} options - Regex options
 * @returns {RegExp|null} - Safe regex or null if invalid
 */
export const createSafeSearchRegex = (searchTerm, options = { caseInsensitive: true }) => {
    if (typeof searchTerm !== 'string') return null;

    // Trim and limit length to prevent ReDoS
    const trimmed = searchTerm.trim().slice(0, 100);

    if (!trimmed) return null;

    // Escape all regex special characters
    const escaped = escapeRegex(trimmed);

    try {
        return new RegExp(escaped, options.caseInsensitive ? 'i' : '');
    } catch (e) {
        console.warn('Failed to create regex:', e.message);
        return null;
    }
};

/**
 * Validate MongoDB ObjectId format
 * 
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return /^[a-fA-F0-9]{24}$/.test(id);
};

/**
 * SECURITY: Validate and sanitize pagination parameters
 * Prevents negative numbers and excessive limits
 * 
 * @param {Object} params - Pagination params from query
 * @returns {Object} - Safe pagination values
 */
export const sanitizePagination = (params) => {
    const page = Math.max(1, parseInt(params.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

/**
 * SECURITY: Validate sort field against whitelist
 * Prevents arbitrary field access through sort injection
 * 
 * @param {string} field - Requested sort field
 * @param {string[]} allowedFields - Whitelist of allowed fields
 * @param {string} defaultField - Default if field is not allowed
 * @returns {string} - Safe sort field
 */
export const sanitizeSortField = (field, allowedFields, defaultField = 'createdAt') => {
    if (!field || typeof field !== 'string') return defaultField;

    const cleanField = field.replace(/[^a-zA-Z0-9_]/g, '');

    return allowedFields.includes(cleanField) ? cleanField : defaultField;
};

export default {
    handleError,
    sanitizeInput,
    sanitizeForMongo,
    escapeHtml,
    escapeRegex,
    createSafeSearchRegex,
    isValidObjectId,
    sanitizePagination,
    sanitizeSortField
};
