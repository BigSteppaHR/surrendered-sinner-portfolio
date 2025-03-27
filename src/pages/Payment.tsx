
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { DollarSign, CreditCard, ArrowLeft, ShoppingCart, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [returnUrl, setReturnUrl] = useState('');
  
  // Parse URL params for payment details
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const amountParam = params.get('amount');
    const descParam = params.get('description');
    const emailParam = params.get('email');
    const productParam = params.get('product');
    
    if (amountParam) {
      // Convert cents to dollars for display
      const amountInDollars = (parseInt(amountParam) / 100).toFixed(2);
      setAmount(amountInDollars);
    }
    
    if (descParam) {
      setDescription(descParam);
    }
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    if (productParam) {
      setProduct(productParam);
    }
    
    // Check if there's payment intent data in location state
    const state = location.state as any;
    if (state?.clientSecret) {
      setClientSecret(state.clientSecret);
    }
    
    if (state?.returnUrl) {
      setReturnUrl(state.returnUrl);
    }
  }, [location]);
  
  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Call Stripe helper function to create payment intent
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: {
          action: 'createPaymentIntent',
          params: {
            amount: Math.round(parseFloat(amount) * 100), // Convert to cents
            currency: 'usd',
            description: description || 'Payment to Surrendered Sinner Fitness',
            metadata: {
              product: product || 'Custom Payment',
              email: email || ''
            }
          }
        }
      });
      
      if (error) throw error;
      
      if (!data || !data.client_secret) {
        throw new Error('Failed to create payment. Please try again.');
      }
      
      // Redirect to Stripe checkout (or handle in-app payment)
      console.log('Payment intent created:', data);
      toast({
        title: 'Payment Processing',
        description: 'Redirecting to secure payment page...'
      });
      
      // For this example, we'll just simulate a successful payment
      // In a real implementation, you would redirect to Stripe
      setTimeout(() => {
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully!'
        });
        
        // Navigate to success page or dashboard
        navigate(returnUrl || '/dashboard');
      }, 2000);
      
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred while processing your payment');
      toast({
        title: 'Payment Failed',
        description: err.message || 'Failed to process payment',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Payment | Surrendered Sinner Fitness"
        description="Secure payment processing for Surrendered Sinner Fitness"
      />
      
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="bg-[#222] border-[#333]">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <DollarSign className="h-6 w-6 text-sinner-red mr-2" />
                  Payment
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={handleCancel}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
              <CardDescription>
                Complete your secure payment
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#333]">
                <h3 className="font-medium mb-1">Order Summary</h3>
                <p className="text-sm text-gray-400 mb-3">{description || 'Custom Payment'}</p>
                
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>${amount}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email (for receipt)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-[#1a1a1a] border-[#333]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="card-element">Card Details</Label>
                  <div 
                    id="card-element" 
                    className="bg-[#1a1a1a] border border-[#333] rounded-md p-4 min-h-[60px] flex items-center justify-center"
                  >
                    <div className="flex items-center text-gray-400">
                      <CreditCard className="h-4 w-4 mr-2" />
                      <span className="text-sm">Secure card payment</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Your payment is processed securely via Stripe. We don't store your card details.
                  </p>
                </div>
              </div>
            </CardContent>
            
            <Separator className="bg-[#333] my-2" />
            
            <CardFooter className="pt-4">
              <Button 
                className="w-full bg-sinner-red hover:bg-red-700"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Pay ${amount}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>By making this payment, you agree to our Terms of Service and Privacy Policy.</p>
            <div className="flex items-center justify-center mt-2 space-x-2">
              <span>Secured by</span>
              <span className="font-semibold">Stripe</span>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
