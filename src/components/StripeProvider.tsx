
import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';

// Initialize with a fallback, but we'll check for a valid key at runtime
let stripePromise: ReturnType<typeof loadStripe> | null = null;

interface StripeProviderProps {
  children: React.ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // Get the publishable key from environment variables
        const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
        
        // Check if we have a real key that starts with 'pk_'
        if (!stripePublishableKey || !stripePublishableKey.startsWith('pk_')) {
          console.warn("Invalid or missing Stripe publishable key. Payments won't be processed in production.");
          // In development, we'll use a placeholder key that will show Stripe elements but not process payments
          // This helps developers see the UI without needing real Stripe credentials
          const testKey = 'pk_test_51NyDWJAfsLmHAfOzbscm6EMsc2zGIp3VCz7dXJwTNAgzyjU62h13qeUWI3j8zNpIImBrzLnRkKiLIi7AuxmfaXj600UBcmzWsn';
          stripePromise = await loadStripe(testKey);
        } else {
          // Use the real key
          stripePromise = await loadStripe(stripePublishableKey);
        }
        
        setIsStripeLoaded(true);
      } catch (error: any) {
        console.error("Failed to initialize Stripe:", error);
        setStripeError(error.message || "Failed to initialize payment system");
        // Still mark as loaded so the application can render without Stripe
        setIsStripeLoaded(true);
      }
    };

    initializeStripe();
  }, []);

  // Show user-friendly error when Stripe fails to initialize
  useEffect(() => {
    if (stripeError) {
      toast({
        title: "Payment system initialization failed",
        description: "Please try refreshing the page or contact support if the issue persists.",
        variant: "destructive",
      });
    }
  }, [stripeError, toast]);

  // We render the children even if Stripe isn't loaded, so the rest of the app can work
  // Components that need Stripe will handle the absence gracefully
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
