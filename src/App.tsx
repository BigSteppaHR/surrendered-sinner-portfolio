
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from "react";
import StripeProvider from "./components/StripeProvider";
import { AuthProvider } from "./components/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Payment from "./pages/Payment";
import PaymentPortal from "./pages/PaymentPortal";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ConfirmEmail from "./pages/ConfirmEmail";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

// Create a navigation handler component that will be inside Router context
const AuthNavigation = () => {
  const { isInitialized } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Clear any state that might cause UI issues when navigating
    if (location.pathname !== '/confirm-email' && location.state?.email) {
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.pathname, location.state]);
  
  // Only return a component when auth is initialized
  return isInitialized ? null : (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <AuthNavigation />
            <StripeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/confirm-email" element={<ConfirmEmail />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/payment-portal" element={<PaymentPortal />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  {/* Redirect /auth to /login for backward compatibility */}
                  <Route path="/auth" element={<Navigate to="/login" replace />} />
                  <Route path="/admin/*" element={<AdminDashboard />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </StripeProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
