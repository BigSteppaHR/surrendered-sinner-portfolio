
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
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminInvoices from '@/pages/admin/AdminInvoices';

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

// AppRoutes component, within the AuthProvider context
const AppRoutes = () => {
  const { isAuthenticated, isLoading, profile, isInitialized } = useAuth();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    if (isInitialized) {
      setIsPageLoaded(true);
    }
  }, [isInitialized]);
  
  // AdminRedirect component, defined within the AuthProvider context
  const AdminRedirect = () => {
    const { isAdmin } = useAuth();
    
    useEffect(() => {
      console.log("AdminRedirect - Checking admin status:", { isAdmin });
      if (isAdmin) {
        console.log("AdminRedirect - Redirecting to admin overview");
        window.location.href = '/admin/overview';
      } else {
        console.log("AdminRedirect - Redirecting to user dashboard");
        window.location.href = '/dashboard';
      }
    }, [isAdmin]);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
      </div>
    );
  };
  
  if (isLoading || !isInitialized || !isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
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
      
      {/* Dashboard routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/plans" element={<TrainingPlans />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/support" element={<Support />} />
      <Route path="/account" element={<Account />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/payment" element={<Payment />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminRedirect />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
      
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
