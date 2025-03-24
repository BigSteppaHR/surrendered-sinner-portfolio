
import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(customerEmail);

  // Update email state when customerEmail prop changes
  useEffect(() => {
    if (customerEmail) {
      setEmail(customerEmail);
    }
  }, [customerEmail]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setLoading(true);

    try {
      // Create a payment intent using our Supabase edge function
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: { 
          action: 'createPaymentIntent',
          params: { 
            amount: amount,
            currency: 'usd'
          }
        }
      });

      if (error) {
        throw new Error(`Payment initialization failed: ${error.message}`);
      }

      // For a real implementation, use the client secret to confirm payment
      // const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
      //   data.client_secret,
      //   {
      //     payment_method: {
      //       card: cardElement,
      //       billing_details: { name, email }
      //     }
      //   }
      // );

      // For this demo, we'll simulate a successful payment
      toast({
        title: "Test Payment Processed",
        description: "This is a demo payment and no actual charge was made.",
      });
      
      if (onSuccess) {
        onSuccess(`test-payment-${Date.now()}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
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
          disabled={!stripe || loading} 
          className="w-full"
        >
          {loading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
        </Button>
      </div>
      
      <p className="text-xs text-gray-400 text-center">
        {description}<br />
        <span className="block mt-1">This is a test payment. No actual charge will be made.</span>
      </p>
    </form>
  );
};

export default StripeCheckout;
