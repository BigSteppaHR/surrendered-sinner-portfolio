import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react";

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => {
  return (
    <Link
      to={to}
      className={`text-gray-300 hover:text-white transition-colors relative group ${active ? 'text-white' : ''}`}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#ea384c] transform origin-left scale-x-100 transition-transform"></span>
      )}
    </Link>
  );
};

const Navbar = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-black py-4 border-b border-[#333]">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Logo />

        <NavLinks />

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button variant="secondary">Dashboard</Button>
              </Link>
              <Button onClick={signOut} variant="outline">Sign Out</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" className="p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-black border-l border-[#333] w-64">
            <SheetHeader className="text-left">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate the site
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col space-y-4 mt-4">
              <Link to="/" className="block py-2 text-gray-300 hover:text-white transition-colors">Home</Link>
              <Link to="/about" className="block py-2 text-gray-300 hover:text-white transition-colors">About</Link>
              <Link to="/events" className="block py-2 text-gray-300 hover:text-white transition-colors">Events</Link>
              <a 
                href="https://alphanutritionlabs.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
              >
                Shop
              </a>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block py-2 text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                  <Button onClick={signOut} variant="outline">Sign Out</Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2 text-gray-300 hover:text-white transition-colors">Log In</Link>
                  <Link to="/signup" className="block py-2 text-gray-300 hover:text-white transition-colors">Sign Up</Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

// Inside the Navbar component, update the navigation links section
const NavLinks = () => {
  const pathname = useLocation().pathname;
  
  return (
    <div className="hidden md:flex space-x-6">
      <NavLink to="/" active={pathname === '/'}>Home</NavLink>
      <NavLink to="/about" active={pathname === '/about'}>About</NavLink>
      <NavLink to="/events" active={pathname === '/events'}>Events</NavLink>
      <a 
        href="https://alphanutritionlabs.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-gray-300 hover:text-white transition-colors relative group"
      >
        Shop
        <span className="absolute -top-1 -right-1 bg-[#ea384c] text-white text-[10px] rounded-full px-1 flex items-center justify-center">
          ↗
        </span>
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#ea384c] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></span>
      </a>
    </div>
  );
};

export default Navbar;
