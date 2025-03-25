
import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface StripeCheckoutProps {
  amount: number;
  description: string;
  customerEmail?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ 
  amount, 
  description, 
  customerEmail = '',
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(customerEmail);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Update email state when customerEmail prop changes
  useEffect(() => {
    if (customerEmail) {
      setEmail(customerEmail);
    }
  }, [customerEmail]);

  // Create PaymentIntent on component mount or when amount changes
  useEffect(() => {
    if (!amount || amount <= 0) return;
    
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First create a record in our database
        const { data: paymentRecord, error: dbError } = await supabase
          .from('payments')
          .insert({
            user_id: user?.id || null,
            amount: amount,
            currency: 'usd',
            status: 'pending',
            metadata: { description }
          })
          .select()
          .maybeSingle();
          
        if (dbError) throw new Error(`Database error: ${dbError.message}`);
        if (!paymentRecord) throw new Error('Could not create payment record');
        
        setPaymentId(paymentRecord.id);
        
        // Then create a payment intent via our edge function
        try {
          const { data, error } = await supabase.functions.invoke('stripe-helper', {
            body: { 
              action: 'createPaymentIntent',
              params: { 
                amount: amount,
                currency: 'usd',
                payment_id: paymentRecord.id,
                description: description
              }
            }
          });

          if (error) {
            throw new Error(`Payment initialization failed: ${error.message}`);
          }

          if (data?.client_secret) {
            setClientSecret(data.client_secret);
            setRetryCount(0); // Reset retry count on success
          } else {
            throw new Error('No client secret received from the server');
          }
        } catch (stripeError) {
          console.error('Stripe API error:', stripeError);
          
          // Update the payment record to indicate the error
          await supabase
            .from('payments')
            .update({ 
              status: 'failed',
              metadata: { 
                ...paymentRecord.metadata,
                error: stripeError.message
              }
            })
            .eq('id', paymentRecord.id);
          
          // If we haven't reached max retries, try again
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1);
            throw new Error(`Stripe API error (attempt ${retryCount + 1}/${maxRetries}): ${stripeError.message}`);
          } else {
            throw new Error(`Stripe API error: ${stripeError.message}`);
          }
        }
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        setError(error.message || "Payment setup failed");
        
        toast({
          title: "Payment Setup Failed",
          description: error.message || "There was an error setting up the payment. Please try again.",
          variant: "destructive",
        });
        
        if (onError) {
          onError(error.message || "Payment setup failed");
        }
      } finally {
        setLoading(false);
      }
    };

    // If we're retrying or this is the first attempt
    if (amount > 0 && (retryCount === 0 || retryCount <= maxRetries)) {
      createPaymentIntent();
    }
  }, [amount, toast, user, description, retryCount]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!stripe || !elements || !clientSecret || !paymentId) {
      setError("Payment system is not fully loaded. Please refresh the page and try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card element not found. Please refresh the page and try again.");
      return;
    }

    setLoading(true);

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: { name, email }
          }
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Update payment status in our database
        try {
          const { error: updateError } = await supabase.functions.invoke('stripe-helper', {
            body: { 
              action: 'updatePaymentStatus',
              params: { 
                payment_id: paymentId,
                status: paymentIntent.status,
                payment_intent_id: paymentIntent.id,
                payment_method: 'card'
              }
            }
          });

          if (updateError) throw new Error(`Failed to update payment: ${updateError.message}`);
        } catch (error) {
          console.error('Error updating payment status:', error);
          // Continue anyway since the payment succeeded, just log the error
        }

        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        
        if (onSuccess) {
          onSuccess(paymentId);
        }
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || "Payment failed");
      
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      
      // Update the payment status to failed
      if (paymentId) {
        try {
          await supabase.functions.invoke('stripe-helper', {
            body: { 
              action: 'updatePaymentStatus',
              params: { 
                payment_id: paymentId,
                status: 'failed'
              }
            }
          });
        } catch (updateError) {
          console.error('Error updating payment status to failed:', updateError);
        }
      }
      
      if (onError) {
        onError(error.message || "Payment failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-950 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="card-element">Credit Card</Label>
        <div className="p-3 border rounded-md bg-background">
          <CardElement 
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#fff',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#ef4444',
                  iconColor: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>
      
      <div className="pt-2">
        <Button 
          type="submit" 
          disabled={!stripe || !clientSecret || loading} 
          className="w-full bg-[#ea384c] hover:bg-[#c42e3e]"
        >
          {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
        </Button>
      </div>
      
      <p className="text-xs text-gray-400 text-center">
        {description}<br />
        <span className="block mt-1">Secure payment powered by Stripe</span>
      </p>
    </form>
  );
};

export default StripeCheckout;
