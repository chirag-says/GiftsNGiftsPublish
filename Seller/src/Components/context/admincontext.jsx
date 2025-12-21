import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// SECURITY: Configure axios to send cookies with every request
axios.defaults.withCredentials = true;

export const Admincontext = createContext();

export const AdminProvider = ({ children }) => {
  // Auth state - no localStorage, server cookie is the source of truth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendurl = import.meta.env.VITE_BACKEND_URL;

  /**
   * Check if seller is logged in by calling /api/seller/is-authenticated
   * This replaces localStorage.getItem('stoken') check
   * The server will verify the HttpOnly cookie
   */
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendurl}/api/seller/is-authenticated`);

      if (data.success) {
        setIsAuthenticated(true);
        if (data.seller) {
          setSellerData(data.seller);
        }
      } else {
        setIsAuthenticated(false);
        setSellerData(null);
      }
    } catch (error) {
      // 401 means not logged in - this is expected for guests
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        setSellerData(null);
      } else {
        console.error('Auth check failed:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [backendurl]);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Called after successful login
   * Sets auth state and seller data
   */
  const onLoginSuccess = useCallback((userData) => {
    setIsAuthenticated(true);
    if (userData) {
      setSellerData(userData);
    }
  }, []);

  /**
   * Logout - calls server to clear the HttpOnly cookie
   */
  const logout = useCallback(async () => {
    try {
      await axios.post(`${backendurl}/api/seller/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of server response
      setIsAuthenticated(false);
      setSellerData(null);

      // Clean up any legacy localStorage items
      localStorage.removeItem('stoken');
    }
  }, [backendurl]);

  return (
    <Admincontext.Provider value={{
      backendurl,
      isAuthenticated,
      sellerData,
      setSellerData,
      loading,
      logout,
      onLoginSuccess,
      checkAuth,
      // Legacy compatibility (will be removed)
      atoken: isAuthenticated ? 'cookie-auth' : '',
      setatoken: () => console.warn('setatoken is deprecated - using cookie auth')
    }}>
      {children}
    </Admincontext.Provider>
  );
};

export default AdminProvider;


