
import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Initialize with a null value, we'll assign the promise directly
let stripePromise: Promise<Stripe | null> | null = null;

// Define the publishable key - using environment variable with fallback for development
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51NyDWJAfsLmHAfOzbscm6EMsc2zGIp3VCz7dXJwTNAgzyjU62h13qeUWI3j8zNpIImBrzLnRkKiLIi7AuxmfaXj600UBcmzWsn';

// Helper for conditional logging
const isDev = import.meta.env.DEV;
const logDebug = (message: string, ...args: any[]) => {
  if (isDev) console.debug(`[Stripe] ${message}`, ...args);
};

interface StripeProviderProps {
  children: React.ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [connectionTested, setConnectionTested] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Test connection to Stripe via our edge function with enhanced error handling
  const testStripeConnection = async () => {
    try {
      setIsTesting(true);
      console.log("Testing Stripe connection via edge function...");
      
      // First test basic connection to the function
      const testResponse = await supabase.functions.invoke('stripe-helper', {
        body: { 
          action: 'test-connection',
          params: {}
        }
      });
      
      if (testResponse.error) {
        console.error("Function connection test failed:", testResponse.error);
        return false;
      }
      
      console.log("Function connection test result:", testResponse.data);
      
      // Then test the full Stripe API connection
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: { 
          action: 'get-dashboard-data',
          params: {}
        }
      });
      
      if (error) {
        console.error("Stripe API connection test failed:", error);
        return false;
      }
      
      console.log("Stripe API connection test result:", data);
      return data && data.status === 'connected';
    } catch (err) {
      console.error("Error testing Stripe connection:", err);
      return false;
    } finally {
      setIsTesting(false);
    }
  };

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
        
        // Test connection to Stripe via our edge function
        if (!connectionTested) {
          const connected = await testStripeConnection();
          setConnectionTested(true);
          
          if (!connected) {
            console.warn("Stripe API connection test failed. Edge function might not be working correctly.");
            toast({
              title: "Stripe Connection Warning",
              description: "Could not connect to Stripe API. Payments may not work correctly.",
              variant: "destructive",
            });
          } else {
            console.log("Stripe API connection test successful!");
          }
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
  }, [toast, connectionTested]);

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
