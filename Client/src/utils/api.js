/**
 * Axios Instance for Client Panel
 * SECURITY: Pure HttpOnly cookie-based authentication
 * - withCredentials: true sends cookies automatically
 */
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:7000",
    withCredentials: true,  // CRITICAL: Send cookies with every request
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
