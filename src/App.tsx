import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import StripeProvider from "./components/StripeProvider";
import { AuthProvider } from "./components/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./hooks/useAuth";
import DashboardLayout from "./pages/dashboard/DashboardLayout";

// Lazy load dashboard pages
const Sessions = lazy(() => import("./pages/dashboard/Sessions"));
const Schedule = lazy(() => import("./pages/dashboard/Schedule"));
const TrainingPlans = lazy(() => import("./pages/dashboard/TrainingPlans"));
const DashboardPayment = lazy(() => import("./pages/dashboard/Payment"));
const Progress = lazy(() => import("./pages/dashboard/Progress"));
const Account = lazy(() => import("./pages/dashboard/Account"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const PaymentPortal = lazy(() => import("./pages/PaymentPortal"));

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
      <div className="animate-spin h-8 w-8 border-4 border-sinner-red border-t-transparent rounded-full"></div>
    </div>
  ) : null;
};

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#000000]">
    <div className="animate-spin h-8 w-8 border-4 border-sinner-red border-t-transparent rounded-full"></div>
  </div>
);

// Routes component that includes routes
// This component must be used INSIDE AuthProvider AND Router context
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      {/* Direct login routes */}
      <Route path="/login" element={
        <Suspense fallback={<PageLoader />}>
          <Login />
        </Suspense>
      } />
      <Route path="/signup" element={
        <Suspense fallback={<PageLoader />}>
          <Signup />
        </Suspense>
      } />
      <Route path="/reset-password" element={
        <Suspense fallback={<PageLoader />}>
          <ResetPassword />
        </Suspense>
      } />
      <Route path="/verify-email" element={
        <Suspense fallback={<PageLoader />}>
          <VerifyEmail />
        </Suspense>
      } />
      
      {/* Dashboard routes - all nested under /dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="sessions" element={
          <Suspense fallback={<PageLoader />}>
            <Sessions />
          </Suspense>
        } />
        <Route path="schedule" element={
          <Suspense fallback={<PageLoader />}>
            <Schedule />
          </Suspense>
        } />
        <Route path="plans" element={
          <Suspense fallback={<PageLoader />}>
            <TrainingPlans />
          </Suspense>
        } />
        <Route path="payment" element={
          <Suspense fallback={<PageLoader />}>
            <DashboardPayment />
          </Suspense>
        } />
        <Route path="progress" element={
          <Suspense fallback={<PageLoader />}>
            <Progress />
          </Suspense>
        } />
        <Route path="account" element={
          <Suspense fallback={<PageLoader />}>
            <Account />
          </Suspense>
        } />
        {/* Keep auth related routes in dashboard for backward compatibility */}
        <Route path="login" element={<Navigate to="/login" replace />} />
        <Route path="signup" element={<Navigate to="/signup" replace />} />
        <Route path="reset-password" element={<Navigate to="/reset-password" replace />} />
        <Route path="verify-email" element={<Navigate to="/verify-email" replace />} />
        <Route path="payment-portal" element={
          <Suspense fallback={<PageLoader />}>
            <PaymentPortal />
          </Suspense>
        } />
      </Route>
      
      {/* Redirect old routes to new dashboard routes */}
      <Route path="/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/schedule" element={<Navigate to="/dashboard/schedule" replace />} />
      <Route path="/progress" element={<Navigate to="/dashboard/progress" replace />} />
      <Route path="/account" element={<Navigate to="/dashboard/account" replace />} />
      <Route path="/payment" element={<Navigate to="/dashboard/payment" replace />} />
      <Route path="/payment-portal" element={<Navigate to="/dashboard/payment-portal" replace />} />
      <Route path="/plans" element={<Navigate to="/dashboard/plans" replace />} />
      
      {/* Redirect /confirm-email to /login for backward compatibility */}
      <Route path="/confirm-email" element={<Navigate to="/login" replace />} />
      {/* Redirect /auth to /login for backward compatibility */}
      <Route path="/auth" element={<Navigate to="/login" replace />} />
      
      <Route path="/admin/*" element={<AdminDashboard />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
                <AuthNavigation />
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
