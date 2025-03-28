
import React, { useState, useEffect, useCallback } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Initialize with a null value, we'll assign the promise directly
let stripePromise: Promise<Stripe | null> | null = null;

// Helper for conditional logging
const isDev = import.meta.env.DEV;
const logDebug = (message: string, ...args: any[]) => {
  if (isDev) console.debug(`[Stripe] ${message}`, ...args);
};

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [connectionTested, setConnectionTested] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);

  // Fetch publishable key from our edge function
  const fetchPublishableKey = async () => {
    try {
      logDebug("Fetching Stripe publishable key...");
      
      const { data, error } = await supabase.functions.invoke('stripe-helper', {
        body: { 
          action: 'test-connection'
        }
      });
      
      if (error || !data) {
        console.error("Error fetching Stripe publishable key:", error);
        return null;
      }
      
      if (data.publishableKey) {
        logDebug("Successfully retrieved publishable key");
        return data.publishableKey;
      }
      
      console.warn("No publishable key returned from server");
      return null;
    } catch (err) {
      console.error("Failed to fetch Stripe publishable key:", err);
      return null;
    }
  };

  // Test connection to Stripe via our edge function with enhanced error handling
  const testStripeConnection = useCallback(async () => {
    try {
      setIsTesting(true);
      console.log("Testing Stripe connection via edge function...");
      
      // First test basic connection to the function with simple test-connection action
      const testResponse = await supabase.functions.invoke('stripe-helper', {
        body: { 
          action: 'test-connection'
        }
      });
      
      if (testResponse.error) {
        console.error("Basic function connection test failed:", testResponse.error);
        return false;
      }
      
      console.log("Basic function connection test result:", testResponse.data);
      
      // If we don't have a Stripe key configured in the edge function, return early
      if (testResponse.data && !testResponse.data.stripeKeyAvailable) {
        console.warn("Stripe API key not configured in edge function");
        return false;
      }
      
      // Then only if basic test passed, try the Stripe API connection test
      try {
        const { data, error } = await supabase.functions.invoke('stripe-helper', {
          body: { 
            action: 'get-dashboard-data'
          }
        });
        
        if (error) {
          console.error("Stripe API connection test failed:", error);
          return false;
        }
        
        console.log("Stripe API connection test result:", data);
        return data && data.status === 'connected';
      } catch (err) {
        console.error("Error calling stripe-helper with get-dashboard-data:", err);
        return false;
      }
    } catch (err) {
      console.error("Error testing Stripe connection:", err);
      return false;
    } finally {
      setIsTesting(false);
    }
  }, []);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        // If stripe is already initialized, don't do it again
        if (stripePromise) {
          setIsStripeLoaded(true);
          return;
        }
        
        // Get publishable key from edge function if available
        const fetchedKey = await fetchPublishableKey();
        
        if (!fetchedKey) {
          throw new Error("Could not retrieve Stripe publishable key from the server");
        }
        
        setPublishableKey(fetchedKey);
        logDebug(`Initializing Stripe with key: ${fetchedKey.substring(0, 5)}...`);
        
        // Initialize Stripe with the key
        stripePromise = loadStripe(fetchedKey, {
          apiVersion: '2023-10-16',
        });
        
        // Test connection to Stripe via our edge function
        if (!connectionTested) {
          const connected = await testStripeConnection();
          setConnectionTested(true);
          
          if (!connected) {
            console.warn("Stripe API connection test failed. Edge function might not be working correctly.");
            toast({
              title: "Stripe Connection Issue",
              description: "Could not connect to Stripe API. This won't affect your login or other features.",
              variant: "default", // Changed from destructive to not alarm users
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
  }, [toast, connectionTested, testStripeConnection]);

  // Show user-friendly error when Stripe fails to initialize but don't block the rest of the app
  useEffect(() => {
    if (stripeError) {
      toast({
        title: "Payment system issue",
        description: "Payment features may be limited. This won't affect login or other features.",
        variant: "default", // Changed from destructive to not alarm users
      });
    }
  }, [stripeError, toast]);

  // We render the children even if Stripe isn't loaded, so the rest of the app can work
  // Components that need Stripe will handle the absence gracefully
  return (
    <Elements 
      stripe={stripePromise}
      options={{
        mode: 'subscription', // Changed from 'payment' to 'subscription'
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#ea384c',
            colorBackground: '#18181b',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
          }
        },
        currency: 'usd',
        amount: 5999, // Default amount in cents (e.g., $59.99) for initial setup
        paymentMethodTypes: ['card'],
        locale: 'en'
      }}
    >
      {children}
    </Elements>
  );
};

export default StripeProvider;
