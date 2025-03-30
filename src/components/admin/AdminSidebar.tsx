
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  FileText,
  Settings,
  MessageSquare,
  Bell,
  Quote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define props interface
interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

// Define the navigation items
const navItems = [
  { path: "/admin/overview", label: "Overview", icon: LayoutDashboard },
  { path: "/admin/sessions", label: "Sessions", icon: CalendarDays },
  { path: "/admin/payments", label: "Payments", icon: CreditCard },
  { path: "/admin/invoices", label: "Invoices", icon: FileText },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/admin/tickets", label: "Support Tickets", icon: MessageSquare },
  { path: "/admin/notifications", label: "Notifications", icon: Bell },
  { path: "/admin/quotes", label: "Daily Quotes", icon: Quote },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminSidebar = ({ isOpen, toggleSidebar }: AdminSidebarProps) => {
  const location = useLocation();
  const { logout, profile } = useAuth();
  const [pendingTickets, setPendingTickets] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState(0);

  // Fetch real-time counts for badges
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch pending support tickets
        const { count: ticketsCount, error: ticketsError } = await supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'open');
        
        if (!ticketsError) setPendingTickets(ticketsCount || 0);
        
        // Fetch unread notifications for admin
        const { count: notificationsCount, error: notificationsError } = await supabase
          .from('user_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)
          .eq('notification_type', 'admin');
        
        if (!notificationsError) setUnreadNotifications(notificationsCount || 0);
        
        // Fetch upcoming sessions count
        const { count: sessionsCount, error: sessionsError } = await supabase
          .from('user_sessions')
          .select('*', { count: 'exact', head: true })
          .gt('session_time', new Date().toISOString())
          .lt('session_time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
        
        if (!sessionsError) setUpcomingSessions(sessionsCount || 0);
      } catch (error) {
        console.error('Error fetching notification counts:', error);
      }
    };

    fetchCounts();
    
    // Set up real-time subscription for changes
    const ticketsSubscription = supabase
      .channel('tickets-count-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'support_tickets' 
      }, () => fetchCounts())
      .subscribe();
      
    const notificationsSubscription = supabase
      .channel('notifications-count-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_notifications' 
      }, () => fetchCounts())
      .subscribe();
      
    const sessionsSubscription = supabase
      .channel('sessions-count-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'user_sessions' 
      }, () => fetchCounts())
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsSubscription);
      supabase.removeChannel(notificationsSubscription);
      supabase.removeChannel(sessionsSubscription);
    };
  }, []);
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div 
      className={`fixed top-0 left-0 h-full bg-black border-r border-zinc-800 transition-all duration-300 z-10 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Toggle button */}
      <button 
        className="absolute -right-3 top-16 rounded-full bg-[#ea384c] p-1 shadow-md border border-zinc-800 text-white z-20"
        onClick={toggleSidebar}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
      
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-center h-16">
        {isOpen ? (
          <h2 className="text-xl font-bold text-[#ea384c]">Admin Panel</h2>
        ) : (
          <h2 className="text-xl font-bold text-[#ea384c]">SS</h2>
        )}
      </div>
      
      {/* Navigation */}
      <div className="py-4">
        <nav>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                              (item.path !== "/admin" && location.pathname.startsWith(item.path));
              
              // Determine if this item needs a badge
              let badgeCount = 0;
              if (item.path === "/admin/tickets") badgeCount = pendingTickets;
              if (item.path === "/admin/notifications") badgeCount = unreadNotifications;
              if (item.path === "/admin/sessions") badgeCount = upcomingSessions;
              
              return (
                <li key={item.path}>
                  {isOpen ? (
                    <NavLink
                      to={item.path}
                      className={`flex items-center px-4 py-3 mx-2 rounded-md transition-colors ${
                        isActive
                          ? "bg-[#ea384c]/20 text-white border-l-4 border-[#ea384c]"
                          : "text-gray-400 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.label}</span>
                      {badgeCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {badgeCount}
                        </Badge>
                      )}
                    </NavLink>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <NavLink
                            to={item.path}
                            className={`flex flex-col items-center justify-center p-2 mx-2 rounded-md transition-colors ${
                              isActive
                                ? "bg-[#ea384c]/20 text-white border-l-4 border-[#ea384c]"
                                : "text-gray-400 hover:bg-zinc-900 hover:text-white"
                            }`}
                          >
                            <div className="relative">
                              <item.icon className="h-5 w-5" />
                              {badgeCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center p-0 text-[10px]">
                                  {badgeCount}
                                </Badge>
                              )}
                            </div>
                          </NavLink>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      
      {/* Footer with user info and logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800">
        {isOpen ? (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-8 h-8 bg-[#ea384c] rounded-full flex items-center justify-center">
                {profile?.full_name?.[0] || 'A'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-semibold text-white">{profile?.full_name || 'Admin'}</p>
                <p className="truncate text-xs">{profile?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full border-zinc-800 hover:bg-[#ea384c] hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="w-full border-zinc-800 hover:bg-[#ea384c] hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
