import React, { createContext, useState } from 'react';

export const Admincontext = createContext();

export const AdminProvider = ({ children }) => {
  const [atoken, setToken] = useState(localStorage.getItem('stoken') || '');

  const backendurl = import.meta.env.VITE_BACKEND_URL;

  const setatoken = (token) => {
    setToken(token);
    if (token) {
      localStorage.setItem('stoken', token);
    } else {
      localStorage.removeItem('stoken');
    }
  };

  return (
    <Admincontext.Provider value={{ backendurl, atoken, setatoken }}>
      {children}
    </Admincontext.Provider>
  );
};

export default AdminProvider;
