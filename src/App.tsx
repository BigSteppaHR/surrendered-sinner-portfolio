
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
import Dashboard from "./pages/dashboard/Dashboard";
import { useAuth } from "./hooks/useAuth";
import DashboardLayout from "./pages/dashboard/DashboardLayout";

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
    <div className="fixed inset-0 flex items-center justify-center bg-[#000000] z-50">
      <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
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
        <Route path="/login" element={<Navigate to="/dashboard/login" replace />} />
        <Route path="/signup" element={<Navigate to="/dashboard/signup" replace />} />
        <Route path="/reset-password" element={<Navigate to="/dashboard/reset-password" replace />} />
        <Route path="/verify-email" element={<Navigate to="/dashboard/verify-email" replace />} />
        
        {/* Dashboard routes - all nested under /dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="sessions" element={<import("./pages/dashboard/Sessions").then(mod => <mod.default />)} />
          <Route path="plans" element={<import("./pages/dashboard/TrainingPlans").then(mod => <mod.default />)} />
          <Route path="payment" element={<import("./pages/dashboard/Payment").then(mod => <mod.default />)} />
          <Route path="progress" element={<import("./pages/dashboard/Progress").then(mod => <mod.default />)} />
          <Route path="account" element={<import("./pages/dashboard/Account").then(mod => <mod.default />)} />
          <Route path="login" element={<import("./pages/Login").then(mod => <mod.default />)} />
          <Route path="signup" element={<import("./pages/Signup").then(mod => <mod.default />)} />
          <Route path="reset-password" element={<import("./pages/ResetPassword").then(mod => <mod.default />)} />
          <Route path="verify-email" element={<import("./pages/VerifyEmail").then(mod => <mod.default />)} />
          <Route path="payment-portal" element={<import("./pages/PaymentPortal").then(mod => <mod.default />)} />
        </Route>
        
        {/* Redirect old routes to new dashboard routes */}
        <Route path="/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/schedule" element={<Navigate to="/dashboard/sessions" replace />} />
        <Route path="/progress" element={<Navigate to="/dashboard/progress" replace />} />
        <Route path="/account" element={<Navigate to="/dashboard/account" replace />} />
        <Route path="/payment" element={<Navigate to="/dashboard/payment" replace />} />
        <Route path="/payment-portal" element={<Navigate to="/dashboard/payment-portal" replace />} />
        <Route path="/plans" element={<Navigate to="/dashboard/plans" replace />} />
        
        {/* Redirect /confirm-email to /dashboard/login for backward compatibility */}
        <Route path="/confirm-email" element={<Navigate to="/dashboard/login" replace />} />
        {/* Redirect /auth to /dashboard/login for backward compatibility */}
        <Route path="/auth" element={<Navigate to="/dashboard/login" replace />} />
        
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
