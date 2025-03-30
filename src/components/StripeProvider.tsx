import React, { useState, useEffect, useCallback } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Initialize with a null value
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
  const [isRetrying, setIsRetrying] = useState(false);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);

  // Get Stripe publishable key from edge function
  const getStripePublishableKey = useCallback(async () => {
    try {
      console.log("Fetching Stripe publishable key...");
      
      const response = await supabase.functions.invoke('stripe-helper', {
        body: { 
          action: 'get-publishable-key'
        }
      });
      
      if (response.error) {
        console.error("Failed to fetch Stripe publishable key:", response.error);
        return null;
      }
      
      if (!response.data || !response.data.publishableKey) {
        console.error("No publishable key returned from edge function");
        return null;
      }
      
      console.log("Successfully fetched Stripe publishable key");
      return response.data.publishableKey;
    } catch (err) {
      console.error("Error fetching Stripe publishable key:", err);
      return null;
    }
  }, []);

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
      
      return true;
    } catch (err: any) {
      console.error("Error testing Stripe connection:", err);
      return false;
    } finally {
      setIsTesting(false);
    }
  }, []);

  // Retry loading Stripe integration
  const retryStripeInitialization = async () => {
    setIsRetrying(true);
    setStripeError(null);
    
    try {
      // Reinitialize Stripe with a fresh key
      const key = await getStripePublishableKey();
      
      if (!key) {
        throw new Error("Could not retrieve Stripe publishable key");
      }
      
      setPublishableKey(key);
      
      // Reset Stripe promise
      stripePromise = null;
      stripePromise = loadStripe(key.trim(), {
        apiVersion: '2023-10-16',
      });
      
      // Test connection
      const connected = await testStripeConnection();
      
      if (connected) {
        setConnectionTested(true);
        toast({
          title: "Stripe Connection Restored",
          description: "Successfully reconnected to payment processing system.",
        });
      } else {
        throw new Error("Could not restore Stripe connection");
      }
    } catch (error: any) {
      console.error("Failed to reinitialize Stripe:", error);
      setStripeError(error.message || "Failed to reconnect to payment system");
      toast({
        title: "Reconnection Failed",
        description: "Could not reconnect to payment system. This won't affect your login or other features.",
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
      setIsStripeLoaded(true); // Still mark as loaded so the application can render
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
        
        // Get the publishable key from the edge function
        const key = await getStripePublishableKey();
        
        if (!key) {
          throw new Error("Could not retrieve Stripe publishable key");
        }
        
        setPublishableKey(key);
        
        // Initialize Stripe with the key from edge function
        stripePromise = loadStripe(key.trim(), {
          apiVersion: '2023-10-16',
        });
        
        // Test connection to Stripe via our edge function
        if (!connectionTested) {
          const connected = await testStripeConnection();
          setConnectionTested(true);
          
          if (!connected) {
            console.warn("Stripe API connection test failed. Edge function might not be working correctly.");
            toast({
              title: "Payment System Notice",
              description: "Connection to payment system limited. Basic features will still work normally.",
              variant: "default",
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
  }, [toast, connectionTested, testStripeConnection, getStripePublishableKey]);

  // Show user-friendly error when Stripe fails to initialize but don't block the rest of the app
  useEffect(() => {
    if (stripeError) {
      toast({
        title: "Payment system issue",
        description: "Payment features may be limited. This won't affect login or other features.",
        variant: "default",
      });
    }
  }, [stripeError, toast]);

  if (!isStripeLoaded) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea384c]"></div>
      </div>
    );
  }

  // Render children without Stripe if there's an error
  if (stripeError) {
    return (
      <div className="stripe-provider-error">
        {children}
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise}
      options={{
        mode: 'payment',
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
        loader: 'auto', // Use 'auto' to be more flexible
        fonts: [
          {
            cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
          }
        ]
      }}
    >
      {children}
    </Elements>
  );
};

export default StripeProvider;
