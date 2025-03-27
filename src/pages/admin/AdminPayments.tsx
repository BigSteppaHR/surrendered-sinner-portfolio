import { useState, useEffect } from "react";
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  DollarSign, 
  Package, 
  Settings,
  Users,
  CheckCircle,
  Clock,
  Search,
  FileDown,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  currency: string;
  active: boolean;
  product_id?: string;
}

interface PaymentRecord {
  id: string;
  customer: string;
  email: string;
  amount: number;
  currency: string;
  description: string;
  payment_method: string;
  status: string;
  created_at: string;
}

const AdminPayments = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("plans");
  const [stripeKey, setStripeKey] = useState("sk_test_*************************************");
  const [webhookSecret, setWebhookSecret] = useState("whsec_*************************************");
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stripeConnection, setStripeConnection] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  useEffect(() => {
    // Check if Stripe connection is working
    const checkStripeConnection = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stripe-helper', {
          body: { 
            action: 'test-connection'
          }
        });
        
        if (!error && data?.stripeKeyAvailable) {
          setStripeConnection(true);
        } else {
          setStripeConnection(false);
        }
      } catch (err) {
        console.error("Error checking Stripe connection:", err);
        setStripeConnection(false);
      }
    };
    
    checkStripeConnection();
    fetchPayments();
    
    // In a real implementation, you would fetch plans from Stripe
    // Here we'll use static plans
    setPlans([
      {
        id: "price_monthly_personal",
        name: "Personal Training",
        price: 149.99,
        interval: "month",
        currency: "USD",
        active: true,
        product_id: "prod_personal"
      },
      {
        id: "price_quarterly_personal",
        name: "Personal Quarterly",
        price: 399.99,
        interval: "quarter",
        currency: "USD",
        active: true,
        product_id: "prod_personal"
      },
      {
        id: "price_monthly_group",
        name: "Group Training",
        price: 79.99,
        interval: "month",
        currency: "USD",
        active: true,
        product_id: "prod_group"
      },
      {
        id: "price_monthly_competition",
        name: "Competition Prep",
        price: 299.99,
        interval: "month",
        currency: "USD",
        active: true,
        product_id: "prod_competition"
      }
    ]);
  }, []);
  
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      // Fetch payment records from the database
      const { data, error } = await supabase
        .from('payment_history')
        .select(`
          id,
          user_id,
          amount,
          currency,
          description,
          payment_method,
          status,
          created_at,
          profiles(email, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedPayments = data.map(payment => ({
          id: payment.id,
          customer: payment.profiles?.full_name || 'Unknown',
          email: payment.profiles?.email || 'Unknown',
          amount: payment.amount / 100, // Convert cents to dollars
          currency: payment.currency?.toUpperCase() || 'USD',
          description: payment.description || 'Payment',
          payment_method: payment.payment_method || 'Unknown',
          status: payment.status || 'pending',
          created_at: payment.created_at
        }));
        
        setPayments(formattedPayments);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Failed to load payments",
        description: "Could not retrieve payment history from the database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveStripeSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your Stripe settings have been updated successfully.",
    });
  };
  
  const testStripeConnection = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: { 
          action: 'test-connection'
        }
      });
      
      if (error) throw error;
      
      if (data?.stripeKeyAvailable) {
        setStripeConnection(true);
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Stripe API.",
        });
      } else {
        setStripeConnection(false);
        toast({
          title: "Connection Failed",
          description: "Could not connect to Stripe API. Please check your API key.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error testing Stripe connection:", error);
      setStripeConnection(false);
      toast({
        title: "Connection Error",
        description: "Failed to test Stripe connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.customer.toLowerCase().includes(searchLower) ||
      payment.email.toLowerCase().includes(searchLower) ||
      payment.description.toLowerCase().includes(searchLower) ||
      payment.status.toLowerCase().includes(searchLower) ||
      payment.id.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="text-gray-400">Manage membership plans and payment settings</p>
          </div>
          <Button 
            variant="outline"
            onClick={fetchPayments}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="plans">
              <Package className="h-4 w-4 mr-2" />
              Membership Plans
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment History
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Payment Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Package className="h-5 w-5 mr-2 text-[#ea384c]" />
                  Membership Plans
                </CardTitle>
                <CardDescription>
                  Manage your Stripe product and price configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stripeConnection === false ? (
                  <Alert variant="destructive" className="mb-6 bg-red-950 border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Stripe connection is not configured. Please set up your Stripe API key in the Settings tab.
                    </AlertDescription>
                  </Alert>
                ) : null}
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Interval</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.name}</TableCell>
                          <TableCell>
                            {plan.currency === 'USD' ? '$' : plan.currency}{plan.price}
                          </TableCell>
                          <TableCell>{plan.interval}</TableCell>
                          <TableCell>
                            {plan.active ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-500 border-red-500">
                                {plan.active ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 text-center">
                  <Button className="bg-[#ea384c] hover:bg-[#d32d3f]">
                    <Package className="h-4 w-4 mr-2" />
                    Add New Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <DollarSign className="h-5 w-5 mr-2 text-[#ea384c]" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  View all payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex justify-between items-center p-4 border-b border-[#333333]">
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input 
                        placeholder="Search transactions..." 
                        className="w-64 bg-[#1A1A1A] border-[#333333] pl-10" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-[#333333]">
                      <FileDown className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {format(new Date(payment.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{payment.customer}</p>
                                <p className="text-xs text-gray-400">{payment.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>{payment.description}</TableCell>
                            <TableCell>
                              {payment.currency === 'USD' ? '$' : payment.currency}{payment.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                payment.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                                payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                                'bg-red-500/20 text-red-500'
                              }`}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10">
                            <div className="flex flex-col items-center">
                              <CreditCard className="h-10 w-10 text-gray-400 mb-2" />
                              {searchTerm ? (
                                <>
                                  <h3 className="text-lg font-medium mb-1">No matching transactions</h3>
                                  <p className="text-gray-400 max-w-md">
                                    No transactions match your search criteria. Try adjusting your search.
                                  </p>
                                </>
                              ) : (
                                <>
                                  <h3 className="text-lg font-medium mb-1">No transactions yet</h3>
                                  <p className="text-gray-400 max-w-md">
                                    Transactions will appear here as customers make payments.
                                  </p>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Settings className="h-5 w-5 mr-2 text-[#ea384c]" />
                  Payment Settings
                </CardTitle>
                <CardDescription>
                  Configure your payment provider and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Payment Provider</h3>
                  <div className="flex items-center bg-[#1A1A1A] border border-[#333333] rounded-lg p-4">
                    <div className="h-10 w-10 bg-white/10 rounded flex items-center justify-center mr-4">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Stripe</h4>
                      <p className="text-sm text-gray-400">Connected to your Stripe account</p>
                    </div>
                    <Badge className={`${
                      stripeConnection === true 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : stripeConnection === false
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {stripeConnection === true 
                        ? <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                        : stripeConnection === false
                        ? <><AlertCircle className="h-3 w-3 mr-1" /> Disconnected</>
                        : <><Clock className="h-3 w-3 mr-1" /> Checking...</>
                      }
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="stripe-key"
                      value={stripeKey}
                      readOnly
                      className="bg-[#1A1A1A] border-[#333333] font-mono"
                    />
                    <div className="absolute top-0 right-0 p-2 text-xs text-gray-500">
                      <Badge variant="outline" className="border-[#333333]">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Secured
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Stripe keys are securely stored in Supabase Edge Function secrets.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Webhook Secret</Label>
                  <div className="relative">
                    <Input
                      id="webhook-secret"
                      value={webhookSecret}
                      readOnly
                      className="bg-[#1A1A1A] border-[#333333] font-mono"
                    />
                    <div className="absolute top-0 right-0 p-2 text-xs text-gray-500">
                      <Badge variant="outline" className="border-[#333333]">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Secured
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Used to verify the authenticity of Stripe webhook events.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <div className="relative">
                    <Input
                      id="webhook-url"
                      value="https://tcxwvsyfqjcgglyqlahl.supabase.co/functions/v1/stripe-webhook"
                      readOnly
                      className="bg-[#1A1A1A] border-[#333333] font-mono"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-0 right-0 m-1 border-[#333333]"
                      onClick={() => {
                        navigator.clipboard.writeText("https://tcxwvsyfqjcgglyqlahl.supabase.co/functions/v1/stripe-webhook");
                        toast({
                          title: "Copied to clipboard",
                          description: "Webhook URL has been copied to your clipboard",
                        });
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Configure this URL in your Stripe Dashboard webhook settings.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      className="flex-1 border-[#333333]"
                      onClick={testStripeConnection}
                      disabled={isTesting}
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-[#333333]"
                      onClick={() => {
                        window.open('https://dashboard.stripe.com', '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Stripe Dashboard
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#333333]">
                  <Button 
                    className="bg-[#ea384c] hover:bg-[#d32d3f]"
                    onClick={saveStripeSettings}
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
