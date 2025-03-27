
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import SEO from '@/components/SEO';
import { CheckCircle, ChevronLeft, Home, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const sessionId = searchParams.get('session_id');
  const plan = searchParams.get('plan');
  
  useEffect(() => {
    // In a real app, you would verify the payment with Stripe
    // using the session_id and update your database accordingly
    if (sessionId) {
      // This is just for demo/placeholder - in reality you would verify with Stripe
      setPaymentDetails({
        success: true,
        amount: '$99.99',
        plan: plan || 'Subscription',
        date: new Date().toLocaleDateString()
      });
      
      // In a real implementation, you would use the Stripe API to get session details
      // For now, we'll just simulate a successful payment
      const updatePaymentStatus = async () => {
        if (isAuthenticated) {
          try {
            // Update the payment status in the database
            const { error } = await supabase.from('payment_history').update({
              status: 'completed'
            }).eq('status', 'pending').is('stripe_payment_id', null);
            
            if (error) console.error('Error updating payment status:', error);
          } catch (err) {
            console.error('Error updating payment record:', err);
          }
        }
      };
      
      updatePaymentStatus();
    }
  }, [sessionId, plan, isAuthenticated]);
  
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <SEO 
        title="Payment Successful | Surrendered Sinner Fitness"
        description="Your payment was processed successfully. Thank you for your purchase."
        canonical="https://surrenderedsinnerfitness.com/payment-success"
      />
      
      <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {paymentDetails && (
            <div className="space-y-2 border-t border-b border-zinc-800 py-4 my-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span>{paymentDetails.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Plan:</span>
                <span>{paymentDetails.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span>{paymentDetails.date}</span>
              </div>
            </div>
          )}
          
          <p className="text-center text-sm text-gray-400">
            We've sent a confirmation email with your receipt and further instructions.
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {isAuthenticated ? (
            <>
              <Button 
                className="w-full bg-sinner-red hover:bg-red-700"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/plans-catalog')}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Plans
              </Button>
            </>
          ) : (
            <Button 
              className="w-full bg-sinner-red hover:bg-red-700"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
