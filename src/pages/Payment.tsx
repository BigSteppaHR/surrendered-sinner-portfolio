
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import StripeProvider from '@/components/StripeProvider';
import StripeCheckout from '@/components/StripeCheckout';
import { useToast } from '@/hooks/use-toast';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  // Get product info from URL params or use defaults
  const productName = searchParams.get('product') || 'Fitness Program';
  const amountInCents = parseInt(searchParams.get('amount') || '19900');
  const description = searchParams.get('description') || 'One-time payment for fitness services';
  const customerEmail = searchParams.get('email') || '';
  
  const handlePaymentSuccess = (paymentId: string) => {
    console.log("Payment successful:", paymentId);
    setPaymentComplete(true);
    toast({
      title: "Payment Successful",
      description: `Your payment for ${productName} has been processed. Reference: ${paymentId}`,
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <SEO 
        title="Secure Payment | Surrendered Sinner Fitness"
        description="Complete your purchase securely with Surrendered Sinner Fitness."
        canonical="https://surrenderedsinnerfitness.com/payment"
      />
      
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-b from-sinner-dark-gray to-black noise-bg py-16">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            {paymentComplete ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Complete!</h2>
                <p className="mb-6 text-gray-400">Thank you for your purchase. You will receive a confirmation email shortly.</p>
                <div className="space-x-3">
                  <a href="/dashboard" className="inline-block px-4 py-2 bg-primary text-white rounded-md">Go to Dashboard</a>
                  <a href="/" className="inline-block px-4 py-2 bg-gray-800 text-white rounded-md">Return Home</a>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-6 text-center">Secure Checkout</h1>
                
                <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Product:</span>
                    <span className="font-medium">{productName}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>${(amountInCents / 100).toFixed(2)}</span>
                  </div>
                </div>
                
                <StripeProvider>
                  <StripeCheckout 
                    amount={amountInCents} 
                    description={description}
                    customerEmail={customerEmail}
                    onSuccess={handlePaymentSuccess}
                  />
                </StripeProvider>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
