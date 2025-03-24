
import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';

// Initialize with a null value, we'll assign the promise directly
let stripePromise: Promise<Stripe | null> | null = null;

// Define the publishable key - using environment variable with fallback for development
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51NyDWJAfsLmHAfOzbscm6EMsc2zGIp3VCz7dXJwTNAgzyjU62h13qeUWI3j8zNpIImBrzLnRkKiLIi7AuxmfaXj600UBcmzWsn';

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
        // If stripe is already initialized, don't do it again
        if (stripePromise) {
          setIsStripeLoaded(true);
          return;
        }
        
        // Use the defined key
        if (!STRIPE_PUBLISHABLE_KEY || !STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
          console.warn("Using test Stripe publishable key. Payments will only work in test mode.");
        }
        
        // Initialize Stripe with the key
        stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
        
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
