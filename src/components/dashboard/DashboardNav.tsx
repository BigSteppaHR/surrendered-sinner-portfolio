
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  Calendar,
  CreditCard,
  Download,
  LineChart,
  HelpCircle,
  LogOut,
  ClipboardList,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, active }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center py-2 px-3 mb-1 rounded-md text-sm transition-colors
         ${isActive ? 'bg-red-900/20 text-white border border-red-800' : 'text-gray-400 hover:text-white hover:bg-[#1c1c1c]'}`
      }
    >
      <span className="mr-3 text-[#ea384c]">{icon}</span>
      {label}
    </NavLink>
  );
};

const DashboardNav: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.'
    });
  };

  return (
    <div className="w-64 h-screen bg-[#0a0a0a] border-r border-[#222] flex flex-col">
      <div className="p-4 border-b border-[#222]">
        <Logo size="small" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          <NavItem to="/dashboard" label="Dashboard" icon={<User size={18} />} />
          <NavItem to="/dashboard/account" label="Account" icon={<User size={18} />} />
          <NavItem to="/dashboard/plans" label="Training Plans" icon={<Package size={18} />} />
          <NavItem to="/dashboard/schedule" label="Schedule" icon={<Calendar size={18} />} />
          <NavItem to="/dashboard/progress" label="Progress" icon={<LineChart size={18} />} />
          <NavItem to="/dashboard/downloads" label="Downloads" icon={<Download size={18} />} />
          <NavItem to="/dashboard/payment" label="Payment" icon={<CreditCard size={18} />} />
          <NavItem to="/dashboard/support" label="Support" icon={<HelpCircle size={18} />} />
          <NavItem to="/dashboard/settings" label="Settings" icon={<Settings size={18} />} />
        </nav>
      </div>
      
      <div className="p-4 border-t border-[#222]">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#1c1c1c]"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4 text-[#ea384c]" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default DashboardNav;
