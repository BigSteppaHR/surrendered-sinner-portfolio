
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, DollarSign, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';
import { z } from 'zod';

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

const PaymentPortal = () => {
  const [amount, setAmount] = useState<string>('50');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (status === 'success') {
      toast({
        title: "Payment successful!",
        description: "Thank you for your payment. Your account has been credited.",
        variant: "default",
      });
    } else if (status === 'error') {
      toast({
        title: "Payment failed",
        description: "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  }, [status, toast]);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("Please enter a valid amount greater than 0");
      }
      
      // Create a payment intent via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: {
          action: 'createPaymentIntent',
          params: {
            amount: amountValue,
            user_id: user?.id,
            description: `Add $${amountValue.toFixed(2)} to account`,
          }
        }
      });
      
      if (error) {
        throw new Error(error.message || "Error creating payment");
      }
      
      if (!data?.client_secret || !data?.payment_id) {
        throw new Error("Invalid response from payment service");
      }
      
      // Redirect to the payment process page
      navigate(`/payment-process?client_secret=${data.client_secret}&payment_id=${data.payment_id}&amount=${amountValue}`);
      
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      toast({
        title: "Payment Error",
        description: err.message || "There was a problem processing your request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center">
            <DollarSign className="h-8 w-8 text-[#ea384c] mr-2" />
            Add Funds to Your Account
          </h1>
          
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-zinc-900 border-[#333]">
              <CardHeader>
                <CardTitle>Add Payment</CardTitle>
                <CardDescription>
                  Enter the amount you'd like to add to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="amount"
                        type="text"
                        className="pl-8 bg-zinc-800 border-zinc-700"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="50.00"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#ea384c] hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" /> 
                        Continue to Payment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900 border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 text-[#ea384c] mr-2" />
                  Secure Payments
                </CardTitle>
                <CardDescription>
                  All transactions are secure and encrypted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-400">
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-[#ea384c] mr-2 mt-0.5 flex-shrink-0" />
                  <p>Your payment information is protected with industry-standard encryption</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-[#ea384c] mr-2 mt-0.5 flex-shrink-0" />
                  <p>We never store your complete credit card information on our servers</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-[#ea384c] mr-2 mt-0.5 flex-shrink-0" />
                  <p>Payments are processed through Stripe, a PCI-DSS Level 1 compliant payment processor</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-zinc-700 text-gray-300"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-[#333] py-4 text-center text-gray-500 text-sm mt-auto">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Surrendered Sinner Fitness. All payments are secure and encrypted.</p>
        </div>
      </footer>
    </div>
  );
};

export default PaymentPortal;
