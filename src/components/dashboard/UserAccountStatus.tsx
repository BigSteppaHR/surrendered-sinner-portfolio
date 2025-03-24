
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, DollarSign } from 'lucide-react';

// Types
type UserBalance = {
  balance: number;
  currency: string;
};

type UserSubscription = {
  status: string;
  plan_id: string;
  current_period_end: string | null;
};

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const UserAccountStatus = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
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
    
    fetchUserData();
  }, [user]);
  
  if (isLoading) {
    return (
      <Card className="bg-[#111111] border-[#333333] w-full mb-2">
        <CardContent className="pt-4 pb-3">
          <div className="space-y-2 animate-pulse">
            <div className="h-5 w-24 bg-gray-800 rounded"></div>
            <div className="h-4 w-32 bg-gray-800 rounded"></div>
            <Separator className="my-2 bg-gray-800" />
            <div className="h-5 w-28 bg-gray-800 rounded"></div>
            <div className="h-4 w-36 bg-gray-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-[#111111] border-[#333333] w-full mb-2">
      <CardContent className="pt-4 pb-3">
        {/* Balance Section */}
        <div className="flex items-center mb-2">
          <DollarSign className="h-4 w-4 text-sinner-red mr-2" />
          <span className="font-medium">Your Balance</span>
        </div>
        
        <div className="ml-6 text-sm text-gray-400">
          {balance ? (
            formatCurrency(balance.balance, balance.currency)
          ) : (
            "No balance information"
          )}
        </div>
        
        <Separator className="my-2 bg-[#333333]" />
        
        {/* Subscription Section */}
        <div className="flex items-center mb-2">
          <CreditCard className="h-4 w-4 text-sinner-red mr-2" />
          <span className="font-medium">Subscription</span>
        </div>
        
        <div className="ml-6 text-sm">
          {subscription ? (
            <>
              <div className="flex items-center">
                <span className="text-white">
                  {subscription.plan_id.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
                </span>
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-sinner-red text-white rounded-full">
                  {subscription.status}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="text-xs text-gray-400 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-400">No active subscription</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserAccountStatus;
