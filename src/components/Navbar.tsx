
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, LogIn, UserCircle } from 'lucide-react';
import Logo from '@/components/Logo';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/80 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <Logo size="small" />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            <NavLink to="/" label="Home" />
            <NavLink to="/plans" label="Training Plans" />
            <NavLink to="/schedule" label="Schedule" />
            <NavLink to="/plans-catalog" label="Plan Catalog" />
          </nav>
          
          {/* Authentication */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <Button 
                variant="default" 
                className="bg-sinner-red hover:bg-red-700"
                onClick={() => navigate('/dashboard')}
              >
                <UserCircle className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="bg-sinner-red hover:bg-red-700"
                onClick={() => navigate('/login')}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
          
          {/* Mobile Navigation Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-white p-2"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <MobileNavLink to="/" label="Home" />
              <MobileNavLink to="/plans" label="Training Plans" />
              <MobileNavLink to="/schedule" label="Schedule" />
              <MobileNavLink to="/plans-catalog" label="Plan Catalog" />
              {isAuthenticated ? (
                <MobileNavLink to="/dashboard" label="Dashboard" />
              ) : (
                <MobileNavLink to="/login" label="Sign In" />
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

// Desktop Nav Link Component
const NavLink = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition ${
        isActive
          ? 'text-white bg-sinner-red/20'
          : 'text-gray-300 hover:text-white hover:bg-sinner-red/10'
      }`}
    >
      {label}
    </Link>
  );
};

// Mobile Nav Link Component
const MobileNavLink = ({ to, label }: { to: string; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
    (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isActive
          ? 'text-white bg-sinner-red/20'
          : 'text-gray-300 hover:text-white hover:bg-sinner-red/10'
      }`}
    >
      {label}
    </Link>
  );
};

export default Navbar;
