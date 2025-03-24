
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Use the publishable key you provided
const stripePromise = loadStripe('pk_test_51QWJOAJ1axkFIKsVApGtDWcUbliJT2kNf90nqUnL3ziUxf3zHANMB6gSKhKkzExWswzuG2pxIa22EqzQA8CD70iZ00LU0YGYQC');

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
