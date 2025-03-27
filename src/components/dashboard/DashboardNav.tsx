
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LayoutDashboard, Calendar, ChartBar, CreditCard, LifeBuoy, Settings, Menu, X, LogOut, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Define types for subscription and balance data
interface UserBalance {
  balance: number;
  currency: string;
}

interface UserSubscription {
  status: string;
  plan_id: string;
  current_period_end: string | null;
}

const DashboardNav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { logout, profile, user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserData();
      
      // Set up realtime subscription for payment balance updates
      const balanceChannel = supabase
        .channel('payment-balance-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'payment_balance', filter: `user_id=eq.${user.id}` }, 
          () => fetchUserData()
        )
        .subscribe();
        
      // Set up realtime subscription for subscription updates
      const subChannel = supabase
        .channel('subscription-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}` }, 
          () => fetchUserData()
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(balanceChannel);
        supabase.removeChannel(subChannel);
      };
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    try {
      // Fetch user balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('payment_balance')
        .select('balance, currency')
        .eq('user_id', user.id)
        .single();
        
      if (balanceError && balanceError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - not an error in this case
        console.error('Error fetching balance:', balanceError);
      }
      
      // Fetch active subscription if any
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('status, plan_id, current_period_end')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
        
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subscriptionError);
      }
      
      if (balanceData) {
        setBalance(balanceData);
      }
      
      if (subscriptionData) {
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
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
              {/* Account Balance & Subscription Status */}
              {isLoading ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-24 bg-gray-800" />
                  <Skeleton className="h-3 w-32 bg-gray-800" />
                  <Separator className="my-2 bg-gray-800" />
                  <Skeleton className="h-4 w-28 bg-gray-800" />
                  <Skeleton className="h-3 w-36 bg-gray-800" />
                </div>
              ) : (
                <div className="p-4 bg-[#111] rounded-md mb-4 text-sm">
                  {/* Balance Section */}
                  <div className="flex items-center mb-1">
                    <CreditCard className="h-3.5 w-3.5 text-sinner-red mr-1.5" />
                    <span className="font-medium text-sm">Account Balance</span>
                  </div>
                  <div className="ml-5 text-xs text-gray-400 mb-2">
                    {balance ? formatCurrency(balance.balance, balance.currency) : "$0.00"}
                  </div>
                  
                  <Separator className="my-2 bg-[#222]" />
                  
                  {/* Subscription Section */}
                  <div className="flex items-center mb-1">
                    <Calendar className="h-3.5 w-3.5 text-sinner-red mr-1.5" />
                    <span className="font-medium text-sm">Subscription</span>
                  </div>
                  <div className="ml-5 text-xs">
                    {subscription ? (
                      <>
                        <div className="flex items-center">
                          <span className="text-white">
                            {subscription.plan_id.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
                          </span>
                          <span className="ml-1.5 px-1 py-0.5 text-[10px] bg-sinner-red text-white rounded-full">
                            {subscription.status}
                          </span>
                        </div>
                        {subscription.current_period_end && (
                          <div className="text-[10px] text-gray-400 flex items-center mt-0.5">
                            <Calendar className="h-2.5 w-2.5 mr-1" />
                            Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">No active subscription</span>
                    )}
                  </div>
                </div>
              )}
              
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
