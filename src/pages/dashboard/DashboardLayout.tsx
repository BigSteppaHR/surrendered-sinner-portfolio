
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Helper for conditional logging
const isDev = import.meta.env.DEV;
const logDebug = (message: string, ...args: any[]) => {
  if (isDev) console.debug(`[Dashboard] ${message}`, ...args);
};

// We no longer need to include auth-related paths here as they're now directly at root level
const publicPages: string[] = [];

const DashboardLayout = () => {
  const { isAuthenticated, isLoading, profile, isInitialized, isAdmin } = useAuth();
  const location = useLocation();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const { toast } = useToast();
  const initialLoadComplete = useRef(false);
  const authCheckStarted = useRef(false);
  
  const isPublicPage = publicPages.includes(location.pathname);
  const isDebugMode = profile?.debug_mode || false;
  
  // Log debug information if in debug mode
  useEffect(() => {
    if (isDebugMode) {
      console.log("[DEBUG] Dashboard Component State:", {
        isAuthenticated,
        isLoading,
        isInitialized,
        isAdmin,
        publicPages,
        location: location.pathname,
        profile
      });
    }
  }, [isAuthenticated, isLoading, isInitialized, isAdmin, location.pathname, profile, isDebugMode]);
  
  // Set a shorter timeout for auth check to prevent showing loader indefinitely
  useEffect(() => {
    if (!authCheckStarted.current && !initialLoadComplete.current) {
      authCheckStarted.current = true;
      
      logDebug("Auth state:", { 
        isAuthenticated, 
        isInitialized, 
        isLoading,
        hasProfile: !!profile
      });
      
      // Only set page as loaded after auth is initialized
      if (isInitialized) {
        setIsPageLoaded(true);
        initialLoadComplete.current = true;
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
      }, 3000); // Shorter 3 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized, isAuthenticated, profile, isLoading, toast, isDebugMode]);
  
  // Show loading state while checking auth, but with a timeout
  if (isLoading || !isInitialized || !isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    logDebug("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated admin, redirect to admin dashboard
  if (isAuthenticated && profile?.is_admin) {
    logDebug("User is admin, redirecting to admin dashboard");
    return <Navigate to="/admin" replace />;
  }
  
  // If authenticated but email not confirmed, redirect to confirmation page
  if (isAuthenticated && profile && !profile.email_confirmed) {
    logDebug("Email not confirmed, redirecting to confirm page");
    return <Navigate to="/confirm-email" state={{ email: profile.email }} replace />;
  }
  
  // For authenticated dashboard pages, show the dashboard layout with navigation
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {isDebugMode && (
        <div className="bg-[#ea384c]/20 border border-[#ea384c]/40 p-2 text-xs text-white">
          <strong>DEBUG MODE</strong>: User ID: {profile?.id}, Admin: {isAdmin ? 'Yes' : 'No'}
        </div>
      )}
      {/* We removed the DashboardNav component from here since it's already included in child pages */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
