import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Admincontext } from '../Components/context/admincontext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(Admincontext);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
