
import { Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ResetPassword from '@/pages/ResetPassword';
import ConfirmEmail from '@/pages/ConfirmEmail';
import VerifyEmail from '@/pages/VerifyEmail';
import Dashboard from '@/pages/Dashboard';
import DashboardAccount from '@/pages/dashboard/Account';
import DashboardTrainingPlans from '@/pages/dashboard/TrainingPlans';
import DashboardSchedule from '@/pages/dashboard/Schedule';
import DashboardProgress from '@/pages/dashboard/Progress';
import DashboardPayment from '@/pages/dashboard/Payment';
import DashboardSupport from '@/pages/dashboard/Support';
import DashboardSettings from '@/pages/dashboard/Settings';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import NotFound from '@/pages/NotFound';
import Schedule from '@/pages/Schedule';
import Plans from '@/pages/Plans';
import Payment from '@/pages/Payment';
import PaymentPortal from '@/pages/PaymentPortal';
import PlansCatalog from '@/pages/PlansCatalog';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentCancelled from '@/pages/PaymentCancelled';
import { useAuth } from '@/hooks/useAuth';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/plans-catalog" element={<PlansCatalog />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancelled" element={<PaymentCancelled />} />
        
        {/* Protected Routes */}
        <Route path="/payment-portal" element={
          <ProtectedRoute>
            <PaymentPortal />
          </ProtectedRoute>
        } />

        {/* Dashboard Routes - All Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/account" element={
          <ProtectedRoute>
            <DashboardAccount />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/plans" element={
          <ProtectedRoute>
            <DashboardTrainingPlans />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/schedule" element={
          <ProtectedRoute>
            <DashboardSchedule />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/progress" element={
          <ProtectedRoute>
            <DashboardProgress />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/payment" element={
          <ProtectedRoute>
            <DashboardPayment />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/support" element={
          <ProtectedRoute>
            <DashboardSupport />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/settings" element={
          <ProtectedRoute>
            <DashboardSettings />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
