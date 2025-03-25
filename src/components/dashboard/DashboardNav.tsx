
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Home,
  Calendar,
  FileText,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart2,
  HelpCircle,
  Bell,
  MessageSquare
} from 'lucide-react';

const DashboardNav = () => {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success && result.redirectTo) {
      navigate(result.redirectTo);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateTo = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Schedule', path: '/schedule', icon: <Calendar size={20} /> },
    { name: 'Training Plans', path: '/plans', icon: <FileText size={20} /> },
    { name: 'Progress', path: '/progress', icon: <BarChart2 size={20} /> },
    { name: 'Support', path: '/support', icon: <MessageSquare size={20} /> },
    { name: 'Account', path: '/account', icon: <User size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Nav */}
      <div className="flex md:hidden justify-between items-center p-4 bg-black text-white border-b border-[#ea384c]/20">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-white">
            SURRENDERED<span className="text-[#ea384c]">SINNER</span>
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          className="text-white hover:bg-[#ea384c]/10"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black pt-16">
          <div className="flex flex-col p-4 space-y-2 overflow-y-auto max-h-screen">
            {profile && (
              <div className="flex items-center p-4 border-b border-[#ea384c]/20 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#ea384c]/20 flex items-center justify-center text-[#ea384c] font-bold mr-3">
                  {profile.full_name ? profile.full_name.charAt(0) : '?'}
                </div>
                <div>
                  <p className="font-medium text-white">{profile.full_name || 'Athlete'}</p>
                  <p className="text-sm text-gray-400">{profile.email}</p>
                </div>
              </div>
            )}

            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={`w-full justify-start pl-4 ${
                  isActive(item.path)
                    ? 'bg-[#ea384c]/10 text-[#ea384c] font-medium'
                    : 'text-white hover:bg-[#ea384c]/5 hover:text-[#ea384c]'
                }`}
                onClick={() => navigateTo(item.path)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Button>
            ))}

            <div className="border-t border-[#ea384c]/20 mt-4 pt-4">
              <Button
                variant="ghost"
                className="w-full justify-start pl-4 text-white hover:bg-[#ea384c]/5 hover:text-[#ea384c]"
                onClick={handleLogout}
              >
                <span className="mr-2">
                  <LogOut size={20} />
                </span>
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col bg-black border-r border-[#ea384c]/20 fixed">
        <div className="p-4 border-b border-[#ea384c]/20">
          <h2 className="text-xl font-bold text-white text-center">
            SURRENDERED<span className="text-[#ea384c]">SINNER</span>
          </h2>
        </div>

        {profile && (
          <div className="flex items-center p-4 border-b border-[#ea384c]/20">
            <div className="w-10 h-10 rounded-full bg-[#ea384c]/20 flex items-center justify-center text-[#ea384c] font-bold mr-3">
              {profile.full_name ? profile.full_name.charAt(0) : '?'}
            </div>
            <div>
              <p className="font-medium text-white">{profile.full_name || 'Athlete'}</p>
              <p className="text-sm text-gray-400 truncate max-w-[140px]">{profile.email}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={`w-full justify-start ${
                isActive(item.path)
                  ? 'bg-[#ea384c]/10 text-[#ea384c] font-medium'
                  : 'text-white hover:bg-[#ea384c]/5 hover:text-[#ea384c]'
              }`}
              onClick={() => navigateTo(item.path)}
            >
              <span className="mr-2">{item.icon}</span>
              {item.name}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#ea384c]/20">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-[#ea384c]/5 hover:text-[#ea384c]"
            onClick={handleLogout}
          >
            <span className="mr-2">
              <LogOut size={20} />
            </span>
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default DashboardNav;
