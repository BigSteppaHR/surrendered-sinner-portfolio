
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Shield, AlertCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { useEffect as useEffectOriginal } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Use the StripeProvider's stripePromise
import StripeProvider from '@/components/StripeProvider';

const PaymentProcess = () => {
  const [searchParams] = useSearchParams();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get Stripe publishable key
  useEffect(() => {
    const getPublishableKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stripe-helper', {
          body: { action: 'get-publishable-key' }
        });
        
        if (error) throw new Error(error.message);
        if (!data || !data.publishableKey) throw new Error('No publishable key returned');
        
        setStripePromise(loadStripe(data.publishableKey));
      } catch (err: any) {
        console.error('Error fetching Stripe publishable key:', err);
        setError('Failed to initialize payment system. Please try again later.');
      }
    };
    
    getPublishableKey();
  }, []);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        
        const secret = searchParams.get('client_secret');
        const payment = searchParams.get('payment_id');
        const amountParam = searchParams.get('amount');
        
        if (!secret || !payment) {
          throw new Error("Missing required payment parameters");
        }
        
        // Parse amount as a number and ensure it's valid
        let amountValue: number | null = null;
        if (amountParam) {
          const parsedAmount = parseFloat(amountParam);
          if (isNaN(parsedAmount) || parsedAmount <= 0) {
            throw new Error("Invalid amount parameter");
          }
          amountValue = parsedAmount;
        } else {
          throw new Error("Missing amount parameter");
        }
        
        setClientSecret(secret);
        setPaymentId(payment);
        setAmount(amountValue);
      } catch (err: any) {
        console.error("Error fetching payment details:", err);
        setError(err.message || "Failed to load payment information");
        
        toast({
          variant: "destructive",
          title: "Invalid payment request",
          description: err.message || "The payment could not be processed due to missing information."
        });
        
        setTimeout(() => {
          navigate('/payment-portal');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [searchParams, navigate, toast]);

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#ea384c',
      colorBackground: '#0f0f0f',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  // Only render Elements if we have all required params
  const renderStripeElements = () => {
    if (!clientSecret || amount === null || !stripePromise) {
      return (
        <div className="text-center py-6 text-red-400">
          {!stripePromise ? "Loading payment system..." : "Error loading payment information. Please try again."}
        </div>
      );
    }

    return (
      <>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Amount:</span>
            <span className="text-xl font-bold">${amount.toFixed(2)}</span>
          </div>
          <div className="w-full h-[1px] bg-[#333]" />
        </div>
        
        <Elements 
          stripe={stripePromise}
          options={{ 
            clientSecret, 
            appearance,
            amount: Math.round(amount * 100), // Converting to cents for Stripe
            currency: 'usd',
            loader: 'auto'
          }}
        >
          <CheckoutForm 
            clientSecret={clientSecret} 
            paymentId={paymentId!} 
            amount={amount} 
          />
        </Elements>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <header className="border-b border-[#333] py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Logo size="small" />
            <span className="ml-4 text-xl font-semibold">Complete Payment</span>
          </div>
          <Button 
            variant="ghost" 
            className="flex items-center text-gray-400 hover:text-white"
            onClick={() => navigate('/payment-portal')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment Portal
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-xl">
        <Card className="bg-zinc-900 border-[#333]">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#ea384c]" />
              Secure Payment
            </CardTitle>
            <CardDescription>
              Complete your payment securely through our payment provider
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#ea384c]" />
              </div>
            ) : error ? (
              <div className="p-4 border border-red-800 bg-red-900/20 rounded-md text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-400">{error}</p>
                <p className="text-sm text-gray-400 mt-2">Redirecting back to payment portal...</p>
              </div>
            ) : (
              renderStripeElements()
            )}
          </CardContent>
        </Card>
      </main>
      
      <footer className="border-t border-[#333] py-4 text-center text-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Surrendered Sinner Fitness. All payments are secure and encrypted.</p>
        </div>
      </footer>
    </div>
  );
};

interface CheckoutFormProps {
  clientSecret: string;
  paymentId: string;
  amount: number;
}

const CheckoutForm = ({ clientSecret, paymentId, amount }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-portal?status=success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred with your payment.');
        await supabase.functions.invoke('stripe-helper', {
          body: {
            action: 'updatePaymentStatus',
            params: {
              payment_id: paymentId,
              status: 'failed',
              payment_intent_id: error.payment_intent?.id
            }
          }
        });
        
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: error.message || 'There was a problem with your payment.'
        });
        
        navigate('/payment-portal?status=error');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        const amountInCents = Math.round(amount * 100);
        
        await supabase.functions.invoke('stripe-helper', {
          body: {
            action: 'updatePaymentStatus',
            params: {
              payment_id: paymentId,
              status: 'completed',
              payment_intent_id: paymentIntent.id,
              payment_method: 'card',
              amount: amountInCents,
              description: `Added $${amount.toFixed(2)} to account`
            }
          }
        });
        
        toast({
          title: "Payment successful",
          description: `$${amount.toFixed(2)} has been added to your account.`,
          variant: "default"
        });
        
        navigate('/payment-portal?status=success');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement className="mb-6" />
      
      {errorMessage && (
        <div className="p-3 mb-4 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="bg-[#333]/20 p-3 rounded-md mb-6">
        <div className="flex items-start">
          <Shield className="h-4 w-4 text-[#ea384c] mr-2 mt-0.5" />
          <p className="text-xs text-gray-400">
            Your payment information is encrypted and securely processed. We do not store your card details.
          </p>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-[#ea384c] hover:bg-red-700"
        disabled={!stripe || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" /> 
            Pay ${amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
};

export default PaymentProcess;
