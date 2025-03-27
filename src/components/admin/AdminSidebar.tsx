
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
  FileText,
  ChevronDown
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
import { cn } from "@/lib/utils";
import { useState } from "react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

const AdminSidebar = () => {
  const location = useLocation();
  const { profile, logout } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>(['main', 'financials']);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group) 
        : [...prev, group]
    );
  };

  const getFirstLetters = (name: string) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-[#1a1a1a] bg-[#0a0a0a] max-w-[280px] min-w-[280px]">
      <SidebarHeader className="p-4 border-b border-[#1a1a1a]">
        <div className="flex items-center space-x-2">
          <Avatar className="h-10 w-10 border border-[#333]">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-[#ea384c]/10 text-[#ea384c]">
              {getFirstLetters(profile?.full_name || "Admin")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-medium text-white truncate">
              {profile?.full_name || "Admin User"}
            </h3>
            <p className="text-xs text-gray-400 truncate">Administrator</p>
          </div>
          <SidebarTrigger>
            <button className="p-1 rounded-md hover:bg-[#1a1a1a]">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <Collapsible open={openGroups.includes('main')} onOpenChange={() => toggleGroup('main')}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Main</p>
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-500 transition-transform",
                  openGroups.includes('main') ? "transform rotate-180" : ""
                )} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link to="/admin/overview" className="w-full">
                      <SidebarMenuButton active={isActive("/admin/overview")}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Overview
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <Link to="/admin/sessions" className="w-full">
                      <SidebarMenuButton active={isActive("/admin/sessions")}>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Sessions
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link to="/admin/quotes" className="w-full">
                      <SidebarMenuButton active={isActive("/admin/quotes")}>
                        <Quote className="h-4 w-4 mr-2" />
                        Daily Quotes
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible open={openGroups.includes('financials')} onOpenChange={() => toggleGroup('financials')}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Financials</p>
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-500 transition-transform",
                  openGroups.includes('financials') ? "transform rotate-180" : ""
                )} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link to="/admin/payments" className="w-full">
                      <SidebarMenuButton active={isActive("/admin/payments")}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payments
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <Link to="/admin/invoices" className="w-full">
                      <SidebarMenuButton active={isActive("/admin/invoices")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Invoices
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <Link to="/admin/analytics" className="w-full">
                      <SidebarMenuButton active={isActive("/admin/analytics")}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible open={openGroups.includes('support')} onOpenChange={() => toggleGroup('support')}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Support</p>
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-500 transition-transform",
                  openGroups.includes('support') ? "transform rotate-180" : ""
                )} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link to="/admin/tickets" className="w-full">
                      <SidebarMenuButton active={isActive("/admin/tickets")}>
                        <LifeBuoy className="h-4 w-4 mr-2" />
                        Support Tickets
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <Link to="/admin/notifications" className="w-full">
                      <SidebarMenuButton active={isActive("/admin/notifications")}>
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup>
          <Link to="/admin/settings" className="w-full">
            <div className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive("/admin/settings") 
                ? "bg-[#ea384c] text-white" 
                : "text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
            )}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </div>
          </Link>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-[#1a1a1a]">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-400 hover:text-[#ea384c]"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
