
import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StripeCheckoutProps {
  amount: number;
  description: string;
  customerEmail?: string;
  onSuccess?: (paymentId: string) => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ 
  amount, 
  description, 
  customerEmail = '',
  onSuccess
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

  // Update email state when customerEmail prop changes
  useEffect(() => {
    if (customerEmail) {
      setEmail(customerEmail);
    }
  }, [customerEmail]);

  // Create PaymentIntent on component mount or when amount changes
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (!amount || amount <= 0) return;
      
      try {
        setLoading(true);
        
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
          .single();
          
        if (dbError) throw new Error(`Database error: ${dbError.message}`);
        if (!paymentRecord) throw new Error('Could not create payment record');
        
        setPaymentId(paymentRecord.id);
        
        // Then create a payment intent via our edge function
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
        } else {
          throw new Error('No client secret received from the server');
        }
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        toast({
          title: "Payment Setup Failed",
          description: error.message || "There was an error setting up the payment. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, toast, user, description]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret || !paymentId) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

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
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      
      // Update the payment status to failed
      if (paymentId) {
        await supabase.functions.invoke('stripe-helper', {
          body: { 
            action: 'updatePaymentStatus',
            params: { 
              payment_id: paymentId,
              status: 'failed'
            }
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          className="w-full"
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
