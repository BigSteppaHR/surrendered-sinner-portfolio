
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminInvoices from "@/components/admin/AdminInvoices";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminSessions from "@/components/admin/AdminSessions";
import AdminTickets from "@/components/admin/AdminTickets";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminQuotes from "@/components/admin/AdminQuotes";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, isLoading, profile } = useAuth();
  const location = useLocation();
  const isDebugMode = profile?.debug_mode || false;
  const { toast } = useToast();

  console.log("AdminDashboard: Auth state check", { 
    isAuthenticated, 
    isAdmin, 
    isLoading, 
    profileId: profile?.id,
    path: location.pathname
  });

  useEffect(() => {
    // Show toast for unauthorized access attempts
    if (isAuthenticated && !isLoading && !isAdmin) {
      toast({
        title: "Unauthorized Access",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
      
      // Navigation will be handled by the redirect below, not here
    }
  }, [isAuthenticated, isAdmin, isLoading, toast]);

  // If still loading, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="animate-spin h-8 w-8 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated - use component instead of hook call
  if (!isAuthenticated) {
    console.log("AdminDashboard: Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to dashboard if authenticated but not admin - use component instead of hook call
  if (!isAdmin) {
    console.log("AdminDashboard: Not admin, redirecting to dashboard", { 
      profile, 
      isAdmin,
      is_admin: profile?.is_admin 
    });
    return <Navigate to="/dashboard" replace />;
  }

  console.log("AdminDashboard: Rendering admin UI for user", profile?.id);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#000000] text-white">
        {isDebugMode && (
          <div className="fixed top-0 left-0 right-0 bg-[#ea384c]/20 border border-[#ea384c]/40 p-2 text-xs text-white z-50">
            <strong>DEBUG MODE</strong>: Admin User ID: {profile?.id}, Debug Enabled
          </div>
        )}
        <AdminSidebar />
        <div className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/overview" element={<AdminOverview />} />
            <Route path="/sessions" element={<AdminSessions />} />
            <Route path="/payments" element={<AdminPayments />} />
            <Route path="/invoices" element={<AdminInvoices />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/tickets" element={<AdminTickets />} />
            <Route path="/notifications" element={<AdminNotifications />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/quotes" element={<AdminQuotes />} />
          </Routes>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
