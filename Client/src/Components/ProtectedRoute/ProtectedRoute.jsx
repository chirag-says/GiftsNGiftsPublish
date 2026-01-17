import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/Appcontext';

const ProtectedRoute = ({ children }) => {
    const { isLoggedin, loading } = useContext(AppContext);
    const location = useLocation();

    if (loading) {
        // You can replace this with a proper Loader component
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7d0492]"></div>
            </div>
        );
    }

    if (!isLoggedin) {
        // Redirect to login, but save the current location they were trying to go to
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
