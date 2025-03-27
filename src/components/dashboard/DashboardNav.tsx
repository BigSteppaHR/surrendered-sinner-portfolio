import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Package,
  Clock,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

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

interface UserSubscription {
  id: string;
  plan_name: string;
  end_date: string;
  status: string;
}

interface UserBalance {
  amount: number;
  currency: string;
}

const DashboardNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      fetchUserSubscriptionAndBalance();
    }
  }, [user]);

  const fetchUserSubscriptionAndBalance = async () => {
    setIsLoading(true);
    try {
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('id, plan_id, current_period_end, status')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('current_period_end', { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
      }
      
      if (subscriptionData) {
        setSubscription({
          id: subscriptionData.id,
          plan_name: getPlanName(subscriptionData.plan_id),
          end_date: subscriptionData.current_period_end,
          status: subscriptionData.status
        });
      }
      
      const { data: balanceData, error: balanceError } = await supabase
        .from('payment_balance')
        .select('balance, currency')
        .eq('user_id', user?.id)
        .limit(1)
        .single();
        
      if (balanceError && balanceError.code !== 'PGRST116') {
        console.error('Error fetching balance:', balanceError);
      }
      
      if (balanceData) {
        setBalance({
          amount: balanceData.balance,
          currency: balanceData.currency
        });
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanName = (planId: string): string => {
    const planNames: Record<string, string> = {
      'basic': 'Basic Plan',
      'pro': 'Pro Plan',
      'elite': 'Elite Plan',
      'price_1OxCvNGXXtKP1NLsUOjDC8bD': 'Monthly Subscription',
      'price_1OxChEGXXtKP1NLssfb58nfD': 'Annual Subscription',
    };
    
    return planNames[planId] || 'Premium Plan';
  };

  const handleLogout = async () => {
    const { success, redirectTo } = await logout();
    if (success && redirectTo) {
      navigate(redirectTo);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#333]">
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

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={toggleMenu}></div>
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-black border-r border-[#333] transition-transform transform-gpu",
          isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-6 border-b border-[#333] hidden md:flex">
            <Link to="/dashboard" className="flex items-center">
              <Logo size="small" />
            </Link>
          </div>

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

              <div className="pt-6 border-t border-[#333]">
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

          <div className="p-4 border-t border-[#333]">
            {isLoading ? (
              <div className="flex justify-center py-2">
                <div className="w-5 h-5 border-2 border-[#ea384c] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Card className="bg-[#0f0f0f] border-[#333] mb-4">
                <CardContent className="p-3 space-y-3">
                  {subscription ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Current Plan:</span>
                        <Badge className="bg-[#ea384c]">{subscription.plan_name}</Badge>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Expires: {format(new Date(subscription.end_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">No active subscription</span>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-[#ea384c]"
                        onClick={() => navigate('/dashboard/payment')}
                      >
                        Upgrade
                      </Button>
                    </div>
                  )}
                  
                  <div className="h-px bg-[#333] my-2"></div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Balance:</span>
                    <span className="font-semibold">
                      {balance ? formatCurrency(balance.amount, balance.currency) : '$0.00'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Button
              variant="outline"
              className="w-full justify-start text-[#ea384c] hover:text-white border-[#333] hover:bg-[#ea384c]/20"
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
          ? "bg-[#ea384c] text-white"
          : "text-gray-300 hover:text-white hover:bg-[#333]"
      )}
    >
      <span className="mr-3">{icon}</span>
      <span className="flex-1">{label}</span>
      {isActive && <ChevronRight className="h-4 w-4" />}
    </Link>
  );
};

export default DashboardNav;
