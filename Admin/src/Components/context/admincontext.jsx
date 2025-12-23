import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

export const Admincontext = createContext();

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/api/admin/account/profile')
          .then(() => setAuthenticated(true))
          .catch(() => setAuthenticated(false));
      } catch (error) {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const backendurl = import.meta.env.VITE_BACKEND_URL;

  /**
   * Logout - calls server to clear the HttpOnly cookie
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/api/admin/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthenticated(false);
      // Clean up any legacy localStorage items
      localStorage.removeItem('atoken');
      localStorage.removeItem('adminName');
      localStorage.removeItem('name');
    }
  }, []);

  return (
    <Admincontext.Provider value={{
      backendurl,
      isAuthenticated,
      setAuthenticated,
      loading,
      logout,
      // Legacy compatibility (will be removed)
      atoken: isAuthenticated ? 'cookie-auth' : '',
      setatoken: () => console.warn('setatoken is deprecated - using cookie auth')
    }}>
      {children}
    </Admincontext.Provider>
  );
};

export default AdminProvider;
