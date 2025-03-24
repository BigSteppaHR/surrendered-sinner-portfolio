
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import StripeProvider from "./components/StripeProvider";
import { AuthProvider } from "./components/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Payment from "./pages/Payment";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
import ConfirmEmail from "./pages/ConfirmEmail";
import { useEffect } from "react";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

// Create a navigation handler component that will be inside Router context
const AuthNavigation = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Handle navigation from login/signup actions
    if (location.state?.authRedirect) {
      const { redirectTo, redirectState } = location.state.authRedirect;
      // Clear the state and navigate
      navigate(redirectTo, { state: redirectState, replace: true });
    }
  }, [location.state, navigate]);
  
  return null; // This component doesn't render anything
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
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/api/verify-email" element={<VerifyEmail />} />
                  <Route path="/confirm-email" element={<ConfirmEmail />} />
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
