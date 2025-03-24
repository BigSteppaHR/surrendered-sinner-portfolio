
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { useState, useEffect } from "react";
import StripeProvider from "./components/StripeProvider";
import { AuthProvider } from "./components/AuthProvider";
import EmailVerificationDialog from "./components/email/EmailVerificationDialog";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Payment from "./pages/Payment";
import PaymentPortal from "./pages/PaymentPortal";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

// Create a navigation handler component that will be inside Router context
const AuthNavigation = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  
  useEffect(() => {
    // Handle navigation from login/signup actions
    if (location.state?.authRedirect) {
      const { redirectTo, redirectState } = location.state.authRedirect;
      
      // If redirecting to confirm-email, show dialog instead
      if (redirectTo === "/confirm-email") {
        setVerificationEmail(redirectState?.email || "");
        setShowEmailVerification(true);
        // Clear the state without navigating
        navigate(location.pathname, { replace: true });
      } else {
        // For other redirects, proceed normally
        navigate(redirectTo, { state: redirectState, replace: true });
      }
    }
    
    // If user is at /confirm-email URL directly, show dialog and redirect to home
    if (location.pathname === "/confirm-email") {
      setVerificationEmail(location.state?.email || "");
      setShowEmailVerification(true);
      navigate("/", { replace: true });
    }
  }, [location.pathname, location.state, navigate]);
  
  // Handle closing the verification dialog
  const handleCloseVerification = () => {
    setShowEmailVerification(false);
  };
  
  return (
    <>
      <EmailVerificationDialog 
        isOpen={showEmailVerification} 
        onClose={handleCloseVerification} 
        initialEmail={verificationEmail}
      />
    </>
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
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/payment-portal" element={<PaymentPortal />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  {/* ConfirmEmail route removed - now handled via dialog */}
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
