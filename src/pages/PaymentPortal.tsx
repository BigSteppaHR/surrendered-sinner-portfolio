
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
import { ArrowLeft, CreditCard, DollarSign, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import Logo from '@/components/Logo';
import { useSearchParams, Link } from 'react-router-dom';

interface UserBalance {
  balance: number;
  currency: string;
}

const PaymentPortal = () => {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check URL parameters for payment status
    const status = searchParams.get('status');
    if (status === 'success') {
      setPaymentStatus('success');
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully!",
        variant: "default"
      });
    } else if (status === 'error') {
      setPaymentStatus('error');
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    }
    
    if (user) {
      fetchUserBalance();
    }
    
    // Clean up URL params after reading them
    if (status) {
      navigate('/payment-portal', { replace: true });
    }
  }, [user, searchParams, navigate]);

  const fetchUserBalance = async () => {
    try {
      setIsLoading(true);
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
          balance: data.balance,
          currency: data.currency
        });
      }
    } catch (error) {
      console.error('Error fetching user balance:', error);
    } finally {
      setIsLoading(false);
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

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to add funds."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a payment record in the database
      const amountInCents = Math.round(parseFloat(amount) * 100);
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          amount: amountInCents,
          user_id: user.id,
          status: 'pending',
          metadata: {
            source: 'payment_portal',
            payment_type: 'add_funds'
          }
        })
        .select()
        .single();
        
      if (paymentError) throw paymentError;
      
      // Call the Stripe helper function to create a payment intent
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('stripe-helper', {
        body: {
          action: 'createPaymentIntent',
          params: {
            amount: amountInCents,
            currency: 'usd',
            payment_id: paymentData.id,
            description: `Add funds: $${amount}`
          }
        }
      });
      
      if (stripeError) throw stripeError;
      
      // Redirect to a payment confirmation page with the client secret
      navigate(`/payment-process?client_secret=${stripeData.client_secret}&payment_id=${paymentData.id}&amount=${amount}`);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "There was a problem initiating your payment."
      });
    } finally {
      setIsSubmitting(false);
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
        {paymentStatus === 'success' && (
          <div className="mb-6 bg-green-900/30 border border-green-700 rounded-lg p-4 flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-400">Payment Successful</h3>
              <p className="text-sm text-gray-300">Your payment has been processed successfully. Your account has been updated.</p>
            </div>
          </div>
        )}
        
        {paymentStatus === 'error' && (
          <div className="mb-6 bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-400">Payment Failed</h3>
              <p className="text-sm text-gray-300">There was an error processing your payment. Please try again or contact support if the issue persists.</p>
            </div>
          </div>
        )}
        
        <div className="mb-6 bg-zinc-900 border border-[#333] rounded-lg p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Account Balance</h2>
            <p className="text-gray-400">Current available funds</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {isLoading ? (
                <span className="inline-block h-6 w-24 bg-gray-700 rounded animate-pulse"></span>
              ) : (
                balance ? formatCurrency(balance.balance, balance.currency) : '$0.00'
              )}
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
            <TabsTrigger value="history" className="data-[state=active]:bg-[#ea384c]">
              Payment History
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
                  disabled={isSubmitting || isLoading || !user}
                >
                  {isSubmitting ? (
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
          
          <TabsContent value="history" className="mt-4">
            <Card className="bg-zinc-900 border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-[#ea384c]" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  View your payment transaction history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentHistory userId={user?.id} />
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

// PaymentHistory Component
interface PaymentHistoryProps {
  userId: string | undefined;
}

const PaymentHistory = ({ userId }: PaymentHistoryProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchPaymentHistory();
      
      // Set up realtime subscription for payment history updates
      const channel = supabase
        .channel('payment-history-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'payment_history', filter: `user_id=eq.${userId}` }, 
          () => fetchPaymentHistory()
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const fetchPaymentHistory = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
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
  
  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/20">
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20">
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/20">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge>{status}</Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-6 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ea384c] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-400">Loading your payment history...</p>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-400">You don't have any payment transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map(transaction => (
            <TableRow key={transaction.id}>
              <TableCell>
                {new Date(transaction.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{transaction.description || 'Payment'}</TableCell>
              <TableCell>
                {formatCurrency(transaction.amount, transaction.currency)}
              </TableCell>
              <TableCell>{renderStatusBadge(transaction.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Import missing components
import { ClockIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default PaymentPortal;
