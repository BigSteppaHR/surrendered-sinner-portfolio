
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle, CreditCard, DollarSign, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import StripeCheckout from '@/components/StripeCheckout';

interface PurchaseProps {
  onSuccess?: () => void;
  defaultTab?: 'subscription' | 'one-time' | 'add-funds';
}

const PaymentGateway: React.FC<PurchaseProps> = ({ 
  onSuccess,
  defaultTab = 'subscription'
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('50');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscriptionPlans = [
    {
      id: "monthly",
      name: "Monthly Coaching",
      price: "$549/month",
      amount: 54900,
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
      price: "$1399/quarter",
      amount: 139900,
      description: "Save 15% with our quarterly coaching package",
      features: [
        "Everything in Monthly plan",
        "Bi-weekly check-ins",
        "Body composition analysis",
        "Supplement recommendations",
        "15% savings vs monthly"
      ]
    },
    {
      id: "competition",
      name: "Competition Prep",
      price: "$899/month",
      amount: 89900,
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

  const oneTimePackages = [
    {
      id: "single-session",
      name: "Single Training Session",
      price: "$199",
      amount: 19900,
      description: "One-on-one personal training session"
    },
    {
      id: "nutrition-plan",
      name: "Custom Nutrition Plan",
      price: "$349",
      amount: 34900,
      description: "Personalized nutrition plan tailored to your goals"
    },
    {
      id: "assessment",
      name: "Fitness Assessment",
      price: "$149",
      amount: 14900,
      description: "Comprehensive fitness and body composition assessment"
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      setError("You must be logged in to subscribe");
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe to a plan",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setSelectedPlan(planId);
    setError(null);
    
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) throw new Error("Invalid plan selected");
      
      // Record intent in database
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: plan.amount,
          metadata: { 
            plan_id: plan.id,
            plan_name: plan.name,
            payment_type: 'subscription' 
          },
          status: 'pending'
        })
        .select()
        .single();
        
      if (paymentError) throw new Error(`Database error: ${paymentError.message}`);
      
      // In real implementation, redirect to Stripe checkout
      // For now, simulate successful payment
      toast({
        title: "Processing subscription",
        description: `Setting up your ${plan.name} subscription...`
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create subscription record
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setDate(periodEnd.getDate() + 30); // Set to 30 days from now
      
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          metadata: { 
            plan_name: plan.name,
            payment_id: paymentRecord.id
          }
        });
        
      if (subscriptionError) throw new Error(`Subscription error: ${subscriptionError.message}`);
      
      // Update payment status to completed
      await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', paymentRecord.id);
      
      setPaymentSuccess(true);
      toast({
        title: "Subscription activated",
        description: `Your ${plan.name} subscription has been successfully activated`
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error processing subscription:", error);
      setError(error.message || "Failed to process subscription");
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

  const handleOneTimePurchase = async (packageId: string) => {
    if (!user) {
      setError("You must be logged in to make a purchase");
      toast({
        title: "Authentication required",
        description: "Please log in to make a purchase",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setSelectedPlan(packageId);
    setError(null);
    
    try {
      const pkg = oneTimePackages.find(p => p.id === packageId);
      if (!pkg) throw new Error("Invalid package selected");
      
      // Record intent in database
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: pkg.amount,
          metadata: { 
            package_id: pkg.id,
            package_name: pkg.name,
            payment_type: 'one-time' 
          },
          status: 'pending'
        })
        .select()
        .single();
        
      if (paymentError) throw new Error(`Database error: ${paymentError.message}`);
      
      toast({
        title: "Processing payment",
        description: `Processing your purchase for ${pkg.name}...`
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Record purchase in payment_history
      const { error: historyError } = await supabase
        .from('payment_history')
        .insert({
          user_id: user.id,
          amount: pkg.amount,
          description: pkg.name,
          payment_method: 'card',
          status: 'completed',
          metadata: { 
            package_id: pkg.id,
            payment_id: paymentRecord.id
          }
        });
        
      if (historyError) throw new Error(`History error: ${historyError.message}`);
      
      // Update payment status to completed
      await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', paymentRecord.id);
      
      setPaymentSuccess(true);
      toast({
        title: "Payment successful",
        description: `Your purchase of ${pkg.name} has been completed`
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error processing purchase:", error);
      setError(error.message || "Failed to process purchase");
      toast({
        title: "Payment failed",
        description: error.message || "There was a problem processing your payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const handleAddFunds = async () => {
    if (!user) {
      setError("You must be logged in to add funds");
      toast({
        title: "Authentication required",
        description: "Please log in to add funds",
        variant: "destructive"
      });
      return;
    }
    
    const amount = parseInt(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to add to your account",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Convert to cents for Stripe
      const amountInCents = amount * 100;
      
      // Record intent in database
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount: amountInCents,
          metadata: { 
            payment_type: 'add_funds',
            amount_display: `$${amount}.00`
          },
          status: 'pending'
        })
        .select()
        .single();
        
      if (paymentError) throw new Error(`Database error: ${paymentError.message}`);
      
      toast({
        title: "Processing payment",
        description: `Adding $${amount}.00 to your account...`
      });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to account balance
      const { error: balanceError } = await supabase
        .from('account_balance')
        .insert({
          user_id: user.id,
          amount: amount,
          transaction_type: 'credit',
          description: 'Funds added to account'
        });
        
      if (balanceError) throw new Error(`Balance update error: ${balanceError.message}`);
      
      // Record in payment history
      const { error: historyError } = await supabase
        .from('payment_history')
        .insert({
          user_id: user.id,
          amount: amountInCents,
          description: 'Added funds to account',
          payment_method: 'card',
          status: 'completed',
          metadata: { 
            payment_id: paymentRecord.id
          }
        });
        
      if (historyError) throw new Error(`History error: ${historyError.message}`);
      
      // Update payment status to completed
      await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', paymentRecord.id);
      
      setPaymentSuccess(true);
      toast({
        title: "Funds added",
        description: `$${amount}.00 has been added to your account`
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error adding funds:", error);
      setError(error.message || "Failed to add funds");
      toast({
        title: "Payment failed",
        description: error.message || "There was a problem processing your payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetState = () => {
    setPaymentSuccess(false);
    setError(null);
  };

  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
        <p className="text-gray-400 mb-6">Your transaction has been completed successfully.</p>
        <div className="flex space-x-4">
          <Button onClick={resetState} className="bg-sinner-red hover:bg-red-700">
            Make Another Payment
          </Button>
          <Button variant="outline" onClick={onSuccess}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-950 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="subscription" className="text-white bg-[#333] hover:bg-[#444]">
            Subscription
          </TabsTrigger>
          <TabsTrigger value="one-time" className="text-white bg-[#333] hover:bg-[#444]">
            One-time Purchase
          </TabsTrigger>
          <TabsTrigger value="add-funds" className="text-white bg-[#333] hover:bg-[#444]">
            Add Funds
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className="bg-[#111111] border-[#333333] overflow-hidden">
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
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full bg-[#ea384c] hover:bg-[#d32d3f]"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <span className="flex items-center">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                        Processing...
                      </span>
                    ) : "Subscribe Now"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="one-time" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {oneTimePackages.map((pkg) => (
              <Card key={pkg.id} className="bg-[#111111] border-[#333333] overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{pkg.price}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full bg-[#ea384c] hover:bg-[#d32d3f]"
                    onClick={() => handleOneTimePurchase(pkg.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing && selectedPlan === pkg.id ? (
                      <span className="flex items-center">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                        Processing...
                      </span>
                    ) : "Purchase Now"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="add-funds" className="space-y-4">
          <Card className="bg-[#111111] border-[#333333]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 text-[#ea384c] mr-2" />
                Add Funds to Your Account
              </CardTitle>
              <CardDescription>
                Add funds to your account balance to use for future purchases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Add</Label>
                <div className="flex items-center">
                  <span className="bg-[#222] text-white p-2 rounded-l-md border border-[#444] border-r-0">$</span>
                  <Input
                    id="amount"
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="50"
                    min="10"
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="save-card">Save payment method</Label>
                  <Switch id="save-card" />
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  className="w-full bg-[#ea384c] hover:bg-[#d32d3f] flex items-center justify-center"
                  disabled={isProcessing}
                  onClick={handleAddFunds}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Funds
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentGateway;
