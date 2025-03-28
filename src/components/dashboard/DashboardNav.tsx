import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  User, 
  Calendar, 
  LineChart, 
  Download, 
  CreditCard, 
  HelpCircle, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  FileText,
  ShoppingBag
} from 'lucide-react';
import Logo from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NavItemProps {
  icon: React.ReactElement;
  children: React.ReactNode;
  to: string;
  active: boolean;
}

const NavItem = ({ icon, children, to, active }: NavItemProps) => {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all ${
          active 
            ? 'text-white bg-transparent border border-[#ea384c] shadow-[0_0_10px_rgba(234,56,76,0.3)]' 
            : 'text-gray-400 hover:text-white hover:bg-zinc-800'
        }`}
      >
        {icon && React.cloneElement(icon, { 
          size: 18, 
          className: active ? 'text-[#ea384c]' : '' 
        })}
        <span>{children}</span>
      </Link>
    </li>
  );
};

const DashboardNav = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-zinc-900 border-zinc-700"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 z-50 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 flex items-center justify-center">
            <Logo size="small" />
          </div>
          
          <Separator className="bg-zinc-800" />
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              <NavItem 
                icon={<Home />} 
                to="/dashboard" 
                active={isActive('/dashboard')}
              >
                Dashboard
              </NavItem>
              
              <NavItem 
                icon={<User />} 
                to="/dashboard/account" 
                active={isActive('/dashboard/account')}
              >
                My Account
              </NavItem>
              
              <NavItem 
                icon={<FileText />} 
                to="/dashboard/plans" 
                active={isActive('/dashboard/plans')}
              >
                Training Plans
              </NavItem>
              
              <NavItem 
                icon={<Calendar />} 
                to="/dashboard/schedule" 
                active={isActive('/dashboard/schedule')}
              >
                Schedule
              </NavItem>
              
              <NavItem 
                icon={<LineChart />} 
                to="/dashboard/progress" 
                active={isActive('/dashboard/progress')}
              >
                Progress
              </NavItem>
              
              <NavItem 
                icon={<Download />} 
                to="/dashboard/downloads" 
                active={isActive('/dashboard/downloads')}
              >
                Downloads
              </NavItem>
              
              <NavItem 
                icon={<CreditCard />} 
                to="/dashboard/payment" 
                active={isActive('/dashboard/payment')}
              >
                Payment
              </NavItem>
              
              <NavItem 
                icon={<ShoppingBag />} 
                to="https://alphanutritionlabs.com" 
                active={false}
              >
                Shop
              </NavItem>
              
              <NavItem 
                icon={<HelpCircle />} 
                to="/dashboard/support" 
                active={isActive('/dashboard/support')}
              >
                Support
              </NavItem>
              
              <NavItem 
                icon={<Settings />} 
                to="/dashboard/settings" 
                active={isActive('/dashboard/settings')}
              >
                Settings
              </NavItem>
            </ul>
          </nav>
          
          <Separator className="bg-zinc-800" />
          
          {/* User info and logout */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium text-white truncate max-w-[150px]">
                    {user?.email}
                  </div>
                  <div className="text-xs text-zinc-400">Member</div>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full border-zinc-700 hover:bg-zinc-800 hover:text-white"
              onClick={handleSignOut}
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardNav;
