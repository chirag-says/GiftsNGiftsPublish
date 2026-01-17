/**
 * Axios Instance for Admin Panel
 * SECURITY: Pure HttpOnly cookie-based authentication
 * - withCredentials: true sends cookies automatically
 * - NO localStorage/header token usage
 */
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,  // CRITICAL: Send cookies with every request
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login on auth failure
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
