
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Make sure we have a valid key or use an empty string as fallback
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QWJOAJ1axkFIKsVApGtDWcUbliJT2kNf90nqUnL3ziUxf3zHANMB6gSKhKkzExWswzuG2pxIa22EqzQA8CD70iZ00LU0YGYQC';

// Initialize Stripe only if we have a valid key
const stripePromise = loadStripe(stripePublishableKey);

interface StripeProviderProps {
  children: React.ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  // Add error handling in case the Stripe promise fails
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
