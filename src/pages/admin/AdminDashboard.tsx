
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminInvoices from "@/components/admin/AdminInvoices";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminLogin from "@/components/admin/AdminLogin";
import { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if admin is authenticated from localStorage
    const adminAuth = localStorage.getItem("admin-auth");
    if (adminAuth === "authenticated") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (password: string) => {
    // In a real app, this would be a secure authentication process
    // For demo purposes, we'll use a simple password check
    if (password === "surrenderedsinner") {
      localStorage.setItem("admin-auth", "authenticated");
      setIsAuthenticated(true);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#1A1F2C] text-white">
        <AdminSidebar />
        <div className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/overview" element={<AdminOverview />} />
            <Route path="/payments" element={<AdminPayments />} />
            <Route path="/invoices" element={<AdminInvoices />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
          </Routes>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
