
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Check, CreditCard, DollarSign, CalendarDays, Users, BarChart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
  const { isAuthenticated, isLoading, profile, isInitialized } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("subscription");
  const [amount, setAmount] = useState("50");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
  }, [isAuthenticated, isLoading, isInitialized]);

  const subscriptionPlans = [
    {
      id: "monthly",
      name: "Monthly Coaching",
      price: "$199/month",
      description: "Elite fitness coaching subscription with monthly check-ins",
      features: [
        "Personalized workout plans",
        "Nutrition guidance",
        "Weekly check-ins",
        "Email/text support",
        "Access to workout library"
      ]
    },
    {
      id: "quarterly",
      name: "Quarterly Package",
      price: "$549/quarter",
      description: "Save 8% with our quarterly coaching package",
      features: [
        "Everything in Monthly plan",
        "Bi-weekly check-ins",
        "Body composition analysis",
        "Supplement recommendations",
        "8% savings vs monthly"
      ]
    },
    {
      id: "competition",
      name: "Competition Prep",
      price: "$299/month",
      description: "Specialized coaching for bodybuilding competitions",
      features: [
        "Contest peak week planning",
        "Posing practice sessions",
        "Custom macro adjustments",
        "Daily check-ins",
        "Competition day guidance"
      ]
    }
  ];

  const handleAddFunds = async () => {
    if (!profile?.id) return;
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would create a Stripe Payment Intent
      // and redirect to a Stripe Checkout page
      
      // For now, we'll simulate adding funds to the account
      toast({
        title: "Processing payment",
        description: `Adding $${amountValue.toFixed(2)} to your account balance...`
      });
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Record the transaction in the database
      const { error } = await supabase
        .from('account_balance')
        .insert({
          user_id: profile.id,
          amount: amountValue,
          description: `Added ${amountValue.toFixed(2)} to account balance`,
          transaction_type: 'deposit',
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "Payment successful",
        description: `$${amountValue.toFixed(2)} has been added to your account balance`
      });
      
      // Reset form
      setAmount("50");
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment failed",
        description: error.message || "There was a problem processing your payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!profile?.id) return;
    
    setIsProcessing(true);
    setSelectedPlan(planId);
    
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) throw new Error("Invalid plan selected");
      
      // In a real implementation, this would create a Stripe Subscription
      // and redirect to a Stripe Checkout page
      
      toast({
        title: "Processing subscription",
        description: `Setting up your ${plan.name} subscription...`
      });
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Record the subscription in the database
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: profile.id,
          plan_id: planId,
          status: 'active',
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "Subscription activated",
        description: `Your ${plan.name} subscription has been successfully activated`
      });
      
      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error processing subscription:", error);
      toast({
        title: "Subscription failed",
        description: error.message || "There was a problem setting up your subscription",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  // Loading state
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Payment Options</h1>
            <p className="text-gray-400 mt-2 max-w-xl mx-auto">
              Choose between adding funds to your account or subscribing to one of our coaching plans
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="funds">Add Funds</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <Card key={plan.id} className={`bg-gray-900 border-gray-800 overflow-hidden ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="mb-4">
                        <span className="text-3xl font-bold">{plan.price}</span>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button 
                        className="w-full bg-[#9b87f5] hover:bg-[#8a76e4]"
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing && selectedPlan === plan.id ? (
                          <span className="flex items-center">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-gray-900 border border-gray-800 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center">
                    <div className="bg-[#9b87f5]/20 p-3 rounded-full mr-4">
                      <Users className="h-6 w-6 text-[#9b87f5]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Custom Coaching</h3>
                      <p className="text-gray-400 text-sm">Need a personalized solution?</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate("/contact")}
                    variant="outline"
                    className="border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5]/10"
                  >
                    Contact Us
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="funds">
              <Card className="bg-gray-900 border-gray-800 max-w-xl mx-auto">
                <CardHeader>
                  <CardTitle>Add Funds to Your Account</CardTitle>
                  <CardDescription className="text-gray-400">
                    Deposit funds to your account balance for sessions and services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise}>
                    <form className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (USD)</Label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <DollarSign className="h-5 w-5 text-gray-500" />
                          </div>
                          <Input
                            id="amount"
                            type="number"
                            min="10"
                            step="10"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-10 bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="card">Card Information</Label>
                          <span className="text-sm text-gray-400">Secure payment</span>
                        </div>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <CreditCard className="h-5 w-5 text-gray-500" />
                          </div>
                          <Input
                            id="card"
                            placeholder="Card number"
                            className="pl-10 bg-gray-800 border-gray-700"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                              <CalendarDays className="h-4 w-4 text-gray-500" />
                            </div>
                            <Input
                              placeholder="MM/YY"
                              className="pl-10 bg-gray-800 border-gray-700"
                            />
                          </div>
                          <Input
                            placeholder="CVC"
                            className="bg-gray-800 border-gray-700"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          type="button"
                          className="w-full bg-[#9b87f5] hover:bg-[#8a76e4]"
                          onClick={handleAddFunds}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <span className="flex items-center">
                              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              Add ${parseFloat(amount).toFixed(2)} to Balance
                            </span>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Elements>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t border-gray-800 pt-4">
                  <div className="flex items-center">
                    <div className="bg-[#9b87f5]/20 p-2 rounded-full mr-3">
                      <BarChart className="h-4 w-4 text-[#9b87f5]" />
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-400">Available balance:</span>{" "}
                      <span className="font-semibold">$0.00</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Funds added to your account can be used for personal training sessions, nutrition plans, and other services. These funds never expire and can be refunded upon request.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
