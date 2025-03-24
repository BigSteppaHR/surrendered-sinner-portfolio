
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { useEffect, useState } from "react";

// We no longer need to include auth-related paths here as they're now directly at root level
const publicPages = [];

const DashboardLayout = () => {
  const { isAuthenticated, isLoading, profile, isInitialized, isAdmin } = useAuth();
  const location = useLocation();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  const isPublicPage = publicPages.includes(location.pathname);
  
  useEffect(() => {
    // Only set page as loaded after auth is initialized
    if (isInitialized) {
      setIsPageLoaded(true);
    }
  }, [isInitialized]);
  
  // Show loading state while checking auth
  if (isLoading || !isInitialized || !isPageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="animate-spin h-8 w-8 border-4 border-sinner-red border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // For dashboard routes, we require authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated admin, redirect to admin dashboard
  if (isAuthenticated && profile?.is_admin) {
    return <Navigate to="/admin" replace />;
  }
  
  // If authenticated but email not confirmed, redirect to confirmation page
  if (isAuthenticated && profile && !profile.email_confirmed) {
    return <Navigate to="/confirm-email" state={{ email: profile.email }} replace />;
  }
  
  // For authenticated dashboard pages, show the dashboard layout with navigation
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#000000] text-white">
      <DashboardNav />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
