
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import Admincontextprovider from './Components/context/admincontext.jsx'
import { ToastContainer } from 'react-toastify'

// ========== GLOBAL AXIOS CONFIGURATION ==========
// SECURITY: HttpOnly cookie-based authentication
// - withCredentials: true sends cookies with every request
// - NO localStorage/header token fallback - pure cookie auth
axios.defaults.withCredentials = true;

// Response interceptor - handle 401 errors (session expired)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any legacy localStorage items
      localStorage.removeItem('stoken');

      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
// ================================================

createRoot(document.getElementById('root')).render(

  <Admincontextprovider>
    <ToastContainer />
    <App />
  </Admincontextprovider>

)


