
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminInvoices from "@/components/admin/AdminInvoices";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminSessions from "@/components/admin/AdminSessions";
import AdminTickets from "@/components/admin/AdminTickets";
import { useAuth } from "@/hooks/useAuth";

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to dashboard if authenticated but not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#1A1F2C] text-white">
        <AdminSidebar />
        <div className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/overview" element={<AdminOverview />} />
            <Route path="/sessions" element={<AdminSessions />} />
            <Route path="/payments" element={<AdminPayments />} />
            <Route path="/invoices" element={<AdminInvoices />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="/tickets" element={<AdminTickets />} />
          </Routes>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
