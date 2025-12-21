/**
 * Centralized Error Handler Utility
 * Prevents leaking internal error details to clients in production
 */

export const handleError = (res, error, defaultMessage = "An error occurred") => {
    // Log full error server-side for debugging
    console.error("Error:", error);

    // Send generic message to client in production
    const clientMessage = process.env.NODE_ENV === 'production'
        ? defaultMessage
        : error.message;

    res.status(500).json({
        success: false,
        message: clientMessage
    });
};

/**
 * Input sanitization helper
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return null;
    return input.trim();
};

/**
 * Validate MongoDB ObjectId format
 */
export const isValidObjectId = (id) => {
    if (!id || typeof id !== 'string') return false;
    return /^[a-fA-F0-9]{24}$/.test(id);
};

export default { handleError, sanitizeInput, isValidObjectId };
