
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, DollarSign, Download, FileText, ReceiptText, Clock, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  payment_method: string | null;
  description: string | null;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  issued_date: string;
  due_date: string | null;
  description: string | null;
  payment_link: string | null;
}

interface UserBalance {
  amount: number;
  currency: string;
  id: string;
}

const planNames: Record<string, string> = {
  'basic': 'Basic Plan',
  'pro': 'Pro Plan',
  'elite': 'Elite Plan',
  'price_1OxCvNGXXtKP1NLsUOjDC8bD': 'Monthly Subscription',
  'price_1OxChEGXXtKP1NLssfb58nfD': 'Annual Subscription',
};

const PaymentDashboard = () => {
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPaymentData();
    }
  }, [user]);

  const fetchPaymentData = async () => {
    setIsLoading(true);
    try {
      // Fetch active subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('current_period_end', { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
      } else if (subData) {
        setActiveSubscription(subData);
      }

      // Fetch recent payments
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (paymentError) {
        console.error('Error fetching payments:', paymentError);
      } else {
        setPayments(paymentData || []);
      }

      // Fetch invoices
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id)
        .order('issued_date', { ascending: false })
        .limit(10);

      if (invoiceError) {
        console.error('Error fetching invoices:', invoiceError);
      } else {
        setInvoices(invoiceData || []);
      }

      // Fetch balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('payment_balance')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') {
        console.error('Error fetching balance:', balanceError);
      } else if (balanceData) {
        setBalance(balanceData);
      }

    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        variant: "destructive",
        title: "Data loading error",
        description: "Failed to load your payment information."
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

  const getPlanName = (planId: string): string => {
    return planNames[planId] || 'Premium Plan';
  };

  const handleAddFunds = () => {
    navigate('/payment-portal');
  };

  const handleUpgradeSubscription = () => {
    navigate('/plans-catalog');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    if (invoice.payment_link) {
      window.open(invoice.payment_link, '_blank');
    } else {
      toast({
        title: "Invoice details",
        description: "Payment link not available for this invoice."
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'succeeded':
      case 'active':
      case 'complete':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
      case 'canceled':
      case 'expired':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black text-white">
      <DashboardNav />
      
      <div className="flex-1 p-6 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Payment & Billing</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-[#ea384c] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Subscription Card */}
                <Card className="bg-zinc-900 border-[#333] hover:border-[#ea384c] transition-duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#ea384c]" />
                      Subscription
                    </CardTitle>
                    <CardDescription>Your current training subscription</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {activeSubscription ? (
                      <div className="space-y-4">
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-lg text-white">
                              {getPlanName(activeSubscription.plan_id)}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(activeSubscription.status)}`}>
                              {activeSubscription.status.charAt(0).toUpperCase() + activeSubscription.status.slice(1)}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex justify-between">
                              <span>Current period:</span>
                              <span className="text-white">
                                {format(new Date(activeSubscription.current_period_start), 'MMM d, yyyy')} — 
                                {format(new Date(activeSubscription.current_period_end), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Renewal in:</span>
                              <span className="text-white">
                                {Math.ceil((new Date(activeSubscription.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button 
                            variant="outline" 
                            className="flex-1 border-[#333] text-gray-300 hover:bg-[#333] hover:text-white"
                          >
                            Manage Plan
                          </Button>
                          <Button 
                            className="flex-1 bg-[#ea384c] hover:bg-red-700 transition-colors"
                            onClick={handleUpgradeSubscription}
                          >
                            Upgrade
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 py-8 text-center">
                          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                          <h3 className="font-medium text-lg text-gray-300 mb-2">No Active Subscription</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            Get a training subscription for personalized workout plans and expert guidance.
                          </p>
                        </div>
                        <Button 
                          className="w-full bg-[#ea384c] hover:bg-red-700 transition-colors"
                          onClick={handleUpgradeSubscription}
                        >
                          View Subscription Plans
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Account Balance Card */}
                <Card className="bg-zinc-900 border-[#333] hover:border-[#ea384c] transition-duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[#ea384c]" />
                      Account Balance
                    </CardTitle>
                    <CardDescription>Your current account balance</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 mb-4">
                      <div className="text-center mb-4">
                        <p className="text-gray-400 text-sm mb-1">Available balance</p>
                        <h2 className="text-3xl font-bold text-white">
                          {balance ? formatCurrency(balance.amount, balance.currency) : '$0.00'}
                        </h2>
                      </div>
                      <div className="flex items-center justify-center text-xs text-gray-400 mb-2">
                        <Shield className="h-3 w-3 mr-1 text-[#ea384c]" />
                        <span>Secure payment processing with Stripe</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-[#ea384c] hover:bg-red-700 transition-colors"
                      onClick={handleAddFunds}
                    >
                      Add Funds
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="transactions" className="mb-6">
                <TabsList className="bg-zinc-800 border border-[#333]">
                  <TabsTrigger value="transactions" className="data-[state=active]:bg-[#ea384c]">
                    Transactions
                  </TabsTrigger>
                  <TabsTrigger value="invoices" className="data-[state=active]:bg-[#ea384c]">
                    Invoices
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="transactions" className="mt-4">
                  <Card className="bg-zinc-900 border-[#333]">
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Transactions</CardTitle>
                      <CardDescription>Your payment history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {payments.length === 0 ? (
                        <div className="text-center py-6">
                          <ReceiptText className="h-12 w-12 mx-auto text-gray-600 mb-2" />
                          <p className="text-gray-400">No transaction history found</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {payments.map((payment) => (
                            <div 
                              key={payment.id} 
                              className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 flex justify-between items-center"
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-full ${payment.status.toLowerCase() === 'succeeded' ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                                  <CreditCard className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">
                                    {payment.description || 'Payment'}
                                  </p>
                                  <div className="flex items-center text-xs text-gray-400 mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{format(new Date(payment.created_at), 'MMM d, yyyy')}</span>
                                    {payment.payment_method && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <span>{payment.payment_method}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-white">
                                  {formatCurrency(payment.amount, payment.currency)}
                                </p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(payment.status)}`}>
                                  {payment.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="justify-center">
                      <Button variant="link" className="text-[#ea384c]">
                        View All Transactions
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="invoices" className="mt-4">
                  <Card className="bg-zinc-900 border-[#333]">
                    <CardHeader>
                      <CardTitle className="text-lg">Invoices</CardTitle>
                      <CardDescription>Your billing documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {invoices.length === 0 ? (
                        <div className="text-center py-6">
                          <FileText className="h-12 w-12 mx-auto text-gray-600 mb-2" />
                          <p className="text-gray-400">No invoices found</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {invoices.map((invoice) => (
                            <div 
                              key={invoice.id} 
                              className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 flex justify-between items-center"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="p-2 rounded-full bg-gray-500/10">
                                  <FileText className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">
                                    {invoice.description || 'Invoice'}
                                  </p>
                                  <div className="flex items-center text-xs text-gray-400 mt-1">
                                    <span>Issued: {format(new Date(invoice.issued_date), 'MMM d, yyyy')}</span>
                                    {invoice.due_date && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <span>Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div className="text-right mr-4">
                                  <p className="font-medium text-white">
                                    {formatCurrency(invoice.amount, invoice.currency)}
                                  </p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                                    {invoice.status}
                                  </span>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleViewInvoice(invoice)}
                                  disabled={!invoice.payment_link}
                                  className="text-gray-400 hover:text-white hover:bg-[#333]"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="justify-center">
                      <Button variant="link" className="text-[#ea384c]">
                        View All Invoices
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
              
              {/* Payment Methods Section */}
              <Card className="bg-zinc-900 border-[#333] mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#ea384c]" />
                    Payment Methods
                  </CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-between bg-zinc-800 hover:bg-zinc-700 text-left font-normal"
                    onClick={() => navigate('/payment-portal')}
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-[#ea384c]/10 mr-3">
                        <CreditCard className="h-5 w-5 text-[#ea384c]" />
                      </div>
                      <span>Manage payment methods in payment portal</span>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;
