
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, DollarSign, Shield } from 'lucide-react';
import { format } from 'date-fns';
import Logo from '@/components/Logo';

interface UserBalance {
  amount: number;
  currency: string;
}

const PaymentPortal = () => {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserBalance();
    }
  }, [user]);

  const fetchUserBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_balance')
        .select('balance, currency')
        .eq('user_id', user?.id)
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching balance:', error);
      } else if (data) {
        setBalance({
          amount: data.balance,
          currency: data.currency
        });
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
    }
  };

  const handleAddFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero."
      });
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would redirect to Stripe or another payment processor
      // For now, we'll just show a success message and navigate
      toast({
        title: "Payment processing",
        description: "You're being redirected to the payment processor."
      });
      
      // Simulate payment processing delay
      setTimeout(() => {
        navigate('/payment-success');
      }, 1500);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "There was a problem processing your payment."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="border-b border-[#333] py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Logo size="small" />
            <span className="ml-4 text-xl font-semibold">Payment Portal</span>
          </div>
          <Button 
            variant="ghost" 
            className="flex items-center text-gray-400 hover:text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 bg-zinc-900 border border-[#333] rounded-lg p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Account Balance</h2>
            <p className="text-gray-400">Current available funds</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {balance ? formatCurrency(balance.amount, balance.currency) : '$0.00'}
            </p>
            <p className="text-sm text-gray-400">
              Updated: {format(new Date(), 'MMMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="add-funds" className="mb-8">
          <TabsList className="bg-zinc-800 border border-[#333]">
            <TabsTrigger value="add-funds" className="data-[state=active]:bg-[#ea384c]">
              Add Funds
            </TabsTrigger>
            <TabsTrigger value="payment-methods" className="data-[state=active]:bg-[#ea384c]">
              Payment Methods
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add-funds" className="mt-4">
            <Card className="bg-zinc-900 border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#ea384c]" />
                  Add Funds to Your Account
                </CardTitle>
                <CardDescription>
                  Add money to your account to pay for training sessions and subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to add</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
                
                <div className="bg-[#ea384c]/10 border border-[#ea384c]/20 rounded-lg p-3">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-[#ea384c] mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Secure Payment Processing</p>
                      <p className="text-xs text-gray-400">
                        All payment information is encrypted and securely processed through Stripe.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-[#ea384c] hover:bg-red-700 transition-colors"
                  onClick={handleAddFunds}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Add Funds to Account'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="payment-methods" className="mt-4">
            <Card className="bg-zinc-900 border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#ea384c]" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="py-8 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Payment Methods</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  You currently have no payment methods on file. Add a card to quickly process payments.
                </p>
                <Button 
                  className="bg-[#ea384c] hover:bg-red-700 transition-colors"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "This feature will be available in a future update."
                    });
                  }}
                >
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-gray-400 text-sm">
          <p>Need help with payments? Contact our support team.</p>
          <Button 
            variant="link" 
            className="text-[#ea384c] hover:text-red-400"
            onClick={() => navigate('/dashboard/support')}
          >
            Contact Support
          </Button>
        </div>
      </main>
      
      <footer className="border-t border-[#333] py-4 text-center text-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Fitness Training. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PaymentPortal;
