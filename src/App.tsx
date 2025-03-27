
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthProvider';
import { useAuth } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ResetPassword from '@/pages/ResetPassword';
import ConfirmEmail from '@/pages/ConfirmEmail';
import Dashboard from '@/pages/dashboard/Dashboard';
import Schedule from '@/pages/dashboard/Schedule';
import TrainingPlans from '@/pages/dashboard/TrainingPlans';
import Progress from '@/pages/dashboard/Progress';
import Support from '@/pages/dashboard/Support';
import Account from '@/pages/dashboard/Account';
import Settings from '@/pages/dashboard/Settings';
import Payment from '@/pages/dashboard/Payment';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import VerifyEmail from '@/pages/VerifyEmail';
import { startSessionHealthMonitoring } from '@/utils/sessionHealthCheck';

// The App component structure is simplified to ensure proper context management
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

// Protected route components for user and admin routes
const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (isAdmin) {
    console.log("User trying to access user-only route, redirecting to admin dashboard");
    return <Navigate to="/admin" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    console.log("Non-admin trying to access admin-only route, redirecting to user dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// AppRoutes component, within the AuthProvider context
const AppRoutes = () => {
  const { isAuthenticated, isLoading, profile, isInitialized, isAdmin } = useAuth();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  // Start session health monitoring
  useEffect(() => {
    const cleanupMonitoring = startSessionHealthMonitoring();
    return () => cleanupMonitoring();
  }, []);
  
  // Set page as loaded when auth is initialized
  useEffect(() => {
    if (isInitialized) {
      console.log("Auth initialized, setting page as loaded");
      setIsPageLoaded(true);
    }
  }, [isInitialized]);
  
  // Force timeout to prevent infinite loading
  useEffect(() => {
    const forceTimeout = setTimeout(() => {
      if (!isPageLoaded) {
        console.log("Force timeout reached, setting page as loaded anyway");
        setIsPageLoaded(true);
      }
    }, 3000); // Force page load after 3 seconds regardless of auth state
    
    return () => clearTimeout(forceTimeout);
  }, [isPageLoaded]);
  
  // AdminRedirect component, defined within the AuthProvider context
  const AdminRedirect = () => {
    const { isAdmin, isAuthenticated, isLoading } = useAuth();
    
    console.log("AdminRedirect - Checking authentication status:", { 
      isAdmin, 
      isAuthenticated, 
      isLoading,
      profileIsAdmin: profile?.is_admin
    });
    
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#000000]">
          <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (isAdmin) {
      return <Navigate to="/admin/overview" replace />;
    } else {
      console.log("AdminRedirect - Not admin, redirecting to user dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  };
  
  // Loading state with force timeout
  if (isLoading && !isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full mb-4"></div>
          <p className="text-white text-sm">Loading application...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      {/* User dashboard routes - protected with UserRoute */}
      <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
      <Route path="/schedule" element={<UserRoute><Schedule /></UserRoute>} />
      <Route path="/plans" element={<UserRoute><TrainingPlans /></UserRoute>} />
      <Route path="/progress" element={<UserRoute><Progress /></UserRoute>} />
      <Route path="/support" element={<UserRoute><Support /></UserRoute>} />
      <Route path="/account" element={<UserRoute><Account /></UserRoute>} />
      <Route path="/settings" element={<UserRoute><Settings /></UserRoute>} />
      <Route path="/payment" element={<UserRoute><Payment /></UserRoute>} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminRedirect />} />
      <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
