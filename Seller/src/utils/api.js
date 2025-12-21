/**
 * Axios Instance for Seller Panel
 * - Automatically includes credentials (cookies)
 * - No need to pass stoken header manually
 * - Backend reads from cookie OR header (backward compat)
 */
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,  // CRITICAL: Send cookies with every request
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add token from localStorage as fallback
api.interceptors.request.use(
    (config) => {
        // For backward compatibility, still send header if token exists
        const token = localStorage.getItem('stoken');
        if (token) {
            config.headers.stoken = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('stoken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
