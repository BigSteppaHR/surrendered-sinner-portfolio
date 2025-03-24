
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarDays, 
  CreditCard, 
  FileText, 
  BarChart3,
  MessageSquare,
  LogOut
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const AdminSidebar = () => {
  const { logout } = useAuth();
  
  const links = [
    { name: "Overview", path: "/admin/overview", icon: LayoutDashboard },
    { name: "Sessions", path: "/admin/sessions", icon: CalendarDays },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
    { name: "Invoices", path: "/admin/invoices", icon: FileText },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Support Tickets", path: "/admin/tickets", icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Sidebar className="border-r border-[#353A48] bg-[#1E2435]">
      <div className="flex h-16 items-center justify-between px-6 border-b border-[#353A48]">
        <h1 className="text-xl font-bold text-white">
          <span className="text-[#9b87f5]">Admin</span> Portal
        </h1>
        <SidebarTrigger className="h-7 w-7" />
      </div>
      <SidebarContent>
        <div className="py-6 px-4">
          <div className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#9b87f5]/10 text-[#9b87f5]"
                      : "text-gray-400 hover:text-white hover:bg-[#9b87f5]/5"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-[#9b87f5]" : "text-gray-400"
                      )}
                    />
                    <span>{link.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-4 border-t border-[#353A48]">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#9b87f5]/5"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
