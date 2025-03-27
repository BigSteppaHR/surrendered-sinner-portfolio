
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, LayoutDashboard, BarChart, Users, Settings, CreditCard, FileText, BellRing, MessageSquare, FileUp, Quote } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout, profile } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === `/admin${path}` || location.pathname === `/admin${path}/`;
  };
  
  const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/overview" },
    { icon: Users, label: "Sessions", path: "/sessions" },
    { icon: CreditCard, label: "Payments", path: "/payments" },
    { icon: FileText, label: "Invoices", path: "/invoices" },
    { icon: BarChart, label: "Analytics", path: "/analytics" },
    { icon: MessageSquare, label: "Support Tickets", path: "/tickets" },
    { icon: BellRing, label: "Notifications", path: "/notifications" },
    { icon: FileUp, label: "Files", path: "/files" },
    { icon: Quote, label: "Daily Quotes", path: "/quotes" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];
  
  return (
    <div className={cn(
      "fixed top-0 left-0 bottom-0 z-40 bg-[#0f0f0f] border-r border-[#333] transition-all duration-300",
      isOpen ? "w-64" : "w-20"
    )}>
      <div className="flex flex-col h-full">
        <div className={cn(
          "flex items-center p-4 border-b border-[#333]",
          isOpen ? "justify-between" : "justify-center"
        )}>
          {isOpen && (
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/00eac127-7491-42ac-a058-169d184c1e94.png" 
                alt="Surrendered Sinner Fitness Logo" 
                className="h-8 w-8 mr-2" 
              />
              <span className="font-bold text-white">Admin Panel</span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white hover:bg-[#333]"
          >
            {isOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={`/admin${item.path}`}
                      className={cn(
                        "flex items-center py-2 px-3 rounded-md transition-colors",
                        isActive(item.path) 
                          ? "bg-[#ea384c] text-white" 
                          : "text-gray-400 hover:text-white hover:bg-[#222]",
                        !isOpen && "justify-center"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {isOpen && <span className="ml-3">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        
        <div className="p-4 border-t border-[#333]">
          {isOpen && (
            <div className="mb-4">
              <div className="text-sm font-medium text-white truncate">{profile?.full_name || 'Admin'}</div>
              <div className="text-xs text-gray-400 truncate">{profile?.email}</div>
            </div>
          )}
          
          <Button
            variant="destructive"
            onClick={logout}
            className={cn(
              "w-full bg-red-900 hover:bg-red-800",
              !isOpen && "p-2"
            )}
          >
            {isOpen ? "Logout" : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
