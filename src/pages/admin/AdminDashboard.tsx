
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminSessions from "@/components/admin/AdminSessions";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminInvoices from "@/components/admin/AdminInvoices";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminTickets from "@/components/admin/AdminTickets";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminQuotes from "@/components/admin/AdminQuotes";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, isLoading, profile } = useAuth();
  const location = useLocation();
  const isDebugMode = profile?.debug_mode || false;
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Authentication & access control
  useEffect(() => {
    if (isAuthenticated && !isLoading && !isAdmin) {
      toast({
        title: "Unauthorized Access",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, isAdmin, isLoading, toast]);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-[#ea384c] animate-spin" />
          <p className="text-white text-sm">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Authentication checks
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-[#0f0f0f] text-white relative">
      {isDebugMode && (
        <div className="fixed top-0 left-0 right-0 bg-[#ea384c]/20 border border-[#ea384c]/40 p-2 text-xs text-white z-50">
          <strong>DEBUG MODE</strong>: Admin User ID: {profile?.id}, Debug Enabled
        </div>
      )}
      
      {/* Admin Sidebar with toggle state */}
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main content area - adjust padding based on sidebar state */}
      <div className={`flex-1 p-4 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} overflow-auto`}>
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
  );
};

export default AdminDashboard;
