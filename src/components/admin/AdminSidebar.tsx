
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  LogOut,
  User,
  Menu,
  Calendar
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const AdminSidebar = () => {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Overview",
      path: "/admin/overview"
    },
    {
      icon: Calendar,
      label: "Sessions",
      path: "/admin/sessions"
    },
    {
      icon: CreditCard,
      label: "Payments",
      path: "/admin/payments"
    },
    {
      icon: Receipt,
      label: "Invoices",
      path: "/admin/invoices"
    },
    {
      icon: BarChart3,
      label: "Analytics",
      path: "/admin/analytics"
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <p className="text-xs text-gray-400">{profile?.full_name || 'Administrator'}</p>
          </div>
        </div>
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.path}
                      className={({ isActive }) => 
                        `flex items-center gap-3 py-2 px-3 rounded-md transition-colors ${
                          isActive 
                            ? "bg-primary/20 text-primary" 
                            : "hover:bg-gray-800"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-gray-800">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
