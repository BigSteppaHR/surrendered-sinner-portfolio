
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  FileText,
  Bell,
  ShieldAlert,
  Globe,
  Database,
  Sparkles
} from 'lucide-react';

const sidebarLinks = [
  {
    path: '/admin',
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: 'Overview',
    exact: true,
  },
  {
    path: '/admin/sessions',
    icon: <Calendar className="h-5 w-5" />,
    label: 'Sessions',
  },
  {
    path: '/admin/payments',
    icon: <CreditCard className="h-5 w-5" />,
    label: 'Payments',
  },
  {
    path: '/admin/invoices',
    icon: <FileText className="h-5 w-5" />,
    label: 'Invoices',
  },
  {
    path: '/admin/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    label: 'Analytics',
  },
  {
    path: '/admin/tickets',
    icon: <MessageCircle className="h-5 w-5" />,
    label: 'Support',
    badge: 3,
  },
  {
    path: '/admin/notifications',
    icon: <Bell className="h-5 w-5" />,
    label: 'Notifications',
    badge: 5,
  },
  {
    path: '/admin/quotes',
    icon: <Sparkles className="h-5 w-5" />,
    label: 'Daily Quotes',
  },
  {
    path: '/admin/settings',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];

const utilityLinks = [
  {
    path: '/dashboard',
    icon: <Globe className="h-5 w-5" />,
    label: 'User Dashboard',
  },
  {
    path: '/admin/database',
    icon: <Database className="h-5 w-5" />,
    label: 'Database',
  },
];

const AdminSidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const { success, redirectTo } = await logout();
      if (success && redirectTo) {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem logging you out. Please try again.",
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#333]">
        <div className="flex justify-between items-center h-16 px-4">
          <Link to="/admin" className="flex items-center">
            <Logo size="small" />
            <span className="ml-2 font-bold text-white">Admin</span>
          </Link>
          <button
            onClick={toggleMenu}
            className="text-white p-2"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={toggleMenu}></div>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0a0a] border-r border-[#333] transition-transform transform-gpu",
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-[#333]">
            <Link to="/admin" className="flex items-center">
              <Logo size="small" />
              <div className="ml-2">
                <span className="font-bold text-white">Admin Portal</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-400">System Online</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <div className="mb-6 bg-[#ea384c]/10 border border-[#ea384c]/20 rounded-md p-3">
              <div className="flex items-center">
                <ShieldAlert className="h-5 w-5 text-[#ea384c] mr-2" />
                <div>
                  <p className="text-sm font-medium text-white">Admin Access</p>
                  <p className="text-xs text-gray-400">Full system privileges</p>
                </div>
              </div>
            </div>
            
            <nav className="space-y-6">
              <div className="space-y-1">
                {sidebarLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    icon={link.icon}
                    label={link.label}
                    badge={link.badge}
                    exact={link.exact}
                  />
                ))}
              </div>

              <div className="pt-6 border-t border-[#333]">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  System
                </p>
                <div className="space-y-1">
                  {utilityLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      icon={link.icon}
                      label={link.label}
                    />
                  ))}
                </div>
              </div>
            </nav>
          </div>

          <div className="p-4 border-t border-[#333]">
            <div className="flex items-center mb-4 px-2">
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ea384c] to-red-700 flex items-center justify-center text-white font-bold">
                  {profile?.full_name?.charAt(0) || 'A'}
                </div>
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-white truncate">
                  {profile?.full_name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {profile?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full justify-start text-[#ea384c] hover:text-white border-[#333] hover:bg-[#ea384c]/20"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  exact?: boolean;
}

const NavLink = ({ to, icon, label, badge, exact }: NavLinkProps) => {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors group relative",
        isActive
          ? "bg-[#ea384c] text-white"
          : "text-gray-300 hover:text-white hover:bg-[#333]"
      )}
    >
      <span className="mr-3">{icon}</span>
      <span className="flex-1">{label}</span>
      
      {badge && (
        <Badge className={cn(
          "ml-1",
          isActive ? "bg-white text-[#ea384c]" : "bg-[#ea384c] text-white"
        )}>
          {badge}
        </Badge>
      )}
      
      {isActive && <ChevronRight className="h-4 w-4" />}
    </Link>
  );
};

export default AdminSidebar;
