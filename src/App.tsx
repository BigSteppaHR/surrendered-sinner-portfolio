import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import HomePage from '@/pages/HomePage';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ResetPassword from '@/pages/ResetPassword';
import ConfirmEmail from '@/pages/ConfirmEmail';
import Dashboard from '@/pages/dashboard/Dashboard';
import Schedule from '@/pages/dashboard/Schedule';
import Plans from '@/pages/dashboard/Plans';
import Progress from '@/pages/dashboard/Progress';
import Support from '@/pages/dashboard/Support';
import Account from '@/pages/dashboard/Account';
import Settings from '@/pages/dashboard/Settings';
import Payment from '@/pages/dashboard/Payment';
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminSessions from '@/pages/admin/AdminSessions';
import AdminQuotes from '@/pages/admin/AdminQuotes';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminInvoices from '@/pages/admin/AdminInvoices';
import AdminTickets from '@/pages/admin/AdminTickets';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSettings from '@/pages/admin/AdminSettings';

const AdminRedirect = () => {
  const { profile } = useAuth();
  
  useEffect(() => {
    if (profile?.is_admin) {
      window.location.href = '/admin/overview';
    } else {
      window.location.href = '/dashboard';
    }
  }, [profile]);
  
  return null;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoading, profile, isInitialized } = useAuth();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    if (isInitialized) {
      setIsPageLoaded(true);
    }
  }, [isInitialized]);
  
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
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      
      {/* Dashboard routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/progress" element={<Progress />} />
      <Route path="/support" element={<Support />} />
      <Route path="/account" element={<Account />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/payment" element={<Payment />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminRedirect />} />
      <Route path="/admin/overview" element={<AdminOverview />} />
      <Route path="/admin/sessions" element={<AdminSessions />} />
      <Route path="/admin/quotes" element={<AdminQuotes />} />
      <Route path="/admin/payments" element={<AdminPayments />} />
      <Route path="/admin/invoices" element={<AdminInvoices />} />
      <Route path="/admin/tickets" element={<AdminTickets />} />
      <Route path="/admin/notifications" element={<AdminNotifications />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
