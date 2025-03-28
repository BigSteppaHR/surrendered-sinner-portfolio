
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import Logo from '@/components/Logo';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OH3M1LflMyYK4LWP5j7QQrEXsYl1QY1A9EfyTHEBzP1V0U3XRRVcMQWobUVm1KLXBVPfk7XbX1AwBbNaDWk02yg00sGdp7hOH');

const PaymentProcess = () => {
  const [searchParams] = useSearchParams();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const secret = searchParams.get('client_secret');
    const payment = searchParams.get('payment_id');
    const amountParam = searchParams.get('amount');
    
    if (!secret || !payment) {
      toast({
        variant: "destructive",
        title: "Invalid payment request",
        description: "The payment could not be processed due to missing information."
      });
      navigate('/payment-portal');
      return;
    }
    
    setClientSecret(secret);
    setPaymentId(payment);
    setAmount(amountParam);
    setLoading(false);
  }, [searchParams, navigate]);

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
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ea384c] border-r-transparent"></div>
              </div>
            ) : clientSecret ? (
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-xl font-bold">${amount}</span>
                  </div>
                  <div className="w-full h-[1px] bg-[#333]" />
                </div>
                
                <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                  <CheckoutForm 
                    clientSecret={clientSecret} 
                    paymentId={paymentId!} 
                    amount={amount || '0'} 
                  />
                </Elements>
              </>
            ) : (
              <div className="text-center py-6 text-red-400">
                Error loading payment information. Please try again.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <footer className="border-t border-[#333] py-4 text-center text-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} Fitness Training. All payments are secure and encrypted.</p>
        </div>
      </footer>
    </div>
  );
};

interface CheckoutFormProps {
  clientSecret: string;
  paymentId: string;
  amount: string;
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
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-portal?status=success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred with your payment.');
        // Update payment status to failed
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
        // Payment succeeded, update database
        await supabase.functions.invoke('stripe-helper', {
          body: {
            action: 'updatePaymentStatus',
            params: {
              payment_id: paymentId,
              status: 'completed',
              payment_intent_id: paymentIntent.id,
              payment_method: 'card'
            }
          }
        });
        
        // Insert record into payment_history
        await supabase.from('payment_history').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          amount: parseFloat(amount),
          currency: 'USD',
          status: 'completed',
          payment_method: 'card',
          stripe_payment_id: paymentIntent.id,
          description: `Added $${amount} to account`,
          metadata: { payment_id: paymentId }
        });
        
        // Update user's balance
        const { data: balanceData } = await supabase
          .from('payment_balance')
          .select('balance, currency')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .maybeSingle();
          
        if (balanceData) {
          // Update existing balance
          await supabase
            .from('payment_balance')
            .update({ 
              balance: balanceData.balance + parseFloat(amount),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
        } else {
          // Create new balance record
          await supabase
            .from('payment_balance')
            .insert({
              user_id: (await supabase.auth.getUser()).data.user?.id,
              balance: parseFloat(amount),
              currency: 'USD'
            });
        }
        
        toast({
          title: "Payment successful",
          description: `$${amount} has been added to your account.`,
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
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" /> 
            Pay ${amount}
          </>
        )}
      </Button>
    </form>
  );
};

export default PaymentProcess;
