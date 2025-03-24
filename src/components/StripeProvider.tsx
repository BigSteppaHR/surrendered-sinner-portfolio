
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key
// For testing use the Stripe test key that starts with pk_test_
const stripePromise = loadStripe('pk_test_51OrKgEPQpQPQpQpQPQpQPQpQ');

interface StripeProviderProps {
  children: React.ReactNode;
}

const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
