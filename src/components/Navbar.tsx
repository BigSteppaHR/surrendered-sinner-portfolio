import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown,
  ShoppingBag,
  Dumbbell,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false); // Close the mobile menu on route change
  }, [location]);

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/#services' },
    { name: 'About', path: '/#about' },
    { name: 'Plans', path: '/plans' },
    { name: 'Shop', path: '/#shop' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Contact', path: '/#contact' },
  ];

  const handleLogout = async () => {
    const { success, redirectTo } = await logout();
    if (success && redirectTo) {
      window.location.href = redirectTo;
    } else {
      // Handle logout failure (optional)
      console.error('Logout failed');
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 shadow-lg py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center font-bold text-xl">
          <img
            src="/lovable-uploads/00eac127-7491-42ac-a058-169d184c1e94.png"
            alt="Surrendered Sinner Fitness Logo"
            className="h-10 w-auto mr-2"
          />
          <span className="text-sinner-red">Surrendered</span>Sinner
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="text-white hover:text-sinner-red transition-colors duration-200"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons / Dropdown */}
        <div className="hidden lg:flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="absolute right-0 mt-2 w-48 bg-black border border-zinc-800 rounded-md shadow-lg z-50">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center space-x-2">
                    <Dumbbell className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/schedule" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="cursor-pointer" onSelect={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu Content */}
        {isMenuOpen && (
          <div className="fixed top-0 left-0 w-full h-screen bg-black/95 z-40 flex flex-col items-center justify-center">
            <nav className="flex flex-col items-center space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-white text-lg hover:text-sinner-red transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)} // Close menu on item click
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="mt-8 flex flex-col items-center space-y-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-white hover:text-sinner-red transition-colors duration-200">
                    Dashboard
                  </Link>
                  <Button variant="outline" onClick={handleLogout} className="border-zinc-700 hover:bg-zinc-800">
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
