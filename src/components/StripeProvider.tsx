
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Stripe test publishable key - Replace with your own test key from Stripe dashboard
// This is a test key which can be safely included in client-side code
const stripePromise = loadStripe('pk_test_51O2bITLVZQyYURfkIsO3S9QROfBOrlVzYxWxFXGnIBvYfkmLBLGQKlDPlIcSVjJZYJSzEm8EgM8m1bdN6oE2qW8900vXAVbx74');

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
