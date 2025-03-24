
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarDays, 
  CreditCard, 
  FileText, 
  BarChart3,
  MessageSquare
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const links = [
    { name: "Overview", path: "/admin/overview", icon: LayoutDashboard },
    { name: "Sessions", path: "/admin/sessions", icon: CalendarDays },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
    { name: "Invoices", path: "/admin/invoices", icon: FileText },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Support Tickets", path: "/admin/tickets", icon: MessageSquare },
  ];

  return (
    <Sidebar className="border-r border-gray-800 bg-gray-900">
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Portal</h1>
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
                      ? "bg-red-900/20 text-white"
                      : "text-gray-400 hover:text-white hover:bg-red-900/10"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon
                      className={cn(
                        "h-5 w-5",
                        isActive ? "text-white" : "text-gray-400"
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
    </Sidebar>
  );
};

export default AdminSidebar;
