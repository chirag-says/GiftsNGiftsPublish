/**
 * Axios Instance for Client Panel
 * SECURITY: Pure HttpOnly cookie-based authentication
 * - withCredentials: true sends cookies automatically
 * 
 * SECURITY FIX: Removed localhost fallback to prevent production leaks
 */
import axios from 'axios';

// SECURITY: Fail fast if backend URL is not configured
const backendUrl = import.meta.env.VITE_BACKEND_URL;

if (!backendUrl) {
    // In production, this is a critical configuration error
    const errorMessage = 'CRITICAL: VITE_BACKEND_URL environment variable is not defined. ' +
        'This is required for API communication. ' +
        'Please set VITE_BACKEND_URL in your .env file or environment variables.';

    if (import.meta.env.PROD) {
        // In production, throw to prevent the app from making localhost requests
        throw new Error(errorMessage);
    } else {
        // In development, warn loudly but allow localhost fallback
        console.error('⚠️ ' + errorMessage);
        console.warn('⚠️ Falling back to http://localhost:7000 for development only');
    }
}

const api = axios.create({
    baseURL: backendUrl || (import.meta.env.DEV ? "http://localhost:7000" : undefined),
    withCredentials: true,  // CRITICAL: Send cookies with every request
    headers: {
        'Content-Type': 'application/json',
    },
});

// SECURITY: Verify baseURL is set in production
if (import.meta.env.PROD && !api.defaults.baseURL) {
    throw new Error('CRITICAL: API baseURL is not configured for production');
}

export default api;
