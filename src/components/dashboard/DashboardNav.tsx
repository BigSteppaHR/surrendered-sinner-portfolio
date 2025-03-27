
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  User,
  Dumbbell,
  Calendar,
  Wallet,
  BarChart3,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  CreditCard,
  Package
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  {
    path: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: 'Dashboard',
    exact: true,
  },
  {
    path: '/dashboard/account',
    icon: <User className="h-5 w-5" />,
    label: 'Account',
  },
  {
    path: '/dashboard/plans',
    icon: <Dumbbell className="h-5 w-5" />,
    label: 'Training Plans',
  },
  {
    path: '/dashboard/schedule',
    icon: <Calendar className="h-5 w-5" />,
    label: 'Schedule',
  },
  {
    path: '/dashboard/progress',
    icon: <BarChart3 className="h-5 w-5" />,
    label: 'Progress',
  },
  {
    path: '/dashboard/payment',
    icon: <Wallet className="h-5 w-5" />,
    label: 'Payment',
  },
  {
    path: '/dashboard/support',
    icon: <MessageCircle className="h-5 w-5" />,
    label: 'Support',
  },
  {
    path: '/dashboard/settings',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];

const utilityLinks = [
  {
    path: '/plans-catalog',
    icon: <Package className="h-5 w-5" />,
    label: 'Plan Catalog',
  },
  {
    path: '/payment',
    icon: <CreditCard className="h-5 w-5" />,
    label: 'Payment Portal',
  },
];

const DashboardNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Close the mobile menu when the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    const { success, redirectTo } = await logout();
    if (success && redirectTo) {
      navigate(redirectTo);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-800">
        <div className="flex justify-between items-center h-16 px-4">
          <Link to="/dashboard" className="flex items-center">
            <Logo size="small" />
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

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={toggleMenu}></div>
      )}

      {/* Sidebar for both Mobile and Desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 transition-transform transform-gpu",
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-800 hidden md:flex">
            <Link to="/dashboard" className="flex items-center">
              <Logo size="small" />
            </Link>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="space-y-6">
              <div className="space-y-1">
                {sidebarLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    icon={link.icon}
                    label={link.label}
                    exact={link.exact}
                  />
                ))}
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Utilities
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

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-zinc-800">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-white hover:bg-red-900/20"
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
  exact?: boolean;
}

const NavLink = ({ to, icon, label, exact }: NavLinkProps) => {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-sinner-red text-white"
          : "text-gray-300 hover:text-white hover:bg-zinc-800"
      )}
    >
      <span className="mr-3">{icon}</span>
      <span className="flex-1">{label}</span>
      {isActive && <ChevronRight className="h-4 w-4" />}
    </Link>
  );
};

export default DashboardNav;
