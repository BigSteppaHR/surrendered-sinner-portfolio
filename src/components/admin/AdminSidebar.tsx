import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LineChart,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TicketIcon,
  MessageSquare,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useAuthLogout } from "@/hooks/auth/useAuthLogout";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { profile } = useAuth();
  const { logout } = useAuthLogout();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      title: "Overview",
      icon: LayoutDashboard,
      href: "/admin/overview",
    },
    {
      title: "Sessions",
      icon: Calendar,
      href: "/admin/sessions",
    },
    {
      title: "Payments",
      icon: CreditCard,
      href: "/admin/payments",
    },
    {
      title: "Invoices",
      icon: FileText,
      href: "/admin/invoices",
    },
    {
      title: "Analytics",
      icon: LineChart,
      href: "/admin/analytics",
    },
    {
      title: "Support Tickets",
      icon: MessageSquare,
      href: "/admin/tickets",
    },
  ];

  const getInitials = (name: string) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col border-r border-[#333333] bg-[#111111] transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex justify-between items-center p-4 h-16 border-b border-[#333333]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-sinner-red">ADMIN</span>
            <span className="text-white">PANEL</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto text-white hover:bg-sinner-red/10"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="p-4 border-b border-[#333333]">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <Avatar className="h-9 w-9 border border-[#333333]">
            <AvatarImage src={profile?.avatar_url || ""} alt="Admin" />
            <AvatarFallback className="bg-sinner-red text-white">
              {profile?.full_name ? getInitials(profile.full_name) : "A"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div>
              <h4 className="font-medium text-white">
                {profile?.full_name || "Admin User"}
              </h4>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-sinner-red/20 text-white"
                    : "text-gray-400 hover:text-white hover:bg-sinner-red/10",
                  collapsed && "justify-center px-0"
                )
              }
            >
              <item.icon
                size={20}
                className={cn(
                  collapsed && "mx-auto"
                )}
              />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-[#333333]">
        <Button
          variant="ghost"
          className={cn(
            "w-full text-gray-400 hover:text-white hover:bg-sinner-red/10", 
            collapsed ? "justify-center px-0" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut size={20} className={collapsed ? "mx-auto" : "mr-2"} />
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
