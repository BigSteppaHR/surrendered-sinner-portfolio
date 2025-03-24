
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CreditCard,
  BarChart3,
  LifeBuoy,
  Settings,
  LogOut,
  Bell,
  Quote,
  FileText
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const AdminSidebar = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const getFirstLetters = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Sidebar className="border-r border-[#333333] bg-[#111111]">
      <SidebarHeader className="p-4 border-b border-[#333333]">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 border border-[#333333]">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-sinner-red/20 text-sinner-red">
              {getFirstLetters(profile?.full_name || "Admin")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-medium text-white truncate">
              {profile?.full_name || "Admin User"}
            </h3>
            <p className="text-xs text-gray-400 truncate">Administrator</p>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/admin/overview" className="w-full">
                  <SidebarMenuButton active={location.pathname === "/admin/overview"}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Overview
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link to="/admin/sessions" className="w-full">
                  <SidebarMenuButton active={location.pathname === "/admin/sessions"}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Sessions
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/admin/quotes" className="w-full">
                  <SidebarMenuButton active={location.pathname === "/admin/quotes"}>
                    <Quote className="h-4 w-4 mr-2" />
                    Daily Quotes
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Financials</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/admin/payments" className="w-full">
                  <SidebarMenuButton active={location.pathname === "/admin/payments"}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payments
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link to="/admin/invoices" className="w-full">
                  <SidebarMenuButton active={location.pathname === "/admin/invoices"}>
                    <FileText className="h-4 w-4 mr-2" />
                    Invoices
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/admin/tickets" className="w-full">
                  <SidebarMenuButton active={location.pathname === "/admin/tickets"}>
                    <LifeBuoy className="h-4 w-4 mr-2" />
                    Support Tickets
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Link to="/admin/notifications" className="w-full">
                  <SidebarMenuButton active={location.pathname === "/admin/notifications"}>
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/admin/analytics" className="w-full">
                  <SidebarMenuButton active={location.pathname === "/admin/analytics"}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/admin/settings" className="w-full">
                  <SidebarMenuButton active={location.pathname === "/admin/settings"}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-[#333333]">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-400 hover:text-sinner-red"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
