
import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Initialize with a null value and only load once
let stripePromise: Promise<any> | null = null;

interface StripeElementsWrapperProps {
  clientSecret: string;
  children: React.ReactNode;
  appearance?: {
    theme: 'stripe' | 'night' | 'flat' | 'none';
    variables?: Record<string, string>;
    rules?: Record<string, Record<string, string>>;
  };
}

const StripeElementsWrapper = ({ 
  clientSecret, 
  children,
  appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#ea384c',
      colorBackground: '#18181b',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
    }
  }
}: StripeElementsWrapperProps) => {
  const [isLoading, setIsLoading] = useState(!stripePromise);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (stripePromise) {
      // Stripe is already initialized
      return;
    }

    const initializeStripe = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('stripe-helper', {
          body: { action: 'get-publishable-key' }
        });
        
        if (error) throw new Error(error.message);
        if (!data || !data.publishableKey) throw new Error('No publishable key returned');
        
        // Initialize Stripe only once
        stripePromise = loadStripe(data.publishableKey);
        
      } catch (err: any) {
        console.error('Error initializing Stripe:', err);
        setError(err.message || 'Failed to initialize payment system');
        toast({
          title: "Payment System Error",
          description: "Could not initialize the payment system. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeStripe();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-[#ea384c]" />
      </div>
    );
  }

  if (error || !stripePromise) {
    return (
      <div className="p-4 border border-red-800 bg-red-900/20 rounded-md text-center">
        <p className="text-red-400">{error || "Failed to initialize payment system"}</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance
      }}
    >
      {children}
    </Elements>
  );
};

export default StripeElementsWrapper;
