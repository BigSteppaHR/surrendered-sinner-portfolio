
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  CreditCard, 
  User, 
  BarChart, 
  FileText,
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Sessions", path: "/dashboard/sessions", icon: Calendar },
  { name: "Training Plans", path: "/dashboard/plans", icon: FileText },
  { name: "Payments", path: "/dashboard/payment", icon: CreditCard },
  { name: "Progress", path: "/dashboard/progress", icon: BarChart },
  { name: "Account", path: "/dashboard/account", icon: User },
];

const DashboardNav = () => {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
  };

  const NavItem = ({ item, isMobile = false }: { item: typeof navItems[0], isMobile?: boolean }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <Link 
        to={item.path}
        onClick={() => isMobile && setIsOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
          isActive 
            ? "bg-[#ea384c]/20 text-white" 
            : "text-gray-400 hover:text-white hover:bg-[#ea384c]/10"
        )}
      >
        <item.icon className="h-5 w-5" />
        <span>{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Nav */}
      <div className="md:hidden flex items-center justify-between bg-[#111111] p-4 border-b border-[#333333]">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-[#333333]">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
            <AvatarFallback className="bg-[#ea384c] text-white">
              {profile?.full_name ? getInitials(profile.full_name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium text-white">{profile?.full_name || "User"}</h2>
            <p className="text-xs text-gray-400">{profile?.email || ""}</p>
          </div>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-[#111111] p-0 border-r border-[#333333]">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-[#333333]">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-[#333333]">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                    <AvatarFallback className="bg-[#ea384c] text-white">
                      {profile?.full_name ? getInitials(profile.full_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium text-white">{profile?.full_name || "User"}</h2>
                    <p className="text-xs text-gray-400">{profile?.email || ""}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto py-6 px-4">
                <div className="flex justify-center mb-6">
                  <img 
                    src="/lovable-uploads/dad61b9e-a273-48d8-8d79-5c7e30d99564.png" 
                    alt="Surrendered Sinner Fitness" 
                    className="h-16 w-16"
                  />
                </div>
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <NavItem key={item.path} item={item} isMobile />
                  ))}
                </nav>
              </div>
              
              <div className="p-4 border-t border-[#333333]">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-gray-400 hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:flex flex-col w-64 bg-[#111111] border-r border-[#333333] min-h-screen">
        <div className="p-6 border-b border-[#333333]">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-[#333333]">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
              <AvatarFallback className="bg-[#ea384c] text-white">
                {profile?.full_name ? getInitials(profile.full_name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium text-white">{profile?.full_name || "User"}</h2>
              <p className="text-xs text-gray-400">{profile?.email || ""}</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="flex justify-center py-6">
            <img 
              src="/lovable-uploads/dad61b9e-a273-48d8-8d79-5c7e30d99564.png" 
              alt="Surrendered Sinner Fitness" 
              className="h-28 w-28"
            />
          </div>
          
          <div className="px-4 py-6">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </nav>
          </div>
        </div>
        
        <div className="p-4 border-t border-[#333333]">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#ea384c]/5"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </>
  );
};

export default DashboardNav;
