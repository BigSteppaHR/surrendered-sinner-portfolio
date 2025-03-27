
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LayoutDashboard, Calendar, ChartBar, CreditCard, LifeBuoy, Settings, Menu, X, LogOut, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const DashboardNav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { logout, profile } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavItem = ({ path, icon, label }: { path: string; icon: React.ReactNode; label: string }) => (
    <Link to={path} className={cn(
      "flex items-center text-sm py-3 px-4 rounded-md transition-colors",
      isActive(path) 
        ? "bg-[#ea384c] text-white" 
        : "text-gray-400 hover:text-white hover:bg-zinc-800"
    )}>
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-30 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="border-[#333] bg-black/50 backdrop-blur-md"
        >
          {isMobileMenuOpen ? 
            <X className="h-5 w-5 text-white" /> : 
            <Menu className="h-5 w-5 text-white" />
          }
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-20 md:hidden" 
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 bottom-0 z-20 w-64 bg-[#0a0a0a] border-r border-[#222] overflow-y-auto transition-transform duration-300 transform",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="px-4 py-5 flex items-center border-b border-[#222]">
          <img 
            src="/lovable-uploads/00eac127-7491-42ac-a058-169d184c1e94.png" 
            alt="Logo" 
            className="h-8 w-8 mr-2"
          />
          <h2 className="text-xl font-bold text-white">Dashboard</h2>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <small className="text-xs text-gray-500 uppercase font-bold tracking-wider">Navigation</small>
            <nav className="mt-2 space-y-1">
              <NavItem 
                path="/dashboard" 
                icon={<LayoutDashboard className="h-4 w-4" />} 
                label="Overview" 
              />
              <NavItem 
                path="/dashboard/account" 
                icon={<User className="h-4 w-4" />} 
                label="Account" 
              />
              <NavItem 
                path="/dashboard/plans" 
                icon={<LayoutDashboard className="h-4 w-4" />} 
                label="Training Plans" 
              />
              <NavItem 
                path="/dashboard/schedule" 
                icon={<Calendar className="h-4 w-4" />} 
                label="Schedule" 
              />
              <NavItem 
                path="/dashboard/progress" 
                icon={<ChartBar className="h-4 w-4" />} 
                label="Progress" 
              />
              <NavItem 
                path="/dashboard/downloads" 
                icon={<FileDown className="h-4 w-4" />} 
                label="Downloads" 
              />
              <NavItem 
                path="/dashboard/payment" 
                icon={<CreditCard className="h-4 w-4" />} 
                label="Payment" 
              />
              <NavItem 
                path="/dashboard/support" 
                icon={<LifeBuoy className="h-4 w-4" />} 
                label="Support" 
              />
              <NavItem 
                path="/dashboard/settings" 
                icon={<Settings className="h-4 w-4" />} 
                label="Settings" 
              />
            </nav>
          </div>

          <div className="mt-auto">
            <div className="border-t border-[#222] pt-4">
              <div className="mb-4 px-4">
                <div className="text-sm font-medium text-white">{profile?.full_name}</div>
                <div className="text-xs text-gray-400 truncate">{profile?.email}</div>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center text-sm py-3 px-4 rounded-md transition-colors text-gray-400 hover:text-white hover:bg-zinc-800"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-3">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardNav;
