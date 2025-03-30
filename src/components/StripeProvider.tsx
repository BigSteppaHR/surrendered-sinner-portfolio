
import { ReactNode, createContext, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { supabase } from '@/integrations/supabase/client';

interface StripeContextType {
  // Stripe context properties if needed
}

export const StripeContext = createContext<StripeContextType | null>(null);

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface StripeProviderProps {
  children: ReactNode;
}

const StripeProvider = ({ children }: StripeProviderProps) => {
  useEffect(() => {
    const testStripeConnection = async () => {
      try {
        console.log("Testing Stripe connection via edge function...");
        const { data, error } = await supabase.functions.invoke('stripe-helper', {
          body: { action: 'test-connection' }
        });

        if (error) {
          console.error("Basic function connection test failed:", error);
          console.warn("Stripe API connection test failed. Edge function might not be working correctly.");
        } else {
          console.log("Stripe connection test successful:", data);
        }
      } catch (err) {
        console.error("Error testing Stripe connection:", err);
      }
    };

    // Run the test
    testStripeConnection();
  }, []);

  return (
    <StripeContext.Provider value={{}}>
      <Elements stripe={stripePromise}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
};

export default StripeProvider;
