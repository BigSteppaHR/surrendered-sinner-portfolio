
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardNav from "@/components/dashboard/DashboardNav";
import { useEffect, useState } from "react";

// Pages that don't require authentication or should not show the dashboard navigation
const publicPages = [
  "/dashboard/login",
  "/dashboard/signup",
  "/dashboard/reset-password",
  "/dashboard/verify-email"
];

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
        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Handle authentication redirects for protected pages
  if (!isPublicPage) {
    // If authenticated admin, redirect to admin dashboard
    if (isAuthenticated && profile?.is_admin) {
      return <Navigate to="/admin" replace />;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return <Navigate to="/dashboard/login" replace />;
    }
    
    // If authenticated but email not confirmed, redirect to confirmation page
    if (isAuthenticated && profile && !profile.email_confirmed) {
      return <Navigate to="/dashboard/confirm-email" state={{ email: profile.email }} replace />;
    }
  }
  
  // For public pages (login, signup, etc) don't show the dashboard navigation
  if (isPublicPage) {
    return <Outlet />;
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
