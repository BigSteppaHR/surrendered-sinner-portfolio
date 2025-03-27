
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/components/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import LandingPage from "@/pages/LandingPage";
import AuthPage from '@/pages/AuthPage';
import Dashboard from "@/pages/dashboard/Dashboard";
import AccountPage from "@/pages/dashboard/AccountPage";
import PlanPage from "@/pages/dashboard/PlanPage";
import SchedulePage from "@/pages/dashboard/SchedulePage";
import ProgressPage from "@/pages/dashboard/ProgressPage";
import Downloads from "@/pages/dashboard/Downloads";
import PaymentPage from "@/pages/dashboard/PaymentPage";
import SupportPage from "@/pages/dashboard/SupportPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import PaymentPortal from "@/pages/PaymentPortal";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentError from "@/pages/PaymentError";
import PaymentProcess from "@/pages/PaymentProcess";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminInvoices from "@/pages/admin/AdminInvoices";
import AdminSettings from "@/pages/admin/AdminSettings";
import CreateInvoice from "@/pages/admin/CreateInvoice";

// Protected route wrapper
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

// Create QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
              <Route path="/forgot-password" element={<AuthPage mode="forgot-password" />} />
              <Route path="/reset-password" element={<AuthPage mode="reset-password" />} />
              
              {/* Payment Routes */}
              <Route path="/payment-portal" element={<ProtectedRoute><PaymentPortal /></ProtectedRoute>} />
              <Route path="/payment-process" element={<ProtectedRoute><PaymentProcess /></ProtectedRoute>} />
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/payment-error" element={<ProtectedRoute><PaymentError /></ProtectedRoute>} />
              
              {/* User Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="/dashboard/plans" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
              <Route path="/dashboard/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
              <Route path="/dashboard/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
              <Route path="/dashboard/downloads" element={<ProtectedRoute><Downloads /></ProtectedRoute>} />
              <Route path="/dashboard/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
              <Route path="/dashboard/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
