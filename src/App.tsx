
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { useEffect, useRef, useState } from "react";
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
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Progress from "./pages/Progress";
import Account from "./pages/Account";
import TrainingPlans from "./pages/TrainingPlans";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a navigation handler component that will be inside Router context
// AND inside AuthProvider context
const AuthNavigation = () => {
  const { isInitialized } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const processingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Clean up expired temp credentials on app load
  useEffect(() => {
    try {
      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Check if it's a temp creds key
        if (key && key.startsWith('temp_creds_')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const parsedValue = JSON.parse(value);
              
              // Check if expired
              if (parsedValue.expires && parsedValue.expires < Date.now()) {
                console.log('Removing expired temporary credentials:', key);
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            console.error('Error parsing temporary credentials:', e);
            // If error, remove the potentially corrupted item
            localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      console.error('Error cleaning up temporary credentials:', e);
    }
  }, []);
  
  useEffect(() => {
    if (isInitialized) {
      setIsLoading(false);
    }
  }, [isInitialized]);
  
  useEffect(() => {
    // Avoid duplicate processing
    if (processingRef.current) return;
    
    // Safety measure - avoid manipulating history during render
    if (location.state && location.state._suppressRouteNavigation) {
      return;
    }
    
    // Mark as processing
    processingRef.current = true;
    
    // Clear any state that might cause UI issues when navigating
    const cleanHistory = () => {
      try {
        window.history.replaceState(
          { _suppressRouteNavigation: true }, 
          document.title, 
          location.pathname
        );
      } catch (err) {
        console.error("Error updating history state:", err);
      }
      
      // Reset processing flag after a delay
      setTimeout(() => {
        processingRef.current = false;
      }, 100);
    };
    
    // Small delay to let React finish its work
    const timer = setTimeout(cleanHistory, 50);
    return () => {
      clearTimeout(timer);
      // Ensure we reset the processing flag on cleanup
      processingRef.current = false;
    };
  }, [location.pathname, location.state]);
  
  // Only return a loading component when auth is not initialized
  return isLoading ? (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1A1F2C] z-50">
      <div className="animate-spin h-8 w-8 border-4 border-[#9b87f5] border-t-transparent rounded-full"></div>
    </div>
  ) : null;
};

// Routes component that includes navigation and routes
// This component must be used INSIDE AuthProvider
const AppRoutes = () => {
  return (
    <>
      <AuthNavigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/account" element={<Account />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-portal" element={<PaymentPortal />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/plans" element={<TrainingPlans />} />
        {/* Redirect /confirm-email to /login for backward compatibility */}
        <Route path="/confirm-email" element={<Navigate to="/login" replace />} />
        {/* Redirect /auth to /login for backward compatibility */}
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          {/* AuthProvider must wrap the components that use useAuth() */}
          <AuthProvider>
            <StripeProvider>
              <TooltipProvider>
                <AppRoutes />
                {/* Place Toaster components after the Routes */}
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </StripeProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
