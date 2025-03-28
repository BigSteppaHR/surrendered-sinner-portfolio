import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, CreditCard, CalendarDays, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddFundsFormProps {
  onError?: (error: string) => void;
}

const AddFundsForm: React.FC<AddFundsFormProps> = ({ onError }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("50");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeAvailable, setStripeAvailable] = useState(true);

  useEffect(() => {
    const checkStripeConnection = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stripe-helper', {
          body: { action: 'test-connection' }
        });
        
        if (error || !data?.stripeKeyAvailable) {
          console.warn("Stripe connection not available:", error || "No API key found");
          setStripeAvailable(false);
          if (onError) onError("Payment system not available - please try again later");
        } else {
          console.log("Stripe connection available");
          setStripeAvailable(true);
        }
      } catch (err) {
        console.error("Error checking Stripe availability:", err);
        setStripeAvailable(false);
        if (onError) onError("Error connecting to payment system");
      }
    };
    
    checkStripeConnection();
  }, [onError]);

  const handleAddFunds = async () => {
    if (!profile?.id) {
      const errorMsg = "Authentication error: Please log in to add funds";
      toast({
        title: "Authentication error",
        description: "Please log in to add funds",
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
      return;
    }
    
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
      const { data: paymentRecord, error: dbError } = await supabase
        .from('payments')
        .insert({
          user_id: profile.id,
          amount: amountValue * 100, // Convert to cents for Stripe
          currency: 'usd',
          status: 'pending',
          metadata: { description: `Adding ${amountValue.toFixed(2)} to account balance` }
        })
        .select()
        .single();
        
      if (dbError) throw new Error(`Database error: ${dbError.message}`);
      
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: { 
          action: 'createPaymentIntent',
          params: { 
            amount: amountValue * 100, // Convert to cents
            currency: 'usd',
            payment_id: paymentRecord.id,
            description: `Adding ${amountValue.toFixed(2)} to account balance`
          }
        }
      });
      
      if (error) {
        throw new Error(`Payment initialization failed: ${error.message}`);
      }
      
      toast({
        title: "Processing payment",
        description: `Adding $${amountValue.toFixed(2)} to your account balance...`
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Payment initiated",
        description: `Your payment for $${amountValue.toFixed(2)} has been initiated. You will be redirected to complete the payment.`
      });
      
      setAmount("50");
    } catch (error: any) {
      console.error("Error processing payment:", error);
      const errorMsg = error.message || "There was a problem processing your payment";
      toast({
        title: "Payment failed",
        description: errorMsg,
        variant: "destructive"
      });
      if (onError) onError(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="bg-[#111111] border-[#333333] max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Add Funds to Your Account</CardTitle>
        <CardDescription className="text-gray-400">
          Deposit funds to your account balance for sessions and services
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!stripeAvailable && (
          <Alert variant="destructive" className="mb-6 bg-red-950 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment system is currently unavailable. Please try again later.
            </AlertDescription>
          </Alert>
        )}
        
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
                className="pl-10 bg-[#0a0a0a] border-[#333333]"
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
                className="pl-10 bg-[#0a0a0a] border-[#333333]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  placeholder="MM/YY"
                  className="pl-10 bg-[#0a0a0a] border-[#333333]"
                />
              </div>
              <Input
                placeholder="CVC"
                className="bg-[#0a0a0a] border-[#333333]"
              />
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              type="button"
              className="w-full bg-[#ea384c] hover:bg-[#d32d3f]"
              onClick={handleAddFunds}
              disabled={isProcessing || !stripeAvailable}
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
      </CardContent>
    </Card>
  );
};

export default AddFundsForm;
