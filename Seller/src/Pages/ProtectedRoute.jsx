import { Navigate, useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { Admincontext } from '../Components/context/admincontext';
import api from '../utils/api';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(Admincontext);
  const location = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(true);

  // Check onboarding status when authenticated
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Skip check if already on onboarding page
      if (location.pathname === '/onboarding') {
        setCheckingOnboarding(false);
        return;
      }

      // Skip check if not authenticated yet
      if (!isAuthenticated || loading) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const { data } = await api.get('/api/seller/onboarding/status');
        if (data.success) {
          setOnboardingComplete(data.data.onboardingCompleted || false);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        // Don't block access if check fails
        setOnboardingComplete(true);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (isAuthenticated && !loading) {
      checkOnboardingStatus();
    } else {
      setCheckingOnboarding(false);
    }
  }, [isAuthenticated, loading, location.pathname]);

  // Show loading spinner while checking auth
  if (loading || checkingOnboarding) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Check cookie (isAuthenticated) for auth
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if not complete (except on onboarding page)
  if (!onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default ProtectedRoute;