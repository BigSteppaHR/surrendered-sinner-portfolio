
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

// We no longer need to include auth-related paths here as they're now directly at root level
const publicPages: string[] = [];

const DashboardLayout = () => {
  const { isAuthenticated, isLoading, profile, isInitialized, isAdmin } = useAuth();
  const location = useLocation();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const { toast } = useToast();
  
  const isPublicPage = publicPages.includes(location.pathname);
  
  useEffect(() => {
    console.log("DashboardLayout - Auth state:", { 
      isAuthenticated, 
      isInitialized, 
      isLoading,
      profile: profile ? `${profile.id} (${profile.email})` : 'No profile'
    });
    
    // Only set page as loaded after auth is initialized
    if (isInitialized) {
      setIsPageLoaded(true);
    }
    
    // Set a timeout to prevent infinite loading
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
      
      if (!isAuthenticated && !isLoading) {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
      }
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timer);
  }, [isInitialized, isAuthenticated, profile, isLoading, toast]);
  
  // Show loading state while checking auth, but with a timeout
  if ((isLoading || !isInitialized || !isPageLoaded) && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="animate-spin h-8 w-8 border-4 border-sinner-red border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If loading timed out but we're not authenticated, redirect to login
  if (loadingTimeout && !isAuthenticated) {
    console.log("DashboardLayout: Loading timed out, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // For dashboard routes, we require authentication
  if (!isAuthenticated) {
    console.log("DashboardLayout: User not authenticated, redirecting to login");
    // Make sure to redirect to the root /login path, not /dashboard/login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated admin, redirect to admin dashboard
  if (isAuthenticated && profile?.is_admin) {
    console.log("DashboardLayout: User is admin, redirecting to admin dashboard");
    return <Navigate to="/admin" replace />;
  }
  
  // If authenticated but email not confirmed, redirect to confirmation page
  if (isAuthenticated && profile && !profile.email_confirmed) {
    console.log("DashboardLayout: Email not confirmed, redirecting to confirm page");
    return <Navigate to="/confirm-email" state={{ email: profile.email }} replace />;
  }
  
  // For authenticated dashboard pages, show the dashboard layout with navigation
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* We removed the DashboardNav component from here since it's already included in child pages */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
